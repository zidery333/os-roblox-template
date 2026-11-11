// Lists PNGs whose drawing touches the picture's edge (cut off). Stretchable pieces run to the edge on purpose: name them with --allow.
// Run: node check-cut-edges.mjs <folder or .png> [--allow "^(Button|Slot|Bar)"]   (needs @napi-rs/canvas). --allow: pictures whose file
// name matches may touch the edge. Exits 1 if any other picture touches it, or if there are no PNGs.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
const args = process.argv.slice(2), ai = args.indexOf('--allow'), allow = ai >= 0 ? new RegExp(args.splice(ai, 2)[1]) : null, dir = args[0];
if (!dir) { console.error('Usage: node check-cut-edges.mjs <folder or .png> [--allow "^(Button|Slot|Bar)"]'); process.exit(1); }
const files = fs.statSync(dir).isDirectory() ? fs.readdirSync(dir).filter((n) => n.endsWith('.png')).sort().map((n) => path.join(dir, n)) : [dir];
if (!files.length) { console.error('no PNGs in', dir, ': nothing to check'); process.exit(1); }
let bad = 0;
for (const f of files) {
  const im = await loadImage(f), w = im.width, h = im.height, c = createCanvas(w, h), g = c.getContext('2d');
  g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, w, h).data; let n = 0;
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (d[(y * w + x) * 4 + 3] > 40) n++;
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (d[(y * w + x) * 4 + 3] > 40) n++;
  const name = path.basename(f), ok = allow && allow.test(name);
  if (n && !ok) bad++;
  if (n) console.log(name, n, 'edge pixels', ok ? '(allowed: it stretches)' : 'CUT OFF');
}
console.log(files.length, 'pictures checked,', bad, 'cut off');
process.exit(bad ? 1 : 0);
