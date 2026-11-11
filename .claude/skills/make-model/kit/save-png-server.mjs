// Serves a folder on this computer only and saves PNGs a page POSTs to /save?name=x.png (a data: URL as the body), for 3D view screenshots.
// Run: node save-png-server.mjs <folder> [port]   (no packages needed). With no port it picks a free one and prints it, so several chats can run one each.
// It stops by itself after 10 minutes with no requests, or when the page opens /stop.
import http from 'http';
import fs from 'fs';
import path from 'path';

const dir = path.resolve(process.argv[2] || '.'), wanted = +(process.argv[3] || 0);
const IDLE_MS = 10 * 60 * 1000, MAX_BODY = 50 * 1024 * 1024;
const servers = [];
let idle;
const stop = (why) => { console.log('stopping:', why); for (const s of servers) s.close(); process.exit(0); };
const touch = () => { clearTimeout(idle); idle = setTimeout(() => stop('10 minutes with no requests'), IDLE_MS); };

function handle(q, r) {
	touch();
	const url = new URL(q.url, 'http://x');
	if (url.pathname === '/stop') { r.end('stopped'); return setTimeout(() => stop('/stop was opened'), 50); }
	if (q.method === 'POST') {
		let b = '', big = false;
		q.on('data', (d) => { if (b.length + d.length > MAX_BODY) big = true; else b += d; });
		q.on('end', () => {
			try {
				const name = (url.searchParams.get('name') || 'shot.png').replace(/[^\w.-]/g, '').replace(/^\.+/, '') || 'shot.png';
				const m = /^data:image\/png;base64,(.+)$/s.exec(b);
				if (big || !m) { r.statusCode = 400; return r.end(big ? 'too big' : 'body must be a data:image/png;base64 URL'); }
				fs.writeFileSync(path.join(dir, name), Buffer.from(m[1], 'base64'));
				console.log('saved', name);
				r.end('ok ' + name);
			} catch (e) { r.statusCode = 500; r.end('could not save: ' + e.message); }
		});
		return;
	}
	const f = path.join(dir, path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
	if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
	r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.png') ? 'image/png' : 'application/octet-stream');
	r.end(fs.readFileSync(f));
}

// localhost only: one server on 127.0.0.1, and one on ::1 at the same port (the browser may try either for "localhost")
const first = http.createServer(handle);
servers.push(first);
first.on('error', (e) => { console.error('could not start:', e.message); process.exit(1); });
first.listen(wanted, '127.0.0.1', () => {
	const port = first.address().port, second = http.createServer(handle);
	second.on('error', () => {}); // no IPv6 here: 127.0.0.1 alone is fine
	second.listen(port, '::1');
	servers.push(second);
	touch();
	console.log('serving', dir, 'on http://localhost:' + port, '(stops after 10 idle minutes, or open /stop)');
});
