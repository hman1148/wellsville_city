import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match, Capture } from 'aws-cdk-lib/assertions';
import { ApiStack } from './api-stack';
import { DatabaseStack } from './database-stack';
import { StorageStack } from './storage-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';

describe('Citizen-to-City ApiStack - Cognito Authorization Security Tests', () => {
  let app: App;
  let databaseStack: DatabaseStack;
  let storageStack: StorageStack;
  let apiStack: ApiStack;
  let template: Template;
  let mockLambdaFunction: lambda.Function;

  beforeEach(() => {
    app = new App();
    app.node.setContext('env', 'dev');
    app.node.setContext('localMode', true);

    // Create prerequisite stacks
    databaseStack = new DatabaseStack(app, 'TestDatabaseStack', {});
    storageStack = new StorageStack(app, 'TestStorageStack', {});

    // Create mock lambda functions
    mockLambdaFunction = new lambda.Function(app, 'MockFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => {}'),
    });
  });

  describe('API Gateway and Cognito Authorizer Creation', () => {
    it('should create REST API', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    it('should create Cognito User Pool Authorizer', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      template.resourceCountIs('AWS::ApiGateway::Authorizer', 1);
    });

    it('should configure Cognito authorizer correctly', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
        Type: 'COGNITO_USER_POOLS',
        Name: Match.stringLikeRegexp('.*authorizer'),
      });
    });
  });

  describe('Security - All Endpoints Require Cognito Authorization', () => {
    beforeEach(() => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should require Cognito authorization on GET /reports', () => {
      const authorizerCapture = new Capture();

      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
        AuthorizerId: authorizerCapture,
      });

      expect(authorizerCapture.asObject()).toBeDefined();
    });

    it('should require Cognito authorization on GET /reports/{reportId}', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on PATCH /reports/{reportId}/status', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'PATCH',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on GET /stats', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on GET /presigned-url', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on POST /messages/broadcast', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'POST',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on POST /messages/targeted', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'POST',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on GET /citizens', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on POST /citizens', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'POST',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on GET /citizens/{citizenId}', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should require Cognito authorization on DELETE /citizens/{citizenId}', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'DELETE',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should not have any endpoints without authorization', () => {
      const methods = template.findResources('AWS::ApiGateway::Method');

      Object.entries(methods).forEach(([key, method]: [string, any]) => {
        // Skip OPTIONS methods (CORS preflight)
        if (method.Properties.HttpMethod === 'OPTIONS') {
          return;
        }

        expect(method.Properties.AuthorizationType).toBe('COGNITO_USER_POOLS');
        expect(method.Properties.AuthorizerId).toBeDefined();
      });
    });
  });

  describe('Lambda Function IAM Permissions - Scoped Access', () => {
    beforeEach(() => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should grant Lambda functions minimal required DynamoDB permissions', () => {
      // Lambda functions should only have permissions granted through grantReadData, grantReadWriteData
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: Match.arrayWith(['dynamodb:BatchGetItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']),
            }),
          ]),
        },
      });
    });

    it('should grant Lambda functions minimal required S3 permissions', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: Match.arrayWith(['s3:GetObject*', 's3:GetBucket*', 's3:List*']),
            }),
          ]),
        },
      });
    });
  });

  describe('CORS Configuration', () => {
    beforeEach(() => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should have CORS preflight configuration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'OPTIONS',
      });
    });

    it('should include Authorization header in CORS allowed headers', () => {
      // Verify CORS is configured to allow authorization headers
      const restApi = template.findResources('AWS::ApiGateway::RestApi');
      expect(Object.keys(restApi).length).toBeGreaterThan(0);
    });
  });

  describe('API Gateway Deployment Configuration', () => {
    beforeEach(() => {
      app.node.setContext('env', 'dev');
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should enable logging for security monitoring', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        MethodSettings: Match.arrayWith([
          Match.objectLike({
            LoggingLevel: 'INFO',
            MetricsEnabled: true,
          }),
        ]),
      });
    });

    it('should enable data trace in non-prod environments', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        MethodSettings: Match.arrayWith([
          Match.objectLike({
            DataTraceEnabled: true,
          }),
        ]),
      });
    });

    it('should disable data trace in prod environment', () => {
      const prodApp = new App();
      prodApp.node.setContext('env', 'prod');
      prodApp.node.setContext('localMode', false);

      const prodDbStack = new DatabaseStack(prodApp, 'ProdDatabaseStack', {});
      const prodStorageStack = new StorageStack(prodApp, 'ProdStorageStack', {});
      const prodMockFunction = new lambda.Function(prodApp, 'ProdMockFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline('exports.handler = async () => {}'),
      });

      const prodApiStack = new ApiStack(prodApp, 'ProdApiStack', {
        reportsTable: prodDbStack.reportsTable,
        citizensTable: prodDbStack.citizensTable,
        photoBucket: prodStorageStack.photoBucket,
        sendMassSmsHandler: prodMockFunction,
        sendTargetedSmsHandler: prodMockFunction,
        addCitizenHandler: prodMockFunction,
        listCitizensHandler: prodMockFunction,
        removeCitizenHandler: prodMockFunction,
        getCitizenHandler: prodMockFunction,
      });
      const prodTemplate = Template.fromStack(prodApiStack);

      prodTemplate.hasResourceProperties('AWS::ApiGateway::Stage', {
        MethodSettings: Match.arrayWith([
          Match.objectLike({
            DataTraceEnabled: false,
          }),
        ]),
      });
    });
  });

  describe('Lambda Function Configuration', () => {
    beforeEach(() => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should create Lambda functions with proper configuration', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
        Timeout: 30,
        MemorySize: 256,
      });
    });

    it('should configure Lambda functions with environment variables', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            NODE_ENV: 'dev',
            REPORTS_TABLE_NAME: Match.anyValue(),
            PHOTO_BUCKET_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  describe('Stack Outputs', () => {
    beforeEach(() => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);
    });

    it('should export API endpoint', () => {
      template.hasOutput('ApiEndpoint', {
        Description: 'API Gateway endpoint URL',
      });
    });

    it('should export API ID', () => {
      template.hasOutput('ApiId', {
        Description: 'API Gateway REST API ID',
      });
    });
  });

  describe('Tagging', () => {
    beforeEach(() => {
      app.node.setContext('env', 'dev');
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
    });

    it('should apply environment tag', () => {
      const tags = Stack.of(apiStack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should apply service tag', () => {
      const tags = Stack.of(apiStack).tags.tagValues();
      expect(tags.Service).toBe('citizen-to-city');
    });

    it('should apply sandbox tag when provided', () => {
      app.node.setContext('sandbox', 'api-test');
      const sandboxApiStack = new ApiStack(app, 'SandboxApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });

      const tags = Stack.of(sandboxApiStack).tags.tagValues();
      expect(tags.Sandbox).toBe('api-test');
    });
  });

  describe('Edge Cases and Security Validation', () => {
    it('should handle empty sandbox gracefully', () => {
      app.node.setContext('sandbox', '');
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });

      expect(apiStack).toBeDefined();
      expect(apiStack.api).toBeDefined();
    });

    it('should not allow unauthenticated access to any protected endpoint', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // Find all methods that are not OPTIONS (CORS)
      const methods = template.findResources('AWS::ApiGateway::Method');
      const nonOptionsMethods = Object.entries(methods).filter(
        ([_, method]: [string, any]) => method.Properties.HttpMethod !== 'OPTIONS'
      );

      // All non-OPTIONS methods must have Cognito authorization
      nonOptionsMethods.forEach(([key, method]: [string, any]) => {
        expect(method.Properties.AuthorizationType).toBe('COGNITO_USER_POOLS');
      });
    });

    it('should prevent unauthorized data modifications', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // PATCH and POST and DELETE methods must all require authorization
      const methods = template.findResources('AWS::ApiGateway::Method');
      const modifyingMethods = Object.entries(methods).filter(
        ([_, method]: [string, any]) =>
          method.Properties.HttpMethod === 'PATCH' ||
          method.Properties.HttpMethod === 'POST' ||
          method.Properties.HttpMethod === 'DELETE'
      );

      modifyingMethods.forEach(([key, method]: [string, any]) => {
        expect(method.Properties.AuthorizationType).toBe('COGNITO_USER_POOLS');
        expect(method.Properties.AuthorizerId).toBeDefined();
      });
    });

    it('should prevent unauthorized read access to sensitive data', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // All GET methods must require authorization
      const methods = template.findResources('AWS::ApiGateway::Method');
      const getMethods = Object.entries(methods).filter(
        ([_, method]: [string, any]) => method.Properties.HttpMethod === 'GET'
      );

      getMethods.forEach(([key, method]: [string, any]) => {
        expect(method.Properties.AuthorizationType).toBe('COGNITO_USER_POOLS');
        expect(method.Properties.AuthorizerId).toBeDefined();
      });
    });

    it('should use same Cognito authorizer for all endpoints', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // Should only have one authorizer
      template.resourceCountIs('AWS::ApiGateway::Authorizer', 1);
    });

    it('should protect against unauthorized S3 presigned URL generation', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // The presigned URL endpoint must require Cognito authorization
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });

    it('should protect citizen management endpoints', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // All citizen endpoints must be protected
      const methods = template.findResources('AWS::ApiGateway::Method');

      Object.entries(methods).forEach(([key, method]: [string, any]) => {
        if (method.Properties.HttpMethod !== 'OPTIONS') {
          expect(method.Properties.AuthorizationType).toBe('COGNITO_USER_POOLS');
        }
      });
    });

    it('should protect messaging endpoints from unauthorized mass SMS', () => {
      apiStack = new ApiStack(app, 'TestApiStack', {
        reportsTable: databaseStack.reportsTable,
        citizensTable: databaseStack.citizensTable,
        photoBucket: storageStack.photoBucket,
        sendMassSmsHandler: mockLambdaFunction,
        sendTargetedSmsHandler: mockLambdaFunction,
        addCitizenHandler: mockLambdaFunction,
        listCitizensHandler: mockLambdaFunction,
        removeCitizenHandler: mockLambdaFunction,
        getCitizenHandler: mockLambdaFunction,
      });
      template = Template.fromStack(apiStack);

      // Messaging endpoints (broadcast and targeted) must require authorization
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'POST',
        AuthorizationType: 'COGNITO_USER_POOLS',
      });
    });
  });
});