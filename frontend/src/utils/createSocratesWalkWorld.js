import * as THREE from 'three';
import {
  DEFAULT_OBSTACLES,
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

const COLUMN_SPOTS = DEFAULT_OBSTACLES.slice(0, 6).map((spot) => [spot.x, spot.z]);
const TREE_SPOTS = DEFAULT_OBSTACLES.slice(6).map((spot) => [spot.x, spot.z]);

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

const createCharacter = () => {
  const group = new THREE.Group();

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 1.2, 14),
    new THREE.MeshStandardMaterial({ color: ROBE, roughness: 0.8 }),
  );
  robe.position.y = 0.6;
  robe.castShadow = true;

  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.05, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: STRAP, roughness: 0.75 }),
  );
  strap.position.set(0.02, 1.05, 0.08);
  strap.rotation.set(0.2, 0, 1.15);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 18, 14),
    new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.7 }),
  );
  head.position.y = 1.48;
  head.castShadow = true;

  const faceMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), faceMaterial);
  face.position.set(0, 1.48, 0.3);

  group.add(robe, strap, head, face);
  return { group, faceMaterial };
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
  scene.fog = new THREE.Fog(SKY, 14, 42);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);

  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x6d7a4e, 1.05));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.35);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 36;
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
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

  const { group: character, faceMaterial } = createCharacter();
  scene.add(character);

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

    const bob = state.grounded && moving ? Math.sin(walkPhase) * 0.045 : 0;
    character.position.set(state.x, state.y + bob, state.z);
    character.rotation.y = state.yaw;

    const cameraDistance = 6.4;
    const cameraHeight = 2.7;
    camera.position.set(
      state.x - Math.sin(cameraYaw) * cameraDistance,
      state.y + cameraHeight,
      state.z - Math.cos(cameraYaw) * cameraDistance,
    );
    camera.lookAt(state.x, state.y + 1.25, state.z);

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
