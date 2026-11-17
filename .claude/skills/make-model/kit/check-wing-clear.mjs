// Checks that a creature's posed wings stay clear of its body, head and the other wing, and how far each can fold back down toward the body
// (an animation plays that swing) while staying clear. Run: node check-wing-clear.mjs model.glb [clear=1] [rootSkip=8]   (needs three@0.170.0)
// Wings are parts named Wing*; outlines are skipped. Near the shoulder (within rootSkip of the wing's most-buried point) the wing is attached, so it is skipped.
// Distance = to the nearest surface point of other parts, negative when inside them (by that point's normal).
// Exits 1 if a wing is closer than the clear distance, if the model has no Wing parts, or if no file was given; 2 if the file can't be read.
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const [file, clearS = '1', skipS = '8'] = process.argv.slice(2), CLEAR = +clearS, SKIP = +skipS;
if (!file) { console.error('Usage: node check-wing-clear.mjs model.glb [clear=1] [rootSkip=8]'); process.exit(1); }
let buf; try { buf = fs.readFileSync(file); } catch (e) { console.error(`Can't read ${file}: ${e.message}`); process.exit(2); }
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const pts = (o) => { const P = o.geometry.attributes.position, N = o.geometry.attributes.normal, out = [];
	for (let i = 0; i < P.count; i++) out.push({ p: new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld), n: new THREE.Vector3().fromBufferAttribute(N, i).transformDirection(o.matrixWorld) }); return out; };
// spatial hash of surface points (dense enough: subdivide long triangle edges)
function hashOf(meshes) {
	const H = new Map(), C = 1.5, key = (x, y, z) => `${x},${y},${z}`;
	const put = (p, n) => { const k = key(Math.floor(p.x / C), Math.floor(p.y / C), Math.floor(p.z / C)); if (!H.has(k)) H.set(k, []); H.get(k).push({ p, n }); };
	for (const o of meshes) { const P = o.geometry.attributes.position, N = o.geometry.attributes.normal, I = o.geometry.index;
		const v = (i) => new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld), nn = (i) => new THREE.Vector3().fromBufferAttribute(N, i).transformDirection(o.matrixWorld);
		const n3 = I ? I.count : P.count;
		for (let t = 0; t < n3; t += 3) { const ids = I ? [I.getX(t), I.getX(t + 1), I.getX(t + 2)] : [t, t + 1, t + 2]; const [a, b, c] = ids.map(v), [na, nb, nc] = ids.map(nn);
			const L = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)), k = Math.max(1, Math.ceil(L / 0.8));
			for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) { const u = i / k, w = j / k, q = 1 - u - w;
				put(a.clone().multiplyScalar(q).addScaledVector(b, u).addScaledVector(c, w), na.clone().multiplyScalar(q).addScaledVector(nb, u).addScaledVector(nc, w).normalize()); } } }
	return (p) => { let best = null, bd = Infinity; const cx = Math.floor(p.x / C), cy = Math.floor(p.y / C), cz = Math.floor(p.z / C);
		for (let r = 0; r <= 5 && (best === null || bd > (r - 1) * C); r++) for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
			if (Math.max(Math.abs(x - cx), Math.abs(y - cy), Math.abs(z - cz)) !== r) continue; const L = H.get(key(x, y, z)); if (!L) continue;
			for (const e of L) { const d = e.p.distanceTo(p); if (d < bd) { bd = d; best = e; } } }
		if (!best) return { d: 99 }; const s = p.clone().sub(best.p).dot(best.n) < 0 ? -1 : 1; return { d: s * bd, at: best.p }; };
}
new GLTFLoader().parse(ab, '', (g) => {
	g.scene.updateMatrixWorld(true);
	const meshes = []; g.scene.traverse((o) => { if (o.isMesh && !o.name.startsWith('Outline_')) meshes.push(o); });
	const wings = meshes.filter((o) => o.name.startsWith('Wing')); let bad = 0;
	if (!wings.length) { console.log('FAIL no parts named Wing* in ' + file); process.exit(1); }
	for (const w of wings) {
		const others = hashOf(meshes.filter((o) => o !== w)), wp = pts(w);
		const dist = (list) => list.map((e) => ({ ...e, ...others(e.p) }));
		const d0 = dist(wp); const root = d0.reduce((a, b) => (b.d < a.d ? b : a)).p.clone();
		const free = (list) => list.filter((e) => e.p.distanceTo(root) > SKIP);
		const worst = (list) => free(dist(list)).reduce((a, b) => (b.d < a.d ? b : a), { d: 99 });
		const w0 = worst(wp); const ok0 = w0.d >= CLEAR;
		console.log(`${ok0 ? 'ok  ' : 'CLIP'} ${w.name} posed: nearest ${w0.d.toFixed(2)} studs` + (w0.at ? ` at (${w0.p.toArray().map((v) => v.toFixed(1)).join(', ')})` : ''));
		if (!ok0) bad++;
		// fold back toward the body round the shoulder's fore-aft line (Z), 5 degrees a step: which way folds is the way that brings it closer
		const turn = (deg) => { const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), deg * Math.PI / 180); return wp.map((e) => ({ p: e.p.clone().sub(root).applyQuaternion(q).add(root), n: e.n })); };
		const sign = worst(turn(10)).d < worst(turn(-10)).d ? 1 : -1; let clearTo = 0;
		for (let a = 5; a <= 60; a += 5) { if (worst(turn(sign * a)).d >= CLEAR) clearTo = a; else break; }
		console.log(`     ${w.name} folds back down ${clearTo} degrees from the pose and stays ${CLEAR} clear`);
	}
	process.exit(bad ? 1 : 0);
}, (e) => { console.error(e.message || e); process.exit(2); });
