import { Meeting, initialMeeting, MeetingType } from '../../models';

export type MeetingsStoreState = {
  loadedMeetingTypes: Set<MeetingType | 'all'>;
  isLoading: boolean;
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  selectedMeeting: Meeting;
  isEntitiesLoaded: boolean;
};

export const initialMeetingsStoreState = (): MeetingsStoreState => ({
  loadedMeetingTypes: new Set(),
  isLoading: false,
  meetings: [],
  upcomingMeetings: [],
  selectedMeeting: initialMeeting(),
  isEntitiesLoaded: false,
});
