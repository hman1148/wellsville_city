import * as cdk from 'aws-cdk-lib/core';
import { AppStack } from './stacks/app-stack';

const app = new cdk.App();

const sandbox = app.node.tryGetContext('sandbox') || '';
const stackSuffix = sandbox ? `-${sandbox}` : '';

const commonStackProps = {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
};

new AppStack(
  app,
  `services-government-disclosures${stackSuffix}`,
  {
    ...commonStackProps,
    description: sandbox
      ? `Government Disclosures Service (sandbox: ${sandbox})`
      : 'Government Disclosures Service',
  }
);
