import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createSocratesWalkWorld } from '../../utils/createSocratesWalkWorld.js';
import { readAnalogStick } from '../../utils/socratesWalkPhysics.js';
import './SocratesWalk.css';

const STICK_RADIUS = 56;
const MOVE_KEYS = {
  ArrowUp: { x: 0, z: 1 },
  ArrowDown: { x: 0, z: -1 },
  ArrowLeft: { x: -1, z: 0 },
  ArrowRight: { x: 1, z: 0 },
  w: { x: 0, z: 1 },
  a: { x: -1, z: 0 },
  s: { x: 0, z: -1 },
  d: { x: 1, z: 0 },
  W: { x: 0, z: 1 },
  A: { x: -1, z: 0 },
  S: { x: 0, z: -1 },
  D: { x: 1, z: 0 },
};

const movementFromKeys = (keys) => {
  let moveX = 0;
  let moveZ = 0;
  keys.forEach((key) => {
    const delta = MOVE_KEYS[key];
    if (!delta) return;
    moveX += delta.x;
    moveZ += delta.z;
  });
  return { moveX, moveZ };
};

const SocratesWalk = () => {
  const pageRef = useRef(null);
  const mountRef = useRef(null);
  const worldRef = useRef(null);
  const stickRef = useRef(null);
  const thumbRef = useRef(null);
  const stickPointerRef = useRef(null);
  const keysRef = useRef(new Set());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const blockScroll = (event) => event.preventDefault();
    page.addEventListener('touchmove', blockScroll, { passive: false });
    return () => page.removeEventListener('touchmove', blockScroll);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let world;
    try {
      world = createSocratesWalkWorld({ container });
    } catch {
      setFailed(true);
      return undefined;
    }

    worldRef.current = world;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const applyKeyboardMove = () => {
      if (stickPointerRef.current !== null) return;
      const { moveX, moveZ } = movementFromKeys(keysRef.current);
      world.setMove(moveX, moveZ);
    };

    const onKeyDown = (event) => {
      if (MOVE_KEYS[event.key] || event.key === ' ') {
        event.preventDefault();
      }
      keysRef.current.add(event.key);
      if (event.key === ' ' && !event.repeat) {
        world.queueJump();
      }
      applyKeyboardMove();
    };

    const onKeyUp = (event) => {
      keysRef.current.delete(event.key);
      applyKeyboardMove();
    };

    const onResize = () => world.resize();
    const onVisualViewportResize = () => world.resize();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onVisualViewportResize);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onVisualViewportResize);
      resizeObserver.disconnect();
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  const resetThumb = () => {
    if (thumbRef.current) {
      thumbRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  const onStickPointerDown = (event) => {
    event.preventDefault();
    const pad = stickRef.current;
    const world = worldRef.current;
    if (!pad || !world) return;
    stickPointerRef.current = event.pointerId;
    pad.setPointerCapture(event.pointerId);
    const rect = pad.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const analog = readAnalogStick(
      event.clientX,
      event.clientY,
      originX,
      originY,
      STICK_RADIUS,
    );
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${analog.thumbX}px, ${analog.thumbY}px)`;
    }
    world.setMove(analog.x, -analog.y);
  };

  const onStickPointerMove = (event) => {
    if (stickPointerRef.current !== event.pointerId) return;
    const pad = stickRef.current;
    const world = worldRef.current;
    if (!pad || !world) return;
    const rect = pad.getBoundingClientRect();
    const analog = readAnalogStick(
      event.clientX,
      event.clientY,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      STICK_RADIUS,
    );
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(${analog.thumbX}px, ${analog.thumbY}px)`;
    }
    world.setMove(analog.x, -analog.y);
  };

  const onStickPointerUp = (event) => {
    if (stickPointerRef.current !== event.pointerId) return;
    stickPointerRef.current = null;
    resetThumb();
    const { moveX, moveZ } = movementFromKeys(keysRef.current);
    worldRef.current?.setMove(moveX, moveZ);
  };

  const onJumpPointerDown = (event) => {
    event.preventDefault();
    worldRef.current?.queueJump();
  };

  return (
    <main ref={pageRef} className="socrates-walk">
      <div ref={mountRef} className="socrates-walk__stage" />
      {failed ? (
        <p className="socrates-walk__error" role="alert">
          This device cannot run the WebGL walk test.
        </p>
      ) : null}
      <header className="socrates-walk__hud">
        <Link className="socrates-walk__exit" to="/">
          Exit
        </Link>
        <p className="socrates-walk__hint">
          Stick or WASD to walk. Jump button or Space to jump.
        </p>
      </header>
      <div className="socrates-walk__controls">
        <div
          ref={stickRef}
          className="socrates-walk__stick"
          role="group"
          aria-label="Move"
          onPointerDown={onStickPointerDown}
          onPointerMove={onStickPointerMove}
          onPointerUp={onStickPointerUp}
          onPointerCancel={onStickPointerUp}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div ref={thumbRef} className="socrates-walk__thumb" />
        </div>
        <button
          type="button"
          className="socrates-walk__jump"
          aria-label="Jump"
          onPointerDown={onJumpPointerDown}
          onContextMenu={(event) => event.preventDefault()}
        >
          Jump
        </button>
      </div>
    </main>
  );
};

export default SocratesWalk;
