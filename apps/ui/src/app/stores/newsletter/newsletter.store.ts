import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialNewsletterStoreState } from './newsletter-store.state';
import { Newsletter, initialNewsletter } from '../../models';
import { NewsletterService } from '../../services/newsletter.service';

export const NewsletterStore = signalStore(
  { providedIn: 'root' },
  withState(initialNewsletterStoreState()),
  withMethods((store, newsletterService = inject(NewsletterService)) => ({
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
        }
      } catch (error) {
        console.error('Error loading newsletters:', error);
        patchState(store, { isLoading: false });
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
