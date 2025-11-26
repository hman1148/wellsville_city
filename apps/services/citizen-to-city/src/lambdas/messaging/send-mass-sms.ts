import { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';
import {
  BroadcastRequest,
  BroadcastResponse,
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

export const handler = async (event: APIGatewayProxyEvent): Promise<BroadcastResponse> => {
  console.log('Broadcast SMS Event:', JSON.stringify(event, null, 2));

  try {
    const body: BroadcastRequest = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body as BroadcastRequest;

    if (!body.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Query all subscribed citizens
    const subscribedCitizens: Citizen[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      const queryResult = await docClient.send(new QueryCommand({
        TableName: CITIZENS_TABLE_NAME,
        IndexName: 'subscribed-index',
        KeyConditionExpression: 'subscribed = :subscribed',
        ExpressionAttributeValues: {
          ':subscribed': 'true',
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }));

      if (queryResult.Items) {
        subscribedCitizens.push(...queryResult.Items as Citizen[]);
      }

      lastEvaluatedKey = queryResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (subscribedCitizens.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No subscribed citizens found',
          sentCount: 0,
        }),
      };
    }

    console.log(`Found ${subscribedCitizens.length} subscribed citizens`);

    // Send SMS in batches
    const results: BroadcastResults = {
      totalCitizens: subscribedCitizens.length,
      sentCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Process in batches to respect Pinpoint limits
    for (let i = 0; i < subscribedCitizens.length; i += MAX_RECIPIENTS_PER_BATCH) {
      const batch = subscribedCitizens.slice(i, i + MAX_RECIPIENTS_PER_BATCH);

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
        message: 'Broadcast completed',
        results,
      }),
    };
  } catch (error) {
    console.error('Error broadcasting SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to broadcast message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
