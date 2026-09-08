export const WORLD_HALF = 16;
export const PLAYER_RADIUS = 0.45;
export const MOVE_SPEED = 5.4;
export const JUMP_SPEED = 7.4;
export const GRAVITY = -24;

export const DEFAULT_OBSTACLES = [
  { x: 5, z: 5, radius: 0.5 },
  { x: 5, z: -5, radius: 0.5 },
  { x: -5, z: 5, radius: 0.5 },
  { x: -5, z: -5, radius: 0.5 },
  { x: 8.5, z: 0, radius: 0.5 },
  { x: -8.5, z: 0, radius: 0.5 },
  { x: 11, z: 8, radius: 0.4 },
  { x: -12, z: -4, radius: 0.4 },
  { x: 3, z: -11, radius: 0.4 },
  { x: -7, z: 11, radius: 0.4 },
];

export const createWalkerState = () => ({
  x: 0,
  y: 0,
  z: 0,
  vy: 0,
  yaw: 0,
  grounded: true,
});

export const clampMagnitude = (x, z, max = 1) => {
  const length = Math.hypot(x, z);
  if (length === 0 || length <= max) {
    return { x, z };
  }
  const scale = max / length;
  return { x: x * scale, z: z * scale };
};

export const readAnalogStick = (clientX, clientY, originX, originY, maxRadius) => {
  const dx = clientX - originX;
  const dy = clientY - originY;
  const length = Math.hypot(dx, dy);
  const scale = length > maxRadius && length > 0 ? maxRadius / length : 1;
  const thumbX = dx * scale;
  const thumbY = dy * scale;
  return {
    x: maxRadius === 0 ? 0 : thumbX / maxRadius,
    y: maxRadius === 0 ? 0 : thumbY / maxRadius,
    thumbX,
    thumbY,
  };
};

export const shortestAngleDelta = (from, to) => {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

const resolveObstacles = (x, z, obstacles) => {
  let nextX = x;
  let nextZ = z;
  obstacles.forEach((obstacle) => {
    const dx = nextX - obstacle.x;
    const dz = nextZ - obstacle.z;
    const minDistance = PLAYER_RADIUS + obstacle.radius;
    const distance = Math.hypot(dx, dz);
    if (distance === 0) {
      nextX += minDistance;
      return;
    }
    if (distance < minDistance) {
      const push = (minDistance - distance) / distance;
      nextX += dx * push;
      nextZ += dz * push;
    }
  });
  return { x: nextX, z: nextZ };
};

const clampToWorld = (x, z) => {
  const limit = WORLD_HALF - PLAYER_RADIUS;
  return {
    x: Math.min(limit, Math.max(-limit, x)),
    z: Math.min(limit, Math.max(-limit, z)),
  };
};

export const stepWalker = (
  state,
  { moveX = 0, moveZ = 0, jump = false, cameraYaw = 0 } = {},
  dt,
  obstacles = DEFAULT_OBSTACLES,
) => {
  const safeDt = Math.max(0, dt);
  const move = clampMagnitude(moveX, moveZ);
  const sin = Math.sin(cameraYaw);
  const cos = Math.cos(cameraYaw);
  const worldVx = (move.x * cos + move.z * sin) * MOVE_SPEED;
  const worldVz = (-move.x * sin + move.z * cos) * MOVE_SPEED;

  const resolved = resolveObstacles(
    state.x + worldVx * safeDt,
    state.z + worldVz * safeDt,
    obstacles,
  );
  const { x, z } = clampToWorld(resolved.x, resolved.z);

  const yaw =
    move.x !== 0 || move.z !== 0 ? Math.atan2(worldVx, worldVz) : state.yaw;

  let vy = state.vy;
  let y = state.y;
  let grounded = state.grounded;

  if (jump && grounded) {
    vy = JUMP_SPEED;
    grounded = false;
  }

  vy += GRAVITY * safeDt;
  y += vy * safeDt;

  if (y <= 0 && vy <= 0) {
    y = 0;
    vy = 0;
    grounded = true;
  }

  return { x, y, z, vy, yaw, grounded };
};
