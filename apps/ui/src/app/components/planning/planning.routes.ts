import { Route } from '@angular/router';

export const PLANNING_ROUTES: Route[] = [
  {
    path: 'planning',
    loadComponent: () =>
      import('./planning-zoning/planning-zoning.component').then(
        (m) => m.PlanningZoningComponent
      ),
  },
  {
    path: 'planning/planning-commission',
    loadComponent: () =>
      import(
        './planning-zoning/planning-commission/planning-commission.component'
      ).then((m) => m.PlanningCommissionComponent),
  },
  {
    path: 'planning/agendas-minutes',
    loadComponent: () =>
      import(
        './planning-zoning/agendas-minutes/agendas-minutes.component'
      ).then((m) => m.AgendasMinutesComponent),
  },
  {
    path: 'planning/design-standards',
    loadComponent: () =>
      import(
        './planning-zoning/design-standards/design-standards.component'
      ).then((m) => m.DesignStandardsComponent),
  },
  {
    path: 'planning/land-use-regulations',
    loadComponent: () =>
      import(
        './planning-zoning/land-use-regulations/land-use-regulations.component'
      ).then((m) => m.LandUseRegulationsComponent),
  },
  {
    path: 'planning/storm-water',
    loadComponent: () =>
      import('./planning-zoning/storm-water/storm-water.component').then(
        (m) => m.StormWaterComponent
      ),
  },
  {
    path: 'planning/general-plan',
    loadComponent: () =>
      import('./planning-zoning/general-plan/general-plan.component').then(
        (m) => m.GeneralPlanComponent
      ),
  },
  {
    path: 'planning/zoning-map',
    loadComponent: () =>
      import('./planning-zoning/zoning-map/zoning-map.component').then(
        (m) => m.ZoningMapComponent
      ),
  },
];
