import { CfnMapping, CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class DataStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const env = this.node.tryGetContext('env') || 'dev';
        const sandbox = this.node.tryGetContext('sandbox') || '';
        const localMode = this.node.tryGetContext('localMode') || false;

        // Environment mapping for database configurations
        const envMapping = new CfnMapping(this, 'EnvironmentMapping', {
            mapping: {
                dev: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'dev.wellsvile.gov',
                    dbInstanceClass: 'db.t3.micro',
                    backupRetention: '7',
                },
                test: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'test.wellsvile.gov',
                    dbInstanceClass: 'db.t3.small',
                    backupRetention: '7',
                },
                prod: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'prod.welsville.gov',
                    dbInstanceClass: 'db.t3.medium',
                    backupRetention: '30',
                },
                local: {
                    hostedZone: 'N/A',
                    domainName: 'localhost',
                    dbInstanceClass: 'db.t3.micro',
                    backupRetention: '1',
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

        //TODO: Add PostgreSQL Aurora Serverless cluster when needed
        //TODO: Add DynamoDB tables if needed
        //TODO: Add S3 buckets for data storage
        //TODO: Add backup policies

        // Exports for use by other stacks
        new CfnOutput(this, 'DatabaseInstanceClass', {
            value: envMapping.findInMap(env, 'dbInstanceClass'),
            exportName: `${this.stackName}-DatabaseInstanceClass`,
            description: 'Recommended database instance class for this environment',
        });
    }
}
