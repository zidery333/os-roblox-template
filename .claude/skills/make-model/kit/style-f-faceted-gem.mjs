// Style F "Faceted Gem" kit: low-poly pieces where every face is one flat cut facet (flat normals, no smoothing), each facet its own shade,
// baked into one gradient texture (each colour a column: deep at v=0, the colour itself at v=0.75, a warm highlight at v=1), no outlines.
// Use: import { makeGemPalette, box, prism, gem, ball, dome, at, part, shadeModel } from './style-f-faceted-gem.mjs' (three@0.170.0; export with
// exportGLB from style-c-glb.mjs, which also sets up the Node stand-ins). part(pal, name, [{ pts, col, m }]) makes one mesh; call shadeModel(modelGroup)
// once per model (before placing it in a row): bright on top, deeper below and low down, and a per-facet shift so the light picks out each cut.
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export const TOP = 0.75; // v where a column shows its own colour (what a flat top face gets)

// ---------- palette: up to 16 columns. paints: name -> '#hex' or { stops: [[v, '#hex'], ...], sparkle } ; glows stay flat ----------
// A plain '#hex' ramps from a deep warm shade (towards wine, never towards blue) up to the colour at TOP, then to a warm cream highlight.
export function makeGemPalette(paints, glows = {}, { W = 512, H = 256, deep = '#4a1630', light = '#fff3d2' } = {}) {
	const names = [...Object.keys(paints), ...Object.keys(glows)];
	if (names.length > 16) throw new Error('makeGemPalette takes up to 16 colours');
	const cw = W / 16, data = new Uint8Array(W * H * 4), sparkle = {};
	names.forEach((n, ci) => {
		const spec = glows[n] ?? paints[n], glow = n in glows;
		let stops;
		if (typeof spec === 'string') {
			const c = hex(spec);
			stops = glow ? [[0, c], [1, c]] : [[0, mix(c.map((v) => v * 0.5), hex(deep), 0.3)], [TOP, c], [1, mix(c, hex(light), 0.42)]];
		} else stops = spec.stops.map(([v, h]) => [v, hex(h)]);
		sparkle[n] = (typeof spec === 'object' && spec.sparkle) || 1;
		for (let y = 0; y < H; y++) {
			const s = (y + 0.5) / H; let k = 0;
			while (k < stops.length - 2 && s > stops[k + 1][0]) k++;
			const [v0, c0] = stops[k], [v1, c1] = stops[k + 1], rgb = mix(c0, c1, Math.min(1, Math.max(0, (s - v0) / (v1 - v0))));
			for (let x = ci * cw; x < (ci + 1) * cw; x++) { const i = (y * W + x) * 4; data[i] = Math.round(rgb[0]); data[i + 1] = Math.round(rgb[1]); data[i + 2] = Math.round(rgb[2]); data[i + 3] = 255; }
		}
	});
	const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'FacetLight'; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / 16; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Facet', map: tex, metalness: 0, roughness: 0.7, flatShading: true });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.6, flatShading: true });
	return { uOf, solid, glow, tex, sparkle, names, glowNames: new Set(Object.keys(glows)) };
}

// ---------- point sets (bottom at y = 0, centred on x/z); every shape is drawn as a convex hull of flat facets ----------
// Box w x h x d with its edges cut off by ch (0 = plain box); tw/td make the top narrower (a roof, a tapered body).
export function box(w, h, d, { ch = 0, tw = w, td = d } = {}) {
	const pts = [];
	for (const [y, hw, hd] of [[0, w / 2, d / 2], [h, tw / 2, td / 2]]) {
		const c = Math.min(ch, hw * 0.9, hd * 0.9, h * 0.45), yi = y === 0 ? c : h - c;
		for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
			if (c <= 0) { pts.push(V(sx * hw, y, sz * hd)); continue; }
			pts.push(V(sx * (hw - c), y, sz * (hd - c)), V(sx * hw, yi, sz * (hd - c)), V(sx * (hw - c), yi, sz * hd));
		}
	}
	return pts;
}
// n-sided prism or frustum along Y: bottom radius rb, top radius rt (to the corners), height h; rot turns it; flat: radii measured to the flats.
export function prism(rb, rt, h, { sides = 6, rot = 0, flat = false } = {}) {
	const k = flat ? 1 / Math.cos(Math.PI / sides) : 1, pts = [];
	for (let i = 0; i < sides; i++) { const f = rot + (i / sides) * Math.PI * 2;
		pts.push(V(Math.cos(f) * rb * k, 0, Math.sin(f) * rb * k), V(Math.cos(f) * Math.max(rt, 0.001) * k, h, Math.sin(f) * Math.max(rt, 0.001) * k)); }
	return pts;
}
// A cut gem crystal standing on its base: a narrower foot ring, a wide shoulder ring turned half a step (so the sides are triangles), a point.
export function gem(rad, h, { sides = 6, foot = 0.72, shoulder = 0.58, crown = 0.86, rot = 0 } = {}) {
	const pts = [], st = Math.PI / sides;
	for (let i = 0; i < sides; i++) { const f = rot + i * 2 * st;
		pts.push(V(Math.cos(f) * rad * foot, 0, Math.sin(f) * rad * foot));
		pts.push(V(Math.cos(f + st) * rad, h * shoulder, Math.sin(f + st) * rad));
		pts.push(V(Math.cos(f) * rad * crown, h * (shoulder + (1 - shoulder) * 0.42), Math.sin(f) * rad * crown)); }
	pts.push(V(0, h, 0));
	return pts;
}
// A low-poly ball (icosahedron, detail 0 or 1) of radius r, sitting on 0; s stretches it.
export function ball(r, { detail = 0, s = [1, 1, 1] } = {}) {
	const g = new THREE.IcosahedronGeometry(r, detail), p = g.attributes.position, pts = [];
	for (let i = 0; i < p.count; i++) pts.push(V(p.getX(i) * s[0], p.getY(i) * s[1] + r * s[1], p.getZ(i) * s[2]));
	return pts;
}
// A faceted dome: rings of a sphere (rings above the base, sides round) cut flat at 0, radius r, height hgt.
export function dome(r, hgt = r, { sides = 8, rings = 2, rot = 0 } = {}) {
	const pts = [];
	for (let j = 0; j < rings; j++) { const t = (j / rings) * Math.PI / 2, rr = Math.cos(t) * r, y = Math.sin(t) * hgt, o = rot + (j % 2) * Math.PI / sides;
		for (let i = 0; i < sides; i++) { const f = o + (i / sides) * Math.PI * 2; pts.push(V(Math.cos(f) * rr, y, Math.sin(f) * rr)); } }
	pts.push(V(0, hgt, 0));
	return pts;
}

