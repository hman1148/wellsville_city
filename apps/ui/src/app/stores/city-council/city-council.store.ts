import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';

import { initialCityCouncilStoreState } from './city-council-store.state';
import { CouncilMember } from '../../models';

export const CityCouncilStore = signalStore(
  { providedIn: 'root' },
  withState(initialCityCouncilStoreState()),
  withMethods((store) => ({
    selectMember: (member: CouncilMember) => {
      patchState(store, {
        selectedMember: member,
      });
    },

    clearSelectedMember: () => {
      patchState(store, {
        selectedMember: null,
      });
    },

    resetStore: () => {
      patchState(store, initialCityCouncilStoreState());
    },
  }))
);
