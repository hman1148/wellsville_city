import { Route } from '@angular/router';
import { HOME_ROUTES } from './components/home/home.routes';
import { CITIZENS_ROUTES } from './components/citizens/citizens.routes';
import { GOVERNMENT_ROUTES } from './components/government/government.routes';
import { DEPARTMENTS_ROUTES } from './components/departments/departments.routes';
import { INFORMATION_ROUTES } from './components/information/information.routes';
import { CITIZEN_REPORTS_ROUTES } from './components/admin/citizen-reports/citizen-reports.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      HOME_ROUTES,
      CITIZENS_ROUTES,
      GOVERNMENT_ROUTES,
      DEPARTMENTS_ROUTES,
      INFORMATION_ROUTES,
      CITIZEN_REPORTS_ROUTES,
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
