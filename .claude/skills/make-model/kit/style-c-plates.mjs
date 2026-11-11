// Style C "plates" for shapes that face the front: an outline in X-Y with holes, pushed along Z (a fan frame with a round hole, a ring, a star of blades, a plus-shaped guard), each with a closed Outline_ shell; plus make() for one piece built from box prisms and plates together.
// Use: copy it with style-c-glb.mjs and hull-pieces.mjs beside your build script, npm install three@0.170.0, then
//   import { stylePlates, plate, ngon, star, plus } from './style-c-plates.mjs'; const { make } = stylePlates(pal);
//   make('Frame', [prisms...], [plate(outer, z0, z1, 'colour', [holes...])], glow) -> [mesh, Outline_ mesh]. Mark a non-convex outline (star, plus) with { ...plate(...), star: true }.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { piece, grow } from './style-c-glb.mjs';
import { growPoly } from './hull-pieces.mjs';

// an n-sided outline in the X-Y plane (seen from the front), centre (cx, cy), corner radius r
export const ngon = (n, r, cx, cy, a0 = Math.PI / n) => Array.from({ length: n }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
// a "plate": an outline in X-Y, with holes, pushed along Z from z0 to z1 (frames, rings, blades, discs facing the front)
export const plate = (outer, z0, z1, c, holes = []) => ({ outer, holes, z0, z1, c });
// a fan's blades seen from the front: n chunky swept blades round a hub, one closed outline (no joints)
export function star(n, rh, rt, cx, cy) {
	const p = [], d = Math.PI / 180;
	for (let k = 0; k < n; k++) {
		const a = (k * 360) / n;
		for (const [r, da] of [[rh, -16], [rt * 0.9, -10], [rt, 8], [rt * 0.94, 26], [rh, 28], [rh, 50]])
			p.push([cx + r * Math.cos((a + da) * d), cy + r * Math.sin((a + da) * d)]);
	}
	return p;
}

// a plus sign seen from the front: bars half-width w reaching R from the centre
export const plus = (cx, cy, w, R) => [[R, -w], [R, w], [w, w], [w, R], [-w, R], [-w, w], [-R, w], [-R, -w], [-w, -w], [-w, -R], [w, -R], [w, -w]].map(([x, y]) => [cx + x, cy + y]);

export function stylePlates(pal) {
function plateGeo(pl, t = 0, flip = false) {
	const out = t ? (pl.star ? growPoly(pl.outer, t) : grow(pl.outer, t)) : pl.outer;
	const shape = new THREE.Shape(out.map(([x, y]) => new THREE.Vector2(x, y)));
	for (const h of pl.holes) shape.holes.push(new THREE.Path((t ? grow(h, -t) : h).map(([x, y]) => new THREE.Vector2(x, y))));
	const g = new THREE.ExtrudeGeometry(shape, { depth: pl.z1 - pl.z0 + 2 * t, bevelEnabled: false, steps: 1, curveSegments: 1 });
	g.translate(0, 0, pl.z0 - t); g.clearGroups();
	const u = pal.uOf[flip ? 'outline' : pl.c], uv = g.attributes.uv;
	for (let i = 0; i < uv.count; i++) uv.setXY(i, u, 0.5);
	if (flip) { // inside out: swap two corners of every triangle, turn the normals round
		const P = g.attributes.position, N = g.attributes.normal;
		for (let i = 0; i < P.count; i += 3) for (const A of [P, N]) {
			const a = [A.getX(i + 1), A.getY(i + 1), A.getZ(i + 1)];
			A.setXYZ(i + 1, A.getX(i + 2), A.getY(i + 2), A.getZ(i + 2)); A.setXYZ(i + 2, ...a);
		}
		for (let i = 0; i < N.count; i++) N.setXYZ(i, -N.getX(i), -N.getY(i), -N.getZ(i));
	}
	return g;
}
// outline thickness: about 2% of the piece, never thinner than 0.06 or thicker than 0.15
function thick(prisms, plates) {
	const b = new THREE.Box3();
	for (const p of prisms) for (const [a, c] of p.poly) for (const s of [p.s0, p.s1])
		b.expandByPoint(new THREE.Vector3(...(p.axis === 'y' ? [a, s, c] : p.axis === 'z' ? [a, c, s] : [s, c, a])));
	for (const p of plates) for (const [x, y] of p.outer) for (const z of [p.z0, p.z1]) b.expandByPoint(new THREE.Vector3(x, y, z));
	const s = b.getSize(new THREE.Vector3());
	return Math.min(0.15, Math.max(0.06, 0.02 * Math.max(s.x, s.y, s.z)));
}
// one named piece and its Outline_ shell, from prisms (style-c-glb) and plates (above)
function make(name, prisms = [], plates = [], glow = false) {
	const t = thick(prisms, plates);
	const body = [], shell = [];
	if (prisms.length) { const [m, o] = piece(pal, name, prisms, { glow, t, floorLift: 0.5 }); body.push(m.geometry); shell.push(o.geometry); }
	for (const pl of plates) { body.push(plateGeo(pl)); shell.push(plateGeo(pl, t, true)); }
	const fix = (g) => { const h = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(h.attributes)) if (!['position', 'normal', 'uv'].includes(k)) h.deleteAttribute(k); return h; };
	const m = new THREE.Mesh(mergeGeometries(body.map(fix)), glow ? pal.glow : pal.solid); m.name = name;
	const o = new THREE.Mesh(mergeGeometries(shell.map(fix)), pal.solid); o.name = 'Outline_' + name;
	return [m, o];
}

return { make, plateGeo, thick };
}
