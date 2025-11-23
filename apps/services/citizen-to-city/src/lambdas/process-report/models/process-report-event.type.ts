import { ReportUpdates } from './report-updates.type';

export type ProcessReportEvent = {
  reportId: string;
  createdAt: string;
  updates?: ReportUpdates;
};
