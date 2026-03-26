import * as THREE from 'three';
import { M } from './materials.js';
import { addDynamicCollider } from './building.js';

// ============================================================
// PLOT CONSTANTS
// ============================================================
const PLOT_W = -5;
const PLOT_E = 85;
const PLOT_N = 35;
const PLOT_S = -70;
const PLOT_WIDTH = 90;
const PLOT_DEPTH = 105;

const WEST_ROAD_WIDTH = 60;
const SOUTH_ROAD_WIDTH = 200;

const MAIN_GATE_Z = PLOT_S + 30;

export function createEnvironment(scene, mobile = false) {
  // ============================================================
  // SKY — gradient hemisphere (fewer segments on mobile)
  // ============================================================
  const skySeg = mobile ? 12 : 32;
  const skyGeo = new THREE.SphereGeometry(mobile ? 250 : 500, skySeg, skySeg);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x4488CC) },
      bottomColor: { value: new THREE.Color(0xB8D4E8) },
      offset: { value: 10 },
      exponent: { value: 0.5 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // ============================================================
  // GROUND
  // ============================================================
  const groundSize = mobile ? 300 : 600;
  const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
  const ground = new THREE.Mesh(groundGeo, M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  ground.receiveShadow = !mobile;
  scene.add(ground);

  // ============================================================
  // PLOT LAND
  // ============================================================
  const plotMat = new THREE.MeshStandardMaterial({ color: 0x5E8A3A, roughness: 0.85 });
  const plotGeo = new THREE.PlaneGeometry(PLOT_WIDTH, PLOT_DEPTH);
  const plotSurface = new THREE.Mesh(plotGeo, plotMat);
  plotSurface.rotation.x = -Math.PI / 2;
  plotSurface.position.set((PLOT_W + PLOT_E) / 2, -0.14, (PLOT_S + PLOT_N) / 2);
  plotSurface.receiveShadow = !mobile;
  scene.add(plotSurface);

  // ============================================================
  // ROADS
  // ============================================================
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.92 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });

  // West road
  const westRoadGeo = new THREE.PlaneGeometry(WEST_ROAD_WIDTH, PLOT_DEPTH + 80);
  const westRoad = new THREE.Mesh(westRoadGeo, roadMat);
  westRoad.rotation.x = -Math.PI / 2;
  westRoad.position.set(PLOT_W - WEST_ROAD_WIDTH / 2, -0.13, (PLOT_S + PLOT_N) / 2);
  scene.add(westRoad);

  // Road center dashes — skip on mobile
  if (!mobile) {
    const roadMarkMat = new THREE.MeshStandardMaterial({ color: 0xCCCC44, roughness: 0.5 });
    for (let z = PLOT_S - 30; z < PLOT_N + 40; z += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 6), roadMarkMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(PLOT_W - WEST_ROAD_WIDTH / 2, -0.11, z);
      scene.add(dash);
    }
    for (let x = PLOT_W - WEST_ROAD_WIDTH - 20; x < PLOT_E + 40; x += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.6), roadMarkMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, -0.11, PLOT_S - SOUTH_ROAD_WIDTH / 2);
      scene.add(dash);
    }
  }

  // West curb
  const westCurb = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, PLOT_DEPTH + 20), curbMat
  );
  westCurb.position.set(PLOT_W - 0.4, 0.1, (PLOT_S + PLOT_N) / 2);
  scene.add(westCurb);

  // South road
  const southRoadGeo = new THREE.PlaneGeometry(PLOT_WIDTH + WEST_ROAD_WIDTH + 80, SOUTH_ROAD_WIDTH);
  const southRoad = new THREE.Mesh(southRoadGeo, roadMat);
  southRoad.rotation.x = -Math.PI / 2;
  southRoad.position.set((PLOT_W + PLOT_E) / 2 - 20, -0.13, PLOT_S - SOUTH_ROAD_WIDTH / 2);
  scene.add(southRoad);

  // South curb
  const southCurb = new THREE.Mesh(
    new THREE.BoxGeometry(PLOT_WIDTH + 2, 0.5, 0.8), curbMat
  );
  southCurb.position.set((PLOT_W + PLOT_E) / 2, 0.1, PLOT_S + 0.4);
  scene.add(southCurb);

  // Intersection
  const intersectionGeo = new THREE.PlaneGeometry(WEST_ROAD_WIDTH, SOUTH_ROAD_WIDTH);
  const intersection = new THREE.Mesh(intersectionGeo, roadMat);
  intersection.rotation.x = -Math.PI / 2;
  intersection.position.set(PLOT_W - WEST_ROAD_WIDTH / 2, -0.125, PLOT_S - SOUTH_ROAD_WIDTH / 2);
  scene.add(intersection);

  // ============================================================
  // PLOT BOUNDARY WALLS
  // ============================================================
  const boundaryMat = new THREE.MeshStandardMaterial({ color: 0x7A7060, roughness: 0.8 });
  const boundaryH = 8;

  const northWallLen = PLOT_E - 9;
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(northWallLen, boundaryH, 0.6), boundaryMat);
  northWall.position.set(9 + northWallLen / 2, boundaryH / 2, PLOT_N + 0.3);
  if (!mobile) northWall.castShadow = true;
  scene.add(northWall);
  addDynamicCollider(9, PLOT_E, PLOT_N, PLOT_N + 1);

  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, boundaryH, PLOT_DEPTH), boundaryMat);
  eastWall.position.set(PLOT_E + 0.3, boundaryH / 2, (PLOT_S + PLOT_N) / 2);
  if (!mobile) eastWall.castShadow = true;
  scene.add(eastWall);
  addDynamicCollider(PLOT_E, PLOT_E + 1, PLOT_S, PLOT_N);

  const southLen = PLOT_E - PLOT_W;
  const sw = new THREE.Mesh(new THREE.BoxGeometry(southLen, boundaryH, 0.5), boundaryMat);
  sw.position.set(PLOT_W + southLen / 2, boundaryH / 2, PLOT_S - 0.25);
  if (!mobile) sw.castShadow = true;
  scene.add(sw);
  addDynamicCollider(PLOT_W, PLOT_E, PLOT_S - 1, PLOT_S);

  // Pillars — fewer on mobile
  const pillarSpacing = mobile ? 30 : 15;
  for (let ppx = PLOT_W; ppx <= PLOT_E; ppx += pillarSpacing) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1, boundaryH, 1), boundaryMat);
    pillar.position.set(ppx, boundaryH / 2, PLOT_S - 0.25);
    scene.add(pillar);
  }

  // ============================================================
  // MAIN GATE
  // ============================================================
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x5A4A2A, roughness: 0.5, metalness: 0.2 });
  const gateWidth = 10;
  const gpH = 6;

  const gp1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, gpH, 1.2), gateMat);
  gp1.position.set(PLOT_W - 0.6, gpH / 2, MAIN_GATE_Z - gateWidth / 2);
  scene.add(gp1);

  const gp2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, gpH, 1.2), gateMat);
  gp2.position.set(PLOT_W - 0.6, gpH / 2, MAIN_GATE_Z + gateWidth / 2);
  scene.add(gp2);

  const arch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, gateWidth + 1.2), gateMat);
  arch.position.set(PLOT_W - 0.6, gpH + 0.5, MAIN_GATE_Z);
  scene.add(arch);

  const signMat = new THREE.MeshStandardMaterial({ color: 0x2D5A1E, roughness: 0.4 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 8), signMat);
  sign.position.set(PLOT_W - 1.4, gpH - 0.5, MAIN_GATE_Z);
  scene.add(sign);

  // West boundary walls
  const gateSouthZ = MAIN_GATE_Z - gateWidth / 2;
  const wWallSouthLen = gateSouthZ - PLOT_S;
  const wWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, boundaryH, wWallSouthLen), boundaryMat);
  wWallSouth.position.set(PLOT_W - 0.25, boundaryH / 2, (PLOT_S + gateSouthZ) / 2);
  scene.add(wWallSouth);
  addDynamicCollider(PLOT_W - 1, PLOT_W, PLOT_S, gateSouthZ);

  const gateNorthZ = MAIN_GATE_Z + gateWidth / 2;
  const shutterSouthZ = 18.5;
  const wWallNorthLen = shutterSouthZ - gateNorthZ;
  const wWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.5, boundaryH, wWallNorthLen), boundaryMat);
  wWallNorth.position.set(PLOT_W - 0.25, boundaryH / 2, (gateNorthZ + shutterSouthZ) / 2);
  scene.add(wWallNorth);
  addDynamicCollider(PLOT_W - 1, PLOT_W, gateNorthZ, shutterSouthZ);

  // ============================================================
  // ACROSS-THE-ROAD BUILDINGS — skip on mobile (barely visible)
  // ============================================================
  if (!mobile) {
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x9A8A7A, roughness: 0.8 });
    const bldgMat2 = new THREE.MeshStandardMaterial({ color: 0xA09080, roughness: 0.8 });

    for (let i = 0; i < 5; i++) {
      const h = 12 + Math.random() * 15;
      const d = 15 + Math.random() * 20;
      const w = 15 + Math.random() * 15;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        Math.random() > 0.5 ? bldgMat : bldgMat2
      );
      bldg.position.set(PLOT_W - WEST_ROAD_WIDTH - w / 2 - 2, h / 2, PLOT_S + 20 + i * 22);
      bldg.castShadow = true;
      scene.add(bldg);
    }

    for (let i = 0; i < 4; i++) {
      const h = 10 + Math.random() * 12;
      const d = 15 + Math.random() * 15;
      const w = 18 + Math.random() * 20;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        Math.random() > 0.5 ? bldgMat : bldgMat2
      );
      bldg.position.set(PLOT_W + 15 + i * 25, h / 2, PLOT_S - SOUTH_ROAD_WIDTH - d / 2 - 2);
      bldg.castShadow = true;
      scene.add(bldg);
    }
  }

  // ============================================================
  // LIGHTING
  // ============================================================
  const ambient = new THREE.AmbientLight(0x808590, mobile ? 1.4 : 1.0);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x9AB0D0, 0x6A6A58, mobile ? 1.2 : 0.8);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xFFF5E0, 1.8);
  sun.position.set(25, 30, 10);
  if (!mobile) {
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias = -0.001;
  }
  scene.add(sun);

  // ============================================================
  // C-CHANNEL LIGHTING SYSTEM
  // ============================================================
  createCChannelLighting(scene, mobile);
}

