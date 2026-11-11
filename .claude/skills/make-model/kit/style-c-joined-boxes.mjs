// Style C boxes for pieces joined edge to edge (a long top in two halves, a back panel, a long trim strip) with no black line at the join.
// Use: copy it and style-c-glb.mjs beside your build script (npm install three@0.170.0), then
//   boxPiece(pal, root, 'Top_1', [x0, x1], [y0, y1], [z0, z1], 'oak', { keep: { x1: true }, flushTop: true }) adds the piece and its Outline_ to root.
// keep: x sides at a join: the shell stops t inside there, with its corners cut back, so nothing black shows through the crack or above it.
// flushTop: the shell stops just under the top face (a surface players walk on: a shell 0.5 above it shows as a sliver at the join from one side).
// rest: it stands on something, so its shell stops LIFT above its bottom. Outline thickness: T() below (2%, never over a fifth of the thinnest side).
import { Builder } from './style-c-glb.mjs';

export const LIFT = 0.15; // how far over its bottom a resting piece's shell stops

// Outline thickness: 2% of the piece's biggest size, never over a fifth of its thinnest, between 0.08 and 0.5.
export const T = (s) => Math.min(0.5, Math.max(0.08, Math.min(0.02 * Math.max(...s), 0.2 * Math.min(...s))));

// A box piece. keep: sides whose shell doesn't grow (it stops t + 0.05 inside) (a joint with the next piece of the same thing, so no black line
// across it). rest: it stands on something, so its shell stops LIFT above its bottom.
export function boxPiece(pal, root, name, [x0, x1], [y0, y1], [z0, z1], colour, { glow = false, keep = {}, rest = false, flushTop = false } = {}) {
	const t = T([x1 - x0, y1 - y0, z1 - z0]);
	const body = new Builder(pal), shell = new Builder(pal);
	body.prism([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 'z', z0, z1, () => colour);
	const g = (side, v, dir) => (keep[side] ? v - dir * (t + 0.05) : v + dir * t); // a kept side stops t inside: no black shows through the joint, never in its plane
	const sy0 = rest ? y0 + Math.min(LIFT, (y1 - y0) / 2) : g('y0', y0, -1);
	const sx0 = g('x0', x0, -1), sx1 = g('x1', x1, 1), sy1 = flushTop ? y1 - 0.05 : g('y1', y1, 1);
	// At a kept x side the shell's corners are cut back inside the piece, so its end face never pokes out above or below
	// the joint as a black ridge (seen on a long top's joint).
	const lo = Math.max(sy0, y0 + 0.05), hi = y1 - 0.05;
	const poly = [];
	if (keep.x0) poly.push([sx0, lo], [sx0 + t, sy0]); else poly.push([sx0, sy0]);
	if (keep.x1) poly.push([sx1 - t, sy0], [sx1, lo], [sx1, hi], [sx1 - t, sy1]); else poly.push([sx1, sy0], [sx1, sy1]);
	if (keep.x0) poly.push([sx0 + t, sy1], [sx0, hi]); else poly.push([sx0, sy1]);
	// drop points lying on a straight line between their neighbours (they'd make zero-size triangles)
	const clean = poly.filter((p, i) => { const a = poly[(i + poly.length - 1) % poly.length], b = poly[(i + 1) % poly.length];
		return Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) > 1e-9; });
	shell.prism(clean, 'z', g('z0', z0, -1), g('z1', z1, 1), () => 'outline', true);
	const pair = [body.mesh(name, glow ? pal.glow : pal.solid), shell.mesh('Outline_' + name, pal.solid)];
	for (const m of pair) root.add(m);
	return pair;
}

