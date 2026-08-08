import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const scrollPolicies = [
    { path: '/journal', scroll: 'bottom' },
];

const getScroll = (pathname) => {
    const matchedPolicy = scrollPolicies.find(({ path }) =>
        matchPath({ path, end: true }, pathname)
    );

    return matchedPolicy?.scroll ?? 'top';
};

const ScrollToTop = () => {
    const { pathname, search } = useLocation();
    const scroll = getScroll(pathname);

    useEffect(() => {
        if (scroll === 'bottom') {
            const frameId = window.requestAnimationFrame(() => {
                window.scrollTo(0, document.documentElement.scrollHeight);
            });

            return () => {
                window.cancelAnimationFrame(frameId);
            };
        }

        window.scrollTo(0, 0);
        return undefined;
    }, [pathname, scroll, search]);

    return null;
};

export default ScrollToTop;
