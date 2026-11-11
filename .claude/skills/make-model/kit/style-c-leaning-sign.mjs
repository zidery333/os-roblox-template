// A flat style C sign leant back on a roof, held up by a wedge behind it, so it reads from the front and from above (a Wi-Fi emblem on a router); plus the Wi-Fi shapes.
// Use: copy it with style-c-glb.mjs and style-c-flat-shape.mjs beside your build script, npm install three@0.170.0, then
//   import { leanSign, wifiShapes } from './style-c-leaning-sign.mjs';
//   const w = wifiShapes(1.5);   // board, arcs, dot outlines in X-Y, the dot at (0, 0); s scales them
//   leanSign(pal, { board: ['Emblem', w.board, 'red'], faces: [['Arc_1', w.arcs[0], 'gold'], ..., ['Glow_Signal', w.dot, 'glow', true]],
//     stand: ['Emblem_Stand', 'dark', 1.5 * s], lean: 60, roof: 7.8, z: -1.8, low: 1.2 * s }) -> [[mesh, Outline_ mesh], ...]
// The board is 1 thick (local z 0..1, facing -Z), face pieces stand 0.9 proud and sink 0.1 into it. It is leant back by `lean` degrees
// round X, its lowest back corner 0.3 into the roof at height `roof`, its (0, 0) point at depth z. `low`: how far the board reaches
// below (0, 0). The wedge runs from where the board's back meets the roof up to 2 x low up the board, then straight down.
import * as THREE from 'three';
import { piece } from './style-c-glb.mjs';
import { flatPiece } from './style-c-flat-shape.mjs';

export function wifiShapes(s = 1) {
	const d = THREE.MathUtils.degToRad;
	const arc = (r0, r1) => {
		const p = [];
		for (let k = 0; k <= 6; k++) p.push([r1 * Math.cos(d(45 + k * 15)), r1 * Math.sin(d(45 + k * 15))]);
		for (let k = 6; k >= 0; k--) p.push([r0 * Math.cos(d(45 + k * 15)), r0 * Math.sin(d(45 + k * 15))]);
		return p;
	};
	const board = [[0, -1.2 * s]];
	for (let k = 0; k <= 5; k++) board.push([5.7 * s * Math.cos(d(40 + k * 20)), 5.7 * s * Math.sin(d(40 + k * 20))]);
	const r = (0.6 * s) / Math.cos(Math.PI / 8);
	const dot = Array.from({ length: 8 }, (_, i) => [r * Math.cos(Math.PI / 8 + (i * Math.PI) / 4), r * Math.sin(Math.PI / 8 + (i * Math.PI) / 4)]);
	return { board, arcs: [[1.1, 2.1], [2.6, 3.6], [4.1, 5.1]].map(([a, b]) => arc(a * s, b * s)), dot };
}

const sizeOf = (poly) => { const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]); return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)); };

export function leanSign(pal, { board, faces, stand, lean = 60, roof, z, low }) {
	const L = THREE.MathUtils.degToRad(lean);
	const y = roof - 0.3 + low * Math.cos(L) + 1.0 * Math.sin(L); // (0, 0)'s height: the lowest back corner 0.3 into the roof
	const m = new THREE.Matrix4().makeRotationX(L).setPosition(0, y, z);
	const put = (pair) => { pair.forEach((o) => o.geometry.applyMatrix4(m)); return pair; };
	const [bn, bp, bc] = board;
	const out = [put(flatPiece(pal, bn, bp, 0, 1.0, bc, 0.02 * sizeOf(bp)))];
	for (const [n, p, c, glow] of faces) out.push(put(flatPiece(pal, n, p, -0.9, 0.1, c, glow ? 0.03 : 0.02 * sizeOf(p), !!glow)));
	if (stand) {
		const [sn, sc, half] = stand;
		const back = (t) => new THREE.Vector3(0, t, 0.9).applyMatrix4(m);
		const A = back((roof - 0.1 - y + 0.9 * Math.sin(L)) / Math.cos(L)), B = back(2 * low);
		out.push(piece(pal, sn, [{ poly: [[A.z, A.y], [B.z, B.y], [B.z, roof - 0.1]], axis: 'x', s0: -half, s1: half, col: () => sc }]));
	}
	return out;
}
