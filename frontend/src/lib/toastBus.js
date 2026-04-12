/** Tiny pub/sub so any component can trigger the session toast without React context. */

let listener = null;

export function subscribeToast(fn) {
  listener = fn;
  return () => {
    listener = null;
  };
}

export function emitToast(message) {
  if (typeof message === "string" && listener) {
    listener(message);
  }
}
