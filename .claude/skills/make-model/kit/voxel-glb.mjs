// Voxel (block-world) models for Node: fill a grid of equal cubes by colour and part, then mesh it with faces hidden inside a part dropped and
// same-colour runs merged into big quads, while one texture gives every cube its own slight shade. Faces where two parts meet are kept, so every
// part is closed on its own (the game can move, hide or recolour one part without a hole showing in the next).
// Use: import { makeVoxelPalette, Voxels } from './voxel-glb.mjs' (needs three@0.170.0; export with exportGLB from style-c-glb.mjs).
//   const pal = makeVoxelPalette({ red: '#e8402c', board: ['#1f6b35', 0.04] });  // up to 16 colours, [hex, shade spread] (default 0.07)
//   const v = new Voxels(0.5); v.box([x0, x1], [y0, y1], [z0, z1], 'red', 'Body'); v.set(x, y, z, 'amber', 'Glow_Eye'); v.clear(...)
//   const group = v.toGroup('Crate', pal);  // one mesh per part, Glow_ parts get the glow material; centred on x/z, bottom at 0
// Ranges are inclusive cell numbers; cell (i, j, k) fills [i, i+1] x cube. A merged quad never crosses a multiple of 8 cells, so its UVs
// land inside its colour's 8 x 8 tile of cube shades, lined up with the world grid: neighbouring cubes differ a little, and no seams show.
import * as THREE from 'three';
import './style-c-glb.mjs'; // installs the Node stand-ins GLTFExporter needs to write the texture

const TEX = 1024, TILE = 256, PAD = 16, CELL = (TILE - 2 * PAD) / 8; // 4 x 4 tiles, each 8 x 8 cells of 28 px, 16 px margin
const mod8 = (n) => ((n % 8) + 8) % 8;

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

export function makeVoxelPalette(colours, { seed = 7 } = {}) {
	const names = Object.keys(colours);
	if (names.length > 16) throw new Error(`makeVoxelPalette takes up to 16 colours, got ${names.length}`);
	const data = new Uint8Array(TEX * TEX * 4), rand = rng(seed), tileOf = {};
	names.forEach((n, t) => {
		const [hex, spread = 0.07] = Array.isArray(colours[n]) ? colours[n] : [colours[n]];
		const base = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
		const tx = t % 4, ty = Math.floor(t / 4); tileOf[n] = [tx, ty];
		const shade = [];
		for (let c = 0; c < 64; c++) { // each cube: brightness up or down by up to spread, and a faint warm or cool tilt within the hue
			const k = 1 + (rand() * 2 - 1) * spread, w = (rand() * 2 - 1) * spread * 0.35;
			shade.push(base.map((v, i) => Math.max(0, Math.min(255, Math.round(v * k * (i === 0 ? 1 + w : i === 2 ? 1 - w : 1))))));
		}
		for (let py = 0; py < TILE; py++) for (let px = 0; px < TILE; px++) {
			const cx = Math.min(7, Math.max(0, Math.floor((px - PAD) / CELL))), cy = Math.min(7, Math.max(0, Math.floor((py - PAD) / CELL)));
			const col = shade[cy * 8 + cx], i = ((ty * TILE + py) * TEX + tx * TILE + px) * 4;
			data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
		}
	});
	const tex = new THREE.DataTexture(data, TEX, TEX, THREE.RGBAFormat);
	tex.colorSpace = THREE.SRGBColorSpace; tex.name = 'VoxelColours'; tex.needsUpdate = true;
	const solid = new THREE.MeshStandardMaterial({ name: 'Solid', map: tex, metalness: 0, roughness: 0.85 });
	const glow = new THREE.MeshStandardMaterial({ name: 'Glow', map: tex, emissiveMap: tex, emissive: 0xffffff, metalness: 0, roughness: 0.6 });
	return { tileOf, solid, glow, tex, data, size: TEX };
}

