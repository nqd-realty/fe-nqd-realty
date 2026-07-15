import * as THREE from 'three';

// ============================================================
// IN-PAGE PROFILER
// Activate with ?profile=1 in the URL, or press P at any time.
// Shows FPS, per-stage CPU ms, renderer.info, scene counts —
// plus isolation toggles (avatar / shadows / LED lights /
// camera raycast / pixel ratio) to pinpoint what's slow on a
// given machine.
// ============================================================

const PANEL_CSS = `
#perf-panel{position:fixed;top:14px;left:14px;z-index:200;background:rgba(6,10,16,0.92);
  border:1px solid rgba(63,185,80,0.35);border-radius:10px;padding:12px 14px;
  font-family:'JetBrains Mono',monospace;font-size:11px;color:#c9d1d9;min-width:240px;
  pointer-events:auto;user-select:none;-webkit-user-select:none}
#perf-panel h4{color:#3fb950;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
#perf-panel .row{display:flex;justify-content:space-between;gap:12px;line-height:1.5}
#perf-panel .row b{color:#e0e0e0;font-weight:500}
#perf-panel .warn{color:#d4a030}
#perf-panel .bad{color:#f85149}
#perf-panel .good{color:#3fb950}
#perf-panel hr{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0}
#perf-panel label{display:flex;align-items:center;gap:7px;line-height:1.7;cursor:pointer;color:#8b949e}
#perf-panel label:hover{color:#e0e0e0}
#perf-panel input{accent-color:#3fb950;cursor:pointer}
#perf-panel .hint{color:rgba(255,255,255,0.3);font-size:9px;margin-top:6px}
body.mobile #perf-panel{top:auto;bottom:14px;left:14px;font-size:10px;min-width:200px}
`;

function fmtMs(v) { return v.toFixed(2); }

