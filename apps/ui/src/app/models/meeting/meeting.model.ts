export type MeetingFile = {
  id: string;
  title: string;
  description: string;
  s3Key: string;
  s3Url: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize?: number;
  category: 'agenda' | 'minutes' | 'discussion' | 'attachment' | 'other';
};

export const initialMeetingFile = (): MeetingFile => ({
  id: '',
  title: '',
  description: '',
  s3Key: '',
  s3Url: '',
  fileType: 'pdf',
  fileSize: undefined,
  category: 'other',
});

export type MeetingType = 'city-council' | 'planning-zoning';

export type Meeting = {
  id: string;
  title: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  meetingType: MeetingType;
  status: 'upcoming' | 'past' | 'cancelled';
  files: MeetingFile[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export const initialMeeting = (): Meeting => ({
  id: '',
  title: '',
  description: '',
  meetingDate: new Date().toISOString(),
  meetingTime: '',
  location: '',
  meetingType: 'city-council',
  status: 'upcoming',
  files: [],
});
