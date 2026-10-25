import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './CourseWorldScene.css';
import { nearbyStop, stepFollower, stepPlayer, stepTowards } from '../../utils/courseWorld.js';

// Draws the course world and moves the player through it. The rules (where
// things are, how far you may walk, when a kiosk opens) live in
// utils/courseWorld.js; this component only renders them and reads input.

const COLORS = {
  sky: '#fcf3ec',
  grass: '#cdd5a0',
  road: '#efe2cc',
  roadJoint: '#dccbad',
  wood: '#a77b5a',
  cream: '#fcf3ec',
  skin: '#f1c9a5',
  hair: '#3b2a1e',
  player: '#2d3142',
  toga: '#f3e6cf',
  marble: '#f7f1e6',
  cypress: '#5d7a4a',
  olive: '#8a9a5b',
  trunk: '#7a5a3f',
  marker: '#d4a24c',
  visited: '#6f9a5a',
  ink: '#2e1f14',
};
const KIOSK_ACCENTS = ['#c96f4a', '#7d8b4f', '#4f7ea8', '#d4a24c', '#8c5a7a', '#2e1f14'];
const CAMERA_OFFSET = new THREE.Vector3(0, 6.5, 8.5);
const LOOK_AHEAD = new THREE.Vector3(0, 1, -4);
const KEY_DIRECTIONS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true });

const mesh = (geometry, color, [x, y, z] = [0, 0, 0]) => {
  const m = new THREE.Mesh(geometry, material(color));
  m.position.set(x, y, z);
  return m;
};

// Deterministic so the street looks the same on every visit.
const seededRandom = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const canvasTexture = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// A round portrait badge, used as a character's head. `img` null draws "?".
const portraitTexture = (img) => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const texture = canvasTexture(canvas);
  const ring = () => {
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.stroke();
  };
  ctx.fillStyle = img ? COLORS.cream : COLORS.ink;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
  ctx.fill();
  if (!img) {
    ctx.fillStyle = COLORS.cream;
    ctx.font = '700 150px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2 + 8);
    ring();
    return texture;
  }
  const image = new Image();
  image.onload = () => {
    // Portraits are 2:3 with the face in the upper part: crop a square there.
    const side = Math.min(image.width, image.height * 0.62);
    const sx = (image.width - side) / 2;
    const sy = image.height * 0.08;
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
    ctx.restore();
    ring();
    texture.needsUpdate = true;
  };
  image.src = img;
  return texture;
};

// A rounded sign with wrapped text, drawn once Montserrat is ready.
const labelSprite = (text, { width = 2.8, background = '#fff', color = COLORS.ink } = {}) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  const texture = canvasTexture(canvas);
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = background;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 36);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '600 42px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = [];
    text.split(' ').forEach((word) => {
      const last = lines[lines.length - 1];
      if (last && ctx.measureText(`${last} ${word}`).width < canvas.width - 64) {
        lines[lines.length - 1] = `${last} ${word}`;
      } else {
        lines.push(word);
      }
    });
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * 50);
    });
    texture.needsUpdate = true;
  };
  draw();
  document.fonts?.load('600 42px Montserrat').then(draw, () => {});
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(width, (width * canvas.height) / canvas.width, 1);
  return sprite;
};

// A soft round shadow under a character or object.
const blobShadow = (radius) => {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 20),
    new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.16, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  return m;
};

// A low-poly figure. With `portrait` the head is a round badge facing the camera.
const makeFigure = ({ bodyColor, portrait, hooded = false }) => {
  const figure = new THREE.Group();
  const legs = [-0.14, 0.14].map((x) => {
    const leg = mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), hooded ? COLORS.ink : '#5a4636', [x, 0.28, 0]);
    figure.add(leg);
    return leg;
  });
  const body = mesh(
    hooded ? new THREE.ConeGeometry(0.5, 1.5, 10) : new THREE.CylinderGeometry(0.3, 0.46, 1.0, 10),
    bodyColor,
    [0, hooded ? 1.05 : 0.95, 0],
  );
  figure.add(body);
  let head;
  if (portrait !== undefined) {
    head = new THREE.Sprite(new THREE.SpriteMaterial({ map: portraitTexture(portrait) }));
    head.scale.set(0.95, 0.95, 1);
    head.position.y = 1.85;
  } else {
    head = new THREE.Group();
    head.add(mesh(new THREE.SphereGeometry(0.3, 12, 10), COLORS.skin));
    const hair = mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), COLORS.hair, [0, 0.04, 0]);
    hair.rotation.x = -0.25;
    head.add(hair);
    head.position.y = 1.72;
  }
  figure.add(head);
  figure.add(blobShadow(0.5));
  return { figure, legs, body, head };
};

