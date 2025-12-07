export type ZoningMapInfo = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type DocumentInfo = {
  title: string;
  description: string;
  url: string;
  fileName: string;
  fileSize: string;
  lastUpdated: string;
};

export type ZoningMapComponentState = {
  showZoningMapDialog: boolean;
  showPdfViewer: boolean;
  zoningMap: ZoningMapInfo;
  publicWorksStandards: DocumentInfo;
};

export const initialZoningMapComponentState = (): ZoningMapComponentState => ({
  showZoningMapDialog: false,
  showPdfViewer: false,

  zoningMap: {
    title: 'Wellsville City Adopted Zoning Map',
    description:
      'View the official adopted zoning map showing all zoning designations, districts, and boundaries for Wellsville City.',
    imageUrl: '/Zoning/wellsvilezoning.png',
    imageAlt: 'Wellsville City Adopted Zoning Map',
  },

  publicWorksStandards: {
    title: 'Wellsville Public Works Standards',
    description:
      'The Public Works Standards document provides comprehensive guidelines and specifications for construction, infrastructure, and development projects within Wellsville City.',
    url: '/Zoning/Wellsville_Public_Works_Standards_2012-02.pdf',
    fileName: 'Wellsville_Public_Works_Standards_2012-02.pdf',
    fileSize: '11.8 MB',
    lastUpdated: 'February 2012',
  },
});
