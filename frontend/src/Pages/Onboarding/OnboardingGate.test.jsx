import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { apiFetch } from '../../api/client.js';
import OnboardingGate from './OnboardingGate.jsx';

vi.mock('../../api/client.js', () => ({ apiFetch: vi.fn() }));

const renderGate = () =>
  render(
    <MemoryRouter initialEntries={['/course']}>
      <Routes>
        <Route path="/onboarding" element={<div>onboarding destination</div>} />
        <Route element={<OnboardingGate />}>
          <Route path="/course" element={<div>gated child</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('OnboardingGate', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('redirects to onboarding when the revealed flag is absent', () => {
    expect(window.localStorage.getItem('onboardingRevealed')).toBeNull();
    renderGate();
    expect(screen.getByText('onboarding destination')).toBeTruthy();
    expect(screen.queryByText('gated child')).toBeNull();
  });

  test('renders the child route when the revealed flag is set', () => {
    window.localStorage.setItem('onboardingRevealed', 'true');
    renderGate();
    expect(screen.getByText('gated child')).toBeTruthy();
    expect(screen.queryByText('onboarding destination')).toBeNull();
  });
});
