import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';

export class NotificationStack extends Stack {
  readonly adminNotificationTopic: sns.Topic;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // SNS Topic for admin notifications
    this.adminNotificationTopic = new sns.Topic(this, 'AdminNotificationTopic', {
      topicName: `${resourcePrefix}-admin-notifications`,
      displayName: 'Wellsville City - Citizen Report Notifications',
    });

    // Email subscriptions can be added via console or programmatically
    // For production, we'll query Cognito for admin emails

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Outputs
    new CfnOutput(this, 'AdminNotificationTopicArn', {
      value: this.adminNotificationTopic.topicArn,
      exportName: `${resourcePrefix}-AdminNotificationTopicArn`,
      description: 'SNS topic ARN for admin notifications',
    });

    new CfnOutput(this, 'AdminNotificationTopicName', {
      value: this.adminNotificationTopic.topicName,
      exportName: `${resourcePrefix}-AdminNotificationTopicName`,
      description: 'SNS topic name for admin notifications',
    });
  }
}
