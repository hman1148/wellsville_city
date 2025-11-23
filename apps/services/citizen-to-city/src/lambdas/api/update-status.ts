import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'PATCH,OPTIONS',
};

const VALID_STATUSES = ['new', 'in_progress', 'resolved'];

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Update Status Event:', JSON.stringify(event, null, 2));

  try {
    const reportId = event.pathParameters?.reportId;

    if (!reportId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'reportId is required' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { status, notes } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        }),
      };
    }

    // First, query to get the report's createdAt (sort key)
    const queryResult = await docClient.send(new QueryCommand({
      TableName: REPORTS_TABLE_NAME,
      KeyConditionExpression: '#reportId = :reportId',
      ExpressionAttributeNames: {
        '#reportId': 'reportId',
      },
      ExpressionAttributeValues: {
        ':reportId': reportId,
      },
      ProjectionExpression: 'createdAt',
      Limit: 1,
    }));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    const { createdAt } = queryResult.Items[0];

    // Build update expression
    const updateExpressions = [
      '#status = :status',
      '#updatedAt = :updatedAt',
    ];
    const expressionAttributeNames: Record<string, string> = {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    };

    // Add notes if provided
    if (notes) {
      updateExpressions.push('#adminNotes = list_append(if_not_exists(#adminNotes, :emptyList), :note)');
      expressionAttributeNames['#adminNotes'] = 'adminNotes';
      expressionAttributeValues[':emptyList'] = [];
      expressionAttributeValues[':note'] = [{
        text: notes,
        timestamp: new Date().toISOString(),
        // We could get user info from the JWT claims here
      }];
    }

    // Update the report
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: REPORTS_TABLE_NAME,
      Key: { reportId, createdAt },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Status updated successfully',
        report: updateResult.Attributes,
      }),
    };
  } catch (error) {
    console.error('Error updating status:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to update status' }),
    };
  }
};
