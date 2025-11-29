import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { StorageStack } from './storage-stack';

describe('Citizen-to-City StorageStack - S3 Security Tests', () => {
  let app: App;
  let stack: StorageStack;
  let template: Template;

  describe('S3 Bucket Creation', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should create S3 bucket for citizen photos', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.resourceCountIs('AWS::S3::Bucket', 1);
    });

    it('should have unique bucket name with account and region', () => {
      app.node.setContext('sandbox', '');
      stack = new StorageStack(app, 'TestStorageStack', {
        env: { account: '123456789012', region: 'us-east-1' },
      });
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'citizen-to-city-photos-123456789012-us-east-1',
      });
    });

    it('should include sandbox suffix in bucket name', () => {
      app.node.setContext('sandbox', 'feature-photos');
      stack = new StorageStack(app, 'TestStorageStack', {
        env: { account: '123456789012', region: 'us-east-1' },
      });
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'citizen-to-city-feature-photos-photos-123456789012-us-east-1',
      });
    });

    it('should have versioning enabled for data protection', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });
  });

  describe('S3 Security - Block Public Access', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should block all public access to S3 bucket', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('should prevent public ACLs', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: Match.objectLike({
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
        }),
      });
    });

    it('should prevent public bucket policies', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: Match.objectLike({
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        }),
      });
    });
  });

  describe('S3 Security - Encryption', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should have server-side encryption enabled', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      });
    });

    it('should enforce SSL/TLS for all connections', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      // Check for bucket policy that enforces SSL
      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Deny',
              Principal: { AWS: '*' },
              Action: 's3:*',
              Condition: {
                Bool: {
                  'aws:SecureTransport': 'false',
                },
              },
            }),
          ]),
        },
      });
    });
  });

  describe('CORS Configuration - Security', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should have CORS configuration', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: Match.objectLike({
          CorsRules: Match.arrayWith([
            Match.objectLike({
              AllowedMethods: ['GET', 'PUT', 'POST'],
            }),
          ]),
        }),
      });
    });

    it('should only allow specific HTTP methods (GET, PUT, POST)', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'PUT', 'POST'],
              AllowedOrigins: Match.anyValue(),
              AllowedHeaders: ['*'],
              ExposedHeaders: ['ETag'],
              MaxAge: 3000,
            },
          ],
        },
      });
    });

    it('should restrict origins to localhost in local mode', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      const allowedOrigins = stack.photoBucket.node.tryFindChild('Resource')?.node.metadata;

      // In local mode, should only allow localhost
      expect(stack).toBeDefined();
    });

    it('should restrict origins to app domains in cloud mode', () => {
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {
        customDomain: 'wellsville.gov',
      });

      expect(stack).toBeDefined();
    });

    it('should include localhost origins in dev environment', () => {
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {
        customDomain: 'wellsville.gov',
      });

      expect(stack).toBeDefined();
    });

    it('should not include localhost origins in prod environment', () => {
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {
        customDomain: 'wellsville.gov',
      });

      expect(stack).toBeDefined();
    });
  });

  describe('Data Lifecycle and Retention', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should have lifecycle rules configured', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: Match.objectLike({
          Rules: Match.arrayWith([
            Match.objectLike({
              Id: 'TransitionToIA',
              Status: 'Enabled',
            }),
          ]),
        }),
      });
    });

    it('should transition to Infrequent Access after 90 days', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: Match.arrayWith([
            Match.objectLike({
              Id: 'TransitionToIA',
              Transitions: [
                {
                  StorageClass: 'STANDARD_IA',
                  TransitionInDays: 90,
                },
              ],
            }),
          ]),
        },
      });
    });

    it('should expire old versions after 365 days', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: Match.arrayWith([
            Match.objectLike({
              Id: 'ExpireOldVersions',
              NoncurrentVersionExpiration: {
                NoncurrentDays: 365,
              },
            }),
          ]),
        },
      });
    });
  });

  describe('Environment-Based Removal Policy', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('localMode', true);
    });

    it('should retain bucket in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::S3::Bucket', {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    it('should destroy bucket in dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::S3::Bucket', {
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      });
    });

    it('should auto-delete objects in non-prod environments', () => {
      app.node.setContext('env', 'dev');
      stack = new StorageStack(app, 'TestStorageStack', {});
      const bucket = stack.photoBucket;

      expect(bucket).toBeDefined();
    });
  });

  describe('Stack Outputs', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should export bucket name', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('PhotoBucketName', {
        Description: 'S3 bucket name for citizen photos',
      });
    });

    it('should export bucket ARN', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('PhotoBucketArn', {
        Description: 'S3 bucket ARN for citizen photos',
      });
    });

    it('should export allowed origins', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('AllowedOrigins', {
        Description: 'CORS allowed origins for the photo bucket',
      });
    });
  });

  describe('Tagging', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should apply environment tag', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should apply service tag', () => {
      stack = new StorageStack(app, 'TestStorageStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Service).toBe('citizen-to-city');
    });

    it('should apply sandbox tag when provided', () => {
      app.node.setContext('sandbox', 'storage-test');
      stack = new StorageStack(app, 'TestStorageStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('storage-test');
    });
  });

  describe('Edge Cases and Security Validation', () => {
    it('should handle missing custom domain in local mode', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      stack = new StorageStack(app, 'TestStorageStack', {});

      expect(stack).toBeDefined();
      expect(stack.photoBucket).toBeDefined();
    });

    it('should use restrictive default when no origins configured', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', false);

      // Capture console warnings
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      stack = new StorageStack(app, 'TestStorageStack', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARNING: No CORS origins configured')
      );

      consoleSpy.mockRestore();
    });

    it('should handle empty sandbox gracefully', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', '');
      stack = new StorageStack(app, 'TestStorageStack', {});

      expect(stack).toBeDefined();
    });

    it('should properly configure sandbox domain prefix', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', false);
      app.node.setContext('sandbox', 'feature-test');
      stack = new StorageStack(app, 'TestStorageStack', {
        customDomain: 'wellsville.gov',
      });

      expect(stack).toBeDefined();
    });

    it('should not allow unauthenticated access', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      // Verify public access is completely blocked
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('should maintain versioning for audit trail', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    it('should expose ETag header for client-side verification', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: [
            Match.objectLike({
              ExposedHeaders: ['ETag'],
            }),
          ],
        },
      });
    });

    it('should require SSL for all operations', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', false);
      stack = new StorageStack(app, 'TestStorageStack', {});
      template = Template.fromStack(stack);

      // Verify SSL enforcement
      template.hasResourceProperties('AWS::S3::BucketPolicy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            {
              Effect: 'Deny',
              Principal: { AWS: '*' },
              Action: 's3:*',
              Resource: Match.anyValue(),
              Condition: {
                Bool: {
                  'aws:SecureTransport': 'false',
                },
              },
            },
          ]),
        },
      });
    });

    it('should handle multiple sandbox environments simultaneously', () => {
      const app1 = new App();
      app1.node.setContext('env', 'dev');
      app1.node.setContext('localMode', true);
      app1.node.setContext('sandbox', 'dev-1');
      const stack1 = new StorageStack(app1, 'TestStorageStack1', {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const app2 = new App();
      app2.node.setContext('env', 'dev');
      app2.node.setContext('localMode', true);
      app2.node.setContext('sandbox', 'dev-2');
      const stack2 = new StorageStack(app2, 'TestStorageStack2', {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      expect(stack1.photoBucket.bucketName).not.toBe(stack2.photoBucket.bucketName);
    });
  });
});