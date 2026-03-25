import * as THREE from 'three';
import { colliders } from './building.js';

const PLAYER_RADIUS = 0.6;  // collision radius
const PLAYER_HEIGHT = 5.2;  // eye height in feet
const WALK_SPEED = 6;
const SPRINT_SPEED = 12;

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const velocity = new THREE.Vector3();
const moveDir = new THREE.Vector3();
const keys = {};
let isLocked = false;

// Mobile detection
export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  ('ontouchstart' in window && window.innerWidth < 1024);

// Touch joystick vector (-1 to 1)
const touchMoveVec = { x: 0, y: 0 };

export function isPointerLocked() { return isLocked; }

export function initControls(camera, renderer) {
  const blocker = document.getElementById('blocker');
  const startBtn = document.getElementById('startBtn');

  if (isMobile) {
    document.body.classList.add('mobile');

    startBtn.addEventListener('click', () => {
      isLocked = true;
      blocker.classList.add('hidden');
    });

    initTouchControls(camera);
  } else {
    startBtn.addEventListener('click', () => {
      renderer.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === renderer.domElement;
      blocker.classList.toggle('hidden', isLocked);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isLocked) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= e.movementX * 0.002;
      euler.x -= e.movementY * 0.002;
      euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
      camera.quaternion.setFromEuler(euler);
    });
  }

  document.addEventListener('keydown', (e) => { keys[e.code] = true; });
  document.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // Set initial position
  camera.position.set(11, PLAYER_HEIGHT, 9.5);
  camera.rotation.order = 'YXZ';
}

function initTouchControls(camera) {
  let lookTouchId = -1;
  let lastLookX = 0, lastLookY = 0;
  let joystickTouchId = -1;
  let joyCenterX = 0, joyCenterY = 0;

  const joyZone = document.getElementById('joystick-zone');
  const joyKnob = document.getElementById('joystick-knob');
  const joyBase = document.getElementById('joystick-base');
  const maxRadius = 40;

  // Joystick touch start
  joyZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    const rect = joyBase.getBoundingClientRect();
    joyCenterX = rect.left + rect.width / 2;
    joyCenterY = rect.top + rect.height / 2;
  }, { passive: false });

  // Look touch start (on non-UI areas)
  document.addEventListener('touchstart', (e) => {
    for (const touch of e.changedTouches) {
      const target = touch.target;
      if (target.closest('#joystick-zone') || target.closest('#mobile-buttons') ||
          target.closest('#blocker') || target.closest('#minimap') ||
          target.closest('#teleport-menu')) continue;
      if (lookTouchId === -1) {
        lookTouchId = touch.identifier;
        lastLookX = touch.clientX;
        lastLookY = touch.clientY;
      }
    }
  }, { passive: true });

  // Unified touchmove on document (reliable even if finger drifts off element)
  document.addEventListener('touchmove', (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouchId) {
        e.preventDefault();
        let dx = touch.clientX - joyCenterX;
        let dy = touch.clientY - joyCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxRadius) {
          dx = dx / dist * maxRadius;
          dy = dy / dist * maxRadius;
        }
        joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
        touchMoveVec.x = dx / maxRadius;
        touchMoveVec.y = dy / maxRadius;
      } else if (touch.identifier === lookTouchId && isLocked) {
        const dx = touch.clientX - lastLookX;
        const dy = touch.clientY - lastLookY;
        lastLookX = touch.clientX;
        lastLookY = touch.clientY;

        euler.setFromQuaternion(camera.quaternion);
        euler.y -= dx * 0.004;
        euler.x -= dy * 0.004;
        euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
        camera.quaternion.setFromEuler(euler);
      }
    }
  }, { passive: false });

  // Unified touchend / touchcancel
  const endTouch = (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouchId) {
        joystickTouchId = -1;
        touchMoveVec.x = 0;
        touchMoveVec.y = 0;
        joyKnob.style.transform = 'translate(0px, 0px)';
      }
      if (touch.identifier === lookTouchId) {
        lookTouchId = -1;
      }
    }
  };
  document.addEventListener('touchend', endTouch);
  document.addEventListener('touchcancel', endTouch);
}

export function getKeys() { return keys; }

// Check if a position collides with any active wall collider
function checkCollision(x, z) {
  for (const c of colliders) {
    if (!c.active) continue;
    if (x + PLAYER_RADIUS > c.minX &&
        x - PLAYER_RADIUS < c.maxX &&
        z + PLAYER_RADIUS > c.minZ &&
        z - PLAYER_RADIUS < c.maxZ) {
      return true;
    }
  }
  return false;
}

export function updateControls(camera, delta) {
  if (!isLocked) return;

  const speed = keys['ShiftLeft'] || keys['ShiftRight'] ? SPRINT_SPEED : WALK_SPEED;

  // Calculate movement direction
  moveDir.set(0, 0, 0);
  if (isMobile) {
    moveDir.x = touchMoveVec.x;
    moveDir.z = touchMoveVec.y;
  } else {
    if (keys['KeyW']) moveDir.z = -1;
    if (keys['KeyS']) moveDir.z = 1;
    if (keys['KeyA']) moveDir.x = -1;
    if (keys['KeyD']) moveDir.x = 1;
  }
  moveDir.normalize();

  // Get camera forward and right (horizontal only)
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3(1, 0, 0);
  right.applyQuaternion(camera.quaternion);
  right.y = 0;
  right.normalize();

  // Calculate desired velocity
  velocity.set(0, 0, 0);
  velocity.addScaledVector(forward, -moveDir.z * speed * delta);
  velocity.addScaledVector(right, moveDir.x * speed * delta);

  // Apply collision detection — slide along walls
  const newX = camera.position.x + velocity.x;
  const newZ = camera.position.z + velocity.z;

  // Try full movement
  if (!checkCollision(newX, newZ)) {
    camera.position.x = newX;
    camera.position.z = newZ;
  } else {
    // Try X only (slide along Z-axis walls)
    if (!checkCollision(newX, camera.position.z)) {
      camera.position.x = newX;
    }
    // Try Z only (slide along X-axis walls)
    if (!checkCollision(camera.position.x, newZ)) {
      camera.position.z = newZ;
    }
  }

  // Vertical movement (free fly for now — useful for inspecting from above)
  if (keys['Space']) camera.position.y += speed * delta * 0.5;
  if (keys['KeyC']) camera.position.y -= speed * delta * 0.5;
  camera.position.y = Math.max(1.5, Math.min(20, camera.position.y));
}

// Teleport presets
export const presets = [
  { pos: [11, PLAYER_HEIGHT, 9.5], label: 'Outside — East of building' },
  { pos: [3.5, PLAYER_HEIGHT, 6.5], label: 'Room — center' },
  { pos: [3.5, PLAYER_HEIGHT, 14.75], label: 'Toilet — center' },
  { pos: [-7, PLAYER_HEIGHT, -40], label: 'Main Gate — West road' },
  { pos: [40, 40, -17], label: 'Plot aerial view' },
  { pos: [2, PLAYER_HEIGHT, 0.5], label: 'Cantilever — outdoor counter' },
  { pos: [1, PLAYER_HEIGHT, 26], label: 'Parking area' },
  { pos: [40, PLAYER_HEIGHT, -30], label: 'Nursery center' },
  { pos: [-20, PLAYER_HEIGHT, -17], label: 'West Road — looking at plot' },
];

export function teleport(camera, index) {
  const p = presets[index];
  if (p) {
    camera.position.set(p.pos[0], p.pos[1], p.pos[2]);
  }
}
