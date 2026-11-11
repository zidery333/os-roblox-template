// Shape helpers for toon creatures: keyed values, a lofted body along a spine, tapered tubes with round closed ends, bendable slabs, flat cones.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { T } from './toon3.mjs';
const V = (x, y, z) => new THREE.Vector3(x, y, z); const D2R = Math.PI / 180;
export const eulerOf = (q) => { const e = new THREE.Euler().setFromQuaternion(q); return [e.x, e.y, e.z]; };
export const floorAt = (h) => (v) => { if (v.y < h) v.y = h; };
// smooth value from keys [[u, v], ...] (cosine ease between neighbours)
export const keyed = (keys) => (u) => {
	if (u <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) if (u <= keys[i][0]) { const [u0, v0] = keys[i - 1], [u1, v1] = keys[i]; const t = (u - u0) / (u1 - u0); return v0 + (v1 - v0) * (1 - Math.cos(Math.PI * t)) / 2; }
	return keys[keys.length - 1][1];
};

// A lofted body along a spine: cross-section half width W, height above H, depth below D, keel k (narrows the bottom to a V).
// Returns { geo(segs, radial), surf(u, thetaDeg) -> {p, n}, halfX(z, y) }.
export function loft(spinePts, { W, H, D, K = () => 0 }) {
	const curve = new THREE.CatmullRomCurve3(spinePts, false, 'centripetal');
	const frame = (u) => {
		const c = curve.getPointAt(u), t = curve.getTangentAt(u);
		const side = t.clone().cross(V(0, 1, 0)).normalize(), up = side.clone().cross(t).normalize();
		if (up.y < 0) { up.negate(); side.negate(); }
		return { c, t, side, up };
	};
	const sec = (u, th) => { const cx = Math.cos(th), sy = Math.sin(th); const k = K(u); const x = W(u) * cx * (sy < 0 ? 1 - k * Math.pow(-sy, 1.3) : 1); const y = sy > 0 ? H(u) * sy : D(u) * sy; return [x, y]; };
	const point = (u, th) => { const f = frame(u), [x, y] = sec(u, th); return f.c.clone().addScaledVector(f.side, x).addScaledVector(f.up, y); };
	const surf = (u, deg) => {
		const th = deg * D2R, e = 1e-3, p = point(u, th);
		const du = point(Math.min(1, u + e), th).sub(point(Math.max(0, u - e), th)), dt = point(u, th + e).sub(point(u, th - e));
		const n = dt.clone().cross(du).normalize();
		if (n.dot(p.clone().sub(frame(u).c)) < 0) n.negate();
		return { p, n };
	};
	const geo = (segs, radial, { capA = true, capB = true } = {}) => {
		const rings = [], CAP = 3;
		const ringAt = (u, scale = 1, shift = 0) => { const f = frame(u), pts = []; for (let k = 0; k < radial; k++) { const [x, y] = sec(u, (k / radial) * Math.PI * 2); pts.push(f.c.clone().addScaledVector(f.t, shift).addScaledVector(f.side, x * scale).addScaledVector(f.up, y * scale)); } return pts; };
		const rA = Math.min(W(0), H(0), D(0)), rB = Math.min(W(1), H(1), D(1));
		if (capA) for (let j = CAP - 1; j >= 1; j--) { const ph = (j / CAP) * Math.PI / 2; rings.push(ringAt(0, Math.cos(ph), -rA * Math.sin(ph))); }
		for (let i = 0; i <= segs; i++) rings.push(ringAt(i / segs));
		if (capB) for (let j = 1; j <= CAP - 1; j++) { const ph = (j / CAP) * Math.PI / 2; rings.push(ringAt(1, Math.cos(ph), rB * Math.sin(ph))); }
		const f0 = frame(0), f1 = frame(1);
		const pA = f0.c.clone().addScaledVector(f0.t, -rA), pB = f1.c.clone().addScaledVector(f1.t, rB);
		const pos = [...pA.toArray()]; for (const r of rings) for (const p of r) pos.push(...p.toArray()); pos.push(...pB.toArray());
		const idx = [], last = 1 + rings.length * radial;
		for (let k = 0; k < radial; k++) idx.push(0, 1 + ((k + 1) % radial), 1 + k);
		for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < radial; k++) { const a = 1 + i * radial + k, b = 1 + i * radial + ((k + 1) % radial); idx.push(a, b, a + radial, b, b + radial, a + radial); }
		const lr = 1 + (rings.length - 1) * radial; for (let k = 0; k < radial; k++) idx.push(lr + k, lr + ((k + 1) % radial), last);
		const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
		const P = g.attributes.position, N = g.attributes.normal, mid = curve.getPointAt(0.5); let dot = 0;
		for (let i = 0; i < P.count; i++) dot += (P.getX(i) - mid.x) * N.getX(i) + (P.getY(i) - mid.y) * N.getY(i) + (P.getZ(i) - mid.z) * N.getZ(i);
		if (dot < 0) { const I = g.index.array; for (let f = 0; f < I.length; f += 3) [I[f + 1], I[f + 2]] = [I[f + 2], I[f + 1]]; g.computeVertexNormals(); }
		return g;
	};
	// half width of the body at world (z, y), for a spine running along z with no x drift
	const zs = []; for (let i = 0; i <= 200; i++) zs.push(curve.getPointAt(i / 200).z);
	const halfX = (z, y) => {
		const inc = zs[200] > zs[0]; if (inc ? (z < zs[0] || z > zs[200]) : (z > zs[0] || z < zs[200])) return 0;
		let i = 0; while (i < 199 && (inc ? zs[i + 1] < z : zs[i + 1] > z)) i++;
		const u = i / 200, c = curve.getPointAt(u), dy = y - c.y, sy = dy > 0 ? dy / H(u) : dy / D(u);
		if (Math.abs(sy) >= 1) return 0;
		return W(u) * Math.sqrt(1 - sy * sy) * (sy < 0 ? 1 - K(u) * Math.pow(-sy, 1.3) : 1);
	};
	return { geo, surf, halfX, curve, frame };
}

