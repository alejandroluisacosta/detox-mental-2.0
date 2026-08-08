import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import ScrollToTop from './ScrollToTop.jsx';

const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '' });

    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback();
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('scrolls to the top by default', () => {
    render(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('scrolls to the bottom when the route opts in', () => {
    mockUseLocation.mockReturnValue({ pathname: '/journal', search: '' });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 1234,
    });

    render(<ScrollToTop />);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 1234);
  });
});
