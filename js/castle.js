// Kumamoto Castle, built procedurally in metres (1 unit = 1 m) from how the real castle is made:
//  - the Daitenshu (main keep): a curved "musha-gaeshi" stone base, then black-board (shitami-ita)
//    walls in tiers, each with a tiled roof, white-plaster gables (chidori-hafu and kara-hafu)
//    and a top floor ringed by windows under a hip-and-gable (irimoya) roof with shachihoko
//  - the Shotenshu (small keep) to its right, joined by a low connecting hall
//  - the entrance stair, fences and the wooden bridge to the right
// Everything is drawn from procedural canvas textures, so there are no image files to load.

import * as THREE from 'three';

const lerp = (a, b, t) => a + (b - a) * t;

function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function canvasTex(w, h, draw, { srgb = true, aniso = 8 } = {}){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

// ------------------------------------------------------------------ textures
function makeTextures(aniso){
  const R = rng(7);
  const stone = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#3c3831'; g.fillRect(0, 0, w, h);
    for (let n = 0; n < 1500; n++){
      const cx = R() * w, cy = R() * h, rx = 20 + R() * 34, ry = 15 + R() * 22, a = (R() - 0.5) * 0.7;
      const s = 112 + R() * 70, warm = R() * 18;
      const col = `rgb(${s + warm | 0},${s + warm * 0.55 | 0},${s - 10 - warm * 0.8 | 0})`;
      for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]){
        if (cx + dx < -80 || cx + dx > w + 80 || cy + dy < -80 || cy + dy > h + 80) continue;
        g.beginPath(); g.ellipse(cx + dx, cy + dy, rx, ry, a, 0, 6.2832);
        const gr = g.createRadialGradient(cx + dx - rx * 0.25, cy + dy - ry * 0.3, 2, cx + dx, cy + dy, rx);
        gr.addColorStop(0, col); gr.addColorStop(1, `rgb(${s * 0.72 | 0},${s * 0.7 | 0},${s * 0.64 | 0})`);
        g.fillStyle = gr; g.fill();
        g.lineWidth = 2.4; g.strokeStyle = 'rgba(26,22,18,.75)'; g.stroke();
      }
    }
  }, { aniso });

  const boards = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#1b1816'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16){
      const v = 24 + R() * 10;
      g.fillStyle = `rgb(${v},${v - 2},${v - 4})`; g.fillRect(0, y, w, 15);
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, y, w, 2);
      g.fillStyle = '#070606'; g.fillRect(0, y + 14, w, 2);
    }
    for (let x = 0; x < w; x += 128){ g.fillStyle = '#2c2825'; g.fillRect(x, 0, 7, h); g.fillStyle = '#0a0908'; g.fillRect(x + 7, 0, 2, h); }
  }, { aniso });

  const lattice = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#23272b'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b9b09b'; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 32){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 32){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, 0, w, 14);
  }, { aniso });

  const latticeD = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#121416'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#55554f'; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 32){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 32){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, { aniso });

  const slat = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#2a2724'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8){ g.fillStyle = '#4a443d'; g.fillRect(0, y, w, 3); g.fillStyle = '#0d0c0b'; g.fillRect(0, y + 5, w, 3); }
  }, { aniso });

  const tile = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#9a948a'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++){
      const y = row * 64;
      for (let x = 0; x < w; x += 51.2){
        const v = 118 + R() * 26;
        g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(x + 4, y + 3, 44, 56);
        g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 4, y + 3, 5, 56);
        g.fillStyle = 'rgba(25,22,20,.55)'; g.fillRect(x + 42, y + 3, 6, 56);
      }
      g.fillStyle = 'rgba(70,64,58,.55)'; g.fillRect(0, y + 58, w, 3); g.fillStyle = 'rgba(232,226,212,.75)'; g.fillRect(0, y + 61, w, 3);
    }
  }, { aniso });

  const gable = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#eee6d2'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,100,70,.08)';
    for (let i = 0; i < 200; i++) g.fillRect(R() * w, R() * h, 20, 2);
    g.fillStyle = '#2a2420'; g.fillRect(0, h - 26, w, 26);
    g.fillStyle = '#17130f'; g.beginPath(); g.moveTo(w * 0.5, h * 0.46); g.lineTo(w * 0.1, h * 0.96); g.lineTo(w * 0.9, h * 0.96); g.closePath(); g.fill();
    g.fillStyle = '#2a2420';
    g.strokeStyle = '#2a2420'; g.lineWidth = 10;
    g.beginPath(); g.arc(w / 2, h * 0.3, 34, 0, 6.2832); g.stroke();
    g.fillStyle = '#b5452f'; g.beginPath(); g.arc(w / 2, h * 0.3, 15, 0, 6.2832); g.fill();
    g.strokeStyle = '#2a2420'; g.lineWidth = 6;
    for (let k = 0; k < 8; k++){ const a = k * Math.PI / 4; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 40, h * 0.3 + Math.sin(a) * 40); g.lineTo(w / 2 + Math.cos(a) * 54, h * 0.3 + Math.sin(a) * 54); g.stroke(); }
  }, { aniso });

  const sand = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b79f7c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++){ const v = 140 + R() * 70; g.fillStyle = `rgba(${v},${v - 20},${v - 55},.35)`; g.fillRect(R() * w, R() * h, 3, 3); }
  }, { aniso });

  const wood = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#4b3a2b'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32){ g.fillStyle = '#3a2c20'; g.fillRect(0, y, w, 3); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, y + 3, w, 2); }
  }, { aniso });

  return { stone, boards, lattice, latticeD, slat, tile, gable, sand, wood };
}

