import { StackProps } from "aws-cdk-lib/core";

export interface SesStackProps extends StackProps {
    domain?: string;
    hostedZoneId?: string;
    senderEmail?: string;
}
