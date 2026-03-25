import * as THREE from 'three';

// Procedural texture generators
function createCanvasTexture(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ============================================================
// RAW CONCRETE — fair-faced with formwork lines & tie holes
// ============================================================
export const concreteTex = createCanvasTexture(512, 512, (ctx, w, h) => {
  // Base: cool grey concrete
  ctx.fillStyle = '#9A9590';
  ctx.fillRect(0, 0, w, h);

  // Aggregate noise — fine speckle
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 130 + Math.random() * 50;
    ctx.fillStyle = `rgba(${v}, ${v - 2}, ${v - 5}, 0.08)`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Formwork lines — subtle horizontal bands
  for (let y = 0; y < h; y += 64) {
    ctx.strokeStyle = `rgba(80, 75, 70, ${0.06 + Math.random() * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 4);
    ctx.lineTo(w, y + Math.random() * 4);
    ctx.stroke();
  }

  // Tie holes (formwork bolt marks) — regular grid
  for (let tx = 64; tx < w; tx += 128) {
    for (let ty = 64; ty < h; ty += 128) {
      const ox = tx + (Math.random() - 0.5) * 8;
      const oy = ty + (Math.random() - 0.5) * 8;
      // Dark ring
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 65, 60, 0.25)';
      ctx.fill();
      // Center plug
      ctx.beginPath();
      ctx.arc(ox, oy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120, 115, 110, 0.35)';
      ctx.fill();
    }
  }

  // Slight color variation patches (pour marks)
  for (let i = 0; i < 8; i++) {
    const px = Math.random() * w;
    const py = Math.random() * h;
    const radius = 30 + Math.random() * 60;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    const shift = Math.random() > 0.5 ? 8 : -8;
    grad.addColorStop(0, `rgba(${154 + shift}, ${149 + shift}, ${144 + shift}, 0.12)`);
    grad.addColorStop(1, 'rgba(154, 149, 144, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }
});
concreteTex.repeat.set(2, 2);

// ============================================================
// DARK CHARCOAL FLOOR TILE — large format matte
// ============================================================
export const darkFloorTex = createCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#3A3835';
  ctx.fillRect(0, 0, w, h);

  // 2x2 large tiles
  const tileW = w / 2;
  const tileH = h / 2;
  for (let tx = 0; tx < 2; tx++) {
    for (let ty = 0; ty < 2; ty++) {
      const v = 50 + Math.random() * 12;
      ctx.fillStyle = `rgb(${v + 3}, ${v + 1}, ${v})`;
      ctx.fillRect(tx * tileW + 1.5, ty * tileH + 1.5, tileW - 3, tileH - 3);

      // Subtle stone texture
      for (let i = 0; i < 400; i++) {
        const x = tx * tileW + Math.random() * tileW;
        const y = ty * tileH + Math.random() * tileH;
        const sv = 40 + Math.random() * 30;
        ctx.fillStyle = `rgba(${sv}, ${sv}, ${sv}, 0.06)`;
        ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
      }
    }
  }
  // Grout
  ctx.strokeStyle = 'rgba(25, 23, 20, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(tileW, 0); ctx.lineTo(tileW, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, tileH); ctx.lineTo(w, tileH); ctx.stroke();
});

// ============================================================
// TERRAZZO / AGGREGATE FLOOR — warm speckled concrete
// ============================================================
export const terrazzoTex = createCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#B5ADA0';
  ctx.fillRect(0, 0, w, h);

  // Aggregate chips
  const colors = ['#C8C0B0', '#A09888', '#8A8070', '#D0C8B8', '#706860'];
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    const size = 1 + Math.random() * 4;
    ctx.fillRect(x, y, size, size * (0.6 + Math.random() * 0.8));
  }
  ctx.globalAlpha = 1;
});
terrazzoTex.repeat.set(2, 2);

// ============================================================
// CONCRETE PATHWAY — smooth grey with aggregate
// ============================================================
export const pathwayTex = createCanvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#7A7570';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 100 + Math.random() * 40;
    ctx.fillStyle = `rgba(${v}, ${v - 2}, ${v - 5}, 0.08)`;
    ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
});
pathwayTex.repeat.set(1, 3);

// ============================================================
// PARKING — dark polished concrete
// ============================================================
export const parkingTex = createCanvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#454240';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 55 + Math.random() * 25;
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.1)`;
    ctx.fillRect(x, y, 2, 2);
  }
});
parkingTex.repeat.set(2, 2);

// ============================================================
// GROUND — muted green nursery
// ============================================================
export const groundTex = createCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#4A6A30';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const g = 50 + Math.random() * 70;
    ctx.fillStyle = `rgba(${g * 0.35}, ${g}, ${g * 0.15}, 0.12)`;
    ctx.fillRect(x, y, 1 + Math.random() * 4, 1 + Math.random() * 4);
  }
});
groundTex.repeat.set(8, 8);

