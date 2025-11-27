import { Route } from '@angular/router';
import { CitizensComponent } from './citizens.component';

export const CITIZENS_ROUTES: Route[] = [
  {
    path: 'citizens',
    component: CitizensComponent,
  },
  {
    path: 'citizens/animal-control',
    loadComponent: () =>
      import('./animal-control/animal-control.component').then(
        (m) => m.AnimalControlComponent
      ),
  },
  {
    path: 'citizens/dog-licensing',
    loadComponent: () =>
      import('./dog-licensing/dog-licensing.component').then(
        (m) => m.DogLicensingComponent
      ),
  },
  {
    path: 'citizens/library',
    loadComponent: () =>
      import('./library/library.component').then((m) => m.LibraryComponent),
  },
  {
    path: 'citizens/newsletter',
    loadComponent: () =>
      import('./newsletter/newsletter.component').then(
        (m) => m.NewsletterComponent
      ),
  },
];
