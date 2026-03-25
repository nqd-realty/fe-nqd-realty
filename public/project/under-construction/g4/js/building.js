import * as THREE from 'three';
import { M } from './materials.js';

const W = 0.75; // 9-inch wall thickness in feet

// Layout (Z axis, South to North) — interior dimensions exact:
//   Z=-3.75 to Z=1.25 : South cantilever (5ft south of south wall)
//   Z=1.25 to Z=2     : South wall (0.75ft)
//   Z=2    to Z=11    : Caretaker Room interior (9ft × 9ft)
//   Z=11   to Z=11.75 : Dividing wall (0.75ft)
//   Z=11.75 to Z=17.75: Common Toilet interior (9ft × 6ft)
//   Z=17.75 to Z=18.5 : Toilet north wall (0.75ft)
//   Z=18.5 to Z=35    : Car Parking (16.5ft)
//   Z=35              : North boundary
// E-W: West wall X=-1.75..-1, Interior X=-1..8, East wall X=8..8.75
// Pathway: X=-5..-1.75 (4ft clear)

function box(scene, sx, sy, sz, px, py, pz, mat) {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px, py, pz);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

function cyl(scene, r, h, px, py, pz, mat, seg = 16, axis = 'Y') {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px, py, pz);
  if (axis === 'X') m.rotation.z = Math.PI / 2;
  if (axis === 'Z') m.rotation.x = Math.PI / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

// Collider registry
export const colliders = [];

function addCollider(minX, maxX, minZ, maxZ, minY = 0, maxY = 10) {
  const c = { minX, maxX, minZ, maxZ, minY, maxY, active: true };
  colliders.push(c);
  return c;
}

export function addDynamicCollider(minX, maxX, minZ, maxZ) {
  return addCollider(minX, maxX, minZ, maxZ);
}

// Waves glass block wall
function createGlassBlockWall(scene, x, startY, startZ, zSpan, ySpan, blockSize) {
  const gap = 0.05;
  const step = blockSize + gap;
  const depth = 0.3;
  const cols = Math.floor(zSpan / step);
  const rows = Math.floor(ySpan / step);

  const mortarMat = new THREE.MeshStandardMaterial({ color: 0xB0AAA0, roughness: 0.9, metalness: 0 });
  const mortarPlane = new THREE.Mesh(new THREE.BoxGeometry(0.02, rows * step, cols * step), mortarMat);
  mortarPlane.position.set(x - depth / 2 - 0.01, startY + (rows * step) / 2, startZ + (cols * step) / 2);
  scene.add(mortarPlane);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const bz = startZ + col * step + blockSize / 2;
      const by = startY + row * step + blockSize / 2;
      const hueShift = Math.sin(row * 1.2 + col * 0.8) * 15;
      const waveAlpha = 0.28 + Math.sin(row * 0.9 + col * 1.3) * 0.08;

      const blockMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.52 + hueShift / 360, 0.12, 0.72 + hueShift / 500),
        roughness: 0.15 + Math.random() * 0.1, metalness: 0.05,
        transparent: true, opacity: waveAlpha, side: THREE.DoubleSide
      });
      const block = new THREE.Mesh(new THREE.BoxGeometry(depth, blockSize - 0.02, blockSize - 0.02), blockMat);
      block.position.set(x, by, bz);
      block.castShadow = false; block.receiveShadow = true;
      scene.add(block);

      const ridgeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.53, 0.08, 0.8),
        roughness: 0.08, metalness: 0.05, transparent: true, opacity: 0.18
      });
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(depth * 0.3, blockSize * 0.6, 0.04), ridgeMat);
      ridge.position.set(x + depth * 0.15, by, bz);
      ridge.rotation.x = 0.3 + Math.sin(row + col) * 0.15;
      scene.add(ridge);

      const ridge2 = new THREE.Mesh(new THREE.BoxGeometry(depth * 0.3, 0.04, blockSize * 0.6), ridgeMat);
      ridge2.position.set(x + depth * 0.15, by, bz);
      ridge2.rotation.z = 0.25 + Math.cos(row + col) * 0.1;
      scene.add(ridge2);
    }
  }
}

