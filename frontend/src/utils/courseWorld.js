// Rules of the course world: a road the player walks down with Tales, with one
// kiosk per course onboarding step and Tales' portico at the end. Positions are
// { x, z } on the ground plane; the road runs from z = 0 towards negative z.
// Kept free of Three.js so the rules can be tested without WebGL.

export const GOAL_ID = 'goal';

const ROAD_HALF_WIDTH = 2;
const KIOSK_OFFSET_X = 5.2;
const SPOT_OFFSET_X = 1.4;
const FIRST_KIOSK_Z = -8;
const KIOSK_SPACING = 9;
const GOAL_GAP = 10;
const PLAYER_SPEED = 5;
const FOLLOWER_SPEED = PLAYER_SPEED * 1.25;
// Where Tales walks relative to the player, and how close counts as "there".
const FOLLOWER_OFFSET = { x: 1.1, z: 0.6 };
const FOLLOWER_SLACK = 0.35;
// A stop opens inside ENTER_RADIUS and closes only beyond LEAVE_RADIUS, so
// standing on the edge does not open and close it every frame.
const ENTER_RADIUS = 1.8;
const LEAVE_RADIUS = 2.6;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clampToBounds = (p, b) => ({ x: clamp(p.x, b.minX, b.maxX), z: clamp(p.z, b.minZ, b.maxZ) });

const moveTowards = (from, to, maxStep) => {
  const d = distance(from, to);
  if (d <= maxStep) return { x: to.x, z: to.z };
  const k = maxStep / d;
  return { x: from.x + (to.x - from.x) * k, z: from.z + (to.z - from.z) * k };
};

export const buildWorldLayout = (kioskIds) => {
  const kiosks = kioskIds.map((id, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = FIRST_KIOSK_Z - i * KIOSK_SPACING;
    return { id, side, x: side * KIOSK_OFFSET_X, z, spot: { x: side * SPOT_OFFSET_X, z } };
  });
  const lastZ = kiosks.length ? kiosks[kiosks.length - 1].z : FIRST_KIOSK_Z;
  const goal = { x: 0, z: lastZ - GOAL_GAP };
  return {
    kiosks,
    goal,
    start: { x: 0, z: 0 },
    bounds: { minX: -ROAD_HALF_WIDTH, maxX: ROAD_HALF_WIDTH, minZ: goal.z - 1, maxZ: 3 },
    enterRadius: ENTER_RADIUS,
    leaveRadius: LEAVE_RADIUS,
  };
};

// `input` is the held direction, e.g. { x: 1, z: -1 } for right + forward.
export const stepPlayer = (position, input, dt, bounds) => {
  const length = Math.hypot(input.x, input.z);
  if (length === 0) return position;
  const step = (PLAYER_SPEED * dt) / length;
  return clampToBounds({ x: position.x + input.x * step, z: position.z + input.z * step }, bounds);
};

// Walks towards a tapped point; points off the road resolve to the road's edge.
export const stepTowards = (position, target, dt, bounds) =>
  moveTowards(position, clampToBounds(target, bounds), PLAYER_SPEED * dt);

// Returns the kiosk id (or GOAL_ID) the player is at, or null. `currentId` is
// the stop open now, which stays open until the player clearly walks away.
export const nearbyStop = (position, layout, currentId) => {
  const stops = [
    ...layout.kiosks.map((k) => ({ id: k.id, spot: k.spot })),
    { id: GOAL_ID, spot: layout.goal },
  ];
  const current = stops.find((s) => s.id === currentId);
  if (current && distance(position, current.spot) <= layout.leaveRadius) return current.id;

  let nearest = null;
  stops.forEach((s) => {
    const d = distance(position, s.spot);
    if (d <= layout.enterRadius && (!nearest || d < nearest.d)) nearest = { id: s.id, d };
  });
  return nearest?.id ?? null;
};

// Tales walks at the player's side, a step behind, and waits when he is there.
export const stepFollower = (follower, leader, dt) => {
  const target = { x: leader.x + FOLLOWER_OFFSET.x, z: leader.z + FOLLOWER_OFFSET.z };
  if (distance(follower, target) <= FOLLOWER_SLACK) return follower;
  return moveTowards(follower, target, FOLLOWER_SPEED * dt);
};
