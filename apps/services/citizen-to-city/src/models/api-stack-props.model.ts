import { StackProps } from "aws-cdk-lib/core";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface ApiStackProps extends StackProps {
    reportsTable: dynamodb.Table;
    citizensTable: dynamodb.Table;
    photoBucket: s3.Bucket;
    sendMassSmsHandler: lambda.Function;
    sendTargetedSmsHandler: lambda.Function;
    addCitizenHandler: lambda.Function;
    listCitizensHandler: lambda.Function;
    removeCitizenHandler: lambda.Function;
    getCitizenHandler: lambda.Function;
}
