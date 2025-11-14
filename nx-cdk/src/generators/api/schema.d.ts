export interface ApiGeneratorSchema {
  appSubDirectory: string;
  implicitDependencies?: string[];
  lambdaStack?: string;
  customDomainStack?: string;
}
