// Sleek gadget-style toy parts for Node: low-triangle rounded-rectangle slabs and panels with a chamfered top edge (a phone
// frame), chamfered discs and cones (lenses, cameras, drill bits), stadium pills, domes and faceted gems with per-facet colours and a white glint, in a
// flat palette (up to 32 colours) with satin anodised Alu (metalness 0.6, roughness 0.45), polished Gloss, dark Glass, Gem, Matte and Glow materials.
// Optional black inverted-hull Outline_<part> shells (the outlined look): each shape carries a coarse, already-offset shell, so outlines cost ~30 triangles.
// Use: beside the kit's style-c-glb.mjs (exportGLB and Node stand-ins), npm install three@0.170.0, then
//   import { makeGadgetPalette, Part, S, gem } from './gadget-glb.mjs'; const pal = makeGadgetPalette({ ink: '#141210', orange: '#f77e2d', ... });
//   const p = new Part(pal, 'Body', 'alu'); p.add(S.slab(2, 1.5, 1, 0.5, 0.08), 'orange', { pos: [0, 0.3, 0] }); group.add(...p.meshes({ outline: 0.07 }));
// Slabs and discs stand on y 0 (plan in XZ); panels face -Z, centred; FRONT = [-PI/2, 0, 0] turns a disc to face -Z. Normals creased at 35 degrees:
// round corners smooth, chamfers crisp. new Part(pal, name, kind, { outline: false }) keeps a part without a shell.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const COLS = 32, CW = 32, TW = COLS * CW, TH = 32;
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export function makeGadgetPalette(colours, { alu = [0.6, 0.45], gloss = [0.8, 0.2], glass = [0.15, 0.08], gem = [0.05, 0.14], ink = 'ink' } = {}) {
	const names = Object.keys(colours);
	if (names.length > COLS) throw new Error('up to 32 colours');
	const data = new Uint8Array(TW * TH * 4);
	for (let x = 0; x < TW; x++) {
		const c = hex2rgb(colours[names[Math.min(Math.floor(x / CW), names.length - 1)]]);
		for (let y = 0; y < TH; y++) { const o = (y * TW + x) * 4; data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255; }
	}
	const tex = new THREE.DataTexture(data, TW, TH, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'GadgetColours'; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / COLS; });
	const M = (name, [metalness, roughness], extra = {}) => new THREE.MeshStandardMaterial({ name, map: tex, metalness, roughness, ...extra });
	const mats = {
		alu: M('Alu', alu), gloss: M('Gloss', gloss), glass: M('Glass', glass), gem: M('Gem', gem), matte: M('Matte', [0.05, 0.85]),
		glow: M('Glow', [0, 0.5], { emissiveMap: tex, emissive: 0xffffff }), ink: M('Ink', [0, 0.8]),
	};
	return { uOf, mats, texture: tex, inkName: ink };
}

