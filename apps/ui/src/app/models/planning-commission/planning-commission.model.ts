export type PlanningCommissioner = {
  name: string;
  position: string;
  termExpires: string;
  phone?: string;
};

export const initialPlanningCommissioner = (): PlanningCommissioner => ({
  name: '',
  position: '',
  termExpires: '',
  phone: undefined,
});

export type PlanningCommissionInfo = {
  meetingSchedule: string;
  meetingLocation: string;
  meetingTime: string;
  adaNotice: string;
  purpose: string;
  description: string;
  responsibilities: string[];
  commissioners: PlanningCommissioner[];
  cityCouncilRep: PlanningCommissioner;
};

export const initialPlanningCommissionInfo = (): PlanningCommissionInfo => ({
  meetingSchedule: '',
  meetingLocation: '',
  meetingTime: '',
  adaNotice: '',
  purpose: '',
  description: '',
  responsibilities: [],
  commissioners: [],
  cityCouncilRep: initialPlanningCommissioner(),
});
