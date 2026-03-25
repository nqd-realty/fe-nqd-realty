import * as THREE from 'three';

const locText = document.getElementById('locText');
const roomTag = document.getElementById('roomTag');
const doorPrompt = document.getElementById('door-prompt');
const doorAction = document.getElementById('door-action');
const doorName = document.getElementById('door-name');

const mapCanvas = document.getElementById('mapCanvas');
const mapCtx = mapCanvas.getContext('2d');

// Plot constants (must match environment.js)
const PLOT_W = -5;
const PLOT_E = 85;
const PLOT_N = 35;
const PLOT_S = -70;

export function getRoomName(x, y, z) {
  if (z >= 11.75 && z <= 17.75 && x >= -1 && x <= 8) return 'Common Toilet (9×6ft)';
  if (z >= 2 && z <= 11 && x >= -1 && x <= 8) return 'Caretaker Room (9×9ft)';
  if (z >= -3.75 && z <= 1.25 && x >= -1 && x <= 8) return 'South Cantilever';
  if (z >= 18.5 && z <= 35 && x >= -5 && x <= 8) return 'Car Parking';
  if (x >= -5 && x <= -1 && z >= 1.25 && z <= 18.5) return '4ft Pathway';
  if (x >= PLOT_W && x <= PLOT_E && z >= PLOT_S && z <= PLOT_N) return 'Nursery Land';
  if (x < PLOT_W) return 'West Road (60ft)';
  if (z < PLOT_S) return 'South Road (200ft)';
  return 'Outside';
}

const roomColors = {
  'Common Toilet (9×6ft)': '#58a6ff',
  'Caretaker Room (9×9ft)': '#e8a838',
  'South Cantilever': '#8b949e',
  'Car Parking': '#8b949e',
  '4ft Pathway': '#3fb950',
  'Nursery Land': '#3fb950',
  'West Road (60ft)': '#666',
  'South Road (200ft)': '#666',
  'Outside': '#555',
};

export function updateHUD(camera) {
  const p = camera.position;
  const room = getRoomName(p.x, p.y, p.z);
  roomTag.textContent = room;
  roomTag.style.color = roomColors[room] || '#3fb950';
  locText.textContent = `${p.x.toFixed(1)}, ${p.z.toFixed(1)}  H:${p.y.toFixed(1)}ft`;
}

export function updateDoorPrompt(info) {
  if (info) {
    doorAction.textContent = info.isOpen ? 'close' : 'open';
    doorName.textContent = info.label;
    doorPrompt.style.opacity = '1';
  } else {
    doorPrompt.style.opacity = '0';
  }
}

