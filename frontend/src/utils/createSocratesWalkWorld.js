import * as THREE from 'three';
import {
  COLUMN_SPOTS,
  HOUSE,
  TREE_SPOTS,
  createWalkerState,
  shortestAngleDelta,
  stepWalker,
} from './socratesWalkPhysics.js';

const FACE_URL = '/images/socrates.webp';
const SKY = 0xcbb9a5;
const GROUND = 0xd8cfc3;
const PLAZA = 0xe7ddd0;
const COLUMN = 0xf3ebe1;
const COLUMN_CAP = 0x8a6a4f;
const TREE_TRUNK = 0x6b4a32;
const TREE_LEAVES = 0x6d7a4e;
const ROBE = 0xe8d5b7;
const STRAP = 0x6b4a32;
const SKIN = 0xc9956c;
const SANDAL = 0x5c4030;
const HOUSE_WALL = 0xe6d5be;
const HOUSE_ROOF = 0x845d43;
const HOUSE_TRIM = 0x2d3142;
const HOUSE_DOOR = 0x5a3d2b;

const disposeMaterial = (material) => {
  if (!material) return;
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((entry) => {
    if (entry.map) entry.map.dispose();
    entry.dispose();
  });
};

const createColumn = (x, z) => {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: COLUMN, roughness: 0.55 }),
  );
  shaft.position.y = 1.2;
  shaft.castShadow = true;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: COLUMN_CAP, roughness: 0.7 }),
  );
  cap.position.y = 2.45;
  cap.castShadow = true;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: COLUMN_CAP, roughness: 0.7 }),
  );
  base.position.y = 0.08;
  group.add(shaft, cap, base);
  group.position.set(x, 0, z);
  return group;
};

const createTree = (x, z) => {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: TREE_TRUNK, roughness: 0.9 }),
  );
  trunk.position.y = 0.55;
  trunk.castShadow = true;
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.85, 1.8, 8),
    new THREE.MeshStandardMaterial({ color: TREE_LEAVES, roughness: 0.85 }),
  );
  leaves.position.y = 1.85;
  leaves.castShadow = true;
  group.add(trunk, leaves);
  group.position.set(x, 0, z);
  return group;
};

const createLimb = (radiusTop, radiusBottom, height, material) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 10),
    material,
  );
  mesh.castShadow = true;
  return mesh;
};

const createArm = (side, sleeveMaterial, skinMaterial) => {
  const arm = new THREE.Group();
  const sleeve = createLimb(0.08, 0.07, 0.4, sleeveMaterial);
  sleeve.position.y = -0.18;
  const forearm = createLimb(0.055, 0.045, 0.34, skinMaterial);
  forearm.position.y = -0.52;
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMaterial);
  hand.position.y = -0.72;
  hand.castShadow = true;
  arm.add(sleeve, forearm, hand);
  arm.position.set(side * 0.42, 1.3, 0);
  arm.rotation.z = side * 0.16;
  return arm;
};

const createCharacter = () => {
  const group = new THREE.Group();
  const robeMaterial = new THREE.MeshStandardMaterial({ color: ROBE, roughness: 0.78 });
  const strapMaterial = new THREE.MeshStandardMaterial({ color: STRAP, roughness: 0.75 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.68 });
  const sandalMaterial = new THREE.MeshStandardMaterial({ color: SANDAL, roughness: 0.9 });

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.32), sandalMaterial);
  leftFoot.position.set(-0.15, 0.04, 0.05);
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = 0.15;

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.48, 0.82, 16),
    robeMaterial,
  );
  skirt.position.y = 0.47;
  skirt.castShadow = true;

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.28, 0.52, 14),
    robeMaterial,
  );
  torso.position.y = 1.08;
  torso.castShadow = true;

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), robeMaterial);
  shoulders.scale.set(1.2, 0.52, 0.72);
  shoulders.position.y = 1.32;
  shoulders.castShadow = true;

  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.045, 8, 18, Math.PI),
    strapMaterial,
  );
  strap.position.set(0.05, 1.16, 0.08);
  strap.rotation.set(0.35, 0.15, 1.05);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.16, 10),
    skinMaterial,
  );
  neck.position.y = 1.52;
  neck.castShadow = true;

  const leftArm = createArm(-1, robeMaterial, skinMaterial);
  const rightArm = createArm(1, robeMaterial, skinMaterial);

  const faceMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), faceMaterial);

  group.add(
    leftFoot,
    rightFoot,
    skirt,
    torso,
    shoulders,
    strap,
    neck,
    leftArm,
    rightArm,
  );
  return { group, face, faceMaterial, leftArm, rightArm };
};

