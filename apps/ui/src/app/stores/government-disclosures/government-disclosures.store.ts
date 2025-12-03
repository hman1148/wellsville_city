import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialGovernmentDisclosuresStoreState } from './government-disclosures-store.state';
import { GovernmentDisclosure } from '../../models';
import { GovernmentDisclosuresService } from '../../services/government-disclosures.service';

const collection = 'governmentDisclosures';

export const GovernmentDisclosuresStore = signalStore(
  { providedIn: 'root' },
  withState(initialGovernmentDisclosuresStoreState()),
  withEntities({
    entity: type<GovernmentDisclosure>(),
    collection: collection,
  }),
  withMethods(
    (
      store,
      disclosuresService = inject(GovernmentDisclosuresService)
    ) => ({
      resolveDisclosures: async () => {
        if (store.isEntitiesLoaded()) {
          return true;
        }

        patchState(store, { isLoading: true });

        try {
          const { items, success } = await firstValueFrom(
            disclosuresService.getDisclosures()
          );

          if (success) {
            patchState(
              store,
              setAllEntities(items, {
                collection: collection,
                selectId: (disclosure: GovernmentDisclosure) => disclosure.id,
              }),
              {
                isLoading: false,
                isEntitiesLoaded: true,
              }
            );
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error('Error loading government disclosures:', error);
          patchState(store, { isLoading: false });
        }

        return true;
      },

      resolveDisclosuresByCategory: async (category: string) => {
        patchState(store, { isLoading: true, selectedCategory: category });

        try {
          const { items, success } = await firstValueFrom(
            disclosuresService.getDisclosuresByCategory(category)
          );

          if (success) {
            patchState(
              store,
              setAllEntities(items, {
                collection: collection,
                selectId: (disclosure: GovernmentDisclosure) => disclosure.id,
              }),
              {
                isLoading: false,
              }
            );
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error(
            'Error loading disclosures by category:',
            error
          );
          patchState(store, { isLoading: false });
        }

        return true;
      },

      resolveDisclosuresByYear: async (year: number) => {
        patchState(store, { isLoading: true, selectedYear: year });

        try {
          const { items, success } = await firstValueFrom(
            disclosuresService.getDisclosuresByYear(year)
          );

          if (success) {
            patchState(
              store,
              setAllEntities(items, {
                collection: collection,
                selectId: (disclosure: GovernmentDisclosure) => disclosure.id,
              }),
              {
                isLoading: false,
              }
            );
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error('Error loading disclosures by year:', error);
          patchState(store, { isLoading: false });
        }

        return true;
      },

      refreshDisclosures: async () => {
        patchState(store, { isLoading: true, isEntitiesLoaded: false });

        try {
          const { items, success } = await firstValueFrom(
            disclosuresService.getDisclosures()
          );

          if (success) {
            patchState(
              store,
              setAllEntities(items, {
                collection: collection,
                selectId: (disclosure: GovernmentDisclosure) => disclosure.id,
              }),
              {
                isLoading: false,
                isEntitiesLoaded: true,
              }
            );
          } else {
            patchState(store, { isLoading: false });
          }
        } catch (error) {
          console.error('Error refreshing government disclosures:', error);
          patchState(store, { isLoading: false });
        }

        return true;
      },

      setSelectedCategory: (category: string) => {
        patchState(store, { selectedCategory: category });
      },

      setSelectedYear: (year: number | null) => {
        patchState(store, { selectedYear: year });
      },

      clearFilters: () => {
        patchState(store, {
          selectedCategory: '',
          selectedYear: null,
        });
      },
    })
  )
);
