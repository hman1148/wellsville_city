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
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AppStack extends Stack {
  readonly meetingsBucket: s3.Bucket;
  readonly meetingsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `meetings${sandboxSuffix}`;

    // Import Cognito User Pool for admin authentication
    const userPoolId = Fn.importValue(
      `portal${sandboxSuffix}-CityAdminUserPoolId`
    );
    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      'CityAdminUserPool',
      userPoolId
    );

    // S3 Bucket for meeting documents (agendas, minutes, attachments)
    this.meetingsBucket = new s3.Bucket(this, 'MeetingsBucket', {
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
              transitionAfter: Duration.days(365), // Keep recent meetings in standard storage longer
            },
          ],
        },
      ],
    });

    // DynamoDB Table for meeting metadata
    this.meetingsTable = new dynamodb.Table(this, 'MeetingsTable', {
      tableName: `${resourcePrefix}-metadata`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'meetingDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: env === 'prod',
      },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI for querying by meeting type (city-council, planning-zoning)
    this.meetingsTable.addGlobalSecondaryIndex({
      indexName: 'MeetingTypeIndex',
      partitionKey: {
        name: 'meetingType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: 'meetingDate', type: dynamodb.AttributeType.STRING },
    });

    // GSI for querying by status (upcoming, past, cancelled)
    this.meetingsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'meetingDate', type: dynamodb.AttributeType.STRING },
    });

    // GSI for querying by meeting type and status (compound queries)
    this.meetingsTable.addGlobalSecondaryIndex({
      indexName: 'MeetingTypeStatusIndex',
      partitionKey: {
        name: 'meetingTypeStatus',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: 'meetingDate', type: dynamodb.AttributeType.STRING },
    });

    // Lambda Functions
    const getMeetingsLambda = new NodejsFunction(this, 'GetMeetingsFunction', {
      entry: 'apps/services/meetings/src/lambdas/api/get-meetings.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: this.meetingsTable.tableName,
        BUCKET_NAME: this.meetingsBucket.bucketName,
      },
    });

    const getMeetingLambda = new NodejsFunction(this, 'GetMeetingFunction', {
      entry: 'apps/services/meetings/src/lambdas/api/get-meeting.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: this.meetingsTable.tableName,
      },
    });

    const createMeetingLambda = new NodejsFunction(
      this,
      'CreateMeetingFunction',
      {
        entry: 'apps/services/meetings/src/lambdas/api/create-meeting.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.meetingsTable.tableName,
        },
      }
    );

    const updateMeetingLambda = new NodejsFunction(
      this,
      'UpdateMeetingFunction',
      {
        entry: 'apps/services/meetings/src/lambdas/api/update-meeting.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.meetingsTable.tableName,
        },
      }
    );

    const deleteMeetingLambda = new NodejsFunction(
      this,
      'DeleteMeetingFunction',
      {
        entry: 'apps/services/meetings/src/lambdas/api/delete-meeting.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: this.meetingsTable.tableName,
          BUCKET_NAME: this.meetingsBucket.bucketName,
        },
      }
    );

    const getUploadUrlLambda = new NodejsFunction(
      this,
      'GetUploadUrlFunction',
      {
        entry: 'apps/services/meetings/src/lambdas/api/get-upload-url.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME: this.meetingsBucket.bucketName,
        },
      }
    );

    const getDownloadUrlLambda = new NodejsFunction(
      this,
      'GetDownloadUrlFunction',
      {
        entry: 'apps/services/meetings/src/lambdas/api/get-download-url.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(30),
        environment: {
          BUCKET_NAME: this.meetingsBucket.bucketName,
        },
      }
    );

    // Grant DynamoDB permissions
    this.meetingsTable.grantReadData(getMeetingsLambda);
    this.meetingsTable.grantReadData(getMeetingLambda);
    this.meetingsTable.grantWriteData(createMeetingLambda);
    this.meetingsTable.grantWriteData(updateMeetingLambda);
    this.meetingsTable.grantWriteData(deleteMeetingLambda);

    // Grant S3 permissions
    this.meetingsBucket.grantRead(getDownloadUrlLambda);
    this.meetingsBucket.grantPut(getUploadUrlLambda);
    this.meetingsBucket.grantDelete(deleteMeetingLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'MeetingsApi', {
      restApiName: `${resourcePrefix}-api`,
      description: 'API for City Council and Planning & Zoning Meetings',
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
    const meetings = api.root.addResource('meetings');

    // GET /meetings - public (supports query params: meetingType, status)
    meetings.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getMeetingsLambda)
    );

    // POST /meetings - admin only
    meetings.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createMeetingLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // GET /meetings/{id} - public
    const meeting = meetings.addResource('{id}');
    meeting.addMethod('GET', new apigateway.LambdaIntegration(getMeetingLambda));

    // PUT /meetings/{id} - admin only
    meeting.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateMeetingLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // DELETE /meetings/{id} - admin only
    meeting.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(deleteMeetingLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // POST /meetings/upload-url - admin only
    const uploadUrl = meetings.addResource('upload-url');
    uploadUrl.addMethod(
      'POST',
      new apigateway.LambdaIntegration(getUploadUrlLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // GET /meetings/download-url - public
    const downloadUrl = meetings.addResource('download-url');
    downloadUrl.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getDownloadUrlLambda)
    );

    // Tags
    Tags.of(this).add('Environment', env);
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'MeetingsBucketName', {
      value: this.meetingsBucket.bucketName,
      exportName: `${resourcePrefix}-BucketName`,
      description: 'S3 bucket for meeting documents',
    });

    new CfnOutput(this, 'MeetingsTableName', {
      value: this.meetingsTable.tableName,
      exportName: `${resourcePrefix}-TableName`,
      description: 'DynamoDB table for meeting metadata',
    });

    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      exportName: `${resourcePrefix}-ApiUrl`,
      description: 'API Gateway URL for meetings',
    });
  }
}
