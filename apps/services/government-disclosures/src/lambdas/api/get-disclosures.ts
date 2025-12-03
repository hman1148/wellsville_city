import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const category = event.queryStringParameters?.category;
    const year = event.queryStringParameters?.year;

    let items;

    if (category) {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: 'CategoryIndex',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': category,
        },
      });
      const response = await docClient.send(command);
      items = response.Items || [];
    } else if (year) {
      const command = new QueryCommand({
        TableName: tableName,
        IndexName: 'YearIndex',
        KeyConditionExpression: '#year = :year',
        ExpressionAttributeNames: {
          '#year': 'year',
        },
        ExpressionAttributeValues: {
          ':year': parseInt(year),
        },
      });
      const response = await docClient.send(command);
      items = response.Items || [];
    } else {
      const command = new ScanCommand({
        TableName: tableName,
      });
      const response = await docClient.send(command);
      items = response.Items || [];
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        items,
        success: true,
        total: items.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching disclosures:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        items: [],
        success: false,
        message: 'Failed to fetch disclosures',
      }),
    };
  }
};
