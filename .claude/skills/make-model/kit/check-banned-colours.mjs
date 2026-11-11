// Flags PNGs that use a colour the game bans (the prompt's "never" lines), dark shades and old reused pieces included.
// Run: node check-banned-colours.mjs --ban red,blue <folder or .png> [more]   (needs @napi-rs/canvas; looks in subfolders too)
// Colour names: red, orange, yellow, green, cyan, blue, purple, pink. There is no default: pass only what this game bans.
// For a 3D model, write its colour textures out first with glb-colours-png.mjs (every PNG it writes). Exits 1 if any picture is flagged, or if there are no PNGs or no --ban.
import { loadImage, createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// hue ranges in degrees (0 to 360)
const HUES = { red: [[340, 360], [0, 18]], orange: [[18, 45]], yellow: [[45, 70]], green: [[70, 170]], cyan: [[170, 200]],
	blue: [[200, 265]], purple: [[265, 300]], pink: [[300, 340]] };
const args = process.argv.slice(2), bi = args.indexOf('--ban');
const ban = bi >= 0 ? (args[bi + 1] || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
const paths = args.filter((_, i) => bi < 0 || (i !== bi && i !== bi + 1));
if (!ban.length || !paths.length) { console.error('Usage: node check-banned-colours.mjs --ban red,blue <folder or .png> [more]'); process.exit(1); }
for (const b of ban) if (!HUES[b]) { console.error('unknown colour', b, '- use', Object.keys(HUES).join(', ')); process.exit(1); }
const walk = (p) => fs.statSync(p).isDirectory()
	? fs.readdirSync(p).filter((f) => !f.startsWith('.') && f !== 'node_modules').flatMap((f) => walk(path.join(p, f)))
	: p.toLowerCase().endsWith('.png') ? [p] : [];
const files = paths.flatMap(walk).sort();
if (!files.length) { console.error('no PNGs found in', paths.join(', ')); process.exit(1); }
const which = (h) => ban.find((b) => HUES[b].some(([lo, hi]) => h >= lo && h < hi));
let bad = 0;
for (const f of files) {
	const im = await loadImage(f), c = createCanvas(im.width, im.height), t = c.getContext('2d'); t.drawImage(im, 0, 0);
	const d = t.getImageData(0, 0, im.width, im.height).data; const hits = {}, ex = {};
	for (let i = 0; i < d.length; i += 4) {
		if (d[i + 3] < 128) continue;
		const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
		// bright colours need a little colour to count; dark ones need a lot, so near-black ink and greys never count
		if (mx < 0.12 || sat < (mx < 0.3 ? 0.5 : 0.3)) continue;
		let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
		const k = which(h);
		if (k) { hits[k] = (hits[k] || 0) + 1; ex[k] = [d[i], d[i + 1], d[i + 2]]; }
	}
	const total = Object.values(hits).reduce((a, n) => a + n, 0);
	if (total > 4) { bad++; console.log('FLAG', f, JSON.stringify(hits), 'e.g.', JSON.stringify(ex)); }
}
console.log(files.length, 'files checked,', bad, 'flagged');
process.exit(bad ? 1 : 0);
