import { signalStore, withState } from '@ngrx/signals';
import { initialPlanningZoningState } from './planning-zoning-store.state';

export const PlanningZoningStore = signalStore(
  { providedIn: 'root' },
  withState(initialPlanningZoningState())
);
