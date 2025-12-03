import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';

import { initialNewsletterStoreState } from './newsletter-store.state';
import { Newsletter, initialNewsletter } from '../../models';
import { NewsletterService } from '../../services/newsletter.service';

export const NewsletterStore = signalStore(
  { providedIn: 'root' },
  withState(initialNewsletterStoreState()),
  withMethods((store, newsletterService = inject(NewsletterService), messageService = inject(MessageService)) => ({
    resolveNewsletters: async () => {
      if (store.isEntitiesLoaded()) {
        return true;
      }

      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          newsletterService.getNewsletters()
        );

        if (success) {
          // Sort newsletters by publish date (newest first)
          const sortedNewsletters = items.sort(
            (a, b) =>
              new Date(b.publishDate).getTime() -
              new Date(a.publishDate).getTime()
          );

          patchState(store, {
            newsletters: sortedNewsletters,
            isLoading: false,
            isEntitiesLoaded: true,
          });
        } else {
          patchState(store, { isLoading: false });
          messageService.add({
            severity: 'error',
            summary: 'Failed to Load Newsletters',
            detail: 'Unable to retrieve newsletters. Please try again later.',
            life: 5000,
          });
        }
      } catch (error) {
        console.error('Error loading newsletters:', error);
        patchState(store, { isLoading: false });
        messageService.add({
          severity: 'error',
          summary: 'Failed to Load Newsletters',
          detail: 'An error occurred while loading newsletters. Please try again.',
          life: 5000,
        });
      }

      return true;
    },

    selectNewsletter: (newsletter: Newsletter) => {
      patchState(store, {
        selectedNewsletter: newsletter,
      });
    },

    setPreviewUrl: async (s3Key: string) => {
      try {
        const { url } = await firstValueFrom(
          newsletterService.getPresignedUrl(s3Key)
        );
        patchState(store, {
          previewUrl: url,
        });
      } catch (error) {
        console.error('Error getting presigned URL:', error);
        patchState(store, { previewUrl: '' });
        messageService.add({
          severity: 'error',
          summary: 'Failed to Load Preview',
          detail: 'Unable to load newsletter preview. Please try again.',
          life: 5000,
        });
      }
    },

    clearPreviewUrl: () => {
      patchState(store, {
        previewUrl: '',
        selectedNewsletter: initialNewsletter(),
      });
    },

    resetStore: () => {
      patchState(store, initialNewsletterStoreState());
    },
  }))
);
