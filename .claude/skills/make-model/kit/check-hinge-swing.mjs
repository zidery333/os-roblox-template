// Swings two hinged doors (parts whose pivot is on their hinge) a quarter turn at once and prints how close they come to every other
// solid part (boxes) and to each other (from above), plus door 1's box when open. Defaults: parts named Gate1 and Gate2.
// Run: node check-hinge-swing.mjs model.glb [door1 name] [door2 name] [door1 degrees]   (needs three@0.170.0; defaults Gate1 Gate2 -90, door 2 turns the other way)
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const b = fs.readFileSync(process.argv[2]);
new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', (g) => {
  const s = g.scene; s.updateMatrixWorld(true);
  const [n1 = 'Gate1', n2 = 'Gate2', turn = '-90'] = process.argv.slice(3), sign = Math.sign(Number(turn));
  const d1 = s.getObjectByName(n1), d2 = s.getObjectByName(n2);
  if (!d1 || !d2) { console.error('no part named', !d1 ? n1 : n2); process.exit(2); }
  console.log('pivots', d1.position.toArray(), d2.position.toArray());
  const others = [];
  s.traverse((o) => { if (o.isMesh && !(/Outline_/.test(o.name) || o === d1 || o === d2) && o.parent === s) others.push([o.name, new THREE.Box3().setFromObject(o)]); });
  const pts = (d) => { const p = d.geometry.attributes.position, out = []; for (let i = 0; i < p.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(d.matrixWorld)); return out; };
  const hull2 = (P) => { const q = P.map((v) => [v.x, v.z]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of q) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); } for (const p of q.reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
  const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
  let worst = { box: [Infinity], door: Infinity };
  for (let deg = 0; deg <= Math.abs(Number(turn)); deg += 2) {
    const a = THREE.MathUtils.degToRad(deg);
    d1.rotation.y = sign * a; d2.rotation.y = -sign * a; s.updateMatrixWorld(true);
    const P1 = pts(d1), P2 = pts(d2);
    for (const P of [P1, P2]) for (const [n, bx] of others) for (const v of P) { const dd = bx.distanceToPoint(v); if (dd < worst.box[0]) worst.box = [dd, n, deg]; }
    const H2 = hull2(P2); for (const v of P1) for (let i = 0; i < H2.length; i++) worst.door = Math.min(worst.door, segD([v.x, v.z], H2[i], H2[(i + 1) % H2.length]));
    if (deg === Math.abs(Number(turn))) { const bb = new THREE.Box3(); P1.forEach((v) => bb.expandByPoint(v)); console.log(n1 + ' open box', bb.min.toArray().map((x) => x.toFixed(2)), bb.max.toArray().map((x) => x.toFixed(2))); }
  }
  console.log('closest to another part', worst.box[0].toFixed(3), worst.box[1], 'at', worst.box[2], 'deg; doors to each other', worst.door.toFixed(3));
});
