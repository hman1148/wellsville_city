import { StackProps } from 'aws-cdk-lib/core';

export interface NetworkingStackProps extends StackProps {
    cloudFrontCertificateArn: string;
}
