// Cel-shaded ("toon") parts for Node: every colour has two tones (light side, shadow side) baked into one texture with a hard edge between
// them by each vertex's facing, and every piece gets a thick dark ink Outline_<name> as an inverted shell (mitred so flat faces get the full width).
// Use: beside the kit's style-c-glb.mjs (exportGLB and the Node stand-ins), npm install three@0.170.0, then
//   import { makeToonPalette, ToonPart, T, LIGHT } from './toon-glb.mjs';
//   const pal = makeToonPalette({ red: ['#ff3b3b', '#c41f4a'], ink: ['#2b1030', '#2b1030'] });  // [light, shadow]; needs an 'ink' colour
//   const p = new ToonPart(pal, 'Body', { t: 0.07 }); p.add(T.sphere(0.7), 'red', { pos: [0, 1, 0], bend }); group.add(...p.meshes());
// How the hard edge works in any engine: v = 0.5 +- facing, the texture steps from shadow to light at v = 0.5, and a triangle that spans both
// sides interpolates v across that step, so the edge follows the curve of the shape, not the triangles. Light comes from LIGHT (up, front, -X).
// A viewer that lights it should use a toon material with its sun along LIGHT and a step at n.L = THRESHOLD.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';

export const LIGHT = new THREE.Vector3(-0.42, 0.8, -0.42).normalize(); // from above, the front and -X (the viewer's right)
export const THRESHOLD = 0.08;
const SIZE = 512;
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// colours: { name: [lightHex, shadowHex] } (a single hex uses one tone for both). Rows 0..255 are the shadow tone, 256..511 the light tone.
export function makeToonPalette(colours, { roughness = 0.8 } = {}) {
	const names = Object.keys(colours);
	if (names.length > 16) throw new Error('up to 16 colours, got ' + names.length);
	if (!names.includes('ink')) throw new Error("the palette needs an 'ink' colour for the outlines");
	const data = new Uint8Array(SIZE * SIZE * 4), cw = SIZE / 16;
	for (let i = 0; i < 16; i++) {
		const spec = colours[names[Math.min(i, names.length - 1)]], [lt, sh] = Array.isArray(spec) ? spec : [spec, spec];
		const L = hex2rgb(lt), D = hex2rgb(sh);
		for (let y = 0; y < SIZE; y++) {
			const c = y >= SIZE / 2 ? L : D;
			for (let x = i * cw; x < (i + 1) * cw; x++) { const o = (y * SIZE + x) * 4; data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255; }
		}
	}
	const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'ToonColours'; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / 16; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Toon', map: tex, metalness: 0, roughness });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness });
	const ink = new THREE.MeshStandardMaterial({ name: 'Ink', map: tex, metalness: 0, roughness: 1 });
	return { uOf, solid, glow, ink, texture: tex, data };
}

// shapes, centred on their own middle unless said
export const T = {
	sphere: (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h),
	hemi: (r, w = 12, h = 4) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2), // flat side at y 0 (open: close it with a disc)
	capsule: (r, len, cap = 2, radial = 8) => new THREE.CapsuleGeometry(r, len, cap, radial), // along Y
	rbox: (w, h, d, r, seg = 1) => new RoundedBoxGeometry(w, h, d, seg, r), // seg 1 is 108 triangles: use cbox for small things
	box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
	// a box with every edge cut at 45 degrees by b (26 flat faces, 68 triangles), the cheap chunky box
	cbox: (w, h, d, b) => {
		const pts = [], [x, y, z] = [w / 2, h / 2, d / 2];
		for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
			pts.push(new THREE.Vector3(sx * (x - b), sy * (y - b), sz * z), new THREE.Vector3(sx * (x - b), sy * y, sz * (z - b)), new THREE.Vector3(sx * x, sy * (y - b), sz * (z - b)));
		return new ConvexGeometry(pts);
	},
	cyl: (rt, rb, h, radial = 10) => new THREE.CylinderGeometry(rt, rb, h, radial),
	cone: (r, h, radial = 8) => new THREE.ConeGeometry(r, h, radial),
	torus: (R, tube, radial = 5, tubular = 12, arc = Math.PI * 2) => new THREE.TorusGeometry(R, tube, radial, tubular, arc),
	// a closed lathe from [radius, y] points, bottom to top (first and last radius 0 for a closed shape)
	lathe: (pts, radial = 12) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial),
	// a puffy drum from y 0 to h, radius r, rounded edges b
	puffy: (r, h, b, radial = 12) => {
		const p = [[0, 0]];
		for (const a of [-90, -30, 30]) p.push([r - b + b * Math.cos(a * Math.PI / 180), b + b * Math.sin(a * Math.PI / 180)]);
		for (const a of [-30, 30, 90]) p.push([r - b + b * Math.cos(a * Math.PI / 180), h - b + b * Math.sin(a * Math.PI / 180)]);
		p.push([0, h]);
		return T.lathe(p, radial);
	},
};

