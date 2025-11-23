import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { CitizenReport, ISSUE_TYPE_LABELS, NotifyAdminEvent } from './models';

const sesClient = new SESClient({});
const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME ?? '';
const ADMIN_TOPIC_ARN = process.env.ADMIN_TOPIC_ARN ?? '';

const generateEmailHtml = (report: CitizenReport, notificationType: string): string => {
  const issueLabel = ISSUE_TYPE_LABELS[report.issueType] || report.issueType;
  const statusColor = report.status === 'new' ? '#dc3545' : report.status === 'in_progress' ? '#ffc107' : '#28a745';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #1e3a5f; }
    .label { font-weight: bold; color: #666; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background: ${statusColor}; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wellsville City</h1>
      <p>Citizen Report Notification</p>
    </div>
    <div class="content">
      <h2>${notificationType === 'new_report' ? 'New Report Received' : 'Report Update'}</h2>

      <div class="detail">
        <span class="label">Report ID:</span> ${report.reportId}
      </div>

      <div class="detail">
        <span class="label">Issue Type:</span> ${issueLabel}
      </div>

      <div class="detail">
        <span class="label">Location:</span> ${report.issueAddress}
      </div>

      <div class="detail">
        <span class="label">Description:</span><br>
        ${report.description}
      </div>

      <div class="detail">
        <span class="label">Status:</span> <span class="status">${report.status.toUpperCase().replace('_', ' ')}</span>
      </div>

      <div class="detail">
        <span class="label">Reported:</span> ${new Date(report.createdAt).toLocaleString()}
      </div>

      ${report.photoUrls.length > 0 ? `
      <div class="detail">
        <span class="label">Photos:</span> ${report.photoUrls.length} attached
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>This is an automated notification from the Wellsville City Citizen Reporting System.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const handler = async (event: NotifyAdminEvent): Promise<{ statusCode: number; body: string }> => {
  console.log('Notify Admin Event:', JSON.stringify(event, null, 2));

  try {
    const { reportId, createdAt, notificationType, userPoolId, senderEmail } = event;

    // Get the report details
    const reportResult = await docClient.send(new GetCommand({
      TableName: REPORTS_TABLE_NAME,
      Key: { reportId, createdAt },
    }));

    if (!reportResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    const report = reportResult.Item as CitizenReport;

    // Send SNS notification (for SMS/other subscribers)
    await snsClient.send(new PublishCommand({
      TopicArn: ADMIN_TOPIC_ARN,
      Subject: `Wellsville City: ${notificationType === 'new_report' ? 'New' : 'Updated'} ${ISSUE_TYPE_LABELS[report.issueType] || 'Issue'} Report`,
      Message: JSON.stringify({
        reportId: report.reportId,
        issueType: report.issueType,
        location: report.issueAddress,
        status: report.status,
        timestamp: report.createdAt,
      }),
    }));

    // If we have Cognito user pool info, send emails to admins
    if (userPoolId && senderEmail) {
      try {
        // List admin users from Cognito
        const usersResult = await cognitoClient.send(new ListUsersCommand({
          UserPoolId: userPoolId,
          Limit: 50,
        }));

        const adminEmails = usersResult.Users
          ?.map(user => user.Attributes?.find(attr => attr.Name === 'email')?.Value)
          .filter((email): email is string => !!email) || [];

        if (adminEmails.length > 0) {
          const htmlBody = generateEmailHtml(report, notificationType);
          const issueLabel = ISSUE_TYPE_LABELS[report.issueType] || report.issueType;

          // Send email to each admin
          for (const toEmail of adminEmails) {
            await sesClient.send(new SendEmailCommand({
              Source: senderEmail,
              Destination: {
                ToAddresses: [toEmail],
              },
              Message: {
                Subject: {
                  Data: `[Wellsville City] ${notificationType === 'new_report' ? 'New' : 'Updated'} Report: ${issueLabel} at ${report.issueAddress}`,
                },
                Body: {
                  Html: {
                    Data: htmlBody,
                  },
                  Text: {
                    Data: `
Wellsville City - Citizen Report Notification

Report ID: ${report.reportId}
Issue Type: ${issueLabel}
Location: ${report.issueAddress}
Status: ${report.status}
Description: ${report.description}
Reported: ${new Date(report.createdAt).toLocaleString()}

View this report in the admin dashboard.
                    `.trim(),
                  },
                },
              },
            }));
          }

          console.log(`Emails sent to ${adminEmails.length} admins`);
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the entire function if email fails
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent successfully' }),
    };
  } catch (error) {
    console.error('Error notifying admins:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications' }),
    };
  }
};
