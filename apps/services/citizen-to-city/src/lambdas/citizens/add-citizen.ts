import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { AddCitizenRequest, Citizen, APIGatewayProxyEvent } from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CITIZENS_TABLE_NAME = process.env.CITIZENS_TABLE_NAME ?? '';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Add Citizen Event:', JSON.stringify(event, null, 2));

  try {
    const body: AddCitizenRequest = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body as AddCitizenRequest;

    if (!body.phoneNumber || !body.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number and name are required' }),
      };
    }

    // Check if citizen already exists
    const existingResult = await docClient.send(new QueryCommand({
      TableName: CITIZENS_TABLE_NAME,
      IndexName: 'phoneNumber-index',
      KeyConditionExpression: 'phoneNumber = :phoneNumber',
      ExpressionAttributeValues: {
        ':phoneNumber': body.phoneNumber,
      },
    }));

    if (existingResult.Items && existingResult.Items.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: 'Citizen with this phone number already exists',
          citizenId: existingResult.Items[0].citizenId,
        }),
      };
    }

    const now = new Date().toISOString();
    const citizen: Citizen = {
      citizenId: uuidv4(),
      phoneNumber: body.phoneNumber,
      name: body.name,
      email: body.email,
      subscribed: 'true',
      subscribedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: CITIZENS_TABLE_NAME,
      Item: citizen,
    }));

    console.log('Citizen added:', citizen.citizenId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Citizen added successfully',
        citizen,
      }),
    };
  } catch (error) {
    console.error('Error adding citizen:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to add citizen',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
