import { Ordinance } from '../models';

/**
 * Sample ordinances data
 * In production, this should be fetched from an API that retrieves data from S3 or a database
 *
 * To populate this with real data from https://codelibrary.amlegal.com/codes/wellsvilleut/latest/overview:
 * 1. Navigate to each title/chapter on the website
 * 2. Copy the title, chapter number, and description
 * 3. For PDFs, either:
 *    a) Upload PDFs to S3 and reference the S3 URL in pdfUrl
 *    b) Use the externalUrl to link directly to the code library
 */
export const ORDINANCES_DATA: Ordinance[] = [
  // Title 1: General Provisions
  {
    id: 'title-1-chapter-1',
    title: 'Title and Adoption of Code',
    chapter: 'Title 1, Chapter 1',
    description: 'Code adoption, title, and general provisions',
    category: 'general-provisions',
    lastUpdated: '2024-01-15',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-1',
    keywords: ['code', 'adoption', 'general', 'provisions', 'title'],
  },
  {
    id: 'title-1-chapter-2',
    title: 'General Provisions',
    chapter: 'Title 1, Chapter 2',
    description: 'General provisions, definitions, and interpretation of the code',
    category: 'general-provisions',
    lastUpdated: '2024-01-15',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-2',
    keywords: ['general', 'provisions', 'definitions', 'interpretation'],
  },

  // Title 2: Administration and Government
  {
    id: 'title-2-chapter-1',
    title: 'City Council',
    chapter: 'Title 2, Chapter 1',
    description: 'City Council organization, meetings, and procedures',
    category: 'administration',
    lastUpdated: '2024-02-10',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-3',
    keywords: ['city council', 'meetings', 'procedures', 'government', 'administration'],
  },
  {
    id: 'title-2-chapter-2',
    title: 'City Officers and Employees',
    chapter: 'Title 2, Chapter 2',
    description: 'Duties and responsibilities of city officers and employees',
    category: 'administration',
    lastUpdated: '2024-02-10',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-4',
    keywords: ['officers', 'employees', 'duties', 'responsibilities', 'staff'],
  },

  // Title 3: Revenue and Finance
  {
    id: 'title-3-chapter-1',
    title: 'Property Tax',
    chapter: 'Title 3, Chapter 1',
    description: 'Property tax assessment and collection procedures',
    category: 'revenue-finance',
    lastUpdated: '2024-03-05',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-5',
    keywords: ['property tax', 'assessment', 'tax', 'revenue', 'finance'],
  },
  {
    id: 'title-3-chapter-2',
    title: 'Sales and Use Tax',
    chapter: 'Title 3, Chapter 2',
    description: 'Sales and use tax regulations and administration',
    category: 'revenue-finance',
    lastUpdated: '2024-03-05',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-6',
    keywords: ['sales tax', 'use tax', 'revenue', 'finance'],
  },

  // Title 4: Business Regulation
  {
    id: 'title-4-chapter-1',
    title: 'Business Licenses',
    chapter: 'Title 4, Chapter 1',
    description: 'Business license requirements and procedures',
    category: 'business-regulation',
    lastUpdated: '2024-04-12',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-7',
    keywords: ['business', 'license', 'permits', 'regulation', 'commercial'],
  },

  // Title 5: Public Safety
  {
    id: 'title-5-chapter-1',
    title: 'Police Regulations',
    chapter: 'Title 5, Chapter 1',
    description: 'Police department regulations and procedures',
    category: 'public-safety',
    lastUpdated: '2024-05-08',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-8',
    keywords: ['police', 'law enforcement', 'public safety', 'regulations'],
  },
  {
    id: 'title-5-chapter-2',
    title: 'Fire Prevention and Protection',
    chapter: 'Title 5, Chapter 2',
    description: 'Fire prevention, fire department, and fire safety regulations',
    category: 'public-safety',
    lastUpdated: '2024-05-08',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-9',
    keywords: ['fire', 'fire prevention', 'fire safety', 'fire department'],
  },

  // Title 6: Animals
  {
    id: 'title-6-chapter-1',
    title: 'Animal Control',
    chapter: 'Title 6, Chapter 1',
    description: 'Animal control regulations, licensing, and enforcement',
    category: 'animals',
    lastUpdated: '2024-06-20',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-10',
    keywords: ['animals', 'animal control', 'pets', 'licensing', 'dogs', 'cats'],
  },
  {
    id: 'title-6-chapter-2',
    title: 'Dog Licensing',
    chapter: 'Title 6, Chapter 2',
    description: 'Dog licensing requirements and procedures',
    category: 'animals',
    lastUpdated: '2024-06-20',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-11',
    keywords: ['dog', 'licensing', 'pets', 'registration'],
  },

  // Title 7: Health and Sanitation
  {
    id: 'title-7-chapter-1',
    title: 'Public Health',
    chapter: 'Title 7, Chapter 1',
    description: 'Public health regulations and standards',
    category: 'health-sanitation',
    lastUpdated: '2024-07-10',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-12',
    keywords: ['health', 'public health', 'sanitation', 'regulations'],
  },

  // Title 8: Buildings and Construction
  {
    id: 'title-8-chapter-1',
    title: 'Building Code',
    chapter: 'Title 8, Chapter 1',
    description: 'Building code requirements and standards',
    category: 'buildings-construction',
    lastUpdated: '2024-08-15',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-13',
    keywords: ['building', 'construction', 'code', 'standards', 'permits'],
  },
  {
    id: 'title-8-chapter-2',
    title: 'Electrical Code',
    chapter: 'Title 8, Chapter 2',
    description: 'Electrical code requirements and standards',
    category: 'buildings-construction',
    lastUpdated: '2024-08-15',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-14',
    keywords: ['electrical', 'code', 'wiring', 'permits'],
  },

  // Title 9: Planning and Zoning
  {
    id: 'title-9-chapter-1',
    title: 'Zoning Regulations',
    chapter: 'Title 9, Chapter 1',
    description: 'Zoning districts, uses, and regulations',
    category: 'planning-zoning',
    lastUpdated: '2024-09-01',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-15',
    keywords: ['zoning', 'land use', 'planning', 'districts', 'regulations'],
  },
  {
    id: 'title-9-chapter-2',
    title: 'Subdivisions',
    chapter: 'Title 9, Chapter 2',
    description: 'Subdivision regulations and approval processes',
    category: 'planning-zoning',
    lastUpdated: '2024-09-01',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-16',
    keywords: ['subdivision', 'development', 'planning', 'approval'],
  },

  // Title 10: Public Works
  {
    id: 'title-10-chapter-1',
    title: 'Streets and Sidewalks',
    chapter: 'Title 10, Chapter 1',
    description: 'Street and sidewalk construction, maintenance, and use',
    category: 'public-works',
    lastUpdated: '2024-10-05',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-17',
    keywords: ['streets', 'sidewalks', 'public works', 'maintenance', 'construction'],
  },

  // Title 11: Utilities
  {
    id: 'title-11-chapter-1',
    title: 'Water System',
    chapter: 'Title 11, Chapter 1',
    description: 'Water utility system regulations and rates',
    category: 'utilities',
    lastUpdated: '2024-11-12',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-18',
    keywords: ['water', 'utilities', 'water system', 'rates'],
  },
  {
    id: 'title-11-chapter-2',
    title: 'Sewer System',
    chapter: 'Title 11, Chapter 2',
    description: 'Sewer utility system regulations and rates',
    category: 'utilities',
    lastUpdated: '2024-11-12',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-19',
    keywords: ['sewer', 'utilities', 'wastewater', 'rates'],
  },

  // Title 12: Parks and Recreation
  {
    id: 'title-12-chapter-1',
    title: 'Parks and Recreation Facilities',
    chapter: 'Title 12, Chapter 1',
    description: 'Parks, recreation facilities, and their use',
    category: 'parks-recreation',
    lastUpdated: '2024-12-01',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-20',
    keywords: ['parks', 'recreation', 'facilities', 'community'],
  },

  // Title 13: Environmental
  {
    id: 'title-13-chapter-1',
    title: 'Environmental Protection',
    chapter: 'Title 13, Chapter 1',
    description: 'Environmental protection and conservation regulations',
    category: 'environmental',
    lastUpdated: '2025-01-10',
    externalUrl: 'https://codelibrary.amlegal.com/codes/wellsvilleut/latest/wellsville_ut/0-0-0-21',
    keywords: ['environment', 'environmental', 'protection', 'conservation'],
  },
];
