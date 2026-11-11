// Hand-pressed clay parts for Node (a "squishy clay" look, any stop-motion clay look): shapes are welded, then their surface is
// pushed in and out by seeded 3D noise (lumpy, uneven, a little wobbly; same seed = same lumps), each shape gets a tiny random lean and squash,
// and a matte chalky palette texture (each colour a 32 px column, a soft light-top ramp plus mottled grain) at roughness 0.85.
// Use: beside the kit's style-c-glb.mjs (exportGLB), npm install three@0.170.0, then
//   import { makeClayPalette, ClayPart, G, fitBox } from './clay-glb.mjs'; const pal = makeClayPalette({ tomato: '#e5553d', ... }, { seed: 7 });
//   const p = new ClayPart(pal, 'Body'); p.add(G.sphere(0.7), 'tomato', { pos: [0, 1, 0], scale: [1, 0.9, 1], lump: 0.05 }); group.add(p.mesh());
//   lump: noise height as a share of the shape's size (0 = smooth), flat: faceted (crystals), keepFloor: vertices at the shape's bottom stay flat.
//   fitBox(group, [x, y, z]) bakes a scale so the group's box is exactly that size (any null keeps that axis' scale) and stands it on 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---------- seeded noise ----------
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function hash3(x, y, z, seed) {
	let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144269504) | 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296 * 2 - 1;
}
const fade = (t) => t * t * (3 - 2 * t);
export function noise3(x, y, z, seed = 1) { // smooth value noise, -1..1
	const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
	const L = (a, b, t) => a + (b - a) * t; let r = 0;
	const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz, seed);
	r = L(L(L(c(0, 0, 0), c(1, 0, 0), xf), L(c(0, 1, 0), c(1, 1, 0), xf), yf), L(L(c(0, 0, 1), c(1, 0, 1), xf), L(c(0, 1, 1), c(1, 1, 1), xf), yf), zf);
	return r;
}
const fbm = (x, y, z, seed) => noise3(x, y, z, seed) * 0.7 + noise3(x * 2.3 + 11, y * 2.3 + 7, z * 2.3 + 3, seed + 1) * 0.3;

// ---------- palette ----------
const SIZE = 512, COLS = 16, CW = SIZE / COLS;
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// colours: { name: '#rrggbb' }; glows: { name: '#rrggbb' } (flat, no grain). Ramp: v 0.1 = a touch darker, v 0.9 = a touch lighter (chalky).
export function makeClayPalette(colours, glows = {}, { seed = 7, roughness = 0.85, grain = 0.055, light = 0.1, dark = 0.12, chalk = '#fff6e6' } = {}) {
	const names = [...Object.keys(colours), ...Object.keys(glows)];
	if (names.length > COLS) throw new Error('up to 16 colours');
	const W = hex2rgb(chalk), data = new Uint8Array(SIZE * SIZE * 4);
	names.forEach((n, i) => {
		const isGlow = n in glows, c = hex2rgb(isGlow ? glows[n] : colours[n]);
		for (let y = 0; y < SIZE; y++) for (let x = i * CW; x < (i + 1) * CW; x++) {
			const t = y / (SIZE - 1); let px;
			if (isGlow) px = c;
			else {
				const g = (noise3(x / 5, y / 5, i * 3.1, seed) * 0.6 + noise3(x / 1.7, y / 1.7, i * 5.3, seed + 9) * 0.4) * grain; // mottled chalk grain
				const l = light * Math.max(0, t - 0.5) * 2, d = dark * Math.max(0, 0.5 - t) * 2;
				px = c.map((v, k) => Math.max(0, Math.min(255, (v * (1 - d)) * (1 - l) + W[k] * l + 255 * g)));
			}
			const o = (y * SIZE + x) * 4; data[o] = Math.round(px[0]); data[o + 1] = Math.round(px[1]); data[o + 2] = Math.round(px[2]); data[o + 3] = 255;
		}
	});
	for (let i = names.length; i < COLS; i++) for (let y = 0; y < SIZE; y++) for (let x = i * CW; x < (i + 1) * CW; x++) {
		const o = (y * SIZE + x) * 4, s = (y * SIZE + (names.length * CW - 1)) * 4; data.copyWithin(o, s, s + 4);
	}
	const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'ClayColours'; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / COLS; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Clay', map: tex, metalness: 0, roughness });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.7 });
	return { uOf, solid, glow, texture: tex, seed, glowNames: new Set(Object.keys(glows)) };
}