// a tube along a curve, radius r(u), rounded closed ends
export function taperTube(points, rFn, segs = 20, radial = 10, { t0 = 0, t1 = 1 } = {}) {
	const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
	const fr = curve.computeFrenetFrames(segs, false), rings = [], CAP = 3;
	const at = (i) => { const u = t0 + (t1 - t0) * (i / segs); const fi = Math.min(segs, Math.round(u * segs)); return { c: curve.getPointAt(u), tg: curve.getTangentAt(u), n: fr.normals[fi], b: fr.binormals[fi], r: rFn(u) }; };
	const ring = (c, n, b, r) => { const pts = []; for (let k = 0; k < radial; k++) { const a = (k / radial) * Math.PI * 2; pts.push(c.clone().addScaledVector(n, r * Math.cos(a)).addScaledVector(b, r * Math.sin(a))); } return pts; };
	const s0 = at(0), s1 = at(segs);
	for (let j = CAP - 1; j >= 1; j--) { const ph = (j / CAP) * Math.PI / 2; rings.push(ring(s0.c.clone().addScaledVector(s0.tg, -s0.r * Math.sin(ph)), s0.n, s0.b, Math.max(1e-3, s0.r * Math.cos(ph)))); }
	for (let i = 0; i <= segs; i++) { const s = at(i); rings.push(ring(s.c, s.n, s.b, s.r)); }
	for (let j = 1; j <= CAP - 1; j++) { const ph = (j / CAP) * Math.PI / 2; rings.push(ring(s1.c.clone().addScaledVector(s1.tg, s1.r * Math.sin(ph)), s1.n, s1.b, Math.max(1e-3, s1.r * Math.cos(ph)))); }
	const pA = s0.c.clone().addScaledVector(s0.tg, -s0.r), pB = s1.c.clone().addScaledVector(s1.tg, s1.r);
	const pos = [...pA.toArray()]; for (const r of rings) for (const p of r) pos.push(...p.toArray()); pos.push(...pB.toArray());
	const idx = [], last = 1 + rings.length * radial;
	for (let k = 0; k < radial; k++) idx.push(0, 1 + ((k + 1) % radial), 1 + k);
	for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < radial; k++) { const a = 1 + i * radial + k, b = 1 + i * radial + ((k + 1) % radial); idx.push(a, b, a + radial, b, b + radial, a + radial); }
	const lr = 1 + (rings.length - 1) * radial; for (let k = 0; k < radial; k++) idx.push(lr + k, lr + ((k + 1) % radial), last);
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
	const P = g.attributes.position, N = g.attributes.normal; let dot = 0;
	for (let i = 1; i < P.count - 1; i++) { const ri = Math.floor((i - 1) / radial), r = rings[Math.min(ri, rings.length - 1)]; const c = r.reduce((a, p) => a.add(p), V(0, 0, 0)).multiplyScalar(1 / radial); dot += (P.getX(i) - c.x) * N.getX(i) + (P.getY(i) - c.y) * N.getY(i) + (P.getZ(i) - c.z) * N.getZ(i); }
	if (dot < 0) { const I = g.index.array; for (let f = 0; f < I.length; f += 3) [I[f + 1], I[f + 2]] = [I[f + 2], I[f + 1]]; g.computeVertexNormals(); }
	return g;
}
export const ell = (part, w, h, colour, o) => part.add(T.sphere(1, w, h), colour, { ...o, shellGeo: T.sphere(1, Math.max(8, Math.round(w * 0.6)), Math.max(6, Math.round(h * 0.6))) });
export const tube = (part, pts, r, segs, radial, colour, o = {}, to = {}) => part.add(taperTube(pts, r, segs, radial, to), colour, { ...o, shellGeo: taperTube(pts, r, Math.max(4, Math.round(segs * 0.55)), Math.max(6, Math.round(radial * 0.65)), to) });

