// Lays every PNG in a folder on one sheet to look at, on a light checkerboard so see-through edges show, each labelled with its name and size.
// Run: node contact-sheet.mjs <folder> <out.png> [cell px] [columns]   (needs @napi-rs/canvas)
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const [dir, out] = process.argv.slice(2), cell = +process.argv[4] || 300, cols = +process.argv[5] || 4;
if (!dir || !out) { console.error('Usage: node contact-sheet.mjs <folder> <out.png> [cell px] [columns]'); process.exit(2); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
if (!files.length) { console.error('no PNGs in ' + dir); process.exit(2); }
const LABEL = 40; // two lines under each cell: name, then size
const c = createCanvas(cols * cell, Math.ceil(files.length / cols) * (cell + LABEL)); const x = c.getContext('2d');
// light checkerboard, 16 px squares
x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
x.fillStyle = '#e6e7ea';
for (let yy = 0; yy < c.height; yy += 16) for (let xx = (yy / 16) % 2 ? 16 : 0; xx < c.width; xx += 32) x.fillRect(xx, yy, 16, 16);
for (const [i, f] of files.entries()) {
  const im = await loadImage(`${dir}/${f}`), s = Math.min(1, (cell - 10) / im.width, (cell - 10) / im.height);
  const X = (i % cols) * cell, Y = Math.floor(i / cols) * (cell + LABEL);
  x.drawImage(im, X + (cell - im.width * s) / 2, Y + (cell - im.height * s) / 2, im.width * s, im.height * s);
  // labels on a white strip so they read over the checkerboard
  x.fillStyle = '#ffffff'; x.fillRect(X, Y + cell, cell, LABEL);
  x.fillStyle = '#111'; x.font = 'bold 14px sans-serif'; x.fillText(f.replace(/\.png$/, ''), X + 5, Y + cell + 16, cell - 10);
  x.fillStyle = '#666'; x.font = '13px sans-serif'; x.fillText(`${im.width} × ${im.height}`, X + 5, Y + cell + 33);
}
fs.writeFileSync(out, c.toBuffer('image/png'));
console.log('wrote', out, files.length, 'pictures');
