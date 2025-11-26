import { Route } from '@angular/router';
import { CitizensComponent } from './citizens.component';

export const CITIZENS_ROUTES: Route = {
  path: 'citizens',
  component: CitizensComponent,
  children: [
    {
      path: 'animal-control',
      loadComponent: () =>
        import('./animal-control/animal-control.component').then(
          (m) => m.AnimalControlComponent
        ),
    },
    // Add child routes here as the section expands
    // Example:
    // {
    //   path: 'utilities',
    //   loadComponent: () =>
    //     import('./utilities/utilities.component').then((m) => m.UtilitiesComponent),
    // },
    // {
    //   path: 'library',
    //   loadComponent: () =>
    //     import('./library/library.component').then((m) => m.LibraryComponent),
    // },
  ],
};
