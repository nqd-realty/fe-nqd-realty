import * as THREE from 'three';
import { M } from './materials.js';
import { addDynamicCollider } from './building.js';

function box(sx, sy, sz, px, py, pz, mat) {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px, py, pz);
  m.castShadow = true;
  return m;
}

function cyl(r, h, px, py, pz, mat) {
  const g = new THREE.CylinderGeometry(r, r, h, 12);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px, py, pz);
  return m;
}

// All interactive elements (doors + shutter)
export const doors = [];

export function createDoors(scene) {
  // ============================================================
  // 1. TOILET DOOR — West wall, S-biased, hinged on South jamb
  // ============================================================
  const toilDoorPivot = new THREE.Group();
  toilDoorPivot.position.set(-1, 0, 12.25);
  toilDoorPivot.userData = {
    type: 'swing',
    isOpen: false,
    currentAngle: 0,
    targetAngle: 0,
    openAngle: 1.4,
    closeAngle: 0,
    speed: 4,
    label: 'Toilet Door',
    proximityCenter: new THREE.Vector3(-1, 3, 13.25),
  };
  scene.add(toilDoorPivot);

  // Door frame
  const tf1 = box(0.25, 7.2, 0.15, 0.125, 3.6, 0, M.frame);
  const tf2 = box(0.25, 7.2, 0.15, 0.125, 3.6, 2.5, M.frame);
  const tf3 = box(0.25, 0.2, 2.65, 0.125, 7.1, 1.25, M.frame);
  scene.add(tf1, tf2, tf3);
  tf1.position.x -= 1; tf1.position.z += 12.25;
  tf2.position.x -= 1; tf2.position.z += 12.25;
  tf3.position.x -= 1; tf3.position.z += 12.25;

  const tdMesh = box(0.12, 7, 2.5, 0.06, 3.5, 1.25, M.door);
  const th = cyl(0.03, 0.12, 0.12, 3.2, 2.2, M.chrome);
  th.rotation.z = Math.PI / 2;
  toilDoorPivot.add(tdMesh);
  toilDoorPivot.add(th);
  doors.push(toilDoorPivot);

  // ============================================================
  // 2. ROOM DOOR — East wall, NE corner, hinged at N
  // ============================================================
  const roomDoorPivot = new THREE.Group();
  roomDoorPivot.position.set(8, 0, 11);
  roomDoorPivot.userData = {
    type: 'swing',
    isOpen: false,
    currentAngle: 0,
    targetAngle: 0,
    openAngle: -1.4,
    closeAngle: 0,
    speed: 4,
    label: 'Room Door',
    proximityCenter: new THREE.Vector3(8, 3, 9.5),
  };
  scene.add(roomDoorPivot);

  const rf1 = box(0.25, 7.2, 0.15, -0.125, 3.6, 0, M.frame);
  const rf2 = box(0.25, 7.2, 0.15, -0.125, 3.6, -3, M.frame);
  const rf3 = box(0.25, 0.2, 3.15, -0.125, 7.1, -1.5, M.frame);
  scene.add(rf1, rf2, rf3);
  rf1.position.x += 8; rf1.position.z += 11;
  rf2.position.x += 8; rf2.position.z += 11;
  rf3.position.x += 8; rf3.position.z += 11;

  const rdMesh = box(0.12, 7, 3, -0.06, 3.5, -1.5, M.door);
  const rh = cyl(0.03, 0.12, -0.12, 3.2, -2.6, M.chrome);
  rh.rotation.z = Math.PI / 2;
  roomDoorPivot.add(rdMesh);
  roomDoorPivot.add(rh);
  doors.push(roomDoorPivot);

  // ============================================================
  // 3. AUTO ROLLER SHUTTER — West boundary, 15ft wide (Z=20..35)
  // ============================================================
  createRollerShutter(scene);
}

