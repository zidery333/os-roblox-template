// Swings a creature's moving pieces through their ranges and reports any piece that touches another piece or dips under the floor.
// Use: copy it and hull-pieces.mjs beside your build script, npm install three@0.170.0, then
//   import { checkJoints, posesFor } from './check-joint-swing.mjs'; const problems = checkJoints(creature, posesFor(creature));
// A creature is { pieces: [...] }: fixed pieces { name, hulls } and moving ones { name, hulls, pivot, axis: 'x' | 'y' | 'z', parent, range: [lo, hi] (degrees),
// drum: { r, h0, h1 } }, hulls being convex point sets (THREE.Vector3) in the rest frame. A moving piece turns with its parent: a jaw whose parent
// is the head swings round with the head. A drum is a round knob on the turning line (from -h0 to +h1 along it): it turns in place, so points
// inside it never count against the parent. Points already sunk into each other at rest (a piece into its parent, or the parent into it) never count
// between the two. checkJoints() stops with an error if no piece moves, or a parent isn't one of the pieces.
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
	const rest = cr.pieces.map((pc) => ({ ...pc, cvx: pc.hulls.map((h) => new ConvexHull().setFromPoints(h)), samples: pc.hulls.flatMap(sampleTris), sunkIn: {} }));
	const byName = new Map(rest.map((r) => [r.name, r]));
	if (!rest.some((r) => r.pivot)) throw new Error('checkJoints: no moving piece to check (a moving piece has a pivot, an axis and a range)');
	for (const A of rest) if (A.pivot && A.parent && !byName.has(A.parent)) throw new Error(`checkJoints: ${A.name}'s parent "${A.parent}" is not one of the pieces`);
	// at rest a moving piece is sunk into its parent at the joint, and the parent into it: those points are left out between the two at every angle
	for (const A of rest) if (A.pivot && A.parent) { const P = byName.get(A.parent);
		A.sunkIn[P.name] = A.samples.map((p) => depthIn(P.cvx, p) > 0); P.sunkIn[A.name] = P.samples.map((p) => depthIn(A.cvx, p) > 0); }
	// inside the drum (round its line, within its length): it turns in place, so what's inside it stays hidden. The drum turns with its piece,
	// so a point is inside it or not at every angle: worked out once, at rest.
	const inDrum = (A, p) => {
		if (!A.drum) return false;
		const q = p.clone().sub(A.pivot), ax = AXES[A.axis], along = q.dot(ax), off = q.clone().addScaledVector(ax, -along).length();
		return off <= A.drum.r * 1.02 && along >= -A.drum.h0 - 1e-4 && along <= A.drum.h1 + 1e-4;
	};
	for (const A of rest) A.drumIn = A.samples.map((p) => inDrum(A, p));
	for (const pose of poses) {
		// each piece's turn round its own pivot, after its parent's turn (and the parent's parent's): a jaw goes where the head takes it
		const mats = new Map();
		const matOf = (pc, depth = 0) => {
			if (mats.has(pc.name)) return mats.get(pc.name);
			let m = new THREE.Matrix4();
			if (pc.pivot && depth < 50) {
				const a = (pose.angles[pc.name] || 0) * DEG, { x, y, z } = pc.pivot;
				m = new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationAxis(AXES[pc.axis], a)).multiply(new THREE.Matrix4().makeTranslation(-x, -y, -z));
				if (pc.parent) m = matOf(byName.get(pc.parent), depth + 1).clone().multiply(m);
			}
			mats.set(pc.name, m); return m;
		};
		const turned = (pc, depth = 0) => !!pc.pivot && depth < 50 && (!!pose.angles[pc.name] || (!!pc.parent && turned(byName.get(pc.parent), depth + 1)));
		const posed = rest.map((pc) => {
			const m = matOf(pc), moved = turned(pc), put = (p) => p.clone().applyMatrix4(m);
			return { ...pc, moved, pivotNow: pc.pivot ? put(pc.pivot) : null, samples: moved ? pc.samples.map(put) : pc.samples,
				cvx: moved ? pc.hulls.map((h) => new ConvexHull().setFromPoints(h.map(put))) : pc.cvx };
		});
		for (const A of posed) {
			if (!A.pivot) continue;
			if (floor && A.moved) { const lo = Math.min(...A.samples.map((p) => p.y)); if (lo < -0.001) problems.add(`${pose.name}: ${A.name} under the floor (${lo.toFixed(2)})`); }
			for (const B of posed) {
				if (B === A || (pose.name !== 'rest' && !A.moved && !B.moved)) continue;
				let hit = 0, depth = 0, at = null;
				const sunk = A.sunkIn[B.name], drum = B.name === A.parent ? A.drumIn : null;
				A.samples.forEach((p, i) => {
					if ((sunk && sunk[i]) || (drum && drum[i])) return;
					const d = depthIn(B.cvx, p); if (d > 0.005) { hit++; if (d > depth) { depth = d; at = p.clone().sub(A.pivotNow); } }
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

