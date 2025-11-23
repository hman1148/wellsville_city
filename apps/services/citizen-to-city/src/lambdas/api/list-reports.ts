import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('List Reports Event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const status = queryParams.status;
    const issueType = queryParams.issueType;
    const limit = parseInt(queryParams.limit || '50', 10);
    const lastEvaluatedKey = queryParams.cursor
      ? JSON.parse(Buffer.from(queryParams.cursor, 'base64').toString())
      : undefined;

    let result;

    if (status) {
      // Query by status using GSI
      result = await docClient.send(new QueryCommand({
        TableName: REPORTS_TABLE_NAME,
        IndexName: 'status-createdAt-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
        ScanIndexForward: false, // Most recent first
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));
    } else if (issueType) {
      // Query by issue type using GSI
      result = await docClient.send(new QueryCommand({
        TableName: REPORTS_TABLE_NAME,
        IndexName: 'issueType-createdAt-index',
        KeyConditionExpression: '#issueType = :issueType',
        ExpressionAttributeNames: {
          '#issueType': 'issueType',
        },
        ExpressionAttributeValues: {
          ':issueType': issueType,
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));
    } else {
      // Scan all reports (paginated)
      result = await docClient.send(new ScanCommand({
        TableName: REPORTS_TABLE_NAME,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));
    }

    // Sort by createdAt descending if we did a scan
    const reports = result.Items || [];
    if (!status && !issueType) {
      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Generate cursor for pagination
    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        reports,
        pagination: {
          count: reports.length,
          cursor: nextCursor,
          hasMore: !!result.LastEvaluatedKey,
        },
      }),
    };
  } catch (error) {
    console.error('Error listing reports:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to list reports' }),
    };
  }
};
