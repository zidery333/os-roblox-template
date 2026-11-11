// Writes a one-file 3D view page (white studio light, soft shadow, spin and zoom, the .glb inside as base64, three r128 from CDN): node view-3d-page.mjs model.glb out.html "Title" "12 x 8 x 6 studs · 600 triangles" [extras.json]
// extras.json (optional, view only, never in the model): [{ "glb": "/abs/path/Character.glb", "label": "5-tall player", "pos": [x, y, z], "rotY": -1.5708,
//   "only": "^(Back_Wall|Side_Wall)$", "clipX": 40, "clipZ": 90, "clipY": 200 }]. "only" keeps parts whose name (Outline_ taken off) matches;
//   clipX/Z/Y cut that file off past those distances from the model. Each extra gets a toggle. Use it to show a wall the model hangs on, or a character for size.
//   A player-sized block: { "box": [4, 5, 1], "label": "player" } (sizes in studs, as the prompt gives them), stood on the floor just right of the model
//   unless "pos" (its bottom middle) says where. Open the page with ?view=front, back, left, right, top or three-quarter (the default; a bare ?front
//   works too) to start from that side. No packages needed. The view is framed on the model and its player blocks by their own points
//   (fit-corners.mjs, which must sit beside this file), filling about four fifths of the width.
// For a PNG: serve the folder with save-png-server.mjs, open the page in the built-in browser, take one browser screenshot, then in javascript_tool:
//   renderer.render(scene, camera); fetch('/save?name=x.png', { method: 'POST', body: canvas.toDataURL('image/png') })
import fs from 'fs';
import { FIT_CORNERS_JS } from './fit-corners.mjs';
const [model, outFile, title = 'Model', info = '', extrasFile] = process.argv.slice(2);
const b64 = (f) => fs.readFileSync(f).toString('base64');
const extras = extrasFile ? JSON.parse(fs.readFileSync(extrasFile, 'utf8')) : [];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.writeFileSync(outFile, `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* one white studio view: the model fills the screen, a small label top left, toggles bottom left */
:root { --bg: #ffffff; --ink: #1d1f23; --soft: #6b7078; --chip: #f2f3f5; color-scheme: light; }
html, body { height: 100%; }
body { background: var(--bg); color: var(--ink); margin: 0; overflow: hidden; font: 13px/1.4 -apple-system, system-ui, sans-serif; }
#view { position: fixed; inset: 0; width: 100%; height: 100%; }
#info { position: fixed; top: calc(12px + env(safe-area-inset-top, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); display: flex; flex-direction: column; gap: 6px; pointer-events: none; }
#info b { font-size: 15px; }
#info span { color: var(--soft); font-variant-numeric: tabular-nums; }
#tools { position: fixed; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); display: flex; gap: 8px; flex-wrap: wrap; }
#tools label { background: var(--chip); padding: 6px 10px; border-radius: 6px; cursor: pointer; user-select: none; }
</style>
<canvas id="view"></canvas>
<div id="info"><b>${esc(title)}</b><span>${esc(info)}</span><span>Drag to spin &middot; scroll to zoom</span></div>
<div id="tools">${extras.map((e, i) => `<label><input type="checkbox" id="x${i}" checked> ${esc(e.label || 'Extra')}</label>`).join('')}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script>
const MODEL = "${b64(model)}";
const EXTRAS = ${JSON.stringify(extras.map((e) => (e.glb ? { ...e, glb: b64(e.glb) } : e)))};
const bytes = (b) => { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
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
${FIT_CORNERS_JS}
const framed = new THREE.Group(); scene.add(framed); // the model and its player blocks: what the view is framed on
// Glow_ parts drawn unlit, so they show their exact colour (lit plus emissive washes amber out to yellow)
const unlit = (root) => root.traverse((o) => { if (o.isMesh && o.name.startsWith('Glow_')) o.material = new THREE.MeshBasicMaterial({ map: o.material.map, color: o.material.map ? 0xffffff : o.material.color }); });
const shadows = (root) => root.traverse((o) => { if (o.isMesh) { o.castShadow = !o.name.startsWith('Outline_'); o.receiveShadow = true; } });
// which side to start from: ?view=front (or a bare ?front); front is -Z
const q = new URLSearchParams(location.search), VIEW = (q.get('view') || location.search.slice(1).split('&')[0] || 'three-quarter').toLowerCase();
const SIDES = { front: [0, 0.12, -1], back: [0, 0.12, 1], left: [-1, 0.12, 0], right: [1, 0.12, 0], top: [0, 1, -0.001], 'three-quarter': [0.55, 0.35, -0.76] };
const blocks = []; // player-sized blocks, placed once the model's size is known
loader.parse(bytes(MODEL), '', (g) => {
  shadows(g.scene); unlit(g.scene); framed.add(g.scene);
  const mbox = new THREE.Box3().setFromObject(g.scene);
  for (const { e, mesh } of blocks) {
    const [w, h] = e.box, p = e.pos || [mbox.min.x - w / 2 - Math.max(1, w / 2), mbox.min.y, (mbox.min.z + mbox.max.z) / 2]; // -X shows on the right from the front
    mesh.position.set(p[0], p[1] + h / 2, p[2]);
  }
  // frame it: the side asked for (front three-quarter by default), fitted by the model's and blocks' own points, room left for the labels
  const box = mbox.clone(); for (const { mesh } of blocks) box.expandByObject(mesh);
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  resize(); fitCorners(camera, controls, framed, SIDES[VIEW] || SIDES['three-quarter'], 0.8, 0.75);
  sun.position.copy(c).add(new THREE.Vector3(r, r * 3, -r * 1.5)); sun.target.position.copy(c);
  Object.assign(sun.shadow.camera, { left: -r * 1.5, right: r * 1.5, top: r * 1.5, bottom: -r * 1.5, near: 1, far: r * 10 });
  sun.shadow.camera.updateProjectionMatrix();
  fill.position.copy(c).add(new THREE.Vector3(r * 1.5, r, r * 1.2));
  window.ready = true;
});
EXTRAS.forEach((e, i) => {
  const group = new THREE.Group(); (e.box ? framed : scene).add(group);
  document.getElementById('x' + i).onchange = (ev) => { group.visible = ev.target.checked; };
  if (e.box) { // a plain grey player-sized block
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...e.box), new THREE.MeshStandardMaterial({ color: 0xb9bdc4, roughness: 0.9 }));
    mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); blocks.push({ e, mesh }); return;
  }
  loader.parse(bytes(e.glb), '', (g) => {
    const planes = [];
    if (e.clipX) planes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), e.clipX), new THREE.Plane(new THREE.Vector3(-1, 0, 0), e.clipX));
    if (e.clipZ) planes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), e.clipZ), new THREE.Plane(new THREE.Vector3(0, 0, -1), e.clipZ));
    if (e.clipY) planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), e.clipY));
    const only = e.only ? new RegExp(e.only) : null;
    g.scene.position.set(...(e.pos || [0, 0, 0])); g.scene.rotation.y = e.rotY || 0;
    g.scene.traverse((o) => { if (!o.isMesh) return; o.castShadow = !o.name.startsWith('Outline_'); o.receiveShadow = true;
      if (planes.length) { const m = o.material.clone(); m.clippingPlanes = planes; o.material = m; }
      if (only && !only.test(o.name.replace(/^Outline_/, ''))) o.visible = false; });
    unlit(g.scene); group.add(g.scene);
  });
});
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
(function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
</script>
`);
console.log('wrote', outFile, fs.statSync(outFile).size, 'bytes');