// ------------------------------------------------------------------ small helpers
function repeated(tex, rx, ry){ const t = tex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return t; }

function beam(p1, p2, w, h, mat){
  const a = new THREE.Vector3(...p1), b = new THREE.Vector3(...p2);
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.lookAt(b);
  return m;
}

function box(w, h, d, mat, x = 0, y = 0, z = 0){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

// a group that sits on the face of a box: local +z points out of the face, local x runs along it
function faceAt(face, hx, hz, y = 0){
  const g = new THREE.Group();
  const rot = { 'z+': 0, 'x+': Math.PI / 2, 'z-': Math.PI, 'x-': -Math.PI / 2 }[face];
  g.rotation.y = rot;
  const dist = face[0] === 'z' ? hz : hx;
  g.position.set(Math.sin(rot) * dist, y, Math.cos(rot) * dist);
  return g;
}

// ------------------------------------------------------------------ the builder
export function buildCastle({ aniso = 8 } = {}){
  const T = makeTextures(aniso);
  const M = {
    stone: new THREE.MeshStandardMaterial({ map: T.stone, bumpMap: T.stone, bumpScale: 2.2, roughness: 0.95 }),
    cap: new THREE.MeshStandardMaterial({ color: 0x8a806f, roughness: 1 }),
    tile: new THREE.MeshStandardMaterial({ map: T.tile, roughness: 0.8, metalness: 0, side: THREE.DoubleSide }),
    cream: new THREE.MeshStandardMaterial({ color: 0xeee6d2, roughness: 0.85 }),
    creamD: new THREE.MeshStandardMaterial({ color: 0xcfc6ad, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a1613, roughness: 0.9 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ map: T.wood, roughness: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb59a52, roughness: 0.4, metalness: 0.55 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x3b3a39, roughness: 0.6, metalness: 0.5 }),
    gableFace: new THREE.MeshStandardMaterial({ map: T.gable, roughness: 0.9 }),
    awn: new THREE.MeshStandardMaterial({ color: 0x3b3835, roughness: 0.7 }),
    frameD: new THREE.MeshStandardMaterial({ color: 0x0e0c0b, roughness: 0.9 }),
    winDark: (cols, rows) => new THREE.MeshStandardMaterial({ map: repeated(T.latticeD, cols / 8, rows / 4), roughness: 0.5 }),
    win: (cols, rows) => new THREE.MeshStandardMaterial({ map: repeated(T.lattice, cols / 8, rows / 4), roughness: 0.35, metalness: 0.2 }),
    slatM: (cols, rows) => new THREE.MeshStandardMaterial({ map: repeated(T.slat, cols, rows), roughness: 0.9 }),
    wall: (w, h) => new THREE.MeshStandardMaterial({ map: repeated(T.boards, w / 6, h / 4), roughness: 0.78 }),
  };

  const root = new THREE.Group();
  root.name = 'kumamoto-castle';
  const GROUND = -11.2;

  // -------------------------------------------------------------- stone base (musha-gaeshi)
  const stoneOff = (t, inset) => inset * Math.pow(t, 2.2); // t = 0 at the top, 1 at the foot
  function stoneBlock({ cx, cz, hx, hz, y0, y1, inset }){
    const g = new THREE.Group();
    const N = 28, Mx = 14;
    const pos = [], uv = [], idx = [];
    const off = (i) => stoneOff(i / N, inset);
    const corner = (i, sx, sz) => [cx + sx * (hx + off(i)), y1 - (y1 - y0) * (i / N), cz + sz * (hz + off(i))];
    const sides = [[1, 1, -1, 1], [-1, -1, 1, -1], [1, -1, 1, 1], [-1, 1, -1, -1]]; // [sxA, szA, sxB, szB]
    const faces = [[[-1, 1], [1, 1]], [[1, -1], [-1, -1]], [[1, 1], [1, -1]], [[-1, -1], [-1, 1]]];
    for (const [A, B] of faces){
      const base = pos.length / 3;
      let acc = 0;
      for (let i = 0; i <= N; i++){
        const a = corner(i, A[0], A[1]), b = corner(i, B[0], B[1]);
        const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
        if (i > 0){ const pa = corner(i - 1, A[0], A[1]); acc += Math.hypot(a[0] - pa[0], a[1] - pa[1], a[2] - pa[2]); }
        for (let j = 0; j <= Mx; j++){
          const s = j / Mx;
          // gentle outward belly so the walls read as curved, not flat
          const bulge = Math.sin(s * Math.PI) * 0.18 * (i / N);
          const nrm = [b[2] - a[2], 0, -(b[0] - a[0])]; const nl = Math.hypot(nrm[0], nrm[2]) || 1;
          pos.push(lerp(a[0], b[0], s) + nrm[0] / nl * bulge * -1, lerp(a[1], b[1], s), lerp(a[2], b[2], s) + nrm[2] / nl * bulge * -1);
          uv.push(s * len / 6, acc / 6);
        }
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < Mx; j++){
        const a = base + i * (Mx + 1) + j, b = a + 1, c = a + Mx + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mat = M.stone.clone(); mat.side = THREE.DoubleSide;
    const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
    g.add(m);
    const capM = box(hx * 2 + 0.2, 0.3, hz * 2 + 0.2, M.cap, cx, y1 - 0.15, cz); capM.receiveShadow = true;
    g.add(capM);
    g.userData.wallZ = (y, side = 1) => cz + side * (hz + stoneOff((y1 - y) / (y1 - y0), inset));
    return g;
  }

  // -------------------------------------------------------------- hip / pent roof from one rectangle to another
  function roofGroup({ ex, ez, tx, tz, y0, h, lift = 0.95, fascia = 0.42, pow = 1.5 }){
    const g = new THREE.Group();
    const N = 7, Mx = 12;
    const sides = [
      [[-ex, ez], [ex, ez], [-tx, tz], [tx, tz]],
      [[ex, -ez], [-ex, -ez], [tx, -tz], [-tx, -tz]],
      [[ex, ez], [ex, -ez], [tx, tz], [tx, -tz]],
      [[-ex, -ez], [-ex, ez], [-tx, -tz], [-tx, tz]],
    ];
    const pos = [], uv = [], idx = [];
    const fpos = [], fidx = [];
    for (const [A, B, A2, B2] of sides){
      const base = pos.length / 3;
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const midE = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], midT = [(A2[0] + B2[0]) / 2, (A2[1] + B2[1]) / 2];
      const run = Math.hypot(midT[0] - midE[0], midT[1] - midE[1]);
      const slope = Math.hypot(run, h);
      for (let i = 0; i <= N; i++){
        const t = i / N;
        for (let j = 0; j <= Mx; j++){
          const s = j / Mx;
          const ex_ = lerp(lerp(A[0], B[0], s), lerp(A2[0], B2[0], s), t);
          const ez_ = lerp(lerp(A[1], B[1], s), lerp(A2[1], B2[1], s), t);
          const y = y0 + h * Math.pow(t, pow) + lift * (1 - t) * Math.pow(Math.abs(2 * s - 1), 3);
          pos.push(ex_, y, ez_);
          uv.push(s * len / 3, t * slope / 3);
        }
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < Mx; j++){
        const a = base + i * (Mx + 1) + j, b = a + 1, c = a + Mx + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      // white plaster fascia along the eave edge
      const fb = fpos.length / 3;
      for (let j = 0; j <= Mx; j++){
        const s = j / Mx;
        const x = lerp(A[0], B[0], s), z = lerp(A[1], B[1], s);
        const top = y0 + lift * Math.pow(Math.abs(2 * s - 1), 3);
        fpos.push(x, top + 0.04, z, x, top - fascia, z);
      }
      for (let j = 0; j < Mx; j++){ const a = fb + j * 2; fidx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const roof = new THREE.Mesh(geo, M.tile); roof.castShadow = roof.receiveShadow = true;
    g.add(roof);
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fpos, 3));
    fg.setIndex(fidx); fg.computeVertexNormals();
    const fm = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: 0xece3cf, roughness: 0.85, side: THREE.DoubleSide }));
    g.add(fm);
    // soffit under the eave
    const soff = box(ex * 2, 0.25, ez * 2, M.wood, 0, y0 - 0.1, 0); g.add(soff);
    // hip ridges
    const hipTop = y0 + h;
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]){
      const hp = [sx * ex, y0 + lift, sz * ez], tp = [sx * Math.max(tx, 0.001), hipTop, sz * Math.max(tz, 0.001)];
      g.add(beam(hp, [lerp(hp[0], tp[0], 1), lerp(hp[1], tp[1], 1) + 0.05, lerp(hp[2], tp[2], 1)], 0.26, 0.22, M.creamD));
    }
    return g;
  }

  // -------------------------------------------------------------- gables: chidori (triangle) and kara (curved)
  const PROFILES = {
    tri: [[0, 1], [1, 0]],
    kara: [[0, 1], [0.12, 0.97], [0.25, 0.88], [0.4, 0.68], [0.55, 0.5], [0.7, 0.37], [0.82, 0.32], [0.92, 0.36], [1, 0.48]],
  };
  function gable({ W, rise, depth, roofH = 0, roofRun = 1, type = 'tri', o = 0.75, pow = 1.5, flat = false }){
    const g = new THREE.Group();
    const half = [...PROFILES[type]];
    const L = half.slice().reverse().map(([u, v]) => [-u * W / 2, v * rise]);
    const Rr = half.slice(1).map(([u, v]) => [u * W / 2, v * rise]);
    const pts = L.concat(Rr); // left end → apex → right end
    const K = 7;
    const dy = (d) => flat ? 0 : roofH * Math.pow(Math.min(1, d / roofRun), pow);
    const rp = pts.map(([x, y], k) => {
      const isEnd = (k === 0 || k === pts.length - 1);
      const xx = x * (1 + 2 * o / W) + (isEnd ? Math.sign(x) * 0.0 : 0);
      return [xx, y + (y > 0.001 ? o * 0.55 : -0.2) + (isEnd && y > 0.001 ? 0 : 0)];
    });
    // roof planes
    const pos = [], uv = [], idx = [];
    for (let k = 0; k < rp.length; k++){
      for (let s = 0; s <= K; s++){
        const d = depth * s / K;
        pos.push(rp[k][0], rp[k][1] + dy(d) + (flat ? 0 : 0), -d + 0.4);
        uv.push(k * 1.2, s * depth / K / 3);
      }
    }
    for (let k = 0; k < rp.length - 1; k++) for (let s = 0; s < K; s++){
      const a = k * (K + 1) + s, b = a + 1, c = a + K + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const rm = new THREE.Mesh(geo, M.tile); rm.castShadow = rm.receiveShadow = true; g.add(rm);
    // the plaster face
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, 0);
    for (const [x, y] of pts) shape.lineTo(x, y);
    shape.lineTo(W / 2, 0); shape.closePath();
    const fgeo = new THREE.ShapeGeometry(shape);
    const fp = fgeo.attributes.position, fuv = fgeo.attributes.uv;
    for (let i = 0; i < fp.count; i++) fuv.setXY(i, fp.getX(i) / W + 0.5, fp.getY(i) / rise);
    const face = new THREE.Mesh(fgeo, M.gableFace); face.position.z = 0.1; face.castShadow = true; g.add(face);
    // bargeboards along the front edge
    for (let k = 0; k < rp.length - 1; k++){
      const bar = beam([rp[k][0], rp[k][1], 0.45], [rp[k + 1][0], rp[k + 1][1], 0.45], 0.5, 0.62, M.cream);
      bar.castShadow = true; g.add(bar);
    }
    // gegyo plate under the apex, base beam
    const apex = rp[Math.floor(rp.length / 2)];
    g.add(box(1.0, 1.05, 0.22, M.cream, 0, apex[1] - 0.95, 0.5));
    g.add(box(W + 0.4, 0.34, 0.3, M.dark, 0, 0.16, 0.2));
    return g;
  }

  // -------------------------------------------------------------- windows and awnings
  // On the real keep the walls are black boards with dark windows; a long dark louvred awning
  // shades each row of them. Only the watch floor has light window frames.
  function windowsOn(g, { n, ww, wh, y, gap, light = false, awn = true }){
    const total = n * ww + (n - 1) * gap;
    for (let i = 0; i < n; i++){
      const x = -total / 2 + ww / 2 + i * (ww + gap);
      g.add(box(ww + 0.22, wh + 0.22, 0.1, light ? M.creamD : M.frameD, x, y, 0.04));
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), light ? M.win(Math.round(ww * 1.6), Math.round(wh * 1.6)) : M.winDark(Math.round(ww * 1.2), Math.round(wh * 1.2)));
      pane.position.set(x, y, 0.1); g.add(pane);
    }
    if (awn) awning(g, { x: 0, y: y + wh / 2 + 0.42, w: total + 1.2, d: 1.0, h: 0.55, mat: M.awn });
  }
  function awning(g, { x, y, w, d = 1.15, h = 0.62, mat = M.awn }){
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(d, -h); shape.lineTo(d, -h - 0.16); shape.lineTo(0, -0.18); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2); geo.translate(w / 2, 0, 0);
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0.02); m.castShadow = true; g.add(m);
  }

  // -------------------------------------------------------------- a tower of tiers
  // spec.tiers: bodies with the roof that sits on them; spec.top: the hip-and-gable crown
  function tower(spec){
    const g = new THREE.Group();
    let y = 0;
    const tiers = spec.tiers;
    tiers.forEach((t, i) => {
      const wallMats = [M.wall(t.d, t.h), M.wall(t.d, t.h), M.dark, M.dark, M.wall(t.w, t.h), M.wall(t.w, t.h)];
      const body = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), wallMats);
      body.position.y = y + t.h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
      // plaster plinth at the foot and a plaster band under the eaves
      const band = t.band ?? 1.7;
      if (band > 0) g.add(box(t.w + 0.14, band, t.d + 0.14, M.cream, 0, y + t.h - band / 2, 0));
      // pent skirt around the foot / small eave ring part-way up (the hisashi)
      for (const sk of [t.skirt, t.eaves]){
        if (!sk) continue;
        g.add(roofGroup({ ex: t.w / 2 + sk.o, ez: t.d / 2 + sk.o, tx: t.w / 2 + 0.04, tz: t.d / 2 + 0.04, y0: y + sk.y, h: sk.rise, lift: 0.5, fascia: 0.38, pow: 1.1 }));
      }
      for (const face of ['z+', 'z-', 'x+', 'x-']){
        let spec2 = t.win?.[face];
        if (!spec2 && t.winAll){
          const a = t.winAll, len = face[0] === 'z' ? t.w : t.d, edge = a.edge ?? 1.2;
          const n = Math.max(1, Math.floor((len - 2 * edge + a.gap) / (a.ww + a.gap)));
          spec2 = { n, ww: a.ww, wh: a.wh, y: a.y, gap: a.gap, light: !!a.light, awn: !a.light };
        }
        if (!spec2) continue;
        const fg = faceAt(face, t.w / 2, t.d / 2, 0); fg.position.y = y;
        windowsOn(fg, spec2);
        (t.awnings?.[face] || []).forEach((a) => awning(fg, a));
        g.add(fg);
      }
      y += t.h;
      if (t.roof){
        const next = tiers[i + 1];
        const lr = spec.top?.ring ?? spec.ring;
        const ring = next ? { tx: next.w / 2 + 0.06, tz: next.d / 2 + 0.06 } : { tx: lr[0], tz: lr[1] };
        const ex = t.w / 2 + t.roof.o, ez = t.d / 2 + t.roof.o;
        const rg = roofGroup({ ex, ez, tx: ring.tx, tz: ring.tz, y0: y, h: t.roof.rise, lift: t.roof.lift ?? 0.6 });
        g.add(rg);
        for (const gb of t.roof.gables || []){
          const run = gb.side[0] === 'z' ? ez - ring.tz : ex - ring.tx;
          const gm = gable({ W: gb.W, rise: gb.rise, depth: run * 0.95, roofH: t.roof.rise, roofRun: run, type: gb.type || 'tri' });
          const fg = faceAt(gb.side, ex, ez, y);
          gm.position.x = gb.x || 0; gm.position.y = 0.05;
          fg.add(gm); g.add(fg);
        }
        y += t.roof.rise;
      }
    });
    // the crown: truncated hip roof topped by a gable roof running front to back
    if (spec.top){
      const tp = spec.top, last = tiers[tiers.length - 1];
      const ex = last.w / 2 + tp.o, ez = last.d / 2 + tp.o;
      g.add(roofGroup({ ex, ez, tx: tp.ring[0], tz: tp.ring[1], y0: y, h: tp.rise, lift: 0.7, fascia: 0.55 }));
      const yb = y + tp.rise;
      for (const sd of [1, -1]){
        const gm = gable({ W: tp.ring[0] * 2, rise: tp.gableRise, depth: tp.ring[1] * 2 + 0.2, flat: true, o: 0.9 });
        const grp = new THREE.Group();
        grp.position.set(0, yb - 0.1, sd * (tp.ring[1] + 0.15));
        if (sd < 0) grp.rotation.y = Math.PI;
        grp.add(gm); g.add(grp);
        // shachihoko on each ridge end
        const sh = shachi(); sh.position.set(0, yb + tp.gableRise + 0.45, sd * (tp.ring[1] + 0.35));
        if (sd < 0) sh.rotation.y = Math.PI;
        g.add(sh);
      }
      // ridge cap running front to back
      g.add(box(0.5, 0.42, tp.ring[1] * 2 + 1.2, M.creamD, 0, yb + tp.gableRise + 0.62, 0));
      y = yb + tp.gableRise;
    }
    g.userData.height = y;
    return g;
  }

  function shachi(){
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.25), new THREE.Vector3(0, 0.25, 0.1), new THREE.Vector3(0, 0.7, 0.2),
      new THREE.Vector3(0, 1.15, 0.0), new THREE.Vector3(0, 1.55, -0.25), new THREE.Vector3(0, 1.95, -0.1),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.17, 8), M.gold); tube.castShadow = true;
    g.add(tube);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), M.gold); head.position.set(0, 0.0, 0.25); head.scale.set(0.9, 1, 1.2); g.add(head);
    for (const s of [-1, 1]){ const fin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 5), M.gold); fin.position.set(s * 0.2, 0.7, 0.05); fin.rotation.z = -s * 0.9; g.add(fin); }
    g.scale.setScalar(0.9);
    return g;
  }

  // ================================================================== the Daitenshu (main keep)
  const dai = new THREE.Group();
  const daiBase = stoneBlock({ cx: 0, cz: 0, hx: 10.9, hz: 9.2, y0: GROUND, y1: 0, inset: 3.2 });
  dai.add(daiBase);
  const daiTower = tower({
    tiers: [
      { // floors 1-2: the wide black body, with a pent skirt around its foot
        w: 21.0, d: 17.6, h: 7.0, skirt: { y: 1.7, o: 1.6, rise: 0.9 },
        winAll: { ww: 2.3, wh: 1.5, y: 3.4, gap: 0.5 },
        roof: { o: 2.3, rise: 2.5, gables: [{ side: 'z+', x: -3.2, W: 10.4, rise: 2.9 }, { side: 'z-', x: 0, W: 10.4, rise: 2.9 }, { side: 'x-', x: 0, W: 8.4, rise: 2.6 }, { side: 'x+', x: 0, W: 8.4, rise: 2.6 }] },
      },
      { // floors 3-4, with its own small eave ring (the hisashi)
        w: 15.2, d: 12.4, h: 5.8, eaves: { y: 3.7, o: 1.4, rise: 0.7 },
        winAll: { ww: 2.1, wh: 1.2, y: 2.0, gap: 0.5 },
        roof: { o: 2.0, rise: 2.0, gables: [{ side: 'z+', x: 0, W: 8.6, rise: 3.0 }, { side: 'z-', x: 0, W: 8.6, rise: 3.0 }, { side: 'x-', x: 0, W: 5.6, rise: 2.3, type: 'kara' }, { side: 'x+', x: 0, W: 5.6, rise: 2.3, type: 'kara' }] },
      },
      { // floor 5
        w: 11.2, d: 9.2, h: 4.6, eaves: { y: 2.9, o: 1.2, rise: 0.6 },
        winAll: { ww: 2.0, wh: 1.1, y: 1.6, gap: 0.55 },
        roof: { o: 1.7, rise: 1.7, gables: [{ side: 'z+', x: 0, W: 5.2, rise: 2.1, type: 'kara' }, { side: 'z-', x: 0, W: 5.2, rise: 2.1, type: 'kara' }, { side: 'x-', x: 0, W: 4.6, rise: 2.0 }, { side: 'x+', x: 0, W: 4.6, rise: 2.0 }] },
      },
      { // floor 6: the watch floor, ringed by windows
        w: 7.6, d: 6.6, h: 3.2, band: 0.5,
        winAll: { ww: 1.25, wh: 1.7, y: 1.7, gap: 0.3, edge: 0.7, light: true },
      },
    ],
    top: { o: 2.4, rise: 1.9, ring: [2.6, 2.9], gableRise: 2.7 },
  });
  daiTower.position.y = 0;
  dai.add(daiTower);

  // entrance: a black timber gate hall with a pent roof, and a stair up to it
  {
    const z0 = daiBase.userData.wallZ(GROUND + 2.3);
    const gate = new THREE.Group(); gate.position.set(-4.9, GROUND + 1.8, z0 + 0.3);
    gate.add(box(5.4, 5.6, 3.0, M.wall(5.4, 5.6), 0, 2.8, -0.6));
    gate.add(box(3.5, 4.2, 0.2, M.black, 0, 2.2, 0.95));
    gate.add(box(4.1, 0.34, 0.5, M.cream, 0, 4.5, 1.0));
    gate.add(box(0.28, 4.3, 0.5, M.creamD, -1.9, 2.2, 1.0));
    gate.add(box(0.28, 4.3, 0.5, M.creamD, 1.9, 2.2, 1.0));
    const pent = roofGroup({ ex: 3.5, ez: 2.5, tx: 2.8, tz: 1.0, y0: 5.5, h: 1.3, lift: 0.4, fascia: 0.35 }); pent.position.z = -0.5; gate.add(pent);
    dai.add(gate);
    // stair: eight treads from the ground to the sill
    for (let i = 0; i < 8; i++){
      const st = box(3.6, 0.3 * (i + 1) + 0.05, 0.55, M.cap, -4.9, GROUND + (0.3 * (i + 1) + 0.05) / 2, z0 + 3.3 - i * 0.5);
      st.receiveShadow = true; dai.add(st);
    }
    for (const sx of [-6.85, -2.95]){
      dai.add(beam([sx, GROUND + 0.9, z0 + 3.6], [sx, GROUND + 2.7, z0 + 0.1], 0.14, 0.14, M.iron));
      for (let k = 0; k < 4; k++){ const p = k / 3; dai.add(box(0.12, 0.9, 0.12, M.iron, sx, lerp(GROUND + 0.45, GROUND + 2.25, p) + 0.4, lerp(z0 + 3.6, z0 + 0.1, p))); }
    }
  }
  root.add(dai);

  // ================================================================== the connecting hall
  const HX = 17.4;
  const hallBase = stoneBlock({ cx: HX, cz: -1.8, hx: 5.0, hz: 5.2, y0: GROUND, y1: -3.5, inset: 1.8 });
  root.add(hallBase);
  {
    const hall = tower({
      tiers: [{
        w: 14.0, d: 8.0, h: 4.0,
        winAll: { ww: 2.2, wh: 1.4, y: 2.3, gap: 0.5 },
        roof: { o: 1.9, rise: 2.6, gables: [{ side: 'z+', x: 2.0, W: 5.0, rise: 2.0 }] },
      }],
      ring: [3.6, 0.1],
    });
    hall.position.set(HX, -3.5, -1.8);
    root.add(hall);
  }

  // ================================================================== the Shotenshu (small keep)
  const SX = 25.6, SZ = -3.8;
  const shoBase = stoneBlock({ cx: SX, cz: SZ, hx: 6.2, hz: 5.4, y0: GROUND, y1: -3.5, inset: 3.0 });
  root.add(shoBase);
  const sho = tower({
    tiers: [
      {
        w: 11.4, d: 9.6, h: 3.8, skirt: { y: 1.3, o: 1.2, rise: 0.7 },
        winAll: { ww: 2.0, wh: 1.3, y: 2.4, gap: 0.5 },
        roof: { o: 2.2, rise: 2.4, gables: [{ side: 'z+', x: 0, W: 5.8, rise: 2.5 }, { side: 'x+', x: 0, W: 4.8, rise: 2.0, type: 'kara' }, { side: 'x-', x: 0, W: 4.8, rise: 2.0, type: 'kara' }] },
      },
      {
        w: 7.8, d: 6.6, h: 3.2, eaves: { y: 1.3, o: 1.0, rise: 0.6 },
        winAll: { ww: 1.7, wh: 1.2, y: 2.3, gap: 0.5 },
        roof: { o: 1.9, rise: 1.8, gables: [{ side: 'z+', x: 0, W: 3.8, rise: 1.7 }] },
      },
      {
        w: 5.0, d: 4.4, h: 2.8, band: 0.4,
        winAll: { ww: 1.0, wh: 1.4, y: 1.5, gap: 0.25, edge: 0.5, light: true },
      },
    ],
    top: { o: 2.0, rise: 1.5, ring: [1.6, 1.7], gableRise: 2.0 },
  });
  sho.position.set(SX, -3.5, SZ);
  root.add(sho);
  // shinobi-gaeshi: iron spikes above the small keep's stone wall
  for (let i = 0; i < 26; i++){
    const a = -5.3 + i * 0.41;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 4), M.iron); spike.position.set(SX + a, -3.2, SZ + 5.2); root.add(spike);
  }

  // ================================================================== the wooden bridge to the right
  {
    const bridge = new THREE.Group();
    const x0 = SX + 6.0, x1 = x0 + 24, yA = -3.5, yB = GROUND + 0.4, z = SZ + 2.2;
    const len = Math.hypot(x1 - x0, yB - yA);
    const deck = box(len, 0.35, 3.4, M.wood, 0, 0, 0);
    deck.receiveShadow = true;
    const ang = Math.atan2(yB - yA, x1 - x0);
    const holder = new THREE.Group(); holder.add(deck);
    for (const sz of [-1, 1]){
      holder.add(box(len, 0.1, 0.14, M.iron, 0, 1.1, sz * 1.62));
      holder.add(box(len, 0.1, 0.14, M.iron, 0, 0.6, sz * 1.62));
      for (let i = 0; i <= Math.floor(len / 2); i++) holder.add(box(0.12, 1.15, 0.12, M.iron, -len / 2 + i * 2, 0.55, sz * 1.62));
    }
    holder.rotation.z = ang; holder.position.set((x0 + x1) / 2, (yA + yB) / 2 - 0.2, z);
    bridge.add(holder);
    for (const t of [0.15, 0.4, 0.65, 0.9]){
      const px = lerp(x0, x1, t), py = lerp(yA, yB, t);
      const pier = box(0.5, py - GROUND, 3.0, M.stone, px, (py + GROUND) / 2 - 0.3, z); pier.material = M.stone;
      bridge.add(pier);
    }
    root.add(bridge);
  }

  // ================================================================== fence in the foreground
  {
    const fence = new THREE.Group();
    const post = new THREE.BoxGeometry(0.22, 1.5, 0.22);
    for (const [xa, za, xb, zb] of [[-27, 17, -7.5, 19.4], [-7.5, 19.4, 19, 18.6]]){
      const n = Math.round(Math.hypot(xb - xa, zb - za) / 2.2);
      for (let i = 0; i <= n; i++){
        const p = new THREE.Mesh(post, M.wood); p.position.set(lerp(xa, xb, i / n), GROUND + 0.75, lerp(za, zb, i / n)); p.castShadow = true; fence.add(p);
      }
      for (const yy of [0.55, 1.2]) fence.add(beam([xa, GROUND + yy, za], [xb, GROUND + yy, zb], 0.1, 0.12, M.wood));
    }
    root.add(fence);
  }

  // ================================================================== ground
  const groundTex = T.sand.clone(); groundTex.repeat.set(14, 14); groundTex.needsUpdate = true;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(82, 72), new THREE.MeshStandardMaterial({
    map: groundTex, roughness: 1, transparent: true,
    alphaMap: canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w / 2); gr.addColorStop(0, '#fff'); gr.addColorStop(0.62, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { srgb: false }),
  }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(20, GROUND - 0.02, 4); ground.receiveShadow = true;
  root.add(ground);

  root.traverse((o) => { if (o.isMesh && !o.userData.noShadow){ o.castShadow = o.castShadow || false; } });
  root.userData.center = new THREE.Vector3(18, 2, 0);
  root.userData.GROUND = GROUND;
  return root;
}
