// Writes a .glb's colour textures out as PNGs, so check-banned-colours.mjs can check a 3D model's colours: node glb-colours-png.mjs out.png model.glb
// (no packages needed; prints its materials and see-through ones). The first texture goes to out.png; a model built from two palettes has two,
// and the second goes to out-2.png, and so on: check every PNG it prints. Exits 1 if the file has no texture (its colours can't be checked this way).
import fs from 'fs';
const [out, file] = process.argv.slice(2);
if (!out || !file) { console.error('Usage: node glb-colours-png.mjs out.png model.glb'); process.exit(1); }
const b = fs.readFileSync(file);
const jl = b.readUInt32LE(12), json = JSON.parse(b.slice(20, 20 + jl).toString()), bin = b.slice(20 + jl + 8);
const images = json.images || [];
console.log(file, images.length, 'image(s), materials:', (json.materials || []).map((m) => (m.name || 'unnamed') + (m.alphaMode ? ' ' + m.alphaMode + ' ' + m.pbrMetallicRoughness?.baseColorFactor?.[3] : '')).join(', '));
if (!images.length) { console.log('no colour texture in', file, ': nothing to write (are its colours in the materials instead?)'); process.exit(1); }
images.forEach((img, i) => {
	const bv = json.bufferViews[img.bufferView], to = i ? out.replace(/(\.png)?$/i, `-${i + 1}.png`) : out;
	fs.writeFileSync(to, bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength));
	console.log('wrote', to);
});
