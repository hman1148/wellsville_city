export type CitizenReport = {
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

export type PhotoInfo = {
  key: string;
  url: string;
}

export type AdminNote = {
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

export type ReportsListResponse = {
  reports: CitizenReport[];
  pagination: {
    count: number;
    cursor: string | null;
    hasMore: boolean;
  };
}

export type ByStatus = {
  new: number;
  in_process: number;
  resolved: number;
}

export type ReportStats = {
  total: number;
  byStatus: ByStatus,
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
