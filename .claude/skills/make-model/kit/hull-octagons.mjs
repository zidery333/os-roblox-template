// Point sets for hull-pieces.mjs: boxes, octagon tubes or cones along any axis (tilted barrels, dishes), and a two-colour piece (a dish with a dark face).
// Use: copy it with hull-pieces.mjs and style-c-glb.mjs beside your build script (npm install three@0.170.0), then
// hullPiece(pal, 'Tube_1', [octPts(start, dir, 0.55, 0, 2.7)], 'legs', t) for one tube, or twoTone(pal, 'Dish', pts, up, 'dark', 'white', t).
import * as THREE from 'three';
import { hullTris, shellPoints, Part, V } from './hull-pieces.mjs';

// a box from x0..x1, y0..y1, z0..z1 as 8 points
export const boxPts = (x0, x1, y0, y1, z0, z1) => [V(x0, y0, z0), V(x1, y0, z0), V(x0, y1, z0), V(x1, y1, z0), V(x0, y0, z1), V(x1, y0, z1), V(x0, y1, z1), V(x1, y1, z1)];

// two unit vectors at right angles to axis a
export const across = (a) => { const u = Math.abs(a.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0); const e1 = new THREE.Vector3().crossVectors(a, u).normalize(); return [e1, new THREE.Vector3().crossVectors(a, e1).normalize()]; };

// an octagon tube along axis a from point c, from s0 to s1 along it: apothem (half across the flats) r0 at s0 and r1 at s1, so r1 > r0 makes a cone cut short (a dish).
// turn spins it round its own axis: Math.PI / 8 stops a tilted tube's side lying flat on a drum's face.
export function octPts(c, a, r0, s0, s1, r1 = r0, turn = 0) {
	a = a.clone().normalize(); const [e1, e2] = across(a), pts = [];
	for (const [s, r] of [[s0, r0], [s1, r1]]) {
		const R = r / Math.cos(Math.PI / 8);
		for (let i = 0; i < 8; i++) {
			const t = Math.PI / 8 + turn + (i * Math.PI) / 4;
			pts.push(c.clone().addScaledVector(a, s).addScaledVector(e1, R * Math.cos(t)).addScaledVector(e2, R * Math.sin(t)));
		}
	}
	return pts;
}

// one convex shape in two colours: faces pointing along `a` get `top`, the rest `side`. Returns [piece mesh, Outline_ mesh].
// floor: as hullPiece's ({ floorLift: false } for a piece built round a group's pivot). A dish with a chunky rim:
// twoTone(pal, 'Dish', [...octPts(base, up, 0.6, 0, 0.6, 1.5), ...octPts(base, up, 1.5, 1.1, 1.1)], up, 'dark', 'white', 0.06, { floorLift: false })
export function twoTone(pal, name, pts, a, top, side, t, floor = {}) {
	const body = new Part(pal), shell = new Part(pal);
	for (const tr of hullTris(pts)) {
		const n = new THREE.Vector3().subVectors(tr[1], tr[0]).cross(new THREE.Vector3().subVectors(tr[2], tr[0])).normalize();
		body.tri(...tr, n.dot(a) > 0.95 ? top : side);
	}
	shell.hull(shellPoints(pts, t, floor), 'outline', true);
	return [body.mesh(name), shell.mesh('Outline_' + name)];
}
