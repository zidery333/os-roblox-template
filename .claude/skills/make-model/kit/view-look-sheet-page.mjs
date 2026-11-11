// Look sheet page: several .glb models in one spinnable row on white, toon-lit along the baked LIGHT, a grey 5-tall player beside each,
// a big label and a Download button over each (saves a .zip holding the .glb: published pages may hand out .zip, not .glb), notes under it.
// Run: node view-look-sheet-page.mjs config.json out.html
// config: { title, heading, sub, models: [{ id, label, tag, file, extra?, tris?, size? }], lines: [[label, text]], changed: [text], light: [x,y,z] }
// Screenshot hooks: ?view=three|front|side|top|eye  &focus=<id>  &ang=<deg> (eye)  &cam=x,y,z&tgt=x,y,z (relative to model <focus>)
import fs from 'fs';
import { FIT_CORNERS_JS } from './fit-corners.mjs';

const [cfgFile, outFile] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const b64 = (f) => fs.readFileSync(f).toString('base64');
const models = cfg.models.map((m) => ({ ...m, glb: b64(m.file), extraGlb: m.extra ? b64(m.extra) : null, fileName: m.file.split('/').pop() }));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const J = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';

const html = `<title>${esc(cfg.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
/* Layout: one wide white stage holding the row of models, a button bar under it, then short notes. A single light look on purpose (the models are judged on white). */
:root {
  --paper: #ffffff; --ink: #1e191b; --muted: #6a6266; --line: #e6e1dc; --chip: #f4f1ee; --accent: #e8743b; --accent-ink: #8a3a17;
  --display: "Fredoka", "Trebuchet MS", system-ui, sans-serif; --body: "Atkinson Hyperlegible", system-ui, -apple-system, sans-serif;
  color-scheme: light;
}
body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.5; }
.wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 14px 28px; display: grid; gap: 12px; }
header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
h1 { font-family: var(--display); font-weight: 700; font-size: 1.6rem; margin: 0; letter-spacing: 0.01em; text-wrap: balance; }
h1 span { color: var(--accent); }
.sub { color: var(--muted); margin: 0; }
#stage { position: relative; width: 100%; height: min(72vh, 760px); min-height: 380px; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--paper); touch-action: none; }
#view { display: block; width: 100%; height: 100%; }
#tags { position: absolute; inset: 0; pointer-events: none; }
.tag { position: absolute; transform: translate(-50%, -100%); display: grid; justify-items: center; gap: 4px; pointer-events: auto; }
.tag .big { font-family: var(--display); font-weight: 700; font-size: clamp(1.4rem, 2.6vw, 2.4rem); line-height: 1; background: none; border: 0; color: var(--ink); cursor: pointer; padding: 0 4px; }
.tag .what { font-size: 0.78rem; color: var(--muted); white-space: nowrap; }
.tag button.dl { font: 600 0.78rem var(--body); color: var(--accent-ink); background: #fff; border: 1.5px solid var(--accent); border-radius: 999px; padding: 3px 10px; cursor: pointer; white-space: nowrap; }
.tag button.dl:hover { background: #fff3ec; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.bar { display: flex; flex-wrap: wrap; gap: 8px; }
.bar button { font: 600 0.9rem var(--body); border: 1.5px solid var(--ink); background: var(--paper); color: var(--ink); border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.bar button[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
#msg { min-height: 1.4em; color: var(--accent-ink); font-size: 0.9rem; margin: 0; }
.notes { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); align-items: start; }
.notes h2 { font-family: var(--display); font-weight: 600; font-size: 1.1rem; margin: 0 0 6px; }
.notes ul { margin: 0; padding-left: 0; list-style: none; display: grid; gap: 6px; }
.notes li { min-width: 0; }
.notes li b { font-family: var(--display); font-weight: 700; display: inline-block; min-width: 4.6em; }
.notes .n { color: var(--muted); font-size: 0.82rem; font-variant-numeric: tabular-nums; }
.changed li { padding-left: 1em; text-indent: -1em; }
.changed li::before { content: "– "; color: var(--muted); }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
</style>
<div class="wrap">
  <header><h1>${cfg.heading}</h1><p class="sub">${esc(cfg.sub)}</p></header>
  <div id="stage"><canvas id="view"></canvas><div id="tags"></div></div>
  <div class="bar" role="group" aria-label="Camera">
    <button id="b-three" aria-pressed="true">Three-quarter</button>
    <button id="b-front" aria-pressed="false">Front</button>
    <button id="b-side" aria-pressed="false">Side</button>
    <button id="b-top" aria-pressed="false">From above</button>
    <button id="b-eye" aria-pressed="false">Player's eye</button>
  </div>
  <p id="msg" role="status"></p>
  <div class="notes">
    <section><h2>What makes each one different</h2><ul>
      ${cfg.lines.map(([l, t, n]) => `<li><b>${esc(l)}</b> ${esc(t)}${n ? ` <span class="n">${esc(n)}</span>` : ''}</li>`).join('\n      ')}
    </ul></section>
    ${cfg.changed?.length ? `<section class="changed"><h2>What I changed</h2><ul>${cfg.changed.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
  </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="${J}loaders/GLTFLoader.js"></script>
<script src="${J}controls/OrbitControls.js"></script>
<script>
const MODELS = ${JSON.stringify(models.map(({ id, label, tag, glb, extraGlb, fileName }) => ({ id, label, tag, glb, extraGlb, fileName })))};
const LIGHT = new THREE.Vector3(${(cfg.light || [-0.3, 0.85, -0.45]).join(', ')}).normalize();
${FIT_CORNERS_JS}
const bytes = (b) => { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
const q = new URLSearchParams(location.search);
const canvas = document.getElementById('view'), stage = document.getElementById('stage'), tagsEl = document.getElementById('tags'), msg = document.getElementById('msg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 6000);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xfff6ea, 0.52); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.25; sun.shadow.radius = 2;
scene.add(sun, sun.target);
// strong key: full light on the lit side, the sun gone on the shadow side (the baked bands add the middle and the highlight)
const gd = new Uint8Array(4 * 4); [0, 0, 255, 255].forEach((v, i) => gd.set([v, v, v, 255], i * 4));
const grad = new THREE.DataTexture(gd, 4, 1, THREE.RGBAFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.2 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), shadowMat); ground.rotation.x = -Math.PI / 2; ground.position.y = 0.02; ground.receiveShadow = true; scene.add(ground);
const controls = new THREE.OrbitControls(camera, canvas); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - 0.01;
function toonify(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const map = o.material.map;
    if (/^Outline_/.test(o.name)) { o.material = new THREE.MeshBasicMaterial({ map }); o.castShadow = false; o.receiveShadow = false; return; }
    if (/^Glow_/.test(o.name)) { o.material = new THREE.MeshBasicMaterial({ map }); o.castShadow = true; return; }
    o.material = new THREE.MeshToonMaterial({ map, gradientMap: grad }); o.castShadow = true; o.receiveShadow = false; // no self-shadow: a shadow map edge zigzags across faces
  });
}
// the grey 5-tall player: blocky, outlined
function player() {
  const g = new THREE.Group(), mat = new THREE.MeshToonMaterial({ color: new THREE.Color(0x8a8a8a).convertSRGBToLinear(), gradientMap: grad }), ink = new THREE.MeshBasicMaterial({ color: 0x1e191b, side: THREE.BackSide });
  const box = (w, h, d, x, y, z) => { const geo = new THREE.BoxGeometry(w, h, d), m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; const o = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, d + 0.16), ink); o.position.copy(m.position); g.add(m, o); };
  box(0.95, 2, 1, -0.5, 1, 0); box(0.95, 2, 1, 0.5, 1, 0); box(2, 2, 1, 0, 3, 0); box(0.9, 2, 0.95, -1.5, 3, 0); box(0.9, 2, 0.95, 1.5, 3, 0); box(1.1, 1, 1.05, 0, 4.5, 0);
  g.name = 'Player'; return g;
}
function contactShadow(root) {
  // gather every surface point within 1 stud of the floor (outlines skipped), draw them as soft dark dots on a canvas seen from above, blur it
  root.updateMatrixWorld(true);
  const pts = [], v = new THREE.Vector3(), inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  root.traverse((o) => { if (!o.isMesh || /^Outline_/.test(o.name) || o.parent?.name === 'Player') return; const P = o.geometry.attributes.position;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); if (v.y < 1.0) pts.push(v.clone().applyMatrix4(inv)); } });
  const g = new THREE.Group(); if (!pts.length) return g;
  const b = new THREE.Box3().setFromPoints(pts); b.expandByScalar(3);
  const W = b.max.x - b.min.x, D = b.max.z - b.min.z, px = 4, cw = Math.ceil(W * px), ch = Math.ceil(D * px);
  const c1 = document.createElement('canvas'); c1.width = cw; c1.height = ch; const x1 = c1.getContext('2d');
  x1.fillStyle = 'rgba(20,16,18,0.16)';
  for (const p of pts) { const r = (1.0 - p.y) * 1.3 + 0.6; x1.beginPath(); x1.arc((p.x - b.min.x) * px, (p.z - b.min.z) * px, r * px, 0, Math.PI * 2); x1.fill(); }
  const c2 = document.createElement('canvas'); c2.width = cw; c2.height = ch; const x2 = c2.getContext('2d'); x2.filter = 'blur(' + (1.4 * px) + 'px)'; x2.drawImage(c1, 0, 0);
  const tex = new THREE.CanvasTexture(c2); tex.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 }));
  m.rotation.x = -Math.PI / 2; m.position.set((b.min.x + b.max.x) / 2, 0.03, (b.min.z + b.max.z) / 2); m.renderOrder = 1; m.name = 'ContactShadow';
  g.add(m); return g;
}
const loader = new THREE.GLTFLoader(), parse = (b) => new Promise((ok, no) => loader.parse(bytes(b).buffer, '', ok, no));
const row = [];
(async () => {
  for (const m of MODELS) {
    const g = await parse(m.glb), holder = new THREE.Group(); toonify(g.scene); holder.add(g.scene);
    if (m.extraGlb) { const e = await parse(m.extraGlb); toonify(e.scene); holder.add(e.scene); }
    const box = new THREE.Box3().setFromObject(g.scene);
    row.push({ m, holder, box });
  }
  // left to right as seen from the front: start at +X and step towards -X
  const GAP = 30; let x = 0;
  for (const r of row) {
    const w = r.box.max.x - r.box.min.x; r.cx = x - w / 2; r.holder.position.x = r.cx; x -= w + GAP;
    const p = player(); p.position.set(r.box.min.x - 6, 0, (r.box.min.z + r.box.max.z) / 2 - 18); p.rotation.y = Math.PI; r.holder.add(p); r.player = p;
    scene.add(r.holder);
    r.wbox = new THREE.Box3().setFromObject(r.holder);
    r.holder.add(contactShadow(r.holder)); // a soft dark shadow hugging every place she touches the floor
    const t = document.createElement('div'); t.className = 'tag';
    t.innerHTML = '<button class="big" title="Zoom to this one">' + r.m.label + '</button><span class="what">' + r.m.tag + '</span><button class="dl">Download .glb</button>';
    t.querySelector('.big').onclick = () => focus(r.m.id);
    t.querySelector('.dl').onclick = () => save(r.m);
    tagsEl.appendChild(t); r.tag = t;
  }
  const all = new THREE.Box3(); row.forEach((r) => all.union(r.wbox));
  const c = all.getCenter(new THREE.Vector3()), s = all.getSize(new THREE.Vector3()), rad = s.length() / 2;
  sun.position.copy(c).addScaledVector(LIGHT, rad * 2); sun.target.position.copy(c);
  Object.assign(sun.shadow.camera, { left: -rad, right: rad, top: rad, bottom: -rad, near: 1, far: rad * 5 }); sun.shadow.camera.updateProjectionMatrix();
  resize(); start();
  window.ready = true;
})().catch((e) => { msg.textContent = 'The models did not load: ' + e.message; });

