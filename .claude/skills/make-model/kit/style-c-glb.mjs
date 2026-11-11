// Style C ("bare minimum") model kit for Node: chunky prisms with black Outline_ shells, one palette texture (up to 16 colours), binary .glb export.
// Use: copy it beside your build script, npm install three@0.170.0, then import { makePalette, piece, exportGLB } from './style-c-glb.mjs'.
// grow() works on clockwise outlines, a 17th colour stops with an error, and piece()'s defaults follow LESSONS.md
// (outline 2% of the piece, shells kept 0.5 over the floor, or half way up a piece lower than 1).
import fs from 'fs';
import zlib from 'zlib';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// ---------- Node stand-ins for what GLTFExporter expects from a browser ----------
function crc32(buf) {
	let c, crc = 0xffffffff;
	for (let n = 0; n < buf.length; n++) {
		c = (crc ^ buf[n]) & 0xff;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		crc = (crc >>> 8) ^ c;
	}
	return (crc ^ 0xffffffff) >>> 0;
}
export function encodePNG(w, h, rgba) {
	const chunk = (type, data) => {
		const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
		const td = Buffer.concat([Buffer.from(type), data]);
		const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
		return Buffer.concat([len, td, crc]);
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
	const raw = Buffer.alloc((w * 4 + 1) * h);
	for (let y = 0; y < h; y++) {
		raw[y * (w * 4 + 1)] = 0;
		Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
	}
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
		chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
globalThis.ImageData ??= class { constructor(data, w, h) { this.data = data; this.width = w; this.height = h; } };
globalThis.OffscreenCanvas ??= class {
	constructor(w, h) { this.width = w; this.height = h; this.pixels = null; }
	getContext() {
		const c = this;
		return { translate() {}, scale() {}, putImageData(img) { c.pixels = img.data; }, drawImage() { throw new Error('drawImage not supported in Node'); } };
	}
	async convertToBlob() { return new Blob([encodePNG(this.width, this.height, this.pixels)], { type: 'image/png' }); }
};
globalThis.FileReader ??= class {
	readAsArrayBuffer(blob) { blob.arrayBuffer().then((ab) => { this.result = ab; this.onloadend?.(); }); }
	readAsDataURL(blob) { blob.arrayBuffer().then((ab) => { this.result = 'data:' + blob.type + ';base64,' + Buffer.from(ab).toString('base64'); this.onloadend?.(); }); }
};

// ---------- palette: one colour per column (16 across) of a square texture, 1024 unless a size is given ----------
export function makePalette(colours, size = 1024) { // size: the texture's width and height (a prompt may ask for 512)
	const names = Object.keys(colours);
	if (names.length > 16) throw new Error(`makePalette takes up to 16 colours, got ${names.length}: ${names.join(', ')}`);
	const W = size, H = size, cols = 16, cw = W / cols;
	const data = new Uint8Array(W * H * 4);
	for (let x = 0; x < W; x++) {
		const hex = colours[names[Math.min(Math.floor(x / cw), names.length - 1)]];
		const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
		for (let y = 0; y < H; y++) { const i = (y * W + x) * 4; data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255; }
	}
	const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'Colours'; tex.needsUpdate = true;
	const uOf = {}; names.forEach((n, i) => { uOf[n] = (i + 0.5) / cols; });
	const solid = new THREE.MeshStandardMaterial({ name: 'Solid', map: tex, metalness: 0, roughness: 0.75 });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.6 });
	return { uOf, solid, glow };
}

// ---------- shapes ----------
// A prism: a convex 2D outline (counter-clockwise, [a, b] pairs) pushed along one axis from s0 to s1.
// axis 'x': points are (z, y); 'z': (x, y); 'y': (x, z). col(kind, normal) names each face's colour:
// kind 'cap' for the two outline faces, 'edge' for the faces round it.
const AX = {
	x: (a, b, s) => [s, b, a],
	z: (a, b, s) => [a, b, s],
	y: (a, b, s) => [a, s, b],
};
function area2(p) { let s = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; s += x1 * y2 - x2 * y1; } return s; }
function dedupe(p) { return p.filter((v, i) => { const w = p[(i + 1) % p.length]; return Math.hypot(v[0] - w[0], v[1] - w[1]) > 1e-6; }); }

// Push a convex outline out by t (each edge moves out, corners meet). Either winding works.
export function grow(poly, t) {
	const p = dedupe(poly), n = p.length, lines = [], sgn = area2(p) < 0 ? -1 : 1;
	for (let i = 0; i < n; i++) {
		const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % n];
		const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
		const nx = (sgn * dy) / L, ny = (-sgn * dx) / L; // outward, whichever way the outline winds
		lines.push({ px: x1 + nx * t, py: y1 + ny * t, dx, dy });
	}
	const out = [];
	for (let i = 0; i < n; i++) {
		const A = lines[(i + n - 1) % n], B = lines[i];
		const den = A.dx * B.dy - A.dy * B.dx;
		if (Math.abs(den) < 1e-9) { out.push([B.px, B.py]); continue; }
		const u = ((B.px - A.px) * B.dy - (B.py - A.py) * B.dx) / den;
		out.push([A.px + A.dx * u, A.py + A.dy * u]);
	}
	return out;
}

