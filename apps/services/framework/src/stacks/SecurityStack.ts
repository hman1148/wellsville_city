import { CfnMapping, CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class SecurityStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const env = this.node.tryGetContext('env') || 'dev';
        const sandbox = this.node.tryGetContext('sandbox') || '';
        const localMode = this.node.tryGetContext('localMode') || false;

        // Environment mapping only used for cloud deployments
        const envMapping = new CfnMapping(this, 'EnvironmentMapping', {
            mapping: {
                dev: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'dev.wellsvile.gov',
                    environment: 'development',
                },
                test: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'test.wellsvile.gov',
                    environment: 'testing',
                },
                prod: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'prod.wellsvile.gov',
                    environment: 'production',
                },
                local: {
                    hostedZone: 'N/A',
                    domainName: 'localhost',
                    environment: 'local',
                },
            },
        });

        Tags.of(this).add('Environment', env);
        if (sandbox) {
            Tags.of(this).add('Sandbox', sandbox);
        }
        if (localMode) {
            Tags.of(this).add('LocalMode', 'true');
        }

        //TODO: Add VPC security groups, Lambda execution roles, etc...
        //TODO: Add WAF rules
        //TODO: Add CloudWatch log groups with retention policies

        // Exports for use by other stacks
        new CfnOutput(this, 'EnvironmentName', {
            value: envMapping.findInMap(env, 'environment'),
            exportName: `${this.stackName}-EnvironmentName`,
            description: 'Environment name for this deployment',
        });
    }
}
