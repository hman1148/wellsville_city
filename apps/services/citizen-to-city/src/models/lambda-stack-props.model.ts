import { StackProps } from "aws-cdk-lib/core";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';


export interface LambdaStackProps extends StackProps {
  photoBucket: s3.Bucket;
  reportsTable: dynamodb.Table;
  adminNotificationTopic: sns.Topic;
}