// Style A "Painted Toy" kit: soft-bevelled pieces (rounded boxes, rounded cylinders/cones, domes, gem crystals) built as convex hulls with smooth
// bevel normals, and painted light baked into one gradient texture (each colour a column, dark at v=0 to light at v=1), no outlines.
// Use: import { makePaintPalette, rbox, rcyl, ellip, crystal, at, part, paintModel } from './style-a-painted-toy.mjs' (three@0.170.0; export with
// exportGLB from style-c-glb.mjs, which also sets up the Node stand-ins). part() takes [{ pts, col, m }]; paintModel(modelGroup) bakes the light (call it per model, before placing it in a row).
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// ---------- palette: up to 32 columns; paint colours get a shade ramp, glow colours stay flat ----------
// The ramp: v = s. s = TOP (0.75) is the paint colour itself (what a flat top face shows), lower is a warm darker shade, higher a warm highlight.
export const TOP = 0.75;
export function makePaintPalette(paints, glows = {}, { W = 512, H = 256 } = {}) {
	const names = [...Object.keys(paints), ...Object.keys(glows)];
	if (names.length > 32) throw new Error('makePaintPalette takes up to 32 colours');
	const cw = W / 32, data = new Uint8Array(W * H * 4), shadow = [0.5, 0.42, 0.44], light = [255, 246, 226];
	names.forEach((n, ci) => {
		const glow = n in glows, c = hex(glow ? glows[n] : paints[n]);
		for (let y = 0; y < H; y++) {
			const s = (y + 0.5) / H; let rgb;
			if (glow) rgb = c;
			else if (s <= TOP) { const t = s / TOP; rgb = c.map((v, i) => v * (shadow[i] + (1 - shadow[i]) * t)); }
			else { const t = (s - TOP) / (1 - TOP) * 0.5; rgb = c.map((v, i) => v + (light[i] - v) * t); }
			for (let x = ci * cw; x < (ci + 1) * cw; x++) { const i = (y * W + x) * 4; data[i] = Math.round(rgb[0]); data[i + 1] = Math.round(rgb[1]); data[i + 2] = Math.round(rgb[2]); data[i + 3] = 255; }
		}
	});
	const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'PaintedLight'; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / 32; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Paint', map: tex, metalness: 0, roughness: 0.82 });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.6 });
	return { uOf, solid, glow, tex, glowNames: new Set(Object.keys(glows)) };
}

// ---------- point sets: each point carries its smooth normal (p, n); bottom of every shape at y = 0, centred on x/z ----------
function octant(seg) { const d = []; for (let i = 0; i <= seg; i++) for (let j = 0; j <= seg - i; j++) d.push(V(i, j, seg - i - j).normalize()); return d; }
// Rounded box w x h x d, bevel r; tw/td make the top narrower (a fat roof). seg 1 = chamfer, 2 = soft, 3 = round.
export function rbox(w, h, d, { r = 0.2, seg, tw = w, td = d } = {}) {
	seg ??= Math.min(w, h, d) >= 1.2 ? 2 : 1; // small pieces get one chamfer, which still reads soft with smooth normals
	r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3, tw / 2 - 1e-3, td / 2 - 1e-3);
	const tax = Math.atan2((w - tw) / 2, h - 2 * r), taz = Math.atan2((d - td) / 2, h - 2 * r), pts = [];
	for (const sy of [-1, 1]) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
		const hx = (sy > 0 ? tw : w) / 2 - r, hz = (sy > 0 ? td : d) / 2 - r, cy = sy > 0 ? h - r : r;
		for (const o of octant(seg)) {
			const dd = V(o.x * sx, o.y * sy, o.z * sz), n = dd.clone();
			n.y += (Math.abs(dd.x) * Math.tan(tax) + Math.abs(dd.z) * Math.tan(taz)) * (1 - Math.abs(dd.y)); n.normalize();
			pts.push({ p: V(sx * hx + r * dd.x, cy + r * dd.y, sz * hz + r * dd.z), n });
		}
	}
	return pts;
}
// Rounded cylinder or cone along Y: bottom radius rb, top radius rt, height h, bevel r.
export function rcyl(rb, rt, h, { r = 0.15, sides = 16, seg, rot = 0 } = {}) {
	seg ??= Math.max(rb, rt) >= 1.2 && h >= 0.8 ? 2 : 1;
	r = Math.min(r, h / 2 - 1e-3, Math.max(rb, rt) - 1e-3);
	const a = Math.atan2(rb - rt, h), pts = [];
	const ring = (R, y, th) => { R = Math.max(R, 0.02); for (let k = 0; k < sides; k++) { const f = rot + (k / sides) * Math.PI * 2, cx = Math.cos(f), cz = Math.sin(f);
		pts.push({ p: V(cx * (R + r * Math.cos(th)), y + r * Math.sin(th), cz * (R + r * Math.cos(th))), n: V(cx * Math.cos(th), Math.sin(th), cz * Math.cos(th)).normalize() }); } };
	for (let i = 0; i <= seg; i++) { const th = a + (Math.PI / 2 - a) * (i / seg); ring(rt - r, h - r, th); }
	for (let i = 0; i <= seg; i++) { const th = -Math.PI / 2 + (a + Math.PI / 2) * (i / seg); ring(rb - r, r, th); }
	return pts;
}
// Ellipsoid (or its top half with half: true, flat bottom at 0); a full one sits on 0.
export function ellip(rx, ry, rz, { w = 14, hs = 8, half = false } = {}) {
	const pts = [], y0 = half ? 0 : ry;
	for (let j = 0; j <= hs; j++) {
		const t = half ? (j / hs) * Math.PI / 2 : -Math.PI / 2 + (j / hs) * Math.PI;
		for (let k = 0; k < (Math.abs(Math.cos(t)) < 1e-6 ? 1 : w); k++) {
			const f = (k / w) * Math.PI * 2, x = Math.cos(t) * Math.cos(f), y = Math.sin(t), z = Math.cos(t) * Math.sin(f);
			pts.push({ p: V(rx * x, y0 + ry * y, rz * z), n: V(x / rx, y / ry, z / rz).normalize() });
		}
	}
	if (half) for (let k = 0; k < w; k++) { const f = (k / w) * Math.PI * 2; pts.push({ p: V(rx * Math.cos(f) * 0.999, 0, rz * Math.sin(f) * 0.999), n: V(0, -1, 0) }); }
	return pts;
}
// A gem crystal: a prism with a pointed tip, drawn with flat facets.
export function crystal(rad, h, { sides = 6, shoulder = 0.68, rot = 0 } = {}) {
	const pts = [];
	for (let k = 0; k < sides; k++) { const f = rot + (k / sides) * Math.PI * 2;
		pts.push({ p: V(Math.cos(f) * rad, 0, Math.sin(f) * rad) }, { p: V(Math.cos(f) * rad * 0.92, h * shoulder, Math.sin(f) * rad * 0.92) }); }
	pts.push({ p: V(0, h, 0) });
	pts.faceted = true; return pts;
}

