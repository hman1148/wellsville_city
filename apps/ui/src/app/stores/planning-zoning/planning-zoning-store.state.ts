export type PlanningZoningSection = {
  title: string;
  description: string;
  icon: string;
  link: string;
};

export type PlanningZoningState = {
  sections: PlanningZoningSection[];
};

export const initialPlanningZoningState = (): PlanningZoningState => ({
  sections: [
    {
      title: 'Planning Commission',
      description:
        'Information about the Planning Commission members and meetings',
      icon: 'pi pi-users',
      link: '/planning/planning-commission',
    },
    {
      title: 'Agendas and Minutes',
      description: 'Access Planning and Zoning meeting agendas and minutes',
      icon: 'pi pi-file',
      link: '/planning/agendas-minutes',
    },
    {
      title: 'Design Standards',
      description: 'View design standards and architectural guidelines',
      icon: 'pi pi-pencil',
      link: '/planning/design-standards',
    },
    {
      title: 'Land Use Regulations',
      description: 'Browse land use regulations and zoning requirements',
      icon: 'pi pi-book',
      link: '/planning/land-use-regulations',
    },
    {
      title: 'Storm Water',
      description: 'Storm water management regulations and guidelines',
      icon: 'pi pi-cloud',
      link: '/planning/storm-water',
    },
    {
      title: 'Wellsville City General Plan',
      description: 'Access the city general plan and future development goals',
      icon: 'pi pi-map',
      link: '/planning/general-plan',
    },
    {
      title: 'Wellsville City Adopted Zoning Map',
      description: 'View the official adopted zoning map for Wellsville City',
      icon: 'pi pi-map-marker',
      link: '/planning/zoning-map',
    },
  ],
});
