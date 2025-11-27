export type Newsletter = {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  s3Url: string;
  thumbnailUrl?: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize?: number;
};

export const initialNewsletter = (): Newsletter => ({
  id: '',
  title: '',
  description: '',
  publishDate: new Date().toISOString(),
  s3Url: '',
  thumbnailUrl: undefined,
  fileType: 'pdf',
  fileSize: undefined,
});
