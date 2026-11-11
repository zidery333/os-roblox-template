// Screenshots of a view page with one headless Chrome, each taken only after the page sets window.ready (plain --screenshot gave random blank shots).
// Run: node shots-wait.mjs page.html outDir name1="query1" name2="query2" ...   (needs puppeteer-core and a Chrome; about 2 s a shot)
// Which Chrome: set CHROME_PATH to its full path. Without it, this tries the usual places for Mac, Linux and WSL (Linux inside Windows).
// On WSL use a Linux Chrome, not the Windows one: npx @puppeteer/browsers install chrome-headless-shell@stable, then point CHROME_PATH at it.
// Any recent Chrome works (tried with Chrome 157). puppeteer-core 23.11.1 was made for Chrome 131: if a newer one ever won't start,
// install that one instead: npx @puppeteer/browsers install chrome-headless-shell@131.0.6778.204
// WebGL here runs on the CPU (SwiftShader); --no-sandbox is fine because the page is your own local file.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const [page, outDir, ...jobs] = process.argv.slice(2);
if (!page || !outDir) { console.error('Usage: node shots-wait.mjs page.html outDir name="query" ...'); process.exit(2); }

function findChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	const tries = process.platform === 'darwin'
		? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
		: ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
	const found = tries.find((p) => fs.existsSync(p));
	if (found) return found;
	// chrome-headless-shell put in by @puppeteer/browsers lands under ./chrome-headless-shell/<os>-<version>/...
	const base = path.resolve('chrome-headless-shell');
	const dirs = (p) => { try { return fs.readdirSync(p).filter((n) => fs.statSync(path.join(p, n)).isDirectory()); } catch { return []; } };
	for (const d of dirs(base)) for (const sub of dirs(path.join(base, d))) {
		const p = path.join(base, d, sub, 'chrome-headless-shell');
		if (fs.existsSync(p)) return p;
	}
	console.error('No Chrome found. Set CHROME_PATH, or run: npx @puppeteer/browsers install chrome-headless-shell@stable');
	process.exit(2);
}

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true,
	args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', ...(process.platform === 'linux' ? ['--no-sandbox'] : [])] });
const tab = await browser.newPage();
await tab.setViewport({ width: 1400, height: 900 });
const url = pathToFileURL(path.resolve(page)).href; // spaces and # in a folder name are written so Chrome finds the file
for (const job of jobs) {
	const i = job.indexOf('='), name = job.slice(0, i), q = job.slice(i + 1);
	await tab.goto(url + '?' + q, { waitUntil: 'load', timeout: 120000 });
	await tab.waitForFunction('window.ready === true', { timeout: 120000 });
	await new Promise((r) => setTimeout(r, 900));
	await tab.screenshot({ path: `${outDir}/${name}.png` });
	console.log(`${outDir}/${name}.png`);
}
await browser.close();
