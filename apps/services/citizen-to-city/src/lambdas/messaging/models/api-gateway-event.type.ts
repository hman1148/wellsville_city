export type APIGatewayProxyEvent = {
  body: string | null;
  headers: Record<string, string>;
  multiValueHeaders: Record<string, string[]>;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: Record<string, string> | null;
  queryStringParameters: Record<string, string> | null;
  multiValueQueryStringParameters: Record<string, string[]> | null;
  stageVariables: Record<string, string> | null;
  requestContext: {
    accountId: string;
    apiId: string;
    protocol: string;
    httpMethod: string;
    path: string;
    stage: string;
    requestId: string;
    requestTime: string;
    requestTimeEpoch: number;
    identity: {
      sourceIp: string;
      userAgent: string;
    };
    authorizer?: Record<string, unknown>;
  };
  resource: string;
};

export type PinpointAddress = {
  ChannelType: 'SMS' | 'EMAIL' | 'PUSH';
};