export function createBuilding(scene) {
  // ============================================================
  // FLOORS
  // ============================================================
  box(scene, 4, 0.15, 16.5, -3, -0.075, 10, M.pathFl);          // Pathway (4ft, X=-5..-1)
  box(scene, 9, 0.15, 6, 3.5, -0.075, 14.75, M.floor);           // Toilet
  box(scene, 9, 0.15, 9, 3.5, -0.075, 6.5, M.floorRoom);         // Room
  box(scene, 13.75, 0.15, 16.5, 1.875, -0.075, 26.75, M.parkFl); // Parking
  box(scene, 9, 0.1, 5, 3.5, -0.05, -1.25, M.pathFl);            // Cantilever

  // ============================================================
  // WALLS (9-inch / 0.75ft thick)
  // ============================================================

  // North boundary (Z=35)
  box(scene, 13.75, 10, W, 1.875, 5, 35 + W / 2, M.boundary);
  addCollider(-5, 8.75, 35, 35 + W);

  // Toilet N wall (inner Z=17.75, wall Z=17.75..18.5)
  box(scene, 10.5, 10, W, 3.5, 5, 17.75 + W / 2, M.wall);
  addCollider(-1.75, 8.75, 17.75, 18.5);

  // East wall (X=8..8.75)
  // South portion (Z=2..8) — sill + glass blocks
  box(scene, W, 2.5, 6, 8 + W / 2, 1.25, 5, M.wall);
  box(scene, W, 0.3, 6, 8 + W / 2, 8.15, 5, M.frame);
  box(scene, W, 0.15, 6, 8 + W / 2, 2.55, 5, M.frame);
  box(scene, W, 5.5, 0.15, 8 + W / 2, 5.25, 2, M.frame);
  box(scene, W, 5.5, 0.15, 8 + W / 2, 5.25, 8, M.frame);
  createGlassBlockWall(scene, 8 + W / 2, 2.65, 2.075, 5.85, 5.4, 0.67);
  addCollider(8, 8 + W, 2, 8);
  // Above room door (Z=8..11, above 7ft)
  box(scene, W, 3, 3, 8 + W / 2, 8.5, 9.5, M.wall);
  // Toilet portion (Z=11.75..17.75)
  box(scene, W, 10, 6, 8 + W / 2, 5, 14.75, M.wall);
  addCollider(8, 8 + W, 11.75, 17.75);

  // Dividing wall (Z=11..11.75)
  box(scene, 10.5, 10, W, 3.5, 5, 11 + W / 2, M.wall);
  addCollider(-1.75, 8.75, 11, 11.75);

  // South wall (Z=1.25..2)
  box(scene, 10.5, 10, W, 3.5, 5, 2 - W / 2, M.wall);
  addCollider(-1.75, 8.75, 1.25, 2);

  // Toilet W wall — N portion (Z=14.75..17.75)
  box(scene, W, 10, 3, -1 - W / 2, 5, 16.25, M.wall);
  addCollider(-1.75, -1, 14.75, 17.75);

  // Toilet W wall — above door (Z=12.25..14.75)
  box(scene, W, 3, 2.5, -1 - W / 2, 8.5, 13.5, M.wall);

  // Toilet W wall — S sliver (Z=11.75..12.25)
  box(scene, W, 10, 0.5, -1 - W / 2, 5, 12, M.wall);
  addCollider(-1.75, -1, 11.75, 12.25);

  // Room W wall (full, Z=1.25..11)
  box(scene, W, 10, 9.75, -1 - W / 2, 5, 6.125, M.wall);
  addCollider(-1.75, -1, 1.25, 11);

  // ============================================================
  // COMMON ROOF — deck sheets
  // ============================================================
  createDeckSheetRoof(scene);
}

