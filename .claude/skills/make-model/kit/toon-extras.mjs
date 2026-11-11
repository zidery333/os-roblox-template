// Extras for toon-glb.mjs parts: a cheap box chamfered on its upright and top edges only (36 triangles, for
// things standing on something), and a flat-faceted silicon crystal with one bright facet facing the light, a white glint and one closed ink shell.
// Use beside toon-glb.mjs (npm install three@0.170.0):
//   import { cboxTop, facetCrystal } from './toon-extras.mjs';
//   part.add(cboxTop(2, 1, 2, 0.3), 'red', { pos: [0, 0.5, 0] });
//   facetCrystal(pilePart, { x: 0, z: 0, h: 4, r: 1, tiltX: 0.1, tiltZ: -0.2, spin: 0.5, base: 0, body: 'crystal', facet: 'cream', glint: 'white' });
// The palette needs the three colour names you pass. The crystal stands on `base` however it is tilted.
import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { LIGHT } from './toon-glb.mjs';

const V = (...a) => new THREE.Vector3(...a);

export function cboxTop(w, h, d, b) {
	const [x, y, z] = [w / 2, h / 2, d / 2], pts = [];
	for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
		for (const yy of [-y, y - b]) pts.push(V(sx * (x - b), yy, sz * z), V(sx * x, yy, sz * (z - b)));
		pts.push(V(sx * (x - b), y, sz * (z - b)));
	}
	return new ConvexGeometry(pts);
}

export function facetCrystal(part, { x = 0, z = 0, h, r, tiltX = 0, tiltZ = 0, spin = 0, base = 0, body = 'crystal', facet = 'cream', glint = 'white' }) {
	const m = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, spin, tiltZ)), V(1, 1, 1));
	const pts = [];
	for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r), V(Math.cos(a) * r * 0.92, h * 0.62, Math.sin(a) * r * 0.92)); }
	pts.push(V(0, h, 0));
	pts.forEach((p) => p.applyMatrix4(m));
	const minY = Math.min(...pts.map((p) => p.y)); pts.forEach((p) => { p.y += base - minY; });
	const hull = new ConvexGeometry(pts), P = hull.attributes.position, N = hull.attributes.normal;
	let best = -2, bi = -1; const n = V();
	for (let i = 0; i < P.count; i += 3) { n.fromBufferAttribute(N, i); const yc = (P.getY(i) + P.getY(i + 1) + P.getY(i + 2)) / 3 - base; if (yc > h * 0.55 && n.dot(LIGHT) > best) { best = n.dot(LIGHT); bi = i; } }
	const pick = (keep) => { const a = []; for (let i = 0; i < P.count; i += 3) if (keep(i)) for (let j = 0; j < 3; j++) a.push(P.getX(i + j), P.getY(i + j), P.getZ(i + j));
		const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); g.computeVertexNormals(); return g; };
	part.add(pick((i) => i !== bi), body, { shell: false, deform: null });
	if (bi >= 0) part.add(pick((i) => i === bi), facet, { shell: false, flatTone: 'light', deform: null });
	part.shapes.push({ g: hull, t: part.t });
	const tip = V(0, h * 0.7, 0).applyMatrix4(m); tip.y += base - minY;
	const side = V(-0.6, 0.2, -0.6).normalize().multiplyScalar(r * 0.95);
	part.add(new THREE.OctahedronGeometry(r * 0.28, 0), glint, { pos: [tip.x + side.x, tip.y, tip.z + side.z], scale: [0.6, 1.3, 0.6], flatTone: 'light', shell: false, deform: null });
}
