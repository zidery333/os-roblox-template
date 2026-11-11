// Says whether a model really rests on the floor: no part hovering just over it, and real contact, not one point. Takes a few seconds.
// Run: node check-ground.mjs model.glb [more.glb] [--tol 0.05] [--gap 0.6] [--ratio 0.3]   (needs three@0.170.0). Exits 1 on a fail.
// How: looks straight up from under the model on a fine grid (Outline_ shells skipped: they stop over the floor on purpose) and finds the
// lowest surface in each cell. "Near" cells are lower than --gap (default 2% of the height, at least 0.3); "touching" ones are within --tol of
// the floor. Fails if a patch of near cells has no touching cell (that part hovers: you see a slit of light under it), or if touching cells
// are under --ratio of the near cells (it sits on a point, like a ball, instead of sagging onto the floor).
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : Number(args.splice(i, 2)[1]); };
const TOL = opt('--tol', 0.05), GAP = opt('--gap', NaN), RATIO = opt('--ratio', 0.3), files = args;
if (!files.length) { console.error('Usage: node check-ground.mjs model.glb [more] [--tol 0.05] [--gap 0.6] [--ratio 0.3]'); process.exit(2); }
let failed = 0;
for (const f of files) {
	const buf = fs.readFileSync(f), ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	const err = console.error; console.error = () => {}; // Node can't load textures; shape is all this needs
	const g = await new Promise((ok, no) => new GLTFLoader().parse(ab, '', ok, no)).finally(() => { console.error = err; });
	g.scene.updateMatrixWorld(true);
	const tris = []; const box = new THREE.Box3();
	g.scene.traverse((o) => {
		if (!o.isMesh || /^Outline_/.test(o.name) || /Outline/.test(o.parent?.name || '')) return;
		const P = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : P.count;
		const v = (i) => new THREE.Vector3().fromBufferAttribute(P, I ? I.getX(i) : i).applyMatrix4(o.matrixWorld);
		for (let t = 0; t < n; t += 3) { const a = v(t), b = v(t + 1), c = v(t + 2); box.expandByPoint(a).expandByPoint(b).expandByPoint(c); tris.push([a, b, c, o.name]); }
	});
	const floor = box.min.y, H = box.max.y - floor, gap = Number.isFinite(GAP) ? GAP : Math.max(0.3, 0.02 * H);
	const cell = Math.max(0.1, Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 400);
	const nx = Math.ceil((box.max.x - box.min.x) / cell) + 1, nz = Math.ceil((box.max.z - box.min.z) / cell) + 1;
	const low = new Float32Array(nx * nz).fill(Infinity), who = new Array(nx * nz);
	for (const [a, b, c, name] of tris) {
		if (Math.min(a.y, b.y, c.y) - floor > gap) continue; // too high to matter
		const x0 = Math.floor((Math.min(a.x, b.x, c.x) - box.min.x) / cell), x1 = Math.ceil((Math.max(a.x, b.x, c.x) - box.min.x) / cell);
		const z0 = Math.floor((Math.min(a.z, b.z, c.z) - box.min.z) / cell), z1 = Math.ceil((Math.max(a.z, b.z, c.z) - box.min.z) / cell);
		const d = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z); if (Math.abs(d) < 1e-9) continue; // seen edge-on from below
		for (let i = x0; i <= x1; i++) for (let k = z0; k <= z1; k++) {
			const px = box.min.x + i * cell, pz = box.min.z + k * cell;
			const w1 = ((b.z - c.z) * (px - c.x) + (c.x - b.x) * (pz - c.z)) / d, w2 = ((c.z - a.z) * (px - c.x) + (a.x - c.x) * (pz - c.z)) / d, w3 = 1 - w1 - w2;
			if (w1 < -1e-6 || w2 < -1e-6 || w3 < -1e-6) continue;
			const y = w1 * a.y + w2 * b.y + w3 * c.y, j = i * nz + k;
			if (y < low[j]) { low[j] = y; who[j] = name; }
		}
	}
	// group near cells into patches, then check each patch touches the floor
	const seen = new Uint8Array(nx * nz); let near = 0, touch = 0; const hovering = [];
	for (let s = 0; s < nx * nz; s++) {
		if (seen[s] || !(low[s] - floor < gap)) continue;
		const stack = [s]; seen[s] = 1; let cells = 0, t = 0, minY = Infinity; const names = new Map();
		while (stack.length) {
			const j = stack.pop(), i = Math.floor(j / nz), k = j % nz; cells++;
			if (low[j] - floor <= TOL) t++; minY = Math.min(minY, low[j]); names.set(who[j], (names.get(who[j]) || 0) + 1);
			for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
				const a = i + di, b = k + dk, q = a * nz + b;
				if (a >= 0 && a < nx && b >= 0 && b < nz && !seen[q] && low[q] - floor < gap) { seen[q] = 1; stack.push(q); }
			}
		}
		near += cells; touch += t;
		const area = cells * cell * cell;
		if (!t && area > 4 * cell * cell) hovering.push({ part: [...names].sort((x, y) => y[1] - x[1])[0][0], gap: minY - floor, area });
	}
	const ratio = near ? touch / near : 0, name = f.split('/').pop();
	let bad = false;
	// parts low enough that they should rest on the floor (lowest point in the bottom 10%) but stop short of it
	const partMin = new Map();
	for (const [a, b, c, n] of tris) partMin.set(n, Math.min(partMin.get(n) ?? Infinity, a.y, b.y, c.y));
	for (const [n, m] of partMin) if (m - floor > TOL && m - floor < 0.1 * H && !/^Glow_/.test(n)) {
		bad = true; console.log(`LIFTED ${name} ${n}: lowest point ${(m - floor).toFixed(2)} over the floor (rest it on the floor, or lift it clearly)`);
	}
	for (const h of hovering) { bad = true; console.log(`HOVER ${name} ${h.part}: ${h.gap.toFixed(2)} over the floor, patch ${h.area.toFixed(1)} sq studs`); }
	if (ratio < RATIO) { bad = true; console.log(`POINT ${name}: only ${(ratio * 100).toFixed(0)}% of the parts near the floor touch it (want ${RATIO * 100}%+): let it sag onto the floor`); }
	console.log(`${bad ? 'FAIL' : 'ok  '} ${name}: floor at ${floor.toFixed(2)}, touching ${(touch * cell * cell).toFixed(1)} sq studs of ${(near * cell * cell).toFixed(1)} near it, ${hovering.length} hovering patches`);
	if (bad) failed++;
}
process.exit(failed ? 1 : 0);
