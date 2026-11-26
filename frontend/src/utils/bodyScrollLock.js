/**
 * Pins the page in place so nothing behind an overlay scrolls, and returns a
 * function that unpins it at the same scroll position. `overflow: hidden` alone
 * does not stop touch scrolling on iOS Safari, so the body is fixed at its
 * current offset instead.
 */
export const lockBodyScroll = () => {
  const { body } = document;
  const scrollY = window.scrollY;
  const previous = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    overflow: body.style.overflow,
  };

  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.overflow = 'hidden';

  return () => {
    Object.assign(body.style, previous);
    window.scrollTo(0, scrollY);
  };
};
