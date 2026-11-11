// Style C pieces as convex hulls of points, each with a black Outline_ shell (corners pushed out by t), plus unbroken rings and stars and outline sizes per piece.
// Use: copy it and style-c-glb.mjs (palette, export) beside your build script, npm install three@0.170.0, then import { hullPiece, settle, ... } from './hull-pieces.mjs'.
// hullPiece(pal, name, [points...], colour, t, shells, { floorY, floorLift }) -> [mesh, Outline_ mesh]; t is a number or { min } for "2% of the piece, never under min".
// It is hullPiece(), not piece() (style-c-glb.mjs has its own piece()). The floor lift can be changed or turned off and stops half way up
// a piece lower than 1. settle() moves whole parts (outline children and Spin_ groups too). Flat points stop with an error.
// A non-convex shape split into convex bits draws a black line at every joint: build it whole with ringShape / fanShape instead.
// pal needs { uOf, solid } with an 'outline' colour, as makePalette in style-c-glb.mjs gives.
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';

export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const FLOOR_LIFT = 0.5; // shells stop this far above the floor: an inside-out shell's floor face shows from above and flickers nearer

// Where shells stop for a set of points: floorLift over floorY, but never above half way up the points' own height.
// floorLift: false means no stop at all (a piece nowhere near a floor).
function floorStop(points, { floorY = 0, floorLift = FLOOR_LIFT } = {}) {
	if (floorLift === false) return -Infinity;
	const ys = points.map((p) => p.y), lo = Math.min(...ys), hi = Math.max(...ys);
	return floorY + Math.min(floorLift, Math.max(0, lo - floorY) + (hi - lo) / 2);
}

export function hullTris(points) {
	const tris = [];
	try {
		const hull = new ConvexHull().setFromPoints(points);
		for (const f of hull.faces) {
			const loop = []; let e = f.edge;
			do { loop.push(e.head().point.clone()); e = e.next; } while (e !== f.edge);
			for (let i = 1; i < loop.length - 1; i++) tris.push([loop[0], loop[i], loop[i + 1]]);
		}
	} catch { tris.length = 0; /* points in a line, or one point: caught just below */ }
	// flat points (all in one plane) make a hull with no inside: stop rather than build a paper-thin piece
	const vol = tris.reduce((v, [p, q, r]) => v + p.dot(new THREE.Vector3().crossVectors(q, r)), 0) / 6;
	const size = new THREE.Box3().setFromPoints(points).getSize(new THREE.Vector3()).length();
	if (!(Math.abs(vol) > 1e-9 * size ** 3))
		throw new Error(`hullTris: these ${points.length} points are flat or in a line, so they make no solid: give the piece some thickness`);
	return tris;
}
const normalOf = ([a, b, c]) => new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();

// The shell: every corner pushed out along its faces' average so each face moves out by about t.
export function shellPoints(points, t, floor = {}) {
	const tris = hullTris(points), stop = floorStop(points, floor);
	const byKey = new Map();
	const key = (p) => `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`;
	for (const tr of tris) {
		const n = normalOf(tr);
		for (const p of tr) { const k = key(p); const e = byKey.get(k) || { p, ns: [] }; e.ns.push(n); byKey.set(k, e); }
	}
	const out = [];
	for (const { p, ns } of byKey.values()) {
		const uniq = ns.filter((n, i) => ns.findIndex((m) => m.dot(n) > 0.999) === i);
		const d = uniq.reduce((s, n) => s.add(n), new THREE.Vector3()).normalize();
		const minDot = Math.max(0.35, Math.min(...uniq.map((n) => n.dot(d))));
		const q = p.clone().addScaledVector(d, t / minDot);
		q.y = Math.max(q.y, stop);
		out.push(q);
	}
	return out;
}

export class Part {
	constructor(pal) { this.pal = pal; this.pos = []; this.nrm = []; this.uv = []; }
	tri(a, b, c, colour) {
		const n = normalOf([a, b, c]); const u = this.pal.uOf[colour];
		if (u === undefined) throw new Error('no colour ' + colour);
		for (const v of [a, b, c]) { this.pos.push(v.x, v.y, v.z); this.nrm.push(n.x, n.y, n.z); this.uv.push(u, 0.5); }
	}
	hull(points, colour, flip = false) {
		for (const [a, b, c] of hullTris(points)) flip ? this.tri(a, c, b, colour) : this.tri(a, b, c, colour);
	}
	mesh(name) {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
		g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
		g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
		const m = new THREE.Mesh(g, this.pal.solid); m.name = name; return m;
	}
}

