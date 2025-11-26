import * as cdk from 'aws-cdk-lib/core';
import { AppStack } from './stacks/app-stack';

const app = new cdk.App();

// Get sandbox from context to partition stacks
const sandbox = app.node.tryGetContext('sandbox') || '';
const stackSuffix = sandbox ? `-${sandbox}` : '';

new AppStack(app, `services-public-reservations${stackSuffix}`, {
	env: {
		region: process.env.CDK_DEFAULT_REGION,
		account: process.env.CDK_DEFAULT_ACCOUNT,
	},
	description: sandbox
		? `ServicesPublicReservations (sandbox: ${sandbox})`
		: 'ServicesPublicReservations',
});
