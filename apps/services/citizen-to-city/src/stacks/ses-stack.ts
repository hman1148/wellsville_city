import { CfnOutput, Stack, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { SesStackProps } from '../models';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class SesStack extends Stack {
  readonly emailIdentityArn: string;
  readonly senderEmail: string;
  readonly configurationSet: ses.ConfigurationSet;

  constructor(scope: Construct, id: string, props?: SesStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';
    const sandbox = this.node.tryGetContext('sandbox') || '';
    const localMode = this.node.tryGetContext('localMode') || false;
    const sandboxSuffix = sandbox ? `-${sandbox}` : '';
    const resourcePrefix = `citizen-to-city${sandboxSuffix}`;

    // Configuration Set for tracking bounces, complaints, and delivery
    this.configurationSet = new ses.ConfigurationSet(this, 'EmailConfigurationSet', {
      configurationSetName: `${resourcePrefix}-email-config`,
      reputationMetrics: true,
      sendingEnabled: true,
    });

    // Set up email identity based on what's provided
    if (props?.domain && !localMode) {
      // Domain-based identity (recommended for production)
      const emailIdentity = new ses.EmailIdentity(this, 'DomainIdentity', {
        identity: ses.Identity.domain(props.domain),
        configurationSet: this.configurationSet,
      });

      this.emailIdentityArn = `arn:aws:ses:${this.region}:${this.account}:identity/${props.domain}`;
      this.senderEmail = props.senderEmail || `noreply@${props.domain}`;

      // If hosted zone is provided, create DNS records for DKIM verification
      if (props.hostedZoneId) {
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
          hostedZoneId: props.hostedZoneId,
          zoneName: props.domain,
        });

        // DKIM records are automatically created by SES EmailIdentity
        // but we output them for reference
        new CfnOutput(this, 'DkimRecordsNote', {
          value: 'DKIM records are managed automatically by SES EmailIdentity construct',
          description: 'DKIM DNS records for email authentication',
        });
      }

      new CfnOutput(this, 'DomainIdentityArn', {
        value: this.emailIdentityArn,
        exportName: `${resourcePrefix}-DomainIdentityArn`,
        description: 'SES Domain Identity ARN',
      });

      new CfnOutput(this, 'DomainVerificationStatus', {
        value: 'Check AWS Console for verification status',
        description: 'Domain verification must be completed in AWS Console',
      });
    } else if (props?.senderEmail) {
      // Email-based identity (for development/sandbox)
      const emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
        identity: ses.Identity.email(props.senderEmail),
        configurationSet: this.configurationSet,
      });

      this.emailIdentityArn = `arn:aws:ses:${this.region}:${this.account}:identity/${props.senderEmail}`;
      this.senderEmail = props.senderEmail;

      new CfnOutput(this, 'EmailIdentityArn', {
        value: this.emailIdentityArn,
        exportName: `${resourcePrefix}-EmailIdentityArn`,
        description: 'SES Email Identity ARN',
      });

      new CfnOutput(this, 'EmailVerificationNote', {
        value: `Verification email sent to ${props.senderEmail}. Check inbox and click verification link.`,
        description: 'Email verification instructions',
      });
    } else {
      // No identity configured - use placeholder for local development
      this.emailIdentityArn = `arn:aws:ses:${this.region}:${this.account}:identity/*`;
      this.senderEmail = 'noreply@example.com';

      new CfnOutput(this, 'SesConfigNote', {
        value: 'No email identity configured. Set domain or senderEmail prop for email functionality.',
        description: 'SES configuration note',
      });
    }

    // Output the sender email for use by other stacks
    new CfnOutput(this, 'SenderEmail', {
      value: this.senderEmail,
      exportName: `${resourcePrefix}-SenderEmail`,
      description: 'Verified sender email address',
    });

    new CfnOutput(this, 'ConfigurationSetName', {
      value: this.configurationSet.configurationSetName,
      exportName: `${resourcePrefix}-SesConfigurationSetName`,
      description: 'SES Configuration Set name for email tracking',
    });

    Tags.of(this).add('Environment', env);
    Tags.of(this).add('Service', 'citizen-to-city');
    if (sandbox) {
      Tags.of(this).add('Sandbox', sandbox);
    }
  }

  /**
   * Creates an IAM policy statement for sending emails via this SES identity.
   * Use this to grant Lambda functions permission to send emails.
   */
  grantSendEmail(grantee: iam.IGrantable): iam.Grant {
    return iam.Grant.addToPrincipal({
      grantee,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resourceArns: [this.emailIdentityArn],
    });
  }

  /**
   * Get an IAM policy statement for sending emails.
   * Useful for adding to Lambda function roles.
   */
  getSendEmailPolicyStatement(): iam.PolicyStatement {
    return new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: [this.emailIdentityArn],
    });
  }
}
