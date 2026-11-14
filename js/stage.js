// The viewer: the castle floats in front of the live camera, not tied to anything.
// One finger turns it, two fingers pinch to zoom (and twist), the wheel zooms, a double tap resets.

import * as THREE from 'three';
import { buildCastle } from './castle.js';

const HOME = { az: -0.55, el: 0.3, dist: 138 };
const LIM = { elMin: 0.03, elMax: 1.35, dMin: 34, dMax: 190 };

let S = null;

export function mountStage(container){
  unmountStage();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const cv = renderer.domElement;
  cv.className = 'stage';
  container.appendChild(cv);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 1, 900);

  scene.add(new THREE.HemisphereLight(0xfff3dd, 0x6b5a45, 1.15));
  const sun = new THREE.DirectionalLight(0xffecc8, 2.4);
  sun.position.set(48, 78, 52);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -62; sc.right = 62; sc.top = 62; sc.bottom = -62; sc.near = 10; sc.far = 260;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.35;
  sun.target.position.set(18, -4, 0);
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xbcd0e8, 0.55); fill.position.set(-60, 30, -40); scene.add(fill);

  const castle = buildCastle({ aniso: Math.min(8, renderer.capabilities.getMaxAnisotropy()) });
  castle.traverse((o) => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
  scene.add(castle);
  const target = castle.userData.center.clone();

  const st = { ...HOME, vAz: 0, vEl: 0, idle: 0, tz: target.y, auto: true, drag: false };
  S = { renderer, scene, camera, st, container, raf: 0, last: performance.now(), pointers: new Map(), pinch: null, lastTap: 0, castle, off: [] };

  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); S.off.push(() => el.removeEventListener(ev, fn, opt)); };
  on(cv, 'pointerdown', (e) => {
    cv.setPointerCapture?.(e.pointerId);
    S.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    st.drag = true; st.idle = 0; st.vAz = st.vEl = 0;
    if (S.pointers.size === 2){ const [a, b] = [...S.pointers.values()]; S.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: st.dist }; }
  });
  on(cv, 'pointermove', (e) => {
    const p = S.pointers.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    st.idle = 0;
    if (S.pointers.size === 1){
      st.az -= dx * 0.0052; st.el = clamp(st.el + dy * 0.0042, LIM.elMin, LIM.elMax);
      st.vAz = -dx * 0.0052 * 60; st.vEl = 0;
    } else if (S.pointers.size === 2 && S.pinch){
      const [a, b] = [...S.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      st.dist = clamp(S.pinch.dist * (S.pinch.d / Math.max(d, 1)), LIM.dMin, LIM.dMax);
    }
  });
  const up = (e) => { S.pointers.delete(e.pointerId); if (S.pointers.size < 2) S.pinch = null; if (!S.pointers.size) st.drag = false; };
  on(cv, 'pointerup', up); on(cv, 'pointercancel', up); on(cv, 'pointerleave', up);
  on(cv, 'wheel', (e) => { e.preventDefault(); st.idle = 0; st.dist = clamp(st.dist * Math.exp(e.deltaY * 0.0012), LIM.dMin, LIM.dMax); }, { passive: false });
  on(window, 'resize', fit);

  function fit(){
    const w = container.clientWidth || innerWidth, h = container.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole castle in view on tall phone screens
    camera.fov = camera.aspect < 0.8 ? 36 / Math.max(0.55, camera.aspect * 1.05) : 36;
    camera.updateProjectionMatrix();
  }
  fit();

  window.__castleView = (az, el, dist) => Object.assign(st, { az, el, dist, vAz: 0, idle: -9999 });
  const clock = () => {
    S.raf = requestAnimationFrame(clock);
    const now = performance.now(), dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
    if (!st.drag){
      st.idle += dt;
      st.az += st.vAz * dt; st.vAz *= Math.pow(0.04, dt);
      if (st.idle > 3.5 && S.pointers.size === 0) st.az += 0.1 * dt * Math.min(1, (st.idle - 3.5) / 2);
    }
    const r = st.dist;
    camera.position.set(
      target.x + r * Math.cos(st.el) * Math.sin(st.az),
      target.y + r * Math.sin(st.el),
      target.z + r * Math.cos(st.el) * Math.cos(st.az));
    camera.lookAt(target.x, target.y + 4, target.z);
    renderer.render(scene, camera);
  };
  clock();

  function reset(){ Object.assign(st, HOME, { vAz: 0, vEl: 0, idle: 0 }); }
  S.reset = reset;
  return S;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function resetView(){ S?.reset(); }
export function zoomBy(f){ if (S) S.st.dist = clamp(S.st.dist * f, LIM.dMin, LIM.dMax); }
export const staged = () => !!S;

export function unmountStage(){
  if (!S) return;
  cancelAnimationFrame(S.raf);
  S.off.forEach((f) => f());
  S.scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { x.map?.dispose?.(); x.dispose?.(); }); });
  S.renderer.dispose();
  S.renderer.domElement.remove();
  S = null;
}
