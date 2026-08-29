import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiFetch } from './client.js';
import { setRequestLocale } from '../utils/locale.js';

describe('apiFetch locale header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setRequestLocale('en');
  });

  test('sends the active locale as Accept-Language', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    setRequestLocale('es');

    await apiFetch('/auth/me/journal-entries');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers['Accept-Language']).toBe('es');
  });
});
