import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CITIZENS_TABLE_NAME = process.env.CITIZENS_TABLE_NAME ?? '';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Get Citizen Event:', JSON.stringify(event, null, 2));

  try {
    const citizenId = event.pathParameters?.citizenId;

    if (!citizenId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Citizen ID is required' }),
      };
    }

    const result = await docClient.send(new GetCommand({
      TableName: CITIZENS_TABLE_NAME,
      Key: { citizenId },
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Citizen not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        citizen: result.Item,
      }),
    };
  } catch (error) {
    console.error('Error getting citizen:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to get citizen',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
