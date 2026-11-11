// Toy-brick pieces for Node (a "brick kit" look): bricks and plates with a bevelled top edge (the seam you see between bricks), a small gap
// between neighbours, 8-sided studs (22 triangles each, no hidden bottom), round bricks, slopes, flat printed decals and faceted gems, all added to
// candy-glb.mjs Parts so each part is one mesh in one gradient palette (set light and dark low for plastic, roughness about 0.35).
// Use: beside candy-glb.mjs and style-c-glb.mjs, npm install three@0.170.0, then
//   import { Bricks } from './brick-glb.mjs'; const K = new Bricks(pal, { pitch: 2, studR: 0.6, studH: 0.4 });
//   K.brick(part, 'red', [x0, y0, z0], [x1, y1, z1]);  K.studs(part, 'red', x0, z0, x1, z1, y);   (boxes are min and max corners, 1 unit = 1 stud)
import * as THREE from 'three';

// convex shapes: every triangle is turned to face away from the centre c, then flat normals
const nonIndexed = (P, c = [0, 0, 0]) => {
	for (let k = 0; k < P.length; k += 9) {
		const a = new THREE.Vector3(P[k], P[k + 1], P[k + 2]), b = new THREE.Vector3(P[k + 3], P[k + 4], P[k + 5]), d = new THREE.Vector3(P[k + 6], P[k + 7], P[k + 8]);
		const n = b.clone().sub(a).cross(d.clone().sub(a)), mid = a.clone().add(b).add(d).divideScalar(3).sub(new THREE.Vector3(...c));
		if (n.dot(mid) < 0) for (let q = 0; q < 3; q++) { const t = P[k + 3 + q]; P[k + 3 + q] = P[k + 6 + q]; P[k + 6 + q] = t; }
	}
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); return g;
};
const quad = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d); // a b c d in order round the face (nonIndexed turns it outwards)

// A box with its top edges bevelled by b: 20 triangles, centred on its middle.
export function bevelBox(w, h, d, b) {
	b = Math.max(0.001, Math.min(b, w / 3, d / 3, h / 2));
	const x = w / 2, y = h / 2, z = d / 2, m = y - b, ix = x - b, iz = z - b, P = [];
	const B = [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]], M = [[-x, m, -z], [x, m, -z], [x, m, z], [-x, m, z]], T = [[-ix, y, -iz], [ix, y, -iz], [ix, y, iz], [-ix, y, iz]];
	quad(P, B[0], B[3], B[2], B[1]); // bottom
	for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(P, B[i], B[j], M[j], M[i]); quad(P, M[i], M[j], T[j], T[i]); }
	quad(P, T[0], T[1], T[2], T[3]); // top
	return nonIndexed(P);
}

// A slope brick: full height h at the back (+Z), a lip of height lip at the front (-Z), the slope between; centred like a box. 16 triangles.
export function slopeBox(w, h, d, lip) {
	const x = w / 2, y = h / 2, z = d / 2, l = -y + lip, P = [];
	const b0 = [-x, -y, -z], b1 = [x, -y, -z], b2 = [x, -y, z], b3 = [-x, -y, z], f0 = [-x, l, -z], f1 = [x, l, -z], t2 = [x, y, z], t3 = [-x, y, z];
	quad(P, b0, b3, b2, b1); quad(P, b0, b1, f1, f0); quad(P, f0, f1, t2, t3); quad(P, b2, b3, t3, t2);
	P.push(...b1, ...b2, ...t2, ...b1, ...t2, ...f1); P.push(...b3, ...b0, ...f0, ...b3, ...f0, ...t3); // sides
	return nonIndexed(P);
}

// One 8-sided stud from y 0 to h: smooth sides, flat top, no bottom. 22 triangles.
export function studGeo(r, h, sides = 8) {
	const pos = [], nor = [], a0 = Math.PI / sides; // turned half a side so flats face the axes
	const pt = (i, y) => { const a = a0 + (i / sides) * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r]; };
	const nr = (i) => { const a = a0 + (i / sides) * Math.PI * 2; return [Math.cos(a), 0, Math.sin(a)]; };
	for (let i = 0; i < sides; i++) {
		const j = i + 1, A = pt(i, 0), B = pt(j, 0), C = pt(j, h), D = pt(i, h);
		pos.push(...A, ...D, ...C, ...A, ...C, ...B); nor.push(...nr(i), ...nr(i), ...nr(j), ...nr(i), ...nr(j), ...nr(j));
	}
	for (let i = 1; i < sides - 1; i++) { const A = pt(0, h), B = pt(i, h), C = pt(i + 1, h); pos.push(...A, ...C, ...B); nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0); }
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
	return g;
}

