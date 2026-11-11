// Finds faces that would flicker. Run: node check-planes.mjs model.glb  (needs three@0.170.0; prints each pair, exits 1 if any, or if the file has no parts)
// A pair is two faces facing the same way, under 0.03 apart and overlapping, that look different: another colour, another material,
// or one a Glow_ part (the game makes those Neon). Any parts, outlines included.
// A glow part on a plain one of the same colour counts too.
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

globalThis.self ??= globalThis; // GLTFLoader looks for a browser 'self'
const GAP = 0.03, MIN_AREA = 0.01;
// What a face looks like: its palette colour, its material (colour, glow) and whether the game makes it Neon (a Glow_ name).
// Two faces that look the same can't flicker, whichever parts they're on; anything else that differs can.
const look = (o, u) => {
	const m = o.material || {};
	return [u, m.name, m.color?.getHexString(), m.emissive?.getHexString(), m.map ? 'map' : '', /^(\d+:)?Glow_/.test(o.name) ? 'glow' : ''].join('|');
};
const file = process.argv[2];
if (!file) { console.error('Usage: node check-planes.mjs model.glb'); process.exit(1); }
const buf = fs.readFileSync(file);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const origWarn = console.warn; console.warn = () => {};

function clip(subject, a, b) { // keep the part of polygon `subject` left of edge a->b (Sutherland-Hodgman)
	const out = [], side = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
	for (let i = 0; i < subject.length; i++) {
		const p = subject[i], q = subject[(i + 1) % subject.length], sp = side(p), sq = side(q);
		if (sp >= 0) out.push(p);
		if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
	}
	return out;
}
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
function overlap(t1, t2) {
	let a = t1, b = t2;
	if (area(a) < 0) a = [a[0], a[2], a[1]];
	if (area(b) < 0) b = [b[0], b[2], b[1]];
	let poly = a;
	for (let i = 0; i < 3 && poly.length; i++) poly = clip(poly, b[i], b[(i + 1) % 3]);
	return poly.length >= 3 ? Math.abs(area(poly)) : 0;
}

new GLTFLoader().parse(ab, '', (g) => {
	console.warn = origWarn;
	g.scene.updateMatrixWorld(true);
	const tris = [];
	let meshes = 0;
	g.scene.traverse((o) => {
		if (!o.isMesh) return;
		meshes++;
		const pos = o.geometry.attributes.position, uv = o.geometry.attributes.uv, idx = o.geometry.index;
		const n = idx ? idx.count : pos.count;
		for (let i = 0; i < n; i += 3) {
			const id = (k) => (idx ? idx.getX(i + k) : i + k);
			const v = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, id(k)).applyMatrix4(o.matrixWorld));
			const nrm = new THREE.Vector3().subVectors(v[1], v[0]).cross(new THREE.Vector3().subVectors(v[2], v[0]));
			if (nrm.length() < 1e-9) continue;
			nrm.normalize();
			tris.push({ mesh: o.uuid, part: o.name, colour: look(o, uv ? uv.getX(id(0)).toFixed(3) : ''), v, n: nrm, d: nrm.dot(v[0]) });
		}
	});
	if (!meshes) { console.error('no parts in ' + file); process.exit(1); }
	// bucket by rounded normal
	const buckets = new Map();
	for (const t of tris) {
		const key = [t.n.x, t.n.y, t.n.z].map((c) => Math.round(c * 200)).join(',');
		(buckets.get(key) || buckets.set(key, []).get(key)).push(t);
	}
	const hits = new Map();
	for (const list of buckets.values()) {
		list.sort((a, b) => a.d - b.d);
		for (let i = 0; i < list.length; i++) {
			for (let j = i + 1; j < list.length && list[j].d - list[i].d < GAP; j++) {
				const A = list[i], B = list[j];
				// the same look (colour, material, glow): the pixels are identical, nothing can flicker
				if (A.colour === B.colour) continue;
				if (A.n.dot(B.n) < 0.9999) continue;
				// project onto the plane
				const u = new THREE.Vector3(1, 0, 0); if (Math.abs(A.n.x) > 0.9) u.set(0, 1, 0);
				const e1 = new THREE.Vector3().crossVectors(A.n, u).normalize(), e2 = new THREE.Vector3().crossVectors(A.n, e1);
				const P = (t) => t.v.map((p) => [p.dot(e1), p.dot(e2)]);
				const ar = overlap(P(A), P(B));
				if (ar > MIN_AREA) {
					const key = [A.part, B.part].sort().join(' + ') + (A.mesh === B.mesh ? ' (two colours)' : '');
					const c = A.v[0].clone().add(A.v[1]).add(A.v[2]).divideScalar(3);
					const h = hits.get(key) || { area: 0, at: `(${c.x.toFixed(1)}, ${c.y.toFixed(1)}, ${c.z.toFixed(1)})`, gap: B.d - A.d };
					h.area += ar; hits.set(key, h);
				}
			}
		}
	}
	for (const [k, h] of hits) console.log(`${k}: ${h.area.toFixed(2)} sq studs, ${h.gap.toFixed(3)} apart, near ${h.at}`);
	console.log(hits.size ? `${hits.size} pairs flicker` : 'no faces share a plane');
	process.exit(hits.size ? 1 : 0);
}, (e) => { console.error(e); process.exit(1); });