// A piece: one or more convex point sets in one colour. Returns [piece mesh, Outline_ mesh].
// shells: for a piece split into convex bits (a ring, a star), its outline split the same way, already grown,
// so neighbouring bits' outlines meet exactly and never poke through at the joints.
// t: a number, or { min } for "2% of the piece's biggest size, never under min" (StyleC.glb: 0.028 on a 1.2-wide body).
export function outlineT(hulls, t) {
	if (typeof t === 'number') return t;
	const box = new THREE.Box3().setFromPoints(hulls.flat()), s = box.getSize(new THREE.Vector3());
	return Math.max(t.min || 0, 0.02 * Math.max(s.x, s.y, s.z));
}
// floor: { floorY = 0, floorLift = 0.5 } (floorLift: false for a piece nowhere near a floor).
export function hullPiece(pal, name, hulls, colour, tIn, shells = null, floor = {}) {
	const t = outlineT(hulls, tIn);
	const body = new Part(pal), shell = new Part(pal);
	for (const pts of hulls) body.hull(pts, colour);
	const stop = floorStop(hulls.flat(), floor);
	if (shells) for (const pts of shells) shell.hull(pts.map((q) => V(q.x, Math.max(q.y, stop), q.z)), 'outline', true);
	else for (const pts of hulls) shell.hull(shellPoints(pts, t, floor), 'outline', true);
	return [body.mesh(name), shell.mesh('Outline_' + name)];
}

