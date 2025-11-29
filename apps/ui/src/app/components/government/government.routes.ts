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
    path: 'government/city-council/contact',
    loadComponent: () =>
      import('./city-council/council-contact/council-contact.component').then(
        (m) => m.CouncilContactComponent
      ),
  },
  {
    path: 'government/meetings',
    loadComponent: () =>
      import('./meetings/meetings.component').then(
        (m) => m.MeetingsComponent
      ),
  },
  {
    path: 'government/ordinances',
    loadComponent: () =>
      import('./ordinances/ordinances.component').then(
        (m) => m.OrdinancesComponent
      ),
  },
];
