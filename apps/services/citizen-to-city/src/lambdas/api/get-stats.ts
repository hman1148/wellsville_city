import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const REPORTS_TABLE_NAME = process.env.REPORTS_TABLE_NAME ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

interface ReportStats {
  total: number;
  byStatus: {
    new: number;
    in_progress: number;
    resolved: number;
  };
  byIssueType: Record<string, number>;
  recentReports: number; // Last 24 hours
  averageResolutionTime?: number; // In hours
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get counts for each status using GSI
    const [newCount, inProgressCount, resolvedCount] = await Promise.all([
      getStatusCount('new'),
      getStatusCount('in_progress'),
      getStatusCount('resolved'),
    ]);

    // Get all reports for detailed stats (consider using aggregation for large datasets)
    const allReportsResult = await docClient.send(new ScanCommand({
      TableName: REPORTS_TABLE_NAME,
      ProjectionExpression: 'reportId, createdAt, updatedAt, issueType, #status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    }));

    const reports = allReportsResult.Items || [];

    // Calculate stats by issue type
    const byIssueType: Record<string, number> = {};
    reports.forEach(report => {
      const type = report.issueType || 'other';
      byIssueType[type] = (byIssueType[type] || 0) + 1;
    });

    // Count reports from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentReports = reports.filter(
      report => new Date(report.createdAt) > oneDayAgo
    ).length;

    // Calculate average resolution time for resolved reports
    const resolvedReports = reports.filter(report => report.status === 'resolved');
    let averageResolutionTime: number | undefined;

    if (resolvedReports.length > 0) {
      const totalResolutionTime = resolvedReports.reduce((sum, report) => {
        const created = new Date(report.createdAt).getTime();
        const updated = new Date(report.updatedAt).getTime();
        return sum + (updated - created);
      }, 0);
      averageResolutionTime = Math.round(totalResolutionTime / resolvedReports.length / (1000 * 60 * 60)); // Convert to hours
    }

    // Get reports by day for the last 7 days
    const last7Days: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last7Days[dateKey] = 0;
    }

    reports.forEach(report => {
      const dateKey = report.createdAt.split('T')[0];
      if (Object.prototype.hasOwnProperty.call(last7Days, dateKey)) {
        last7Days[dateKey]++;
      }
    });

    const stats: ReportStats & { dailyReports: Record<string, number> } = {
      total: reports.length,
      byStatus: {
        new: newCount,
        in_progress: inProgressCount,
        resolved: resolvedCount,
      },
      byIssueType,
      recentReports,
      averageResolutionTime,
      dailyReports: last7Days,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ stats }),
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to get stats' }),
    };
  }
};

async function getStatusCount(status: string): Promise<number> {
  let count = 0;
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(new QueryCommand({
      TableName: REPORTS_TABLE_NAME,
      IndexName: 'status-createdAt-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      Select: 'COUNT',
      ExclusiveStartKey: lastKey,
    }));

    count += result.Count || 0;
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return count;
}
