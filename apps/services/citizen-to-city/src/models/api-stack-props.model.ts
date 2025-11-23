import { StackProps } from "aws-cdk-lib/core";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface ApiStackProps extends StackProps {
    reportsTable: dynamodb.Table;
    photoBucket: s3.Bucket;
}
