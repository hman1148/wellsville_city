import { AppStack } from './stacks/app-stack';
import { App } from 'aws-cdk-lib/core';

describe('Government Disclosures Service', () => {
  test('App Stack is created successfully', () => {
    const app = new App();
    const stack = new AppStack(app, 'TestStack');
    expect(stack).toBeDefined();
  });
});
