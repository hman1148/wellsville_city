import { CfnMapping, CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';


export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Get environment and sandbox from context
    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const localMode = this.node.tryGetContext('localMode') || false;
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const sandBoxDomainPrefix = sandbox ? `.${sandbox}` : '';

    // For local mode, use default values instead of importing from CloudFormation
    const baseDomain = localMode ? 'localhost:4200' : Fn.importValue(`service-framework-networking${sandboxSuffix}-DomainName`);
    const resourcePrefix = `portal${sandboxSuffix}`;

    // Only configure domain resources when NOT in local mode
    let authCertificate: acm.ICertificate | undefined;
    let domainName: string | undefined;
    let hostedZoneId: string | undefined;
    let authDomainName: string | undefined;

    if (!localMode) {
      domainName = Fn.importValue(`service-framework-networking${sandboxSuffix}-DomainName`);
      hostedZoneId = Fn.importValue(`service-framework-networking${sandboxSuffix}-HostedZoneId`);
      const wildCertificateArn = Fn.importValue(`service-framework-networking${sandboxSuffix}-CloudFrontCertificateArn`);
      authDomainName = `auth.${domainName}`;
      authCertificate = acm.Certificate.fromCertificateArn(this, 'AuthCertificate', wildCertificateArn);
    }


    const userPool: cognito.UserPool = new cognito.UserPool(this, 'CityAdminUserPool', {
      userPoolName: `${resourcePrefix}-city-admin-user-pool`,
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: env === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      customAttributes: {
        userId: new cognito.StringAttribute({ mutable: false }),
      },
    });

    // Configure callback URLs based on mode
    const callbackUrl = localMode
      ? 'http://localhost:4200/callback'
      : `https://www${sandBoxDomainPrefix}.${baseDomain}/callback`;
    const logoutUrl = localMode
      ? 'http://localhost:4200/logout'
      : `https://www${sandBoxDomainPrefix}.${baseDomain}/logout`;

    const userPoolClient = userPool.addClient('PortalClient', {
      userPoolClientName: `${resourcePrefix}-spa-client`,
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: localMode ? [callbackUrl] : [callbackUrl, ...(env === 'dev' ? ['http://localhost:4200/callback'] : [])],
        logoutUrls: localMode ? [logoutUrl] : [logoutUrl, ...(env === 'dev' ? ['http://localhost:4200/logout'] : [])],
      },
      authFlows: {
        userPassword: false,
        userSrp: true,
        custom: false,
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.minutes(60),
      idTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(30),
      enableTokenRevocation: true,
    });

    // Configure domain based on mode
    // In local mode, use Cognito prefix domain (doesn't require Route53)
    // In cloud mode, use custom domain with certificate
    const userPoolDomain = localMode
      ? userPool.addDomain('CityAdminUserAuthDomain', {
          cognitoDomain: {
            domainPrefix: `${resourcePrefix}-local-auth`,
          },
        })
      : userPool.addDomain('CityAdminUserAuthDomain', {
          customDomain: {
            domainName: authDomainName!,
            certificate: authCertificate!,
          },
        });

    const parameterPrefix = `${resourcePrefix}-city-admin-user-pool`;

    new StringParameter(this, 'CityAdminUserPoolIdParameter', {
      parameterName: `${parameterPrefix}/cityAdminUsers`,
      stringValue: userPool.userPoolId,
      description: 'Cognito User Pool ID for Amplify configuration',
    });

    new StringParameter(this, 'CityAdminUserPoolClientIdParameter', {
      parameterName: `${parameterPrefix}/cityAdminUserPoolClientId`,
      stringValue: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID for Amplify configuration',
    });

    new StringParameter(this, 'CityAdminUserPoolRegionParameter', {
      parameterName: `${parameterPrefix}/region`,
      stringValue: this.region,
      description: 'AWS Region for Cognito User Pool',
    });


    // Only create Route53 record when NOT in local mode
    if (!localMode) {
      // Manually create Route53 record to avoid circular dependency with UserPoolDomainTarget
      // The UserPoolDomain automatically creates a CloudFront distribution
      // CloudFront distributions in us-east-1 use the hosted zone Z2FDTNDATAQYW2
      const cfnUserPoolDomain = userPoolDomain.node.defaultChild as cognito.CfnUserPoolDomain;

      new route53.CfnRecordSet(this, 'AuthDomainAliasRecord', {
        hostedZoneId: hostedZoneId!,
        name: authDomainName!,
        type: 'A',
        aliasTarget: {
          dnsName: cfnUserPoolDomain.attrCloudFrontDistribution,
          hostedZoneId: 'Z2FDTNDATAQYW2', // CloudFront hosted zone ID for all regions
          // NOTE: https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-route53-recordset-aliastarget.html
        },
        comment: sandbox ? `Cognito auth domain for sandbox: ${sandbox}` : 'Cognito auth domain',
      });
    }

    new CfnMapping(this, 'EnvironmentMapping', {
      mapping: {
        dev: {
          exampleMapping: 'dev-example',
        },
        stage: {
          exampleMapping: 'stage-example',
        },
        uat: {
          exampleMapping: 'uat-example',
        },
        prod: {
          exampleMapping: 'prod-example',
        },
      },
    });

    Tags.of(this).add('Environment', env);
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }

    // Add AWS resources here...
    new CfnOutput(this, 'CityAdminUserPoolId', {
      value: userPool.userPoolId,
      exportName: `${resourcePrefix}-CityAdminUserPoolId`,
      description: 'Cognito User Pool ID',
    });

    new CfnOutput(this, 'CityAdminUserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      exportName: `${resourcePrefix}-CityAdminUserPoolClientId`,
      description: 'Cognito User Pool Client ID for SPA',
    });

    new CfnOutput(this, 'CityAdminUserPoolDomain', {
      value: `https://${userPoolDomain.domainName}`,
      exportName: `${resourcePrefix}-CityAdminUserPoolDomain`,
      description: 'Cognito Hosted UI Domain',
    });

    new CfnOutput(this, 'OAuthCallbackUrl', {
      value: callbackUrl,
      description: 'OAuth Callback URL',
    });
  }
}