// deformers: functions (Vector3) => void applied in model space after placing, for "slightly bent" shapes
export const bend = {
	// lean: x and z shift by k * (height above y0)^2, a banana curve
	lean: (kx, kz, y0 = 0) => (v) => { const h = Math.max(0, v.y - y0); v.x += kx * h * h; v.z += kz * h * h; },
	// twist round a vertical axis through (cx, cz) by `a` radians per stud of height
	twist: (a, cx = 0, cz = 0, y0 = 0) => (v) => { const t = a * (v.y - y0), c = Math.cos(t), s = Math.sin(t), x = v.x - cx, z = v.z - cz; v.x = cx + x * c - z * s; v.z = cz + x * s + z * c; },
	// bulge: push out from a vertical axis most at height ym, by fraction k
	bulge: (k, ym, half, cx = 0, cz = 0) => (v) => { const f = 1 + k * Math.max(0, 1 - ((v.y - ym) / half) ** 2); v.x = cx + (v.x - cx) * f; v.z = cz + (v.z - cz) * f; },
	chain: (...fs) => (v) => { for (const f of fs) f(v); },
};

// drop zero-area triangles (a lathe's points on its axis make them): they cost triangles and show nothing
function dropFlat(g) {
	const P = g.attributes.position, N = g.attributes.normal, keep = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
	for (let i = 0; i < P.count; i += 3) {
		a.fromBufferAttribute(P, i); b.fromBufferAttribute(P, i + 1); c.fromBufferAttribute(P, i + 2);
		if (b.clone().sub(a).cross(c.clone().sub(a)).lengthSq() > 1e-12) keep.push(i);
	}
	if (keep.length * 3 === P.count) return g;
	const np = new Float32Array(keep.length * 9), nn = new Float32Array(keep.length * 9);
	keep.forEach((i, k) => { for (let j = 0; j < 9; j++) { np[k * 9 + j] = P.array[i * 3 + j]; nn[k * 9 + j] = N.array[i * 3 + j]; } });
	const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(np, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
	return out;
}
const vFor = (n) => 0.5 + 0.42 * Math.max(-1, Math.min(1, (n.dot(LIGHT) - THRESHOLD) / 0.3));

// One named piece made of shapes, each in a palette colour, plus its ink shell.
// opts: t outline width (studs), floorY / floorLift: the shell stays floorLift above floorY (or half way up a piece lower than that), glow, outline: false
export class ToonPart {
	constructor(pal, name, { t = 0.06, glow = false, floorY = 0, floorLift = 0.5, outline = true } = {}) {
		Object.assign(this, { pal, name, t, glow, floorY, floorLift, outline }); this.bodies = []; this.shapes = [];
	}
	add(geom, colour, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], deform = null, t = null, shell = true, flatTone = null } = {}) {
		const u = this.pal.uOf[colour];
		if (u === undefined) throw new Error('no colour ' + colour);
		let g = geom.index ? geom.toNonIndexed() : geom.clone();
		for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
		const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
			new THREE.Vector3(...(typeof scale === 'number' ? [scale, scale, scale] : scale)));
		g.applyMatrix4(m);
		if (!g.attributes.normal) g.computeVertexNormals();
		g = dropFlat(g);
		if (deform) {
			const P = g.attributes.position, N = g.attributes.normal, v = new THREE.Vector3(), w = new THREE.Vector3();
			for (let i = 0; i < P.count; i++) { // move each point, and bend its normal by moving a point a little along it
				v.fromBufferAttribute(P, i); w.fromBufferAttribute(N, i).multiplyScalar(0.01).add(v);
				deform(v); deform(w); P.setXYZ(i, v.x, v.y, v.z); w.sub(v).normalize(); N.setXYZ(i, w.x, w.y, w.z);
			}
		}
		// a mirrored scale (an odd number of negative axes) turns triangles inside out: put them back
		if (m.determinant() < 0) { const P = g.attributes.position, N = g.attributes.normal; for (let i = 0; i < P.count; i += 3) for (const A of [P, N]) { const x = A.getX(i + 1), y = A.getY(i + 1), z = A.getZ(i + 1); A.setXYZ(i + 1, A.getX(i + 2), A.getY(i + 2), A.getZ(i + 2)); A.setXYZ(i + 2, x, y, z); } }
		const N = g.attributes.normal, uv = new Float32Array(N.count * 2), n = new THREE.Vector3();
		for (let i = 0; i < N.count; i++) { n.fromBufferAttribute(N, i); uv[i * 2] = u; uv[i * 2 + 1] = flatTone === 'light' ? 0.92 : flatTone === 'shadow' ? 0.08 : vFor(n); }
		g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		this.bodies.push(g);
		if (shell && this.outline) this.shapes.push({ g, t: t ?? this.t });
		return this;
	}
	// the ink shell of one shape: weld, average the face normals, push each point out so every face moves out by t, turn inside out
	static shellOf(g, t) {
		let s = new THREE.BufferGeometry(); s.setAttribute('position', g.attributes.position.clone());
		s = mergeVertices(s, 1e-4);
		const P = s.attributes.position, I = s.index.array, cnt = P.count;
		const sum = new Float32Array(cnt * 3), faces = Array.from({ length: cnt }, () => []);
		const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), fn = new THREE.Vector3();
		const fns = [];
		for (let f = 0; f < I.length; f += 3) {
			a.fromBufferAttribute(P, I[f]); b.fromBufferAttribute(P, I[f + 1]); c.fromBufferAttribute(P, I[f + 2]);
			fn.subVectors(b, a).cross(c.clone().sub(a));
			if (fn.lengthSq() < 1e-14) continue;
			fn.normalize(); const k = fns.length; fns.push(fn.clone());
			for (const vi of [I[f], I[f + 1], I[f + 2]]) { sum[vi * 3] += fn.x; sum[vi * 3 + 1] += fn.y; sum[vi * 3 + 2] += fn.z; faces[vi].push(k); }
		}
		const out = new Float32Array(cnt * 3), nv = new THREE.Vector3(), p = new THREE.Vector3();
		for (let i = 0; i < cnt; i++) {
			nv.set(sum[i * 3], sum[i * 3 + 1], sum[i * 3 + 2]);
			p.fromBufferAttribute(P, i);
			if (nv.lengthSq() < 1e-12) { out.set([p.x, p.y, p.z], i * 3); continue; }
			nv.normalize();
			let mn = 1; for (const k of faces[i]) mn = Math.min(mn, nv.dot(fns[k]));
			const d = t / Math.max(0.55, mn); // mitre: a box corner moves t * 1.73 so its faces move t
			out.set([p.x + nv.x * d, p.y + nv.y * d, p.z + nv.z * d], i * 3);
		}
		s.setAttribute('position', new THREE.BufferAttribute(out, 3));
		const idx = Array.from(I); for (let f = 0; f < idx.length; f += 3) [idx[f + 1], idx[f + 2]] = [idx[f + 2], idx[f + 1]];
		s.setIndex(idx);
		s = s.toNonIndexed(); s.computeVertexNormals();
		return s;
	}
	meshes() {
		const body = mergeGeometries(this.bodies);
		{ const N = body.attributes.normal, n = new THREE.Vector3(); for (let i = 0; i < N.count; i++) { n.fromBufferAttribute(N, i).normalize(); N.setXYZ(i, n.x, n.y, n.z); } }
		const bm = new THREE.Mesh(body, this.glow ? this.pal.glow : this.pal.solid); bm.name = this.name;
		if (!this.shapes.length) return [bm];
		body.computeBoundingBox();
		const bb = body.boundingBox, lift = Math.min(this.floorLift, Math.max(0, bb.min.y - this.floorY) + (bb.max.y - bb.min.y) / 2);
		const fl = this.floorY + lift, u = this.pal.uOf.ink;
		const shells = this.shapes.map(({ g, t }) => {
			let s = ToonPart.shellOf(g, t), P = s.attributes.position;
			for (let i = 0; i < P.count; i++) if (P.getY(i) < fl) P.setY(i, fl);
			// triangles squashed flat onto the clamp height sit hidden inside the piece: drop them
			const keep = []; for (let i = 0; i < P.count; i += 3) if (!(P.getY(i) === fl && P.getY(i + 1) === fl && P.getY(i + 2) === fl)) keep.push(i);
			if (keep.length * 3 < P.count) {
				const np = new Float32Array(keep.length * 9); keep.forEach((i, k) => { for (let j = 0; j < 9; j++) np[k * 9 + j] = P.array[i * 3 + j]; });
				s = new THREE.BufferGeometry(); s.setAttribute('position', new THREE.BufferAttribute(np, 3)); P = s.attributes.position;
			}
			s.computeVertexNormals();
			const uv = new Float32Array(P.count * 2); for (let i = 0; i < P.count; i++) { uv[i * 2] = u; uv[i * 2 + 1] = 0.5; }
			s.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
			return s;
		});
		const om = new THREE.Mesh(mergeGeometries(shells), this.pal.ink); om.name = 'Outline_' + this.name;
		return [bm, om];
	}
}

// Scale a group (uniformly, or per axis with exact = true) so its box including outlines fits sx x sy x sz, then stand it on y0 centred on x/z 0.
export function fitGroup(group, { sx, sy, sz, exact = false, y0 = 0 }) {
	group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(group), s = box.getSize(new THREE.Vector3());
	let k = [sx ? sx / s.x : Infinity, sy ? sy / s.y : Infinity, sz ? sz / s.z : Infinity];
	if (!exact) { const m = Math.min(...k); k = [m, m, m]; } else k = k.map((v) => (v === Infinity ? 1 : v));
	const c = box.getCenter(new THREE.Vector3());
	group.traverse((o) => {
		if (!o.isMesh) return;
		const P = o.geometry.attributes.position;
		for (let i = 0; i < P.count; i++) P.setXYZ(i, (P.getX(i) - c.x) * k[0], (P.getY(i) - box.min.y) * k[1] + y0, (P.getZ(i) - c.z) * k[2]);
		P.needsUpdate = true; o.geometry.computeBoundingBox();
	});
	return k;
}
