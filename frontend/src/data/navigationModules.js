export const EDUCATIONAL_LINKS = [
    {
        label: 'TEORÍA',
        path: '/theory',
        isActive: (pathname) => pathname === '/theory',
    },
    {
        label: 'CURSO',
        path: '/course',
        isActive: (pathname) =>
            pathname.startsWith('/course') || pathname.startsWith('/session'),
    },
    {
        label: 'TESTS',
        path: '/tests',
        isActive: (pathname) =>
            pathname.startsWith('/tests') || pathname.startsWith('/test'),
    },
    {
        label: 'INSTRUCCIONES',
        path: '/instructions',
        isActive: (pathname) => pathname.startsWith('/instructions'),
    },
];

export const JOURNALING_LINKS = [
    {
        label: 'DIARIO',
        path: '/journal',
        isActive: (pathname) => pathname === '/journal',
    },
    {
        label: 'HISTORIAL',
        path: '/journal/history',
        isActive: (pathname) => pathname.startsWith('/journal/history'),
    },
    {
        label: 'RESUMEN SEMANAL',
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
