// Measures the gap between separate things that sit near each other (a handle held near a body, wings and body, a prop and its model).
// Run: node check-clear.mjs a.glb [b.glb ...] "Handle|Body" "WingL|Body,Belly" ... [--min 1]   (needs three@0.170.0)
// Each pair "A|B" names part-name prefixes (comma lists); outlines are skipped. Prints the nearest gap per pair (negative = overlapping, judged
// by the other surface's normal). Exits 1 if any pair is under --min (default 1 stud), if a pair names no parts, or if given no .glb file or no pair.
// Several .glb files share one frame (a model and its props file).
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const args = process.argv.slice(2), files = args.filter((a) => a.endsWith('.glb')), pairs = args.filter((a) => a.includes('|'));
const mi = args.indexOf('--min'), MIN = mi >= 0 ? +args[mi + 1] : 1;
if (!files.length || !pairs.length) { console.error('Usage: node check-clear.mjs a.glb [b.glb ...] "PartA,PartB|PartC" ... [--min 1]'); process.exit(1); }
const load = (f) => new Promise((ok, no) => { const b = fs.readFileSync(f); new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '', ok, no); });
// surface samples (triangles subdivided to about 0.7 studs) with normals
function samples(o) {
	const P = o.geometry.attributes.position, N = o.geometry.attributes.normal, I = o.geometry.index, out = [];
	const v = (i) => new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld), nn = (i) => new THREE.Vector3().fromBufferAttribute(N, i).transformDirection(o.matrixWorld);
	const n3 = I ? I.count : P.count;
	for (let t = 0; t < n3; t += 3) { const ids = I ? [I.getX(t), I.getX(t + 1), I.getX(t + 2)] : [t, t + 1, t + 2]; const [a, b, c] = ids.map(v), [na, nb, nc] = ids.map(nn);
		const k = Math.max(1, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / 0.7));
		for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) { const u = i / k, w = j / k, q = 1 - u - w;
			out.push({ p: a.clone().multiplyScalar(q).addScaledVector(b, u).addScaledVector(c, w), n: na.clone().multiplyScalar(q).addScaledVector(nb, u).addScaledVector(nc, w).normalize() }); } }
	return out;
}
function nearest(list) {
	const C = 1.5, H = new Map(), key = (x, y, z) => x + ',' + y + ',' + z;
	for (const e of list) { const k = key(Math.floor(e.p.x / C), Math.floor(e.p.y / C), Math.floor(e.p.z / C)); if (!H.has(k)) H.set(k, []); H.get(k).push(e); }
	return (p) => { let best = null, bd = Infinity; const cx = Math.floor(p.x / C), cy = Math.floor(p.y / C), cz = Math.floor(p.z / C);
		for (let r = 0; r <= 4 && (best === null || bd > (r - 1) * C); r++) for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
			if (Math.max(Math.abs(x - cx), Math.abs(y - cy), Math.abs(z - cz)) !== r) continue; const L = H.get(key(x, y, z)); if (L) for (const e of L) { const d = e.p.distanceTo(p); if (d < bd) { bd = d; best = e; } } }
		return best ? (bd < 2 && p.clone().sub(best.p).dot(best.n) < 0 ? -bd : bd) : 6; }; // inside only when close: a far point behind a thin fin is not inside it
}
const meshes = [];
for (const f of files) { const g = await load(f); g.scene.updateMatrixWorld(true); g.scene.traverse((o) => { if (o.isMesh && !o.name.startsWith('Outline_')) meshes.push(o); }); }
const pick = (s) => { const pre = s.split(','); return meshes.filter((o) => pre.some((x) => o.name.startsWith(x))); };
let bad = 0;
for (const pr of pairs) {
	const [A, B] = pr.split('|'), ma = pick(A), mb = pick(B);
	if (!ma.length || !mb.length) { console.log(`FAIL ${pr}: no parts named ${!ma.length ? A : B}`); bad++; continue; }
	// per part of A against all of B, and per part of B against all of A (an overlap shows from either side)
	let worst = { d: 99 };
	for (const [xs, ys] of [[ma, mb], [mb, ma]]) { const near = nearest(ys.flatMap(samples));
		for (const o of xs) for (const e of samples(o)) { const d = near(e.p); if (d < worst.d) worst = { d, at: e.p, part: o.name }; } }
	const ok = worst.d >= MIN; if (!ok) bad++;
	console.log(`${ok ? 'ok  ' : 'NEAR'} ${A} vs ${B}: nearest ${worst.d >= 6 ? '6+' : worst.d.toFixed(2)} studs` + (worst.at ? ` (${worst.part} at ${worst.at.toArray().map((v) => v.toFixed(1)).join(', ')})` : ''));
}
process.exit(bad ? 1 : 0);
