import { App, Stack } from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { DataStack } from './DataStack';

describe('DataStack', () => {
  let app: App;
  let stack: DataStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
  });

  describe('Environment Configuration', () => {
    it('should create stack with dev environment by default', () => {
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      expect(stack).toBeDefined();
      expect(template).toBeDefined();
    });

    it('should create stack with dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
    });

    it('should create stack with test environment', () => {
      app.node.setContext('env', 'test');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('test');
    });

    it('should create stack with prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('prod');
    });

    it('should create stack with local environment', () => {
      app.node.setContext('env', 'local');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('local');
    });
  });

  describe('Sandbox Configuration', () => {
    it('should not add Sandbox tag when sandbox is empty', () => {
      app.node.setContext('sandbox', '');
      stack = new DataStack(app, 'TestDataStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBeUndefined();
    });

    it('should add Sandbox tag when sandbox context is provided', () => {
      app.node.setContext('sandbox', 'feature-db');
      stack = new DataStack(app, 'TestDataStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Sandbox).toBe('feature-db');
    });
  });

  describe('Local Mode Configuration', () => {
    it('should not add LocalMode tag when localMode is false', () => {
      app.node.setContext('localMode', false);
      stack = new DataStack(app, 'TestDataStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.LocalMode).toBeUndefined();
    });

    it('should add LocalMode tag when localMode is true', () => {
      app.node.setContext('localMode', true);
      stack = new DataStack(app, 'TestDataStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.LocalMode).toBe('true');
    });
  });

  describe('Database Configuration Mapping', () => {
    it('should contain correct database config for dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        dev: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'dev.wellsvile.gov',
          dbInstanceClass: 'db.t3.micro',
          backupRetention: '7',
        },
      });
    });

    it('should contain correct database config for test environment', () => {
      app.node.setContext('env', 'test');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        test: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'test.wellsvile.gov',
          dbInstanceClass: 'db.t3.small',
          backupRetention: '7',
        },
      });
    });

    it('should contain correct database config for prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        prod: {
          hostedZone: 'Z09011321LBDR3A2J6A1I',
          domainName: 'prod.welsville.gov',
          dbInstanceClass: 'db.t3.medium',
          backupRetention: '30',
        },
      });
    });

    it('should contain correct database config for local environment', () => {
      app.node.setContext('env', 'local');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      template.hasMapping('EnvironmentMapping', {
        local: {
          hostedZone: 'N/A',
          domainName: 'localhost',
          dbInstanceClass: 'db.t3.micro',
          backupRetention: '1',
        },
      });
    });
  });

  describe('Backup Retention Policies', () => {
    it('should have 7 day backup retention for dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.dev.backupRetention).toBe('7');
    });

    it('should have 7 day backup retention for test environment', () => {
      app.node.setContext('env', 'test');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.test.backupRetention).toBe('7');
    });

    it('should have 30 day backup retention for prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.prod.backupRetention).toBe('30');
    });

    it('should have 1 day backup retention for local environment', () => {
      app.node.setContext('env', 'local');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.local.backupRetention).toBe('1');
    });
  });

  describe('Database Instance Classes', () => {
    it('should use db.t3.micro for dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.dev.dbInstanceClass).toBe('db.t3.micro');
    });

    it('should use db.t3.small for test environment', () => {
      app.node.setContext('env', 'test');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.test.dbInstanceClass).toBe('db.t3.small');
    });

    it('should use db.t3.medium for prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.prod.dbInstanceClass).toBe('db.t3.medium');
    });

    it('should use db.t3.micro for local environment', () => {
      app.node.setContext('env', 'local');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const mappings = template.toJSON().Mappings;
      expect(mappings.EnvironmentMapping.local.dbInstanceClass).toBe('db.t3.micro');
    });
  });

  describe('Outputs', () => {
    it('should export DatabaseInstanceClass output', () => {
      app.node.setContext('env', 'dev');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('DatabaseInstanceClass', {
        Description: 'Recommended database instance class for this environment',
      });
    });

    it('should have correct export name for DatabaseInstanceClass', () => {
      app.node.setContext('env', 'prod');
      stack = new DataStack(app, 'TestDataStack', {});
      template = Template.fromStack(stack);

      const outputs = template.toJSON().Outputs;
      expect(outputs.DatabaseInstanceClass.Export.Name).toContain('DatabaseInstanceClass');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null context values gracefully', () => {
      // Don't set any context
      stack = new DataStack(app, 'TestDataStack', {});

      expect(stack).toBeDefined();
      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev'); // Should default to dev
    });

    it('should handle multiple contexts simultaneously', () => {
      app.node.setContext('env', 'prod');
      app.node.setContext('sandbox', 'data-migration');
      app.node.setContext('localMode', true);

      stack = new DataStack(app, 'TestDataStack', {});
      const tags = Stack.of(stack).tags.tagValues();

      expect(tags.Environment).toBe('prod');
      expect(tags.Sandbox).toBe('data-migration');
      expect(tags.LocalMode).toBe('true');
    });

    it('should properly scale instance class from dev to prod', () => {
      const devApp = new App();
      devApp.node.setContext('env', 'dev');
      const devStack = new DataStack(devApp, 'DevDataStack', {});
      const devTemplate = Template.fromStack(devStack);

      const prodApp = new App();
      prodApp.node.setContext('env', 'prod');
      const prodStack = new DataStack(prodApp, 'ProdDataStack', {});
      const prodTemplate = Template.fromStack(prodStack);

      const devMappings = devTemplate.toJSON().Mappings;
      const prodMappings = prodTemplate.toJSON().Mappings;

      expect(devMappings.EnvironmentMapping.dev.dbInstanceClass).toBe('db.t3.micro');
      expect(prodMappings.EnvironmentMapping.prod.dbInstanceClass).toBe('db.t3.medium');
    });

    it('should properly scale backup retention from dev to prod', () => {
      const devApp = new App();
      devApp.node.setContext('env', 'dev');
      const devStack = new DataStack(devApp, 'DevDataStack', {});
      const devTemplate = Template.fromStack(devStack);

      const prodApp = new App();
      prodApp.node.setContext('env', 'prod');
      const prodStack = new DataStack(prodApp, 'ProdDataStack', {});
      const prodTemplate = Template.fromStack(prodStack);

      const devMappings = devTemplate.toJSON().Mappings;
      const prodMappings = prodTemplate.toJSON().Mappings;

      expect(devMappings.EnvironmentMapping.dev.backupRetention).toBe('7');
      expect(prodMappings.EnvironmentMapping.prod.backupRetention).toBe('30');
    });
  });
});