const animateWalk = (parts, time, speed) => {
  const swing = Math.sin(time * 11) * 0.6 * speed;
  parts.legs[0].rotation.x = swing;
  parts.legs[1].rotation.x = -swing;
  parts.body.position.y = 0.95 + Math.abs(Math.sin(time * 11)) * 0.05 * speed;
};

const makeKiosk = (kiosk, index) => {
  const accent = KIOSK_ACCENTS[index % KIOSK_ACCENTS.length];
  const group = new THREE.Group();
  group.position.set(kiosk.x, 0, kiosk.z);
  // Face the road and the player walking up it.
  group.rotation.y = kiosk.side < 0 ? Math.PI / 4 : -Math.PI / 4;

  group.add(mesh(new THREE.BoxGeometry(2.4, 1.0, 0.9), COLORS.wood, [0, 0.5, 0.6]));
  group.add(mesh(new THREE.BoxGeometry(2.42, 0.22, 0.05), accent, [0, 0.75, 1.06]));
  [[-1.15, 0.15], [1.15, 0.15], [-1.15, 1.05], [1.15, 1.05]].forEach(([x, z]) => {
    group.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), COLORS.wood, [x, 1.5, z]));
  });
  for (let i = 0; i < 6; i += 1) {
    const stripe = mesh(new THREE.BoxGeometry(0.42, 0.08, 1.5), i % 2 ? COLORS.cream : accent, [-1.05 + i * 0.42, 3.05, 0.55]);
    stripe.rotation.x = 0.3;
    group.add(stripe);
  }

  const keeper = makeFigure({
    bodyColor: kiosk.keeper.img ? accent : COLORS.ink,
    portrait: kiosk.keeper.img,
    hooded: !kiosk.keeper.img,
  });
  keeper.figure.position.set(0, 0, -0.3);
  group.add(keeper.figure);

  const sign = labelSprite(kiosk.title);
  sign.position.set(0, 3.95, 0.6);
  group.add(sign);

  const marker = mesh(new THREE.OctahedronGeometry(0.22), COLORS.marker, [0, 4.75, 0.6]);
  group.add(marker);
  group.add(blobShadow(1.6));
  return { group, keeper, marker };
};

const makePortico = (goal) => {
  const group = new THREE.Group();
  group.position.set(goal.x, 0, goal.z - 3);
  group.add(mesh(new THREE.BoxGeometry(7, 0.25, 3), COLORS.marble, [0, 0.12, 0]));
  group.add(mesh(new THREE.BoxGeometry(6.4, 0.25, 2.6), COLORS.marble, [0, 0.37, 0]));
  [-2.6, -0.9, 0.9, 2.6].forEach((x) => {
    group.add(mesh(new THREE.CylinderGeometry(0.24, 0.28, 3, 12), COLORS.marble, [x, 2, 0.8]));
    group.add(mesh(new THREE.BoxGeometry(0.7, 0.18, 0.7), COLORS.marble, [x, 3.58, 0.8]));
  });
  group.add(mesh(new THREE.BoxGeometry(6.6, 0.45, 1.2), COLORS.marble, [0, 3.9, 0.8]));
  const gable = new THREE.Shape([new THREE.Vector2(-3.4, 0), new THREE.Vector2(3.4, 0), new THREE.Vector2(0, 1.1)]);
  group.add(mesh(new THREE.ExtrudeGeometry(gable, { depth: 1.2, bevelEnabled: false }), COLORS.marble, [0, 4.12, 0.2]));
  const sign = labelSprite('Pórtico de Tales', { width: 2.6, background: COLORS.ink, color: COLORS.cream });
  sign.position.set(0, 5.6, 0.8);
  group.add(sign);
  return group;
};

