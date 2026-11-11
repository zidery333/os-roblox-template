// Style C helpers for gear with moving parts (legs, arms, wheels): a tapered loft along Y, a piece at its own pivot, a turning group (Spin_) and an outline that moves with its piece. Use with style-c-glb.mjs (Builder, grow).
// Use: copy it and style-c-glb.mjs beside your build script, npm install three@0.170.0, then import { loft, addAtPivot, spinGroup } from './style-c-moving-parts.mjs'.
import * as THREE from 'three';

// A loft along Y between two convex outlines with the same number of points (x, z), for tapering shapes.
export function loft(b, lo, y0, hi, y1, col, flip = false) {
	const n = lo.length, L = lo.map(([x, z]) => [x, y0, z]), H = hi.map(([x, z]) => [x, y1, z]);
	const put = (a, c, d, k) => (flip ? b.tri(a, d, c, k) : b.tri(a, c, d, k));
	// outlines are counter-clockwise in (x, z); seen from +Y that winds clockwise, so caps go the other way
	for (let i = 1; i < n - 1; i++) { put(H[0], H[i + 1], H[i], col('cap')); put(L[0], L[i], L[i + 1], col('cap')); }
	for (let i = 0; i < n; i++) { const j = (i + 1) % n; put(L[i], H[i], H[j], col('edge')); put(L[i], H[j], L[j], col('edge')); }
}

// Put a piece's meshes (from piece()) at `pivot` (world) under `parent`, whose world position is `parentAt`:
// the mesh's own origin becomes the pivot, so the game can turn it there.
export function addAtPivot(parent, parentAt, meshes, pivot) {
	const inv = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);
	for (const m of meshes) { m.geometry.applyMatrix4(inv); m.position.copy(pivot.clone().sub(parentAt)); parent.add(m); }
	// a moving piece carries its outline: make the Outline_ mesh its child
	const [body, shell] = meshes; shell.position.set(0, 0, 0); body.add(shell);
}

// A Spin_ group at `centre` (world) whose up points along `axis` (a wheel: its axle), holding [piece, Outline_piece].
export function spinGroup(name, parent, parentAt, meshes, centre, axis) {
	const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
	const world = new THREE.Matrix4().compose(centre, q, new THREE.Vector3(1, 1, 1)), inv = world.clone().invert();
	const node = new THREE.Object3D(); node.name = name;
	node.position.copy(centre.clone().sub(parentAt)); node.quaternion.copy(q);
	for (const m of meshes) { m.geometry.applyMatrix4(inv); node.add(m); }
	parent.add(node); return node;
}
