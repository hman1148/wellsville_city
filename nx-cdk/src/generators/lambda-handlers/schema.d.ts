export interface LambdaHandlersGeneratorSchema {
  appSubDirectory: string;
  implicitDependencies?: string[];
  handlers?: string;
  layerDependencies?: boolean;
}
