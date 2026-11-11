// Recolours a saved PNG to new colours, keeping its exact shape and soft edges (a lose banner from a win banner, say).
// Run: node recolour-picture.mjs <in.png> <out.png> '{"#ffc928":"#5d5d6a",...}' [outline #141418]   (needs @napi-rs/canvas)
// List every colour the picture has (keep one as itself: "#f7f6f1":"#f7f6f1"). Pixels that match no listed colour are still written,
// snapped to the nearest one, but it lists them and exits 1.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const [src, dst, mapJson, outline = '#141418'] = process.argv.slice(2);
if (!src || !dst || !mapJson) { console.error('Usage: node recolour-picture.mjs <in.png> <out.png> \'{"#old":"#new",...}\' [outline #141418]'); process.exit(2); }
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const K = hex(outline), pairs = Object.entries(JSON.parse(mapJson)).map(([a, b]) => [hex(a), hex(b)]);
const img = await loadImage(src), c = createCanvas(img.width, img.height), g = c.getContext('2d');
g.drawImage(img, 0, 0);
const d = g.getImageData(0, 0, img.width, img.height), p = d.data;
const missed = new Map(); // colours no pair explains: hex -> pixel count
const toHex = (i) => '#' + [0, 1, 2].map((k) => p[i + k].toString(16).padStart(2, '0')).join('');
for (let i = 0; i < p.length; i += 4) {
  if (!p[i + 3]) continue;
  // each pixel is the outline colour mixed with one old colour: find which, and how much, then mix with the new one
  let best = null;
  for (const [a, b] of pairs) {
    let num = 0, den = 0;
    for (let k = 0; k < 3; k++) { num += (p[i + k] - K[k]) * (a[k] - K[k]); den += (a[k] - K[k]) ** 2; }
    const t = Math.max(0, Math.min(1, num / den)); let err = 0;
    for (let k = 0; k < 3; k++) err += (p[i + k] - (K[k] + t * (a[k] - K[k]))) ** 2;
    if (!best || err < best.err) best = { err, t, b };
  }
  if (p[i + 3] > 200 && best.err > 30 * 30) { const h = toHex(i); missed.set(h, (missed.get(h) || 0) + 1); } // over 30 away on solid pixels
  for (let k = 0; k < 3; k++) p[i + k] = Math.round(K[k] + best.t * (best.b[k] - K[k]));
}
g.putImageData(d, 0, 0);
fs.writeFileSync(dst, c.toBuffer('image/png'));
console.log('wrote', dst);
const miss = [...missed].filter(([, n]) => n >= 20).sort((a, b) => b[1] - a[1]); // a few stray edge pixels don't count
if (miss.length) {
  console.log(miss.reduce((s, [, n]) => s + n, 0) + ' pixels match no colour in the map and were snapped to the nearest one. Add these:');
  for (const [h, n] of miss.slice(0, 8)) console.log('  ' + h + '  (' + n + ' pixels)');
  process.exit(1);
}