// ---------- placing: at(x, y, z, { rx, ry, rz, s }) -> a Matrix4 (scale, then turn X, Y, Z, then move) ----------
export function at(x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0, s = [1, 1, 1] } = {}) {
	return new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(...(typeof s === 'number' ? [s, s, s] : s)));
}

// ---------- a part: one mesh from several hulls, each { pts, col, m } ----------
export function part(pal, name, prims) {
	const pos = [], nrm = [], uv = [], idx = [];
	for (const { pts, col, m = new THREE.Matrix4() } of prims) {
		const u = pal.uOf[col]; if (u === undefined) throw new Error(`${name}: no colour ${col}`);
		const nm = new THREE.Matrix3().getNormalMatrix(m);
		const P = pts.map((q) => q.p.clone().applyMatrix4(m)), N = pts.map((q) => (q.n ? q.n.clone().applyMatrix3(nm).normalize() : null));
		const hull = new ConvexHull().setFromPoints(P), id = new Map(P.map((p, i) => [p, i]));
		const faces = hull.faces.map((f) => { const vs = []; let e = f.edge; do { vs.push(id.get(e.head().point)); e = e.next; } while (e !== f.edge); return vs; });
		if (pts.faceted === true) {
			for (const vs of faces) for (let i = 1; i < vs.length - 1; i++) {
				const [a, b, c] = [P[vs[0]], P[vs[i]], P[vs[i + 1]]], n = V().subVectors(b, a).cross(V().subVectors(c, a)).normalize();
				for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nrm.push(n.x, n.y, n.z); uv.push(u, 0.5); }
			}
		} else {
			const remap = new Map();
			for (const vs of faces) for (const v of vs) if (!remap.has(v)) { remap.set(v, pos.length / 3); pos.push(P[v].x, P[v].y, P[v].z); nrm.push(N[v].x, N[v].y, N[v].z); uv.push(u, 0.5); }
			for (const vs of faces) for (let i = 1; i < vs.length - 1; i++) idx.push(remap.get(vs[0]), remap.get(vs[i]), remap.get(vs[i + 1]));
		}
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
	g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	g.setIndex(idx);
	const glow = /^Glow_/.test(name);
	const mesh = new THREE.Mesh(g, glow ? pal.glow : pal.solid); mesh.name = name; return mesh;
}

// ---------- bake the painted light: v of every vertex from its normal and its height in the model ----------
// Lighter on top, darker underneath and low down, a little lighter on the side facing the front-left light. lift: per-part brightening.
export function paintModel(group, { lift = {} } = {}) {
	group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(group), H = Math.max(box.max.y - box.min.y, 0.01), L = V(-0.45, 0, -0.75).normalize();
	group.traverse((o) => {
		if (!o.isMesh || o.material.name === 'Glow') return;
		const p = o.geometry.attributes.position, n = o.geometry.attributes.normal, uv = o.geometry.attributes.uv, add = lift[o.name] || 0;
		for (let i = 0; i < p.count; i++) {
			const y = p.getY(i) - box.min.y, ny = n.getY(i), side = n.getX(i) * L.x + n.getZ(i) * L.z;
			let s = TOP - 0.3 + 0.3 * ny + 0.1 * side + 0.16 * (y / H - 0.6) + add;
			s -= 0.16 * Math.max(0, 1 - y / (0.06 * H + 0.25)); // painted contact shadow at the floor
			uv.setY(i, Math.min(0.985, Math.max(0.03, s)));
		}
		uv.needsUpdate = true;
	});
	return box;
}
