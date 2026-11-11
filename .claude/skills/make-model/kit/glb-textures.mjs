// Saves every texture inside .glb files as PNGs, so the colour checks can read them: node glb-textures.mjs outFolder a.glb [b.glb ...]
import fs from 'fs'; import path from 'path';
const [out, ...files] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
for (const f of files) {
	const b = fs.readFileSync(f), jl = b.readUInt32LE(12), json = JSON.parse(b.subarray(20, 20 + jl).toString());
	const bin = b.subarray(20 + jl + 8);
	(json.images || []).forEach((im, i) => { const v = json.bufferViews[im.bufferView];
		const p = path.join(out, `${path.basename(f, '.glb')}_${i}.png`); fs.writeFileSync(p, bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)); console.log('saved', p); });
}
