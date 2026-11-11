// Finds parts you can see through: open edges (a tube's uncapped end, a hole in a shell). Run: node check-open-edges.mjs model.glb [more.glb]
// (needs three@0.170.0). Welds each part's points by position, then lists edges used by only one triangle, longer than 0.01 (lathe poles
// are tiny rings and don't count). Prints each open part with its open edge count and where the first one is; exits 1 if any.
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const files = process.argv.slice(2);
if (!files.length) { console.error('Usage: node check-open-edges.mjs model.glb [more]'); process.exit(2); }
let bad = 0;
for (const f of files) {
	const buf = fs.readFileSync(f), ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	const g = await new Promise((ok, no) => new GLTFLoader().parse(ab, '', ok, no));
	g.scene.updateMatrixWorld(true);
	g.scene.traverse((o) => {
		if (!o.isMesh) return;
		const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count, key = [], id = new Map(), pts = [];
		for (let i = 0; i < P.count; i++) {
			const v = new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld), k = v.toArray().map((x) => Math.round(x * 2000)).join(',');
			if (!id.has(k)) { id.set(k, pts.length); pts.push(v); } key[i] = id.get(k);
		}
		const edges = new Map();
		for (let t = 0; t < n; t += 3) {
			const a = [0, 1, 2].map((j) => key[I ? I.getX(t + j) : t + j]);
			if (a[0] === a[1] || a[1] === a[2] || a[0] === a[2]) continue; // a squashed triangle at a pole
			for (let j = 0; j < 3; j++) { const p = a[j], q = a[(j + 1) % 3], e = p < q ? p + '_' + q : q + '_' + p; edges.set(e, (edges.get(e) || 0) + 1); }
		}
		const open = [...edges].filter(([e, c]) => { if (c !== 1) return false; const [p, q] = e.split('_').map(Number); return pts[p].distanceTo(pts[q]) > 0.01; });
		if (open.length) { bad++; const [p] = open[0][0].split('_').map(Number); console.log('OPEN', f.split('/').pop(), o.name, open.length, 'edges, e.g. at', pts[p].toArray().map((x) => x.toFixed(2)).join(', ')); }
	});
}
console.log(files.length, 'files checked,', bad, 'open parts');
process.exit(bad ? 1 : 0);
