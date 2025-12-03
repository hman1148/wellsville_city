import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'Request body is required',
        }),
      };
    }

    const disclosure = JSON.parse(event.body);

    const uploadedBy =
      event.requestContext.authorizer?.claims?.email || 'unknown';

    const item = {
      id: randomUUID(),
      title: disclosure.title,
      description: disclosure.description || '',
      category: disclosure.category,
      year: disclosure.year,
      uploadDate: new Date().toISOString(),
      fileUrl: disclosure.fileUrl,
      fileName: disclosure.fileName,
      fileSize: disclosure.fileSize,
      uploadedBy,
    };

    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        item,
        success: true,
        message: 'Disclosure created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating disclosure:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to create disclosure',
      }),
    };
  }
};
