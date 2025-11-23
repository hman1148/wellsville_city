import { CfnOutput, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends Stack {
  readonly reportsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // DynamoDB Table for Citizen Reports
    // Schema:
    // - PK: reportId (UUID)
    // - SK: timestamp (ISO string for sorting)
    // - phoneNumber: citizen's phone number
    // - citizenName: name of the reporter
    // - issueAddress: location of the issue
    // - issueType: pothole, water_break, streetlight, etc.
    // - description: detailed description of the issue
    // - photoUrls: array of S3 photo URLs
    // - status: new, in_progress, resolved
    // - createdAt: ISO timestamp
    // - updatedAt: ISO timestamp
    this.reportsTable = new dynamodb.Table(this, 'CitizenReportsTable', {
      tableName: `${resourcePrefix}-citizen-reports`,
      partitionKey: {
        name: 'reportId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'prod',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI for querying by status (for dashboard filtering)
    this.reportsTable.addGlobalSecondaryIndex({
      indexName: 'status-createdAt-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying by phone number (citizen lookup)
    this.reportsTable.addGlobalSecondaryIndex({
      indexName: 'phoneNumber-createdAt-index',
      partitionKey: {
        name: 'phoneNumber',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying by issue type
    this.reportsTable.addGlobalSecondaryIndex({
      indexName: 'issueType-createdAt-index',
      partitionKey: {
        name: 'issueType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'ReportsTableName', {
      value: this.reportsTable.tableName,
      exportName: `${resourcePrefix}-ReportsTableName`,
      description: 'DynamoDB table name for citizen reports',
    });

    new CfnOutput(this, 'ReportsTableArn', {
      value: this.reportsTable.tableArn,
      exportName: `${resourcePrefix}-ReportsTableArn`,
      description: 'DynamoDB table ARN for citizen reports',
    });

    new CfnOutput(this, 'ReportsTableStreamArn', {
      value: this.reportsTable.tableStreamArn || '',
      exportName: `${resourcePrefix}-ReportsTableStreamArn`,
      description: 'DynamoDB table stream ARN for citizen reports',
    });
  }
}
