import { Route } from '@angular/router';
import { GovernmentComponent } from './government.component';

export const GOVERNMENT_ROUTES: Route[] = [
  {
    path: 'government',
    component: GovernmentComponent,
  },
  {
    path: 'government/city-council',
    loadComponent: () =>
      import('./city-council/city-council.component').then(
        (m) => m.CityCouncilComponent
      ),
  },
  {
    path: 'government/meetings',
    loadComponent: () =>
      import('./meetings/meetings.component').then(
        (m) => m.MeetingsComponent
      ),
  },
];
