import { Route } from '@angular/router';
import { DepartmentsComponent } from './departments.component';

export const DEPARTMENTS_ROUTES: Route = {
  path: 'departments',
  component: DepartmentsComponent,
  children: [
    // Add child routes here as the section expands
    // Example:
    // {
    //   path: 'parks-recreation',
    //   loadComponent: () =>
    //     import('./parks-recreation/parks-recreation.component').then(
    //       (m) => m.ParksRecreationComponent
    //     ),
    // },
    // {
    //   path: 'public-safety',
    //   loadComponent: () =>
    //     import('./public-safety/public-safety.component').then(
    //       (m) => m.PublicSafetyComponent
    //     ),
    // },
    // {
    //   path: 'cemetery',
    //   loadComponent: () =>
    //     import('./cemetery/cemetery.component').then((m) => m.CemeteryComponent),
    // },
  ],
};