export function createProfiler({ renderer, scene, camera, avatar }) {
  const enabled = /[?&#]profile/.test(location.search + location.hash);

  // Public flags consumed by the render loop
  const flags = {
    avatar: true,        // avatar visible + updated
    shadows: true,       // renderer shadow map
    ledLights: true,     // point/spot lights from LED battens
    camRaycast: true,    // third-person camera wall raycast
    fullDPR: true,       // pixel ratio 2 vs 1
  };

  // ---- Stage timing ----
  const stages = {};       // name -> accumulated ms this frame
  const stageAvg = {};     // name -> smoothed ms
  let stageStart = 0;
  let currentStage = null;

  // ---- FPS tracking ----
  let frames = 0;
  let fpsTime = 0;
  let fps = 0;
  let worstFrame = 0;      // worst frame ms in current window
  let worstShown = 0;
  let lastFrameTs = 0;
  let frameMs = 0;

  let panel = null;
  let visible = false;
  let ledLightRefs = null;

  function collectLedLights() {
    if (ledLightRefs) return ledLightRefs;
    ledLightRefs = [];
    scene.traverse((o) => {
      if (o.isPointLight || o.isSpotLight) ledLightRefs.push(o);
    });
    return ledLightRefs;
  }

  function forceRecompile() {
    scene.traverse((o) => {
      if (o.isMesh && o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => (m.needsUpdate = true));
        else o.material.needsUpdate = true;
      }
    });
  }

  function applyFlags() {
    // Avatar
    avatar.group.visible = flags.avatar;

    // Shadows
    if (renderer.shadowMap.enabled !== flags.shadows) {
      renderer.shadowMap.enabled = flags.shadows;
      forceRecompile();
    }

    // LED lights (visible=false removes them from the light uniforms → shader recompile)
    for (const l of collectLedLights()) l.visible = flags.ledLights;

    // Pixel ratio
    const target = flags.fullDPR ? Math.min(window.devicePixelRatio, 2) : 1;
    if (renderer.getPixelRatio() !== target) renderer.setPixelRatio(target);
  }

  function countScene() {
    let meshes = 0, lights = 0, shadowCasters = 0;
    scene.traverse((o) => {
      if (o.isMesh) { meshes++; if (o.castShadow) shadowCasters++; }
      if (o.isLight && o.visible) lights++;
    });
    return { meshes, lights, shadowCasters };
  }

  function buildPanel() {
    const style = document.createElement('style');
    style.textContent = PANEL_CSS;
    document.head.appendChild(style);

    panel = document.createElement('div');
    panel.id = 'perf-panel';
    document.body.appendChild(panel);

    panel.innerHTML = `
      <h4>Profiler</h4>
      <div id="perf-stats"></div>
      <hr>
      <h4>Isolate</h4>
      <label><input type="checkbox" data-flag="avatar" checked> Avatar</label>
      <label><input type="checkbox" data-flag="shadows" checked> Shadows</label>
      <label><input type="checkbox" data-flag="ledLights" checked> LED point/spot lights</label>
      <label><input type="checkbox" data-flag="camRaycast" checked> 3P camera raycast</label>
      <label><input type="checkbox" data-flag="fullDPR" checked> Full pixel ratio</label>
      <div class="hint">Untick one at a time & watch FPS. P to hide.</div>
    `;

    panel.querySelectorAll('input[data-flag]').forEach((cb) => {
      cb.addEventListener('change', () => {
        flags[cb.dataset.flag] = cb.checked;
        applyFlags();
      });
      // Don't let clicks grab pointer lock
      cb.addEventListener('pointerdown', (e) => e.stopPropagation());
    });
  }

  function show() {
    if (!panel) buildPanel();
    panel.style.display = 'block';
    visible = true;
  }

  function hide() {
    if (panel) panel.style.display = 'none';
    visible = false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') visible ? hide() : show();
  });

  if (enabled) show();

  // ---- Per-frame API (no-ops stay cheap when panel is hidden) ----

  function begin(name) {
    if (!visible) return;
    currentStage = name;
    stageStart = performance.now();
  }

  function end() {
    if (!visible || !currentStage) return;
    const dt = performance.now() - stageStart;
    stages[currentStage] = (stages[currentStage] || 0) + dt;
    currentStage = null;
  }

  let statsEl = null;
  let sceneCounts = null;

  function frame() {
    if (!visible) return;

    const now = performance.now();
    if (lastFrameTs) {
      frameMs = now - lastFrameTs;
      if (frameMs > worstFrame) worstFrame = frameMs;
    }
    lastFrameTs = now;

    // Smooth stage times, then reset accumulators
    for (const k in stages) {
      stageAvg[k] = (stageAvg[k] || 0) * 0.95 + stages[k] * 0.05;
      stages[k] = 0;
    }

    frames++;
    fpsTime += frameMs || 0;
    if (fpsTime >= 500) {
      fps = (frames / fpsTime) * 1000;
      worstShown = worstFrame;
      worstFrame = 0;
      frames = 0;
      fpsTime = 0;
      sceneCounts = countScene();
      render();
    }
  }

  function render() {
    if (!statsEl) statsEl = panel.querySelector('#perf-stats');
    const info = renderer.info;
    const fpsClass = fps >= 50 ? 'good' : fps >= 28 ? 'warn' : 'bad';
    const dcClass = info.render.calls > 500 ? 'bad' : info.render.calls > 250 ? 'warn' : 'good';
    const lightClass = sceneCounts.lights > 8 ? 'bad' : 'good';

    let stageRows = '';
    const sorted = Object.entries(stageAvg).sort((a, b) => b[1] - a[1]);
    for (const [name, ms] of sorted) {
      const c = ms > 4 ? 'bad' : ms > 1.5 ? 'warn' : '';
      stageRows += `<div class="row"><span>${name}</span><b class="${c}">${fmtMs(ms)} ms</b></div>`;
    }

    statsEl.innerHTML = `
      <div class="row"><span>FPS</span><b class="${fpsClass}">${fps.toFixed(0)}</b></div>
      <div class="row"><span>Frame (worst)</span><b>${fmtMs(frameMs)} / ${fmtMs(worstShown)} ms</b></div>
      <div class="row"><span>Draw calls</span><b class="${dcClass}">${info.render.calls}</b></div>
      <div class="row"><span>Triangles</span><b>${(info.render.triangles / 1000).toFixed(1)}k</b></div>
      <div class="row"><span>Programs</span><b>${info.programs ? info.programs.length : '—'}</b></div>
      <div class="row"><span>Meshes</span><b>${sceneCounts.meshes}</b></div>
      <div class="row"><span>Lights</span><b class="${lightClass}">${sceneCounts.lights}</b></div>
      <div class="row"><span>Shadow casters</span><b>${sceneCounts.shadowCasters}</b></div>
      <div class="row"><span>Pixel ratio</span><b>${renderer.getPixelRatio().toFixed(1)}</b></div>
      ${stageRows ? '<hr>' + stageRows : ''}
    `;
  }

  // Programmatic toggle (also used from DevTools console: __profiler.set('shadows', false))
  function set(flag, value) {
    if (!(flag in flags)) return;
    flags[flag] = value;
    if (panel) {
      const cb = panel.querySelector(`input[data-flag="${flag}"]`);
      if (cb) cb.checked = value;
    }
    applyFlags();
  }

  function getStats() {
    return {
      fps,
      frameMs,
      worstMs: worstShown,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      programs: renderer.info.programs ? renderer.info.programs.length : 0,
      ...countScene(),
      pixelRatio: renderer.getPixelRatio(),
      stages: { ...stageAvg },
    };
  }

  const api = { flags, begin, end, frame, set, show, hide, getStats };
  window.__profiler = api;
  return api;
}
