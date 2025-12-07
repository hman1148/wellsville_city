export type DocumentInfo = {
  title: string;
  description: string;
  url: string;
  fileName: string;
  fileSize: string;
  lastUpdated: string;
};

export type LandUseMapInfo = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type GeneralPlanComponentState = {
  showPdfViewer: boolean;
  showLandUseMapDialog: boolean;
  generalPlanDoc: DocumentInfo;
  landUseMap: LandUseMapInfo;
};

export const initialGeneralPlanComponentState = (): GeneralPlanComponentState => ({
  showPdfViewer: false,
  showLandUseMapDialog: false,

  generalPlanDoc: {
    title: 'Wellsville City General Plan',
    description:
      'The General Plan serves as a comprehensive long-term planning document that guides the future development and growth of Wellsville City. It establishes policies and guidelines for land use, transportation, community facilities, and other aspects of city planning.',
    url: '/GeneralPlan/General-Plan-v24-final-2010-1a.pdf',
    fileName: 'General-Plan-v24-final-2010-1a.pdf',
    fileSize: '8.2 MB',
    lastUpdated: '2010',
  },

  landUseMap: {
    title: 'Wellsville Land Use Map',
    description:
      'View the comprehensive land use map showing planned development areas, zoning designations, and future growth areas for Wellsville City.',
    imageUrl: '/GeneralPlan/wellsvillelanduse.png',
    imageAlt: 'Wellsville City Land Use Map',
  },
});
