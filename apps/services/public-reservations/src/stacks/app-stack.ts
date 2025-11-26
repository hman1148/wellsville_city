import { CfnMapping, Stack, StackProps, Tags } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class AppStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// Get environment and sandbox from context
		const env = this.node.tryGetContext('env') || 'dev';
		const sandbox = this.node.tryGetContext('sandbox') || '';
		const sandboxSuffix = sandbox ? `-${sandbox}` : '';

		new CfnMapping(this, 'EnvironmentMapping', {
			mapping: {
				dev: {
					exampleMapping: 'dev-example',
				},
				stage: {
					exampleMapping: 'stage-example',
				},
				uat: {
					exampleMapping: 'uat-example',
				},
				prod: {
					exampleMapping: 'prod-example',
				},
			},
		});

		Tags.of(this).add('Environment', env);
		if (sandbox) {
			Tags.of(this).add('Sandbox', sandbox);
		}

		// Add AWS resources here...
	}
}
