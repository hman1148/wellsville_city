import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CITIZENS_TABLE_NAME = process.env.CITIZENS_TABLE_NAME ?? '';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('List Citizens Event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const subscribed = queryParams.subscribed; // 'true' or 'false'
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 100;
    const nextToken = queryParams.nextToken;

    let result;

    if (subscribed) {
      // Query by subscription status using GSI
      result = await docClient.send(new QueryCommand({
        TableName: CITIZENS_TABLE_NAME,
        IndexName: 'subscribed-index',
        KeyConditionExpression: 'subscribed = :subscribed',
        ExpressionAttributeValues: {
          ':subscribed': subscribed,
        },
        Limit: limit,
        ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
      }));
    } else {
      // Scan all citizens
      result = await docClient.send(new ScanCommand({
        TableName: CITIZENS_TABLE_NAME,
        Limit: limit,
        ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
      }));
    }

    const citizens = result.Items || [];
    const lastEvaluatedKey = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        citizens,
        count: citizens.length,
        nextToken: lastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Error listing citizens:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to list citizens',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
