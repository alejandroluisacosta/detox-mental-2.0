import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiFetch } from './client.js';
import { writeStoredLocale } from '../utils/locale.js';

describe('apiFetch locale header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('sends the stored locale as Accept-Language', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    writeStoredLocale('es');

    await apiFetch('/auth/me/journal-entries');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers['Accept-Language']).toBe('es');
  });

  test('defaults to English when no locale is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/auth/me/journal-entries');

    expect(fetchMock.mock.calls[0][1].headers['Accept-Language']).toBe('en');
  });
});
