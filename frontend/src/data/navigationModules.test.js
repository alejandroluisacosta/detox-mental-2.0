import { describe, expect, test } from 'vitest';
import {
    EDUCATIONAL_LINKS,
    JOURNALING_LINKS,
    resolveNavModule,
} from './navigationModules.js';

describe('resolveNavModule', () => {
    test('maps journal paths to the journaling module', () => {
        expect(resolveNavModule('/journal')).toBe('journaling');
        expect(resolveNavModule('/journal/history')).toBe('journaling');
        expect(resolveNavModule('/journal/meditations')).toBe('journaling');
        expect(resolveNavModule('/journal/summary')).toBe('journaling');
    });

    test('maps remaining paths to the educational module', () => {
        expect(resolveNavModule('/theory')).toBe('educational');
        expect(resolveNavModule('/course')).toBe('educational');
        expect(resolveNavModule('/session/1')).toBe('educational');
        expect(resolveNavModule('/tests')).toBe('educational');
        expect(resolveNavModule('/test/mind-voice')).toBe('educational');
        expect(resolveNavModule('/instructions')).toBe('educational');
    });
});

describe('personal-site isolation', () => {
    test('module menus do not include the Alejandro Luis blog', () => {
        const paths = [...EDUCATIONAL_LINKS, ...JOURNALING_LINKS].map((link) => link.path);
        expect(paths.some((path) => path.includes('alejandroluis') || path.includes('blog'))).toBe(
            false,
        );
    });
});

describe('module link active matching', () => {
    const isActive = (links, path, pathname) =>
        links.find((link) => link.path === path).isActive(pathname);

    test('marks Diario only on the exact journal write path', () => {
        expect(isActive(JOURNALING_LINKS, '/journal', '/journal')).toBe(true);
        expect(isActive(JOURNALING_LINKS, '/journal', '/journal/history')).toBe(false);
        expect(isActive(JOURNALING_LINKS, '/journal/history', '/journal/history')).toBe(true);
        expect(isActive(JOURNALING_LINKS, '/journal/history', '/journal/meditations')).toBe(false);
    });

    test('marks Meditations only on the meditations path', () => {
        expect(isActive(JOURNALING_LINKS, '/journal/meditations', '/journal/meditations')).toBe(
            true,
        );
        expect(isActive(JOURNALING_LINKS, '/journal/meditations', '/journal/history')).toBe(false);
    });

    test('marks Curso for both the course grid and session player', () => {
        expect(isActive(EDUCATIONAL_LINKS, '/course', '/course')).toBe(true);
        expect(isActive(EDUCATIONAL_LINKS, '/course', '/session/1')).toBe(true);
        expect(isActive(EDUCATIONAL_LINKS, '/theory', '/theory')).toBe(true);
        expect(isActive(EDUCATIONAL_LINKS, '/theory', '/course')).toBe(false);
    });
});
