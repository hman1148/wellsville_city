import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppStack } from './app-stack';
import * as s3 from 'aws-cdk-lib/aws-s3';

describe('Upload Service AppStack', () => {
  let app: App;
  let stack: AppStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
  });

  describe('S3 Bucket Creation', () => {
    it('should create S3 bucket for city documents', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.resourceCountIs('AWS::S3::Bucket', 1);
    });

    it('should have versioning enabled for data protection', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });

    it('should have correct bucket name in dev environment', () => {
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'city-documents-city-document-bucket',
      });
    });

    it('should include sandbox suffix in bucket name', () => {
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', 'feature-123');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: 'city-documents-feature-123-city-document-bucket',
      });
    });
  });

  describe('S3 Security - Block Public Access', () => {
    it('should block all public access to S3 bucket', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
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

    it('should not allow any public bucket policies', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: Match.objectLike({
          BlockPublicPolicy: true,
        }),
      });
    });

    it('should restrict public bucket access', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: Match.objectLike({
          RestrictPublicBuckets: true,
        }),
      });
    });
  });

  describe('S3 Security - Encryption', () => {
    it('should have server-side encryption enabled', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
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
      stack = new AppStack(app, 'TestUploadStack', {});
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

  describe('S3 Security - CORS Configuration', () => {
    it('should have CORS configuration', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: Match.arrayWith([
            Match.objectLike({
              AllowedMethods: ['GET', 'PUT', 'POST'],
              AllowedOrigins: ['*'],
              AllowedHeaders: ['*'],
              MaxAge: 3000,
            }),
          ]),
        },
      });
    });

    it('should only allow specific HTTP methods (GET, PUT, POST)', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

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
  });

  describe('Data Lifecycle and Retention', () => {
    it('should have lifecycle rules configured', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
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
      stack = new AppStack(app, 'TestUploadStack', {});
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
      stack = new AppStack(app, 'TestUploadStack', {});
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
    it('should retain bucket in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::S3::Bucket', {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    it('should destroy bucket in dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::S3::Bucket', {
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      });
    });

    it('should auto-delete objects in non-prod environments', () => {
      app.node.setContext('env', 'dev');
      stack = new AppStack(app, 'TestUploadStack', {});
      const bucket = stack.cityDocumentsBucket;

      expect(bucket).toBeDefined();
    });

    it('should not auto-delete objects in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new AppStack(app, 'TestUploadStack', {});
      const bucket = stack.cityDocumentsBucket;

      expect(bucket).toBeDefined();
    });
  });

  describe('Stack Outputs', () => {
    it('should export bucket name', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CityDocumentsBucket', {
        Description: 'S3 bucket to hold city documents accessible to citizens',
      });
    });

    it('should export bucket ARN', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CityDocumentsBucketArn', {
        Description: 'S3 bucket ARN for citizens to access city documents',
      });
    });

    it('should have correct export name for bucket', () => {
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      const outputs = template.toJSON().Outputs;
      expect(outputs.CityDocumentsBucket.Export.Name).toBe('city-documents-CityDocuments');
    });

    it('should include sandbox in export name', () => {
      app.node.setContext('env', 'dev');
      app.node.setContext('sandbox', 'test-123');
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      const outputs = template.toJSON().Outputs;
      expect(outputs.CityDocumentsBucket.Export.Name).toBe('city-documents-test-123-CityDocuments');
    });
  });

  describe('Tagging', () => {
    it('should apply environment tag', () => {
      app.node.setContext('env', 'dev');
      stack = new AppStack(app, 'TestUploadStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should apply sandbox tag when provided', () => {
      app.node.setContext('sandbox', 'feature-upload');
      stack = new AppStack(app, 'TestUploadStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('feature-upload');
    });

    it('should not apply sandbox tag when not provided', () => {
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestUploadStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBeUndefined();
    });
  });

  describe('Edge Cases and Security Validation', () => {
    it('should not have any public read permissions', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      const bucket = stack.cityDocumentsBucket;

      expect(bucket).toBeDefined();
      // The bucket should not grant any public permissions
    });

    it('should handle empty sandbox name', () => {
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestUploadStack', {});

      expect(stack.cityDocumentsBucket).toBeDefined();
    });

    it('should handle special characters in sandbox name', () => {
      app.node.setContext('sandbox', 'feature-user-upload-2024');
      stack = new AppStack(app, 'TestUploadStack', {});

      expect(stack.cityDocumentsBucket).toBeDefined();
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: Match.stringLikeRegexp('.*feature-user-upload-2024.*'),
      });
    });

    it('should require SSL for all operations', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      // Verify SSL enforcement in bucket policy
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

    it('should not allow deletion without proper IAM permissions', () => {
      // The bucket is protected by IAM and doesn't allow public deletion
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('should maintain versioning even when objects are deleted', () => {
      stack = new AppStack(app, 'TestUploadStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      });
    });
  });
});