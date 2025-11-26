import { CfnOutput, Duration, Fn, Stack, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { ApiStackProps } from '../models/api-stack-props.model';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export class ApiStack extends Stack {
  readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const localMode = this.node.tryGetContext('localMode') || false;
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // Import Cognito User Pool for authorization (from authentication stack)
    const cognitoUserPoolId = localMode
      ? 'local-user-pool-id'
      : Fn.importValue(`portal${sandboxSuffix}-CityAdminUserPoolId`);

    // Create REST API
    this.api = new apigateway.RestApi(this, 'CitizenReportsApi', {
      restApiName: `${resourcePrefix}-api`,
      description: 'API for Citizen Reports Dashboard',
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
        REPORTS_TABLE_NAME: props.reportsTable.tableName,
        PHOTO_BUCKET_NAME: props.photoBucket.bucketName,
      },
    };

    // List Reports Lambda
    const listReportsHandler = new lambdaNodejs.NodejsFunction(this, 'ListReportsHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-list-reports`,
      entry: path.join(__dirname, '../lambdas/api/list-reports.ts'),
      handler: 'handler',
      description: 'Lists citizen reports with filtering and pagination',
    });
    props.reportsTable.grantReadData(listReportsHandler);

    // Get Report Lambda
    const getReportHandler = new lambdaNodejs.NodejsFunction(this, 'GetReportHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-get-report`,
      entry: path.join(__dirname, '../lambdas/api/get-report.ts'),
      handler: 'handler',
      description: 'Gets a single citizen report by ID',
    });
    props.reportsTable.grantReadData(getReportHandler);
    props.photoBucket.grantRead(getReportHandler);

    // Update Report Status Lambda
    const updateStatusHandler = new lambdaNodejs.NodejsFunction(this, 'UpdateStatusHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-update-status`,
      entry: path.join(__dirname, '../lambdas/api/update-status.ts'),
      handler: 'handler',
      description: 'Updates the status of a citizen report',
    });
    props.reportsTable.grantReadWriteData(updateStatusHandler);

    // Get Stats Lambda
    const getStatsHandler = new lambdaNodejs.NodejsFunction(this, 'GetStatsHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-get-stats`,
      entry: path.join(__dirname, '../lambdas/api/get-stats.ts'),
      handler: 'handler',
      description: 'Gets dashboard statistics for reports',
    });
    props.reportsTable.grantReadData(getStatsHandler);

    // Get Presigned URL Lambda (for viewing photos)
    const getPresignedUrlHandler = new lambdaNodejs.NodejsFunction(this, 'GetPresignedUrlHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-get-presigned-url`,
      entry: path.join(__dirname, '../lambdas/api/get-presigned-url.ts'),
      handler: 'handler',
      description: 'Generates presigned URLs for photo access',
    });
    props.photoBucket.grantRead(getPresignedUrlHandler);

    // API Resources and Methods
    const reportsResource = this.api.root.addResource('reports');
    const reportResource = reportsResource.addResource('{reportId}');
    const statusResource = reportResource.addResource('status');
    const statsResource = this.api.root.addResource('stats');
    const presignedUrlResource = this.api.root.addResource('presigned-url');

    // Authorization options
    const authOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // GET /reports - List all reports
    reportsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(listReportsHandler),
      authOptions
    );

    // GET /reports/{reportId} - Get single report
    reportResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getReportHandler),
      authOptions
    );

    // PATCH /reports/{reportId}/status - Update report status
    statusResource.addMethod(
      'PATCH',
      new apigateway.LambdaIntegration(updateStatusHandler),
      authOptions
    );

    // GET /stats - Get dashboard statistics
    statsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getStatsHandler),
      authOptions
    );

    // GET /presigned-url?key={s3Key} - Get presigned URL for photo
    presignedUrlResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getPresignedUrlHandler),
      authOptions
    );

    // === Messaging Endpoints ===
    const messagesResource = this.api.root.addResource('messages');
    const broadcastResource = messagesResource.addResource('broadcast');
    const targetedResource = messagesResource.addResource('targeted');

    // POST /messages/broadcast - Send mass SMS to all subscribed citizens
    broadcastResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.sendMassSmsHandler),
      authOptions
    );

    // POST /messages/targeted - Send SMS to specific citizens
    targetedResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.sendTargetedSmsHandler),
      authOptions
    );

    // === Citizen Management Endpoints ===
    const citizensResource = this.api.root.addResource('citizens');
    const citizenResource = citizensResource.addResource('{citizenId}');

    // GET /citizens - List all citizens
    citizensResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.listCitizensHandler),
      authOptions
    );

    // POST /citizens - Add a new citizen
    citizensResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.addCitizenHandler),
      authOptions
    );

    // GET /citizens/{citizenId} - Get a single citizen
    citizenResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.getCitizenHandler),
      authOptions
    );

    // DELETE /citizens/{citizenId} - Remove/unsubscribe a citizen
    citizenResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(props.removeCitizenHandler),
      authOptions
    );

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      exportName: `${resourcePrefix}-ApiEndpoint`,
      description: 'API Gateway endpoint URL',
    });

    new CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      exportName: `${resourcePrefix}-ApiId`,
      description: 'API Gateway REST API ID',
    });
  }
}