// ============================================================
// WARM OAK DOOR — natural wood grain, clean modern panels
// ============================================================
export const doorTex = createCanvasTexture(128, 256, (ctx, w, h) => {
  // Base warm oak
  ctx.fillStyle = '#B8956A';
  ctx.fillRect(0, 0, w, h);

  // Fine vertical grain (oak style)
  for (let x = 0; x < w; x += 1) {
    const wave = Math.sin(x * 0.15) * 3;
    const v = 160 + Math.random() * 25 + Math.sin(x * 0.08) * 10;
    ctx.strokeStyle = `rgba(${v}, ${v * 0.75}, ${v * 0.5}, 0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + wave, h);
    ctx.stroke();
  }

  // Horizontal grain layers
  for (let y = 0; y < h; y += 3) {
    const v = 155 + Math.random() * 30 + Math.sin(y * 0.03) * 12;
    ctx.fillStyle = `rgba(${v}, ${v * 0.72}, ${v * 0.45}, 0.08)`;
    ctx.fillRect(0, y, w, 2);
  }

  // Clean panel line (modern flush door)
  ctx.strokeStyle = 'rgba(100, 75, 45, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(6, 6, w - 12, h - 12);
});

// ============================================================
// CONCRETE CEILING SOFFIT — raw with tie holes
// ============================================================
export const ceilTex = createCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#8A8580';
  ctx.fillRect(0, 0, w, h);

  // Formwork board marks
  for (let x = 0; x < w; x += 85) {
    ctx.strokeStyle = `rgba(70, 65, 60, ${0.05 + Math.random() * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + Math.random() * 3, 0);
    ctx.lineTo(x + Math.random() * 3, h);
    ctx.stroke();
  }

  // Aggregate
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = 115 + Math.random() * 40;
    ctx.fillStyle = `rgba(${v}, ${v - 3}, ${v - 6}, 0.06)`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Tie holes
  for (let tx = 85; tx < w; tx += 170) {
    for (let ty = 85; ty < h; ty += 170) {
      ctx.beginPath();
      ctx.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60, 55, 50, 0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(105, 100, 95, 0.3)';
      ctx.fill();
    }
  }
});
ceilTex.repeat.set(2, 2);


// ============================================================
// MATERIALS — Industrial Luxe Palette
// ============================================================
export const M = {
  // Walls — raw exposed concrete
  wall: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.82, metalness: 0.02 }),
  wallExt: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.85, metalness: 0.02 }),

  // Floors
  floor: new THREE.MeshStandardMaterial({ map: darkFloorTex, roughness: 0.55, metalness: 0.05 }),
  floorRoom: new THREE.MeshStandardMaterial({ map: darkFloorTex, roughness: 0.55, metalness: 0.05 }),
  pathFl: new THREE.MeshStandardMaterial({ map: terrazzoTex, roughness: 0.7, metalness: 0 }),
  parkFl: new THREE.MeshStandardMaterial({ map: parkingTex, roughness: 0.65, metalness: 0.05 }),
  ground: new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9, metalness: 0 }),

  // Sanitaryware — matte white ceramics
  shower: new THREE.MeshStandardMaterial({ color: 0x2A2826, roughness: 0.25, metalness: 0.05 }),
  wc: new THREE.MeshStandardMaterial({ color: 0xE5E2DE, roughness: 0.12, metalness: 0.03 }),
  urinal: new THREE.MeshStandardMaterial({ color: 0xE0DDD8, roughness: 0.12, metalness: 0.03 }),
  basin: new THREE.MeshStandardMaterial({ color: 0xEAE8E4, roughness: 0.08, metalness: 0.03 }),

  // Counters — concrete grey
  counter: new THREE.MeshStandardMaterial({ color: 0x6A6560, roughness: 0.65, metalness: 0.02 }),
  counterR: new THREE.MeshStandardMaterial({ color: 0x757068, roughness: 0.65, metalness: 0.02 }),

  // Mirror — high reflectivity
  mirror: new THREE.MeshStandardMaterial({ color: 0xB0B8C0, roughness: 0.02, metalness: 0.97 }),

  // Chrome/hardware — matte black (industrial style)
  chrome: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.15, metalness: 0.9 }),

  // Glass — dark tinted, reflective
  glass: new THREE.MeshStandardMaterial({
    color: 0x2A3540, roughness: 0.03, metalness: 0.1,
    transparent: true, opacity: 0.25, side: THREE.DoubleSide
  }),

  // Door — warm oak
  door: new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.4, metalness: 0 }),

  // Frames — matte black steel
  frame: new THREE.MeshStandardMaterial({ color: 0x1C1C1C, roughness: 0.35, metalness: 0.85 }),

  // Geyser & pipes
  geyser: new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: 0.25, metalness: 0.15 }),
  pipeC: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.25, metalness: 0.8 }),
  pipeH: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.25, metalness: 0.8 }),

  // Structural metal — matte black / dark grey
  metal: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.3, metalness: 0.85 }),
  exhaust: new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.4, metalness: 0.6 }),

  // Storage — dark grey concrete
  storage: new THREE.MeshStandardMaterial({ color: 0x555550, roughness: 0.7, metalness: 0.02 }),

  // Bed — muted dark linen
  bed: new THREE.MeshStandardMaterial({ color: 0x4A4540, roughness: 0.75, metalness: 0 }),
  pillow: new THREE.MeshStandardMaterial({ color: 0x8A8478, roughness: 0.8, metalness: 0 }),

  // Kitchenette — matte black
  induct: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.2, metalness: 0.3 }),
  fridge: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.2, metalness: 0.4 }),

  // Louver — matte black steel (not teal)
  louver: new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.35, metalness: 0.7 }),

  // Outdoor counter — concrete
  outdoor: new THREE.MeshStandardMaterial({ color: 0x7A7570, roughness: 0.7, metalness: 0.02 }),

  // Concrete structural elements
  concrete: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.8, metalness: 0.02 }),

  // Boundary wall — raw concrete
  boundary: new THREE.MeshStandardMaterial({ color: 0x5A5855, roughness: 0.85, metalness: 0.02 }),

  // Shutter — dark steel
  shutter: new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.3, metalness: 0.7 }),

  // Drain — black
  drain: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.3, metalness: 0.7 }),

  // Deck sheet roof — dark galvanized
  deckSheet: new THREE.MeshStandardMaterial({
    color: 0x4A4845, roughness: 0.4, metalness: 0.65, side: THREE.DoubleSide
  }),

  // Purlins/beams — matte black steel
  purlin: new THREE.MeshStandardMaterial({ color: 0x1E1E1E, roughness: 0.3, metalness: 0.9 }),
};
