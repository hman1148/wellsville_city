import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialMeetingsStoreState } from './meetings-store.state';
import { Meeting, initialMeeting } from '../../models';
import { MeetingsService } from '../../services/meetings.service';

export const MeetingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialMeetingsStoreState()),
  withMethods((store, meetingsService = inject(MeetingsService)) => ({
    resolveMeetings: async () => {
      // Prevent duplicate loading
      if (store.isEntitiesLoaded()) {
        return true;
      }

      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          meetingsService.getMeetings()
        );

        if (success) {
          // Sort meetings by date (newest first)
          const sortedMeetings = items.sort(
            (a, b) =>
              new Date(b.meetingDate).getTime() -
              new Date(a.meetingDate).getTime()
          );

          // Filter upcoming meetings
          const upcoming = sortedMeetings.filter(
            (meeting) => meeting.status === 'upcoming'
          );

          patchState(store, {
            meetings: sortedMeetings,
            upcomingMeetings: upcoming,
            isLoading: false,
            isEntitiesLoaded: true,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading meetings:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    resolveUpcomingMeetings: async () => {
      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          meetingsService.getUpcomingMeetings()
        );

        if (success) {
          // Sort meetings by date (soonest first)
          const sortedMeetings = items.sort(
            (a, b) =>
              new Date(a.meetingDate).getTime() -
              new Date(b.meetingDate).getTime()
          );

          patchState(store, {
            upcomingMeetings: sortedMeetings,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading upcoming meetings:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    selectMeeting: (meeting: Meeting) => {
      patchState(store, {
        selectedMeeting: meeting,
      });
    },

    clearSelectedMeeting: () => {
      patchState(store, {
        selectedMeeting: initialMeeting(),
      });
    },

    resetStore: () => {
      patchState(store, initialMeetingsStoreState());
    },
  }))
);