export class Builder {
	constructor(pal) { this.pal = pal; this.pos = []; this.nrm = []; this.uv = []; }
	tri(a, b, c, colour) {
		const n = new THREE.Vector3().subVectors(new THREE.Vector3(...b), new THREE.Vector3(...a))
			.cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c), new THREE.Vector3(...a))).normalize();
		const u = this.pal.uOf[colour];
		if (u === undefined) throw new Error('no colour ' + colour);
		for (const v of [a, b, c]) { this.pos.push(...v); this.nrm.push(n.x, n.y, n.z); this.uv.push(u, 0.5); }
	}
	// flip: inside-out (for outline shells)
	prism(poly, axis, s0, s1, col, flip = false) {
		let p = dedupe(poly);
		if (area2(p) < 0) p = p.slice().reverse();
		const map = AX[axis];
		// handedness: for axis x the (z, y, x) frame is mirrored, so caps wind the other way
		const mirror = axis === 'x' || axis === 'y';
		const put = (a, b, c, colour) => {
			const rev = mirror !== flip;
			if (rev) this.tri(a, c, b, colour); else this.tri(a, b, c, colour);
		};
		const n = p.length;
		const lo = p.map(([a, b]) => map(a, b, s0)), hi = p.map(([a, b]) => map(a, b, s1));
		for (let i = 1; i < n - 1; i++) {
			put(hi[0], hi[i], hi[i + 1], col('cap', +1));
			put(lo[0], lo[i + 1], lo[i], col('cap', -1));
		}
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n;
			const [x1, y1] = p[i], [x2, y2] = p[j];
			const ex = y2 - y1, ey = -(x2 - x1); // outward normal in 2D
			put(lo[i], lo[j], hi[j], col('edge', [ex, ey]));
			put(lo[i], hi[j], hi[i], col('edge', [ex, ey]));
		}
	}
	mesh(name, material) {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
		g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
		g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
		const m = new THREE.Mesh(g, material); m.name = name; return m;
	}
}

// A piece: a list of prisms {poly, axis, s0, s1, col}. Returns [piece mesh, Outline_ mesh].
// t: the outline's thickness, a number or { min } for "2% of the piece's biggest size, never under min" (default: 2%).
// Shells stop floorLift (default 0.5) above floorY, so their inside-out floor face never shows or flickers on the floor;
// on a piece lower than that, they stop half way up it instead. floorLift: false turns this off.
export function piece(pal, name, prisms, { glow = false, t = { min: 0 }, outline = 'outline', floorY = 0, floorLift = 0.5 } = {}) {
	const body = new Builder(pal), shell = new Builder(pal);
	// the piece's box, for the 2% outline and the floor clamp
	const box = new THREE.Box3();
	for (const pr of prisms) for (const [a, b] of pr.poly) for (const sv of [pr.s0, pr.s1]) box.expandByPoint(new THREE.Vector3(...AX[pr.axis](a, b, sv)));
	const size = box.getSize(new THREE.Vector3());
	if (typeof t !== 'number') t = Math.max(t.min || 0, 0.02 * Math.max(size.x, size.y, size.z));
	const lift = floorLift === false ? -Infinity : Math.min(floorLift, Math.max(0, box.min.y - floorY) + size.y / 2);
	for (const pr of prisms) {
		body.prism(pr.poly, pr.axis, pr.s0, pr.s1, pr.col);
		let g = grow(pr.poly, t);
		// sharp corners (a ramp's thin tip) would poke far out: keep the shell inside the outline's box grown by t
		const xs = pr.poly.map((p) => p[0]), ys = pr.poly.map((p) => p[1]);
		const [ax0, ax1, ay0, ay1] = [Math.min(...xs) - t, Math.max(...xs) + t, Math.min(...ys) - t, Math.max(...ys) + t];
		g = g.map(([a, b]) => [Math.min(ax1, Math.max(ax0, a)), Math.min(ay1, Math.max(ay0, b))]);
		// keep the floor: for outlines whose second coord is height (axes x, z)
		const fl = floorY + lift;
		if (pr.axis !== 'y') g = g.map(([a, b]) => [a, b < fl ? fl : b]);
		const lo = pr.axis === 'y' ? Math.max(fl, pr.s0 - t) : pr.s0 - t;
		shell.prism(g, pr.axis, lo, pr.s1 + t, () => outline, true);
	}
	return [body.mesh(name, glow ? pal.glow : pal.solid), shell.mesh('Outline_' + name, pal.solid)];
}

export async function exportGLB(root, file) {
	const ab = await new GLTFExporter().parseAsync(root, { binary: true });
	fs.writeFileSync(file, Buffer.from(ab));
	return ab.byteLength;
}
