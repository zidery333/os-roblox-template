// Writes a one-file view of a style test sheet: the .glb's top-level groups in a row in a 3D viewer (white, soft light and shadow, spin and zoom,
// a label under each group (every other one a row lower), buttons for three-quarter, front and straight top-down), a line of each group's size and triangles, and a picture under it
// on a light checkerboard. Everything is inside the page (three r128 from cdnjs, the .glb and the PNG as base64). Open with ?view=top or ?view=front to start there.
// Run: node view-sheet-page.mjs sheet.glb picture.png out.html "Page title" "Picture caption" '{"Tower":"Watch tower",...}'   (needs three@0.170.0 for the sizes)
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const [glb, png, out, title, caption, labelsJson = '{}'] = process.argv.slice(2);
const LABELS = JSON.parse(labelsJson);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// sizes and triangles per group, measured here so the page shows the real numbers
const buf = fs.readFileSync(glb);
const gltf = await new Promise((res, rej) => new GLTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej));
gltf.scene.updateMatrixWorld(true);
const top = gltf.scene.children.length === 1 && !gltf.scene.children[0].isMesh ? gltf.scene.children[0] : gltf.scene;
const rows = top.children.filter((o) => !o.isMesh).map((grp) => {
	const box = new THREE.Box3(); let tris = 0;
	grp.traverse((o) => { if (!o.isMesh || o.name.startsWith('Outline_')) { if (o.isMesh) tris += o.geometry.attributes.position.count / 3; return; }
		tris += o.geometry.attributes.position.count / 3; o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); });
	const s = box.getSize(new THREE.Vector3());
	return { name: grp.name, label: LABELS[grp.name] || grp.name, size: [s.x, s.y, s.z].map((v) => +v.toFixed(1)), tris };
});
const totalTris = rows.reduce((a, r) => a + r.tris, 0);
const fmt = (n) => n.toLocaleString('en-GB');

