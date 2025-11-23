import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class AppStack extends Stack {
	readonly cityDocumentsBucket: s3.Bucket;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// Get environment and sandbox from context
		const env = this.node.tryGetContext('env') || 'dev';
		const sandbox = this.node.tryGetContext('sandbox') || '';
		const sandboxSuffix = sandbox ? `-${sandbox}` : '';
		const resourcePrefix = `city-documents${sandboxSuffix}`;

		this.cityDocumentsBucket = new s3.Bucket(this, 'CityDocumentsBucket', {
			bucketName: `${resourcePrefix}-city-document-bucket`,
			removalPolicy: env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
			autoDeleteObjects: env !== 'prod',
			versioned: true,
			encryption: s3.BucketEncryption.S3_MANAGED,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			cors: [
				{
					allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
					allowedOrigins: ['*'],
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

		Tags.of(this).add('Environment', env);
		if (sandbox) {
			Tags.of(this).add('Sandbox', sandbox);
		}

		new CfnOutput(this, 'CityDocumentsBucket', {
			value: this.cityDocumentsBucket.bucketName,
			exportName: `${resourcePrefix}-CityDocuments`,
			description: 'S3 bucket to hold city documents accessible to citizens'
		});

		new CfnOutput(this, 'CityDocumentsBucketArn', {
			value: this.cityDocumentsBucket.bucketArn,
			exportName: `${resourcePrefix}-CityDocumentsBucketArn`,
			description: 'S3 bucket ARN for citizens to access city documents'
		});
	}
}
