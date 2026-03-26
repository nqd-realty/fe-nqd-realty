import * as THREE from 'three';
import { createBuilding, createFixtures } from './building.js';
import { createDoors, updateDoors, toggleNearestDoor, getNearestDoorInfo } from './doors.js';
import { initControls, updateControls, isPointerLocked, getKeys, teleport, presets, isMobile } from './controls.js';
import { createEnvironment } from './environment.js';
import { updateHUD, updateDoorPrompt, drawMinimap, toggleDimensions, updateDimensions } from './ui.js';
import { createAvatar } from '../../../../shared/js/avatar.js';

// ============================================================
// SCENE
// ============================================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  72, window.innerWidth / window.innerHeight, 0.1, isMobile ? 200 : 600
);

// Mobile: no antialiasing, lower pixel ratio, no soft shadows
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
if (!isMobile) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ============================================================
// BUILD WORLD
// ============================================================
createEnvironment(scene, isMobile);
createBuilding(scene, isMobile);
createFixtures(scene, isMobile);
createDoors(scene);
initControls(camera, renderer);

// ============================================================
// AVATAR + VIEW MODE
// ============================================================
const playerAvatar = createAvatar({
  firstPerson: true,
  hasClipboard: true,
  hasHardHat: true,
});
scene.add(playerAvatar.group);

// Third-person camera state
let thirdPerson = true;
const CAM_BACK = 6;
const CAM_UP = 2.5;
const CAM_MIN = 0.8;
const playerPos = new THREE.Vector3(11, 5.2, 9.5);
const _back = new THREE.Vector3();
let playerPosReady = false;

// CS 1.6 style camera collision
const raycaster = new THREE.Raycaster();
const _rayOrigin = new THREE.Vector3();
const _rayTarget = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
let currentCamDist = CAM_BACK;
let rayTargetDist = CAM_BACK; // last computed target (for throttled raycast)
let rayFrame = 0;

function isDescendantOf(obj, ancestor) {
  let cur = obj;
  while (cur) {
    if (cur === ancestor) return true;
    cur = cur.parent;
  }
  return false;
}

// Start in third person
playerAvatar.setHeadVisible(true);

function toggleView() {
  thirdPerson = !thirdPerson;
  playerAvatar.setHeadVisible(thirdPerson);
}

// ============================================================
// INPUT
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.code.startsWith('Digit') && e.code.length === 6) {
    const idx = parseInt(e.code[5]) - 1;
    if (idx >= 0 && idx < 9) teleport(camera, idx);
  }

  if (e.code === 'KeyE' && isPointerLocked()) {
    toggleNearestDoor(thirdPerson ? playerPos : camera.position);
  }

  if (e.code === 'KeyM') toggleDimensions();
  if (e.code === 'KeyV') toggleView();
});

// ============================================================
// MOBILE BUTTON HANDLERS
// ============================================================
if (isMobile) {
  document.getElementById('action-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isPointerLocked()) {
      toggleNearestDoor(thirdPerson ? playerPos : camera.position);
    }
  }, { passive: false });

  const tpBtn = document.getElementById('teleport-btn');
  const tpMenu = document.getElementById('teleport-menu');

  tpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tpMenu.classList.toggle('hidden');
  }, { passive: false });

  presets.forEach((p, i) => {
    const item = document.createElement('button');
    item.className = 'tp-item';
    item.textContent = `${i + 1}. ${p.label}`;
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      teleport(camera, i);
      tpMenu.classList.add('hidden');
    }, { passive: false });
    tpMenu.appendChild(item);
  });

  document.getElementById('dims-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleDimensions();
  }, { passive: false });

  document.getElementById('view-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleView();
  }, { passive: false });
}

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();
let mapFrame = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (thirdPerson && playerPosReady) {
    camera.position.copy(playerPos);
  }

  updateControls(camera, delta);
  updateDoors(delta);

  playerPos.copy(camera.position);
  playerPosReady = true;

  playerAvatar.update(delta, camera);

  // Third-person camera with wall collision
  if (thirdPerson) {
    _back.set(0, 0, 1).applyQuaternion(camera.quaternion);
    const hLen = Math.sqrt(_back.x * _back.x + _back.z * _back.z);
    if (hLen > 0.001) { _back.x /= hLen; _back.z /= hLen; }

    _rayTarget.set(
      playerPos.x + _back.x * CAM_BACK,
      playerPos.y + CAM_UP,
      playerPos.z + _back.z * CAM_BACK
    );

    _rayOrigin.copy(playerPos);
    _rayDir.copy(_rayTarget).sub(_rayOrigin);
    const maxDist = _rayDir.length();
    _rayDir.normalize();

    // Throttle raycast on mobile (every 4th frame) — biggest perf save
    rayFrame++;
    const shouldRaycast = isMobile ? (rayFrame % 4 === 0) : true;

    if (shouldRaycast) {
      raycaster.set(_rayOrigin, _rayDir);
      raycaster.far = maxDist;
      raycaster.near = 0;

      rayTargetDist = maxDist;
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        if (isDescendantOf(hit.object, playerAvatar.group)) continue;
        rayTargetDist = Math.max(CAM_MIN, hit.distance - 0.3);
        break;
      }
    }

    const lerpSpeed = rayTargetDist < currentCamDist ? 15 : 5;
    currentCamDist += (rayTargetDist - currentCamDist) * Math.min(delta * lerpSpeed, 1);

    camera.position.copy(_rayOrigin).addScaledVector(_rayDir, currentCamDist);
  }

  // UI updates
  if (isPointerLocked()) {
    updateHUD(thirdPerson ? { position: playerPos } : camera);
    updateDimensions(thirdPerson ? { position: playerPos } : camera);
    const doorInfo = getNearestDoorInfo(thirdPerson ? playerPos : camera.position);
    updateDoorPrompt(doorInfo);
  } else {
    updateDoorPrompt(null);
  }

  // Throttle minimap on mobile (every 3rd frame)
  mapFrame++;
  if (!isMobile || mapFrame % 3 === 0) {
    drawMinimap(camera);
  }

  renderer.render(scene, camera);
}

animate();

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