const byId = (id) => row.find((r) => r.m.id === id) || row[0];
const DIRS = { three: [0.1, 0.5, -0.86], q3: [0.3, 0.45, -0.84], front: [0, 0.2, -1], side: [-1, 0.22, -0.02], top: [0.0001, 1, -0.25] };
function view(k) {
  for (const b of ['three', 'front', 'side', 'top', 'eye']) document.getElementById('b-' + b).setAttribute('aria-pressed', String(b === k));
  if (k === 'eye') return eye(row[0].m.id, 30);
  const grp = new THREE.Group(); // fit every model's own points
  camera.up.set(0, 1, 0);
  const root = new THREE.Group(); row.forEach((r) => root.add(r.holder)); scene.add(root);
  fitCorners(camera, controls, root, DIRS[k], 0.8, 0.62);
  row.forEach((r) => scene.add(r.holder)); scene.remove(root); void grp;
}
function focus(id, dir = DIRS.q3) { const r = byId(id); fitCorners(camera, controls, r.holder, dir, 0.75, 0.62); }
function eye(id, ang) {
  const r = byId(id), b = r.wbox, cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2, a = ang * Math.PI / 180, d = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) * 0.62 + 30;
  camera.position.set(cx + Math.sin(a) * d, 4.5, cz - Math.cos(a) * d); controls.target.set(cx, 14, cz); camera.lookAt(controls.target);
  camera.near = 0.5; camera.far = 4000; camera.updateProjectionMatrix();
}
function start() {
  const f = q.get("focus");
  if (q.get("solo")) row.forEach((r) => { r.holder.visible = r.m.id === f; r.tag.style.display = r.m.id === f ? "" : "none"; });
  if (q.get('cam')) {
    const r = byId(f), o = new THREE.Vector3(r.cx, 0, 0), cp = q.get('cam').split(',').map(Number), tp = (q.get('tgt') || '0,10,0').split(',').map(Number);
    camera.position.set(cp[0], cp[1], cp[2]).add(o); controls.target.set(tp[0], tp[1], tp[2]).add(o); camera.near = 0.3; camera.far = 4000; camera.fov = +(q.get('fov') || 28); camera.updateProjectionMatrix(); camera.lookAt(controls.target);
  } else if (q.get('view') === 'eye') eye(f || 'A', +(q.get('ang') || 30));
  else if (f) focus(f, DIRS[q.get('view')] || DIRS.q3);
  else view(q.get('view') && DIRS[q.get('view')] ? q.get('view') : 'three');
}
for (const k of ['three', 'front', 'side', 'top', 'eye']) document.getElementById('b-' + k).onclick = () => view(k);

