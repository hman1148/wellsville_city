export type BusinessForm = {
    id: string;
    title: string;
    description: string;
    pdfUrl: string;
    fileName: string;
    category: 'license' | 'application' | 'project-review';
    fileSize?: string;
    lastUpdated?: string;
};

export type BusinessFormsComponentState = {
    forms: BusinessForm[];
    contactInfo: {
        email: string;
        mailingAddress: string[];
    };
};

export const initialBusinessFormsComponentState = (): BusinessFormsComponentState => ({
    forms: [
        {
            id: 'business-application',
            title: 'Business License Application',
            description: 'Standard application form for obtaining a new business license in Wellsville City. Required for all new businesses.',
            pdfUrl: '/BusinessLicenses/business-application-v2-2009-01-312.pdf',
            fileName: 'business-application-v2-2009-01-312.pdf',
            category: 'license',
            fileSize: '28 KB',
            lastUpdated: 'January 2009',
        },
        {
            id: 'group-home-license',
            title: 'Group Home Business License Application',
            description: 'Specialized application for group home facilities. Includes additional requirements specific to group home operations.',
            pdfUrl: '/BusinessLicenses/grouphomebusinesslicenseapplication.pdf',
            fileName: 'grouphomebusinesslicenseapplication.pdf',
            category: 'license',
            fileSize: '339 KB',
        },
        {
            id: 'project-review',
            title: 'Application for Project Review',
            description: 'Required for projects that need city review and approval. Submit this form along with project plans and specifications.',
            pdfUrl: '/BusinessLicenses/WC-Application-for-Project-Review-2024.pdf',
            fileName: 'WC-Application-for-Project-Review-2024.pdf',
            category: 'project-review',
            fileSize: '723 KB',
            lastUpdated: '2024',
        },
    ],
    contactInfo: {
        email: 'DLindsay@WellsvilleCity.com',
        mailingAddress: [
            'Wellsville City Business Licensing',
            'P.O. Box 6',
            'Wellsville, UT 84339',
        ],
    },
});