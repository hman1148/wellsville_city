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
  readonly sendMassSmsHandler: lambda.Function;
  readonly sendTargetedSmsHandler: lambda.Function;
  readonly addCitizenHandler: lambda.Function;
  readonly listCitizensHandler: lambda.Function;
  readonly removeCitizenHandler: lambda.Function;
  readonly getCitizenHandler: lambda.Function;

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
        CITIZENS_TABLE_NAME: props.citizensTable.tableName,
        PHOTO_BUCKET_NAME: props.photoBucket.bucketName,
        ADMIN_TOPIC_ARN: props.adminNotificationTopic.topicArn,
        SENDER_EMAIL: props.senderEmail,
        COGNITO_USER_POOL_ARN: props.cognitoUserPoolArn || '',
        PINPOINT_APP_ID: props.pinpointAppId || '',
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

    // Send Mass SMS Handler - broadcasts messages to all subscribed citizens
    this.sendMassSmsHandler = new lambdaNodejs.NodejsFunction(this, 'SendMassSmsHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-send-mass-sms`,
      entry: path.join(__dirname, '../lambdas/messaging/send-mass-sms.ts'),
      handler: 'handler',
      description: 'Sends mass SMS to all subscribed citizens',
      timeout: Duration.minutes(5), // Longer timeout for mass sending
    });

    // Send Targeted SMS Handler - sends messages to specific citizens
    this.sendTargetedSmsHandler = new lambdaNodejs.NodejsFunction(this, 'SendTargetedSmsHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-send-targeted-sms`,
      entry: path.join(__dirname, '../lambdas/messaging/send-targeted-sms.ts'),
      handler: 'handler',
      description: 'Sends SMS to specific citizens',
    });

    // Add Citizen Handler - adds a new citizen subscriber
    this.addCitizenHandler = new lambdaNodejs.NodejsFunction(this, 'AddCitizenHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-add-citizen`,
      entry: path.join(__dirname, '../lambdas/citizens/add-citizen.ts'),
      handler: 'handler',
      description: 'Adds a new citizen subscriber',
    });

    // List Citizens Handler - lists all citizens with filtering
    this.listCitizensHandler = new lambdaNodejs.NodejsFunction(this, 'ListCitizensHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-list-citizens`,
      entry: path.join(__dirname, '../lambdas/citizens/list-citizens.ts'),
      handler: 'handler',
      description: 'Lists citizens with optional filtering',
    });

    // Remove Citizen Handler - unsubscribes a citizen
    this.removeCitizenHandler = new lambdaNodejs.NodejsFunction(this, 'RemoveCitizenHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-remove-citizen`,
      entry: path.join(__dirname, '../lambdas/citizens/remove-citizen.ts'),
      handler: 'handler',
      description: 'Unsubscribes a citizen',
    });

    // Get Citizen Handler - gets a single citizen by ID
    this.getCitizenHandler = new lambdaNodejs.NodejsFunction(this, 'GetCitizenHandler', {
      ...commonLambdaProps,
      functionName: `${resourcePrefix}-get-citizen`,
      entry: path.join(__dirname, '../lambdas/citizens/get-citizen.ts'),
      handler: 'handler',
      description: 'Gets a citizen by ID',
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

    // Grant permissions for new messaging handlers
    props.citizensTable.grantReadData(this.sendMassSmsHandler);
    props.citizensTable.grantReadData(this.sendTargetedSmsHandler);

    // Note: Pinpoint SMS permissions will be granted in main.ts after Pinpoint stack is created

    // Grant permissions for citizen management handlers
    props.citizensTable.grantReadWriteData(this.addCitizenHandler);
    props.citizensTable.grantReadData(this.listCitizensHandler);
    props.citizensTable.grantReadWriteData(this.removeCitizenHandler);
    props.citizensTable.grantReadData(this.getCitizenHandler);

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

    new CfnOutput(this, 'SendMassSmsHandlerArn', {
      value: this.sendMassSmsHandler.functionArn,
      exportName: `${resourcePrefix}-SendMassSmsHandlerArn`,
      description: 'Send Mass SMS Lambda function ARN',
    });

    new CfnOutput(this, 'SendTargetedSmsHandlerArn', {
      value: this.sendTargetedSmsHandler.functionArn,
      exportName: `${resourcePrefix}-SendTargetedSmsHandlerArn`,
      description: 'Send Targeted SMS Lambda function ARN',
    });

    new CfnOutput(this, 'AddCitizenHandlerArn', {
      value: this.addCitizenHandler.functionArn,
      exportName: `${resourcePrefix}-AddCitizenHandlerArn`,
      description: 'Add Citizen Lambda function ARN',
    });

    new CfnOutput(this, 'ListCitizensHandlerArn', {
      value: this.listCitizensHandler.functionArn,
      exportName: `${resourcePrefix}-ListCitizensHandlerArn`,
      description: 'List Citizens Lambda function ARN',
    });

    new CfnOutput(this, 'RemoveCitizenHandlerArn', {
      value: this.removeCitizenHandler.functionArn,
      exportName: `${resourcePrefix}-RemoveCitizenHandlerArn`,
      description: 'Remove Citizen Lambda function ARN',
    });

    new CfnOutput(this, 'GetCitizenHandlerArn', {
      value: this.getCitizenHandler.functionArn,
      exportName: `${resourcePrefix}-GetCitizenHandlerArn`,
      description: 'Get Citizen Lambda function ARN',
    });
  }
}
