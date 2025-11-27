import { Meeting, initialMeeting } from '../../models';

export type MeetingsStoreState = {
  isEntitiesLoaded: boolean;
  isLoading: boolean;
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  selectedMeeting: Meeting;
};

export const initialMeetingsStoreState = (): MeetingsStoreState => ({
  isEntitiesLoaded: false,
  isLoading: false,
  meetings: [],
  upcomingMeetings: [],
  selectedMeeting: initialMeeting(),
});
