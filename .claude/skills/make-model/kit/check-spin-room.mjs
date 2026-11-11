// Turns every Spin_ group a full turn round its pivot's up and reports how close its parts come to any other solid part (outlines left out):
// the turning parts sweep a solid cylinder round the axle, and every other part's surface is sampled against it. Run: node check-spin-room.mjs model.glb
// (needs three@0.170.0). Also left out: the still part a spinner sits on or turns round, named Mount or Axle (a name may start with its colour
// slot: Trim_Mount, Body_Axle). Exits 1 if anything comes under 0.3, or if the file has no Spin_ group (a Spin_ is a group holding its parts).
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const file = process.argv[2];
if (!file) { console.error('Usage: node check-spin-room.mjs model.glb'); process.exit(1); }
const STILL = /(^|_)(Mount|Axle)(?![a-z])/; // the post or axle a spinner sits on: it touches on purpose
const boxGap = (a, b) => Math.hypot(Math.max(0, a.min.x - b.max.x, b.min.x - a.max.x), Math.max(0, a.min.y - b.max.y, b.min.y - a.max.y), Math.max(0, a.min.z - b.max.z, b.min.z - a.max.z));
const b = fs.readFileSync(file);
const g = await new Promise((ok, no) => new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', ok, no));
// every mesh as plain triangles (three points each, in order), so a mesh that shares points between triangles is read right
g.scene.traverse((o) => { if (o.isMesh && o.geometry.index) o.geometry = o.geometry.toNonIndexed(); });
g.scene.updateMatrixWorld(true);
const groups = []; g.scene.traverse((o) => { if (/^Spin_/.test(o.name) && !o.isMesh) groups.push(o); });
if (!groups.length) { console.log(`no Spin_ group in ${file}: nothing to check (a Spin_ is a group holding the parts that turn)`); process.exit(1); }
let bad = 0;
for (const grp of groups) {
  const inv = grp.matrixWorld.clone().invert(); const mine = new Set(); grp.traverse((o) => mine.add(o));
  // the swept cylinder in the group's frame (its up is the axle): radius and height range
  let rmax = 0, y0 = Infinity, y1 = -Infinity; const v = new THREE.Vector3();
  grp.traverse((m) => { if (!m.isMesh || m.name.startsWith('Outline_')) return; const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld).applyMatrix4(inv); rmax = Math.max(rmax, Math.hypot(v.x, v.z)); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); } });
  // the cylinder's box: no point of a triangle whose own box is further than this from it can be closer
  const cyl = new THREE.Box3(new THREE.Vector3(-rmax, y0, -rmax), new THREE.Vector3(rmax, y1, rmax));
  let worst = Infinity, who = '';
  g.scene.traverse((m) => { if (!m.isMesh || mine.has(m) || m.name.startsWith('Outline_') || STILL.test(m.name)) return; const p = m.geometry.attributes.position;
    const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), q = new THREE.Vector3(), tb = new THREE.Box3();
    const toGrp = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    for (let i = 0; i + 2 < p.count; i += 3) {
      A.fromBufferAttribute(p, i).applyMatrix4(toGrp); B.fromBufferAttribute(p, i + 1).applyMatrix4(toGrp); C.fromBufferAttribute(p, i + 2).applyMatrix4(toGrp);
      if (boxGap(tb.setFromPoints([A, B, C]), cyl) >= worst) continue; // too far to matter
      const N = Math.min(60, Math.max(4, Math.ceil(Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / 0.25))); // points about 0.25 apart
      for (let a = 0; a <= N; a++) for (let c = 0; a + c <= N; c++) { q.set(0, 0, 0).addScaledVector(A, 1 - (a + c) / N).addScaledVector(B, a / N).addScaledVector(C, c / N);
        const d = Math.hypot(Math.max(0, Math.hypot(q.x, q.z) - rmax), Math.max(0, y0 - q.y, q.y - y1)); if (d < worst) { worst = d; who = m.name; } } } });
  const ok = worst >= 0.3; if (!ok) bad++;
  console.log(grp.name.padEnd(14), 'sweeps radius', rmax.toFixed(2), who ? `closest ${worst.toFixed(2)} studs (${who})` : 'nothing else to hit', ok ? 'ok' : 'TOO CLOSE');
}
process.exit(bad ? 1 : 0);