// a closed flat slab from a 2D shape, its points moved by map(a, b, z) -> Vector3 (z 0 = inner face, depth = outer face).
// The faces are subdivided so they can bend round a body (an extrude's flat caps can't).
export function slab(shape, depth, subdiv, map, curveSeg = 2) {
	const sg = new THREE.ShapeGeometry(shape, curveSeg); const P0 = sg.attributes.position;
	let pts = []; for (let i = 0; i < P0.count; i++) pts.push([P0.getX(i), P0.getY(i)]);
	let tris = []; const I0 = sg.index.array; for (let i = 0; i < I0.length; i += 3) tris.push([I0[i], I0[i + 1], I0[i + 2]]);
	for (let s = 0; s < subdiv; s++) {
		const mid = new Map(), m = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (!mid.has(k)) { mid.set(k, pts.length); pts.push([(pts[a][0] + pts[b][0]) / 2, (pts[a][1] + pts[b][1]) / 2]); } return mid.get(k); };
		const nt = []; for (const [a, b, c] of tris) { const ab = m(a, b), bc = m(b, c), ca = m(c, a); nt.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]); } tris = nt;
	}
	// make every triangle counter-clockwise in (a, b)
	tris = tris.map(([a, b, c]) => { const [ax, ay] = pts[a], [bx, by] = pts[b], [cx, cy] = pts[c]; return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) < 0 ? [a, c, b] : [a, b, c]; });
	const pos = [], push = (v) => pos.push(v.x, v.y, v.z);
	// faces share points so their shading is smooth: outer points 0..n-1, inner n..2n-1
	const n = pts.length, fpos = [], fidx = [];
	for (const [x, y] of pts) fpos.push(...map(x, y, depth).toArray());
	for (const [x, y] of pts) fpos.push(...map(x, y, 0).toArray());
	for (const [a, b, c] of tris) fidx.push(a, b, c, n + a, n + c, n + b);
	const faces = new THREE.BufferGeometry(); faces.setAttribute('position', new THREE.Float32BufferAttribute(fpos, 3)); faces.setIndex(fidx); faces.computeVertexNormals();
	const ec = new Map(); for (const [a, b, c] of tris) for (const [p, q] of [[a, b], [b, c], [c, a]]) { const k = p < q ? p + '_' + q : q + '_' + p; ec.set(k, (ec.get(k) || 0) + 1); }
	for (const [a, b, c] of tris) for (const [p, q] of [[a, b], [b, c], [c, a]]) {
		const k = p < q ? p + '_' + q : q + '_' + p; if (ec.get(k) !== 1) continue;
		const pO = map(pts[p][0], pts[p][1], depth), qO = map(pts[q][0], pts[q][1], depth), pI = map(pts[p][0], pts[p][1], 0), qI = map(pts[q][0], pts[q][1], 0);
		push(pO); push(pI); push(qO); push(qO); push(pI); push(qI);
	}
	const walls = new THREE.BufferGeometry(); walls.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); walls.computeVertexNormals();
	let g = mergeGeometries([faces.toNonIndexed(), walls]);
	// outward check: the outer face's normals should point the way map's z grows
	const n0 = V(g.attributes.normal.getX(0), g.attributes.normal.getY(0), g.attributes.normal.getZ(0));
	const dz = map(pts[tris[0][0]][0], pts[tris[0][0]][1], depth).sub(map(pts[tris[0][0]][0], pts[tris[0][0]][1], 0));
	if (n0.dot(dz) < 0) { const A = g.attributes.position.array, N = g.attributes.normal.array; for (let i = 0; i < A.length; i += 9) for (let j = 0; j < 3; j++) { let t = A[i + 3 + j]; A[i + 3 + j] = A[i + 6 + j]; A[i + 6 + j] = t; t = N[i + 3 + j]; N[i + 3 + j] = N[i + 6 + j]; N[i + 6 + j] = t; } for (let i = 0; i < N.length; i++) N[i] = -N[i]; }
	return g;
}
// a flattened cone standing on `base`, its tip along `up`, its long side along `along` (a spine plate or a blade)
export function blade(base, up, along, h, len, thick, radial = 8) {
	const yA = up.clone().normalize(), zA = along.clone().sub(yA.clone().multiplyScalar(along.dot(yA))).normalize(), xA = yA.clone().cross(zA);
	const g = new THREE.ConeGeometry(1, 1, radial, 1); g.translate(0, 0.5, 0);
	g.applyMatrix4(new THREE.Matrix4().makeScale(thick, h, len));
	g.applyMatrix4(new THREE.Matrix4().makeBasis(xA, yA, zA).setPosition(base));
	return g;
}

