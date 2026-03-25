import * as THREE from 'three';

// ============================================================
// HELPER
// ============================================================
function box(sx, sy, sz, mat) {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  return new THREE.Mesh(g, mat);
}

function cyl(rTop, rBot, h, segs, mat) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs);
  return new THREE.Mesh(g, mat);
}

function applyShadowRecursive(obj, cast) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = true;
    }
  });
}

// ============================================================
// MATERIALS FACTORY
// ============================================================
function createMaterials(opts) {
  return {
    shirt: new THREE.MeshStandardMaterial({
      color: opts.shirtColor || '#2C3E50', roughness: 0.75, metalness: 0.0,
    }),
    pants: new THREE.MeshStandardMaterial({
      color: opts.pantsColor || '#3D3D3D', roughness: 0.7, metalness: 0.0,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: opts.skinTone || '#D4A574', roughness: 0.6, metalness: 0.0,
    }),
    hair: new THREE.MeshStandardMaterial({
      color: opts.hairColor || '#2A1F14', roughness: 0.85, metalness: 0.0,
    }),
    shoe: new THREE.MeshStandardMaterial({
      color: '#1A1A1A', roughness: 0.5, metalness: 0.1,
    }),
    clipboard: new THREE.MeshStandardMaterial({
      color: '#C8B896', roughness: 0.6, metalness: 0.0,
    }),
    clip: new THREE.MeshStandardMaterial({
      color: '#888888', roughness: 0.3, metalness: 0.7,
    }),
    helmet: new THREE.MeshStandardMaterial({
      color: '#F5F5F0', roughness: 0.4, metalness: 0.05,
    }),
    belt: new THREE.MeshStandardMaterial({
      color: '#222222', roughness: 0.5, metalness: 0.15,
    }),
  };
}

// ============================================================
// BODY PART BUILDERS
// ============================================================

function buildHead(mats, opts) {
  const group = new THREE.Group();

  const neck = cyl(0.12, 0.13, 0.35, 8, mats.skin);
  neck.position.y = -0.35;
  group.add(neck);

  const head = box(0.45, 0.55, 0.45, mats.skin);
  group.add(head);

  const hair = box(0.47, 0.12, 0.47, mats.hair);
  hair.position.y = 0.32;
  group.add(hair);

  const hairBack = box(0.47, 0.35, 0.08, mats.hair);
  hairBack.position.set(0, 0.1, -0.22);
  group.add(hairBack);

  const earL = box(0.06, 0.14, 0.08, mats.skin);
  earL.position.set(-0.25, -0.05, 0);
  group.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.25;
  group.add(earR);

  if (opts.hasHardHat) {
    const dome = cyl(0.05, 0.32, 0.25, 12, mats.helmet);
    dome.position.y = 0.38;
    group.add(dome);

    const brim = cyl(0.42, 0.42, 0.04, 16, mats.helmet);
    brim.position.y = 0.28;
    group.add(brim);
  }

  return group;
}

function buildTorso(mats) {
  const group = new THREE.Group();

  const torso = box(0.9, 1.5, 0.5, mats.shirt);
  torso.position.y = 0.75;
  group.add(torso);

  const collar = box(0.35, 0.08, 0.15, mats.skin);
  collar.position.set(0, 1.52, 0.18);
  group.add(collar);

  const hips = box(0.85, 0.4, 0.45, mats.pants);
  hips.position.y = -0.05;
  group.add(hips);

  const belt = box(0.88, 0.1, 0.47, mats.belt);
  belt.position.y = 0.15;
  group.add(belt);

  return group;
}

function buildArm(mats, side, opts) {
  const group = new THREE.Group();
  const isRight = side > 0;
  const hasClip = isRight && (opts.hasClipboard !== false);

  const upperArm = box(0.22, 0.7, 0.22, mats.shirt);
  upperArm.position.y = -0.35;
  group.add(upperArm);

  const forearmPivot = new THREE.Group();
  forearmPivot.position.y = -0.7;

  const forearm = box(0.2, 0.65, 0.2, mats.skin);
  forearm.position.y = -0.325;
  forearmPivot.add(forearm);

  const hand = box(0.16, 0.2, 0.14, mats.skin);
  hand.position.y = -0.72;
  forearmPivot.add(hand);

  if (hasClip) {
    const clipboard = box(0.4, 0.55, 0.04, mats.clipboard);
    clipboard.position.set(0, -0.72, 0.1);
    clipboard.rotation.x = 0.15;
    forearmPivot.add(clipboard);

    const clip = box(0.15, 0.06, 0.06, mats.clip);
    clip.position.set(0, -0.44, 0.12);
    forearmPivot.add(clip);

    const paper = box(0.35, 0.48, 0.01, new THREE.MeshStandardMaterial({
      color: '#F5F5F0', roughness: 0.9, metalness: 0.0,
    }));
    paper.position.set(0, -0.74, 0.13);
    paper.rotation.x = 0.15;
    forearmPivot.add(paper);
  }

  group.add(forearmPivot);

  // Default pose
  if (isRight && hasClip) {
    group.rotation.x = -0.4;
    forearmPivot.rotation.x = 0.9;
  } else if (isRight) {
    group.rotation.x = -0.05;
    forearmPivot.rotation.x = 0.15;
  } else {
    group.rotation.x = 0.05;
    group.rotation.z = 0.08;
    forearmPivot.rotation.x = 0.12;
  }

  return { group, forearmPivot };
}

