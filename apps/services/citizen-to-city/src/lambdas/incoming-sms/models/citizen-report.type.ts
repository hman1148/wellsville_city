import { ReportStatus } from './report-status.type';

export type CitizenReport = {
  reportId: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  citizenName: string;
  issueAddress: string;
  issueType: string;
  description: string;
  photoUrls: string[];
  status: ReportStatus;
  rawMessage: string;
};
