import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { ProcessReportEvent } from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME ?? '';
const PHOTO_BUCKET_NAME = process.env.PHOTO_BUCKET_NAME ?? '';

export const handler = async (event: ProcessReportEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    const { reportId, createdAt, updates } = event;

    if (!reportId || !createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'reportId and createdAt are required' }),
      };
    }

    // Verify report exists
    const existingReport = await docClient.send(new GetCommand({
      TableName: REPORTS_TABLE_NAME,
      Key: { reportId, createdAt },
    }));

    if (!existingReport.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    // Build update expression
    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: Record<string, string | string[]> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (updates) {
      if (updates.citizenName) {
        updateExpressions.push('#citizenName = :citizenName');
        expressionAttributeNames['#citizenName'] = 'citizenName';
        expressionAttributeValues[':citizenName'] = updates.citizenName;
      }

      if (updates.issueAddress) {
        updateExpressions.push('#issueAddress = :issueAddress');
        expressionAttributeNames['#issueAddress'] = 'issueAddress';
        expressionAttributeValues[':issueAddress'] = updates.issueAddress;
      }

      if (updates.issueType) {
        updateExpressions.push('#issueType = :issueType');
        expressionAttributeNames['#issueType'] = 'issueType';
        expressionAttributeValues[':issueType'] = updates.issueType;
      }

      if (updates.description) {
        updateExpressions.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = updates.description;
      }

      if (updates.photoKeys && updates.photoKeys.length > 0) {
        // Verify photos exist in S3
        const validPhotoUrls: string[] = [];
        for (const key of updates.photoKeys) {
          try {
            await s3Client.send(new HeadObjectCommand({
              Bucket: PHOTO_BUCKET_NAME,
              Key: key,
            }));
            validPhotoUrls.push(`s3://${PHOTO_BUCKET_NAME}/${key}`);
          } catch {
            console.warn(`Photo not found: ${key}`);
          }
        }

        if (validPhotoUrls.length > 0) {
          updateExpressions.push('#photoUrls = list_append(if_not_exists(#photoUrls, :emptyList), :photoUrls)');
          expressionAttributeNames['#photoUrls'] = 'photoUrls';
          expressionAttributeValues[':photoUrls'] = validPhotoUrls;
          expressionAttributeValues[':emptyList'] = [];
        }
      }
    }

    // Update the report
    const result = await docClient.send(new UpdateCommand({
      TableName: REPORTS_TABLE_NAME,
      Key: { reportId, createdAt },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Report updated successfully',
        report: result.Attributes,
      }),
    };
  } catch (error) {
    console.error('Error processing report:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process report' }),
    };
  }
};
