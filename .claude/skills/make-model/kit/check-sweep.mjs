// Swings every Sweep_ group a half turn (-90 to 90 degrees) round its pivot's up, turns every Aim_ group a full circle, and reports the closest
// it comes to any other solid part: node check-sweep.mjs model.glb  (needs three@0.170.0). Outlines left out, its own Mount left out, and a
// Turntable piece in the group left out. Each corner of the moving parts is measured against the other parts' boxes, so a turned piece's
// box corners don't count as hits. A Collar (the ring an Aim_ head turns on) counts like a Mount, its gap printed on its own.
import fs from 'fs'; import * as THREE from 'three'; import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self ??= globalThis; console.warn = () => {};
const b = fs.readFileSync(process.argv[2]);
new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length), '', (g) => {
  g.scene.updateMatrixWorld(true);
  const groups = []; g.scene.traverse((o) => { if (/^Sweep_|^Spin_|^Bob_|^Aim_/.test(o.name) && !o.isMesh) groups.push(o); });
  for (const grp of groups) {
    const mine = new Set(); grp.traverse((o) => mine.add(o));
    const others = []; g.scene.traverse((o) => { if (o.isMesh && !mine.has(o) && !o.name.startsWith('Outline_') && !/^(Mount|Collar)/.test(o.name)) others.push([o.name, new THREE.Box3().setFromObject(o)]); });
    const rings = []; g.scene.traverse((o) => { if (o.isMesh && !mine.has(o) && /^Collar/.test(o.name)) rings.push(new THREE.Box3().setFromObject(o)); }); let ring = Infinity;
    let worst = Infinity, who = '', at = 0; const base = grp.rotation.y, v = new THREE.Vector3(), full = /^Aim_/.test(grp.name);
    for (let a = full ? 0 : -90; a <= (full ? 355 : 90); a += 5) {
      grp.rotation.y = base + a * Math.PI / 180; grp.updateMatrixWorld(true);
      grp.traverse((m) => { if (!m.isMesh || m.name.startsWith('Outline_') || /^Turntable/.test(m.name)) return; const p = m.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
          for (const [n, ob] of others) { const d = ob.distanceToPoint(v); if (d < worst) { worst = d; who = m.name + ' / ' + n; at = a; } }
          for (const rb of rings) ring = Math.min(ring, rb.distanceToPoint(v)); } });
    }
    grp.rotation.y = base;
    console.log(grp.name.padEnd(14), 'closest', worst.toFixed(2), 'studs (' + who + ' at ' + at + ' deg)', worst >= 0.3 ? 'ok' : 'TOO CLOSE', rings.length ? '| over its Collar ' + ring.toFixed(2) : '');
  }
});
