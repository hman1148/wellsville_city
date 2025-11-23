export interface CitizenReport {
  reportId: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  citizenName: string;
  issueAddress: string;
  issueType: IssueType;
  description: string;
  photoUrls: string[];
  photos?: PhotoInfo[];
  status: ReportStatus;
  rawMessage?: string;
  adminNotes?: AdminNote[];
}

export interface PhotoInfo {
  key: string;
  url: string;
}

export interface AdminNote {
  text: string;
  timestamp: string;
  adminName?: string;
}

export type ReportStatus = 'new' | 'in_progress' | 'resolved';

export type IssueType =
  | 'pothole'
  | 'water_break'
  | 'streetlight'
  | 'graffiti'
  | 'trash'
  | 'sidewalk'
  | 'sign'
  | 'other';

export interface ReportsListResponse {
  reports: CitizenReport[];
  pagination: {
    count: number;
    cursor: string | null;
    hasMore: boolean;
  };
}

export interface ReportStats {
  total: number;
  byStatus: {
    new: number;
    in_progress: number;
    resolved: number;
  };
  byIssueType: Record<string, number>;
  recentReports: number;
  averageResolutionTime?: number;
  dailyReports: Record<string, number>;
}

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  pothole: 'Pothole',
  water_break: 'Water Break',
  streetlight: 'Streetlight Issue',
  graffiti: 'Graffiti',
  trash: 'Trash/Illegal Dumping',
  sidewalk: 'Sidewalk Damage',
  sign: 'Sign Issue',
  other: 'Other',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};
