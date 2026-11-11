// Crops view-page screenshots to the 3D stage (drops the page header and notes). Run: node crop-stage.mjs inDir outDir [x y w h]
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const [inDir, outDir, x = 17, y = 66, w = 1366, h = 646] = process.argv.slice(2).map((v, i) => (i < 2 ? v : +v));
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(inDir).filter((f) => f.endsWith('.png'))) {
	const img = await loadImage(`${inDir}/${f}`), c = createCanvas(w, h); c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
	fs.writeFileSync(`${outDir}/${f}`, c.toBuffer('image/png'));
}