const makeTree = (random) => {
  const tree = new THREE.Group();
  if (random() < 0.5) {
    const height = 2.6 + random() * 1.6;
    tree.add(mesh(new THREE.ConeGeometry(0.45, height, 7), COLORS.cypress, [0, height / 2 + 0.2, 0]));
  } else {
    tree.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.2, 6), COLORS.trunk, [0, 0.6, 0]));
    [[0, 1.5, 0, 0.75], [0.45, 1.35, 0.1, 0.5], [-0.4, 1.4, -0.1, 0.55]].forEach(([x, y, z, r]) => {
      tree.add(mesh(new THREE.IcosahedronGeometry(r, 0), COLORS.olive, [x, y, z]));
    });
  }
  tree.add(blobShadow(0.7));
  return tree;
};

const roadTexture = (length) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = COLORS.road;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = COLORS.roadJoint;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 128, 64);
  ctx.strokeRect(-64, 64, 128, 64);
  ctx.strokeRect(64, 64, 128, 64);
  const texture = canvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, length / 2);
  return texture;
};

const buildWorld = (scene, layout, kiosks, host) => {
  const roadStart = layout.bounds.maxZ + 6;
  const roadEnd = layout.goal.z - 8;
  const roadLength = roadStart - roadEnd;

  const ground = mesh(new THREE.PlaneGeometry(220, 220), COLORS.grass, [0, 0, roadEnd / 2]);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(5, roadLength),
    new THREE.MeshStandardMaterial({ map: roadTexture(roadLength), roughness: 1 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.005, (roadStart + roadEnd) / 2);
  scene.add(road);

  const kioskObjects = kiosks.map((kiosk, i) => {
    const object = makeKiosk({ ...kiosk, ...layout.kiosks.find((k) => k.id === kiosk.id) }, i);
    scene.add(object.group);
    return { id: kiosk.id, ...object };
  });

  scene.add(makePortico(layout.goal));

  const random = seededRandom(7);
  for (let z = roadStart; z > roadEnd - 10; z -= 2.2) {
    [-1, 1].forEach((side) => {
      if (random() < 0.35) return;
      const tree = makeTree(random);
      tree.position.set(side * (8 + random() * 14), 0, z + random() * 1.5);
      scene.add(tree);
    });
  }

  const player = makeFigure({ bodyColor: COLORS.player });
  scene.add(player.figure);
  const tales = makeFigure({ bodyColor: COLORS.toga, portrait: host.img });
  scene.add(tales.figure);

  return { kioskObjects, player, tales };
};

const disposeScene = (scene) => {
  scene.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((m) => {
      m?.map?.dispose();
      m?.dispose();
    });
  });
};

const isTyping = (target) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName);

