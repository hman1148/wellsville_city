import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  generateFiles,
  names,
  Tree,
  offsetFromRoot,
  workspaceRoot,
} from '@nx/devkit';
import * as path from 'path';
import { configurationGenerator } from '@nx/jest';
import { LambdaHandlersGeneratorSchema } from './schema';
import { ProjectType } from '@nx/workspace';
import { discoverExportsFromDependencies } from '../blank-app/utils/ast-parser';

export async function lambdaHandlersGenerator(tree: Tree, options: LambdaHandlersGeneratorSchema) {
  const { appsDir } = getWorkspaceLayout(tree);

  if (!appsDir) {
    throw new Error('Cannot determine apps directory. Is this an Nx workspace?');
  }

  const devKitNames = names(options.appSubDirectory);
  const projectRoot = `${appsDir}/${options.appSubDirectory}`;
  const projectName = devKitNames.name.replace(new RegExp('/', 'g'), '-');

  // Parse handlers - split by comma and trim
  const handlersArray = (options.handlers || 'example')
    .split(',')
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  // Create handler metadata with naming conventions
  const handlerMetadata = handlersArray.map((handler) => ({
    ...names(handler),
  }));

  // Helper to build CDK commands
  const cdkCommand = (baseCmd: string, options: { defaults?: { env: string; sandbox: string }; includeStack?: boolean } = {}) => {
    const { defaults = { env: 'dev', sandbox: '' }, includeStack = false } = options;
    const envPart = `--context env=\${NX_ENV:-${defaults.env}}`;
    const sandboxPart = defaults.sandbox !== undefined ? `--context sandbox=\${NX_SANDBOX:-${defaults.sandbox}}` : '--context sandbox=${NX_SANDBOX:-}';

    if (includeStack) {
      return `NX_ENV={args.env} NX_SANDBOX={args.sandbox} NX_STACK={args.stack} bash -c 'if [ -n "\${NX_STACK}" ]; then ${baseCmd} \${NX_STACK} ${envPart} ${sandboxPart}; else ${baseCmd} ${envPart} ${sandboxPart}; fi'`;
    }

    return `NX_ENV={args.env} NX_SANDBOX={args.sandbox} bash -c '${baseCmd} ${envPart} ${sandboxPart}'`;
  };

  const projectConfiguration: ProjectConfiguration = {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: ProjectType.Application,
    name: projectName,
    ...(options.implicitDependencies &&
      options.implicitDependencies.length > 0 && {
        implicitDependencies: options.implicitDependencies,
      }),
    targets: {
      tsc: {
        executor: 'nx:run-commands',
        options: {
          cwd: projectRoot,
          commands: ['tsc -p tsconfig.json --noEmit'],
        },
      },
      diff: {
        executor: 'nx:run-commands',
        options: {
          cwd: projectRoot,
          commands: [cdkCommand('cdk diff')],
        },
      },
      synth: {
        executor: 'nx:run-commands',
        options: {
          cwd: projectRoot,
          commands: [cdkCommand('cdk synth')],
        },
      },
      deploy: {
        executor: 'nx:run-commands',
        options: {
          cwd: projectRoot,
          commands: [cdkCommand('cdk deploy --require-approval=never')],
        },
      },
      destroy: {
        executor: 'nx:run-commands',
        dependsOn: ['destroy^'],
        options: {
          cwd: projectRoot,
          commands: [cdkCommand('cdk destroy -f', { includeStack: true })],
        },
      },
    },
    tags: ['cdk', 'lambda'],
  };

  // Discover exports from dependencies if any
  const dependencyExports =
    options.implicitDependencies && options.implicitDependencies.length > 0 ? discoverExportsFromDependencies(tree, options.implicitDependencies, workspaceRoot) : {};

  // Generate main project files
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...devKitNames,
    projectName,
    templ: '', // to remove the __templ__ in the file names
    offsetFromRoot: offsetFromRoot(projectRoot),
    hasDependencies: options.implicitDependencies && options.implicitDependencies.length > 0,
    dependencyExports,
    handlers: handlerMetadata,
    layerDependencies: options.layerDependencies || false,
  });

  // Generate individual handler files
  const handlersDir = joinPathFragments(projectRoot, 'src', 'handlers');
  handlerMetadata.forEach((handler) => {
    const handlerContent = `import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

/**
 * Lambda handler for ${handler.name} endpoint
 *
 * This function is designed to be invoked via API Gateway proxy integration
 * and handles CORS, structured logging, and error responses.
 *
 * Environment Variables:
 * - STAGE: Deployment stage (dev, stage, prod)
 * - LOG_LEVEL: Logging level (debug, info, warn, error)
 * - FUNCTION_NAME: Name of this Lambda function
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Structured logging
  console.log(JSON.stringify({
    level: 'info',
    message: 'Lambda invocation started',
    functionName: process.env.FUNCTION_NAME,
    requestId: context.requestId,
    path: event.path,
    method: event.httpMethod,
    stage: process.env.STAGE,
  }))

  // CORS headers for all responses
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
  }

  try {
    // TODO: Implement ${handler.name} business logic here
    //
    // Example: Parse request body
    // const body = event.body ? JSON.parse(event.body) : {}
    //
    // Example: Access query parameters
    // const { id } = event.queryStringParameters || {}
    //
    // Example: Access path parameters
    // const { userId } = event.pathParameters || {}

    console.log(JSON.stringify({
      level: 'info',
      message: 'Processing ${handler.name} request',
      requestId: context.requestId,
    }))

    // TODO: Replace with actual implementation
    const response = {
      message: '${handler.name} executed successfully',
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    }
  } catch (error) {
    // Structured error logging
    console.error(JSON.stringify({
      level: 'error',
      message: 'Lambda execution failed',
      functionName: process.env.FUNCTION_NAME,
      requestId: context.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }))

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        requestId: context.requestId,
      }),
    }
  }
}
`;

    const handlerFilePath = joinPathFragments(handlersDir, `${handler.fileName}.ts`);
    tree.write(handlerFilePath, handlerContent);
  });

  addProjectConfiguration(tree, projectName, projectConfiguration);

  await configurationGenerator(tree, {
    project: projectName,
    setupFile: 'none',
    supportTsx: false,
    compiler: 'tsc',
    skipSerializers: true,
    testEnvironment: 'node',
    skipFormat: false,
  });

  // Update the tsconfig.spec.json to use NodeNext module resolution
  const tsconfigSpecPath = joinPathFragments(projectRoot, 'tsconfig.spec.json');
  if (tree.exists(tsconfigSpecPath)) {
    const tsconfigSpec = JSON.parse(tree.read(tsconfigSpecPath, 'utf-8') as string);
    tsconfigSpec.compilerOptions = {
      ...tsconfigSpec.compilerOptions,
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    };
    tsconfigSpec.include.push('src/**/*.ts');
    tree.write(tsconfigSpecPath, JSON.stringify(tsconfigSpec, null, 2));
  }

  await formatFiles(tree);
}

export default lambdaHandlersGenerator;
