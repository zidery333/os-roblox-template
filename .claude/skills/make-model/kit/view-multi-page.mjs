// Writes a one-file 3D view of several .glb files side by side, framed on all of them (white studio light, soft shadow, spin and zoom, every file inside as base64):
//   node view-multi-page.mjs list.json out.html "Title" "info line"
// list.json: [{ "glb": "/abs/a.glb", "label": "Boss", "pos": [x, y, z], "rotY": 0, "toggle": false }]. toggle: true gives it an on/off chip (for view-only extras).
// ?view=side|top|back|straight in the page's address turns the camera, for screenshots (straight: square on from the front and a little above, for a
// grid of upgrade levels placed with "pos"). The view is framed on every file shown by their own points (fit-corners.mjs, which must sit beside this file).
// "hide": "^(Outline_)?RightArm$" hides that file's matching parts (an arm a held tool replaces); "group": "name"
//   gives every entry with that name one shared on/off chip (a character built from several files); "floor": true stands that file on 0 (gear shown alone).
import fs from 'fs';
import { FIT_CORNERS_JS } from './fit-corners.mjs';
const [listFile, outFile, title = 'Model', info = ''] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.writeFileSync(outFile, `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* one white studio view: the models fill the screen, a small label top left, toggles bottom left */
:root { --bg: #ffffff; --ink: #1d1f23; --soft: #6b7078; --chip: #f2f3f5; color-scheme: light; }
html, body { height: 100%; }
body { background: var(--bg); color: var(--ink); margin: 0; overflow: hidden; font: 13px/1.4 -apple-system, system-ui, sans-serif; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
#view { position: fixed; inset: 0; width: 100%; height: 100%; }
#info { position: fixed; top: calc(12px + env(safe-area-inset-top, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); display: flex; flex-direction: column; gap: 4px; pointer-events: none; }
#info b { font-size: 15px; }
#info span { color: var(--soft); font-variant-numeric: tabular-nums; }
#tools { position: fixed; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); display: flex; gap: 8px; flex-wrap: wrap; }
#tools label { background: var(--chip); padding: 6px 10px; border-radius: 6px; cursor: pointer; user-select: none; }
#tools input:focus-visible { outline: 2px solid var(--ink); }
</style>
<canvas id="view"></canvas>
<div id="info"><b>${esc(title)}</b>${info.split('|').map((l) => `<span>${esc(l.trim())}</span>`).join('')}<span>Drag to spin &middot; scroll to zoom</span></div>
<div id="tools">${list.map((e, i) => e.toggle ? `<label><input type="checkbox" id="x${i}" checked> ${esc(e.label || 'Extra')}</label>` : '').join('')}${[...new Set(list.filter((e) => e.group).map((e) => e.group))].map((g, i) => `<label><input type="checkbox" id="g${i}" data-group="${esc(g)}" checked> ${esc(g)}</label>`).join('')}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
const LIST = ${JSON.stringify(list.map((e) => ({ ...e, glb: fs.readFileSync(e.glb).toString('base64') })))};
const bytes = (b) => { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 5000);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bcc4, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 5; sun.shadow.bias = -0.0005;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0xffffff, 0.35); scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: 0.18 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
const controls = new THREE.OrbitControls(camera, canvas); controls.enableDamping = true;
const loader = new THREE.GLTFLoader();
// Glow_ parts drawn unlit, so they show their exact colour (lit plus emissive washes amber out to yellow)
const unlit = (root) => root.traverse((o) => { if (o.isMesh && o.name.startsWith('Glow_')) o.material = new THREE.MeshBasicMaterial({ map: o.material.map, color: o.material.map ? 0xffffff : o.material.color }); });
${FIT_CORNERS_JS}
const all = new THREE.Box3(); let left = LIST.length;
const models = new THREE.Group(); scene.add(models); // every file shown: what the view is framed on
const dirs = { front: [0.55, 0.35, -0.76], side: [1, 0.25, 0], top: [0.01, 1, -0.2], back: [-0.55, 0.35, 0.76], straight: [0, 0.25, -1] };
const dir = dirs[new URLSearchParams(location.search).get('view')] || dirs.front;
LIST.forEach((e, i) => {
  loader.parse(bytes(e.glb), '', (g) => {
    if (e.hide) { const re = new RegExp(e.hide); g.scene.traverse((o) => { if (re.test(o.name)) o.visible = false; }); }
    g.scene.position.set(...(e.pos || [0, 0, 0])); g.scene.rotation.y = e.rotY || 0;
    if (e.floor) { g.scene.updateMatrixWorld(true); g.scene.position.y -= new THREE.Box3().setFromObject(g.scene).min.y; }
    g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = !o.name.startsWith('Outline_'); o.receiveShadow = true; } });
    unlit(g.scene); models.add(g.scene); g.scene.updateMatrixWorld(true); all.union(new THREE.Box3().setFromObject(g.scene));
    const box = document.getElementById('x' + i); if (box) box.onchange = (ev) => { g.scene.visible = ev.target.checked; };
    if (e.group) document.querySelectorAll('[data-group]').forEach((gb) => { if (gb.dataset.group === e.group) gb.addEventListener('change', () => { g.scene.visible = gb.checked; }); });
    if (--left === 0) frame();
  });
});
function frame() {
  const c = all.getCenter(new THREE.Vector3()), r = all.getSize(new THREE.Vector3()).length() / 2;
  resize(); fitCorners(camera, controls, models, dir, 0.8, 0.75); // by the models' own points, room left for the labels and chips
  sun.position.copy(c).add(new THREE.Vector3(r, r * 3, -r * 1.5)); sun.target.position.copy(c);
  Object.assign(sun.shadow.camera, { left: -r * 1.5, right: r * 1.5, top: r * 1.5, bottom: -r * 1.5, near: 1, far: r * 10 });
  sun.shadow.camera.updateProjectionMatrix();
  fill.position.copy(c).add(new THREE.Vector3(r * 1.5, r, r * 1.2));
  window.ready = true;
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
(function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
</script>
`);
console.log('wrote', outFile, fs.statSync(outFile).size, 'bytes');
