import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface StorageStackProps extends StackProps {
  /**
   * Optional custom domain for CORS configuration.
   * If not provided, will attempt to import from framework networking stack.
   */
  customDomain?: string;
}

export class StorageStack extends Stack {
  public readonly photoBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: StorageStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const localMode = this.node.tryGetContext('localMode') || false;
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const sandboxDomainPrefix = sandbox ? `.${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // Build allowed origins based on environment
    const allowedOrigins = this.buildAllowedOrigins(env, localMode, sandboxDomainPrefix, props?.customDomain);

    // S3 Bucket for storing citizen photos of issues
    this.photoBucket = new s3.Bucket(this, 'CitizenPhotosBucket', {
      bucketName: `${resourcePrefix}-photos-${this.account}-${this.region}`,
      removalPolicy: env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: env !== 'prod',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins,
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(90),
            },
          ],
        },
        {
          id: 'ExpireOldVersions',
          enabled: true,
          noncurrentVersionExpiration: Duration.days(365),
        },
      ],
    });

    // Add folder structure via bucket policy documentation
    // Photos will be organized as: /{reportId}/{timestamp}-{filename}

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'PhotoBucketName', {
      value: this.photoBucket.bucketName,
      exportName: `${resourcePrefix}-PhotoBucketName`,
      description: 'S3 bucket name for citizen photos',
    });

    new CfnOutput(this, 'PhotoBucketArn', {
      value: this.photoBucket.bucketArn,
      exportName: `${resourcePrefix}-PhotoBucketArn`,
      description: 'S3 bucket ARN for citizen photos',
    });

    new CfnOutput(this, 'AllowedOrigins', {
      value: allowedOrigins.join(','),
      description: 'CORS allowed origins for the photo bucket',
    });
  }

  /**
   * Build allowed origins for CORS based on environment.
   * Only allows requests from authenticated application domains.
   */
  private buildAllowedOrigins(
    env: string,
    localMode: boolean,
    sandboxDomainPrefix: string,
    customDomain?: string
  ): string[] {
    // Local development always allows localhost
    if (localMode) {
      return [
        'http://localhost:4200',
        'http://localhost:3000',
        'http://127.0.0.1:4200',
      ];
    }

    // Base domains for the application
    const origins: string[] = [];

    // Add custom domain if provided
    if (customDomain) {
      origins.push(`https://www${sandboxDomainPrefix}.${customDomain}`);
      origins.push(`https://${customDomain}`);
    }

    // In dev environment, also allow localhost for development
    if (env === 'dev') {
      origins.push('http://localhost:4200');
      origins.push('http://localhost:3000');
    }

    // If no origins configured, use a placeholder that will need to be updated
    // This prevents accidentally allowing all origins
    if (origins.length === 0) {
      // Log warning during synthesis
      console.warn('WARNING: No CORS origins configured. Using restrictive default.');
      return ['https://wellsville.example.com'];
    }

    return origins;
  }
}
