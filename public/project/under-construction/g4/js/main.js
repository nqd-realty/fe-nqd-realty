import * as THREE from 'three';
import { createBuilding, createFixtures } from './building.js';
import { createDoors, updateDoors, toggleNearestDoor, getNearestDoorInfo } from './doors.js';
import { initControls, updateControls, isPointerLocked, getKeys, teleport, presets, isMobile } from './controls.js';
import { createEnvironment } from './environment.js';
import { updateHUD, updateDoorPrompt, drawMinimap, toggleDimensions, updateDimensions } from './ui.js';
import { createAvatar } from '../../../../shared/js/avatar.js';
import { createProfiler } from '../../../../shared/js/profiler.js';

// ============================================================
// SCENE
// ============================================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  72, window.innerWidth / window.innerHeight, 0.1, 600
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ============================================================
// BUILD WORLD
// ============================================================
createEnvironment(scene);
createBuilding(scene);
createFixtures(scene);
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
let thirdPerson = true; // default: third person so avatar is visible
const CAM_BACK = 6;     // max distance behind player
const CAM_UP = 2.5;     // height above player eye level
const CAM_MIN = 0.8;    // minimum distance (don't clip into player)
const playerPos = new THREE.Vector3(11, 5.2, 9.5); // matches initial camera pos in controls
const _back = new THREE.Vector3();
let playerPosReady = false;

// CS 1.6 style camera collision
const raycaster = new THREE.Raycaster();
const _rayOrigin = new THREE.Vector3();
const _rayTarget = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
let currentCamDist = CAM_BACK; // smoothed distance (lerps toward target)

function isDescendantOf(obj, ancestor) {
  let cur = obj;
  while (cur) {
    if (cur === ancestor) return true;
    cur = cur.parent;
  }
  return false;
}

// Start in third person — show head
playerAvatar.setHeadVisible(true);

// Profiler — activate with ?profile=1 or press P
const profiler = createProfiler({ renderer, scene, camera, avatar: playerAvatar });

function toggleView() {
  thirdPerson = !thirdPerson;
  playerAvatar.setHeadVisible(thirdPerson);
}

// Teleport that works in both views — in third person the render loop
// restores camera.position from playerPos each frame, so playerPos must
// be moved too or the teleport is undone before it renders
function doTeleport(idx) {
  teleport(camera, idx);
  playerPos.copy(camera.position);
  playerPosReady = true;
}

// ============================================================
// INPUT
// ============================================================
document.addEventListener('keydown', (e) => {
  // Teleport 1-9
  if (e.code.startsWith('Digit') && e.code.length === 6) {
    const idx = parseInt(e.code[5]) - 1;
    if (idx >= 0 && idx < 9) doTeleport(idx);
  }

  // E — toggle door (use player position, not offset camera)
  if (e.code === 'KeyE' && isPointerLocked()) {
    toggleNearestDoor(thirdPerson ? playerPos : camera.position);
  }

  // M — toggle dimensions overlay
  if (e.code === 'KeyM') {
    toggleDimensions();
  }

  // V — toggle first/third person view
  if (e.code === 'KeyV') {
    toggleView();
  }
});

// ============================================================
// MOBILE BUTTON HANDLERS
// ============================================================
if (isMobile) {
  // Action button — toggle nearest door
  document.getElementById('action-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isPointerLocked()) {
      toggleNearestDoor(thirdPerson ? playerPos : camera.position);
    }
  }, { passive: false });

  // Teleport button — show/hide menu
  const tpBtn = document.getElementById('teleport-btn');
  const tpMenu = document.getElementById('teleport-menu');

  tpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tpMenu.classList.toggle('hidden');
  }, { passive: false });

  // Build teleport menu items
  presets.forEach((p, i) => {
    const item = document.createElement('button');
    item.className = 'tp-item';
    item.textContent = `${i + 1}. ${p.label}`;
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      doTeleport(i);
      tpMenu.classList.add('hidden');
    }, { passive: false });
    tpMenu.appendChild(item);
  });

  // Dimensions button
  document.getElementById('dims-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleDimensions();
  }, { passive: false });

  // View toggle button
  document.getElementById('view-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleView();
  }, { passive: false });
}

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // In third-person, restore camera to player position before controls update
  // so WASD/collision operates from the player's actual location, not the offset camera
  if (thirdPerson && playerPosReady) {
    camera.position.copy(playerPos);
  }

  profiler.begin('controls+doors');
  updateControls(camera, delta);
  updateDoors(delta);
  profiler.end();

  // Save where controls placed the camera — this is the true player position
  playerPos.copy(camera.position);
  playerPosReady = true;

  // Sync avatar to player position (camera is at playerPos right now)
  profiler.begin('avatar');
  if (profiler.flags.avatar) playerAvatar.update(delta, camera);
  profiler.end();

  // Third-person: offset camera behind player with wall collision (CS 1.6 style)
  profiler.begin('cam raycast');
  if (thirdPerson) {
    // Get the "behind" direction (horizontal only)
    _back.set(0, 0, 1).applyQuaternion(camera.quaternion);
    const hLen = Math.sqrt(_back.x * _back.x + _back.z * _back.z);
    if (hLen > 0.001) { _back.x /= hLen; _back.z /= hLen; }

    // Desired camera position at full distance
    _rayTarget.set(
      playerPos.x + _back.x * CAM_BACK,
      playerPos.y + CAM_UP,
      playerPos.z + _back.z * CAM_BACK
    );

    // Raycast from player head toward desired camera position
    _rayOrigin.copy(playerPos);
    _rayDir.copy(_rayTarget).sub(_rayOrigin);
    const maxDist = _rayDir.length();
    _rayDir.normalize();

    raycaster.set(_rayOrigin, _rayDir);
    raycaster.far = maxDist;
    raycaster.near = 0;

    // Find closest wall/geometry hit (skip avatar meshes)
    let targetDist = maxDist;
    if (profiler.flags.camRaycast) {
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        if (isDescendantOf(hit.object, playerAvatar.group)) continue;
        // Pull camera in front of the wall
        targetDist = Math.max(CAM_MIN, hit.distance - 0.3);
        break;
      }
    }

    // Smooth lerp toward target distance (fast pull-in, slower pull-out)
    const lerpSpeed = targetDist < currentCamDist ? 15 : 5;
    currentCamDist += (targetDist - currentCamDist) * Math.min(delta * lerpSpeed, 1);

    camera.position.copy(_rayOrigin).addScaledVector(_rayDir, currentCamDist);
  }
  profiler.end();

  // UI updates
  profiler.begin('ui+minimap');
  if (isPointerLocked()) {
    updateHUD(thirdPerson ? { position: playerPos } : camera);
    updateDimensions(thirdPerson ? { position: playerPos } : camera);
    const doorInfo = getNearestDoorInfo(thirdPerson ? playerPos : camera.position);
    updateDoorPrompt(doorInfo);
  } else {
    updateDoorPrompt(null);
  }

  drawMinimap(camera);
  profiler.end();

  profiler.begin('render (CPU)');
  renderer.render(scene, camera);
  profiler.end();

  profiler.frame();
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
