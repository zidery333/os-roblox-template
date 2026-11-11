// Swings every Sweep_ group a half turn (-90 to 90 degrees) round its pivot's up, turns every Aim_ group a full circle, moves every Bob_ group
// up and down (--bob studs each way, 0.5 unless the prompt says), and reports the closest each comes to any other solid part. Spin_ groups are
// check-spin-room.mjs's job. Run: node check-sweep.mjs model.glb [--bob 0.5]  (needs three@0.170.0)
// Left out: Outline_ shells; a Mount or Axle (the still part a group sits on or turns round); a Collar (the ring an Aim_ head turns on: its gap
// is printed on its own); and a Turntable inside the group (it turns in place on its Mount). A name may start with its colour slot (Trim_Mount).
// The moving parts' faces are sampled about every 0.25 studs and measured against small boxes round each triangle of the other parts.
// Exits 1 if a group comes under 0.3 of another part, or if the file has no Sweep_, Aim_ or Bob_ group.
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const args = process.argv.slice(2), bi = args.indexOf('--bob'), BOB = bi >= 0 ? Number(args.splice(bi, 2)[1]) : 0.5, file = args[0];
if (!file || !(BOB > 0)) { console.error('Usage: node check-sweep.mjs model.glb [--bob 0.5]  (--bob: how far a Bob_ group moves up and down, in studs)'); process.exit(1); }
const name = (word) => new RegExp(`(^|_)(${word})(?![a-z])`);
const STILL = name('Mount|Axle|Collar'), COLLAR = name('Collar'), TURNTABLE = name('Turntable');
const b = fs.readFileSync(file);
const g = await new Promise((ok, no) => new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', ok, no));
// every mesh as plain triangles (three points each, in order), so a mesh that shares points between triangles is read right
g.scene.traverse((o) => { if (o.isMesh && o.geometry.index) o.geometry = o.geometry.toNonIndexed(); });
g.scene.updateMatrixWorld(true);
const groups = []; g.scene.traverse((o) => { if (/^(Sweep|Aim|Bob)_/.test(o.name) && !o.isMesh) groups.push(o); });
if (!groups.length) { console.log(`no Sweep_, Aim_ or Bob_ group in ${file}: nothing to check (a moving group holds its parts; it is not a part itself)`); process.exit(1); }
// a part's triangles as small boxes in the world, so an L-shaped part's empty corner doesn't count as solid
const triBoxes = (m) => { const p = m.geometry.attributes.position, out = []; for (let i = 0; i + 2 < p.count; i += 3) { const bx = new THREE.Box3();
  for (let k = 0; k < 3; k++) bx.expandByPoint(new THREE.Vector3().fromBufferAttribute(p, i + k).applyMatrix4(m.matrixWorld)); out.push(bx); } return out; };
// points over a part's faces, about 0.25 apart, in the part's own frame
const samples = (m) => { const p = m.geometry.attributes.position, out = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (let i = 0; i + 2 < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
    const n = Math.min(60, Math.max(1, Math.ceil(Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / 0.25)));
    for (let a = 0; a <= n; a++) for (let c = 0; a + c <= n; c++) out.push(new THREE.Vector3().addScaledVector(A, 1 - (a + c) / n).addScaledVector(B, a / n).addScaledVector(C, c / n)); }
  return out; };
let bad = 0;
for (const grp of groups) {
  const mine = new Set(); grp.traverse((o) => mine.add(o));
  const others = [], rings = [];
  g.scene.traverse((o) => { if (!o.isMesh || mine.has(o) || o.name.startsWith('Outline_')) return;
    if (COLLAR.test(o.name)) rings.push(...triBoxes(o)); if (STILL.test(o.name)) return;
    others.push({ name: o.name, box: new THREE.Box3().setFromObject(o), tris: triBoxes(o) }); });
  const movers = []; grp.traverse((m) => { if (m.isMesh && !m.name.startsWith('Outline_') && !TURNTABLE.test(m.name)) movers.push({ m, pts: samples(m) }); });
  // the poses: Sweep_ a half turn, Aim_ a full circle, both round the group's own up; Bob_ up and down along it
  const q0 = grp.quaternion.clone(), p0 = grp.position.clone(), up = new THREE.Vector3(0, 1, 0).applyQuaternion(q0), turn = new THREE.Quaternion();
  const poses = [];
  if (/^Bob_/.test(grp.name)) { const step = Math.min(0.05, BOB / 10); for (let t = -BOB; t <= BOB + 1e-9; t += step) poses.push({ at: `${t >= 0 ? '+' : ''}${t.toFixed(2)} up`, set: () => grp.position.copy(p0).addScaledVector(up, t) }); }
  else { const full = /^Aim_/.test(grp.name); for (let a = full ? 0 : -90; a <= (full ? 355 : 90); a += 5) poses.push({ at: a + ' deg', set: () => grp.quaternion.copy(q0).multiply(turn.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a * Math.PI / 180)) }); }
  let worst = Infinity, who = '', at = '', ring = Infinity; const v = new THREE.Vector3();
  for (const pose of poses) {
    pose.set(); grp.updateMatrixWorld(true);
    for (const { m, pts } of movers) for (const s of pts) { v.copy(s).applyMatrix4(m.matrixWorld);
      for (const o of others) { if (o.box.distanceToPoint(v) >= worst) continue;
        for (const tb of o.tris) { const d = tb.distanceToPoint(v); if (d < worst) { worst = d; who = m.name + ' / ' + o.name; at = pose.at; } } }
      for (const rb of rings) ring = Math.min(ring, rb.distanceToPoint(v)); }
  }
  grp.quaternion.copy(q0); grp.position.copy(p0); grp.updateMatrixWorld(true);
  const ok = worst >= 0.3; if (!ok) bad++;
  console.log(grp.name.padEnd(14), who ? `closest ${worst.toFixed(2)} studs (${who} at ${at})` : 'nothing else to hit', ok ? 'ok' : 'TOO CLOSE', rings.length ? '| over its Collar ' + ring.toFixed(2) : '');
}
process.exit(bad ? 1 : 0);
