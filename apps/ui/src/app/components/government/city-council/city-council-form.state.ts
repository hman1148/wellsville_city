import { create } from 'vest';
import { CouncilMember, CouncilContactForm } from '../../../models';
import { cityCouncilFormSuite } from './city-council-form.validation';

export type CityCouncilFormState = {
  councilMembers: CouncilMember[];
  formData: Partial<CouncilContactForm>;
  selectedMember: CouncilMember | null;
  showContactDialog: boolean;
  isSubmitting: boolean;
  fieldTouched: { [key: string]: boolean };
};

export const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'bob-lindley',
    name: 'Bob Lindley',
    role: 'Mayor',
    photoPath: '/Government/BobLindley.jpg',
    email: 'blindley@wellsvillecity.com',
    phone: '(435)881-4186',
    termExpires: 'December 31, 2027',
    assignments: [
      'Parks & Recreation',
      'Cemetery',
      'Memorial Day Program',
      'Storm Water',
      'Environmental',
    ],
    foundersDayDuties: [
      'Golf Tournament',
      'Tennis Tournament',
      'Softball Tournament',
    ],
  },
  {
    id: 'kaylene-ames',
    name: 'Kaylene Ames',
    role: 'City Council',
    photoPath: '/Government/KayleneAmes.jpg',
    email: 'kames@wellsvillecity.com',
    phone: '(435)245-6950',
    termExpires: 'December 31, 2025',
    assignments: [
      'Arbor Day',
      'Shade Tree & Beautification',
      'Miss Wellsville Scholarship Pageant',
    ],
    foundersDayDuties: [
      'Chairperson',
      'Community Breakfast',
      'Amusement Rides',
      'Music in the Park',
    ],
  },
  {
    id: 'carl-leatham',
    name: 'Carl Leatham',
    role: 'City Council',
    photoPath: '/Government/CarlLeatham.jpg',
    email: 'cleatham@wellsvillecity.com',
    phone: '(435)757-7268',
    termExpires: 'December 31, 2027',
    assignments: [
      'Planning & Zoning',
      'Law Enforcement',
      'Animal Control',
      'Trails/Walking Paths',
    ],
    foundersDayDuties: ['Sham Battle', 'Watermelon Bust', 'Fun Run'],
  },
  {
    id: 'denise-lindsay',
    name: 'Denise Lindsay',
    role: 'City Council',
    photoPath: '/Government/DeniseLindsay.jpg',
    email: 'dlindsay@wellsvillecity.com',
    phone: '(435)770-3125',
    termExpires: 'December 31, 2027',
    assignments: ['Sidewalks', 'Youth Council', 'Web Page'],
    foundersDayDuties: [
      'Quilt Drawing',
      'Dutch Oven Meal',
      'Family Activity',
      'Fireworks',
    ],
  },
  {
    id: 'austin-wood',
    name: 'Austin Wood',
    role: 'City Council',
    photoPath: '/Government/AustinWood.jpg',
    email: 'awood@wellsvillecity.com',
    phone: '(435)757-5581',
    termExpires: 'December 31, 2025',
    assignments: [
      'Culinary Water',
      'Emergency Plan & CERT Training',
      'First Responders',
      'Mosquito Abatement',
      'Roads',
      'Gravel Pit',
    ],
    foundersDayDuties: ['Sham Battle', 'Vendor Booths', 'Cannon'],
  },
];

export const initialCityCouncilFormState = (): CityCouncilFormState => ({
  councilMembers: COUNCIL_MEMBERS,
  formData: {
    councilMemberId: '',
    councilMemberName: '',
    councilMemberEmail: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    fromPhone: '',
    message: '',
  },
  selectedMember: null,
  showContactDialog: false,
  isSubmitting: false,
  fieldTouched: {},
});

// Create a stateful suite for city council form management
export const cityCouncilStateSuite = create(
  'cityCouncilStateSuite',
  (data: Partial<CouncilContactForm>) => {
    return cityCouncilFormSuite(data);
  }
);
