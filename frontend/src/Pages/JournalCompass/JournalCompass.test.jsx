import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalCompass from './JournalCompass.jsx';
import { apiFetch } from '../../api/client.js';
import { emitToast } from '../../lib/toastBus.js';

const mockUseAuth = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
vi.mock('../../Context/AuthContext.jsx', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('../../Components/Navigation/Navigation.jsx', () => ({ default: () => null }));
vi.mock('../../Components/CloseIcon/CloseIcon.jsx', () => ({ default: () => null }));
vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/toastBus.js', () => ({ emitToast: vi.fn() }));

const renderCompass = () => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <JournalCompass />
    </LocaleProvider>,
  );
};

const limits = { goal: 3, memory: 15, chars: 200 };
const item = (id, kind, content) => ({ id, kind, content });

/** A fake API backed by an in-memory Compass, so later GETs see earlier writes. */
const fakeCompassApi = ({ goals = [], memories = [], pendingSuggestionCount = 0 } = {}) => {
  const state = { goals: [...goals], memories: [...memories] };
  let nextId = 1;
  apiFetch.mockImplementation(async (path, options = {}) => {
    const method = options.method ?? 'GET';
    if (method === 'GET' && path === '/auth/me/compass') {
      return { ok: true, status: 200, json: async () => ({ ...state, limits, pendingSuggestionCount }) };
    }
    if (method === 'POST' && path === '/auth/me/compass/items') {
      const created = item(`new-${nextId++}`, options.body.kind, options.body.content);
      state[options.body.kind === 'goal' ? 'goals' : 'memories'].push(created);
      return { ok: true, status: 201, json: async () => ({ item: created }) };
    }
    const match = path.match(/^\/auth\/me\/compass\/items\/(.+)$/);
    if (match && method === 'PATCH') {
      for (const list of [state.goals, state.memories]) {
        const found = list.find((i) => i.id === match[1]);
        if (found) {
          found.content = options.body.content;
          return { ok: true, status: 200, json: async () => ({ item: { ...found } }) };
        }
      }
    }
    if (match && method === 'DELETE') {
      state.goals = state.goals.filter((i) => i.id !== match[1]);
      state.memories = state.memories.filter((i) => i.id !== match[1]);
      return { ok: true, status: 204, json: async () => ({}) };
    }
    return { ok: false, status: 404, json: async () => ({ message: 'Not found' }) };
  });
  return state;
};

const sent = (method, path) =>
  apiFetch.mock.calls.filter(([p, options]) => p === path && options?.method === method);

describe('JournalCompass', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    apiFetch.mockReset();
    emitToast.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, status: 'ready' });
  });

  afterEach(() => {
    cleanup();
  });

  test('asks guests to log in', () => {
    mockUseAuth.mockReturnValue({ user: null, status: 'ready' });
    renderCompass();
    expect(screen.getByText(/Sign in to keep a Compass/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Log in' }).getAttribute('href')).toBe('/login');
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('an empty Compass shows counts, examples, and add buttons', async () => {
    fakeCompassApi();
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('0 / 3')).toBeTruthy();
    });
    expect(screen.getByText('0 / 15')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Launch my side project' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add goal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add memory' })).toBeTruthy();
  });

  test('an example chip opens the add form pre-filled and saving adds the item', async () => {
    fakeCompassApi();
    renderCompass();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Launch my side project' })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Launch my side project' }));

    const field = screen.getByLabelText('Goal');
    expect(field.value).toBe('Launch my side project');
    expect(field.maxLength).toBe(200);
    fireEvent.change(field, { target: { value: 'Launch Detox Mental before spring' } });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Launch Detox Mental before spring')).toBeTruthy();
    });
    expect(sent('POST', '/auth/me/compass/items')[0][1].body).toEqual({
      kind: 'goal',
      content: 'Launch Detox Mental before spring',
    });
    expect(screen.getByText('1 / 3')).toBeTruthy();
  });

  test('full goals show the full-state message instead of the add button', async () => {
    fakeCompassApi({
      goals: [item('g1', 'goal', 'One'), item('g2', 'goal', 'Two'), item('g3', 'goal', 'Three')],
    });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeTruthy();
    });
    expect(screen.getByText('Goals are full. Edit or remove one to add another.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add goal' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Add memory' })).toBeTruthy();
  });

  test('deleting asks for confirmation before sending the request', async () => {
    fakeCompassApi({ memories: [item('m1', 'memory', 'Living in Madrid.')] });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('Living in Madrid.')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove memory' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Remove this memory?')).toBeTruthy();
    expect(sent('DELETE', '/auth/me/compass/items/m1')).toHaveLength(0);

    fireEvent.click(within(dialog).getByRole('button', { name: 'CANCEL' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(sent('DELETE', '/auth/me/compass/items/m1')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Remove memory' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'REMOVE' }));

    await waitFor(() => {
      expect(screen.queryByText('Living in Madrid.')).toBeNull();
    });
    expect(sent('DELETE', '/auth/me/compass/items/m1')).toHaveLength(1);
  });

  test('editing an item saves the new text', async () => {
    fakeCompassApi({ memories: [item('m1', 'memory', 'Living in Madrid.')] });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('Living in Madrid.')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit memory' }));
    const field = screen.getByLabelText('New text');
    expect(field.value).toBe('Living in Madrid.');
    fireEvent.change(field, { target: { value: 'Living in Valencia.' } });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Living in Valencia.')).toBeTruthy();
    });
    expect(sent('PATCH', '/auth/me/compass/items/m1')[0][1].body).toEqual({
      content: 'Living in Valencia.',
    });
  });

  test('a rejected save shows the server message and keeps the form open', async () => {
    fakeCompassApi();
    apiFetch.mockImplementation(async (path, options = {}) => {
      if (options.method === 'POST') {
        return {
          ok: false,
          status: 409,
          json: async () => ({ code: 'compass_full', message: 'Goals are full.' }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ goals: [], memories: [], limits, pendingSuggestionCount: 0 }),
      };
    });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add goal' })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
    fireEvent.change(screen.getByLabelText('Goal'), { target: { value: 'Another goal' } });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(emitToast).toHaveBeenCalledWith('Goals are full.');
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('a banner links to the summary only while it has pending suggestions', async () => {
    fakeCompassApi({ pendingSuggestionCount: 2 });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('2 suggestions waiting in your weekly summary')).toBeTruthy();
    });
    expect(
      screen.getByRole('link', { name: /2 suggestions waiting.*Review/ }).getAttribute('href'),
    ).toBe('/journal/summary');

    cleanup();
    fakeCompassApi({ pendingSuggestionCount: 0 });
    renderCompass();
    await waitFor(() => {
      expect(screen.getByText('0 / 3')).toBeTruthy();
    });
    expect(screen.queryByText(/waiting in your weekly summary/)).toBeNull();
  });
});
