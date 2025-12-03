import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});
const tableName = process.env.TABLE_NAME!;
const bucketName = process.env.BUCKET_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'Disclosure ID is required',
        }),
      };
    }

    // First, query to get the item with full key
    const queryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
      Limit: 1,
    });

    const queryResponse = await docClient.send(queryCommand);

    if (!queryResponse.Items || queryResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'Disclosure not found',
        }),
      };
    }

    const item = queryResponse.Items[0];
    const s3Key = item.fileUrl;

    if (s3Key) {
      const deleteS3Command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      });
      await s3Client.send(deleteS3Command);
    }

    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: {
        id: item.id,
        uploadDate: item.uploadDate,
      },
    });

    await docClient.send(deleteCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Disclosure deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting disclosure:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to delete disclosure',
      }),
    };
  }
};
