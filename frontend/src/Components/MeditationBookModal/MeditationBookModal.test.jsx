import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import MeditationBookModal from './MeditationBookModal.jsx';

const renderModal = (props = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <MeditationBookModal onClose={vi.fn()} onPdfAction={vi.fn()} {...props} />
    </LocaleProvider>,
  );
};

describe('MeditationBookModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows the default Meditations title as the field value', () => {
    renderModal({ introduction: '' });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Meditations');
    expect(screen.getByRole('button', { name: 'PDF' })).toBeTruthy();
  });

  test('PDF prints without saving when the draft matches saved values', () => {
    const onPdfAction = vi.fn();
    renderModal({
      title: '',
      titleUsesDefault: true,
      introduction: 'Saved prose',
      onPdfAction,
    });

    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));
    expect(onPdfAction).toHaveBeenCalledWith(null);
  });

  test('Save and PDF sends only changed fields', () => {
    const onPdfAction = vi.fn();
    renderModal({
      title: '',
      titleUsesDefault: true,
      authorName: 'Ada',
      introduction: 'Saved prose',
      onPdfAction,
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Introduction' }), {
      target: { value: 'Saved prose edited' },
    });
    expect(screen.getByRole('button', { name: 'Save and PDF' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));
    expect(onPdfAction).toHaveBeenCalledWith({ introduction: 'Saved prose edited' });
  });

  test('clearing the default title enables Save and PDF with an empty title patch', () => {
    const onPdfAction = vi.fn();
    renderModal({ onPdfAction });

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and PDF' }));
    expect(onPdfAction).toHaveBeenCalledWith({ title: '' });
  });

  test('blurring fields does not call onPdfAction', () => {
    const onPdfAction = vi.fn();
    renderModal({ onPdfAction });

    const textarea = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(textarea, { target: { value: 'Draft' } });
    fireEvent.blur(textarea);
    expect(onPdfAction).not.toHaveBeenCalled();
  });

  test('loading and error states hide the form fields', () => {
    const { unmount } = renderModal({ status: 'loading' });
    expect(screen.getByText('Loading introduction…')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Introduction' })).toBeNull();
    unmount();

    renderModal({ status: 'error' });
    expect(screen.getByRole('alert').textContent).toContain('Could not load the introduction.');
    expect(screen.queryByRole('textbox', { name: 'Introduction' })).toBeNull();
  });

  test('shows a saved empty title in the field instead of the default label', () => {
    renderModal({ title: '', titleUsesDefault: false, introduction: '' });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'PDF' })).toBeTruthy();
  });
});