function createDeckSheetRoof(scene) {
  const roofH = 10.5;

  const roofX1 = -5.5;
  const roofX2 = 8.5;         // shifted -1
  const roofZ1 = -4.25;
  const roofZ2 = 35.5;
  const roofW = roofX2 - roofX1;  // 14ft
  const roofD = roofZ2 - roofZ1;
  const centerX = (roofX1 + roofX2) / 2;
  const centerZ = (roofZ1 + roofZ2) / 2;

  const cantEastX1 = 8.5;
  const cantEastX2 = 9.5;     // 1ft cantilever
  const cantEastZ1 = -4.25;
  const cantEastZ2 = 17.75;
  const cantEastW = cantEastX2 - cantEastX1;
  const cantEastD = cantEastZ2 - cantEastZ1;
  const cantEastCX = (cantEastX1 + cantEastX2) / 2;
  const cantEastCZ = (cantEastZ1 + cantEastZ2) / 2;

  box(scene, roofW, 0.08, roofD, centerX, roofH, centerZ, M.deckSheet);
  box(scene, cantEastW, 0.08, cantEastD, cantEastCX, roofH, cantEastCZ, M.deckSheet);

  const ridgeSpacing = 1.0;
  for (let x = roofX1 + 0.5; x < roofX2; x += ridgeSpacing) {
    box(scene, 0.15, 0.12, roofD, x, roofH + 0.06, centerZ, M.deckSheet);
  }
  box(scene, 0.15, 0.12, cantEastD, 9, roofH + 0.06, cantEastCZ, M.deckSheet);

  const beamH = 0.5;
  const beamW = 0.3;

  box(scene, roofW, beamH, beamW, centerX, roofH - beamH / 2 - 0.1, 35, M.purlin);
  box(scene, roofW + cantEastW, beamH, beamW, (roofX1 + cantEastX2) / 2, roofH - beamH / 2 - 0.1, 18.5, M.purlin);
  box(scene, roofW + cantEastW, beamH, beamW, (roofX1 + cantEastX2) / 2, roofH - beamH / 2 - 0.1, 11.375, M.purlin);
  box(scene, roofW + cantEastW, beamH, beamW, (roofX1 + cantEastX2) / 2, roofH - beamH / 2 - 0.1, 1.625, M.purlin);
  box(scene, roofW + cantEastW, beamH, beamW, (roofX1 + cantEastX2) / 2, roofH - beamH / 2 - 0.1, -3.75, M.purlin);

  const purlinW = 0.15;
  const purlinH = 0.25;
  const purlinY = roofH - purlinH / 2 - 0.1 - beamH;

  const purlinXPositions = [-4, -2, 0.5, 3.5, 6.5];
  for (const ppx of purlinXPositions) {
    box(scene, purlinW, purlinH, roofD, ppx, purlinY, centerZ, M.purlin);
  }
  box(scene, purlinW, purlinH, cantEastD, 9, purlinY, cantEastCZ, M.purlin);

  const fasciaH = 0.6;
  const fasciaT = 0.08;
  box(scene, fasciaT, fasciaH, roofD, roofX1, roofH - fasciaH / 2 + 0.04, centerZ, M.purlin);
  box(scene, fasciaT, fasciaH, 17.5, roofX2, roofH - fasciaH / 2 + 0.04, (18.5 + 35.5) / 2, M.purlin);
  box(scene, fasciaT, fasciaH, cantEastD, cantEastX2, roofH - fasciaH / 2 + 0.04, cantEastCZ, M.purlin);
  box(scene, roofW + cantEastW, fasciaH, fasciaT, (roofX1 + cantEastX2) / 2, roofH - fasciaH / 2 + 0.04, roofZ1, M.purlin);
  box(scene, roofW, fasciaH, fasciaT, centerX, roofH - fasciaH / 2 + 0.04, roofZ2, M.purlin);
  box(scene, cantEastW, fasciaH, fasciaT, cantEastCX, roofH - fasciaH / 2 + 0.04, cantEastZ2, M.purlin);
}