function buildLeg(mats, side) {
  const group = new THREE.Group();

  const upperLeg = box(0.25, 1.2, 0.25, mats.pants);
  upperLeg.position.y = -0.6;
  group.add(upperLeg);

  const lowerLeg = box(0.22, 1.15, 0.22, mats.pants);
  lowerLeg.position.y = -1.8;
  group.add(lowerLeg);

  const shoe = box(0.26, 0.2, 0.4, mats.shoe);
  shoe.position.set(0, -2.45, 0.06);
  group.add(shoe);

  group.rotation.z = side * 0.02;

  return group;
}

// ============================================================
// Constants
// ============================================================
const EYE_HEIGHT = 4.95; // head group Y — camera sits here in first-person

// Reusable objects to avoid GC
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _prevPos = new THREE.Vector3();
let _prevPosInited = false;

// ============================================================
// AVATAR FACTORY
// ============================================================

/**
 * Creates a procedural 3D avatar.
 *
 * @param {Object} [options={}]
 * @param {{x:number, y:number, z:number}} [options.position={x:0,y:0,z:0}]
 * @param {number} [options.rotationY=0]
 * @param {number} [options.scale=1]
 * @param {boolean} [options.animate=true]
 * @param {boolean} [options.firstPerson=false] - Attach to camera; hides head, adds walk cycle
 * @param {boolean} [options.hasHardHat=false]
 * @param {boolean} [options.hasClipboard=true]
 * @param {string} [options.shirtColor='#2C3E50']
 * @param {string} [options.pantsColor='#3D3D3D']
 * @param {string} [options.skinTone='#D4A574']
 * @param {string} [options.hairColor='#2A1F14']
 * @param {boolean} [options.castShadow=true]
 * @returns {{ group: THREE.Group, update: (delta: number, camera?: THREE.Camera) => void, dispose: () => void }}
 */
