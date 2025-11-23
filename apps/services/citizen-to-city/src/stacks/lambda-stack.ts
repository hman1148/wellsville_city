import { CfnOutput, Duration, Stack, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

import { LambdaStackProps } from '../models';

export class LambdaStack extends Stack {
  readonly incomingSmsHandler: lambda.Function;
  readonly processReportHandler: lambda.Function;
  readonly notifyAdminHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // Common Lambda configuration
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        NODE_ENV: env,
        REPORTS_TABLE_NAME: props.reportsTable.tableName,
        PHOTO_BUCKET_NAME: props.photoBucket.bucketName,
        ADMIN_TOPIC_ARN: props.adminNotificationTopic.topicArn,
        SENDER_EMAIL: props.senderEmail,
        COGNITO_USER_POOL_ARN: props.cognitoUserPoolArn || '',
      },
    };

    // Incoming SMS Handler - processes incoming SMS/MMS from Pinpoint
    this.incomingSmsHandler = new lambdaNodejs.NodejsFunction(this, 'IncomingSmsHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-incoming-sms`,
      entry: path.join(__dirname, '../lambdas/incoming-sms/handler.ts'),
      handler: 'handler',
      description: 'Handles incoming SMS messages from citizens',
    });

    // Process Report Handler - processes and validates reports
    this.processReportHandler = new lambdaNodejs.NodejsFunction(this, 'ProcessReportHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-process-report`,
      entry: path.join(__dirname, '../lambdas/process-report/handler.ts'),
      handler: 'handler',
      description: 'Processes and validates citizen reports',
    });

    // Notify Admin Handler - sends notifications to admins
    this.notifyAdminHandler = new lambdaNodejs.NodejsFunction(this, 'NotifyAdminHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-notify-admin`,
      entry: path.join(__dirname, '../lambdas/notify-admin/handler.ts'),
      handler: 'handler',
      description: 'Sends notifications to city admins',
    });

    // Grant permissions
    props.reportsTable.grantReadWriteData(this.incomingSmsHandler);
    props.reportsTable.grantReadWriteData(this.processReportHandler);
    props.reportsTable.grantReadData(this.notifyAdminHandler);

    props.photoBucket.grantReadWrite(this.incomingSmsHandler);
    props.photoBucket.grantRead(this.processReportHandler);
    props.photoBucket.grantRead(this.notifyAdminHandler);

    props.adminNotificationTopic.grantPublish(this.incomingSmsHandler);
    props.adminNotificationTopic.grantPublish(this.notifyAdminHandler);

    // Grant SES permissions for sending emails (scoped to verified identity)
    const sesPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: [props.sesEmailIdentityArn],
    });
    this.notifyAdminHandler.addToRolePolicy(sesPolicy);

    // Grant Cognito permissions to list users for admin emails (scoped to user pool)
    if (props.cognitoUserPoolArn) {
      const cognitoPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cognito-idp:ListUsers'],
        resources: [props.cognitoUserPoolArn],
      });
      this.notifyAdminHandler.addToRolePolicy(cognitoPolicy);
    }

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'IncomingSmsHandlerArn', {
      value: this.incomingSmsHandler.functionArn,
      exportName: `${resourcePrefix}-IncomingSmsHandlerArn`,
      description: 'Incoming SMS Lambda function ARN',
    });

    new CfnOutput(this, 'ProcessReportHandlerArn', {
      value: this.processReportHandler.functionArn,
      exportName: `${resourcePrefix}-ProcessReportHandlerArn`,
      description: 'Process Report Lambda function ARN',
    });

    new CfnOutput(this, 'NotifyAdminHandlerArn', {
      value: this.notifyAdminHandler.functionArn,
      exportName: `${resourcePrefix}-NotifyAdminHandlerArn`,
      description: 'Notify Admin Lambda function ARN',
    });
  }
}
