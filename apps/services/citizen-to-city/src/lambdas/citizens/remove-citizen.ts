import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CITIZENS_TABLE_NAME = process.env.CITIZENS_TABLE_NAME ?? '';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Remove Citizen Event:', JSON.stringify(event, null, 2));

  try {
    const citizenId = event.pathParameters?.citizenId;

    if (!citizenId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Citizen ID is required' }),
      };
    }

    // Check if citizen exists
    const existingCitizen = await docClient.send(new GetCommand({
      TableName: CITIZENS_TABLE_NAME,
      Key: { citizenId },
    }));

    if (!existingCitizen.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Citizen not found' }),
      };
    }

    // Update to unsubscribe (soft delete)
    const now = new Date().toISOString();
    await docClient.send(new UpdateCommand({
      TableName: CITIZENS_TABLE_NAME,
      Key: { citizenId },
      UpdateExpression: 'SET subscribed = :subscribed, unsubscribedAt = :unsubscribedAt, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':subscribed': 'false',
        ':unsubscribedAt': now,
        ':updatedAt': now,
      },
    }));

    console.log('Citizen unsubscribed:', citizenId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Citizen unsubscribed successfully',
        citizenId,
      }),
    };
  } catch (error) {
    console.error('Error removing citizen:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to remove citizen',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
