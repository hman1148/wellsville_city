import { StackProps } from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface PinpointStackProps extends StackProps {
    incomingSmsHandler: lambda.Function;
}
