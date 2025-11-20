import { Route } from '@angular/router';
import { HomeComponent } from './home.component';

export const HOME_ROUTES: Route = {
  path: 'home',
  component: HomeComponent,
  // Home typically doesn't have child routes, but the structure is here if needed
  children: [],
};
