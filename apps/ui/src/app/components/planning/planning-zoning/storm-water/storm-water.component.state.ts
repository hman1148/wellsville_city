export type StormWaterState = {
  showManagementPlan: boolean;
  activeSection: string | null;
};

export const initialStormWaterState = (): StormWaterState => ({
  showManagementPlan: false,
  activeSection: null,
});
