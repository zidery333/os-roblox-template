// Lists PNGs whose drawing touches the picture's edge (cut off); stretchable pieces that run to the edge on purpose will show too.
// Run: node check-cut-edges.mjs <folder>   (needs @napi-rs/canvas).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const dir = process.argv[2];
if (!dir) { console.error('Usage: node check-cut-edges.mjs <folder>'); process.exit(2); }
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.png')).sort()) {
  const im = await loadImage(dir + '/' + f), w = im.width, h = im.height, c = createCanvas(w, h), g = c.getContext('2d');
  g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, w, h).data; let n = 0;
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (d[(y * w + x) * 4 + 3] > 40) n++;
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (d[(y * w + x) * 4 + 3] > 40) n++;
  if (n) console.log(f, n, 'edge pixels');
}
