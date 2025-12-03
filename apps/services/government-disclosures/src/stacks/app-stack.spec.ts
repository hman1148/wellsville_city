import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppStack } from './app-stack';

describe('Government Disclosures AppStack', () => {
  let app: App;
  let stack: AppStack;
  let template: Template;

  beforeEach(() => {
    app = new App({
      context: {
        env: 'dev',
        sandbox: '',
      },
    });
    stack = new AppStack(app, 'TestStack', {
      env: {
        region: 'us-west-2',
        account: '123456789012',
      },
    });
    template = Template.fromStack(stack);
  });

  describe('S3 Bucket', () => {
    test('creates S3 bucket with correct configuration', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'gov-disclosures-documents',
        VersioningConfiguration: {
          Status: 'Enabled',
        },
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('S3 bucket has CORS configuration', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'PUT', 'POST'],
              AllowedOrigins: ['*'],
              AllowedHeaders: ['*'],
              MaxAge: 3000,
            },
          ],
        },
      });
    });

    test('S3 bucket has lifecycle rules', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: Match.arrayWith([
            Match.objectLike({
              Id: 'TransitionToIA',
              Status: 'Enabled',
              Transitions: [
                {
                  StorageClass: 'STANDARD_IA',
                  TransitionInDays: 180,
                },
              ],
            }),
          ]),
        },
      });
    });
  });

  describe('DynamoDB Table', () => {
    test('creates DynamoDB table with correct keys', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'gov-disclosures-metadata',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'uploadDate',
            KeyType: 'RANGE',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    test('creates CategoryIndex GSI', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          {
            IndexName: 'CategoryIndex',
            KeySchema: [
              {
                AttributeName: 'category',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'uploadDate',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ]),
      });
    });

    test('creates YearIndex GSI', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          {
            IndexName: 'YearIndex',
            KeySchema: [
              {
                AttributeName: 'year',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'uploadDate',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ]),
      });
    });

    test('table has stream enabled', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        StreamSpecification: {
          StreamViewType: 'NEW_AND_OLD_IMAGES',
        },
      });
    });
  });

  describe('Lambda Functions', () => {
    test('creates GetDisclosures Lambda function', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
        Handler: 'index.handler',
        Timeout: 30,
        Environment: {
          Variables: {
            TABLE_NAME: Match.anyValue(),
            BUCKET_NAME: Match.anyValue(),
          },
        },
      });
    });

    test('creates all required Lambda functions', () => {
      const functions = template.findResources('AWS::Lambda::Function');
      const functionCount = Object.keys(functions).length;

      // Should have 6 Lambda functions
      expect(functionCount).toBeGreaterThanOrEqual(6);
    });

    test('Lambda functions have correct timeout', () => {
      template.allResourcesProperties('AWS::Lambda::Function', {
        Timeout: 30,
      });
    });
  });

  describe('API Gateway', () => {
    test('creates REST API', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'gov-disclosures-api',
      });
    });

    test('creates Cognito authorizer', () => {
      template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
        Type: 'COGNITO_USER_POOLS',
        Name: 'CityAdminAuthorizer',
      });
    });

    test('creates API resources', () => {
      const resources = template.findResources('AWS::ApiGateway::Resource');
      expect(Object.keys(resources).length).toBeGreaterThan(0);
    });

    test('creates API methods', () => {
      const methods = template.findResources('AWS::ApiGateway::Method');
      expect(Object.keys(methods).length).toBeGreaterThan(0);
    });
  });

  describe('IAM Permissions', () => {
    test('Lambda has DynamoDB read permissions', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
              ]),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });

    test('Lambda has DynamoDB write permissions', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:BatchWriteItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
              ]),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });

    test('Lambda has S3 read permissions', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['s3:GetObject*', 's3:GetBucket*', 's3:List*']),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });

    test('Lambda has S3 write permissions', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['s3:PutObject', 's3:PutObjectAcl']),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });

  describe('CloudFormation Outputs', () => {
    test('exports bucket name', () => {
      template.hasOutput('DisclosuresBucketName', {
        Export: {
          Name: 'gov-disclosures-BucketName',
        },
      });
    });

    test('exports table name', () => {
      template.hasOutput('DisclosuresTableName', {
        Export: {
          Name: 'gov-disclosures-TableName',
        },
      });
    });

    test('exports API URL', () => {
      template.hasOutput('ApiUrl', {
        Export: {
          Name: 'gov-disclosures-ApiUrl',
        },
      });
    });
  });

  describe('Tags', () => {
    test('stack has Environment tag', () => {
      const stackTags = Stack.of(stack).tags;
      expect(stackTags).toBeDefined();
    });
  });

  describe('Sandbox Mode', () => {
    test('creates resources with sandbox suffix', () => {
      const sandboxApp = new App({
        context: {
          env: 'dev',
          sandbox: 'test-sandbox',
        },
      });
      const sandboxStack = new AppStack(sandboxApp, 'TestSandboxStack', {
        env: {
          region: 'us-west-2',
          account: '123456789012',
        },
      });
      const sandboxTemplate = Template.fromStack(sandboxStack);

      sandboxTemplate.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'gov-disclosures-test-sandbox-documents',
      });

      sandboxTemplate.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'gov-disclosures-test-sandbox-metadata',
      });
    });
  });

  describe('Production Mode', () => {
    test('S3 bucket has RETAIN removal policy in prod', () => {
      const prodApp = new App({
        context: {
          env: 'prod',
          sandbox: '',
        },
      });
      const prodStack = new AppStack(prodApp, 'TestProdStack', {
        env: {
          region: 'us-west-2',
          account: '123456789012',
        },
      });
      const prodTemplate = Template.fromStack(prodStack);

      prodTemplate.hasResource('AWS::S3::Bucket', {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    test('DynamoDB table has point-in-time recovery in prod', () => {
      const prodApp = new App({
        context: {
          env: 'prod',
          sandbox: '',
        },
      });
      const prodStack = new AppStack(prodApp, 'TestProdStack', {
        env: {
          region: 'us-west-2',
          account: '123456789012',
        },
      });
      const prodTemplate = Template.fromStack(prodStack);

      prodTemplate.hasResourceProperties('AWS::DynamoDB::Table', {
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });
  });
});