const createHouseSignTexture = (label) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f4efe6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#2d3142';
  context.lineWidth = 18;
  context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  context.fillStyle = '#2d3142';
  context.font = '700 96px Montserrat, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createHouse = () => {
  const group = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({ color: HOUSE_WALL, roughness: 0.82 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: HOUSE_ROOF, roughness: 0.7 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: HOUSE_TRIM, roughness: 0.6 });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: HOUSE_DOOR, roughness: 0.85 });

  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.7, 3.2), wallMaterial);
  walls.position.y = 1.35;
  walls.castShadow = true;
  walls.receiveShadow = true;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.35, 1.5, 4), roofMaterial);
  roof.position.y = 3.4;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.25, 0.08), doorMaterial);
  door.position.set(0, 0.63, -1.62);

  const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.06), trimMaterial);
  leftWindow.position.set(-1.25, 1.55, -1.62);
  const rightWindow = leftWindow.clone();
  rightWindow.position.x = 1.25;

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.82, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.55 }),
  );
  plaque.position.set(0, 2.22, -1.64);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.7),
    new THREE.MeshBasicMaterial({
      map: createHouseSignTexture('Detox Mental'),
      side: THREE.DoubleSide,
    }),
  );
  sign.position.set(0, 2.22, -1.69);
  sign.rotation.y = Math.PI;

  const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.55), wallMaterial);
  step.position.set(0, 0.06, -1.85);

  group.add(walls, roof, door, leftWindow, rightWindow, plaque, sign, step);
  group.position.set(HOUSE.x, 0, HOUSE.z);
  return group;
};

export const createSocratesWalkWorld = ({ container, faceUrl = FACE_URL }) => {
  const input = { moveX: 0, moveZ: 0, jumpQueued: false };
  let state = createWalkerState();
  let cameraYaw = 0;
  let walkPhase = 0;
  let disposed = false;
  let rafId = 0;
  let lastTime = performance.now();

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(SKY, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(SKY, 20, 50);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);

  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x6d7a4e, 1.05));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.35);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 42;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(18, 48),
    new THREE.MeshStandardMaterial({ color: GROUND, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(6.4, 40),
    new THREE.MeshStandardMaterial({ color: PLAZA, roughness: 0.7 }),
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  scene.add(plaza);

  COLUMN_SPOTS.forEach(([x, z]) => scene.add(createColumn(x, z)));
  TREE_SPOTS.forEach(([x, z]) => scene.add(createTree(x, z)));
  scene.add(createHouse());

  const { group: character, face, faceMaterial, leftArm, rightArm } = createCharacter();
  scene.add(character);
  scene.add(face);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(faceUrl, (texture) => {
    if (disposed) {
      texture.dispose();
      return;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(1, 0.72);
    texture.offset.set(0, 0.28);
    texture.needsUpdate = true;
    faceMaterial.map = texture;
    faceMaterial.needsUpdate = true;
  });

  const resize = () => {
    if (disposed) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const tick = (now) => {
    if (disposed) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const jump = input.jumpQueued;
    input.jumpQueued = false;
    state = stepWalker(state, {
      moveX: input.moveX,
      moveZ: input.moveZ,
      jump,
      cameraYaw,
    }, dt);

    const moving = input.moveX !== 0 || input.moveZ !== 0;
    if (moving) {
      cameraYaw += shortestAngleDelta(cameraYaw, state.yaw) * Math.min(1, dt * 7);
      walkPhase += dt * 11;
    }

    const bob = state.grounded && moving ? Math.sin(walkPhase) * 0.04 : 0;
    const swing = state.grounded && moving ? Math.sin(walkPhase) * 0.32 : 0;
    character.position.set(state.x, state.y + bob, state.z);
    character.rotation.y = state.yaw;
    leftArm.rotation.x = swing;
    rightArm.rotation.x = -swing;
    face.position.set(state.x, state.y + 1.78 + bob, state.z);

    const cameraDistance = 6.4;
    const cameraHeight = 2.7;
    camera.position.set(
      state.x - Math.sin(cameraYaw) * cameraDistance,
      state.y + cameraHeight,
      state.z - Math.cos(cameraYaw) * cameraDistance,
    );
    camera.lookAt(state.x, state.y + 1.25, state.z);
    face.lookAt(camera.position);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  };

  container.appendChild(renderer.domElement);
  resize();
  rafId = requestAnimationFrame(tick);

  return {
    canvas: renderer.domElement,
    setMove: (moveX, moveZ) => {
      input.moveX = moveX;
      input.moveZ = moveZ;
    },
    queueJump: () => {
      input.jumpQueued = true;
    },
    resize,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        disposeMaterial(object.material);
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
};
