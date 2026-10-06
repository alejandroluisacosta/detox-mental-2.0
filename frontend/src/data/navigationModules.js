export const EDUCATIONAL_LINKS = [
    {
        labelKey: 'nav.theory',
        path: '/theory',
        icon: 'theory',
        isActive: (pathname) => pathname === '/theory',
    },
    {
        labelKey: 'nav.course',
        path: '/course',
        icon: 'course',
        isActive: (pathname) =>
            pathname.startsWith('/course') || pathname.startsWith('/session'),
    },
    {
        labelKey: 'nav.tests',
        path: '/tests',
        icon: 'tests',
        isActive: (pathname) =>
            pathname.startsWith('/tests') || pathname.startsWith('/test'),
    },
    {
        labelKey: 'nav.instructions',
        path: '/instructions',
        icon: 'instructions',
        isActive: (pathname) => pathname.startsWith('/instructions'),
    },
];

export const JOURNALING_LINKS = [
    {
        labelKey: 'nav.journal',
        path: '/journal',
        icon: 'journal',
        isActive: (pathname) => pathname === '/journal',
    },
    {
        labelKey: 'nav.history',
        path: '/journal/history',
        icon: 'history',
        isActive: (pathname) => pathname.startsWith('/journal/history'),
    },
    {
        labelKey: 'nav.meditations',
        path: '/journal/meditations',
        icon: 'meditations',
        isActive: (pathname) => pathname.startsWith('/journal/meditations'),
    },
    {
        labelKey: 'nav.summary',
        path: '/journal/summary',
        icon: 'summary',
        isActive: (pathname) => pathname.startsWith('/journal/summary'),
    },
];

export const resolveNavModule = (pathname) => {
    if (pathname.startsWith('/journal')) {
        return 'journaling';
    }

    return 'educational';
};