export function createAvatar(options = {}) {
  const opts = Object.assign({
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    scale: 1,
    animate: true,
    firstPerson: false,
    hasHardHat: false,
    hasClipboard: true,
    shirtColor: '#2C3E50',
    pantsColor: '#3D3D3D',
    skinTone: '#D4A574',
    hairColor: '#2A1F14',
    castShadow: true,
  }, options);

  const mats = createMaterials(opts);
  const root = new THREE.Group();
  root.name = 'avatar';

  // --- Torso / Hips ---
  const torsoGroup = buildTorso(mats);
  torsoGroup.position.y = 2.5;
  root.add(torsoGroup);

  // --- Head ---
  const headGroup = buildHead(mats, opts);
  headGroup.position.y = EYE_HEIGHT;
  headGroup.rotation.x = -0.1;
  root.add(headGroup);

  // First-person: hide head from rendering (camera is the head)
  if (opts.firstPerson) {
    headGroup.visible = false;
  }

  // --- Arms ---
  const leftArmResult = buildArm(mats, -1, opts);
  leftArmResult.group.position.set(-0.56, 3.9, 0);
  root.add(leftArmResult.group);

  const rightArmResult = buildArm(mats, 1, opts);
  rightArmResult.group.position.set(0.56, 3.9, 0);
  root.add(rightArmResult.group);

  // Store default arm rotations for blending
  const leftArmDefaultX = leftArmResult.group.rotation.x;
  const rightArmDefaultX = rightArmResult.group.rotation.x;

  // --- Legs ---
  const leftLeg = buildLeg(mats, -1);
  leftLeg.position.set(-0.2, 2.5, 0);
  root.add(leftLeg);

  const rightLeg = buildLeg(mats, 1);
  rightLeg.position.set(0.2, 2.5, 0);
  root.add(rightLeg);

  // --- Apply initial position, rotation, scale ---
  const pos = opts.position;
  root.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
  root.rotation.y = opts.rotationY;
  if (opts.scale !== 1) root.scale.setScalar(opts.scale);

  // --- Shadows ---
  applyShadowRecursive(root, opts.castShadow);

  // --- Animation state ---
  let time = Math.random() * 100;
  const torsoMesh = torsoGroup.children[0];
  const baseTorsoY = torsoMesh.position.y;
  let isWalking = false;
  let walkPhase = 0;

  // Per-instance prev position (for first-person movement detection)
  const prevPos = new THREE.Vector3();
  let prevPosReady = false;

  /**
   * @param {number} delta - Frame delta in seconds
   * @param {THREE.Camera} [camera] - Required when firstPerson: true
   */
  function update(delta, camera) {
    if (!opts.animate && !opts.firstPerson) return;
    time += delta;

    // ---- First-person: sync with camera ----
    if (opts.firstPerson && camera) {
      // Position avatar so feet are on ground below camera
      root.position.x = camera.position.x;
      root.position.z = camera.position.z;
      root.position.y = camera.position.y - EYE_HEIGHT;

      // Body faces camera's horizontal direction
      _euler.setFromQuaternion(camera.quaternion);
      root.rotation.y = _euler.y;

      // Detect walking by comparing to previous frame
      if (!prevPosReady) {
        prevPos.copy(camera.position);
        prevPosReady = true;
      }
      const dx = camera.position.x - prevPos.x;
      const dz = camera.position.z - prevPos.z;
      const moveSpeed = Math.sqrt(dx * dx + dz * dz) / delta;
      isWalking = moveSpeed > 0.5;
      prevPos.copy(camera.position);
    }

    // ---- Walk cycle (legs + arms swing) ----
    if (isWalking) {
      walkPhase += delta * 8;
      const swing = Math.sin(walkPhase);

      // Legs swing opposite to each other
      leftLeg.rotation.x = swing * 0.4;
      rightLeg.rotation.x = -swing * 0.4;

      // Arms counter-swing (opposite to same-side leg)
      leftArmResult.group.rotation.x = leftArmDefaultX - swing * 0.25;
      rightArmResult.group.rotation.x = rightArmDefaultX + swing * 0.2;

      // Slight torso twist while walking
      torsoGroup.rotation.y = swing * 0.04;
    } else {
      // Smoothly return to idle pose
      walkPhase = 0;
      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      torsoGroup.rotation.y *= 0.85;

      if (opts.firstPerson) {
        // Blend arms back to default
        leftArmResult.group.rotation.x += (leftArmDefaultX - leftArmResult.group.rotation.x) * 0.1;
        rightArmResult.group.rotation.x += (rightArmDefaultX - rightArmResult.group.rotation.x) * 0.1;
      }

      // ---- Idle animations (only when standing still) ----
      if (opts.animate) {
        // Breathing
        torsoMesh.scale.y = 1 + Math.sin(time * 1.5) * 0.008;
        torsoMesh.position.y = baseTorsoY + Math.sin(time * 1.5) * 0.01;

        // Weight shift
        torsoGroup.rotation.z = Math.sin(time * 0.4) * 0.015;

        // Head animations only for third-person avatars
        if (!opts.firstPerson) {
          headGroup.rotation.y = Math.sin(time * 0.3) * 0.35;
          headGroup.rotation.x = Math.sin(time * 0.25 + 1.0) * 0.15 - 0.1;
        }

        // Arm idle sway (only for non-first-person or when not blending)
        if (!opts.firstPerson) {
          leftArmResult.group.rotation.x = leftArmDefaultX + Math.sin(time * 0.35) * 0.04;
          rightArmResult.group.rotation.z = Math.sin(time * 0.5) * 0.02;
        }
      }
    }
  }

  function dispose() {
    root.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material.dispose) child.material.dispose();
      }
    });
    root.removeFromParent();
  }

  function setHeadVisible(visible) {
    headGroup.visible = visible;
  }

  return { group: root, update, dispose, setHeadVisible };
}

/**
 * Creates multiple avatars from an array of configs.
 * @param {Array<Object>} configs
 * @returns {Array<{group: THREE.Group, update: (delta: number, camera?: THREE.Camera) => void, dispose: () => void}>}
 */
export function createAvatars(configs) {
  return configs.map(cfg => createAvatar(cfg));
}
