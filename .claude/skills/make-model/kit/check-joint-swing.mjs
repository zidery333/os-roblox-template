// Swings a creature's moving pieces through their ranges and reports any piece that touches another piece or dips under the floor.
// Use: copy it and hull-pieces.mjs beside your build script, npm install three@0.170.0, then
//   import { checkJoints, posesFor } from './check-joint-swing.mjs'; const problems = checkJoints(creature, posesFor(creature));
// A creature is { pieces: [...] }: fixed pieces { name, hulls } and moving ones { name, hulls, pivot, axis: 'x' | 'y' | 'z', parent, range: [lo, hi] (degrees),
// drum: { r, h0, h1 } }, hulls being convex point sets (THREE.Vector3) in the rest frame. A drum is a round knob on the turning line (from -h0 to +h1
// along it): it turns in place, so points inside it never count against the parent, nor do points already sunk into the parent at rest.
// posesFor() tries each mover alone across its range in 5-degree steps, then legs named Leg_Front1/2, Leg_Back1/2 in trot, pace, all forward and all
// back, each with the other movers at both ends of their ranges. Keep a leg's inner face about 0.12 off the body it hangs beside: outline shells push
// out further than their thickness at corners, and closer faces flicker (check-planes.mjs finds them).
import * as THREE from 'three';
import { V, hullTris } from './hull-pieces.mjs';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';

const DEG = Math.PI / 180;
const AXES = { x: V(1, 0, 0), y: V(0, 1, 0), z: V(0, 0, 1) };

// ---------- joint check: swing pieces, report any that touch another piece or go under the floor ----------
function sampleTris(points) {
	const pts = [];
	for (const [a, b, c] of hullTris(points)) for (let i = 0; i <= 5; i++) for (let j = 0; i + j <= 5; j++)
		pts.push(a.clone().multiplyScalar(i / 5).addScaledVector(b, j / 5).addScaledVector(c, (5 - i - j) / 5));
	return pts;
}
export function checkJoints(cr, poses, { gap = 0.02, floor = true } = {}) {
	const problems = new Set();
	const depthIn = (cvx, p) => {
		let best = -Infinity;
		for (const c of cvx) { let worst = -Infinity; for (const f of c.faces) worst = Math.max(worst, f.normal.dot(p) - f.constant); best = Math.max(best, gap - worst); }
		return best;
	};
	const rest = cr.pieces.map((pc) => ({ ...pc, cvx: pc.hulls.map((h) => new ConvexHull().setFromPoints(h)), samples: pc.hulls.flatMap(sampleTris) }));
	// at rest a moving piece is sunk into its parent at the joint: those points are left out against the parent at every angle
	for (const A of rest) if (A.pivot) { const par = rest.find((r) => r.name === A.parent); A.sunk = A.samples.map((p) => depthIn(par.cvx, p) > 0); }
	// inside the drum (round its line, within its length): it turns in place, so what's inside it stays hidden
	const inDrum = (A, p) => {
		if (!A.drum) return false;
		const q = p.clone().sub(A.pivot), ax = AXES[A.axis], along = q.dot(ax), off = q.clone().addScaledVector(ax, -along).length();
		return off <= A.drum.r * 1.02 && along >= -A.drum.h0 - 1e-4 && along <= A.drum.h1 + 1e-4;
	};
	for (const pose of poses) {
		const posed = rest.map((pc) => {
			const a = (pose.angles[pc.name] || 0) * DEG;
			const rot = (p) => (a ? p.clone().sub(pc.pivot).applyAxisAngle(AXES[pc.axis], a).add(pc.pivot) : p);
			return { ...pc, a, samples: pc.samples.map(rot), cvx: a ? pc.hulls.map((h) => new ConvexHull().setFromPoints(h.map(rot))) : pc.cvx };
		});
		for (const A of posed) {
			if (!A.pivot) continue;
			if (floor && A.a) { const lo = Math.min(...A.samples.map((p) => p.y)); if (lo < -0.001) problems.add(`${pose.name}: ${A.name} under the floor (${lo.toFixed(2)})`); }
			for (const B of posed) {
				if (B === A || (pose.name !== 'rest' && !A.a && !B.a)) continue;
				let hit = 0, depth = 0, at = null;
				A.samples.forEach((p, i) => {
					if (B.name === A.parent && (A.sunk[i] || inDrum(A, p))) return;
					const d = depthIn(B.cvx, p); if (d > 0.005) { hit++; if (d > depth) { depth = d; at = p.clone().sub(A.pivot); } }
				});
				if (hit) problems.add(`${pose.name}: ${A.name} touches ${B.name} (${hit} points, ${depth.toFixed(3)} deep, worst ${at.toArray().map((v) => v.toFixed(2))} from its pivot)`);
			}
		}
	}
	return [...problems];
}
// poses: each moving piece alone across its range; then trot (front 1 with back 2), pace (one side together), all forward, all back,
// each with every other moving piece at both ends of its range
export function posesFor(cr) {
	const P = [{ name: 'rest', angles: {} }];
	const movers = cr.pieces.filter((p) => p.pivot);
	for (const pc of movers) for (let d = pc.range[0]; d <= pc.range[1]; d += 5) if (d) P.push({ name: `${pc.name} ${d}`, angles: { [pc.name]: d } });
	const gaits = {
		'trot A': { Leg_Front1: 30, Leg_Back2: 30, Leg_Front2: -30, Leg_Back1: -30 },
		'trot B': { Leg_Front1: -30, Leg_Back2: -30, Leg_Front2: 30, Leg_Back1: 30 },
		'pace A': { Leg_Front1: 30, Leg_Back1: 30, Leg_Front2: -30, Leg_Back2: -30 },
		'all forward': { Leg_Front1: 30, Leg_Back1: 30, Leg_Front2: 30, Leg_Back2: 30 },
		'all back': { Leg_Front1: -30, Leg_Back1: -30, Leg_Front2: -30, Leg_Back2: -30 },
	};
	const others = movers.filter((p) => !p.name.startsWith('Leg_'));
	const ends = [{}];
	for (const s of [0, 1]) ends.push(Object.fromEntries(others.map((p) => [p.name, p.range[s]])));
	if (others.length > 1) ends.push(Object.fromEntries(others.map((p, i) => [p.name, p.range[i % 2]])), Object.fromEntries(others.map((p, i) => [p.name, p.range[(i + 1) % 2]])));
	const legNames = movers.filter((p) => p.name.startsWith('Leg_')).map((p) => p.name);
	for (const [g, la] of Object.entries(legNames.length ? gaits : { still: {} })) for (const e of ends)
		P.push({ name: `${g} ${JSON.stringify(e)}`, angles: { ...la, ...e } });
	return P;
}

