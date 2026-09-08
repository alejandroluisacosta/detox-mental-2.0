import { describe, expect, test } from 'vitest';
import {
  GRAVITY,
  JUMP_SPEED,
  MOVE_SPEED,
  PLAYER_RADIUS,
  WORLD_HALF,
  clampMagnitude,
  createWalkerState,
  readAnalogStick,
  shortestAngleDelta,
  stepWalker,
} from './socratesWalkPhysics.js';

describe('clampMagnitude', () => {
  test('leaves short vectors unchanged', () => {
    expect(clampMagnitude(0.3, 0.4)).toEqual({ x: 0.3, z: 0.4 });
  });

  test('normalizes vectors longer than one', () => {
    const result = clampMagnitude(3, 4);
    expect(result.x).toBeCloseTo(0.6);
    expect(result.z).toBeCloseTo(0.8);
  });
});

describe('readAnalogStick', () => {
  test('maps a pointer inside the pad to a unit-scaled offset', () => {
    const result = readAnalogStick(110, 80, 100, 100, 50);
    expect(result.x).toBeCloseTo(0.2);
    expect(result.y).toBeCloseTo(-0.4);
    expect(result.thumbX).toBeCloseTo(10);
    expect(result.thumbY).toBeCloseTo(-20);
  });

  test('clamps a pointer outside the pad to the rim', () => {
    const result = readAnalogStick(200, 100, 100, 100, 40);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0);
    expect(result.thumbX).toBeCloseTo(40);
    expect(result.thumbY).toBeCloseTo(0);
  });
});

describe('shortestAngleDelta', () => {
  test('wraps across the -PI / PI seam', () => {
    expect(shortestAngleDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6);
  });
});

describe('stepWalker', () => {
  test('moves forward along +Z when the camera yaw is zero', () => {
    const next = stepWalker(createWalkerState(), { moveZ: 1, cameraYaw: 0 }, 0.5);
    expect(next.z).toBeCloseTo(MOVE_SPEED * 0.5);
    expect(next.x).toBeCloseTo(0);
    expect(next.yaw).toBeCloseTo(0);
  });

  test('strafes right along +X when the camera yaw is zero', () => {
    const next = stepWalker(createWalkerState(), { moveX: 1, cameraYaw: 0 }, 0.25);
    expect(next.x).toBeCloseTo(MOVE_SPEED * 0.25);
    expect(next.z).toBeCloseTo(0);
  });

  test('jumps only while grounded and then falls back', () => {
    const airborne = stepWalker(createWalkerState(), { jump: true }, 0);
    expect(airborne.grounded).toBe(false);
    expect(airborne.vy).toBe(JUMP_SPEED);

    const rising = stepWalker(airborne, {}, 0.05);
    expect(rising.y).toBeGreaterThan(0);
    expect(rising.vy).toBeCloseTo(JUMP_SPEED + GRAVITY * 0.05);

    let state = rising;
    for (let i = 0; i < 40; i += 1) {
      state = stepWalker(state, {}, 0.05);
    }
    expect(state.y).toBe(0);
    expect(state.grounded).toBe(true);
    expect(state.vy).toBe(0);
  });

  test('does not jump again while already in the air', () => {
    const airborne = stepWalker(createWalkerState(), { jump: true }, 0);
    const stillAirborne = stepWalker(airborne, { jump: true }, 0);
    expect(stillAirborne.vy).toBe(JUMP_SPEED);
  });

  test('pushes the walker out of an overlapping obstacle', () => {
    const blocked = stepWalker(
      { ...createWalkerState(), x: 5, z: 5 },
      {},
      0,
      [{ x: 5, z: 5, radius: 0.5 }],
    );
    const distance = Math.hypot(blocked.x - 5, blocked.z - 5);
    expect(distance).toBeCloseTo(PLAYER_RADIUS + 0.5);
  });

  test('keeps the walker inside the plaza bounds', () => {
    const next = stepWalker(
      { ...createWalkerState(), x: WORLD_HALF, z: WORLD_HALF },
      { moveX: 1, moveZ: 1 },
      1,
      [],
    );
    expect(next.x).toBeLessThanOrEqual(WORLD_HALF - PLAYER_RADIUS);
    expect(next.z).toBeLessThanOrEqual(WORLD_HALF - PLAYER_RADIUS);
  });
});
