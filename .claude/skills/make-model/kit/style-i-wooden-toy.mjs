// Style I "Wooden Toy" kit: painted-wood pieces with no outlines. Soft-bevelled hulls (rounded blocks, turned cylinders and cones, balls, pegs)
// from style-a-painted-toy.mjs, plus a faint wood grain baked into one texture: each colour is a column whose width holds grain lines and whose
// height is the painted light (dark at v=0, the paint colour at v=0.75, a warm highlight above). Each piece's u runs across its grain, sized by the
// piece (big blocks show many lines, pegs a few), so the grain follows the piece when it turns. Satin "Paint", slightly shiny "Gilt" and "Glow".
// Use: import { makeWoodPalette, part, paintWood, peg, cylX, cylZ, rbox, rcyl, ellip, crystal, at } from './style-i-wooden-toy.mjs'
//   (three@0.170.0; export with exportGLB from style-c-glb.mjs). part(pal, name, [{ pts, col, m }]); paintWood(modelGroup) per model, before placing it.
//   Colours: makeWoodPalette({ beech: ['#e3b97f', 0.16], ... }, { amber: '#ffb21a' }, { gilt: ['gold'] }); second number = grain strength (0 = none).
// A colour with grain 0 (and every glow) keeps one u, so check-planes sees its pieces as one look; grained pieces of one colour in one plane
// (a door block and its arch disc) differ in grain and DO flicker, so keep them 0.04 apart too.
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
import { rbox, rcyl, ellip, crystal, at } from './style-a-painted-toy.mjs';
export { rbox, rcyl, ellip, crystal, at };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const TOP = 0.75, COLS = 16, TW = 1024, TH = 512, PAD = 6;
const CW = TW / COLS;

