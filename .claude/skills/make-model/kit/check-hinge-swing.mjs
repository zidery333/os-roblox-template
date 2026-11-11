// Swings two hinged doors (parts or groups whose pivot is on their hinge) a quarter turn at once and prints how close they come to every other
// solid part and to each other (from above), plus door 1's box when open. Defaults: parts named Gate1 and Gate2.
// Run: node check-hinge-swing.mjs model.glb [door1 name] [door2 name] [door1 degrees]   (needs three@0.170.0; defaults Gate1 Gate2 -90, door 2 turns the other way)
// Each door moves with everything inside it; outlines are left out. The doors' faces are sampled about every 0.25 studs and measured against
// small boxes round each triangle of the other parts. Exits 1 if a door comes under 0.3 of another part, or if a door isn't in the file.
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const file = process.argv[2];
if (!file) { console.error('Usage: node check-hinge-swing.mjs model.glb [door1 name] [door2 name] [door1 degrees]'); process.exit(1); }
const b = fs.readFileSync(file);
const g = await new Promise((ok, no) => new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', ok, no));
// every mesh as plain triangles (three points each, in order), so a mesh that shares points between triangles is read right
g.scene.traverse((o) => { if (o.isMesh && o.geometry.index) o.geometry = o.geometry.toNonIndexed(); });
const s = g.scene; s.updateMatrixWorld(true);
const [n1 = 'Gate1', n2 = 'Gate2', turn = '-90'] = process.argv.slice(3), sign = Math.sign(Number(turn));
const d1 = s.getObjectByName(n1), d2 = s.getObjectByName(n2);
if (!d1 || !d2) { console.error('no part named', !d1 ? n1 : n2); process.exit(1); }
if (!sign) { console.error('door1 degrees must be a number, not 0'); process.exit(1); }
console.log('pivots', d1.position.toArray(), d2.position.toArray());
const solid = (o) => o.isMesh && !o.name.startsWith('Outline_');
const inDoor = new Set(); for (const d of [d1, d2]) d.traverse((o) => inDoor.add(o));
// a part's triangles as small boxes in the world, so an L-shaped part's empty corner doesn't count as solid
const triBoxes = (m) => { const p = m.geometry.attributes.position, out = []; for (let i = 0; i + 2 < p.count; i += 3) { const bx = new THREE.Box3();
  for (let k = 0; k < 3; k++) bx.expandByPoint(new THREE.Vector3().fromBufferAttribute(p, i + k).applyMatrix4(m.matrixWorld)); out.push(bx); } return out; };
const others = []; s.traverse((o) => { if (solid(o) && !inDoor.has(o)) others.push({ name: o.name, box: new THREE.Box3().setFromObject(o), tris: triBoxes(o) }); });
// points over a door's faces, about 0.25 apart, in each mesh's own frame
const samples = (d) => { const out = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  d.traverse((m) => { if (!solid(m)) return; const p = m.geometry.attributes.position, pts = [];
    for (let i = 0; i + 2 < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
      const n = Math.min(60, Math.max(1, Math.ceil(Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / 0.25)));
      for (let a = 0; a <= n; a++) for (let c = 0; a + c <= n; c++) pts.push(new THREE.Vector3().addScaledVector(A, 1 - (a + c) / n).addScaledVector(B, a / n).addScaledVector(C, c / n)); }
    out.push({ m, pts }); });
  return out; };
const S1 = samples(d1), S2 = samples(d2);
const world = (S) => S.flatMap(({ m, pts }) => pts.map((p) => p.clone().applyMatrix4(m.matrixWorld)));
const hull2 = (P) => { const q = P.map((v) => [v.x, v.z]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of q) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); } for (const p of q.reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
const r1 = d1.rotation.y, r2 = d2.rotation.y;
let worst = { box: [Infinity, 'nothing else', 0], door: Infinity };
for (let deg = 0; deg <= Math.abs(Number(turn)); deg += 2) {
  const a = THREE.MathUtils.degToRad(deg);
  d1.rotation.y = r1 + sign * a; d2.rotation.y = r2 - sign * a; s.updateMatrixWorld(true);
  const P1 = world(S1), P2 = world(S2);
  for (const P of [P1, P2]) for (const v of P) for (const o of others) { if (o.box.distanceToPoint(v) >= worst.box[0]) continue;
    for (const tb of o.tris) { const dd = tb.distanceToPoint(v); if (dd < worst.box[0]) worst.box = [dd, o.name, deg]; } }
  const H2 = hull2(P2); for (const v of P1) for (let i = 0; i < H2.length; i++) worst.door = Math.min(worst.door, segD([v.x, v.z], H2[i], H2[(i + 1) % H2.length]));
  if (deg === Math.abs(Number(turn))) { const bb = new THREE.Box3(); P1.forEach((v) => bb.expandByPoint(v)); console.log(n1 + ' open box', bb.min.toArray().map((x) => x.toFixed(2)), bb.max.toArray().map((x) => x.toFixed(2))); }
}
d1.rotation.y = r1; d2.rotation.y = r2;
console.log('closest to another part', worst.box[0].toFixed(3), worst.box[1], 'at', worst.box[2], 'deg; doors to each other', worst.door.toFixed(3));
if (worst.box[0] < 0.3) { console.log('closer than 0.3'); process.exit(1); }