// ---------- shapes (centred on their own middle unless said) ----------
export const G = {
	sphere: (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h),
	hemi: (r, w = 12, h = 5) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2), // top half, flat side at y 0
	capsule: (r, len, cap = 3, radial = 10) => new THREE.CapsuleGeometry(r, len, cap, radial), // along Y
	rbox: (w, h, d, r, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r),
	coil: (R, tube, radial = 6, tubular = 18, arc = Math.PI * 2) => new THREE.TorusGeometry(R, tube, radial, tubular, arc), // a rolled clay snake, XY plane
	cyl: (rt, rb, h, radial = 12, hs = 1) => new THREE.CylinderGeometry(rt, rb, h, radial, hs),
	// a puffy pot from y 0 to h: rounded bottom and top edges (bevel b), radius r (rt for the top), hs rings up the side; bottom: false leaves it open underneath
	puffy: (r, h, b, radial = 12, { rt = r, hs = 1, top = true, bottom = true } = {}) => {
		const p = bottom ? [[0, 0]] : [];
		for (const a of [-90, -45, 0]) p.push([r - b + b * Math.cos(a * Math.PI / 180), b + b * Math.sin(a * Math.PI / 180)]);
		for (let k = 1; k < hs; k++) { const t = k / hs; p.push([r + (rt - r) * t, b + (h - 2 * b) * t]); }
		if (top) { for (const a of [0, 45, 90]) p.push([rt - b + b * Math.cos(a * Math.PI / 180), h - b + b * Math.sin(a * Math.PI / 180)]); p.push([0, h]); }
		else p.push([rt, h], [0, h]);
		return new THREE.LatheGeometry(p.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial);
	},
	// the same pot squared off in plan: w x d, a superellipse of power n (2 = round, 4 = soft square), so big sides still have points to lump
	pot: (w, d, h, b, { n = 4, radial = 24, rt = 1, hs = 2, top = true, bottom = true, steps = 3 } = {}) => { // steps 2: a soft chamfer, fewer triangles
		const br = Math.min(0.9, b / (Math.min(w, d) / 2)), D = Math.PI / 180, p = bottom ? [[0, 0]] : [];
		const lo = steps === 2 ? [-90, 0] : [-90, -45, 0], hi = steps === 2 ? [0, 90] : [0, 45, 90];
		for (const a of lo) p.push([1 - br + br * Math.cos(a * D), b + b * Math.sin(a * D)]);
		for (let k = 1; k < hs; k++) { const t = k / hs; p.push([1 + (rt - 1) * t, b + (h - 2 * b) * t]); }
		if (top) { for (const a of hi) p.push([rt - br + br * Math.cos(a * D), h - b + b * Math.sin(a * D)]); p.push([0, h]); }
		else p.push([rt, h], [0, h]);
		const g = new THREE.LatheGeometry(p.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial), P = g.attributes.position;
		for (let i = 0; i < P.count; i++) {
			const x = P.getX(i), z = P.getZ(i), rr = Math.hypot(x, z), t = Math.atan2(z, x), c = Math.cos(t), s = Math.sin(t);
			P.setX(i, rr * (w / 2) * Math.sign(c) * Math.abs(c) ** (2 / n)); P.setZ(i, rr * (d / 2) * Math.sign(s) * Math.abs(s) ** (2 / n));
		}
		return g;
	},
	lathe: (pts, radial = 12) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial),
	// a rolled snake along a path of [x, y, z] points (a clay trace or a coil laid on a surface), round ends
	snake: (pts, r, radial = 6, perSeg = 3) => {
		const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.2);
		const segs = Math.max(2, (pts.length - 1) * perSeg);
		const tube = new THREE.TubeGeometry(curve, segs, r, radial, false);
		const a = new THREE.SphereGeometry(r, radial, 4), b = a.clone();
		a.translate(...pts[0]); b.translate(...pts[pts.length - 1]);
		for (const g of [tube, a, b]) for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
		return mergeGeometries([tube.toNonIndexed(), a.toNonIndexed(), b.toNonIndexed()]);
	},
};