// ---- outlines in plan (XZ), counter-clockwise from above ----
function ptsRR(w, d, r, k) {
	r = Math.max(0.002, Math.min(r, w / 2 - 1e-4, d / 2 - 1e-4));
	const out = [], C = [[w / 2 - r, d / 2 - r], [-(w / 2 - r), d / 2 - r], [-(w / 2 - r), -(d / 2 - r)], [w / 2 - r, -(d / 2 - r)]];
	C.forEach(([cx, cz], q) => { for (let i = 0; i <= k; i++) { const a = (q + i / k) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } });
	return out;
}
const ptsCircle = (r, n, off = 0) => Array.from({ length: n }, (_, i) => { const a = ((i + off) / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });

// rings [{ pts, y }] (same count, bottom to top) -> a closed convex solid centred on the Y axis; every face turned outwards
function rings2geo(rings) {
	const P = [], tri = (a, b, c, out) => {
		const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
		const m = new THREE.Vector3().add(a).add(b).add(c).multiplyScalar(1 / 3);
		if (n.dot(out(m)) < 0) P.push(a, c, b); else P.push(a, b, c);
	};
	const V = (p, y) => new THREE.Vector3(p[0], y, p[1]);
	const n = rings[0].pts.length, yMid = (rings[0].y + rings[rings.length - 1].y) / 2;
	for (let r = 0; r + 1 < rings.length; r++) for (let i = 0; i < n; i++) {
		const j = (i + 1) % n, a = V(rings[r].pts[i], rings[r].y), b = V(rings[r].pts[j], rings[r].y), c = V(rings[r + 1].pts[j], rings[r + 1].y), d = V(rings[r + 1].pts[i], rings[r + 1].y);
		const out = (m) => new THREE.Vector3(m.x, 0, m.z);
		if (a.distanceTo(b) > 1e-6) tri(a, b, c, out); if (c.distanceTo(d) > 1e-6) tri(a, c, d, out);
	}
	for (const [ring, s] of [[rings[0], -1], [rings[rings.length - 1], 1]]) {
		const pts = ring.pts; if (Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) < 1e-3) continue; // a point (cone tip)
		for (let i = 1; i + 1 < n; i++) tri(V(pts[0], ring.y), V(pts[i], ring.y), V(pts[i + 1], ring.y), () => new THREE.Vector3(0, s, 0));
	}
	const g = new THREE.BufferGeometry(); g.setFromPoints(P); g.computeVertexNormals();
	void yMid; return g;
}
const withShell = (g, fn) => { g.userData.shell = fn; return g; };
const rrRings = (w, d, h, r, ch, k, bottom) => {
	const o = ptsRR(w, d, r, k), i = ptsRR(w - 2 * ch, d - 2 * ch, r - ch, k);
	if (!ch) return [{ pts: o, y: 0 }, { pts: o, y: h }];
	return [...(bottom ? [{ pts: i, y: 0 }, { pts: o, y: ch }] : [{ pts: o, y: 0 }]), { pts: o, y: h - ch }, { pts: i, y: h }];
};
export const S = {
	// slab: plan w (x) by d (z), h tall from y 0, plan corner radius r, chamfer ch on the top edge (and the bottom with bottom: true), k steps a corner
	slab: (w, d, h, r, ch = 0.06, k = 3, bottom = false) => withShell(rings2geo(rrRings(w, d, h, r, Math.min(ch, h / 3), k, bottom)),
		(t) => rings2geo(rrRings(w + 2 * t, d + 2 * t, h + 2 * t, r + t, 0, 1, false)).translate(0, -t, 0)),
	// panel facing -Z: w x h, t thick, centred, chamfer on its front edge
	panel: (w, h, t, r, ch = 0.03, k = 3) => {
		const rot = (g) => g.translate(0, -t / 2, 0).rotateX(-Math.PI / 2);
		return withShell(rot(rings2geo(rrRings(w, h, t, r, Math.min(ch, t / 2), k, false))),
			(o) => rot(rings2geo(rrRings(w + 2 * o, h + 2 * o, t + 2 * o, r + o, 0, 1, false)).translate(0, -o, 0)));
	},
	// disc standing on y 0: radius r, h tall, chamfer ch on top, n sides
	disc: (r, h, ch = 0.05, n = 16) => {
		ch = Math.min(ch, h / 2, r / 3);
		const rings = ch ? [{ pts: ptsCircle(r, n), y: 0 }, { pts: ptsCircle(r, n), y: h - ch }, { pts: ptsCircle(r - ch, n), y: h }] : [{ pts: ptsCircle(r, n), y: 0 }, { pts: ptsCircle(r, n), y: h }];
		const ns = r > 2 ? n : Math.max(8, Math.round(n / 2)); // big discs keep every side, so the outline hugs them
		return withShell(rings2geo(rings), (t) => { const R = (r + t) / Math.cos(Math.PI / ns); return rings2geo([{ pts: ptsCircle(R, ns), y: -t }, { pts: ptsCircle(R, ns), y: h + t }]); });
	},
	// a solid of revolution from [[radius, y], ...] bottom to top (radius 0 at an end is a point), n sides
	revolve: (prof, n = 16) => {
		const ns = Math.max(8, Math.round(n / 2));
		return withShell(rings2geo(prof.map(([r, y]) => ({ pts: ptsCircle(Math.max(r, 1e-4), n), y }))),
			(t) => rings2geo(prof.map(([r, y], i) => ({ pts: ptsCircle(Math.max(r, 1e-4) / Math.cos(Math.PI / ns) + t, ns), y: y + (i === 0 ? -t : i === prof.length - 1 ? t : 0) }))));
	},
	// dome: half-sphere radius r, flat side at y 0, squashed to h
	dome: (r, h, w = 12, hs = 3) => { const g = new THREE.SphereGeometry(r, w, hs, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, h / r, 1); return g; },
	// a smile or brow: a round tube along an arc in the XY plane (faces -Z)
	arc: (R, tube, arc = Math.PI, seg = 6) => new THREE.TorusGeometry(R, tube, 4, seg, arc),
};

