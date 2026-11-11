// A style C piece from any flat outline, convex or not (a jagged visor, a zigzag, a lightning bolt), pushed along Z, with one unbroken Outline_ shell.
// Use: copy it and style-c-glb.mjs beside your build script, npm install three@0.170.0, then
//   import { flatPiece } from './style-c-flat-shape.mjs'; flatPiece(pal, 'Glow_Visor', [[x, y], ...], z0, z1, 'glow', 0.025, true) -> [mesh, Outline_ mesh]
// The outline is counter-clockwise in (x, y) with no crossing edges. Shell corners move out along each corner's mitre, capped at 3 x t, so very sharp spikes get a blunter shell tip.
import * as THREE from 'three';
import { Builder } from './style-c-glb.mjs';

function extrudeZ(b, poly, z0, z1, colour, flip) {
	const tri = (p, q, r, hint) => {
		const n = new THREE.Vector3().subVectors(q, p).cross(new THREE.Vector3().subVectors(r, p));
		((n.dot(hint) >= 0) !== flip) ? b.tri(p.toArray(), q.toArray(), r.toArray(), colour) : b.tri(p.toArray(), r.toArray(), q.toArray(), colour);
	};
	const P = ([x, y], z) => new THREE.Vector3(x, y, z);
	for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(poly.map(([x, y]) => new THREE.Vector2(x, y)), [])) {
		tri(P(poly[i], z0), P(poly[j], z0), P(poly[k], z0), new THREE.Vector3(0, 0, -1));
		tri(P(poly[i], z1), P(poly[j], z1), P(poly[k], z1), new THREE.Vector3(0, 0, 1));
	}
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i], d = poly[(i + 1) % poly.length], h = new THREE.Vector3(d[1] - a[1], -(d[0] - a[0]), 0);
		tri(P(a, z0), P(d, z0), P(d, z1), h); tri(P(a, z0), P(d, z1), P(a, z1), h);
	}
}

// Push an outline (convex or not) out by t: each corner moves along its mitre.
export function mitre(poly, t) {
	const n = poly.length, nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [dy / L, -dx / L]; };
	return poly.map((p, i) => {
		const n1 = nrm(poly[(i + n - 1) % n], p), n2 = nrm(p, poly[(i + 1) % n]);
		const s = Math.min(t / Math.max(1 + n1[0] * n2[0] + n1[1] * n2[1], 0.2), 3 * t);
		return [p[0] + (n1[0] + n2[0]) * s, p[1] + (n1[1] + n2[1]) * s];
	});
}

export function flatPiece(pal, name, poly, z0, z1, colour, t, glow = false) {
	const body = new Builder(pal), shell = new Builder(pal);
	extrudeZ(body, poly, z0, z1, colour, false);
	extrudeZ(shell, mitre(poly, t), z0 - t, z1 + t, 'outline', true);
	return [body.mesh(name, glow ? pal.glow : pal.solid), shell.mesh('Outline_' + name, pal.solid)];
}
