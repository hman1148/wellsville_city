export interface GraphQLAppSyncBridgeGeneratorSchema {
  appSubDirectory: string;
  graphqlSchemaLibrary: string;
  authMode?: 'API_KEY' | 'COGNITO_USER_POOLS' | 'AWS_IAM' | 'OIDC' | 'AWS_LAMBDA';
  cognitoUserPoolStack?: string;
  enableCaching?: boolean;
  cacheTtl?: number;
  enableXray?: boolean;
  enableCloudWatchLogs?: boolean;
  logLevel?: 'NONE' | 'ERROR' | 'ALL';
  implicitDependencies?: string[];
}
