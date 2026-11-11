// Writes a .glb's colour texture out as a PNG, so check-banned-colours.mjs can check a 3D model's colours: node glb-colours-png.mjs out.png model.glb (no packages needed; prints its materials and see-through ones)
import fs from 'fs';
const [out, file] = process.argv.slice(2); const b = fs.readFileSync(file);
const jl = b.readUInt32LE(12), json = JSON.parse(b.slice(20, 20 + jl).toString()), bin = b.slice(20 + jl + 8);
const img = json.images[0], bv = json.bufferViews[img.bufferView];
fs.writeFileSync(out, bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength));
console.log(out, json.images.length, 'image(s), materials:', json.materials.map((m) => m.name + (m.alphaMode ? ' ' + m.alphaMode + ' ' + m.pbrMetallicRoughness.baseColorFactor?.[3] : '')).join(', '));