fs.writeFileSync(out, `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap">
<style>
/* Layout: one white stage for the 3D row on top, the numbers in a strip under it, the button picture on its checkerboard below. One light look on purpose: the models are judged on white. */
:root {
  --paper: #ffffff; --ink: #141418; --soft: #5d6068; --line: #e6e7ea; --chip: #f3f3f1; --gold: #ffc928;
  --display: "Fredoka", ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif;
  --body: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  color-scheme: light;
}
html, body { background: var(--paper); color: var(--ink); }
body { font: 14px/1.45 var(--body); }
.wrap { max-width: 1400px; margin: 0 auto; padding-block: 18px 40px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 18px; }
.wrap > * { min-width: 0; }
header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; }
h1 { font: 600 clamp(22px, 3vw, 30px)/1.1 var(--display); margin: 0; text-wrap: balance; }
header p { margin: 0; color: var(--soft); font-variant-numeric: tabular-nums; }
.stage { position: relative; height: clamp(380px, 66vh, 760px); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--paper); }
#view { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
.tag { position: absolute; transform: translate(-50%, 6px); font: 500 13px/1 var(--display); color: var(--ink); background: rgba(255,255,255,.86); padding: 4px 8px; border-radius: 999px; white-space: nowrap; pointer-events: none; }
.tools { position: absolute; left: 12px; bottom: 12px; right: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tools button { font: 500 14px/1 var(--display); color: var(--ink); background: var(--chip); border: 1px solid var(--line); border-radius: 8px; padding: 9px 13px; cursor: pointer; }
.tools button[aria-pressed="true"] { background: var(--gold); border-color: var(--ink); }
.tools button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.tools span { color: var(--soft); font-size: 12px; margin-left: auto; }
.parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px 18px; margin: 0; padding: 0; list-style: none; }
.parts li { display: grid; gap: 2px; border-top: 2px solid var(--ink); padding-top: 8px; min-width: 0; }
.parts b { font: 600 16px/1.2 var(--display); }
.parts span { color: var(--soft); font-variant-numeric: tabular-nums; }
section { display: grid; gap: 10px; justify-items: start; }
h2 { font: 600 18px/1.2 var(--display); margin: 0; }
.checker { padding: 20px; border-radius: 10px; border: 1px solid var(--line);
  background-color: #ffffff; background-image: linear-gradient(45deg, #e9e9ec 25%, transparent 25%, transparent 75%, #e9e9ec 75%), linear-gradient(45deg, #e9e9ec 25%, transparent 25%, transparent 75%, #e9e9ec 75%);
  background-size: 24px 24px; background-position: 0 0, 12px 12px; }
.checker img { display: block; width: 256px; max-width: 100%; height: auto; image-rendering: auto; }
section p { margin: 0; color: var(--soft); font-variant-numeric: tabular-nums; }
</style>
<div class="wrap">
  <header><h1>${esc(title)}</h1><p>${rows.length} models &middot; ${fmt(totalTris)} triangles &middot; 1 unit = 1 stud, fronts face you in the front view</p></header>
  <div class="stage" id="stage">
    <canvas id="view"></canvas>
    <div class="tools">
      <button id="b-three" aria-pressed="true">Three-quarter</button>
      <button id="b-top" aria-pressed="false">Top-down (game view)</button>
      <button id="b-front" aria-pressed="false">Front</button>
      <span>Drag to spin &middot; scroll or pinch to zoom</span>
    </div>
  </div>
  <ul class="parts">${rows.map((r) => `<li><b>${esc(r.label)}</b><span>${r.size.join(' &times; ')} studs</span><span>${fmt(r.tris)} triangles</span></li>`).join('')}</ul>
  <section>
    <h2>Build button</h2>
    <div class="checker"><img alt="Build button with a silicon crystal icon" src="data:image/png;base64,${fs.readFileSync(png).toString('base64')}"></div>
    <p>${esc(caption)}</p>
  </section>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
const MODEL = "${buf.toString('base64')}";
const LABELS = ${JSON.stringify(Object.fromEntries(rows.map((r) => [r.name, r.label])))};
const bytes = (b) => { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };
const stage = document.getElementById('stage'), canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 6000);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bcc4, 0.62));
const sun = new THREE.DirectionalLight(0xffffff, 0.48); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 6; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xffffff, 0.18); // top faces land near their true colour: hemisphere + sun about 1, sides darker scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.ShadowMaterial({ opacity: 0.16 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
const controls = new THREE.OrbitControls(camera, canvas); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - 0.02;
const tags = [];
let box = null;
// fit: move the camera along a direction until the row's box fills about four fifths of the width (or nine tenths of the height)
const pts = []; // every corner of every part, so the fit follows the models, not their box's empty corners
function fit(dir) {
  const c = box.getCenter(new THREE.Vector3()), d = new THREE.Vector3(...dir).normalize();
  const spread = () => { let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { const q = p.clone().project(camera); if (q.z > 1) return null;
    x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); } return { x0, x1, y0, y1 }; };
  for (let pass = 0; pass < 3; pass++) { // fit, then slide the aim so the models sit in the middle, and fit again
    let lo = 1, hi = 5000;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2; camera.position.copy(c).addScaledVector(d, mid); camera.lookAt(c); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const s = spread(); if (!s || s.x1 - s.x0 > 1.68 || s.y1 - s.y0 > 1.6) lo = mid; else hi = mid;
    }
    camera.position.copy(c).addScaledVector(d, hi); camera.lookAt(c); camera.updateMatrixWorld();
    const s = spread(), half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * hi;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    c.addScaledVector(right, (s.x0 + s.x1) / 2 * half * camera.aspect).addScaledVector(up, (s.y0 + s.y1) / 2 * half);
  }
  controls.target.copy(c); camera.lookAt(c); controls.update();
}
const VIEWS = { three: [0.3, 0.5, -0.8], top: [0, 1, -0.0001], front: [0, 0.1, -1] };
let current = 'three';
// top: a long lens, so it reads nearly flat like the game's high camera
function setView(v) { current = v; camera.fov = v === 'top' ? 12 : 30; camera.updateProjectionMatrix(); for (const k of Object.keys(VIEWS)) document.getElementById('b-' + k).setAttribute('aria-pressed', String(k === v)); if (box) fit(VIEWS[v]); }
for (const k of Object.keys(VIEWS)) document.getElementById('b-' + k).onclick = () => setView(k);
new THREE.GLTFLoader().parse(bytes(MODEL), '', (g) => {
  g.scene.traverse((o) => { if (!o.isMesh) return; o.castShadow = !o.name.startsWith('Outline_'); o.receiveShadow = true;
    if (o.name.startsWith('Glow_')) o.material = new THREE.MeshBasicMaterial({ map: o.material.map }); }); // glows unlit, so they show their exact colour
  scene.add(g.scene); g.scene.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(g.scene);
  g.scene.traverse((o) => { if (!o.isMesh) return; const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld)); });
  for (const [name, label] of Object.entries(LABELS)) { const grp = g.scene.getObjectByName(name); if (!grp) continue;
    const b = new THREE.Box3().setFromObject(grp), el = document.createElement('div'); el.className = 'tag'; el.textContent = label; stage.appendChild(el);
    if (tags.length % 2) el.style.marginTop = '26px'; // every other label a row lower, so close neighbours never overlap
    tags.push({ el, at: new THREE.Vector3((b.min.x + b.max.x) / 2, 0, b.min.z - 0.8) }); } // under each model's front edge
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  sun.position.copy(c).add(new THREE.Vector3(r * 0.5, r * 1.6, -r * 0.9)); sun.target.position.copy(c);
  Object.assign(sun.shadow.camera, { left: -r * 1.1, right: r * 1.1, top: r * 1.1, bottom: -r * 1.1, near: 1, far: r * 6 }); sun.shadow.camera.updateProjectionMatrix();
  fill.position.copy(c).add(new THREE.Vector3(-r, r * 0.6, r));
  resize();
  const q = new URLSearchParams(location.search).get('view'); setView(q === 'top' ? 'top' : q === 'front' ? 'front' : 'three');
  window.ready = true;
});
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); if (box) fit(VIEWS[current]); }
new ResizeObserver(resize).observe(stage);
const v = new THREE.Vector3();
(function loop() {
  requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera);
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const t of tags) { v.copy(t.at).project(camera); const on = v.z < 1; t.el.hidden = !on; if (on) t.el.style.left = ((v.x + 1) / 2 * w) + 'px', t.el.style.top = ((1 - v.y) / 2 * h) + 'px'; }
})();
</script>
`);
console.log('wrote', out, fs.statSync(out).size, 'bytes;', rows.map((r) => `${r.label} ${r.size.join('x')} ${r.tris}`).join(' | '));
