// Prints each part's name, box size, centre and triangles, then the whole model's box and triangle count, to check against a prompt.
// Run: node inspect-glb.mjs model.glb   (needs three@0.170.0; exits 1 if the file has no parts)
// A part's size is its own box, not its children's (a moving part's Outline_ child).
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
if (!process.argv[2]) { console.error('Usage: node inspect-glb.mjs model.glb'); process.exit(2); }
const buf = fs.readFileSync(process.argv[2]);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
new GLTFLoader().parse(ab, '', (g) => {
  const all = new THREE.Box3(); let tris = 0, parts = 0;
  g.scene.updateMatrixWorld(true);
  g.scene.traverse((o) => { if (!o.isMesh) return;
    parts++;
    o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); all.union(b); // this part only, not its children
    const t = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; tris += t;
    const s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    console.log(o.name.padEnd(18), 'size', s.toArray().map(v => v.toFixed(2)).join(' x '), ' centre', c.toArray().map(v => v.toFixed(2)).join(', '), ' tris', t);
  });
  if (!parts) { console.error('no parts in ' + process.argv[2]); process.exit(1); }
  const s = all.getSize(new THREE.Vector3()), c = all.getCenter(new THREE.Vector3());
  console.log('WHOLE size', s.toArray().map(v => v.toFixed(2)).join(' x '), 'centre', c.toArray().map(v => v.toFixed(2)).join(', '), 'min y', all.min.y.toFixed(3), 'tris', tris);
}, (e) => { console.error(e.message || e); process.exit(2); });
