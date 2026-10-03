import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { LocaleProvider } from '../../Context/LocaleContext.jsx';
import { writeStoredLocale } from '../../utils/locale.js';
import JournalImageSourceSheet from './JournalImageSourceSheet.jsx';

const renderChooser = (locale = 'en', props = {}) => {
  writeStoredLocale(locale);
  const onClose = props.onClose ?? vi.fn();
  const onChooseCamera = props.onChooseCamera ?? vi.fn();
  const onChooseLibrary = props.onChooseLibrary ?? vi.fn();
  const anchorRef = props.anchorRef ?? createRef();
  render(
    <LocaleProvider>
      <div ref={anchorRef}>
        <JournalImageSourceSheet
          anchorRef={anchorRef}
          onClose={onClose}
          onChooseCamera={onChooseCamera}
          onChooseLibrary={onChooseLibrary}
        />
      </div>
    </LocaleProvider>,
  );
  return { onClose, onChooseCamera, onChooseLibrary, anchorRef };
};

describe('JournalImageSourceSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders a compact menu without a page overlay', () => {
    renderChooser();
    expect(document.querySelector('.modal-overlay')).toBeNull();
    expect(screen.getByRole('menu', { name: 'Add handwriting image' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Open camera' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Choose from photo library' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  test('choosing camera invokes the camera handler and closes', () => {
    const { onClose, onChooseCamera } = renderChooser();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Open camera' }));
    expect(onChooseCamera).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('choosing the library invokes the library handler and closes', () => {
    const { onClose, onChooseLibrary } = renderChooser();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Choose from photo library' }));
    expect(onChooseLibrary).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('closes on Escape', () => {
    const { onClose } = renderChooser();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('shows Spanish labels', () => {
    renderChooser('es');
    expect(screen.getByRole('menu', { name: 'Añadir imagen de escritura' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Abrir cámara' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Elegir de la galería' })).toBeTruthy();
  });
});
