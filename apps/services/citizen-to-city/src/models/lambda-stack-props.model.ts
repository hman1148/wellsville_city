import { StackProps } from "aws-cdk-lib/core";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface LambdaStackProps extends StackProps {
  /** S3 bucket for storing citizen photos */
  photoBucket: s3.Bucket;
  /** DynamoDB table for citizen reports */
  reportsTable: dynamodb.Table;
  /** SNS topic for admin notifications */
  adminNotificationTopic: sns.Topic;
  /** SES email identity ARN for sending emails */
  sesEmailIdentityArn: string;
  /** Verified sender email address */
  senderEmail: string;
  /** Cognito User Pool ARN for listing admin users */
  cognitoUserPoolArn?: string;
}