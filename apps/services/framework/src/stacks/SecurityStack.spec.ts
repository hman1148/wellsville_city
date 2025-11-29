import { App, Stack } from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { SecurityStack } from './SecurityStack';

describe('SecurityStack', () => {
  let app: App;
  let stack: SecurityStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
  });

  describe('Environment Configuration', () => {
    it('should create stack with dev environment by default', () => {
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      expect(stack).toBeDefined();
      expect(template).toBeDefined();
    });

    it('should create stack with dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should create stack with test environment', () => {
      app.node.setContext('env', 'test');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('test');
    });

    it('should create stack with prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('prod');
    });

    it('should create stack with local environment', () => {
      app.node.setContext('env', 'local');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('local');
    });
  });

  describe('Sandbox Configuration', () => {
    it('should not add Sandbox tag when sandbox is empty', () => {
      app.node.setContext('sandbox', '');
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBeUndefined();
    });

    it('should add Sandbox tag when sandbox context is provided', () => {
      app.node.setContext('sandbox', 'feature-branch');
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('feature-branch');
    });

    it('should handle alphanumeric sandbox names', () => {
      app.node.setContext('sandbox', 'test123');
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('test123');
    });
  });

  describe('Local Mode Configuration', () => {
    it('should not add LocalMode tag when localMode is false', () => {
      app.node.setContext('localMode', false);
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.LocalMode).toBeUndefined();
    });

    it('should add LocalMode tag when localMode is true', () => {
      app.node.setContext('localMode', true);
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.LocalMode).toBe('true');
    });
  });

  describe('Environment Mapping', () => {
    it('should contain correct mapping for dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        dev: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'dev.wellsvile.gov',
          environment: 'development',
        },
      });
    });

    it('should contain correct mapping for test environment', () => {
      app.node.setContext('env', 'test');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        test: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'test.wellsvile.gov',
          environment: 'testing',
        },
      });
    });

    it('should contain correct mapping for prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        prod: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'prod.wellsvile.gov',
          environment: 'production',
        },
      });
    });

    it('should contain correct mapping for local environment', () => {
      app.node.setContext('env', 'local');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        local: {
          hostedZone: 'N/A',
          domainName: 'localhost',
          environment: 'local',
        },
      });
    });
  });

  describe('Outputs', () => {
    it('should export EnvironmentName output', () => {
      app.node.setContext('env', 'dev');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('EnvironmentName', {
        Description: 'Environment name for this deployment',
      });
    });

    it('should have correct export name for EnvironmentName', () => {
      app.node.setContext('env', 'prod');
      stack = new SecurityStack(app, 'TestSecurityStack', {});
      template = Template.fromStack(stack);

      const outputs = template.toJSON().Outputs;
      expect(outputs.EnvironmentName.Export.Name).toContain('EnvironmentName');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null context values gracefully', () => {
      // Don't set any context
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      expect(stack).toBeDefined();
      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev'); // Should default to dev
    });

    it('should handle multiple contexts simultaneously', () => {
      app.node.setContext('env', 'prod');
      app.node.setContext('sandbox', 'hotfix-123');
      app.node.setContext('localMode', true);

      stack = new SecurityStack(app, 'TestSecurityStack', {});
      const tags = Stack.of(stack).tags.tagValues();

      expect(tags.Environment).toBe('prod');
      expect(tags.Sandbox).toBe('hotfix-123');
      expect(tags.LocalMode).toBe('true');
    });

    it('should handle empty string sandbox value', () => {
      app.node.setContext('sandbox', '');
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBeUndefined();
    });

    it('should handle special characters in sandbox name', () => {
      app.node.setContext('sandbox', 'feature-user-auth-2024');
      stack = new SecurityStack(app, 'TestSecurityStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('feature-user-auth-2024');
    });
  });
});