import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';
import {
  PinpointEvent,
  CitizenReport,
  ParsedMessage,
  ISSUE_KEYWORDS,
} from './models';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME ?? '';
const ADMIN_TOPIC_ARN = process.env.ADMIN_TOPIC_ARN ?? '';

const classifyIssueType = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  for (const [issueType, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return issueType;
    }
  }

  return 'other';
};

const parseMessage = (message: string): ParsedMessage => {
  const addressPatterns: RegExp[] = [
    /(?:at|on|near)\s+(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court))/i,
    /(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court))/i,
  ];

  let address = 'Unknown';
  const description = message;

  for (const pattern of addressPatterns) {
    const match = message.match(pattern);
    if (match) {
      address = match[1].trim();
      break;
    }
  }

  return { address, description };
};

export const handler = async (event: PinpointEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    // Handle different event structures
    let phoneNumber: string;
    let messageBody: string;

    if (event.Records && event.Records.length > 0) {
      const record = event.Records[0];
      phoneNumber = record.originationNumber || 'unknown';
      messageBody = record.messageBody || '';
    } else {
      phoneNumber = event.originationNumber || 'unknown';
      messageBody = event.messageBody || '';
    }

    if (!messageBody) {
      return { statusCode: 400, body: 'No message body' };
    }

    const reportId = uuidv4();
    const timestamp = new Date().toISOString();
    const { address, description } = parseMessage(messageBody);
    const issueType = classifyIssueType(messageBody);

    const report: CitizenReport = {
      reportId,
      createdAt: timestamp,
      updatedAt: timestamp,
      phoneNumber,
      citizenName: 'Unknown', // Will be updated if citizen provides name
      issueAddress: address,
      issueType,
      description,
      photoUrls: [],
      status: 'new',
      rawMessage: messageBody,
    };

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: REPORTS_TABLE_NAME,
      Item: report,
    }));

    // Send notification to admins
    await snsClient.send(new PublishCommand({
      TopicArn: ADMIN_TOPIC_ARN,
      Subject: `New Citizen Report: ${issueType}`,
      Message: JSON.stringify({
        reportId,
        issueType,
        address,
        description: description.substring(0, 200),
        phoneNumber: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        timestamp,
      }, null, 2),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ reportId, message: 'Report received successfully' }),
    };
  } catch (error) {
    console.error('Error processing SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process message' }),
    };
  }
};