export function drawMinimap(camera) {
  const ctx = mapCtx;
  const W = 170, H = 275;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = 'rgba(10, 15, 20, 0.6)';
  ctx.fillRect(0, 0, W, H);

  // The minimap shows the full plot (90×105ft) fitted into the canvas
  // with some padding
  const pad = 8;
  const plotW = PLOT_E - PLOT_W;  // 90
  const plotD = PLOT_N - PLOT_S;  // 105
  const scaleX = (W - 2 * pad) / plotW;
  const scaleZ = (H - 2 * pad) / plotD;
  const s = Math.min(scaleX, scaleZ);  // uniform scale

  // Center the plot in the canvas
  const drawW = plotW * s;
  const drawH = plotD * s;
  const ox = pad + (W - 2 * pad - drawW) / 2;
  const oy = pad + (H - 2 * pad - drawH) / 2;

  // Helper: plot coords to canvas coords
  function px(x) { return ox + (x - PLOT_W) * s; }
  function pz(z) { return oy + (PLOT_N - z) * s; }  // flip Z (north = top)

  // Plot boundary
  ctx.strokeStyle = 'rgba(130,120,100,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px(PLOT_W), pz(PLOT_N), plotW * s, plotD * s);

  // Plot fill — green nursery
  ctx.fillStyle = 'rgba(63,185,80,0.06)';
  ctx.fillRect(px(PLOT_W), pz(PLOT_N), plotW * s, plotD * s);

  // Roads — thin strips
  // West road
  ctx.fillStyle = 'rgba(80,80,80,0.25)';
  ctx.fillRect(px(PLOT_W) - 6, pz(PLOT_N), 6, plotD * s);
  // South road
  ctx.fillRect(px(PLOT_W), pz(PLOT_S) + 1, plotW * s, 5);

  // Road labels
  ctx.fillStyle = 'rgba(150,150,150,0.35)';
  ctx.font = '6px JetBrains Mono, monospace';
  ctx.save();
  ctx.translate(px(PLOT_W) - 3, pz(PLOT_N) + plotD * s / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('60ft ROAD', -20, 0);
  ctx.restore();
  ctx.fillText('200ft ROAD', px(PLOT_W) + plotW * s / 2 - 18, pz(PLOT_S) + 12);

  // Main gate marker
  ctx.fillStyle = '#d4a030';
  ctx.fillRect(px(PLOT_W) - 2, pz(-40) - 3, 4, 6);
  ctx.fillStyle = 'rgba(212,160,48,0.5)';
  ctx.font = '5px JetBrains Mono, monospace';
  ctx.fillText('GATE', px(PLOT_W) - 12, pz(-40) + 10);

  // ---- NW Construction zone (zoomed area indicator) ----

  // Parking (X=-5..8, Z=18.5..35)
  ctx.fillStyle = 'rgba(100,100,100,0.12)';
  ctx.fillRect(px(-5), pz(35), 13 * s, 16.5 * s);
  ctx.strokeStyle = 'rgba(100,100,100,0.3)';
  ctx.strokeRect(px(-5), pz(35), 13 * s, 16.5 * s);

  // Pathway (X=-5..-1, Z=1.25..18.5)
  ctx.fillStyle = 'rgba(63,185,80,0.12)';
  ctx.fillRect(px(-5), pz(18.5), 4 * s, 17.25 * s);

  // Toilet (X=-1..8, Z=11.75..17.75)
  ctx.fillStyle = 'rgba(88,166,255,0.15)';
  ctx.fillRect(px(-1), pz(17.75), 9 * s, 6 * s);
  ctx.strokeStyle = 'rgba(88,166,255,0.4)';
  ctx.strokeRect(px(-1), pz(17.75), 9 * s, 6 * s);

  // Room (X=-1..8, Z=2..11)
  ctx.fillStyle = 'rgba(232,168,56,0.15)';
  ctx.fillRect(px(-1), pz(11), 9 * s, 9 * s);
  ctx.strokeStyle = 'rgba(232,168,56,0.4)';
  ctx.strokeRect(px(-1), pz(11), 9 * s, 9 * s);

  // Cantilever (X=-1..8, Z=-3.75..1.25)
  ctx.setLineDash([2, 2]);
  ctx.strokeStyle = 'rgba(150,150,150,0.3)';
  ctx.strokeRect(px(-1), pz(1.25), 9 * s, 5 * s);
  ctx.setLineDash([]);

  // NW zone labels (only if there's enough space)
  if (s > 1) {
    ctx.fillStyle = 'rgba(88,166,255,0.6)';
    ctx.font = '6px JetBrains Mono, monospace';
    ctx.fillText('T', px(2), pz(14.75));
    ctx.fillStyle = 'rgba(232,168,56,0.6)';
    ctx.fillText('R', px(2), pz(6.5));
    ctx.fillStyle = 'rgba(150,150,150,0.4)';
    ctx.fillText('P', px(0), pz(26.75));
  }

  // Player dot
  const playerX = px(camera.position.x);
  const playerZ = pz(camera.position.z);

  // Clamp to minimap bounds
  const cx = Math.max(3, Math.min(W - 3, playerX));
  const cz = Math.max(3, Math.min(H - 3, playerZ));

  ctx.beginPath();
  ctx.arc(cx, cz, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#3fb950';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Direction indicator
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);
  ctx.beginPath();
  ctx.moveTo(cx, cz);
  ctx.lineTo(cx + dir.x * 8, cz - dir.z * 8);
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 1;

  // North indicator
  ctx.fillStyle = '#3fb950';
  ctx.font = 'bold 7px JetBrains Mono, monospace';
  ctx.fillText('N', ox + drawW / 2 - 3, oy - 1);
}

// ============================================================
// DIMENSIONS OVERLAY — toggle with 'M' key
// ============================================================
let dimsVisible = false;
const dimsPanel = document.createElement('div');
dimsPanel.id = 'dims-panel';
dimsPanel.style.cssText = `
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  z-index:60; pointer-events:none; display:none;
  background:rgba(10,15,20,0.88); border:1px solid rgba(63,185,80,0.3);
  border-radius:12px; padding:20px 28px; min-width:320px;
  font-family:'JetBrains Mono',monospace; color:#c9d1d9; font-size:12px;
  backdrop-filter:blur(6px);
`;
document.body.appendChild(dimsPanel);

const dimData = {
  'Caretaker Room (9×9ft)': {
    title: 'Caretaker Room',
    dims: [
      ['Interior', '9ft × 9ft (2.74m × 2.74m)'],
      ['Wall thickness', '9 inches (0.75ft)'],
      ['Height', '10ft (3.05m)'],
      ['Door', '3ft wide, East wall NE corner'],
      ['Window', 'Glass block wall, East wall SE (6ft wide)'],
      ['Counter', 'L-shape NW: 6.3ft N + 3.4ft W'],
      ['Storage', 'SW cupboard: 5.5ft × 1.5ft, floor-to-ceiling'],
      ['Bed', '6ft × 6ft king, South zone'],
    ]
  },
  'Common Toilet (9×6ft)': {
    title: 'Common Toilet',
    dims: [
      ['Interior', '9ft × 6ft (2.74m × 1.83m)'],
      ['Wall thickness', '9 inches (0.75ft)'],
      ['Height', '10ft (3.05m)'],
      ['Door', '2.5ft wide, West wall S-biased'],
      ['WC', 'West wall, faces East'],
      ['Urinal', 'South wall (dividing wall side)'],
      ['Shower', 'SE corner, 3ft × 2.4ft'],
      ['Handwash', 'NE corner, East wall'],
      ['Glass partition', 'Between WC & door zone'],
    ]
  },
  'Car Parking': {
    title: 'Car Parking',
    dims: [
      ['Area', '14ft × 16.5ft (E-W × N-S)'],
      ['Shutter', '16.5ft wide, auto roller'],
      ['Wash area', '9ft × 5ft tiled, with drain'],
      ['MS columns', '3 nos. (6"×6"), 12ft tall'],
    ]
  },
  '4ft Pathway': {
    title: '4ft Pathway',
    dims: [
      ['Width', '4ft (1.22m), open to sky'],
      ['Length', '17.25ft (N-S)'],
      ['Surface', 'IPS / Kota stone'],
      ['Wash basin', 'NW corner, wall-mounted'],
    ]
  },
  'South Cantilever': {
    title: 'South Cantilever',
    dims: [
      ['Overhang', '5ft south of room'],
      ['Width', '9ft (E-W)'],
      ['Counter', '6ft × 2ft outdoor, SW'],
    ]
  },
};

export function toggleDimensions() {
  dimsVisible = !dimsVisible;
  dimsPanel.style.display = dimsVisible ? 'block' : 'none';
}

export function updateDimensions(camera) {
  if (!dimsVisible) return;
  const p = camera.position;
  const room = getRoomName(p.x, p.y, p.z);
  const data = dimData[room];

  if (!data) {
    dimsPanel.innerHTML = `
      <div style="color:#3fb950;font-size:14px;font-weight:700;margin-bottom:8px">${room}</div>
      <div style="color:#8b949e">No dimension data for this area</div>
      <div style="color:#484f58;margin-top:10px;font-size:10px">Press M to close</div>
    `;
    return;
  }

  let rows = data.dims.map(([label, val]) =>
    `<tr><td style="color:#8b949e;padding:2px 12px 2px 0">${label}</td><td style="color:#e6edf3">${val}</td></tr>`
  ).join('');

  dimsPanel.innerHTML = `
    <div style="color:#3fb950;font-size:15px;font-weight:700;margin-bottom:10px">${data.title} — Dimensions</div>
    <table style="border-collapse:collapse">${rows}</table>
    <div style="color:#484f58;margin-top:12px;font-size:10px">Press M to close · All walls 9" (0.75ft)</div>
  `;
}
