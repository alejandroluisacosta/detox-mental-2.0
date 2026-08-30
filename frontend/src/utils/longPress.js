const DEFAULT_DELAY_MS = 500;

/** Pointer handlers that fire `onLongPress` after a hold, without also treating it as a click. */
export const createLongPressHandlers = ({
  onLongPress,
  delayMs = DEFAULT_DELAY_MS,
} = {}) => {
  let timer = null;
  let didLongPress = false;

  const clearTimer = () => {
    if (timer == null) return;
    clearTimeout(timer);
    timer = null;
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    didLongPress = false;
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      didLongPress = true;
      onLongPress?.(event);
    }, delayMs);
  };

  const onPointerUp = () => {
    clearTimer();
  };

  const onPointerLeave = () => {
    clearTimer();
  };

  const onPointerCancel = () => {
    clearTimer();
  };

  const onContextMenu = (event) => {
    event.preventDefault();
  };

  const consumeClickIfLongPress = () => {
    if (!didLongPress) return false;
    didLongPress = false;
    return true;
  };

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onContextMenu,
    consumeClickIfLongPress,
  };
};
