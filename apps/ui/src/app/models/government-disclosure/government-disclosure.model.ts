export type GovernmentDisclosure = {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number;
  uploadDate: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
};

export const initialGovernmentDisclosure = (): GovernmentDisclosure => ({
  id: '',
  title: '',
  description: '',
  category: '',
  year: new Date().getFullYear(),
  uploadDate: new Date().toISOString(),
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  uploadedBy: '',
});

export type DisclosureCategory =
  | 'campaign-finance'
  | 'conflict-of-interest'
  | 'financial-report'
  | 'audit'
  | 'other';


export type DisclosureCategoryItem = {
  label: string;
  value: DisclosureCategory;
};

export const disclosureCategories: DisclosureCategoryItem[] = [
  { label: 'Campaign Finance Reports', value: 'campaign-finance' },
  { label: 'Conflict of Interest Forms', value: 'conflict-of-interest' },
  { label: 'Financial Reports', value: 'financial-report' },
  { label: 'Audits', value: 'audit' },
  { label: 'Other', value: 'other' },
];
