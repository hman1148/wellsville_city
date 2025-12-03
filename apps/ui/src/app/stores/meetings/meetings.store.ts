import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialMeetingsStoreState } from './meetings-store.state';
import { Meeting, initialMeeting, MeetingType } from '../../models';
import { MeetingsService } from '../../services/meetings.service';
import { MessageService } from 'primeng/api';

export const MeetingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialMeetingsStoreState()),
  withMethods((store, meetingsService = inject(MeetingsService), messageService = inject(MessageService)) => ({
    resolveMeetings: async (meetingType?: MeetingType) => {
      // Check if this specific meeting type has already been loaded
      const cacheKey = meetingType || 'all';
      if (store.loadedMeetingTypes().has(cacheKey)) {
        return true;
      }

      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          meetingsService.getMeetings(meetingType)
        );

        if (success) {
          const sortedMeetings = items.sort(
            (a, b) =>
              new Date(b.meetingDate).getTime() -
              new Date(a.meetingDate).getTime()
          );

          // Filter upcoming meetings
          const upcoming = sortedMeetings.filter(
            (meeting) => meeting.status === 'upcoming'
          );

          // Update loaded meeting types
          const updatedLoadedTypes = new Set(store.loadedMeetingTypes());
          updatedLoadedTypes.add(cacheKey);

          patchState(store, {
            meetings: sortedMeetings,
            upcomingMeetings: upcoming,
            isLoading: false,
            loadedMeetingTypes: updatedLoadedTypes,
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

    resolveUpcomingMeetings: async (meetingType?: MeetingType) => {
      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          meetingsService.getUpcomingMeetings(meetingType)
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

    refreshMeetings: async (meetingType?: MeetingType) => {
      const cacheKey = meetingType || 'all';

      // Remove from loaded types to force reload
      const updatedLoadedTypes = new Set(store.loadedMeetingTypes());
      updatedLoadedTypes.delete(cacheKey);

      patchState(store, {
        isLoading: true,
        loadedMeetingTypes: updatedLoadedTypes
      });

      try {
        const { items, success } = await firstValueFrom(
          meetingsService.getMeetings(meetingType)
        );

        if (success) {
          const sortedMeetings = items.sort(
            (a, b) =>
              new Date(b.meetingDate).getTime() -
              new Date(a.meetingDate).getTime()
          );

          const upcoming = sortedMeetings.filter(
            (meeting) => meeting.status === 'upcoming'
          );

          // Add back to loaded types
          const finalLoadedTypes = new Set(store.loadedMeetingTypes());
          finalLoadedTypes.add(cacheKey);

          patchState(store, {
            meetings: sortedMeetings,
            upcomingMeetings: upcoming,
            isLoading: false,
            loadedMeetingTypes: finalLoadedTypes,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error refreshing meetings:', error);
        patchState(store, { isLoading: false });
      }
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
