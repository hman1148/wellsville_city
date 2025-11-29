import { App, Stack } from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppStack } from './app-stack';

describe('Authentication AppStack - Cognito Security Tests', () => {
  let app: App;
  let stack: AppStack;
  let template: Template;

  describe('Cognito User Pool - Basic Configuration', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should create Cognito User Pool', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    it('should have correct user pool name', () => {
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: 'portal-city-admin-user-pool',
      });
    });

    it('should include sandbox suffix in user pool name', () => {
      app.node.setContext('sandbox', 'auth-test');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: 'portal-auth-test-city-admin-user-pool',
      });
    });
  });

  describe('Cognito Security - Self Sign-Up Disabled', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should disable self sign-up to prevent unauthorized registrations', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: Match.objectLike({
          AllowAdminCreateUserOnly: true,
        }),
      });
    });

    it('should only allow city administrators to create accounts', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      // Verify that self sign-up is disabled
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {
          AllowAdminCreateUserOnly: true,
        },
      });
    });
  });

  describe('Cognito Security - Password Policy', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should enforce minimum password length of 8 characters', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: Match.objectLike({
            MinimumLength: 8,
          }),
        },
      });
    });

    it('should require lowercase characters in password', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: Match.objectLike({
            RequireLowercase: true,
          }),
        },
      });
    });

    it('should require uppercase characters in password', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: Match.objectLike({
            RequireUppercase: true,
          }),
        },
      });
    });

    it('should require digits in password', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: Match.objectLike({
            RequireNumbers: true,
          }),
        },
      });
    });

    it('should require symbols in password', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: Match.objectLike({
            RequireSymbols: true,
          }),
        },
      });
    });

    it('should enforce strong password policy with all requirements', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireUppercase: true,
            RequireNumbers: true,
            RequireSymbols: true,
          },
        },
      });
    });
  });

  describe('Cognito Security - Email Verification', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should require email sign-in', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email'],
      });
    });

    it('should auto-verify email addresses', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AutoVerifiedAttributes: ['email'],
      });
    });

    it('should require email as a standard attribute', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'email',
            Required: true,
            Mutable: true,
          }),
        ]),
      });
    });
  });

  describe('Cognito Security - Required User Attributes', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should require email attribute', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'email',
            Required: true,
          }),
        ]),
      });
    });

    it('should require given name attribute', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'given_name',
            Required: true,
          }),
        ]),
      });
    });

    it('should require family name attribute', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'family_name',
            Required: true,
          }),
        ]),
      });
    });

    it('should have custom userId attribute that is immutable', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            Name: 'userId',
            Mutable: false,
          }),
        ]),
      });
    });
  });

  describe('Cognito Security - Account Recovery', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should use email-only account recovery', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AccountRecoverySetting: {
          RecoveryMechanisms: [
            {
              Name: 'verified_email',
              Priority: 1,
            },
          ],
        },
      });
    });
  });

  describe('Cognito User Pool Client - Security Configuration', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should create user pool client', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    });

    it('should not generate client secret for SPA', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        GenerateSecret: false,
      });
    });

    it('should use authorization code grant flow', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlows: ['code'],
      });
    });

    it('should not use implicit grant flow for security', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlows: Match.not(Match.arrayWith(['implicit'])),
      });
    });

    it('should enable user SRP authentication', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ExplicitAuthFlows: Match.arrayWith(['ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH']),
      });
    });

    it('should not enable user password authentication', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ExplicitAuthFlows: Match.not(Match.arrayWith(['ALLOW_USER_PASSWORD_AUTH'])),
      });
    });

    it('should prevent user existence errors', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        PreventUserExistenceErrors: 'ENABLED',
      });
    });

    it('should enable token revocation', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        EnableTokenRevocation: true,
      });
    });
  });

  describe('OAuth Scopes and Token Validity', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should include required OAuth scopes', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthScopes: Match.arrayWith(['openid', 'email', 'profile']),
      });
    });

    it('should set access token validity to 60 minutes', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AccessTokenValidity: 60,
        TokenValidityUnits: Match.objectLike({
          AccessToken: 'minutes',
        }),
      });
    });

    it('should set id token validity to 60 minutes', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        IdTokenValidity: 60,
        TokenValidityUnits: Match.objectLike({
          IdToken: 'minutes',
        }),
      });
    });

    it('should set refresh token validity to 30 days', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        RefreshTokenValidity: 30,
        TokenValidityUnits: Match.objectLike({
          RefreshToken: 'days',
        }),
      });
    });
  });

  describe('Callback URLs - Security Validation', () => {
    it('should use localhost callback URL in local mode', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        CallbackURLs: Match.arrayWith(['http://localhost:4200/callback']),
      });
    });

    it('should use localhost logout URL in local mode', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        LogoutURLs: Match.arrayWith(['http://localhost:4200/logout']),
      });
    });
  });

  describe('Cognito Domain Configuration', () => {
    it('should create Cognito domain in local mode', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        Domain: 'portal-local-auth',
      });
    });

    it('should include sandbox in domain prefix', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', 'test-auth');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        Domain: 'portal-test-auth-local-auth',
      });
    });
  });

  describe('Environment-Based Removal Policy', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('localMode', true);
    });

    it('should retain user pool in prod environment', () => {
      app.node.setContext('env', 'prod');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::Cognito::UserPool', {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    it('should destroy user pool in dev environment', () => {
      app.node.setContext('env', 'dev');
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResource('AWS::Cognito::UserPool', {
        DeletionPolicy: 'Delete',
        UpdateReplacePolicy: 'Delete',
      });
    });
  });

  describe('SSM Parameter Store - Secure Configuration', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', '');
    });

    it('should store user pool ID in SSM Parameter Store', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: 'portal-city-admin-user-pool/cityAdminUsers',
        Description: 'Cognito User Pool ID for Amplify configuration',
      });
    });

    it('should store user pool client ID in SSM Parameter Store', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: 'portal-city-admin-user-pool/cityAdminUserPoolClientId',
        Description: 'Cognito User Pool Client ID for Amplify configuration',
      });
    });

    it('should store region in SSM Parameter Store', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: 'portal-city-admin-user-pool/region',
        Description: 'AWS Region for Cognito User Pool',
      });
    });
  });

  describe('Stack Outputs', () => {
    beforeEach(() => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
    });

    it('should export user pool ID', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CityAdminUserPoolId', {
        Description: 'Cognito User Pool ID',
      });
    });

    it('should export user pool client ID', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CityAdminUserPoolClientId', {
        Description: 'Cognito User Pool Client ID for SPA',
      });
    });

    it('should export user pool domain', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('CityAdminUserPoolDomain', {
        Description: 'Cognito Hosted UI Domain',
      });
    });

    it('should export OAuth callback URL', () => {
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      template.hasOutput('OAuthCallbackUrl', {
        Description: 'OAuth Callback URL',
      });
    });
  });

  describe('Edge Cases and Security Validation', () => {
    it('should handle empty sandbox gracefully', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', '');
      stack = new AppStack(app, 'TestAuthStack', {});

      expect(stack).toBeDefined();
    });

    it('should apply appropriate tags with sandbox', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      app.node.setContext('sandbox', 'auth-feature');
      stack = new AppStack(app, 'TestAuthStack', {});

      const tags = Stack.of(stack).tags.tagValues();
      expect(tags.Environment).toBe('dev');
      expect(tags.Sandbox).toBe('auth-feature');
    });

    it('should prevent weak passwords with comprehensive policy', () => {
      app = new App();
      app.node.setContext('env', 'dev');
      app.node.setContext('localMode', true);
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      // All password requirements should be enforced
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: Match.anyValue(),
            RequireLowercase: true,
            RequireUppercase: true,
            RequireNumbers: true,
            RequireSymbols: true,
          },
        },
      });
    });

    it('should not allow public user creation', () => {
      app = new App();
      app.node.setContext('env', 'prod');
      app.node.setContext('localMode', true);
      stack = new AppStack(app, 'TestAuthStack', {});
      template = Template.fromStack(stack);

      // Self sign-up must be disabled in all environments
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {
          AllowAdminCreateUserOnly: true,
        },
      });
    });
  });
});