// ---- saving: a .zip holding the .glb (store only), through the viewer's save prompt; a plain link when opened as a file ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function zipOne(name, data) {
  let crc = 0xffffffff; for (let i = 0; i < data.length; i++) crc = CRC[(crc ^ data[i]) & 0xff] ^ (crc >>> 8); crc = (crc ^ 0xffffffff) >>> 0;
  const nm = new TextEncoder().encode(name), lh = new DataView(new ArrayBuffer(30)), ch = new DataView(new ArrayBuffer(46)), end = new DataView(new ArrayBuffer(22));
  [[0, 0x04034b50, 4], [4, 20, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 0x21, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, nm.length, 2], [28, 0, 2]].forEach(([o, v, n]) => n === 4 ? lh.setUint32(o, v, true) : lh.setUint16(o, v, true));
  [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0, 2], [10, 0, 2], [12, 0, 2], [14, 0x21, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, nm.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, 0, 4]].forEach(([o, v, n]) => n === 4 ? ch.setUint32(o, v, true) : ch.setUint16(o, v, true));
  const cdOff = 30 + nm.length + data.length;
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, 1, 2], [10, 1, 2], [12, 46 + nm.length, 4], [16, cdOff, 4], [20, 0, 2]].forEach(([o, v, n]) => n === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true));
  return new Blob([lh.buffer, nm, data, ch.buffer, nm, end.buffer]);
}
let dlCap; const dlReady = (window.claude && window.claude.use) ? window.claude.use('downloads').then((d) => { dlCap = d; }).catch(() => { dlCap = null; }) : Promise.resolve();
async function save(m) {
  const data = bytes(m.glb);
  await dlReady;
  if (dlCap) {
    try { await dlCap.save({ filename: m.fileName.replace(/\\.glb$/, '.zip'), data: zipOne(m.fileName, data) }); msg.textContent = 'Saved ' + m.fileName.replace(/\\.glb$/, '.zip') + ' (the .glb is inside).'; }
    catch (e) { msg.textContent = e && e.code === 'declined' ? 'Not saved.' : 'This viewer could not save the file (' + (e && e.code || 'error') + ').'; }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' })); a.download = m.fileName; document.body.appendChild(a); a.click(); a.remove();
  msg.textContent = 'Saving ' + m.fileName + '.';
}

function placeTags() {
  const w = stage.clientWidth, h = stage.clientHeight, v = new THREE.Vector3();
  for (const r of row) {
    const b = r.wbox; v.set((b.min.x + b.max.x) / 2, b.max.y + 2, (b.min.z + b.max.z) / 2).project(camera);
    r.tag.hidden = v.z > 1 || Math.abs(v.x) > 1.05 || v.y > 1.2 || v.y < -1.05;
    r.tag.style.left = ((v.x + 1) / 2 * w) + 'px'; r.tag.style.top = Math.max(70, (1 - v.y) / 2 * h) + 'px';
  }
}
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', () => { resize(); });
(function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); if (window.ready) placeTags(); })();
</script>
`;
fs.writeFileSync(outFile, html);
console.log('wrote', outFile, (fs.statSync(outFile).size / 1e6).toFixed(2), 'MB');
