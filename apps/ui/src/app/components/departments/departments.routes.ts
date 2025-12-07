import { Route } from '@angular/router';
import { DepartmentsComponent } from './departments.component';

export const DEPARTMENTS_ROUTES: Route[] = [
  {
    path: 'departments',
    component: DepartmentsComponent,
  },
  // Redirect /departments/businesses to business-forms
  {
    path: 'departments/businesses',
    redirectTo: 'departments/businesses/business-forms',
    pathMatch: 'full'
  },
  {
    path: 'departments/businesses/business-forms',
    loadComponent: () =>
      import('./businesses/business-forms/business-forms.component').then(
        m => m.BussinessFormsComponent
      )
  },
  {
    path: 'departments/businesses/business-license-information',
    loadComponent: () =>
      import('./businesses/business-license-information/business-license-information.component')
        .then(m => m.BusinessLicenseInformationComponent)
  },
  {
    path: 'departments/businesses/forms/business-license',
    loadComponent: () =>
      import('./businesses/business-forms/forms/business-license/business-license-form.component')
        .then(m => m.BusinessLicenseFormComponent)
  },
  {
    path: 'departments/cemetery',
    loadComponent: () =>
      import('./cemetery/cemetery.component').then(
        m => m.CemeteryComponent
      )
  }
];
