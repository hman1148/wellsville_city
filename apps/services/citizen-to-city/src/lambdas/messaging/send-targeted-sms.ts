import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, BatchGetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';
import {
  TargetedRequest,
  TargetedResponse,
  BroadcastResults,
  Citizen,
  APIGatewayProxyEvent,
  PinpointAddress,
} from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const pinpointClient = new PinpointClient({});

const CITIZENS_TABLE_NAME = process.env.CITIZENS_TABLE_NAME ?? '';
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID ?? '';
const MAX_RECIPIENTS_PER_BATCH = 100; // Pinpoint limit

export const handler = async (event: APIGatewayProxyEvent): Promise<TargetedResponse> => {
  console.log('Targeted SMS Event:', JSON.stringify(event, null, 2));

  try {
    const body: TargetedRequest = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body as TargetedRequest;

    if (!body.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    if (!body.citizenIds && !body.phoneNumbers) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Either citizenIds or phoneNumbers must be provided' }),
      };
    }

    const targetCitizens: Citizen[] = [];

    // Fetch citizens by IDs if provided
    if (body.citizenIds && body.citizenIds.length > 0) {
      // DynamoDB BatchGetItem has a limit of 100 items
      for (let i = 0; i < body.citizenIds.length; i += 100) {
        const batch = body.citizenIds.slice(i, i + 100);
        const keys = batch.map(id => ({ citizenId: id }));

        const result = await docClient.send(new BatchGetCommand({
          RequestItems: {
            [CITIZENS_TABLE_NAME]: {
              Keys: keys,
            },
          },
        }));

        if (result.Responses?.[CITIZENS_TABLE_NAME]) {
          targetCitizens.push(...result.Responses[CITIZENS_TABLE_NAME] as Citizen[]);
        }
      }
    }

    // Fetch citizens by phone numbers if provided
    if (body.phoneNumbers && body.phoneNumbers.length > 0) {
      for (const phoneNumber of body.phoneNumbers) {
        const result = await docClient.send(new QueryCommand({
          TableName: CITIZENS_TABLE_NAME,
          IndexName: 'phoneNumber-index',
          KeyConditionExpression: 'phoneNumber = :phoneNumber',
          ExpressionAttributeValues: {
            ':phoneNumber': phoneNumber,
          },
        }));

        if (result.Items && result.Items.length > 0) {
          targetCitizens.push(result.Items[0] as Citizen);
        }
      }
    }

    if (targetCitizens.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No matching citizens found',
          sentCount: 0,
        }),
      };
    }

    console.log(`Found ${targetCitizens.length} target citizens`);

    // Send SMS in batches
    const results: BroadcastResults = {
      totalCitizens: targetCitizens.length,
      sentCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Process in batches to respect Pinpoint limits
    for (let i = 0; i < targetCitizens.length; i += MAX_RECIPIENTS_PER_BATCH) {
      const batch = targetCitizens.slice(i, i + MAX_RECIPIENTS_PER_BATCH);

      try {
        const addresses: Record<string, PinpointAddress> = {};
        batch.forEach(citizen => {
          // Remove non-numeric characters and ensure E.164 format
          const cleanPhone = citizen.phoneNumber.replace(/\D/g, '');
          const e164Phone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

          addresses[e164Phone] = {
            ChannelType: 'SMS',
          };
        });

        const command = new SendMessagesCommand({
          ApplicationId: PINPOINT_APP_ID,
          MessageRequest: {
            Addresses: addresses,
            MessageConfiguration: {
              SMSMessage: {
                Body: body.message,
                MessageType: 'TRANSACTIONAL',
                SenderId: body.senderId,
              },
            },
          },
        });

        const response = await pinpointClient.send(command);

        // Count successful sends
        if (response.MessageResponse?.Result) {
          Object.entries(response.MessageResponse.Result).forEach(([phone, result]) => {
            if (result.DeliveryStatus === 'SUCCESSFUL') {
              results.sentCount++;
            } else {
              results.failedCount++;
              results.errors.push(`${phone}: ${result.StatusMessage || 'Unknown error'}`);
            }
          });
        }

        console.log(`Batch ${Math.floor(i / MAX_RECIPIENTS_PER_BATCH) + 1} sent`);
      } catch (error) {
        console.error(`Error sending batch ${Math.floor(i / MAX_RECIPIENTS_PER_BATCH) + 1}:`, error);
        results.failedCount += batch.length;
        results.errors.push(`Batch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Targeted message sent',
        results,
      }),
    };
  } catch (error) {
    console.error('Error sending targeted SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send targeted message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