function createCChannelLighting(scene, mobile) {
  const roofH = 10.5;

  // ============================================================
  // MATERIALS
  // ============================================================
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x5A5A58, roughness: 0.35, metalness: 0.8 });
  const trayPerfMat = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.4, metalness: 0.75 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.3, metalness: 0.85 });
  const battenMat = new THREE.MeshStandardMaterial({ color: 0xD0D0D0, roughness: 0.3, metalness: 0.15 });
  const ledWarm = new THREE.MeshStandardMaterial({
    color: 0xFFF0D8, roughness: 0.05, metalness: 0,
    emissive: 0xFFE0AA, emissiveIntensity: mobile ? 3.0 : 2.0, // brighter emissive on mobile to compensate for no point lights
    transparent: !mobile, opacity: 0.9 // skip transparency on mobile
  });
  const ledCool = new THREE.MeshStandardMaterial({
    color: 0xF0F4FF, roughness: 0.05, metalness: 0,
    emissive: 0xDDE8FF, emissiveIntensity: mobile ? 2.0 : 1.0,
    transparent: !mobile, opacity: 0.9
  });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.2 });

  // Shared slot line material (reuse instead of creating per slot)
  const slotLineMat = new THREE.MeshStandardMaterial({ color: 0x2A2A28, roughness: 0.5, metalness: 0.6 });

  // ============================================================
  // CABLE TRAY — simplified on mobile
  // ============================================================
  function addCableTray(x, z1, z2, dropFromRoof) {
    const len = z2 - z1;
    const cz = (z1 + z2) / 2;
    const trayW = 0.5;
    const trayH = 0.25;
    const trayT = 0.03;
    const trayY = roofH - dropFromRoof;

    // Bottom plate
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(trayW, trayT, len), trayPerfMat);
    bottom.position.set(x, trayY, cz);
    scene.add(bottom);

    // Perforation detail — desktop only (~250 meshes saved)
    if (!mobile) {
      for (let z = z1 + 0.3; z < z2 - 0.3; z += 0.8) {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(trayW * 0.5, trayT + 0.01, 0.25), trayPerfMat);
        slot.position.set(x, trayY, z);
        const slotLine = new THREE.Mesh(new THREE.BoxGeometry(trayW * 0.35, 0.005, 0.15), slotLineMat);
        slotLine.position.set(x, trayY - trayT / 2 - 0.002, z);
        scene.add(slotLine);
      }
    }

    // Side walls
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(trayT, trayH, len), trayMat);
    sideL.position.set(x - trayW / 2 + trayT / 2, trayY + trayH / 2, cz);
    scene.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(trayT, trayH, len), trayMat);
    sideR.position.set(x + trayW / 2 - trayT / 2, trayY + trayH / 2, cz);
    scene.add(sideR);

    // Lips — desktop only
    if (!mobile) {
      const lipL = new THREE.Mesh(new THREE.BoxGeometry(0.06, trayT, len), trayMat);
      lipL.position.set(x - trayW / 2 + trayT + 0.03, trayY + trayH, cz);
      scene.add(lipL);

      const lipR = new THREE.Mesh(new THREE.BoxGeometry(0.06, trayT, len), trayMat);
      lipR.position.set(x + trayW / 2 - trayT - 0.03, trayY + trayH, cz);
      scene.add(lipR);
    }

    // Threaded rod hangers — fewer on mobile
    const rodSpacing = mobile ? 8 : 4;
    for (let z = z1 + 1; z < z2; z += rodSpacing) {
      const rodH = dropFromRoof - trayH;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, rodH, mobile ? 4 : 6), rodMat);
      rod.position.set(x, roofH - rodH / 2, z);
      scene.add(rod);

      // Brackets — desktop only
      if (!mobile) {
        const bracketTop = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.15), rodMat);
        bracketTop.position.set(x, roofH - 0.02, z);
        scene.add(bracketTop);

        const bracketBot = new THREE.Mesh(new THREE.BoxGeometry(trayW + 0.1, 0.04, 0.12), rodMat);
        bracketBot.position.set(x, trayY + trayH + 0.02, z);
        scene.add(bracketBot);
      }
    }

    // Cables — desktop only
    if (!mobile) {
      const cableY = trayY + 0.04;
      const cable1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 6), cableMat);
      cable1.rotation.x = Math.PI / 2;
      cable1.position.set(x - 0.1, cableY, cz);
      scene.add(cable1);

      const cable2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 6), cableMat);
      cable2.rotation.x = Math.PI / 2;
      cable2.position.set(x + 0.1, cableY, cz);
      scene.add(cable2);
    }

    return { x, trayY, trayW };
  }

  // ============================================================
  // LED BATTEN — no dynamic lights on mobile (saves 44 lights!)
  // ============================================================
  function addLEDBatten(x, z, battenLen, warmth, intensity, radius, trayY) {
    const fixtureY = trayY - 0.02;

    // Housing
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, battenLen), battenMat);
    housing.position.set(x, fixtureY - 0.03, z);
    scene.add(housing);

    // LED diffuser (emissive — visible glow on both desktop and mobile)
    const diffuserMat = warmth === 'warm' ? ledWarm : ledCool;
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.015, battenLen - 0.06), diffuserMat
    );
    diffuser.position.set(x, fixtureY - 0.065, z);
    scene.add(diffuser);

    // End caps + clips — desktop only
    if (!mobile) {
      const cap1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), battenMat);
      cap1.position.set(x, fixtureY - 0.03, z - battenLen / 2);
      scene.add(cap1);

      const cap2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), battenMat);
      cap2.position.set(x, fixtureY - 0.03, z + battenLen / 2);
      scene.add(cap2);

      for (const dz of [-battenLen / 3, battenLen / 3]) {
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.06), rodMat);
        clip.position.set(x, fixtureY, z + dz);
        scene.add(clip);
      }
    }

    // Dynamic lights — desktop only (22 PointLights + 22 SpotLights eliminated on mobile)
    if (!mobile) {
      const color = warmth === 'warm' ? 0xFFE0B0 : 0xE8EEFF;
      const light = new THREE.PointLight(color, intensity, radius);
      light.position.set(x, fixtureY - 0.15, z);
      scene.add(light);

      const spot = new THREE.SpotLight(color, intensity * 0.8, radius * 0.9, Math.PI / 3.5, 0.6, 1.2);
      spot.position.set(x, fixtureY - 0.1, z);
      spot.target.position.set(x, 0, z);
      scene.add(spot);
      scene.add(spot.target);
    }
  }

  // ============================================================
  // LAYOUT
  // ============================================================

  // Room (Z=2 to Z=11) — 2 tray runs
  const rt1 = addCableTray(2, 2, 11, 0.6);
  const rt2 = addCableTray(6, 2, 11, 0.6);
  addLEDBatten(2, 4.5, 4, 'warm', 2.0, 16, rt1.trayY);
  addLEDBatten(2, 8.5, 3, 'warm', 1.8, 14, rt1.trayY);
  addLEDBatten(6, 4.5, 4, 'warm', 1.8, 14, rt2.trayY);
  addLEDBatten(6, 8.5, 3, 'warm', 1.8, 14, rt2.trayY);

  // Toilet (Z=11.75 to Z=17.75) — 2 tray runs
  const tt1 = addCableTray(2, 11.75, 17.75, 0.6);
  const tt2 = addCableTray(6, 11.75, 17.75, 0.6);
  addLEDBatten(2, 14.75, 3, 'warm', 2.0, 14, tt1.trayY);
  addLEDBatten(6, 14.75, 3, 'warm', 1.8, 14, tt2.trayY);

  // Pathway (X=-3) — 1 tray run
  const pt = addCableTray(-3, 1.25, 18.5, 0.5);
  addLEDBatten(-3, 4, 2, 'warm', 0.35, 8, pt.trayY);
  addLEDBatten(-3, 9, 2, 'warm', 0.35, 8, pt.trayY);
  addLEDBatten(-3, 14, 2, 'warm', 0.35, 8, pt.trayY);

  // Parking (Z=18.5 to Z=35) — 3 tray runs
  const pk1 = addCableTray(-3, 18.5, 35, 1.0);
  const pk2 = addCableTray(1.5, 18.5, 35, 1.0);
  const pk3 = addCableTray(6, 18.5, 35, 1.0);
  for (const tray of [pk1, pk2, pk3]) {
    for (let z = 21; z <= 33; z += 6) {
      addLEDBatten(tray.x, z, 4, 'cool', 0.4, 12, tray.trayY);
    }
  }

  // Cantilever (Z=-3.75 to Z=1.25)
  const ct = addCableTray(3.5, -3.75, 1.25, 0.5);
  addLEDBatten(3.5, -1.25, 3, 'warm', 0.35, 8, ct.trayY);

  // East overhang
  const et = addCableTray(9, 0, 15, 0.4);
  addLEDBatten(9, 4, 2, 'warm', 0.2, 6, et.trayY);
  addLEDBatten(9, 9, 2, 'warm', 0.2, 6, et.trayY);
  addLEDBatten(9, 14, 2, 'warm', 0.2, 6, et.trayY);
}