// ---------- a named part merged from clay shapes ----------
// add(geom, colour, { pos, rot, scale, lump = 0.045, freq, wobble = 1, flat = false, keepFloor = true, smooth = true })
export class ClayPart {
	constructor(pal, name, { glow = false, seed } = {}) { this.pal = pal; this.name = name; this.glow = glow; this.geoms = []; this.r = rng(seed ?? hashName(name) ^ pal.seed); }
	add(geom, colour, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], lump = 0.045, freq, wobble = 1, flat = false, keepFloor = true } = {}) {
		const u = this.pal.uOf[colour]; if (u === undefined) throw new Error('no colour ' + colour);
		const R = this.r, sc = typeof scale === 'number' ? [scale, scale, scale] : scale;
		const wob = (a) => (R() * 2 - 1) * a * wobble;
		let g = geom.clone();
		for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
		g = mergeVertices(g.index ? g : g, 1e-4);
		// hand-made: a little lean and squash per shape
		const e = new THREE.Euler(rot[0] + wob(0.045), rot[1] + wob(0.08), rot[2] + wob(0.045));
		const s = new THREE.Vector3(sc[0] * (1 + wob(0.035)), sc[1] * (1 + wob(0.035)), sc[2] * (1 + wob(0.035)));
		g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(e), s));
		g.computeBoundingBox(); g.computeVertexNormals();
		const bb = g.boundingBox, size = bb.getSize(new THREE.Vector3()), rad = Math.max(0.05, size.length() / 2), P = g.attributes.position, N = g.attributes.normal;
		const amp = lump * rad, f = freq ?? 1.25 / Math.max(0.35, rad) * 1.6, seed = this.pal.seed, y0 = bb.min.y;
		const isGlow = this.glow || this.pal.glowNames.has(colour);
		if (amp > 0) for (let i = 0; i < P.count; i++) {
			const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
			const d = fbm(x * f, y * f, z * f, seed) * amp;
			const wx = noise3(x * f * 0.6 + 31, y * f * 0.6, z * f * 0.6, seed + 3) * amp * 0.5;
			const wz = noise3(x * f * 0.6, y * f * 0.6 + 17, z * f * 0.6, seed + 5) * amp * 0.5;
			const floor = keepFloor && y - y0 < 1e-3;
			P.setXYZ(i, x + N.getX(i) * d + wx, floor ? y : y + N.getY(i) * d, z + N.getZ(i) * d + wz);
		}
		if (flat) { g = g.toNonIndexed(); g.setIndex([...Array(g.attributes.position.count).keys()]); }
		g.computeVertexNormals(); g.computeBoundingBox();
		const P2 = g.attributes.position, b2 = g.boundingBox, h = Math.max(1e-6, b2.max.y - b2.min.y), uv = new Float32Array(P2.count * 2);
		for (let i = 0; i < P2.count; i++) {
			const x = P2.getX(i), y = P2.getY(i), z = P2.getZ(i);
			const du = isGlow ? 0 : noise3(x * 2.2 + 5, y * 2.2, z * 2.2, seed + 21) * 0.42 / COLS; // wander inside the colour's column: grain
			uv[i * 2] = u + du;
			uv[i * 2 + 1] = isGlow ? 0.5 : Math.min(0.97, Math.max(0.03, 0.1 + 0.8 * (y - b2.min.y) / h + noise3(x * 2.6, y * 2.6 + 9, z * 2.6, seed + 23) * 0.07)); // grain breaks up, not stripes
		}
		g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		this.geoms.push(g);
		return this;
	}
	mesh() {
		const g = mergeGeometries(this.geoms); if (!g) throw new Error('merge failed in ' + this.name);
		const m = new THREE.Mesh(g, this.glow ? this.pal.glow : this.pal.solid); m.name = this.name; return m;
	}
}
function hashName(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

// bake a scale into every mesh so the group's box is exactly [x, y, z] (null keeps that axis' share), centred on x/z, bottom at 0
export function fitBox(group, [tx, ty, tz]) {
	group.updateMatrixWorld(true);
	const b = new THREE.Box3().setFromObject(group), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
	const k = [tx ? tx / s.x : null, ty ? ty / s.y : null, tz ? tz / s.z : null];
	const known = k.filter((v) => v != null), avg = known.reduce((a, v) => a + v, 0) / known.length;
	const sx = k[0] ?? avg, sy = k[1] ?? avg, sz = k[2] ?? avg;
	const m = new THREE.Matrix4().makeScale(sx, sy, sz).multiply(new THREE.Matrix4().makeTranslation(-c.x, -b.min.y, -c.z));
	const meshes = []; group.traverse((o) => { if (o.isMesh) meshes.push(o); });
	const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
	for (const o of meshes) { // meshes in sub-groups are moved up to the group, their names kept
		const local = inv.clone().multiply(o.matrixWorld);
		o.geometry.applyMatrix4(m.clone().multiply(local)); o.geometry.computeVertexNormals();
		o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
		if (o.parent !== group) group.add(o);
	}
	for (const ch of [...group.children]) if (!ch.isMesh) group.remove(ch);
	group.updateMatrixWorld(true);
	return [sx, sy, sz];
}
