import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME ?? '';
const PHOTO_BUCKET_NAME = process.env.PHOTO_BUCKET_NAME ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Get Report Event:', JSON.stringify(event, null, 2));

  try {
    const reportId = event.pathParameters?.reportId;

    if (!reportId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'reportId is required' }),
      };
    }

    // Query to get the report (since we have a sort key, we need to query)
    const result = await docClient.send(new QueryCommand({
      TableName: REPORTS_TABLE_NAME,
      KeyConditionExpression: '#reportId = :reportId',
      ExpressionAttributeNames: {
        '#reportId': 'reportId',
      },
      ExpressionAttributeValues: {
        ':reportId': reportId,
      },
      Limit: 1,
    }));

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    const report = result.Items[0];

    // Generate presigned URLs for photos
    if (report.photoUrls && report.photoUrls.length > 0) {
      const signedPhotoUrls = await Promise.all(
        report.photoUrls.map(async (url: string) => {
          const key = url.replace(`s3://${PHOTO_BUCKET_NAME}/`, '');
          try {
            const command = new GetObjectCommand({
              Bucket: PHOTO_BUCKET_NAME,
              Key: key,
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return {
              key,
              url: signedUrl,
            };
          } catch (error) {
            console.warn(`Failed to generate presigned URL for: ${key}`);
            return null;
          }
        })
      );

      report.photos = signedPhotoUrls.filter(Boolean);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ report }),
    };
  } catch (error) {
    console.error('Error getting report:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to get report' }),
    };
  }
};
