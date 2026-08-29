export const EDUCATIONAL_LINKS = [
    {
        labelKey: 'nav.theory',
        path: '/theory',
        isActive: (pathname) => pathname === '/theory',
    },
    {
        labelKey: 'nav.course',
        path: '/course',
        isActive: (pathname) =>
            pathname.startsWith('/course') || pathname.startsWith('/session'),
    },
    {
        labelKey: 'nav.tests',
        path: '/tests',
        isActive: (pathname) =>
            pathname.startsWith('/tests') || pathname.startsWith('/test'),
    },
    {
        labelKey: 'nav.instructions',
        path: '/instructions',
        isActive: (pathname) => pathname.startsWith('/instructions'),
    },
];

export const JOURNALING_LINKS = [
    {
        labelKey: 'nav.journal',
        path: '/journal',
        isActive: (pathname) => pathname === '/journal',
    },
    {
        labelKey: 'nav.history',
        path: '/journal/history',
        isActive: (pathname) => pathname.startsWith('/journal/history'),
    },
    {
        labelKey: 'nav.summary',
        path: '/journal/summary',
        isActive: (pathname) => pathname.startsWith('/journal/summary'),
    },
];

export const resolveNavModule = (pathname) => {
    if (pathname.startsWith('/journal')) {
        return 'journaling';
    }

    return 'educational';
};
