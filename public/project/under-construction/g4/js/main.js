import * as THREE from 'three';
import { createBuilding, createFixtures } from './building.js';
import { createDoors, updateDoors, toggleNearestDoor, getNearestDoorInfo } from './doors.js';
import { initControls, updateControls, isPointerLocked, getKeys, teleport, presets, isMobile } from './controls.js';
import { createEnvironment } from './environment.js';
import { updateHUD, updateDoorPrompt, drawMinimap, toggleDimensions, updateDimensions } from './ui.js';

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
// INPUT
// ============================================================
document.addEventListener('keydown', (e) => {
  // Teleport 1-9
  if (e.code.startsWith('Digit') && e.code.length === 6) {
    const idx = parseInt(e.code[5]) - 1;
    if (idx >= 0 && idx < 9) teleport(camera, idx);
  }

  // E — toggle door
  if (e.code === 'KeyE' && isPointerLocked()) {
    toggleNearestDoor(camera.position);
  }

  // M — toggle dimensions overlay
  if (e.code === 'KeyM') {
    toggleDimensions();
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
      toggleNearestDoor(camera.position);
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
      teleport(camera, i);
      tpMenu.classList.add('hidden');
    }, { passive: false });
    tpMenu.appendChild(item);
  });

  // Dimensions button
  document.getElementById('dims-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleDimensions();
  }, { passive: false });
}

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  updateControls(camera, delta);
  updateDoors(delta);

  // UI updates
  if (isPointerLocked()) {
    updateHUD(camera);
    updateDimensions(camera);
    const doorInfo = getNearestDoorInfo(camera.position);
    updateDoorPrompt(doorInfo);
  } else {
    updateDoorPrompt(null);
  }

  drawMinimap(camera);
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
