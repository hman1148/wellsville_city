import { CfnOutput, Duration, Fn, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

export interface ApiStackProps extends StackProps {
  documentBucket: s3.IBucket;
}

export class ApiStack extends Stack {
  readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const localMode = this.node.tryGetContext('localMode') || false;
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `city-documents${sandboxSuffix}`;

    // Import Cognito User Pool for authorization (from authentication stack)
    const cognitoUserPoolId = localMode
      ? 'local-user-pool-id'
      : Fn.importValue(`portal${sandboxSuffix}-CityAdminUserPoolId`);

    // Create REST API
    this.api = new apigateway.RestApi(this, 'CityDocumentsApi', {
      restApiName: `${resourcePrefix}-api`,
      description: 'API for City Documents Upload - Protected by Cognito',
      deployOptions: {
        stageName: env,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: env !== 'prod',
        metricsEnabled: true,
      },
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

    // Import User Pool reference
    const userPool = cognito.UserPool.fromUserPoolId(this, 'ImportedUserPool', cognitoUserPoolId);

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: `${resourcePrefix}-authorizer`,
    });

    // Common Lambda props
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        NODE_ENV: env,
        DOCUMENT_BUCKET_NAME: props.documentBucket.bucketName,
      },
    };

    // Get Presigned URL Lambda (for uploading/downloading documents)
    const getPresignedUrlHandler = new lambdaNodejs.NodejsFunction(this, 'GetPresignedUrlHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-get-presigned-url`,
      entry: path.join(__dirname, '../lambdas/api/get-presigned-url.ts'),
      handler: 'handler',
      description: 'Generates presigned URLs for document upload/download',
    });

    // Grant read/write access to the document bucket for presigned URLs
    props.documentBucket.grantReadWrite(getPresignedUrlHandler);

    // API Resources and Methods
    const presignedUrlResource = this.api.root.addResource('presigned-url');

    // Authorization options - requires Cognito authentication
    const authOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // GET /presigned-url?key={s3Key}&operation={get|put}&contentType={mimeType}
    presignedUrlResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getPresignedUrlHandler),
      authOptions
    );

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'upload-service');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      exportName: `${resourcePrefix}-ApiEndpoint`,
      description: 'City Documents API Gateway endpoint URL',
    });

    new CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      exportName: `${resourcePrefix}-ApiId`,
      description: 'City Documents API Gateway REST API ID',
    });
  }
}
