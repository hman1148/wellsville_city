import { CfnMapping, CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

/**
 * Stack for creating ACM wildcard certificate in us-east-1 for CloudFront.
 * This stack must be deployed in us-east-1 region.
 */
export class CertificateStack extends Stack {
    public readonly wildCertificateArn: string;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const env = this.node.tryGetContext('env') || 'dev';
        const sandbox = this.node.tryGetContext('sandbox') || '';

        const envMapping = new CfnMapping(this, 'EnvironmentMapping', {
            mapping: {
                dev: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'dev.wellsvile.gov',
                },
                test: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I', // TODO: Update with real value
                    domainName: 'test.wellsvile.gov',
                },
                prod: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I', // TODO: Update with real value
                    domainName: 'prod.wellsvile.gov',
                },
            },
        });

        const hostedZoneId = envMapping.findInMap(env, 'hostedZone');
        const baseDomainName = envMapping.findInMap(env, 'domainName');

        const wildDomainName = sandbox ? `*.${sandbox}.${baseDomainName}` : `*.${baseDomainName}`;

        // Import the existing hosted zone (always use base domain for hosted zone)
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId,
            zoneName: baseDomainName,
        });

        const wildCertificate = new acm.Certificate(this, 'WildCertificate', {
            domainName: wildDomainName,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        this.wildCertificateArn = wildCertificate.certificateArn;

        Tags.of(this).add('Environment', env);
        if (sandbox) {
            Tags.of(this).add('Sandbox', sandbox);
        }

        new CfnOutput(this, 'WildCertificateArn', {
            value: wildCertificate.certificateArn,
            exportName: `${this.stackName}-WildCertificateArn`,
            description: 'ACM Certificate ARN for Wild domain (us-east-1)',
        });
    }
}