const CourseWorldScene = ({
  layout,
  kiosks,
  host,
  visited,
  paused,
  reducedMotion,
  teleport,
  onStopChange,
  onUnavailable,
}) => {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  // Props the render loop reads every frame, without rebuilding the scene.
  const live = useRef({});
  live.current = { paused, reducedMotion, onStopChange, onUnavailable };

  useEffect(() => {
    const container = containerRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      live.current.onUnavailable();
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.sky);
    scene.fog = new THREE.Fog(COLORS.sky, 28, 70);
    scene.add(new THREE.HemisphereLight('#fff6e8', '#b9a98a', 1.6));
    const sun = new THREE.DirectionalLight('#fff1dc', 1.6);
    sun.position.set(-6, 12, 6);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    const world = buildWorld(scene, layout, kiosks, host);
    const state = {
      player: { ...layout.start },
      tales: { x: layout.start.x + 1.1, z: layout.start.z + 0.6 },
      target: null,
      keys: new Set(),
      stop: null,
      facing: Math.PI,
      time: 0,
    };
    worldRef.current = { world, state, camera, snapCamera: true };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Narrow screens pull the camera back so both road edges stay visible.
      camera.fov = w / h < 0.8 ? 62 : 50;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const onKeyDown = (e) => {
      if (!KEY_DIRECTIONS[e.code] || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code.startsWith('Arrow')) e.preventDefault();
      state.keys.add(e.code);
      state.target = null;
    };
    const onKeyUp = (e) => state.keys.delete(e.code);
    const onBlur = () => state.keys.clear();

    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    let pointerDown = false;
    const aimAt = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hit)) state.target = { x: hit.x, z: hit.z };
    };
    const onPointerDown = (e) => {
      pointerDown = true;
      aimAt(e);
    };
    const onPointerMove = (e) => {
      if (pointerDown) aimAt(e);
    };
    const onPointerUp = () => {
      pointerDown = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const cameraTarget = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    let last = performance.now();

    renderer.setAnimationLoop((now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      state.time += dt;
      const { paused: isPaused, reducedMotion: still } = live.current;
      const before = state.player;

      if (!isPaused) {
        if (state.keys.size) {
          const input = { x: 0, z: 0 };
          state.keys.forEach((code) => {
            input.x += KEY_DIRECTIONS[code][0];
            input.z += KEY_DIRECTIONS[code][1];
          });
          state.player = stepPlayer(state.player, input, dt, layout.bounds);
        } else if (state.target) {
          state.player = stepTowards(state.player, state.target, dt, layout.bounds);
        }
        state.tales = stepFollower(state.tales, state.player, dt);

        const stop = nearbyStop(state.player, layout, state.stop);
        if (stop !== state.stop) {
          state.stop = stop;
          live.current.onStopChange(stop);
        }
      }

      const { player, tales, kioskObjects } = world;
      const dx = state.player.x - before.x;
      const dz = state.player.z - before.z;
      const speed = Math.min(Math.hypot(dx, dz) / (dt || 1) / 5, 1);
      if (speed > 0.05) state.facing = Math.atan2(dx, dz);
      player.figure.position.set(state.player.x, 0, state.player.z);
      // Turn the short way round.
      const turn = THREE.MathUtils.euclideanModulo(state.facing - player.figure.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      player.figure.rotation.y += turn * Math.min(1, dt * 12);
      tales.figure.position.set(state.tales.x, 0, state.tales.z);
      if (!still) {
        animateWalk(player, state.time, speed);
        animateWalk(tales, state.time + 0.4, speed);
        kioskObjects.forEach(({ marker, keeper }, i) => {
          marker.rotation.y = state.time * 1.5;
          marker.position.y = 4.75 + Math.sin(state.time * 2 + i) * 0.1;
          keeper.head.position.y = (keeper.head.isSprite ? 1.85 : 1.72) + Math.sin(state.time * 1.6 + i) * 0.03;
        });
      }

      cameraTarget.set(state.player.x, 0, state.player.z).add(CAMERA_OFFSET);
      lookTarget.set(state.player.x * 0.5, 0, state.player.z).add(LOOK_AHEAD);
      if (worldRef.current.snapCamera || still) {
        camera.position.copy(cameraTarget);
        worldRef.current.snapCamera = false;
      } else {
        camera.position.lerp(cameraTarget, 1 - Math.exp(-dt * 4));
      }
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pointerup', onPointerUp);
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      worldRef.current = null;
    };
  }, [layout, kiosks, host]);

  useEffect(() => {
    if (!worldRef.current || !teleport) return;
    const { state } = worldRef.current;
    state.player = { ...teleport.position };
    state.tales = { x: teleport.position.x + 1.1, z: teleport.position.z + 0.6 };
    state.target = null;
    worldRef.current.snapCamera = true;
  }, [teleport]);

  useEffect(() => {
    worldRef.current?.world.kioskObjects.forEach(({ id, marker }) => {
      marker.material.color.set(visited.has(id) ? COLORS.visited : COLORS.marker);
    });
  }, [visited]);

  return <div ref={containerRef} className="course-world-scene" aria-hidden="true" />;
};

export default CourseWorldScene;
