export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
};

export const initialAnnouncement = (): Announcement => ({
  id: '',
  title: '',
  content: '',
  date: new Date().toISOString(),
  link: undefined,
  priority: 'low',
});
