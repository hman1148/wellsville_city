export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  icon: string;
  category: 'general' | 'application' | 'renewal' | 'home-business';
};

export type ContactInfo = {
  email: string;
  phone: string;
  address: string[];
  officeHours: string[];
};

export type BusinessLicenseInformationComponentState = {
  faqs: FAQItem[];
  contactInfo: ContactInfo;
  showAllFaqs: boolean;
};

export const initialBusinessLicenseInformationComponentState =
  (): BusinessLicenseInformationComponentState => ({
    showAllFaqs: false,

    faqs: [
      {
        id: 'unlicensed-business',
        question:
          "What should I do if I know of a business operating in Wellsville that isn't licensed?",
        answer:
          'Contact the city offices and we will investigate. All businesses operating in Wellsville require a business license. Failure to obtain a license is a Class B misdemeanor.',
        icon: 'pi-exclamation-triangle',
        category: 'general',
      },
      {
        id: 'get-license',
        question: 'How do I get a business license?',
        answer:
          'Complete the application form and return it to the city. You will be scheduled to meet before the City Council for approval of the license. If you want to run your business from your home, you will need to first apply for a conditional use for a "Home Occupation". This entails appearing before the Planning and Zoning Commission in a public hearing. Nearby property owners will be notified of the public hearing and given the opportunity to speak. If the P&Z Commission approves the Home Occupancy Permit, then you need to appear before the City Council as detailed above.',
        icon: 'pi-file-edit',
        category: 'application',
      },
      {
        id: 'license-validity',
        question: 'How long is a business license valid?',
        answer:
          'Business licenses run from January 1 through December 31 each year. Licenses are automatically renewed each year on January 1st upon completion of a renewal form and payment of the yearly license fee, unless there is a change in the type of business being conducted. This would require the application to again appear before the city council for approval. Business license fees are due and payable before each calendar year in advance. License fees become delinquent if not paid by February 1 of each year and are subject to a penalty for late payment. Licenses not renewed before March 31st will be canceled.',
        icon: 'pi-calendar',
        category: 'renewal',
      },
      {
        id: 'home-business',
        question: 'I want to run a business from my home. Is that okay?',
        answer:
          'Maybe. Running a business from your home, either part-time or full-time, requires a Home Occupancy business license. The purpose of the Home Occupancy ordinance is to ensure that residential areas within the City stay residential in both appearance and level of activity. Businesses that generate a large volume of traffic, either through customers or employees, are not permitted. Home occupancy businesses should not require frequent deliveries, nor should they generate excessive noise or have equipment that is stored outside of the home. In general, the appearance and feel of the residential area should not be disturbed by the presence of the business.',
        icon: 'pi-home',
        category: 'home-business',
      },
      {
        id: 'why-license',
        question: 'Why does Wellsville require businesses to be licensed?',
        answer:
          'Municipalities are allowed to require business licenses to assist in orderly business development, to ensure compliance with land-use and building regulations, and to facilitate planning decisions.',
        icon: 'pi-question-circle',
        category: 'general',
      },
      {
        id: 'signage',
        question:
          'Can I put up a sign in front of my house advertising my business?',
        answer:
          "All signs must comply with the city's sign ordinance. Home Occupancy businesses are not permitted to have signage.",
        icon: 'pi-sign-in',
        category: 'home-business',
      },
    ],

    contactInfo: {
      email: 'DLindsay@WellsvilleCity.com',
      phone: '(435) 245-3500',
      address: [
        'Wellsville City Office',
        '75 East Main Street',
        'Wellsville, UT 84339',
      ],
      officeHours: [
        'Monday - Thursday: 8:00 AM - 5:00 PM',
        'Friday: 8:00 AM - 12:00 PM',
      ],
    },
  });
