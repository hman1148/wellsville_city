import * as cdk from 'aws-cdk-lib/core';
import { ApiStack } from './stacks/api-stack';
import { AppStack } from './stacks/app-stack';

const app = new cdk.App();

// Get sandbox from context to partition stacks
const sandbox = app.node.tryGetContext('sandbox') || '';
const stackSuffix = sandbox ? `-${sandbox}` : '';

const commonStackProps = {
	env: {
		region: process.env.CDK_DEFAULT_REGION,
		account: process.env.CDK_DEFAULT_ACCOUNT,
	},
};

// Storage stack - creates the S3 bucket for city documents
const storageStack = new AppStack(app, `services-upload-service${stackSuffix}`, {
	...commonStackProps,
	description: sandbox ? `ServicesUploadService Storage (sandbox: ${sandbox})` : 'ServicesUploadService Storage',
});

// API stack - creates the API Gateway with Cognito authorization
const apiStack = new ApiStack(app, `services-upload-service-api${stackSuffix}`, {
	...commonStackProps,
	description: sandbox ? `ServicesUploadService API (sandbox: ${sandbox})` : 'ServicesUploadService API',
	documentBucket: storageStack.cityDocumentsBucket,
});

// Ensure API stack is deployed after storage stack
apiStack.addDependency(storageStack);