// ---------- placing: at(x, y, z, { rx, ry, rz, s }) -> a Matrix4 (scale, then turn Y, X, Z, then move) ----------
export function at(x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0, s = [1, 1, 1] } = {}) {
	return new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(...(typeof s === 'number' ? [s, s, s] : s)));
}

// ---------- a part: one mesh of flat facets from several hulls, each { pts, col, m } ----------
let primId = 0;
export function part(pal, name, prims) {
	const pos = [], nrm = [], uv = [], facets = []; // facets: per triangle { key, col }
	for (const { pts, col, m = new THREE.Matrix4() } of prims) {
		const u = pal.uOf[col]; if (u === undefined) throw new Error(`${name}: no colour ${col}`);
		const P = pts.map((q) => q.clone().applyMatrix4(m)), id = primId++;
		const hull = new ConvexHull().setFromPoints(P);
		for (const f of hull.faces) {
			const vs = []; let e = f.edge; do { vs.push(e.head().point); e = e.next; } while (e !== f.edge);
			for (let i = 1; i < vs.length - 1; i++) {
				const [a, b, c] = [vs[0], vs[i], vs[i + 1]], n = V().subVectors(b, a).cross(V().subVectors(c, a));
				if (n.lengthSq() < 1e-12) continue; n.normalize();
				// one key per flat cut: triangles of the same plane in the same hull get the same shade
				const key = `${id}|${n.toArray().map((x) => Math.round(x * 50)).join(',')}|${Math.round(n.dot(a) * 20)}`;
				for (const p of [a, b, c]) { pos.push(p.x, p.y, p.z); nrm.push(n.x, n.y, n.z); uv.push(u, TOP); }
				facets.push({ key, col });
			}
		}
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
	g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	g.userData.facets = facets;
	const glow = /^Glow_/.test(name);
	const mesh = new THREE.Mesh(g, glow ? pal.glow : pal.solid); mesh.name = name; return mesh;
}

// a steady pseudo-random number in [-1, 1] from a string
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) / 4294967295) * 2 - 1; }

// ---------- bake the facet light: one v per facet from its normal, its height in the model and its own small shift ----------
// Top faces sit near TOP (their true colour), sides and undersides go deeper, low facets a little deeper still, high ones a little brighter.
// jitter: how much each facet differs from its neighbour (times the colour's sparkle); lift: per-part brightening.
export function shadeModel(group, pal, { jitter = 0.09, lift = {} } = {}) {
	group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(group), H = Math.max(box.max.y - box.min.y, 0.01), L = V(-0.5, 0, -0.8).normalize();
	group.traverse((o) => {
		if (!o.isMesh || !o.geometry.userData.facets) return;
		const glowPart = o.material.name === 'Glow', p = o.geometry.attributes.position, n = o.geometry.attributes.normal, uv = o.geometry.attributes.uv;
		const add = lift[o.name] || 0, wm = o.matrixWorld, nm = new THREE.Matrix3().getNormalMatrix(wm);
		o.geometry.userData.facets.forEach(({ key, col }, t) => {
			if (glowPart || pal.glowNames.has(col)) return;
			const i = t * 3, N = V(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm).normalize();
			const cy = ([0, 1, 2].reduce((s, k) => s + V(p.getX(i + k), p.getY(i + k), p.getZ(i + k)).applyMatrix4(wm).y, 0) / 3 - box.min.y) / H;
			const side = N.x * L.x + N.z * L.z;
			let s = TOP - 0.22 * (1 - N.y) - 0.1 * Math.max(0, -N.y) + 0.07 * side + 0.12 * (cy - 0.55) + jitter * pal.sparkle[col] * hash(key) + add;
			s = Math.min(0.985, Math.max(0.02, s));
			for (let k = 0; k < 3; k++) uv.setY(i + k, s);
		});
		uv.needsUpdate = true;
	});
	return box;
}
