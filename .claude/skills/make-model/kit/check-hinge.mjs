// Swings hinged pieces (a node on its hinge that turns round X: a lid, a magnet) from 0 to a quarter turn and says how close
// they come to every other solid part: node check-hinge.mjs model.glb Lid [Magnet2 ...] [--angle 90] [--axis y]  (needs three@0.170.0)
// --axis y swings a door round its upright hinge (a front door); --angle -90 swings the other way.
// Each named node moves with its children (glow tips); outlines are left out. Every 3 degrees it measures each moving corner to the
// still parts' faces and each still corner to the moving parts' faces (parts over 1 apart are skipped).
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const args = process.argv.slice(2), file = args[0];
const ai = args.indexOf('--angle'), maxDeg = ai > 0 ? +args[ai + 1] : 90;
const xi = args.indexOf('--axis'), AXIS = xi > 0 ? args[xi + 1] : 'x';
const names = args.slice(1).filter((a, i, all) => !['--angle', '--axis'].includes(a) && !['--angle', '--axis'].includes(all[i - 1]));
const buf = fs.readFileSync(file);
const gltf = await new Promise((res, rej) => new GLTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), '', res, rej));
const scene = gltf.scene; scene.updateMatrixWorld(true);
const solid = (o) => o.isMesh && !o.name.startsWith('Outline_');
let worst = Infinity;
for (const name of names) {
	const node = scene.getObjectByName(name);
	if (!node) { console.log(`no node ${name}`); process.exitCode = 2; continue; }
	const movers = []; node.traverse((o) => { if (solid(o)) movers.push(o); });
	const still = []; scene.traverse((o) => { if (solid(o) && !movers.includes(o)) still.push(o); });
	const rest = node.rotation[AXIS]; let best = { d: Infinity };
	// world-space corners and triangles of a mesh
	const corners = (m) => { const p = m.geometry.getAttribute('position'), out = []; for (let i = 0; i < p.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld)); return out; };
	const tris = (m) => { const c = corners(m), out = []; for (let i = 0; i + 2 < c.length; i += 3) out.push(new THREE.Triangle(c[i], c[i + 1], c[i + 2])); return out; };
	const q = new THREE.Vector3();
	const near = (pts, ts, cut) => { let d = Infinity; for (const p of pts) for (const t of ts) { t.closestPointToPoint(p, q); d = Math.min(d, q.distanceTo(p)); if (d < cut) return d; } return d; };
	const stillData = still.map((s) => ({ s, c: corners(s), t: tris(s), box: new THREE.Box3().setFromObject(s).expandByScalar(1) }));
	for (let deg = 0; Math.abs(deg) <= Math.abs(maxDeg); deg += 3 * Math.sign(maxDeg)) {
		node.rotation[AXIS] = rest + (deg * Math.PI) / 180; scene.updateMatrixWorld(true);
		for (const m of movers) {
			const mc = corners(m), mt = tris(m), mb = new THREE.Box3().setFromPoints(mc);
			for (const { s, c, t, box } of stillData) {
				if (!box.intersectsBox(mb)) continue; // more than 1 apart
				const d = Math.min(near(mc, t, 0), near(c, mt, 0));
				if (d < best.d) best = { d, deg, a: m.name, b: s.name };
			}
		}
	}
	node.rotation[AXIS] = rest; scene.updateMatrixWorld(true);
	console.log(`${name}: closest ${best.d.toFixed(2)} (${best.a} to ${best.b} at ${best.deg} degrees)`);
	worst = Math.min(worst, best.d);
}
if (worst < 0.3) { console.log('closer than 0.3'); process.exitCode = 1; }
