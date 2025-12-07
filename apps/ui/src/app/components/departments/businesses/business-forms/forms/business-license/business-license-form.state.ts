import { create } from 'vest';
import { businessLicenseFormSuite } from './business-license-form.validation';

export type LocationType = 'residential' | 'commercial';
export type OwnershipType = 'sole-owner' | 'partnership' | 'corporation' | 'other';

export type BusinessLicenseFormData = {
  utahSalesTaxId: string;
  businessName: string;
  phone: string;
  businessLocation: string;
  businessZip: string;
  mailingAddress?: string;
  mailingZip?: string;
  localAgentContact: string;
  localAgentPhone: string;
  openingDate: string;
  isNewBusinessType: boolean;
  locationType: LocationType;
  licensePeriod: string;
  previouslyLicensed: boolean;
  businessTypeActivity: string;
  ownershipType: OwnershipType;
  ownershipOtherDescription?: string;
  corporationName?: string;
  ownerName: string;
  ownerAddress: string;
  attachedDocuments?: File[];
  agreesToTerms: boolean;
};

export type BusinessLicenseFormState = {
  formData: Partial<BusinessLicenseFormData>;
  isSubmitting: boolean;
  submitSuccess: boolean;
  uploadedFiles: File[];
  fieldTouched: { [key: string]: boolean };
};

export const initialBusinessLicenseFormState = (): BusinessLicenseFormState => ({
  formData: {
    utahSalesTaxId: '',
    businessName: '',
    phone: '',
    businessLocation: '',
    businessZip: '',
    mailingAddress: '',
    mailingZip: '',
    localAgentContact: '',
    localAgentPhone: '',
    openingDate: '',
    isNewBusinessType: false,
    locationType: 'commercial',
    licensePeriod: '',
    previouslyLicensed: false,
    businessTypeActivity: '',
    ownershipType: 'sole-owner',
    ownershipOtherDescription: '',
    corporationName: '',
    ownerName: '',
    ownerAddress: '',
    agreesToTerms: false,
  },
  isSubmitting: false,
  submitSuccess: false,
  uploadedFiles: [],
  fieldTouched: {},
});

// Create a stateful suite for business license form management
export const businessLicenseStateSuite = create(
  'businessLicenseStateSuite',
  (data: Partial<BusinessLicenseFormData>) => {
    return businessLicenseFormSuite(data);
  }
);
