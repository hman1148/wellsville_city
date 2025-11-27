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

export type Meeting = {
  id: string;
  title: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  status: 'upcoming' | 'past' | 'cancelled';
  files: MeetingFile[];
};

export const initialMeeting = (): Meeting => ({
  id: '',
  title: '',
  description: '',
  meetingDate: new Date().toISOString(),
  meetingTime: '',
  location: '',
  status: 'upcoming',
  files: [],
});
