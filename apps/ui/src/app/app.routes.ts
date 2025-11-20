import { Route } from '@angular/router';

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
      {
        path: 'home',
        loadComponent: () =>
          import('./routes/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'citizens',
        loadComponent: () =>
          import('./routes/citizens/citizens.component').then(
            (m) => m.CitizensComponent
          ),
      },
      {
        path: 'government',
        loadComponent: () =>
          import('./routes/government/government.component').then(
            (m) => m.GovernmentComponent
          ),
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./routes/departments/departments.component').then(
            (m) => m.DepartmentsComponent
          ),
      },
      {
        path: 'information',
        loadComponent: () =>
          import('./routes/information/information.component').then(
            (m) => m.InformationComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
