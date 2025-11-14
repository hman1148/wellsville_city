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
  getProjects,
  logger,
} from '@nx/devkit';
import * as path from 'path';
import { configurationGenerator } from '@nx/jest';
import { GraphQLAppSyncBridgeGeneratorSchema } from './schema';
import { ProjectType } from '@nx/workspace';
import { discoverExportsFromDependencies } from '../blank-app/utils/ast-parser';

/**
 * Finds the GraphQL schema file (.graphql or .gql) in a library project
 */
function findGraphQLSchemaFile(tree: Tree, projectRoot: string): string | undefined {
  const extensions = ['.graphql', '.gql'];

  // Check common locations
  const searchPaths = [projectRoot, joinPathFragments(projectRoot, 'src'), joinPathFragments(projectRoot, 'schema')];

  for (const searchPath of searchPaths) {
    if (!tree.exists(searchPath)) continue;

    const children = tree.children(searchPath);
    for (const child of children) {
      if (extensions.some((ext) => child.endsWith(ext))) {
        return joinPathFragments(searchPath, child);
      }
    }
  }

  return undefined;
}

export async function graphqlAppSyncBridgeGenerator(tree: Tree, options: GraphQLAppSyncBridgeGeneratorSchema) {
  const { appsDir } = getWorkspaceLayout(tree);

  if (!appsDir) {
    throw new Error('Cannot determine apps directory. Is this an Nx workspace?');
  }

  const devKitNames = names(options.appSubDirectory);
  const projectRoot = `${appsDir}/${options.appSubDirectory}`;
  const projectName = devKitNames.name.replace(new RegExp('/', 'g'), '-');

  // Find the GraphQL schema library project
  const projects = getProjects(tree);
  const schemaLibrary = projects.get(options.graphqlSchemaLibrary);

  if (!schemaLibrary) {
    throw new Error(`GraphQL schema library "${options.graphqlSchemaLibrary}" not found in workspace.`);
  }

  // Find the GraphQL schema file
  const schemaFilePath = findGraphQLSchemaFile(tree, schemaLibrary.root);

  if (!schemaFilePath) {
    throw new Error(
      `No GraphQL schema file (.graphql or .gql) found in library "${options.graphqlSchemaLibrary}". ` +
        `Searched in: ${schemaLibrary.root}, ${schemaLibrary.root}/src, ${schemaLibrary.root}/schema`
    );
  }

  logger.info(`Found GraphQL schema: ${schemaFilePath}`);

  // Build complete dependencies list
  const allDependencies = [
    options.graphqlSchemaLibrary, // Always include schema library
    ...(options.cognitoUserPoolStack ? [options.cognitoUserPoolStack] : []),
    ...(options.implicitDependencies || []),
  ];

  // Remove duplicates
  const uniqueDependencies = [...new Set(allDependencies)];

  // Validate Cognito requirement
  if (options.authMode === 'COGNITO_USER_POOLS' && !options.cognitoUserPoolStack) {
    throw new Error('cognitoUserPoolStack is required when authMode is COGNITO_USER_POOLS');
  }

  // Helper to build CDK commands with env and sandbox context, with defaults
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
    ...(uniqueDependencies.length > 0 && {
      implicitDependencies: uniqueDependencies,
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
    tags: ['cdk', 'appsync', 'graphql'],
  };

  // Discover exports from dependencies if any
  const dependencyExports = uniqueDependencies.length > 0 ? discoverExportsFromDependencies(tree, uniqueDependencies, workspaceRoot) : {};

  // Calculate relative path from project to schema file
  const relativeSchemaPath = path.relative(projectRoot, schemaFilePath);

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...devKitNames,
    projectName,
    templ: '', // to remove the __templ__ in the file names
    offsetFromRoot: offsetFromRoot(projectRoot),
    hasDependencies: uniqueDependencies.length > 0,
    dependencyExports,
    allDependencies: uniqueDependencies,
    hasCognito: !!options.cognitoUserPoolStack,
    cognitoUserPoolStack: options.cognitoUserPoolStack || '',
    schemaFilePath: relativeSchemaPath,
    authMode: options.authMode || 'API_KEY',
    enableCaching: options.enableCaching || false,
    cacheTtl: options.cacheTtl || 3600,
    enableXray: options.enableXray !== false, // default true
    enableCloudWatchLogs: options.enableCloudWatchLogs !== false, // default true
    logLevel: options.logLevel || 'ERROR',
  });

  addProjectConfiguration(tree, projectName, projectConfiguration);

  await configurationGenerator(tree, {
    project: projectName,
    setupFile: 'none',
    supportTsx: false, // no JSX/react in cdk
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

  logger.info(`
✅ AppSync GraphQL bridge project created successfully!

Next steps:
1. Implement VTL resolvers in ${projectRoot}/resolvers/
2. Update ${projectRoot}/src/stacks/appsync-bridge-stack.ts with resolver definitions
3. Run: nx synth ${projectName}
4. Deploy: nx deploy ${projectName}
  `);
}

export default graphqlAppSyncBridgeGenerator;
