import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalImageSourceSheet from './JournalImageSourceSheet.jsx';

const renderSheet = (locale = 'en', props = {}) => {
  writeStoredLocale(locale);
  const onClose = props.onClose ?? vi.fn();
  const onChooseCamera = props.onChooseCamera ?? vi.fn();
  const onChooseLibrary = props.onChooseLibrary ?? vi.fn();
  render(
    <LocaleProvider>
      <JournalImageSourceSheet
        onClose={onClose}
        onChooseCamera={onChooseCamera}
        onChooseLibrary={onChooseLibrary}
      />
    </LocaleProvider>,
  );
  return { onClose, onChooseCamera, onChooseLibrary };
};

describe('JournalImageSourceSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('lists camera and library actions with cancel', () => {
    renderSheet();
    expect(screen.getByRole('dialog', { name: 'Add handwriting image' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open camera' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Choose from photo library' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  test('choosing camera invokes the camera handler and closes', () => {
    const { onClose, onChooseCamera } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Open camera' }));
    expect(onChooseCamera).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('choosing the library invokes the library handler and closes', () => {
    const { onClose, onChooseLibrary } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Choose from photo library' }));
    expect(onChooseLibrary).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('shows Spanish labels', () => {
    renderSheet('es');
    expect(screen.getByRole('dialog', { name: 'Añadir imagen de escritura' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir cámara' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Elegir de la galería' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
  });
});
