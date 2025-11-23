import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class StorageStack extends Stack {
  public readonly photoBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

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
          allowedOrigins: ['*'], // Will be restricted in production
          allowedHeaders: ['*'],
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
  }
}
