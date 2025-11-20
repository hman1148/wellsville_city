import { CfnMapping, CfnOutput, Stack, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { NetworkingStackProps } from '../models';

export class NetworkingStack extends Stack {
    constructor(scope: Construct, id: string, props: NetworkingStackProps) {
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
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'test.wellsvile.gov',
                },
                prod: {
                    hostedZone: 'Z09011321LBDR3A2J6A1I',
                    domainName: 'prod.wellsvile.gov',
                },
            },
        });

        const hostedZoneId = envMapping.findInMap(env, 'hostedZone');
        const baseDomainName = envMapping.findInMap(env, 'domainName');

        const domainName = sandbox ? `${sandbox}.${baseDomainName}` : baseDomainName;
        const apiDomainName = sandbox ? `api.${sandbox}.${baseDomainName}` : `api.${baseDomainName}`;

        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId,
            zoneName: baseDomainName,
        });

        // Create ACM certificate in current region for API Gateway
        const regionalCertificate = new acm.Certificate(this, 'RegionalCertificate', {
            domainName: apiDomainName,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // Create API Gateway Custom Domain Name
        const customDomain = new apigateway.DomainName(this, 'ApiCustomDomain', {
            domainName: apiDomainName,
            certificate: regionalCertificate,
            endpointType: apigateway.EndpointType.REGIONAL,
            securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
        });

        // Create Route53 A record
        new route53.ARecord(this, 'ApiAliasRecord', {
            zone: hostedZone,
            recordName: apiDomainName,
            target: route53.RecordTarget.fromAlias(new route53Targets.ApiGatewayDomain(customDomain)),
            comment: sandbox ? `API Gateway domain for sandbox: ${sandbox}` : 'API Gateway domain',
        });

        Tags.of(this).add('Environment', env);
        if (sandbox) {
            Tags.of(this).add('Sandbox', sandbox);
        }

        // Exports for use by other stacks
        new CfnOutput(this, 'HostedZoneId', {
            value: hostedZoneId,
            exportName: `${this.stackName}-HostedZoneId`,
            description: 'Route53 Hosted Zone ID',
        });

        new CfnOutput(this, 'DomainName', {
            value: domainName,
            exportName: `${this.stackName}-DomainName`,
            description: 'Base domain name',
        });

        new CfnOutput(this, 'ApiDomainName', {
            value: apiDomainName,
            exportName: `${this.stackName}-ApiDomainName`,
            description: 'API Gateway custom domain name',
        });

        new CfnOutput(this, 'CloudFrontCertificateArn', {
            value: props.cloudFrontCertificateArn,
            exportName: `${this.stackName}-CloudFrontCertificateArn`,
            description: 'ACM Certificate ARN for CloudFront (us-east-1)',
        });

        new CfnOutput(this, 'RegionalCertificateArn', {
            value: regionalCertificate.certificateArn,
            exportName: `${this.stackName}-RegionalCertificateArn`,
            description: 'ACM Certificate ARN for regional services',
        });

        new CfnOutput(this, 'ApiGatewayDomainName', {
            value: customDomain.domainName,
            exportName: `${this.stackName}-ApiGatewayDomainName`,
            description: 'API Gateway custom domain name',
        });

        new CfnOutput(this, 'ApiGatewayDomainNameTarget', {
            value: customDomain.domainNameAliasDomainName,
            exportName: `${this.stackName}-ApiGatewayDomainNameTarget`,
            description: 'API Gateway custom domain target for Route53 alias',
        });

        new CfnOutput(this, 'ApiGatewayDomainNameHostedZoneId', {
            value: customDomain.domainNameAliasHostedZoneId,
            exportName: `${this.stackName}-ApiGatewayDomainNameHostedZoneId`,
            description: 'API Gateway custom domain hosted zone ID for Route53 alias',
        });
    }
}
