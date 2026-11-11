// Style C piece whose prisms can each be turned (a weapon tilted forward at an elbow), plus an octagon prism and a tilt matrix. Use with style-c-glb.mjs (Builder, grow).
import * as THREE from 'three';
import { Builder, grow } from './style-c-glb.mjs';

const area2 = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; s += x1 * y2 - x2 * y1; } return s; };

// Turn forward by deg round a joint at height jy (z 0): the end below moves to -Z (the front). Pass as a prism's `m`.
export const tilt = (deg, jy) => new THREE.Matrix4().makeTranslation(0, jy, 0)
	.multiply(new THREE.Matrix4().makeRotationX((deg * Math.PI) / 180)).multiply(new THREE.Matrix4().makeTranslation(0, -jy, 0));

// An upright octagon (a barrel, a stick) centred at (cx, cz), radius r, from y0 to y1.
export const octY = (cx, cz, r, y0, y1, col, m) => ({ poly: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [cx + r * Math.cos(((i + 0.5) * Math.PI) / 4), cz + r * Math.sin(((i + 0.5) * Math.PI) / 4)]), axis: 'y', s0: y0, s1: y1, col, m });

// prisms: {poly, axis, s0, s1, col, m?}. Each is built, then turned by its own matrix m. Outlines (thickness t) turn with it.
// Outlines wound either way work: a clockwise outline is flipped first (grow() shrinks a clockwise one, leaving no shell).
export function tiltedPiece(pal, name, prisms, { glow = false, t = 0.035 } = {}) {
	const body = new Builder(pal), shell = new Builder(pal);
	const move = (b, from, m) => {
		const nm = new THREE.Matrix3().getNormalMatrix(m), v = new THREE.Vector3();
		for (let i = from; i < b.pos.length; i += 3) {
			v.set(b.pos[i], b.pos[i + 1], b.pos[i + 2]).applyMatrix4(m); b.pos.splice(i, 3, v.x, v.y, v.z);
			v.set(b.nrm[i], b.nrm[i + 1], b.nrm[i + 2]).applyMatrix3(nm).normalize(); b.nrm.splice(i, 3, v.x, v.y, v.z);
		}
	};
	for (const pr of prisms) {
		const b0 = body.pos.length, s0 = shell.pos.length;
		const poly = area2(pr.poly) < 0 ? pr.poly.slice().reverse() : pr.poly;
		body.prism(poly, pr.axis, pr.s0, pr.s1, pr.col);
		const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
		const g = grow(poly, t).map(([a, b]) => [Math.min(Math.max(...xs) + t, Math.max(Math.min(...xs) - t, a)), Math.min(Math.max(...ys) + t, Math.max(Math.min(...ys) - t, b))]);
		shell.prism(g, pr.axis, pr.s0 - t, pr.s1 + t, () => 'outline', true);
		if (pr.m) { move(body, b0, pr.m); move(shell, s0, pr.m); }
	}
	return [body.mesh(name, glow ? pal.glow : pal.solid), shell.mesh('Outline_' + name, pal.solid)];
}
