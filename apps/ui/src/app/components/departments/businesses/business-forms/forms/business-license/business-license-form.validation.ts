import { create, enforce, test } from 'vest';
import { BusinessLicenseFormData } from './business-license-form.state';

export const businessLicenseFormSuite = create(
  'businessLicenseFormSuite',
  (data: Partial<BusinessLicenseFormData>) => {
    test('utahSalesTaxId', 'Utah Sales Tax ID is required', () => {
      enforce(data.utahSalesTaxId).isNotBlank();
    });

    test('businessName', 'Business name is required', () => {
      enforce(data.businessName).isNotBlank();
    });

    test('businessName', 'Business name must be at least 2 characters', () => {
      enforce(data.businessName).longerThanOrEquals(2);
    });

    test('phone', 'Phone number is required', () => {
      enforce(data.phone).isNotBlank();
    });

    test('phone', 'Please enter a valid phone number', () => {
      enforce(data.phone).matches(/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/);
    });

    test('businessLocation', 'Business location is required', () => {
      enforce(data.businessLocation).isNotBlank();
    });

    test('businessZip', 'Zip code is required', () => {
      enforce(data.businessZip).isNotBlank();
    });

    test('businessZip', 'Please enter a valid zip code', () => {
      enforce(data.businessZip).matches(/^\d{5}(-\d{4})?$/);
    });

    // Conditional validation for mailing zip if mailing address is provided
    if (data.mailingAddress && data.mailingAddress.trim()) {
      test('mailingZip', 'Please enter a valid zip code', () => {
        enforce(data.mailingZip).matches(/^\d{5}(-\d{4})?$/);
      });
    }

    test('localAgentContact', 'Local agent contact is required', () => {
      enforce(data.localAgentContact).isNotBlank();
    });

    test('localAgentPhone', 'Local agent phone is required', () => {
      enforce(data.localAgentPhone).isNotBlank();
    });

    test('localAgentPhone', 'Please enter a valid phone number', () => {
      enforce(data.localAgentPhone).matches(/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/);
    });

    test('openingDate', 'Opening date is required', () => {
      enforce(data.openingDate).isNotEmpty();
    });

    test('isNewBusinessType', 'Please specify if this is a new business type', () => {
      enforce(data.isNewBusinessType).isNotUndefined();
    });

    test('locationType', 'Location type is required', () => {
      enforce(data.locationType).isNotBlank();
    });

    test('licensePeriod', 'License period is required', () => {
      enforce(data.licensePeriod).isNotBlank();
    });

    test('previouslyLicensed', 'Please specify if previously licensed', () => {
      enforce(data.previouslyLicensed).isNotUndefined();
    });

    test('businessTypeActivity', 'Business type activity is required', () => {
      enforce(data.businessTypeActivity).isNotBlank();
    });

    test('businessTypeActivity', 'Business type activity must be at least 3 characters', () => {
      enforce(data.businessTypeActivity).longerThanOrEquals(3);
    });

    test('ownershipType', 'Ownership type is required', () => {
      enforce(data.ownershipType).isNotBlank();
    });

    // Conditional validation for corporation name
    if (data.ownershipType === 'corporation') {
      test('corporationName', 'Corporation name is required', () => {
        enforce(data.corporationName).isNotBlank();
      });
    }

    // Conditional validation for other ownership description
    if (data.ownershipType === 'other') {
      test('ownershipOtherDescription', 'Please describe the ownership type', () => {
        enforce(data.ownershipOtherDescription).isNotBlank();
      });
    }

    test('ownerName', 'Owner name is required', () => {
      enforce(data.ownerName).isNotBlank();
    });

    test('ownerAddress', 'Owner address is required', () => {
      enforce(data.ownerAddress).isNotBlank();
    });

    test('agreesToTerms', 'You must agree to the terms and conditions', () => {
      enforce(data.agreesToTerms).isTruthy();
    });
  }
);