// A faceted gem standing on y 0: n-sided prism body to h*body, then a point; facets alternate colours a / b, one point facet is the glint colour.
export function gem(pal, { r = 0.5, h = 1.6, n = 6, body = 0.62, a, b, glint, twist = 0 }) {
	const tris = [], cols = [], bodyH = h * body;
	const P = (i, y, rr) => { const t = (i / n) * Math.PI * 2 + twist; return new THREE.Vector3(Math.cos(t) * rr, y, Math.sin(t) * rr); };
	for (let i = 0; i < n; i++) {
		const j = i + 1, c1 = i % 2 ? a : b;
		const p0 = P(i, 0, r * 0.82), p1 = P(j, 0, r * 0.82), p2 = P(j, bodyH, r), p3 = P(i, bodyH, r), tip = new THREE.Vector3(0, h, 0);
		tris.push(p0, p2, p1, p0, p3, p2); cols.push(c1, c1);
		tris.push(p3, tip, p2); cols.push(i === 1 ? glint : (i % 2 ? b : a));
		tris.push(new THREE.Vector3(0, 0, 0), p0, p1); cols.push(c1);
	}
	const g = new THREE.BufferGeometry(), pos = new Float32Array(tris.length * 3), uv = new Float32Array(tris.length * 2);
	tris.forEach((v, k) => { pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z; const u = pal.uOf[cols[Math.floor(k / 3)]]; if (u === undefined) throw new Error('no colour'); uv[k * 2] = u; uv[k * 2 + 1] = 0.5; });
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	// make every facet face outwards from the gem's axis
	for (let k = 0; k < tris.length; k += 3) {
		const [A, B, C] = [tris[k], tris[k + 1], tris[k + 2]], nrm = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A));
		const m = new THREE.Vector3().add(A).add(B).add(C).multiplyScalar(1 / 3), out = A.y === 0 && B.y === 0 && C.y === 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(m.x, m.y > bodyH ? 0.6 : 0, m.z);
		if (nrm.dot(out) < 0) { for (const at of [pos]) for (let c = 0; c < 3; c++) { const t = at[(k + 1) * 3 + c]; at[(k + 1) * 3 + c] = at[(k + 2) * 3 + c]; at[(k + 2) * 3 + c] = t; } }
	}
	g.attributes.position.needsUpdate = true; g.computeVertexNormals(); g.userData.coloured = true;
	return g;
}

const tmp = new THREE.Matrix4();
export class Part {
	// kind: alu | gloss | glass | gem | matte | glow (a glow part gets a Glow_ name from the caller)
	constructor(pal, name, kind = 'alu', { outline = true } = {}) { this.pal = pal; this.name = name; this.kind = kind; this.outline = outline; this.geoms = []; this.shells = []; }
	add(geom, colour, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], crease = 35 } = {}) {
		let g = geom.index ? geom.toNonIndexed() : geom.clone();
		for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && !(k === 'uv' && geom.userData.coloured)) g.deleteAttribute(k);
		const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot, 'YXZ')), new THREE.Vector3(...(typeof scale === 'number' ? [scale, scale, scale] : scale)));
		g.applyMatrix4(m);
		if (!geom.userData.coloured) {
			g = toCreasedNormals(g, (crease * Math.PI) / 180);
			const u = this.pal.uOf[colour]; if (u === undefined) throw new Error('no colour ' + colour);
			const uv = new Float32Array(g.attributes.position.count * 2); for (let i = 0; i < uv.length; i += 2) { uv[i] = u; uv[i + 1] = 0.5; }
			g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		}
		this.geoms.push(g); this.shells.push({ fn: geom.userData.shell, m, g });
		return this;
	}
	tris() { return this.geoms.reduce((s, g) => s + g.attributes.position.count / 3, 0); }
	// meshes({ outline }) -> [mesh] or [mesh, Outline_ shell]. outline: shell thickness (0 = none). Shells of pieces on the floor stop floorLift over it.
	meshes({ outline = 0, floorLift = 0.5 } = {}) {
		const m = new THREE.Mesh(mergeGeometries(this.geoms), this.pal.mats[this.kind]); m.name = this.name;
		if (!outline || !this.outline) return [m];
		const u = this.pal.uOf[this.pal.inkName];
		const shells = this.shells.map(({ fn, m: mat, g }) => {
			g.computeBoundingBox(); const minY = g.boundingBox.min.y, lift = Math.min(floorLift, (g.boundingBox.max.y - minY) / 2);
			let s = fn ? fn(outline).applyMatrix4(mat) : pushOut(g, outline);
			s = s.index ? s.toNonIndexed() : s;
			const P = s.attributes.position;
			if (minY < 0.1) for (let i = 0; i < P.count; i++) P.setY(i, Math.max(P.getY(i), minY + lift));
			for (let i = 0; i < P.count; i += 3) { for (let c = 0; c < 3; c++) { const a = P.array[(i + 1) * 3 + c]; P.array[(i + 1) * 3 + c] = P.array[(i + 2) * 3 + c]; P.array[(i + 2) * 3 + c] = a; } } // inside out
			for (const k of Object.keys(s.attributes)) if (k !== 'position') s.deleteAttribute(k);
			s.computeVertexNormals();
			const uv = new Float32Array(P.count * 2); for (let i = 0; i < uv.length; i += 2) { uv[i] = u; uv[i + 1] = 0.5; }
			s.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
			return s;
		});
		const sm = new THREE.Mesh(mergeGeometries(shells), this.pal.mats.ink); sm.name = 'Outline_' + this.name;
		return [m, sm];
	}
}
// fallback shell for shapes without their own: welded, pushed out along the averaged normal by t
function pushOut(src, t) {
	let g = new THREE.BufferGeometry(); g.setAttribute('position', src.attributes.position.clone());
	g = mergeVertices(g, 1e-4); g.computeVertexNormals();
	const P = g.attributes.position, N = g.attributes.normal;
	for (let i = 0; i < P.count; i++) P.setXYZ(i, P.getX(i) + N.getX(i) * t, P.getY(i) + N.getY(i) * t, P.getZ(i) + N.getZ(i) * t);
	return g;
}
