// Finds parts you can see through: open edges (a tube's uncapped end, a hole in a shell). Run: node check-open-edges.mjs model.glb [more.glb]
// (needs three@0.170.0). Welds each part's points by position, then lists edges used by only one triangle, longer than 0.01 (lathe poles
// are tiny rings and don't count). A point lying part way along another triangle's edge (a T-join: one big face meeting two small ones, as
// in merged voxel faces) splits that edge, so the T-join counts as closed. Outline_ shells are left out: they are inside-out, and stop short
// over the floor on purpose. Prints each open part with its open edge count and where the first one is; exits 1 if any, or if a file has no parts.
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const files = process.argv.slice(2);
if (!files.length) { console.error('Usage: node check-open-edges.mjs model.glb [more]'); process.exit(1); }
let bad = 0;
for (const f of files) {
	const buf = fs.readFileSync(f), ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	const g = await new Promise((ok, no) => new GLTFLoader().parse(ab, '', ok, no));
	g.scene.updateMatrixWorld(true);
	let parts = 0;
	g.scene.traverse((o) => {
		if (!o.isMesh || o.name.startsWith('Outline_')) return;
		parts++;
		const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count, key = [], id = new Map(), pts = [];
		for (let i = 0; i < P.count; i++) {
			const v = new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld), k = v.toArray().map((x) => Math.round(x * 2000)).join(',');
			if (!id.has(k)) { id.set(k, pts.length); pts.push(v); } key[i] = id.get(k);
		}
		const edges = new Map(), count = (map, p, q) => { const e = p < q ? p + '_' + q : q + '_' + p; map.set(e, (map.get(e) || 0) + 1); };
		for (let t = 0; t < n; t += 3) {
			const a = [0, 1, 2].map((j) => key[I ? I.getX(t + j) : t + j]);
			if (a[0] === a[1] || a[1] === a[2] || a[0] === a[2]) continue; // a squashed triangle at a pole
			for (let j = 0; j < 3; j++) count(edges, a[j], a[(j + 1) % 3]);
		}
		// T-joins: split each edge used once at every point lying along it, then count the short pieces again
		const pieces = new Map();
		for (const [e, c] of edges) {
			if (c !== 1) continue;
			const [p, q] = e.split('_').map(Number), A = pts[p], B = pts[q], dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, L2 = dx * dx + dy * dy + dz * dz;
			const on = [];
			for (let k = 0; k < pts.length; k++) {
				if (k === p || k === q) continue;
				const C = pts[k], t = ((C.x - A.x) * dx + (C.y - A.y) * dy + (C.z - A.z) * dz) / L2;
				if (t <= 1e-6 || t >= 1 - 1e-6) continue;
				if (Math.hypot(A.x + dx * t - C.x, A.y + dy * t - C.y, A.z + dz * t - C.z) < 1e-3) on.push([t, k]);
			}
			const chain = [p, ...on.sort((x, y) => x[0] - y[0]).map(([, k]) => k), q];
			for (let i = 0; i + 1 < chain.length; i++) count(pieces, chain[i], chain[i + 1]);
		}
		const open = [...pieces].filter(([e, c]) => { if (c !== 1) return false; const [p, q] = e.split('_').map(Number); return pts[p].distanceTo(pts[q]) > 0.01; });
		if (open.length) { bad++; const [p] = open[0][0].split('_').map(Number); console.log('OPEN', f.split('/').pop(), o.name, open.length, 'edges, e.g. at', pts[p].toArray().map((x) => x.toFixed(2)).join(', ')); }
	});
	if (!parts) { bad++; console.log('NO PARTS', f.split('/').pop(), ': nothing to check'); }
}
console.log(files.length, 'files checked,', bad, bad === 1 ? 'problem' : 'problems');
process.exit(bad ? 1 : 0);
