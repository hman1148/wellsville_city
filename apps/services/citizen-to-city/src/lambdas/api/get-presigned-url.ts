import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});

const PHOTO_BUCKET_NAME = process.env.PHOTO_BUCKET_NAME!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Get Presigned URL Event:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const key = queryParams.key;
    const operation = queryParams.operation || 'get'; // 'get' or 'put'
    const contentType = queryParams.contentType || 'image/jpeg';

    if (!key) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'key query parameter is required' }),
      };
    }

    let signedUrl: string;

    if (operation === 'put') {
      // Generate upload URL
      const command = new PutObjectCommand({
        Bucket: PHOTO_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });
      signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } else {
      // Generate download URL
      const command = new GetObjectCommand({
        Bucket: PHOTO_BUCKET_NAME,
        Key: key,
      });
      signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        url: signedUrl,
        key,
        operation,
        expiresIn: 3600,
      }),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to generate presigned URL' }),
    };
  }
};
