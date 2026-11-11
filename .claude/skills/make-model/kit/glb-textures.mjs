// Saves every texture inside .glb files as PNGs, so the colour checks can read them: node glb-textures.mjs outFolder a.glb [b.glb ...]
// Exits 1 if it was given no .glb, or none of them has a texture.
import fs from 'fs'; import path from 'path';
const [out, ...files] = process.argv.slice(2);
if (!out || !files.length) { console.error('Usage: node glb-textures.mjs outFolder a.glb [b.glb ...]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
let saved = 0;
for (const f of files) {
	const b = fs.readFileSync(f), jl = b.readUInt32LE(12), json = JSON.parse(b.subarray(20, 20 + jl).toString());
	const bin = b.subarray(20 + jl + 8);
	if (!json.images?.length) console.log('no texture in', f);
	(json.images || []).forEach((im, i) => { const v = json.bufferViews[im.bufferView];
		const p = path.join(out, `${path.basename(f, '.glb')}_${i}.png`); fs.writeFileSync(p, bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)); console.log('saved', p); saved++; });
}
if (!saved) { console.log('no textures saved: nothing for the colour check to read'); process.exit(1); }
