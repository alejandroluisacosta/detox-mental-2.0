import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import MeditationBookModal from './MeditationBookModal.jsx';

const renderModal = (props = {}) => {
  writeStoredLocale('en');
  return render(
    <LocaleProvider>
      <MeditationBookModal onClose={vi.fn()} onSave={vi.fn()} {...props} />
    </LocaleProvider>,
  );
};

describe('MeditationBookModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows title, author, introduction fields and save button', () => {
    renderModal({ introduction: '' });

    expect(screen.getByRole('heading', { name: 'Book', level: 2 })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Introduction' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save introduction' })).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });

  test('save is disabled until draft changes and calls onSave with changed fields only', () => {
    const onSave = vi.fn();
    renderModal({
      title: 'My book',
      authorName: 'Ada',
      introduction: 'Saved prose',
      onSave,
    });

    const saveButton = screen.getByRole('button', { name: 'Save introduction' });
    expect(saveButton).toBeDisabled();

    const introField = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(introField, { target: { value: 'Saved prose edited' } });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith({ introduction: 'Saved prose edited' });
  });

  test('clearing the introduction enables save and sends empty string', () => {
    const onSave = vi.fn();
    renderModal({ introduction: 'Saved prose', onSave });

    fireEvent.change(screen.getByRole('textbox', { name: 'Introduction' }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save introduction' }));
    expect(onSave).toHaveBeenCalledWith({ introduction: '' });
  });

  test('blurring the introduction does not call onSave', () => {
    const onSave = vi.fn();
    renderModal({ introduction: '', onSave });

    const textarea = screen.getByRole('textbox', { name: 'Introduction' });
    fireEvent.change(textarea, { target: { value: 'Draft' } });
    fireEvent.blur(textarea);
    expect(onSave).not.toHaveBeenCalled();
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

  test('title change is included in save patch', () => {
    const onSave = vi.fn();
    renderModal({ title: '', authorName: '', introduction: '', onSave });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'New title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save introduction' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'New title' });
  });
});
