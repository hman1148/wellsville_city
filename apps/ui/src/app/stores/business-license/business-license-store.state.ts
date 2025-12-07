import { BusinessLicenseApplication } from '../../services/business-license.service';

export type BusinessLicenseStoreState = {
  isLoading: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  applications: BusinessLicenseApplication[];
  currentApplication: BusinessLicenseApplication | null;
};

export const initialBusinessLicenseStoreState = (): BusinessLicenseStoreState => ({
  isLoading: false,
  isSubmitting: false,
  submitSuccess: false,
  submitError: null,
  applications: [],
  currentApplication: null,
});
