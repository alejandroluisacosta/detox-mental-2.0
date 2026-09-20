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

describe('apiFetch request shape', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('always sends credentials include', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/auth/me');

    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });

  test('JSON-serializes an object body and sets Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const body = { topics: ['work'] };

    await apiFetch('/auth/me/journal-entries', { method: 'POST', body });

    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(body));
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBe(
      'application/json',
    );
  });

  test('passes FormData through without setting Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const body = new FormData();
    body.append('image', new Blob(['x']), 'note.jpg');

    await apiFetch('/auth/me/journal-transcription', { method: 'POST', body });

    expect(fetchMock.mock.calls[0][1].body).toBe(body);
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
  });

  test('does not overwrite a caller-supplied Accept-Language', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    writeStoredLocale('es');

    await apiFetch('/auth/me', { headers: { 'Accept-Language': 'fr' } });

    expect(fetchMock.mock.calls[0][1].headers['Accept-Language']).toBe('fr');
  });

  test('joins auth/me and /auth/me to the same URL without a double slash', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('auth/me');
    await apiFetch('/auth/me');

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/auth/me');
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:3000/auth/me');
    expect(fetchMock.mock.calls[0][0].replace(/^https?:\/\//, '')).not.toMatch(
      /\/\//,
    );
  });
});
