import { describe, expect, test } from 'vitest';
import {
  GOAL_ID,
  buildWorldLayout,
  nearbyStop,
  stepFollower,
  stepPlayer,
  stepTowards,
} from './courseWorld.js';

const IDS = ['article', 'audio', 'exercise', 'tests', 'unlock', 'characters'];
const layout = buildWorldLayout(IDS);
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Simulates `seconds` of frames, as the render loop does.
const run = (seconds, step, start) => {
  let pos = start;
  for (let t = 0; t < seconds; t += 1 / 60) pos = step(pos, 1 / 60);
  return pos;
};

describe('buildWorldLayout', () => {
  test('places every kiosk along the road, in course order, alternating sides', () => {
    expect(layout.kiosks.map((k) => k.id)).toEqual(IDS);
    const zs = layout.kiosks.map((k) => k.z);
    expect([...zs].sort((a, b) => b - a)).toEqual(zs);
    layout.kiosks.forEach((k, i) => {
      if (i > 0) expect(Math.sign(k.x)).toBe(-Math.sign(layout.kiosks[i - 1].x));
      // The kiosk stands off the road; its visit spot is on it.
      expect(Math.abs(k.x)).toBeGreaterThan(layout.bounds.maxX);
      expect(k.spot.x).toBeGreaterThanOrEqual(layout.bounds.minX);
      expect(k.spot.x).toBeLessThanOrEqual(layout.bounds.maxX);
    });
  });

  test('Tales\' portico closes the road after the last kiosk', () => {
    const last = layout.kiosks[layout.kiosks.length - 1];
    expect(layout.goal.z).toBeLessThan(last.z);
    expect(layout.goal.z).toBeGreaterThanOrEqual(layout.bounds.minZ);
  });
});

describe('stepPlayer', () => {
  test('the player cannot walk off the road, however long they hold a key', () => {
    const offLeft = run(10, (p, dt) => stepPlayer(p, { x: -1, z: 0 }, dt, layout.bounds), layout.start);
    const offBack = run(10, (p, dt) => stepPlayer(p, { x: 0, z: 1 }, dt, layout.bounds), layout.start);
    const offEnd = run(60, (p, dt) => stepPlayer(p, { x: 1, z: -1 }, dt, layout.bounds), layout.start);
    expect(offLeft.x).toBe(layout.bounds.minX);
    expect(offBack.z).toBe(layout.bounds.maxZ);
    expect(offEnd).toEqual({ x: layout.bounds.maxX, z: layout.bounds.minZ });
  });

  test('walking diagonally is not faster than walking straight', () => {
    const start = { x: 0, z: -10 };
    const straight = stepPlayer(start, { x: 0, z: -1 }, 0.1, layout.bounds);
    const diagonal = stepPlayer(start, { x: 1, z: -1 }, 0.1, layout.bounds);
    expect(distance(start, diagonal)).toBeCloseTo(distance(start, straight), 6);
  });

  test('no input, no movement', () => {
    expect(stepPlayer(layout.start, { x: 0, z: 0 }, 0.1, layout.bounds)).toEqual(layout.start);
  });
});

describe('stepTowards', () => {
  test('a tap walks the player to the spot and stops there without jittering', () => {
    const target = { x: 1, z: -6 };
    const positions = [];
    run(5, (p, dt) => {
      const next = stepTowards(p, target, dt, layout.bounds);
      positions.push(next);
      return next;
    }, layout.start);
    expect(positions[positions.length - 1]).toEqual(target);
    expect(positions[positions.length - 2]).toEqual(target);
  });

  test('a tap off the road walks to the nearest point on the road', () => {
    const end = run(10, (p, dt) => stepTowards(p, { x: 50, z: -4 }, dt, layout.bounds), layout.start);
    expect(end).toEqual({ x: layout.bounds.maxX, z: -4 });
  });
});

describe('nearbyStop', () => {
  const audio = layout.kiosks[1];

  test('reaching a kiosk\'s spot opens it, walking on past it closes it', () => {
    expect(nearbyStop(layout.start, layout, null)).toBeNull();
    expect(nearbyStop(audio.spot, layout, null)).toBe('audio');
    expect(nearbyStop({ x: 0, z: audio.z - 6 }, layout, 'audio')).toBeNull();
  });

  test('standing at the edge of a kiosk does not open and close it every frame', () => {
    // Just inside the enter radius: open.
    const edge = { x: audio.spot.x, z: audio.spot.z - layout.enterRadius + 0.05 };
    expect(nearbyStop(edge, layout, null)).toBe('audio');
    // A small step back out stays open until the player clearly leaves.
    const slightlyOut = { x: audio.spot.x, z: audio.spot.z - layout.enterRadius - 0.2 };
    expect(nearbyStop(slightlyOut, layout, 'audio')).toBe('audio');
    expect(nearbyStop(slightlyOut, layout, null)).toBeNull();
  });

  test('the end of the road reaches Tales\' portico', () => {
    expect(nearbyStop(layout.goal, layout, null)).toBe(GOAL_ID);
  });
});

describe('stepFollower', () => {
  test('Tales catches up with the player and walks beside them without overlapping', () => {
    const player = { x: 0, z: -30 };
    const tales = run(10, (p, dt) => stepFollower(p, player, dt), { x: 0, z: 0 });
    const gap = distance(tales, player);
    expect(gap).toBeGreaterThan(0.9);
    expect(gap).toBeLessThan(2);
  });

  test('Tales stays still when the player stands next to him', () => {
    const player = { x: 0, z: -10 };
    const tales = { x: 1.2, z: -9.5 };
    expect(stepFollower(tales, player, 0.1)).toEqual(tales);
  });
});