function createRollerShutter(scene) {
  const shutterGroup = new THREE.Group();
  shutterGroup.position.set(-5, 0, 26.75); // center of 16.5ft span (Z=18.5 to Z=35)

  // Shutter materials
  const slatMat = new THREE.MeshStandardMaterial({
    color: 0x7A7A7A, roughness: 0.35, metalness: 0.7,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x555555, roughness: 0.3, metalness: 0.8,
  });
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x444444, roughness: 0.4, metalness: 0.6,
  });

  const shutterWidth = 16.5;  // Z-axis (N-S, Z=18.5 to Z=35)
  const shutterHeight = 8;   // Y-axis (enough for car)
  const slatHeight = 0.3;    // each slat
  const slatGap = 0.02;      // tiny gap between slats
  const slatDepth = 0.12;    // thickness
  const slatStep = slatHeight + slatGap;
  const numSlats = Math.floor(shutterHeight / slatStep);

  // --- Guide rails (vertical channels on both sides) ---
  const railW = 0.25;
  const railD = 0.3;
  // South rail (Z = -7.5)
  const railS = box(railD, shutterHeight + 2, railW, 0, shutterHeight / 2 + 1, -shutterWidth / 2, frameMat);
  shutterGroup.add(railS);
  // North rail (Z = +7.5)
  const railN = box(railD, shutterHeight + 2, railW, 0, shutterHeight / 2 + 1, shutterWidth / 2, frameMat);
  shutterGroup.add(railN);

  // --- Roller drum housing at top ---
  const drumRadius = 0.6;
  const drumGeo = new THREE.CylinderGeometry(drumRadius, drumRadius, shutterWidth + 0.5, 16);
  const drum = new THREE.Mesh(drumGeo, frameMat);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, shutterHeight + drumRadius + 0.3, 0);
  shutterGroup.add(drum);

  // Drum housing box
  const housingH = drumRadius * 2 + 0.4;
  const housing = box(0.8, housingH, shutterWidth + 0.5, 0, shutterHeight + drumRadius + 0.3, 0, frameMat);
  shutterGroup.add(housing);

  // --- Slats (the actual shutter curtain) ---
  const slatsGroup = new THREE.Group();

  for (let i = 0; i < numSlats; i++) {
    const y = slatHeight / 2 + i * slatStep;
    const isVentSlat = (i >= 2 && i <= 4) || (i >= 10 && i <= 12); // ventilation rows

    if (isVentSlat) {
      // Ventilation slat — perforated with gaps
      const segCount = 8;
      const segWidth = (shutterWidth - 0.5) / segCount;
      for (let s = 0; s < segCount; s++) {
        // Alternating solid/gap pattern
        const solidWidth = segWidth * 0.65;
        const zPos = -shutterWidth / 2 + 0.25 + s * segWidth + solidWidth / 2;

        const slat = box(slatDepth, slatHeight * 0.7, solidWidth, 0, y, zPos, ventMat);
        slatsGroup.add(slat);
      }

      // Angled louver slats for airflow (tilted strips in the gaps)
      for (let s = 0; s < segCount - 1; s++) {
        const gapCenter = -shutterWidth / 2 + 0.25 + (s + 1) * segWidth - segWidth * 0.35 / 2;
        const louver = box(slatDepth * 1.5, slatHeight * 0.5, segWidth * 0.3, 0, y, gapCenter, slatMat);
        louver.rotation.z = 0.4; // angled for airflow
        slatsGroup.add(louver);
      }
    } else {
      // Solid slat — corrugated profile (two stacked thin boxes for depth)
      const slat = box(slatDepth, slatHeight, shutterWidth - 0.5, 0, y, 0, slatMat);
      slatsGroup.add(slat);

      // Corrugation ridge (slight bump in center of each slat)
      const ridge = box(slatDepth * 0.3, slatHeight * 0.4, shutterWidth - 0.5, slatDepth * 0.5, y, 0, slatMat);
      slatsGroup.add(ridge);
    }
  }

  // Bottom bar (heavier bottom rail)
  const bottomBar = box(slatDepth * 2, 0.5, shutterWidth - 0.3, 0, 0.25, 0, frameMat);
  slatsGroup.add(bottomBar);

  // Handle on bottom bar
  const handleBar = box(slatDepth + 0.15, 0.15, 3, 0.15, 0.5, 0, M.chrome);
  slatsGroup.add(handleBar);

  shutterGroup.add(slatsGroup);
  scene.add(shutterGroup);

  // Dynamic collider — blocks passage when shutter is closed
  const shutterCollider = addDynamicCollider(-5.5, -4.5, 18.5, 35);

  // Store as interactive element
  shutterGroup.userData = {
    type: 'shutter',
    isOpen: false,
    slatsGroup: slatsGroup,
    currentY: 0,
    targetY: 0,
    openY: shutterHeight + 1,
    closeY: 0,
    speed: 3,
    label: 'Auto Shutter',
    proximityCenter: new THREE.Vector3(-5, 3, 26.75),
    proximityRadius: 10,
    collider: shutterCollider,
  };
  doors.push(shutterGroup);
}

export function updateDoors(delta) {
  for (const door of doors) {
    const ud = door.userData;

    if (ud.type === 'swing') {
      // Swing door — rotation animation
      const diff = ud.targetAngle - ud.currentAngle;
      if (Math.abs(diff) > 0.005) {
        ud.currentAngle += diff * Math.min(ud.speed * delta, 0.2);
        door.rotation.y = ud.currentAngle;
      }
    } else if (ud.type === 'shutter') {
      // Roller shutter — vertical slide animation
      const diff = ud.targetY - ud.currentY;
      if (Math.abs(diff) > 0.01) {
        // Smooth acceleration/deceleration
        const step = diff * Math.min(ud.speed * delta, 0.12);
        ud.currentY += step;
        ud.slatsGroup.position.y = ud.currentY;
      }
    }
  }
}

export function toggleNearestDoor(cameraPos) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const door of doors) {
    const d = cameraPos.distanceTo(door.userData.proximityCenter);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = door;
    }
  }

  const range = nearest?.userData.proximityRadius || 5;
  if (nearest && nearestDist < range) {
    const ud = nearest.userData;
    ud.isOpen = !ud.isOpen;
    if (ud.type === 'swing') {
      ud.targetAngle = ud.isOpen ? ud.openAngle : ud.closeAngle;
    } else if (ud.type === 'shutter') {
      ud.targetY = ud.isOpen ? ud.openY : ud.closeY;
      // Enable/disable collider
      if (ud.collider) ud.collider.active = !ud.isOpen;
    }
    return true;
  }
  return false;
}

export function getNearestDoorInfo(cameraPos) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const door of doors) {
    const d = cameraPos.distanceTo(door.userData.proximityCenter);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = door;
    }
  }

  const range = nearest?.userData.proximityRadius || 5;
  if (nearest && nearestDist < range) {
    return {
      label: nearest.userData.label,
      isOpen: nearest.userData.isOpen,
    };
  }
  return null;
}