// ---------- palette ----------
export function makeWoodPalette(paints, glows = {}, { gilt = [], lines = 13, roughness = 0.58 } = {}) {
	const names = [...Object.keys(paints), ...Object.keys(glows)];
	if (names.length > COLS) throw new Error(`makeWoodPalette takes up to ${COLS} colours`);
	const data = new Uint8Array(TW * TH * 4), shadow = [0.52, 0.43, 0.42], light = [255, 244, 222];
	names.forEach((n, ci) => {
		const glow = n in glows, spec = glow ? [glows[n], 0] : Array.isArray(paints[n]) ? paints[n] : [paints[n], 0.07];
		const c = hex(spec[0]), amp = spec[1];
		for (let y = 0; y < TH; y++) {
			const s = (y + 0.5) / TH; let rgb;
			if (glow) rgb = c;
			else if (s <= TOP) { const t = s / TOP; rgb = c.map((v, i) => v * (shadow[i] + (1 - shadow[i]) * t)); }
			else { const t = (s - TOP) / (1 - TOP) * 0.45; rgb = c.map((v, i) => v + (light[i] - v) * t); }
			for (let x = 0; x < CW; x++) {
				let k = 1;
				if (amp > 0) { // growth rings seen side on: each ring lighter early, darker late, with a thin dark line; lines wander a little
					const u = (x - PAD) / (CW - 2 * PAD);
					const w = u * lines + 0.35 * Math.sin(s * 9.0 + ci * 1.7 + u * 3.1) + 0.18 * Math.sin(s * 23.0 + ci * 0.9 + u * 11.0);
					const f = w - Math.floor(w);
					const late = f * f * 0.55, line = Math.pow(Math.max(0, 1 - Math.abs(f - 0.92) / 0.09), 2);
					const fleck = 0.25 * Math.sin(x * 12.9898 + y * 78.233 + ci) * Math.sin(y * 3.7 + x * 0.61);
					k = 1 - amp * (late + line * 0.9 + fleck * 0.15);
				}
				const i = (y * TW + ci * CW + x) * 4;
				data[i] = Math.round(Math.min(255, rgb[0] * k)); data[i + 1] = Math.round(Math.min(255, rgb[1] * k)); data[i + 2] = Math.round(Math.min(255, rgb[2] * k)); data[i + 3] = 255;
			}
		}
	});
	const tex = new THREE.DataTexture(data, TW, TH, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'PaintedWood'; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
	tex.generateMipmaps = true; tex.needsUpdate = true;
	const col = {}, amp = {}; names.forEach((n, i) => { col[n] = i; amp[n] = n in glows ? 0 : Array.isArray(paints[n]) ? paints[n][1] : 0.07; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Paint', map: tex, metalness: 0, roughness });
	const giltM = new THREE.MeshStandardMaterial({ name: 'Gilt', map: tex, metalness: 0.25, roughness: 0.38 });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.5 });
	return { col, amp, solid, gilt: giltM, glow, tex, giltNames: new Set(gilt), glowNames: new Set(Object.keys(glows)) };
}

// ---------- extra shapes and placing ----------
// A peg (turned rod) from point a to point b, radius r (rounded ends).
export function peg(a, b, r, { sides = 10, col } = {}) {
	const A = V(...a), B = V(...b), d = B.clone().sub(A), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
	const m = new THREE.Matrix4().compose(A, q, V(1, 1, 1));
	return { pts: rcyl(r, r, d.length(), { r: Math.min(r * 0.45, d.length() / 2 - 1e-3), sides, seg: 1 }), col, m };
}
// A disc or wheel along X (cylX) or Z (cylZ), centred at (x, y, z): radius r, thickness t.
export function cylX(r, t, x, y, z, { sides = 14, col, bevel } = {}) {
	return { pts: rcyl(r, r, t, { r: bevel ?? Math.min(t * 0.35, r * 0.3), sides, seg: 1 }), col, m: at(x + t / 2, y, z, { rz: Math.PI / 2 }) };
}
export function cylZ(r, t, x, y, z, { sides = 14, col, bevel } = {}) {
	return { pts: rcyl(r, r, t, { r: bevel ?? Math.min(t * 0.35, r * 0.3), sides, seg: 1 }), col, m: at(x, y, z - t / 2, { rx: Math.PI / 2 }) };
}

// ---------- a part: one mesh from several hulls, each { pts, col, m }; u follows the wood grain, v is set later by paintWood ----------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export function part(pal, name, prims, { grainRef = 14 } = {}) {
	const pos = [], nrm = [], uv = [], idx = [];
	for (const { pts, col, m = new THREE.Matrix4() } of prims) {
		const ci = pal.col[col]; if (ci === undefined) throw new Error(`${name}: no colour ${col}`);
		const nm = new THREE.Matrix3().getNormalMatrix(m);
		const P = pts.map((q) => q.p.clone().applyMatrix4(m)), N = pts.map((q) => (q.n ? q.n.clone().applyMatrix3(nm).normalize() : null));
		// grain: lines run along the piece's longest local axis, so u varies across the other two
		const sc = new THREE.Vector3(); m.decompose(new THREE.Vector3(), new THREE.Quaternion(), sc);
		const L = pts.map((q) => V(q.p.x * sc.x, q.p.y * sc.y, q.p.z * sc.z));
		const box = new THREE.Box3().setFromPoints(L), size = box.getSize(V()), ax = ['x', 'y', 'z'];
		const long = ax.reduce((a, b) => (size[b] > size[a] ? b : a)), [ai, aj] = ax.filter((a) => a !== long);
		const g = L.map((p) => p[ai] * 0.8 + p[aj] * 0.6);
		const g0 = Math.min(...g), g1 = Math.max(...g), span = Math.min(1, Math.max(0.12, (g1 - g0) / grainRef)), off = rnd() * (1 - span);
		const uOf = (i) => !pal.amp[col] ? (ci + 0.5) / COLS : (ci * CW + PAD + (off + span * (g1 > g0 ? (g[i] - g0) / (g1 - g0) : 0.5)) * (CW - 2 * PAD)) / TW;
		const hull = new ConvexHull().setFromPoints(P), id = new Map(P.map((p, i) => [p, i]));
		const faces = hull.faces.map((f) => { const vs = []; let e = f.edge; do { vs.push(id.get(e.head().point)); e = e.next; } while (e !== f.edge); return vs; });
		if (pts.faceted === true) {
			for (const vs of faces) for (let i = 1; i < vs.length - 1; i++) {
				const tri = [vs[0], vs[i], vs[i + 1]], [a, b, c] = tri.map((k) => P[k]), n = V().subVectors(b, a).cross(V().subVectors(c, a)).normalize();
				for (const k of tri) { idx.push(pos.length / 3); pos.push(P[k].x, P[k].y, P[k].z); nrm.push(n.x, n.y, n.z); uv.push(uOf(k), 0.5); }
			}
		} else {
			const remap = new Map();
			for (const vs of faces) for (const v of vs) if (!remap.has(v)) { remap.set(v, pos.length / 3); pos.push(P[v].x, P[v].y, P[v].z); nrm.push(N[v].x, N[v].y, N[v].z); uv.push(uOf(v), 0.5); }
			for (const vs of faces) for (let i = 1; i < vs.length - 1; i++) idx.push(remap.get(vs[0]), remap.get(vs[i]), remap.get(vs[i + 1]));
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
	geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	geo.setIndex(idx);
	const glow = /^Glow_/.test(name), gilt = prims.every((p) => pal.giltNames.has(p.col));
	const mesh = new THREE.Mesh(geo, glow ? pal.glow : gilt ? pal.gilt : pal.solid); mesh.name = name; return mesh;
}

// ---------- bake the painted light into v: a little lighter on top and facing the front-left, darker underneath and at the floor ----------
export function paintWood(group, { lift = {} } = {}) {
	group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(group), H = Math.max(box.max.y - box.min.y, 0.01), Ld = V(-0.45, 0, -0.75).normalize();
	group.traverse((o) => {
		if (!o.isMesh || o.material.name === 'Glow') return;
		const p = o.geometry.attributes.position, n = o.geometry.attributes.normal, uv = o.geometry.attributes.uv, add = lift[o.name] || 0;
		const mw = o.matrixWorld, nmw = new THREE.Matrix3().getNormalMatrix(mw), P = V(), Nn = V();
		for (let i = 0; i < p.count; i++) {
			P.fromBufferAttribute(p, i).applyMatrix4(mw); Nn.fromBufferAttribute(n, i).applyMatrix3(nmw).normalize();
			const y = P.y - box.min.y, side = Nn.x * Ld.x + Nn.z * Ld.z;
			let s = TOP - 0.17 + 0.17 * Nn.y + 0.07 * side + 0.1 * (y / H - 0.6) + add;
			s -= 0.12 * Math.max(0, 1 - y / (0.05 * H + 0.2)); // contact shadow at the floor
			uv.setY(i, Math.min(0.97, Math.max(0.04, s)));
		}
		uv.needsUpdate = true;
	});
	return box;
}
