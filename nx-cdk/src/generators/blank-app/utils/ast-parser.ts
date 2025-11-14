import { Tree, getProjects, logger } from '@nx/devkit';
import * as ts from 'typescript';
import * as path from 'path';

export interface DiscoveredExport {
  exportName: string;
  description?: string;
  variableName: string;
  stackFile: string;
  stackName: string; // Actual stack name from main.ts
}

/**
 * Converts a string to camelCase for variable naming
 * e.g., "HostedZoneId" -> "hostedZoneId"
 */
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Extracts stack name mappings from main.ts
 * Returns a map of stack class names to their instantiated stack names
 * e.g., { "NetworkingStack": "service-framework-networking" }
 */
function extractStackNamesFromMain(sourceFile: ts.SourceFile): Map<string, string> {
  const stackMap = new Map<string, string>();

  function visit(node: ts.Node) {
    // Look for: new SomeStack(app, 'stack-name', ...)
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text.endsWith('Stack')) {
      const stackClassName = node.expression.text;
      const args = node.arguments;

      // Second argument should be the stack name
      if (args && args.length >= 2) {
        const stackNameArg = args[1];

        // Handle template literals like `service-framework-networking${stackSuffix}`
        if (ts.isTemplateExpression(stackNameArg)) {
          // Extract the base name before ${...}
          const baseName = stackNameArg.head.text;
          stackMap.set(stackClassName, baseName);
        } else if (ts.isStringLiteral(stackNameArg)) {
          stackMap.set(stackClassName, stackNameArg.text);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return stackMap;
}

/**
 * Extracts string literal value from a TypeScript node
 */
function getStringLiteralValue(node: ts.Node): string | undefined {
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  if (ts.isTemplateExpression(node)) {
    // Handle template strings like `${this.stackName}-HostedZoneId`
    // We'll extract the static parts
    let text = node.head.text;
    node.templateSpans.forEach((span) => {
      if (ts.isIdentifier(span.expression)) {
        text += `\${${span.expression.text}}`;
      } else if (ts.isPropertyAccessExpression(span.expression)) {
        text += `\${${span.expression.getText()}}`;
      }
      text += span.literal.text;
    });
    return text;
  }
  return undefined;
}

/**
 * Extracts the stack class name from a stack file
 * e.g., "export class NetworkingStack extends Stack" -> "NetworkingStack"
 */
function extractStackClassName(sourceFile: ts.SourceFile): string | undefined {
  let className: string | undefined;

  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name && node.heritageClauses) {
      // Check if it extends Stack
      const extendsStack = node.heritageClauses.some((clause) => clause.types.some((type) => ts.isIdentifier(type.expression) && type.expression.text === 'Stack'));

      if (extendsStack) {
        className = node.name.text;
      }
    }

    if (!className) {
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return className;
}

/**
 * Parses a TypeScript file to find CfnOutput constructor calls
 */
function parseCfnOutputsFromFile(sourceFile: ts.SourceFile, stackName: string): DiscoveredExport[] {
  const exports: DiscoveredExport[] = [];

  function visit(node: ts.Node) {
    // Look for: new CfnOutput(this, 'LogicalId', { exportName: '...', description: '...' })
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'CfnOutput') {
      // Get the third argument (options object)
      const args = node.arguments;
      if (args && args.length >= 3) {
        const optionsArg = args[2];
        if (ts.isObjectLiteralExpression(optionsArg)) {
          let exportName: string | undefined;
          let description: string | undefined;
          let logicalId: string | undefined;

          // Get logical ID from second argument
          if (args[1] && ts.isStringLiteral(args[1])) {
            logicalId = args[1].text;
          }

          // Parse the options object
          optionsArg.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const propName = prop.name.text;
              if (propName === 'exportName') {
                exportName = getStringLiteralValue(prop.initializer);
              } else if (propName === 'description') {
                exportName = exportName || getStringLiteralValue(prop.initializer);
                description = getStringLiteralValue(prop.initializer);
              }
            }
          });

          // Extract the export name suffix from template strings
          // e.g., `${this.stackName}-HostedZoneId` -> "HostedZoneId"
          if (exportName) {
            const match = exportName.match(/\$\{[^}]+\}-(.+)/);
            const cleanExportName = match ? match[1] : exportName;

            exports.push({
              exportName: cleanExportName,
              description,
              variableName: toCamelCase(logicalId || cleanExportName),
              stackFile: sourceFile.fileName,
              stackName,
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

/**
 * Discovers all CfnOutput exports from a project's stack files
 */
export function discoverExportsFromProject(tree: Tree, projectName: string, workspaceRoot: string): DiscoveredExport[] {
  const projects = getProjects(tree);
  const project = projects.get(projectName);

  if (!project) {
    logger.warn(`Project "${projectName}" not found in workspace. Skipping export discovery.`);
    return [];
  }

  const sourceRoot = project.sourceRoot || project.root;

  // First, parse main.ts to get stack name mappings
  const mainFilePath = path.join(sourceRoot, 'main.ts');
  let stackNameMap = new Map<string, string>();

  if (tree.exists(mainFilePath)) {
    const mainContent = tree.read(mainFilePath, 'utf-8');
    if (mainContent) {
      try {
        const mainSourceFile = ts.createSourceFile(mainFilePath, mainContent, ts.ScriptTarget.Latest, true);
        stackNameMap = extractStackNamesFromMain(mainSourceFile);
        logger.info(`Found ${stackNameMap.size} stack name mapping(s) in ${projectName}/main.ts`);
      } catch (error) {
        logger.warn(`Error parsing ${mainFilePath}: ${error}`);
      }
    }
  } else {
    logger.warn(`main.ts not found at ${mainFilePath}. Using project name as fallback.`);
  }

  const stacksDir = path.join(sourceRoot, 'stacks');

  // Check if stacks directory exists
  if (!tree.exists(stacksDir)) {
    logger.warn(`Stacks directory not found for project "${projectName}" at ${stacksDir}. Skipping export discovery.`);
    return [];
  }

  // Find all .ts files in the stacks directory
  const stackFiles = tree.children(stacksDir).filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'));

  const allExports: DiscoveredExport[] = [];
  const seenVariableNames = new Set<string>();

  stackFiles.forEach((file) => {
    const filePath = path.join(stacksDir, file);
    const content = tree.read(filePath, 'utf-8');

    if (!content) {
      logger.warn(`Could not read file ${filePath}`);
      return;
    }

    try {
      const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

      // Extract the stack class name from this file
      const stackClassName = extractStackClassName(sourceFile);

      // Look up the actual stack name from main.ts, or use project name as fallback
      const stackName = stackClassName && stackNameMap.has(stackClassName) ? stackNameMap.get(stackClassName)! : projectName;

      const exports = parseCfnOutputsFromFile(sourceFile, stackName);

      // Filter out duplicates based on variable name
      exports.forEach((exp) => {
        if (!seenVariableNames.has(exp.variableName)) {
          seenVariableNames.add(exp.variableName);
          allExports.push(exp);
        } else {
          logger.warn(`Skipping duplicate variable name "${exp.variableName}" for export "${exp.exportName}" in ${filePath}`);
        }
      });
    } catch (error) {
      logger.warn(`Error parsing ${filePath}: ${error}`);
    }
  });

  if (allExports.length > 0) {
    logger.info(`Discovered ${allExports.length} export(s) from ${projectName}`);
  }

  return allExports;
}

/**
 * Discovers exports from multiple dependency projects
 */
export function discoverExportsFromDependencies(tree: Tree, dependencies: string[], workspaceRoot: string): Record<string, DiscoveredExport[]> {
  const result: Record<string, DiscoveredExport[]> = {};

  dependencies.forEach((dep) => {
    const exports = discoverExportsFromProject(tree, dep, workspaceRoot);
    if (exports.length > 0) {
      result[dep] = exports;
    }
  });

  return result;
}
