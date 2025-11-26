import * as cdk from 'aws-cdk-lib/core';
import { Fn } from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { StorageStack } from './stacks/storage-stack';
import { DatabaseStack } from './stacks/database-stack';
import { PinpointStack } from './stacks/pinpoint-stack';
import { NotificationStack } from './stacks/notification-stack';
import { ApiStack } from './stacks/api-stack';
import { LambdaStack } from './stacks/lambda-stack';
import { SesStack } from './stacks/ses-stack';

const app = new cdk.App();

// Get context variables
const sandbox = app.node.tryGetContext('sandbox') || '';
const environment = app.node.tryGetContext('env') || 'dev';
const localMode = app.node.tryGetContext('localMode') || false;
const stackSuffix = sandbox ? `-${sandbox}` : '';
const sandboxSuffix = sandbox ? `-${sandbox}` : '';

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const description = (name: string) =>
  sandbox ? `${name} (sandbox: ${sandbox})` : name;

// Try to get domain from framework networking stack (if deployed)
// This allows CORS to be restricted to your actual domain
const domainName = localMode
  ? undefined
  : Fn.importValue(`service-framework-networking${sandboxSuffix}-DomainName`);

// SES Stack - Email infrastructure for notifications
// Configure with your domain for production, or sender email for development
const sesStack = new SesStack(app, `citizen-to-city-ses${stackSuffix}`, {
  env,
  description: description('CitizenToCity-SES'),
  // For production, set these values:
  // domain: 'wellsville.gov',
  // hostedZoneId: 'Z1234567890ABC',
  // For development/sandbox, use email verification:
  senderEmail: environment === 'prod' ? undefined : 'admin@wellsville.gov', // Replace with your email
});

// Storage Stack - S3 bucket for citizen photos
const storageStack = new StorageStack(app, `citizen-to-city-storage${stackSuffix}`, {
  env,
  description: description('CitizenToCity-Storage'),
  // Pass domain for CORS configuration - only authenticated apps can access
  customDomain: localMode ? undefined : domainName?.toString(),
});

// Database Stack - DynamoDB for reports
const databaseStack = new DatabaseStack(app, `citizen-to-city-database${stackSuffix}`, {
  env,
  description: description('CitizenToCity-Database'),
});

// Notification Stack - SNS for admin alerts
const notificationStack = new NotificationStack(app, `citizen-to-city-notification${stackSuffix}`, {
  env,
  description: description('CitizenToCity-Notification'),
});

// Import Cognito User Pool ARN from authentication stack (for listing admin users)
const cognitoUserPoolArn = localMode
  ? undefined
  : `arn:aws:cognito-idp:${env.region}:${env.account}:userpool/${Fn.importValue(`portal${sandboxSuffix}-CityAdminUserPoolId`)}`;

// Lambda Stack - All Lambda functions
// Note: Pinpoint App ID will be passed from Pinpoint stack (CDK handles circular dependency)
const lambdaStack = new LambdaStack(app, `citizen-to-city-lambda${stackSuffix}`, {
  env,
  description: description('CitizenToCity-Lambda'),
  photoBucket: storageStack.photoBucket,
  reportsTable: databaseStack.reportsTable,
  citizensTable: databaseStack.citizensTable,
  adminNotificationTopic: notificationStack.adminNotificationTopic,
  sesEmailIdentityArn: sesStack.emailIdentityArn,
  senderEmail: sesStack.senderEmail,
  cognitoUserPoolArn,
  // Pinpoint App ID will be set via environment variable or passed dynamically
});

// Pinpoint Stack - SMS messaging
const pinpointStack = new PinpointStack(app, `citizen-to-city-pinpoint${stackSuffix}`, {
  env,
  description: description('CitizenToCity-Pinpoint'),
  incomingSmsHandler: lambdaStack.incomingSmsHandler,
});

// Update Lambda environment variables with Pinpoint App ID
lambdaStack.sendMassSmsHandler.addEnvironment('PINPOINT_APP_ID', pinpointStack.pinpointApp.ref);
lambdaStack.sendTargetedSmsHandler.addEnvironment('PINPOINT_APP_ID', pinpointStack.pinpointApp.ref);

// Grant Pinpoint SMS permissions to messaging handlers
const pinpointSmsPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'mobiletargeting:SendMessages',
    'mobiletargeting:SendUsersMessages',
  ],
  resources: [
    `arn:aws:mobiletargeting:${env.region}:${env.account}:apps/${pinpointStack.pinpointApp.ref}`,
    `arn:aws:mobiletargeting:${env.region}:${env.account}:apps/${pinpointStack.pinpointApp.ref}/*`,
  ],
});
lambdaStack.sendMassSmsHandler.addToRolePolicy(pinpointSmsPolicy);
lambdaStack.sendTargetedSmsHandler.addToRolePolicy(pinpointSmsPolicy);

// API Stack - REST API for dashboard
new ApiStack(app, `citizen-to-city-api${stackSuffix}`, {
  env,
  description: description('CitizenToCity-API'),
  reportsTable: databaseStack.reportsTable,
  citizensTable: databaseStack.citizensTable,
  photoBucket: storageStack.photoBucket,
  sendMassSmsHandler: lambdaStack.sendMassSmsHandler,
  sendTargetedSmsHandler: lambdaStack.sendTargetedSmsHandler,
  addCitizenHandler: lambdaStack.addCitizenHandler,
  listCitizensHandler: lambdaStack.listCitizensHandler,
  removeCitizenHandler: lambdaStack.removeCitizenHandler,
  getCitizenHandler: lambdaStack.getCitizenHandler,
});
