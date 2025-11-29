export type Ordinance = {
  id: string;
  title: string;
  chapter: string;
  description: string;
  category: OrdinanceCategory;
  lastUpdated: string;
  effectiveDate?: string;
  pdfUrl?: string; // S3 URL or external link
  externalUrl?: string;
  keywords: string[];
  sections?: OrdinanceSection[];
}

export type OrdinanceSection = {
  id: string;
  sectionNumber: string;
  title: string;
  description?: string;
}

export type OrdinanceCategory =
  | 'general-provisions'
  | 'administration'
  | 'revenue-finance'
  | 'business-regulation'
  | 'public-safety'
  | 'animals'
  | 'health-sanitation'
  | 'buildings-construction'
  | 'planning-zoning'
  | 'public-works'
  | 'utilities'
  | 'parks-recreation'
  | 'environmental'
  | 'other';

export type OrdinanceCategoryInfo = {
  id: OrdinanceCategory;
  label: string;
  description: string;
  icon: string;
}

export const ORDINANCE_CATEGORIES: OrdinanceCategoryInfo[] = [
  {
    id: 'general-provisions',
    label: 'General Provisions',
    description: 'General government provisions and procedures',
    icon: 'pi-book',
  },
  {
    id: 'administration',
    label: 'Administration & Government',
    description: 'City administration and governance',
    icon: 'pi-briefcase',
  },
  {
    id: 'revenue-finance',
    label: 'Revenue & Finance',
    description: 'Taxation, fees, and financial matters',
    icon: 'pi-dollar',
  },
  {
    id: 'business-regulation',
    label: 'Business Regulation',
    description: 'Business licenses and regulations',
    icon: 'pi-shopping-cart',
  },
  {
    id: 'public-safety',
    label: 'Public Safety',
    description: 'Police, fire, and emergency services',
    icon: 'pi-shield',
  },
  {
    id: 'animals',
    label: 'Animals',
    description: 'Animal control and licensing',
    icon: 'pi-heart',
  },
  {
    id: 'health-sanitation',
    label: 'Health & Sanitation',
    description: 'Public health and sanitation',
    icon: 'pi-heart-fill',
  },
  {
    id: 'buildings-construction',
    label: 'Buildings & Construction',
    description: 'Building codes and construction regulations',
    icon: 'pi-home',
  },
  {
    id: 'planning-zoning',
    label: 'Planning & Zoning',
    description: 'Land use and zoning regulations',
    icon: 'pi-map',
  },
  {
    id: 'public-works',
    label: 'Public Works',
    description: 'Streets, sidewalks, and infrastructure',
    icon: 'pi-wrench',
  },
  {
    id: 'utilities',
    label: 'Utilities',
    description: 'Water, sewer, and utility services',
    icon: 'pi-bolt',
  },
  {
    id: 'parks-recreation',
    label: 'Parks & Recreation',
    description: 'Parks, recreation, and community facilities',
    icon: 'pi-sun',
  },
  {
    id: 'environmental',
    label: 'Environmental',
    description: 'Environmental protection and conservation',
    icon: 'pi-globe',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Miscellaneous ordinances',
    icon: 'pi-ellipsis-h',
  },
];

export const initialOrdinance = (): Ordinance => ({
  id: '',
  title: '',
  chapter: '',
  description: '',
  category: 'other',
  lastUpdated: new Date().toISOString(),
  keywords: [],
});
