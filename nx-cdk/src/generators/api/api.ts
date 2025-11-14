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
import { ApiGeneratorSchema } from './schema';
import { ProjectType } from '@nx/workspace';
import { discoverExportsFromDependencies } from '../blank-app/utils/ast-parser';

export async function apiGenerator(tree: Tree, options: ApiGeneratorSchema) {
  const { appsDir } = getWorkspaceLayout(tree);

  if (!appsDir) {
    throw new Error('Cannot determine apps directory. Is this an Nx workspace?');
  }

  const devKitNames = names(options.appSubDirectory);
  const projectRoot = `${appsDir}/${options.appSubDirectory}`;
  const projectName = devKitNames.name.replace(new RegExp('/', 'g'), '-');

  // Merge lambdaStack and customDomainStack into implicitDependencies
  const allDependencies = [
    ...(options.implicitDependencies || []),
    ...(options.lambdaStack ? [options.lambdaStack] : []),
    ...(options.customDomainStack ? [options.customDomainStack] : []),
  ];

  // Remove duplicates
  const uniqueDependencies = [...new Set(allDependencies)];

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
    tags: ['cdk', 'api'],
  };

  // Discover exports from dependencies if any
  const dependencyExports = uniqueDependencies.length > 0 ? discoverExportsFromDependencies(tree, uniqueDependencies, workspaceRoot) : {};

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...devKitNames,
    projectName,
    templ: '', // to remove the __templ__ in the file names
    offsetFromRoot: offsetFromRoot(projectRoot),
    hasLambdaStack: !!options.lambdaStack,
    hasCustomDomain: !!options.customDomainStack,
    hasDependencies: uniqueDependencies.length > 0,
    dependencyExports,
    allDependencies: uniqueDependencies,
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
}

export default apiGenerator;