// A round brick from y 0 to h, radius r, top edge bevelled by b, open bottom.
export function roundGeo(r, h, b, sides = 12) {
	const pts = [[r, 0], [r, h - b], [r - b, h], [0, h]].map(([a, c]) => new THREE.Vector2(Math.max(a, 1e-4), c));
	return new THREE.LatheGeometry(pts, sides);
}

// A faceted gem: n-sided, point on top (tip), short point below (foot), from y 0 to h.
export function gemGeo(r, h, n = 6, foot = 0.18, tip = 0.32) {
	const P = [], yf = h * foot, yt = h * (1 - tip), at = (i, y) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r]; };
	for (let i = 0; i < n; i++) {
		const j = i + 1;
		P.push(0, 0, 0, ...at(i, yf), ...at(j, yf));
		quad(P, at(i, yf), at(i, yt), at(j, yt), at(j, yf));
		P.push(...at(i, yt), 0, h, 0, ...at(j, yt));
	}
	return nonIndexed(P, [0, h / 2, 0]);
}

export class Bricks {
	constructor(pal, { pitch = 2, studR = 0.6, studH = 0.4, gap = 0.03, bevel = 0.12 } = {}) {
		Object.assign(this, { pal, pitch, studR, studH, gap, bevel });
		this.tris = 0;
	}
	// a brick or plate filling the box min..max, pulled in by gap on the four sides so neighbours show a seam
	brick(part, col, [x0, y0, z0], [x1, y1, z1], { bevel = this.bevel, gap = this.gap, rotY = 0 } = {}) {
		const w = x1 - x0 - 2 * gap, d = z1 - z0 - 2 * gap, h = y1 - y0;
		part.add(bevelBox(w, h, d, bevel), col, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], rot: [0, rotY, 0] });
		return this;
	}
	// a plain box (hidden fillers, decals): 12 triangles
	box(part, col, [x0, y0, z0], [x1, y1, z1], opts = {}) {
		part.add(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), col, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], ...opts });
		return this;
	}
	// a slope brick; face: which way the slope looks ('-z' front, '+z', '-x', '+x')
	slope(part, col, [x0, y0, z0], [x1, y1, z1], face = '-z', lip = 0.4) {
		const g = this.gap, rot = { '-z': 0, '+z': Math.PI, '-x': -Math.PI / 2, '+x': Math.PI / 2 }[face];
		const turned = face === '-x' || face === '+x';
		const w = (turned ? z1 - z0 : x1 - x0) - 2 * g, d = (turned ? x1 - x0 : z1 - z0) - 2 * g;
		part.add(slopeBox(w, y1 - y0, d, lip), col, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], rot: [0, rot, 0] });
		return this;
	}
	// studs on a top face at height y over the rectangle, one per pitch cell (or at the given centres)
	studs(part, col, x0, z0, x1, z1, y, { pitch = this.pitch, r = this.studR, h = this.studH, skip = () => false } = {}) {
		const nx = Math.max(1, Math.round((x1 - x0) / pitch)), nz = Math.max(1, Math.round((z1 - z0) / pitch));
		for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
			const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (k + 0.5) * (z1 - z0) / nz;
			if (!skip(x, z)) part.add(studGeo(r, h), col, { pos: [x, y, z] });
		}
		return this;
	}
	stud(part, col, x, y, z, r = this.studR, h = this.studH) { part.add(studGeo(r, h), col, { pos: [x, y, z] }); return this; }
	round(part, col, x, z, y0, h, r, { bevel = this.bevel, sides = 12 } = {}) { part.add(roundGeo(r, h, bevel, sides), col, { pos: [x, y0, z] }); return this; }
	// a flat round print or light facing -Z (front) at depth zf (its front face), or facing up when up is true
	disc(part, col, x, y, zf, r, t = 0.05, { up = false, sides = 8 } = {}) {
		const g = new THREE.CylinderGeometry(r, r, t, sides);
		if (up) part.add(g, col, { pos: [x, y + t / 2, zf] });
		else part.add(g, col, { pos: [x, y, zf + t / 2], rot: [Math.PI / 2, 0, Math.PI / sides] });
		return this;
	}
	gem(part, col, x, z, y0, r, h, { tiltX = 0, tiltZ = 0, yaw = 0, n = 6 } = {}) {
		part.add(gemGeo(r, h, n), col, { pos: [x, y0, z], rot: [tiltX, yaw, tiltZ], flat: true });
		return this;
	}
}
