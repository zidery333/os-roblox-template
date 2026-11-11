// Prints each PNG's size and how many pixels are see-through, and flags a picture with none at all (the rules want a see-through background).
// Run: node check-pictures.mjs <folder or .png> [--allow "^(Bar|Panel)"]   (needs @napi-rs/canvas). --allow: pictures whose file name
// matches may fill their whole square (a plain bar that stretches). Exits 1 if any picture is flagged, or if there are no PNGs.
import { loadImage, createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
const args = process.argv.slice(2), ai = args.indexOf('--allow'), allow = ai >= 0 ? new RegExp(args.splice(ai, 2)[1]) : null, dir = args[0];
if (!dir) { console.error('Usage: node check-pictures.mjs <folder or .png> [--allow "^(Bar|Panel)"]'); process.exit(1); }
const files = fs.statSync(dir).isDirectory() ? fs.readdirSync(dir).filter((n) => n.endsWith('.png')).sort().map((n) => path.join(dir, n)) : [dir];
if (!files.length) { console.error('no PNGs in', dir, ': nothing to check'); process.exit(1); }
let bad = 0;
for (const f of files) {
  const im = await loadImage(f); const c = createCanvas(im.width, im.height); const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, im.width, im.height).data; let clear = 0;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 10) clear++; }
  const name = path.basename(f), flag = !clear && !(allow && allow.test(name));
  if (flag) bad++;
  console.log(name.padEnd(28), `${im.width}x${im.height}`.padEnd(10), 'see-through:', clear, flag ? '  NO SEE-THROUGH BACKGROUND' : '');
}
console.log(files.length, 'pictures checked,', bad, 'flagged');
process.exit(bad ? 1 : 0);
