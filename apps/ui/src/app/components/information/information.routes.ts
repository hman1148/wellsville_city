import { Route } from '@angular/router';
import { InformationComponent } from './information.component';

export const INFORMATION_ROUTES: Route[] = [
  {
    path: 'information',
    component: InformationComponent,
    children: [
      // Add child routes here as the section expands
      // Example:
      // {
      //   path: 'events',
      //   loadComponent: () =>
      //     import('./events/events.component').then((m) => m.EventsComponent),
      // },
      // {
      //   path: 'history',
      //   loadComponent: () =>
      //     import('./history/history.component').then((m) => m.HistoryComponent),
      // },
      // {
      //   path: 'community-center',
      //   loadComponent: () =>
      //     import('./community-center/community-center.component').then(
      //       (m) => m.CommunityCenterComponent
      //     ),
      // },
    ],
  },
];
