// Prints each PNG's size and how many pixels are see-through.
// Run: node check-pictures.mjs <folder>   (needs @napi-rs/canvas).
import { loadImage, createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
const dir = process.argv[2];
if (!dir) { console.error('Usage: node check-pictures.mjs <folder>'); process.exit(2); }
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.png')).sort()) {
  const im = await loadImage(`${dir}/${f}`); const c = createCanvas(im.width, im.height); const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, im.width, im.height).data; let clear = 0;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 10) clear++; }
  console.log(f.padEnd(28), `${im.width}x${im.height}`.padEnd(10), 'see-through:', clear);
}
