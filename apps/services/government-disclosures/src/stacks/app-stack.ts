import {
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
  Tags,
} from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AppStack extends Stack {
  readonly disclosuresBucket: s3.Bucket;
  readonly disclosuresTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `gov-disclosures${sandboxSuffix}`;

    // Import Cognito User Pool for admin authentication
    const userPoolId = Fn.importValue(
      `portal${sandboxSuffix}-CityAdminUserPoolId`
    );
    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      'CityAdminUserPool',
      userPoolId
    );

    // S3 Bucket for disclosure documents
    this.disclosuresBucket = new s3.Bucket(this, 'DisclosuresBucket', {
      bucketName: `${resourcePrefix}-documents`,
      removalPolicy:
        env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: env !== 'prod',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
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
              transitionAfter: Duration.days(180),
            },
          ],
        },
      ],
    });

    // DynamoDB Table for disclosure metadata
    this.disclosuresTable = new dynamodb.Table(this, 'DisclosuresTable', {
      tableName: `${resourcePrefix}-metadata`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'uploadDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: env === 'prod',
      },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI for querying by category
    this.disclosuresTable.addGlobalSecondaryIndex({
      indexName: 'CategoryIndex',
      partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'uploadDate', type: dynamodb.AttributeType.STRING },
    });

    // GSI for querying by year
    this.disclosuresTable.addGlobalSecondaryIndex({
      indexName: 'YearIndex',
      partitionKey: { name: 'year', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'uploadDate', type: dynamodb.AttributeType.STRING },
    });

    // Lambda functions
    const getDisclosuresLambda = new NodejsFunction(
      this,
      'GetDisclosuresFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/get-disclosures.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.disclosuresTable.tableName,
          BUCKET_NAME: this.disclosuresBucket.bucketName,
        },
      }
    );

    const getDisclosureLambda = new NodejsFunction(
      this,
      'GetDisclosureFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/get-disclosure.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.disclosuresTable.tableName,
        },
      }
    );

    const createDisclosureLambda = new NodejsFunction(
      this,
      'CreateDisclosureFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/create-disclosure.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.disclosuresTable.tableName,
        },
      }
    );

    const deleteDisclosureLambda = new NodejsFunction(
      this,
      'DeleteDisclosureFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/delete-disclosure.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.disclosuresTable.tableName,
          BUCKET_NAME: this.disclosuresBucket.bucketName,
        },
      }
    );

    const getUploadUrlLambda = new NodejsFunction(
      this,
      'GetUploadUrlFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/get-upload-url.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME: this.disclosuresBucket.bucketName,
        },
      }
    );

    const getDownloadUrlLambda = new NodejsFunction(
      this,
      'GetDownloadUrlFunction',
      {
        entry: 'apps/services/government-disclosures/src/lambdas/api/get-download-url.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME: this.disclosuresBucket.bucketName,
        },
      }
    );

    // Grant permissions
    this.disclosuresTable.grantReadData(getDisclosuresLambda);
    this.disclosuresTable.grantReadData(getDisclosureLambda);
    this.disclosuresTable.grantWriteData(createDisclosureLambda);
    this.disclosuresTable.grantWriteData(deleteDisclosureLambda);

    this.disclosuresBucket.grantRead(getDownloadUrlLambda);
    this.disclosuresBucket.grantPut(getUploadUrlLambda);
    this.disclosuresBucket.grantDelete(deleteDisclosureLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'DisclosuresApi', {
      restApiName: `${resourcePrefix}-api`,
      description: 'API for Government Disclosures',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Cognito Authorizer for admin endpoints
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: 'CityAdminAuthorizer',
      }
    );

    // API Resources
    const disclosures = api.root.addResource('government-disclosures');

    // GET /government-disclosures - public
    disclosures.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getDisclosuresLambda)
    );

    // POST /government-disclosures - admin only
    disclosures.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createDisclosureLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // GET /government-disclosures/{id} - public
    const disclosure = disclosures.addResource('{id}');
    disclosure.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getDisclosureLambda)
    );

    // DELETE /government-disclosures/{id} - admin only
    disclosure.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteDisclosureLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // POST /government-disclosures/upload-url - admin only
    const uploadUrl = disclosures.addResource('upload-url');
    uploadUrl.addMethod(
      'POST',
      new apigateway.LambdaIntegration(getUploadUrlLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // GET /government-disclosures/download-url - public
    const downloadUrl = disclosures.addResource('download-url');
    downloadUrl.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getDownloadUrlLambda)
    );

    Tags.of(this).add('Environment', env);
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'DisclosuresBucketName', {
      value: this.disclosuresBucket.bucketName,
      exportName: `${resourcePrefix}-BucketName`,
      description: 'S3 bucket for government disclosure documents',
    });

    new CfnOutput(this, 'DisclosuresTableName', {
      value: this.disclosuresTable.tableName,
      exportName: `${resourcePrefix}-TableName`,
      description: 'DynamoDB table for disclosure metadata',
    });

    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      exportName: `${resourcePrefix}-ApiUrl`,
      description: 'API Gateway URL for government disclosures',
    });
  }
}
