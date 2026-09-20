export const WORLD_HALF = 16;
export const PLAYER_RADIUS = 0.45;
export const MOVE_SPEED = 5.4;
export const JUMP_SPEED = 7.4;
export const GRAVITY = -24;
export const STICK_DEADZONE = 0.24;
export const STICK_CURVE = 2.2;

export const COLUMN_SPOTS = [
  [5, 5],
  [5, -5],
  [-5, 5],
  [-5, -5],
  [8.5, 0],
  [-8.5, 0],
];

export const TREE_SPOTS = [
  [11, 8],
  [-12, -4],
  [3, -11],
  [-7, 11],
];

export const HOUSE = { x: 0, z: 9.4, radius: 2.75 };

export const DEFAULT_OBSTACLES = [
  ...COLUMN_SPOTS.map(([x, z]) => ({ x, z, radius: 0.5 })),
  ...TREE_SPOTS.map(([x, z]) => ({ x, z, radius: 0.4 })),
  HOUSE,
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

export const softenStickInput = (x, y) => {
  const length = Math.hypot(x, y);
  if (length <= STICK_DEADZONE) {
    return { x: 0, y: 0 };
  }
  const t = Math.min(1, (length - STICK_DEADZONE) / (1 - STICK_DEADZONE));
  const scaled = t ** STICK_CURVE;
  return {
    x: (x / length) * scaled,
    y: (y / length) * scaled,
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
