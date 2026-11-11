// Flat 2D "sticker" drawing for picture prompts (UI kits, logos): outline-then-fill shapes, rings, 9-slice, save. Needs @napi-rs/canvas.
// Use: copy it beside your drawing script, then import { canvas, shape, rr, circ, poly, ring, slice9, save } from './picture-helpers.mjs'.
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';

export const O = 12; // outline thickness in pixels, the same on every picture
export function canvas(w, h) { const c = createCanvas(w, h); const x = c.getContext('2d'); x.lineJoin = 'round'; x.lineCap = 'round'; return [c, x]; }
// Stroke a dark outline twice as wide as O, then fill on top: half the stroke shows outside the shape.
export function shape(x, path, fill, o = O, ink = '#141418') {
  x.beginPath(); path(x);
  if (o > 0) { x.lineWidth = o * 2; x.strokeStyle = ink; x.stroke(); }
  if (fill) { x.fillStyle = fill; x.fill(); }
}
export const rr = (x0, y0, w, h, r) => (x) => x.roundRect(x0, y0, w, h, r);
export const circ = (cx, cy, r) => (x) => x.arc(cx, cy, r, 0, Math.PI * 2);
export const poly = (pts) => (x) => { x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); x.closePath(); };
// A ring (fill it with x.fill('evenodd')).
export const ring = (cx, cy, r1, r2) => (x) => { x.arc(cx, cy, r2, 0, Math.PI * 2); x.moveTo(cx + r1, cy); x.arc(cx, cy, r1, 0, Math.PI * 2, true); };
// Draw a stretchable piece: m = source corner size, dm = drawn corner size.
export function slice9(x, im, dx, dy, dw, dh, m, dm = m) {
  const W = im.width, H = im.height, sx = [0, m, W - m, W], sy = [0, m, H - m, H];
  const tx = [dx, dx + dm, dx + dw - dm, dx + dw], ty = [dy, dy + dm, dy + dh - dm, dy + dh];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    x.drawImage(im, sx[i], sy[j], sx[i + 1] - sx[i], sy[j + 1] - sy[j], tx[i], ty[j], tx[i + 1] - tx[i], ty[j + 1] - ty[j]);
}
export function save(c, path) { fs.writeFileSync(path, c.toBuffer('image/png')); }
