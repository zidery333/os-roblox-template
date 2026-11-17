// Says whether a model may be started yet, from a game's Model Prompts.md.
// Run it before starting any model (the main model chat before each subchat, each subchat before it builds):
//   node check-order.mjs "Work/<Game>/Model Prompts.md" <model id>
// Rules (a model started before the one that sets the look has a yes is wasted work):
// - The file names its look model on a line "Look model: <id>". With no such line, nothing may start: ask the person.
// - The look model may always start. Every other model waits until the look model is saved.
// - A model also waits for every id in its "Make after" column that isn't saved yet.
// Prints "OK" or "WAIT" with the reason. Exits 0 for OK, 1 for WAIT, 2 for a broken file, an unknown id, or no arguments.
import { existsSync, readFileSync } from "node:fs";

const [file, id] = process.argv.slice(2);
if (!file || !id) {
	console.log('Use: node check-order.mjs "Work/<Game>/Model Prompts.md" <model id>');
	process.exit(2);
}
if (!existsSync(file)) {
	console.log("WAIT: no file at " + file);
	process.exit(2);
}
const text = readFileSync(file, "utf8");

const look = text.match(/Look model:\**\s*\**([A-Za-z]*\d+[a-z]?)/i)?.[1];
if (!look) {
	console.log(
		"WAIT: this game's Model Prompts.md doesn't name its look model. Ask the person which model sets the look, then add a line" +
			' near the top: "Look model: <id>". Nothing else starts until that model has their yes.',
	);
	process.exit(1);
}

// The order table: the first table whose header has a Status or State column.
const rows = new Map();
let cols = null;
for (const line of text.split("\n")) {
	if (!line.trim().startsWith("|")) {
		if (cols && rows.size) break;
		continue;
	}
	const cells = line.split("|").slice(1, -1).map((c) => c.trim());
	if (!cols) {
		if (cells.some((c) => /^(status|state)$/i.test(c))) cols = cells.map((c) => c.toLowerCase());
		continue;
	}
	if (/^-+$/.test(cells[0])) continue;
	rows.set(cells[0].toLowerCase(), cells);
}
if (!cols) {
	console.log("WAIT: no order table with a Status column found in " + file);
	process.exit(2);
}
const at = (name) => cols.findIndex((c) => c === name);
const statusCol = Math.max(at("status"), at("state"));
const afterCol = at("make after");

const saved = (key) => {
	const row = rows.get(key.toLowerCase());
	if (!row) return false;
	const s = row[statusCol] ?? "";
	return !/\b(not|no|wait|waiting|todo|to do|unsaved|unmade)\b|\bun(saved|made)/i.test(s) && /saved|made|in the game/i.test(s);
};

const row = rows.get(id.toLowerCase());
if (!row) {
	console.log(`WAIT: ${id} isn't in the order table. Add its row first (with Make after ${look} unless it is the look model).`);
	process.exit(2);
}

const waits = [];
if (id.toLowerCase() !== look.toLowerCase() && !saved(look)) {
	waits.push(`${look} (the look model: every other model is built on its saved .glb, so it needs the person's yes first)`);
}
if (afterCol >= 0) {
	for (const dep of (row[afterCol] ?? "").split(/[,\s]+/).filter((d) => /\d/.test(d))) {
		if (dep.toLowerCase() !== look.toLowerCase() && !saved(dep)) waits.push(dep);
	}
}

if (waits.length) {
	console.log(`WAIT: ${id} can't start yet. It waits for ${waits.join("; ")}.`);
	process.exit(1);
}
const attach = id.toLowerCase() === look.toLowerCase() ? "" : ` Attach ${look}'s saved .glb and build to match it.`;
console.log(`OK: ${id} may start.${attach}`);
