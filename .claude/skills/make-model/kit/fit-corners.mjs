// Frames a three.js view seen from any angle so the models fill a share of the screen, centred, nothing cut off: it fits by the models' own points
// as seen on screen (or a box's 8 corners), not a sphere round them (a sphere leaves an angled view cut off and off to one side).
// Paste FIT_CORNERS_JS into a view page's <script> (three r128 global), then call fitCorners(camera, controls, what, [dx, dy, dz], 0.8, 0.85):
// what = an Object3D (its visible meshes' points) or a Box3; dir points from the models to the camera; 0.8 = share of the width, 0.85 = of the height.
export const FIT_CORNERS_JS = `
function fitCorners(camera, controls, what, dir, fillW = 0.8, fillH = 0.85) {
  const pts = [];
  if (what.isBox3) { for (const x of [what.min.x, what.max.x]) for (const y of [what.min.y, what.max.y]) for (const z of [what.min.z, what.max.z]) pts.push(new THREE.Vector3(x, y, z)); }
  else {
    what.updateMatrixWorld(true); const meshes = []; let n = 0;
    what.traverse((o) => { let vis = o.visible; for (let p = o.parent; p && vis; p = p.parent) vis = p.visible; if (o.isMesh && vis) { meshes.push(o); n += o.geometry.attributes.position.count; } });
    const step = Math.max(1, Math.floor(n / 30000));
    for (const m of meshes) { const P = m.geometry.attributes.position; for (let i = 0; i < P.count; i += step) pts.push(new THREE.Vector3().fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld)); }
  }
  const box = new THREE.Box3().setFromPoints(pts), D = new THREE.Vector3(...dir).normalize(), T = box.getCenter(new THREE.Vector3());
  let d = box.getSize(new THREE.Vector3()).length() * 1.5; const v = new THREE.Vector3();
  for (let i = 0; i < 12; i++) {
    camera.position.copy(T).addScaledVector(D, d); camera.lookAt(T); camera.updateMatrixWorld(true);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of pts) { v.copy(p).project(camera); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    const halfH = d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), halfW = halfH * camera.aspect;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    T.addScaledVector(right, (x0 + x1) / 2 * halfW).addScaledVector(up, (y0 + y1) / 2 * halfH);
    d *= Math.max((x1 - x0) / 2 / fillW, (y1 - y0) / 2 / fillH);
  }
  camera.position.copy(T).addScaledVector(D, d); camera.near = d / 50; camera.far = d * 10; camera.updateProjectionMatrix();
  controls.target.copy(T); camera.lookAt(T);
  return { target: T, distance: d };
}
`;
