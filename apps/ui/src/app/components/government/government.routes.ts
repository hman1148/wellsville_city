import { Route } from '@angular/router';
import { GovernmentComponent } from './government.component';

export const GOVERNMENT_ROUTES: Route = {
  path: 'government',
  component: GovernmentComponent,
  children: [
    // Add child routes here as the section expands
    // Example:
    // {
    //   path: 'mayor',
    //   loadComponent: () =>
    //     import('./mayor/mayor.component').then((m) => m.MayorComponent),
    // },
    // {
    //   path: 'city-council',
    //   loadComponent: () =>
    //     import('./city-council/city-council.component').then(
    //       (m) => m.CityCouncilComponent
    //     ),
    // },
    // {
    //   path: 'planning-zoning',
    //   loadComponent: () =>
    //     import('./planning-zoning/planning-zoning.component').then(
    //       (m) => m.PlanningZoningComponent
    //     ),
    // },
  ],
};
