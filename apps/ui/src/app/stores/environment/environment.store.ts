import { signalStore, withState, withMethods } from '@ngrx/signals';
import { computed } from '@angular/core';

export type EnvironmentState = {
  apiUrl: string;
  production: boolean;
};

const initialState: EnvironmentState = {
  apiUrl: '',
  production: false,
};

export const EnvironmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setApiUrl: (url: string) => {
      // Method to set API URL if needed in the future
    },
  }))
);
