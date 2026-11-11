// Turns every Spin_ group a full turn round its pivot's up and reports how close its parts come to any other solid part (outlines left out):
// the turning parts sweep a solid cylinder round the axle, and every other part's surface is sampled against it. Run: node check-spin-room.mjs model.glb
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const b = fs.readFileSync(process.argv[2]);
new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', (g) => {
  g.scene.updateMatrixWorld(true);
  const groups = []; g.scene.traverse((o) => { if (/^Spin_/.test(o.name) && !o.isMesh) groups.push(o); });
  let bad = 0;
  for (const grp of groups) {
    const inv = grp.matrixWorld.clone().invert(); const mine = new Set(); grp.traverse((o) => mine.add(o));
    // the swept cylinder in the group's frame (its up is the axle): radius and height range
    let rmax = 0, y0 = Infinity, y1 = -Infinity; const v = new THREE.Vector3();
    grp.traverse((m) => { if (!m.isMesh || m.name.startsWith('Outline_')) return; const p = m.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld).applyMatrix4(inv); rmax = Math.max(rmax, Math.hypot(v.x, v.z)); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); } });
    let worst = Infinity, who = '';
    g.scene.traverse((m) => { if (!m.isMesh || mine.has(m) || m.name.startsWith('Outline_')) return; const p = m.geometry.attributes.position;
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), q = new THREE.Vector3(); const N = 12;
      for (let i = 0; i < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
        for (let a = 0; a <= N; a++) for (let c = 0; a + c <= N; c++) { q.set(0, 0, 0).addScaledVector(A, 1 - (a + c) / N).addScaledVector(B, a / N).addScaledVector(C, c / N).applyMatrix4(m.matrixWorld).applyMatrix4(inv);
          const d = Math.hypot(Math.max(0, Math.hypot(q.x, q.z) - rmax), Math.max(0, y0 - q.y, q.y - y1)); if (d < worst) { worst = d; who = m.name; } } } });
    const ok = worst >= 0.3; if (!ok) bad++;
    console.log(grp.name.padEnd(14), 'sweeps radius', rmax.toFixed(2), 'closest', worst.toFixed(2), 'studs (' + who + ')', ok ? 'ok' : 'TOO CLOSE');
  }
  process.exit(bad ? 1 : 0);
});
