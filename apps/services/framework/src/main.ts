import * as cdk from 'aws-cdk-lib/core';
import { CertificateStack } from './stacks/CertificateStack';
import { NetworkingStack } from './stacks/NetworkingStack';
import { SecurityStack } from './stacks/SecurityStack';
import { DataStack } from './stacks/DataStack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const defaultRegion = process.env.CDK_DEFAULT_REGION;

// Get sandbox and localMode from context
const sandbox = app.node.tryGetContext('sandbox') || '';
const localMode = app.node.tryGetContext('localMode') || false;
const stackSuffix = sandbox ? `-${sandbox}` : '';

// For local mode, skip Route53/Certificate stacks
// These require Route53 hosted zones and domain configuration
if (!localMode) {
  // Create certificate stack in us-east-1 for CloudFront
  const certificateStack = new CertificateStack(app, `service-framework-certificate${stackSuffix}`, {
    env: { region: 'us-east-1', account },
    crossRegionReferences: true,
    description: `ACM certificates for CloudFront. Must be in us-east-1${sandbox ? ` (sandbox: ${sandbox})` : ''}`,
  });

  // Create main application stack in the default region
  const networkingStack = new NetworkingStack(app, `service-framework-networking${stackSuffix}`, {
    env: { region: defaultRegion, account },
    crossRegionReferences: true,
    cloudFrontCertificateArn: certificateStack.wildCertificateArn,
    description: `Main networking infrastructure${sandbox ? ` (sandbox: ${sandbox})` : ''}`,
  });

  // Ensure certificate stack is deployed before networking stack
  networkingStack.addDependency(certificateStack);
}

// Security and Data stacks - these work in both local and cloud mode
// Currently they're mostly placeholders, but they don't require Route53
new SecurityStack(app, `service-framework-security${stackSuffix}`, {
  env: { region: defaultRegion, account },
  description: `Main security infrastructure${sandbox ? ` (sandbox: ${sandbox})` : ''}`,
});

new DataStack(app, `service-framework-data${stackSuffix}`, {
  env: { region: defaultRegion, account },
  description: `Main data infrastructure${sandbox ? ` (sandbox: ${sandbox})` : ''}`,
});
