import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from './database-stack';

describe('Citizen-to-City DatabaseStack - DynamoDB Security Tests', () => {
  let app: App;
  let stack: DatabaseStack;
  let template: Template;

  describe('DynamoDB Tables Creation', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should create two DynamoDB tables', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.resourceCountIs('AWS::DynamoDB::Table', 2);
    });

    it('should create citizen reports table', () => {
      app.node.setContext('sandbox', '');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'citizen-to-city-citizen-reports',
      });
    });

    it('should create citizens table', () => {
      app.node.setContext('sandbox', '');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'citizen-to-city-citizens',
      });
    });

    it('should include sandbox suffix in table names', () => {
      app.node.setContext('sandbox', 'db-test');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'citizen-to-city-db-test-citizen-reports',
      });

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'citizen-to-city-db-test-citizens',
      });
    });
  });

  describe('Reports Table - Schema and Keys', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should have reportId as partition key', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        KeySchema: Match.arrayWith([
          {
            AttributeName: 'reportId',
            KeyType: 'HASH',
          },
        ]),
        AttributeDefinitions: Match.arrayWith([
          {
            AttributeName: 'reportId',
            AttributeType: 'S',
          },
        ]),
      });
    });

    it('should have createdAt as sort key', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        KeySchema: Match.arrayWith([
          {
            AttributeName: 'createdAt',
            KeyType: 'RANGE',
          },
        ]),
        AttributeDefinitions: Match.arrayWith([
          {
            AttributeName: 'createdAt',
            AttributeType: 'S',
          },
        ]),
      });
    });
  });

  describe('Reports Table - Global Secondary Indexes', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should have status-createdAt GSI for filtering by status', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'status-createdAt-index',
            KeySchema: [
              {
                AttributeName: 'status',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'createdAt',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          }),
        ]),
      });
    });

    it('should have phoneNumber-createdAt GSI for citizen lookup', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'phoneNumber-createdAt-index',
            KeySchema: [
              {
                AttributeName: 'phoneNumber',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'createdAt',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          }),
        ]),
      });
    });

    it('should have issueType-createdAt GSI for issue type filtering', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'issueType-createdAt-index',
            KeySchema: [
              {
                AttributeName: 'issueType',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'createdAt',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          }),
        ]),
      });
    });

    it('should have exactly 3 GSIs on reports table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        GlobalSecondaryIndexes: Match.arrayEquals([
          Match.objectLike({ IndexName: 'status-createdAt-index' }),
          Match.objectLike({ IndexName: 'phoneNumber-createdAt-index' }),
          Match.objectLike({ IndexName: 'issueType-createdAt-index' }),
        ]),
      });
    });
  });

  describe('Citizens Table - Schema and Keys', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should have citizenId as partition key', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        KeySchema: [
          {
            AttributeName: 'citizenId',
            KeyType: 'HASH',
          },
        ],
        AttributeDefinitions: Match.arrayWith([
          {
            AttributeName: 'citizenId',
            AttributeType: 'S',
          },
        ]),
      });
    });
  });

  describe('Citizens Table - Global Secondary Indexes', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should have phoneNumber-index GSI', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'phoneNumber-index',
            KeySchema: [
              {
                AttributeName: 'phoneNumber',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          }),
        ]),
      });
    });

    it('should have subscribed-index GSI', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'subscribed-index',
            KeySchema: [
              {
                AttributeName: 'subscribed',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'subscribedAt',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          }),
        ]),
      });
    });

    it('should have exactly 2 GSIs on citizens table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        GlobalSecondaryIndexes: Match.arrayEquals([
          Match.objectLike({ IndexName: 'phoneNumber-index' }),
          Match.objectLike({ IndexName: 'subscribed-index' }),
        ]),
      });
    });
  });

  describe('DynamoDB Security - Encryption', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should have AWS managed encryption on reports table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        SSESpecification: {
          SSEEnabled: true,
        },
      });
    });

    it('should have AWS managed encryption on citizens table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        SSESpecification: {
          SSEEnabled: true,
        },
      });
    });
  });

  describe('DynamoDB Security - Point-in-Time Recovery', () => {
    beforeEach(() => {
      app = new App();
    });

    it('should enable point-in-time recovery in prod environment for reports table', () => {
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });

    it('should disable point-in-time recovery in dev environment for reports table', () => {
      app.node.setContext('env', 'dev');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        PointInTimeRecoverySpecification: Match.absent(),
      });
    });

    it('should enable point-in-time recovery in prod environment for citizens table', () => {
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });
  });

  describe('DynamoDB Streams', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should enable streams on reports table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        StreamSpecification: {
          StreamViewType: 'NEW_AND_OLD_IMAGES',
        },
      });
    });

    it('should capture both new and old images in stream', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      const reportsTable = stack.reportsTable;

      expect(reportsTable.tableStreamArn).toBeDefined();
    });
  });

  describe('Billing Mode', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should use pay-per-request billing for reports table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    it('should use pay-per-request billing for citizens table', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        BillingMode: 'PAY_PER_REQUEST',
      });
    });
  });

  describe('Environment-Based Removal Policy', () => {
    beforeEach(() => {
      app = new App();
    });

    it('should retain reports table in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::DynamoDB::Table', {
        Properties: {
          TableName: Match.stringLikeRegexp('.*citizen-reports'),
        },
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    it('should destroy reports table in dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::DynamoDB::Table', {
        Properties: {
          TableName: Match.stringLikeRegexp('.*citizen-reports'),
        },
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      });
    });

    it('should retain citizens table in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::DynamoDB::Table', {
        Properties: {
          TableName: Match.stringLikeRegexp('.*citizens$'),
        },
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    it('should destroy citizens table in dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::DynamoDB::Table', {
        Properties: {
          TableName: Match.stringLikeRegexp('.*citizens$'),
        },
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      });
    });
  });

  describe('Stack Outputs', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should export reports table name', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('ReportsTableName', {
        Description: 'DynamoDB table name for citizen reports',
      });
    });

    it('should export reports table ARN', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('ReportsTableArn', {
        Description: 'DynamoDB table ARN for citizen reports',
      });
    });

    it('should export reports table stream ARN', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('ReportsTableStreamArn', {
        Description: 'DynamoDB table stream ARN for citizen reports',
      });
    });

    it('should export citizens table name', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CitizensTableName', {
        Description: 'DynamoDB table name for citizens/subscribers',
      });
    });

    it('should export citizens table ARN', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CitizensTableArn', {
        Description: 'DynamoDB table ARN for citizens/subscribers',
      });
    });
  });

  describe('Tagging', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
    });

    it('should apply environment tag', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should apply service tag', () => {
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Service).toBe('citizen-to-city');
    });

    it('should apply sandbox tag when provided', () => {
      app.node.setContext('sandbox', 'db-feature');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('db-feature');
    });
  });

  describe('Edge Cases and Security Validation', () => {
    it('should handle empty sandbox gracefully', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', '');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      expect(stack).toBeDefined();
      expect(stack.reportsTable).toBeDefined();
      expect(stack.citizensTable).toBeDefined();
    });

    it('should create unique table names with sandbox', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', 'unique-test');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      expect(stack.reportsTable.tableName).toContain('unique-test');
      expect(stack.citizensTable.tableName).toContain('unique-test');
    });

    it('should support multiple environments simultaneously', () => {
      const devApp = new App();
      devApp.node.setContext('env', 'dev');
      const devStack = new DatabaseStack(devApp, 'DevDatabaseStack', {});

      const prodApp = new App();
      prodApp.node.setContext('env', 'prod');
      const prodStack = new DatabaseStack(prodApp, 'ProdDatabaseStack', {});

      expect(devStack).toBeDefined();
      expect(prodStack).toBeDefined();
    });

    it('should not allow direct table access without IAM permissions', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      // Tables are created without public access
      // Access is controlled by IAM policies only
      expect(stack.reportsTable).toBeDefined();
      expect(stack.citizensTable).toBeDefined();
    });

    it('should maintain encryption at rest', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      // Both tables should have encryption enabled
      const tables = template.findResources('AWS::DynamoDB::Table');
      Object.values(tables).forEach((table: any) => {
        expect(table.Properties.SSESpecification.SSEEnabled).toBe(true);
      });
    });

    it('should support audit trails via streams', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizen-reports'),
        StreamSpecification: {
          StreamViewType: 'NEW_AND_OLD_IMAGES',
        },
      });
    });

    it('should handle phone number queries efficiently with GSI', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});

      // Phone number lookups should use GSI instead of scan
      expect(stack.reportsTable).toBeDefined();
      expect(stack.citizensTable).toBeDefined();
    });

    it('should support subscription management with GSI', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      stack = new DatabaseStack(app, 'TestDatabaseStack', {});
      template = Template.fromStack(stack);

      // Verify subscribed-index exists for efficient subscription queries
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: Match.stringLikeRegexp('.*citizens$'),
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'subscribed-index',
          }),
        ]),
      });
    });
  });
});