export class Voxels {
	constructor(cube = 1) { this.cube = cube; this.m = new Map(); this.parts = []; }
	key(x, y, z) { return x + ',' + y + ',' + z; }
	get(x, y, z) { return this.m.get(this.key(x, y, z)); }
	set(x, y, z, c, p) {
		if (c == null) { this.m.delete(this.key(x, y, z)); return this; }
		if (!this.parts.includes(p)) this.parts.push(p);
		this.m.set(this.key(x, y, z), { c, p }); return this;
	}
	box([x0, x1], [y0, y1], [z0, z1], c, p) {
		for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
			for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) this.set(x, y, z, c, p);
		return this;
	}
	clear(xr, yr, zr) { return this.box(xr, yr, zr, null); }
	// call fn(x, y, z, cell) for every filled cell
	each(fn) { for (const [k, v] of this.m) { const [x, y, z] = k.split(',').map(Number); fn(x, y, z, v); } }
	bounds() {
		const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
		this.each((x, y, z) => { [x, y, z].forEach((v, i) => { lo[i] = Math.min(lo[i], v); hi[i] = Math.max(hi[i], v); }); });
		return { lo, hi };
	}
	toGroup(name, pal, { centre = true } = {}) {
		const { lo, hi } = this.bounds(), s = this.cube;
		const off = centre ? [-(lo[0] + hi[0] + 1) / 2 * s, -lo[1] * s, -(lo[2] + hi[2] + 1) / 2 * s] : [0, -lo[1] * s, 0];
		const g = new THREE.Group(); g.name = name;
		for (const part of this.parts) {
			const pos = [], nrm = [], uv = [], idx = [];
			for (let d = 0; d < 3; d++) {
				const ua = (d + 1) % 3, va = (d + 2) % 3;
				for (const sg of [-1, 1]) {
					for (let q = lo[d]; q <= hi[d]; q++) {
						const W = hi[ua] - lo[ua] + 1, H = hi[va] - lo[va] + 1, mask = new Array(W * H).fill(null);
						for (let a = 0; a < W; a++) for (let b = 0; b < H; b++) {
							const c = [0, 0, 0]; c[d] = q; c[ua] = lo[ua] + a; c[va] = lo[va] + b;
							const cell = this.get(...c); if (!cell || cell.p !== part) continue;
							c[d] += sg; if (this.get(...c)?.p === part) continue; // hidden: the same part is next to it (a face against another part stays, so each part is closed on its own)
							mask[a + b * W] = cell.c;
						}
						for (let b = 0; b < H; b++) for (let a = 0; a < W; a++) {
							const col = mask[a + b * W]; if (col == null) continue;
							const u0 = lo[ua] + a, v0 = lo[va] + b;
							let w = 1; while (a + w < W && mask[a + w + b * W] === col && mod8(u0 + w) !== 0) w++;
							let h = 1;
							grow: while (b + h < H && mod8(v0 + h) !== 0) {
								for (let k = 0; k < w; k++) if (mask[a + k + (b + h) * W] !== col) break grow;
								h++;
							}
							for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) mask[a + k + (b + j) * W] = null;
							// the quad
							const plane = q + (sg > 0 ? 1 : 0), base = pos.length / 3;
							const [tx, ty] = pal.tileOf[col]; if (tx === undefined) throw new Error('no colour ' + col);
							const cu = mod8(u0), cv = mod8(v0);
							for (const [du, dv] of [[0, 0], [w, 0], [w, h], [0, h]]) {
								const p = [0, 0, 0]; p[d] = plane; p[ua] = u0 + du; p[va] = v0 + dv;
								pos.push(p[0] * s + off[0], p[1] * s + off[1], p[2] * s + off[2]);
								const n = [0, 0, 0]; n[d] = sg; nrm.push(...n);
								uv.push((tx * TILE + PAD + (cu + du) * CELL) / TEX, (ty * TILE + PAD + (cv + dv) * CELL) / TEX);
							}
							// (ua x va) points along +d, so counter-clockwise from +d is 0,1,2,3
							if (sg > 0) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
							else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
						}
					}
				}
			}
			if (!idx.length) continue;
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
			geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
			geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
			geo.setIndex(idx);
			const mesh = new THREE.Mesh(geo, part.startsWith('Glow_') ? pal.glow : pal.solid); mesh.name = part;
			g.add(mesh);
		}
		return g;
	}
}
