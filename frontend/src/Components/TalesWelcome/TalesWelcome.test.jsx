import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import TalesWelcome from './TalesWelcome.jsx';

const message = () => document.querySelector('.tales-welcome__message');

describe('TalesWelcome', () => {
  afterEach(cleanup);

  test('shows the help-button icon where the message places it, never the raw marker', () => {
    render(<TalesWelcome message="Come back anytime with the [?] button." />);
    const icon = message().querySelector('.onboarding-help-button');
    expect(icon).toBeTruthy();
    expect(icon.textContent).toBe('?');
    expect(message().textContent).toBe('Come back anytime with the ? button.');
    expect(message().textContent).not.toContain('[');
  });

  test('a message without the marker renders as plain text', () => {
    render(<TalesWelcome message="Hello there." />);
    expect(message().textContent).toBe('Hello there.');
    expect(message().querySelector('.onboarding-help-button')).toBeNull();
  });
});
