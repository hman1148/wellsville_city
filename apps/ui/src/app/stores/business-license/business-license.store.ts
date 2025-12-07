import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { SuiteResult } from 'vest';

import { MessageService } from 'primeng/api';

import { initialBusinessLicenseStoreState } from './business-license-store.state';
import { BusinessLicenseService } from '../../services/business-license.service';
import { BusinessLicenseFormData } from '../../components/departments/businesses/business-forms/forms/business-license/business-license-form.state';

export const BusinessLicenseStore = signalStore(
  { providedIn: 'root' },
  withState(initialBusinessLicenseStoreState()),
  withMethods(
    (
      store,
      businessLicenseService = inject(BusinessLicenseService),
      messageService = inject(MessageService),
      router = inject(Router)
    ) => ({
      /**
       * Validate and submit a new business license application
       */
      submitApplication: async (
        formData: Partial<BusinessLicenseFormData>,
        uploadedFiles: File[],
        vestResult: SuiteResult<string, string>
      ): Promise<boolean> => {
        // Validate form data using Vest
        if (!vestResult.isValid()) {
          messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please fill in all required fields correctly',
            life: 3000,
          });
          return false;
        }

        patchState(store, {
          isSubmitting: true,
          submitSuccess: false,
          submitError: null,
        });

        try {
          // Upload files to S3 first
          const uploadedFileUrls: string[] = [];

          for (const file of uploadedFiles) {
            try {
              const { url, key, success } = await firstValueFrom(
                businessLicenseService.getUploadUrl(file.name, file.type)
              );

              if (success && url) {
                // Upload to S3
                await fetch(url, {
                  method: 'PUT',
                  body: file,
                  headers: {
                    'Content-Type': file.type,
                  },
                });

                uploadedFileUrls.push(key);
              }
            } catch (fileError) {
              console.error('Error uploading file:', file.name, fileError);
            }
          }

          // Submit application with file references
          const applicationData: BusinessLicenseFormData = {
            ...formData as BusinessLicenseFormData,
            attachedDocuments: uploadedFiles, // Keep file metadata for reference
          };

          const { item, success, message } = await firstValueFrom(
            businessLicenseService.submitApplication(applicationData)
          );

          if (success && item) {
            patchState(store, {
              isSubmitting: false,
              submitSuccess: true,
              currentApplication: item,
            });

            messageService.add({
              severity: 'success',
              summary: 'Application Submitted',
              detail:
                'Your business license application has been submitted successfully. You will receive a confirmation email shortly.',
              life: 5000,
            });

            // Navigate back after short delay to allow user to see success message
            setTimeout(() => {
              router.navigate(['/departments/businesses/forms']);
            }, 2000);

            return true;
          } else {
            throw new Error(message || 'Failed to submit application');
          }
        } catch (error) {
          console.error('Error submitting business license application:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to submit application. Please try again.';

          patchState(store, {
            isSubmitting: false,
            submitSuccess: false,
            submitError: errorMessage,
          });

          messageService.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: errorMessage,
            life: 5000,
          });

          return false;
        }
      },

      /**
       * Get all business license applications (admin only)
       */
      loadApplications: async (): Promise<void> => {
        patchState(store, { isLoading: true });

        try {
          const { items, success } = await firstValueFrom(
            businessLicenseService.getApplications()
          );

          if (success) {
            patchState(store, {
              applications: items,
              isLoading: false,
            });
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error('Error loading business license applications:', error);
          patchState(store, { isLoading: false });

          messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load applications',
          });
        }
      },

      /**
       * Get a specific business license application by ID
       */
      loadApplication: async (id: string): Promise<void> => {
        patchState(store, { isLoading: true });

        try {
          const { item, success } = await firstValueFrom(
            businessLicenseService.getApplication(id)
          );

          if (success && item) {
            patchState(store, {
              currentApplication: item,
              isLoading: false,
            });
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error('Error loading business license application:', error);
          patchState(store, { isLoading: false });

          messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load application',
          });
        }
      },

      /**
       * Reset the store to initial state
       */
      resetStore: (): void => {
        patchState(store, initialBusinessLicenseStoreState());
      },

      /**
       * Clear submission state
       */
      clearSubmissionState: (): void => {
        patchState(store, {
          submitSuccess: false,
          submitError: null,
        });
      },

      /**
       * Cancel form and navigate back to forms list
       */
      cancelAndNavigateBack: (): void => {
        router.navigate(['/departments/businesses/forms']);
      },
    })
  )
);