export function createFixtures(scene) {
  // ============================================================
  // TOILET FIXTURES (Z=11.75 to Z=17.75, X=-1 to X=8)
  // ============================================================

  // WC — West wall, North portion
  box(scene, 0.8, 1.2, 1.3, -0.5, 0.9, 16.25, M.wc);
  box(scene, 1.3, 0.9, 1.3, 0.35, 0.45, 16.25, M.wc);
  cyl(scene, 0.45, 0.06, 0.4, 0.95, 16.25, M.wc);
  cyl(scene, 0.03, 0.5, 1.1, 1.2, 16.95, M.chrome);
  addCollider(-1, 1.2, 15.55, 16.95, 0, 2);

  // Glass partition at Z=14.75
  box(scene, 3.5, 8, 0.05, 0.75, 4, 14.75, M.glass);
  box(scene, 3.5, 0.08, 0.12, 0.75, 0.04, 14.75, M.metal);
  box(scene, 3.5, 0.08, 0.12, 0.75, 8, 14.75, M.metal);

  // Urinal — South wall
  box(scene, 1.2, 1.8, 0.6, 3.2, 1.5, 12.1, M.urinal);
  box(scene, 0.8, 1.2, 0.15, 3.2, 1.4, 12.3, M.basin);
  cyl(scene, 0.04, 0.3, 3.2, 2.6, 11.95, M.chrome);
  addCollider(2.5, 4, 11.75, 12.45, 0, 3);

  // Handwash — NE corner
  box(scene, 1.2, 0.12, 2.5, 7.4, 2.6, 16.5, M.counter);
  box(scene, 0.1, 2.5, 2.5, 7.95, 1.25, 16.5, M.counter);
  cyl(scene, 0.45, 0.3, 7.4, 2.55, 16.5, M.basin);
  cyl(scene, 0.03, 0.6, 7.85, 2.95, 16.5, M.chrome);
  box(scene, 0.08, 2.2, 1.8, 7.96, 4.5, 16.5, M.mirror);
  addCollider(6.7, 8, 15.25, 17.75, 0, 3);

  // Shower — SE corner
  box(scene, 3.0, 0.1, 2.4, 6.5, 0.05, 12.95, M.shower);
  cyl(scene, 0.35, 0.05, 6.5, 8, 12.95, M.chrome);
  cyl(scene, 0.025, 1.2, 7.4, 7.4, 12.95, M.chrome, 8, 'Y');
  box(scene, 0.05, 8, 2.4, 5, 4, 12.95, M.glass);
  box(scene, 0.1, 2.4, 0.08, 5, 0.04, 12.95, M.metal);
  box(scene, 0.1, 2.4, 0.08, 5, 8, 12.95, M.metal);
  cyl(scene, 0.12, 0.02, 6.5, 0.11, 12.75, M.drain);
  addCollider(5, 8, 11.75, 14.25, 0, 1);

  // Geyser — E wall above handwash
  box(scene, 0.5, 1.2, 0.8, 7.7, 6.5, 16.5, M.geyser);
  cyl(scene, 0.025, 2.5, 7.55, 4.6, 16.3, M.pipeC);
  cyl(scene, 0.025, 2.5, 7.55, 4.6, 16.7, M.pipeH);

  // Toilet ventilation
  box(scene, 0.15, 0.8, 0.8, -1, 7.5, 16.75, M.exhaust);
  box(scene, 0.15, 1.2, 1.5, 8, 7.5, 15.25, M.exhaust);

  // ============================================================
  // WASH AREA — outside toilet north wall (Z=18.5 to Z=23.5)
  // ============================================================

  box(scene, 9, 0.15, 5, 3.5, 0.075, 21, M.floor);
  box(scene, 9, 0.15, 0.15, 3.5, 0.075, 23.5, M.frame);
  box(scene, 0.15, 0.15, 5, -1, 0.075, 21, M.frame);
  box(scene, 0.15, 0.15, 5, 8, 0.075, 21, M.frame);

  box(scene, 8.5, 0.08, 0.4, 3.5, 0.04, 23.2, M.drain);
  for (let x = -0.5; x < 8; x += 0.6) {
    box(scene, 0.08, 0.04, 0.4, x, 0.1, 23.2, M.metal);
  }
  cyl(scene, 0.1, 1.5, -1.5, -0.1, 23.2, M.drain, 8, 'X');

  for (let z = 19; z < 23; z += 1.5) {
    box(scene, 8, 0.005, 0.04, 3.5, 0.16, z, M.drain);
  }

  // Washing machine
  const wmMat = new THREE.MeshStandardMaterial({ color: 0xE8E8E8, roughness: 0.2, metalness: 0.15 });
  const wmDarkMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.3, metalness: 0.3 });
  box(scene, 2, 2.8, 2, 0.5, 1.4, 20, wmMat);

  cyl(scene, 0.7, 0.06, 0.5, 1.4, 18.97, M.glass, 20, 'Z');
  cyl(scene, 0.75, 0.04, 0.5, 1.4, 18.95, wmDarkMat, 20, 'Z');

  box(scene, 1.8, 0.4, 0.08, 0.5, 2.6, 18.98, wmDarkMat);
  cyl(scene, 0.12, 0.06, 0, 2.6, 18.94, M.chrome, 12, 'Z');
  box(scene, 0.5, 0.2, 0.02, 0.8, 2.6, 18.94, new THREE.MeshStandardMaterial({
    color: 0x113322, emissive: 0x22AA66, emissiveIntensity: 0.4, roughness: 0.1
  }));

  box(scene, 2, 0.06, 2, 0.5, 2.83, 20, wmMat);

  for (const dx of [-0.7, 0.7]) {
    for (const dz of [-0.7, 0.7]) {
      cyl(scene, 0.08, 0.1, 0.5 + dx, 0.05, 20 + dz, wmDarkMat, 8);
    }
  }

  cyl(scene, 0.03, 1.5, 0, 1.5, 18.8, M.pipeC, 8);
  cyl(scene, 0.03, 1.5, 1.0, 1.5, 18.8, M.pipeH, 8);
  cyl(scene, 0.04, 3.5, 0.5, 0.15, 21.6, M.drain, 8, 'Z');
  addCollider(-0.7, 1.7, 18.8, 21.2, 0, 3);

  // ============================================================
  // WASH BASIN — NW corner, pathway side of toilet west wall
  // ============================================================
  box(scene, 1.5, 0.1, 2, -2, 2.6, 16.75, M.counter);
  box(scene, 0.1, 2.5, 2, -1.28, 1.25, 16.75, M.counter);
  cyl(scene, 0.5, 0.25, -2, 2.5, 16.75, M.basin);

  box(scene, 0.06, 0.5, 0.06, -1.3, 3.2, 16.75, M.chrome);
  box(scene, 0.5, 0.06, 0.06, -1.55, 3.45, 16.75, M.chrome);
  cyl(scene, 0.03, 0.2, -1.8, 3.35, 16.75, M.chrome, 8);

  box(scene, 0.04, 2, 1.5, -1.24, 4.5, 16.75, M.mirror);
  box(scene, 0.05, 2.1, 0.08, -1.24, 4.5, 15.97, M.frame);
  box(scene, 0.05, 2.1, 0.08, -1.24, 4.5, 17.53, M.frame);
  box(scene, 0.05, 0.08, 1.56, -1.24, 5.55, 16.75, M.frame);
  box(scene, 0.05, 0.08, 1.56, -1.24, 3.45, 16.75, M.frame);

  cyl(scene, 0.04, 2.5, -2, 1.2, 16.75, M.drain);
  box(scene, 0.15, 0.4, 0.12, -1.28, 3.0, 15.95, M.chrome);
  addCollider(-2.8, -1.2, 15.75, 17.75, 0, 2.8);

  // ============================================================
  // CARETAKER ROOM FIXTURES (Z=2 to Z=11, X=-1 to X=8)
  // ============================================================

  // L-Counter — N arm
  box(scene, 6.3, 0.12, 1, 2.15, 2.56, 10.5, M.counterR);
  box(scene, 6.3, 2.5, 0.1, 2.15, 1.25, 10.95, M.counterR);
  addCollider(-1, 5.3, 10, 11, 0, 2.7);

  // L-Counter — W arm
  box(scene, 1.5, 0.12, 3.4, -0.25, 2.56, 9.3, M.counterR);
  box(scene, 0.1, 2.5, 3.4, -0.95, 1.25, 9.3, M.counterR);
  addCollider(-1, 0.5, 7.6, 11, 0, 2.7);

  // Kitchenette on W arm
  box(scene, 0.9, 0.08, 0.7, -0.25, 2.7, 10, M.induct);
  cyl(scene, 0.15, 0.02, -0.35, 2.75, 10, M.induct);
  box(scene, 0.9, 1.8, 0.8, -0.25, 0.9, 9.1, M.fridge);

  // Storage cupboard SW
  box(scene, 1.4, 9.5, 5.5, -0.25, 4.75, 4.75, M.storage);
  for (let i = 1; i < 5; i++) {
    box(scene, 1.3, 0.05, 5.4, -0.25, i * 2, 4.75, M.storage);
  }
  addCollider(-1, 0.5, 2, 7.5, 0, 10);

  // Bed (6x6 king)
  box(scene, 6, 0.8, 6, 3.7, 0.4, 5, M.bed);
  box(scene, 5.8, 0.4, 5.8, 3.7, 1, 5, M.bed);
  box(scene, 1.2, 0.3, 0.6, 2.2, 1.35, 2.4, M.pillow);
  box(scene, 1.2, 0.3, 0.6, 3.7, 1.35, 2.4, M.pillow);
  box(scene, 1.2, 0.3, 0.6, 5.2, 1.35, 2.4, M.pillow);
  addCollider(0.7, 6.7, 2, 8, 0, 1.5);

  // Louver window (E wall, Z=2..8)
  box(scene, 0.15, 9, 6, 8, 4.5, 5, M.louver);
  for (let i = 0; i < 20; i++) {
    box(scene, 0.12, 0.03, 5.8, 8.05, 0.5 + i * 0.45, 5, M.louver);
  }

  // Room high louvre (W wall @7ft)
  box(scene, 0.15, 1, 1, -1, 7.5, 10, M.exhaust);

  // Ceiling fan
  cyl(scene, 0.6, 0.08, 3.5, 9.5, 6.5, M.metal);

  // ============================================================
  // OUTDOOR COUNTER (SW cantilever)
  // ============================================================
  box(scene, 6, 0.12, 2, 2, 2.56, 0.8, M.outdoor);
  box(scene, 6, 2.5, 0.1, 2, 1.25, 1.95, M.outdoor);
  box(scene, 0.15, 2.4, 0.15, -0.8, 1.2, 0, M.metal);
  box(scene, 0.15, 2.4, 0.15, 4.8, 1.2, 0, M.metal);
  box(scene, 5.8, 0.08, 1.8, 2, 1.2, 0.8, M.outdoor);
  addCollider(-1, 5, -0.2, 2, 0, 2.7);

  // ============================================================
  // PARKING — MS columns
  // ============================================================
  const msMat = M.metal;
  const colH = 12;
  const colSec = 0.5;

  // Column 1 — NW corner (X=-5, Z=35)
  box(scene, colSec, colH, colSec, -5, colH / 2, 35, msMat);
  addCollider(-5.25, -4.75, 34.75, 35.25);

  // Column 2 — south jamb of shutter (X=-5, Z=18.5)
  box(scene, colSec, colH, colSec, -5, colH / 2, 18.5, msMat);
  addCollider(-5.25, -4.75, 18.25, 18.75);

  // Column 3 — NE corner of parking (X=8, Z=35)
  box(scene, colSec, colH, colSec, 8, colH / 2, 35, msMat);
  addCollider(7.75, 8.25, 34.75, 35.25);
}