// Closed shapes that aren't convex (a ring, a star), drawn face by face so they have no inside joints.
// Each triangle is turned to face away from `inside` (or towards it, for the shell).
export function faceOut(part, a, b, c, colour, hint, flip) {
	const n = normalOf([a, b, c]); const out = n.dot(hint) >= 0;
	(out !== flip) ? part.tri(a, b, c, colour) : part.tri(a, c, b, colour);
}
// A ring round the up axis: outer and inner outlines (same count of points), y0 to y1.
export function ringShape(part, outer, inner, y0, y1, colour, flip = false) {
	const n = outer.length, P = (q, y) => V(q[0], y, q[1]);
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n, oi = outer[i], oj = outer[j], ii = inner[i], ij = inner[j];
		const mid = V((oi[0] + oj[0]) / 2, 0, (oi[1] + oj[1]) / 2).normalize();
		for (const [y, h] of [[y1, V(0, 1, 0)], [y0, V(0, -1, 0)]]) {
			faceOut(part, P(oi, y), P(oj, y), P(ij, y), colour, h, flip); faceOut(part, P(oi, y), P(ij, y), P(ii, y), colour, h, flip);
		}
		faceOut(part, P(oi, y0), P(oj, y0), P(oj, y1), colour, mid, flip); faceOut(part, P(oi, y0), P(oj, y1), P(oi, y1), colour, mid, flip);
		const back = mid.clone().negate();
		faceOut(part, P(ii, y0), P(ij, y0), P(ij, y1), colour, back, flip); faceOut(part, P(ii, y0), P(ij, y1), P(ii, y1), colour, back, flip);
	}
}
// A shape seen whole from its middle (a star): caps fanned from (0, 0), walls round the edge, y0 to y1.
export function fanShape(part, poly, y0, y1, colour, flip = false) {
	const n = poly.length, P = (q, y) => V(q[0], y, q[1]), O = (y) => V(0, y, 0);
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n, a = poly[i], b = poly[j];
		faceOut(part, O(y1), P(a, y1), P(b, y1), colour, V(0, 1, 0), flip);
		faceOut(part, O(y0), P(a, y0), P(b, y0), colour, V(0, -1, 0), flip);
		const h = V(b[1] - a[1], 0, -(b[0] - a[0])); const mid = V((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
		if (h.dot(mid) < 0) h.negate();
		faceOut(part, P(a, y0), P(b, y0), P(b, y1), colour, h, flip); faceOut(part, P(a, y0), P(b, y1), P(a, y1), colour, h, flip);
	}
}

// Point helpers
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// An n-sided ring round the up axis, centred (cx, y, cz), radii rx / rz, turned by a (radians).
export const ring = (n, cx, y, cz, rx, rz, a = 0) => Array.from({ length: n }, (_, i) => {
	const t = a + (i / n) * Math.PI * 2; return V(cx + Math.cos(t) * rx, y, cz + Math.sin(t) * rz);
});
// A lumpy blob, flat underneath at y0: three rings and a top point, with a little jitter.
export function blob(cx, cz, rx, rz, y0, h, seed) {
	const r = rng(seed), j = (k) => 1 + (r() - 0.5) * k;
	const pts = [
		...ring(6, cx, y0, cz, rx * 0.8, rz * 0.8, r()),
		...ring(6, cx, y0 + h * 0.45, cz, rx, rz, r() + 0.5).map((p) => p.multiply(V(1, j(0.12), 1))),
		...ring(5, cx, y0 + h * 0.85, cz, rx * 0.55, rz * 0.55, r() + 1),
		V(cx + rx * 0.1 * (r() - 0.5), y0 + h, cz + rz * 0.1 * (r() - 0.5)),
	];
	// jitter sideways only (keep the flat bottom flat)
	return pts.map((p) => V(cx + (p.x - cx) * j(0.15), p.y, cz + (p.z - cz) * j(0.15)));
}
// A chunky stick from a to b, w wide, as a box (8 corners); up keeps its flat sides level.
// A straight-up stick has no level: its sides then face along X and Z.
export function stick(a, b, w, h) {
	const d = new THREE.Vector3().subVectors(b, a).normalize();
	const ref = Math.abs(d.y) > 0.999 ? V(0, 0, 1) : V(0, 1, 0);
	const side = new THREE.Vector3().crossVectors(d, ref).normalize().multiplyScalar(w / 2);
	const up = new THREE.Vector3().crossVectors(side, d).normalize().multiplyScalar(h / 2);
	const pts = [];
	for (const e of [a, b]) for (const s of [-1, 1]) for (const u of [-1, 1]) pts.push(e.clone().addScaledVector(side, s).addScaledVector(up, u));
	return pts;
}
// A tuft: a fat base ring tapering to a blunt tip.
export function tuft(base, tip, r, seed) {
	const rr = rng(seed);
	const d = new THREE.Vector3().subVectors(tip, base).normalize();
	const a = new THREE.Vector3().crossVectors(d, V(0, 1, 0.3)).normalize(), b = new THREE.Vector3().crossVectors(d, a);
	const pts = [];
	for (let i = 0; i < 5; i++) { const t = (i / 5) * Math.PI * 2 + rr(); pts.push(base.clone().addScaledVector(a, Math.cos(t) * r).addScaledVector(b, Math.sin(t) * r)); }
	for (let i = 0; i < 3; i++) { const t = (i / 3) * Math.PI * 2; pts.push(tip.clone().addScaledVector(a, Math.cos(t) * r * 0.25).addScaledVector(b, Math.sin(t) * r * 0.25)); }
	return pts;
}
// Keep a polygon (list of [a, b]) on the side where n·p >= k (Sutherland-Hodgman, one line).
export function clipHalf(poly, nx, ny, k) {
	const out = [], s = (p) => p[0] * nx + p[1] * ny - k;
	for (let i = 0; i < poly.length; i++) {
		const p = poly[i], q = poly[(i + 1) % poly.length], sp = s(p), sq = s(q);
		if (sp >= 0) out.push(p);
		if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
	}
	return out;
}
// Push a polygon's edges out by t (corners where the moved edges meet); works for a star too.
export function growPoly(poly, t) {
	let p = poly; let a2 = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a2 += x1 * y2 - x2 * y1; }
	const sgn = a2 > 0 ? 1 : -1, n = p.length, lines = [];
	for (let i = 0; i < n; i++) {
		const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % n], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
		lines.push({ px: x1 + (sgn * dy / L) * t, py: y1 + (-sgn * dx / L) * t, dx, dy });
	}
	return p.map((_, i) => {
		const A = lines[(i + n - 1) % n], B = lines[i], den = A.dx * B.dy - A.dy * B.dx;
		const u = ((B.px - A.px) * B.dy - (B.py - A.py) * B.dx) / den;
		return [A.px + A.dx * u, A.py + A.dy * u];
	});
}
export const ngon = (n, r, a = 0) => Array.from({ length: n }, (_, i) => { const t = a + (i / n) * Math.PI * 2; return [Math.cos(t) * r, Math.sin(t) * r]; });
// A prism along X from x0 to x1 over a 2D outline of (z, y) points.
export const prismX = (poly, x0, x1, cy = 0) => poly.flatMap(([z, y]) => [V(x0, y + cy, z), V(x1, y + cy, z)]);
// A prism along Y (up) from y0 to y1 over a 2D outline of (x, z) points.
export const prismY = (poly, y0, y1) => poly.flatMap(([x, z]) => [V(x, y0, z), V(x, y1, z)]);

// Centre a model on the origin with its bottom at 0 (every part, outlines included).
// It moves each top part as a whole, so outline children, Spin_ groups and pivots all move with it.
export function settle(group) {
	group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(group);
	const off = V(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
	const inv = group.matrixWorld.clone().invert(), local = off.clone().applyMatrix4(inv).sub(V(0, 0, 0).applyMatrix4(inv));
	for (const m of group.children) m.position.add(local);
	return group;
}

