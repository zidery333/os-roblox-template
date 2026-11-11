// Round glossy parts for Node (a "glossy candy" look, or any round, shiny style): a gradient palette (each colour light on top, rich below),
// parts merged from three.js shapes (spheres, capsules, rounded boxes, puffy lathes) with smooth or faceted shading, and a low-roughness material.
// Use: beside the kit's style-c-glb.mjs (for exportGLB and Node stand-ins), npm install three@0.170.0, then
//   import { makeCandyPalette, Part, G } from './candy-glb.mjs'; const pal = makeCandyPalette({ cherry: '#ff3048', ... });
//   const p = new Part(pal, 'Body'); p.add(G.sphere(0.7), 'cherry', { pos: [0, 1, 0], scale: [1, 0.9, 1] }); group.add(p.mesh());
// Gradient: v runs over a 64-texel band in the middle of the texture, so mipmaps never blend one colour into the next.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const SIZE = 512, BAND0 = 224, BAND1 = 288; // gradient rows
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// colours: { name: '#rrggbb' } or { name: ['#rrggbb', light, dark] } (light: how far the top goes to warm white, dark: how far the bottom darkens)
export function makeCandyPalette(colours, { roughness = 0.22, light = 0.18, dark = 0.22, white = '#fff7ea' } = {}) {
	const names = Object.keys(colours);
	if (names.length > 16) throw new Error('up to 16 colours');
	const W = hex2rgb(white), data = new Uint8Array(SIZE * SIZE * 4), cw = SIZE / 16;
	names.forEach((n, i) => {
		const spec = Array.isArray(colours[n]) ? colours[n] : [colours[n], light, dark];
		const c = hex2rgb(spec[0]), L = spec[1], D = spec[2];
		for (let y = 0; y < SIZE; y++) {
			const t = Math.min(1, Math.max(0, (y - BAND0) / (BAND1 - BAND0))); // 0 bottom .. 1 top
			const d = D * (1 - t) ** 2, l = L * t ** 2.2;
			const px = c.map((v, k) => Math.round((v * (1 - d)) * (1 - l) + W[k] * l));
			for (let x = i * cw; x < (i + 1) * cw; x++) { const o = (y * SIZE + x) * 4; data[o] = px[0]; data[o + 1] = px[1]; data[o + 2] = px[2]; data[o + 3] = 255; }
		}
	});
	// unused columns repeat the last colour
	for (let i = names.length; i < 16; i++) for (let y = 0; y < SIZE; y++) for (let x = i * cw; x < (i + 1) * cw; x++) {
		const o = (y * SIZE + x) * 4, s = (y * SIZE + (names.length * cw - 1)) * 4; data.copyWithin(o, s, s + 4);
	}
	const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'CandyColours'; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / 16; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Candy', map: tex, metalness: 0, roughness });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness });
	return { uOf, solid, glow, texture: tex, vOf: (t) => (BAND0 + 0.5 + t * (BAND1 - BAND0 - 1)) / SIZE };
}

// shapes (all centred on their own middle unless said)
export const G = {
	sphere: (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h),
	hemi: (r, w = 12, h = 5) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2), // top half, flat side at y 0
	capsule: (r, len, cap = 3, radial = 10) => new THREE.CapsuleGeometry(r, len, cap, radial), // along Y
	rbox: (w, h, d, r, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r),
	torus: (R, tube, radial = 6, tubular = 16, arc = Math.PI * 2) => new THREE.TorusGeometry(R, tube, radial, tubular, arc), // in the XY plane
	cyl: (rt, rb, h, radial = 12) => new THREE.CylinderGeometry(rt, rb, h, radial),
	// a puffy cylinder from y 0 to h: rounded bottom and top edges (bevel b), radius r
	puffy: (r, h, b, radial = 12, top = true) => {
		const p = [[0, 0]];
		for (const a of [-90, -45, 0]) p.push([r - b + b * Math.cos(a * Math.PI / 180), b + b * Math.sin(a * Math.PI / 180)]);
		if (top) { for (const a of [0, 45, 90]) p.push([r - b + b * Math.cos(a * Math.PI / 180), h - b + b * Math.sin(a * Math.PI / 180)]); p.push([0, h]); }
		else p.push([r, h], [0, h]);
		return new THREE.LatheGeometry(p.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial);
	},
	lathe: (pts, radial = 12) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(x, 1e-4), y)), radial),
};

// A named part merged from shapes, each in a palette colour. add(geom, colour, { pos, rot: [x, y, z] radians, scale, flat })
export class Part {
	constructor(pal, name, { glow = false } = {}) { this.pal = pal; this.name = name; this.glow = glow; this.geoms = []; }
	add(geom, colour, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], flat = false } = {}) {
		const u = this.pal.uOf[colour];
		if (u === undefined) throw new Error('no colour ' + colour);
		let g = geom.index ? geom.toNonIndexed() : geom.clone();
		for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
		const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...(typeof scale === 'number' ? [scale, scale, scale] : scale)));
		g.applyMatrix4(m);
		if (flat || !g.attributes.normal) g.computeVertexNormals(); // non-indexed: faceted
		g.computeBoundingBox();
		const { min, max } = g.boundingBox, P = g.attributes.position, uv = new Float32Array(P.count * 2);
		for (let i = 0; i < P.count; i++) { uv[i * 2] = u; uv[i * 2 + 1] = this.pal.vOf(max.y - min.y < 1e-6 ? 1 : (P.getY(i) - min.y) / (max.y - min.y)); }
		g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		this.geoms.push(g);
		return this;
	}
	mesh() {
		const g = mergeGeometries(this.geoms);
		const m = new THREE.Mesh(g, this.glow ? this.pal.glow : this.pal.solid); m.name = this.name; return m;
	}
}
