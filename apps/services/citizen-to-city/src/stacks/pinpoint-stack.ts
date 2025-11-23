import { CfnOutput, Stack, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as iam from 'aws-cdk-lib/aws-iam';

import { PinpointStackProps } from '../models/pinpoint-stack-props.model';

export class PinpointStack extends Stack {
  readonly pinpointApp: pinpoint.CfnApp;

  constructor(scope: Construct, id: string, props: PinpointStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // Create Pinpoint Application for SMS
    this.pinpointApp = new pinpoint.CfnApp(this, 'CitizenReportingApp', {
      name: `${resourcePrefix}-citizen-reporting`,
    });

    // SMS Channel configuration
    // Note: You'll need to request a phone number through AWS Pinpoint console
    // or use AWS Pinpoint SMS Voice V2 API for toll-free/10DLC numbers
    new pinpoint.CfnSMSChannel(this, 'SmsChannel', {
      applicationId: this.pinpointApp.ref,
      enabled: true,
    });

    // Create IAM role for Pinpoint to invoke Lambda
    const pinpointLambdaRole = new iam.Role(this, 'PinpointLambdaRole', {
      roleName: `${resourcePrefix}-pinpoint-lambda-role`,
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
      description: 'Role for Pinpoint to invoke Lambda functions',
    });

    // Grant Pinpoint permission to invoke the Lambda
    props.incomingSmsHandler.grantInvoke(pinpointLambdaRole);

    // Event Stream to route incoming messages to Lambda
    // This uses CloudWatch Events / EventBridge to trigger Lambda on SMS events
    new pinpoint.CfnEventStream(this, 'SmsEventStream', {
      applicationId: this.pinpointApp.ref,
      destinationStreamArn: `arn:aws:lambda:${this.region}:${this.account}:function:${props.incomingSmsHandler.functionName}`,
      roleArn: pinpointLambdaRole.roleArn,
    });

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'PinpointAppId', {
      value: this.pinpointApp.ref,
      exportName: `${resourcePrefix}-PinpointAppId`,
      description: 'Pinpoint Application ID',
    });

    new CfnOutput(this, 'PinpointAppArn', {
      value: this.pinpointApp.attrArn,
      exportName: `${resourcePrefix}-PinpointAppArn`,
      description: 'Pinpoint Application ARN',
    });
  }
}
