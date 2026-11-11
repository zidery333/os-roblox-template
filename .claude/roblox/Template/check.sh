#!/usr/bin/env bash
# The five checks. Work only counts as done when all five say ok.
#   ./check.sh        run them
#   ./check.sh --fix  fix the formatting first, then run them
# Works on a Mac and on Windows inside WSL. The tools come from rokit (rokit.toml pins them).

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.rokit/bin:$PATH"

for tool in rojo selene stylua lune luau-lsp; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		echo "  MISSING  $tool is not installed. In this folder, run: ~/.rokit/bin/rokit install --no-trust-check"
		exit 2
	fi
done

if [ "${1:-}" = "--fix" ]; then
	# One pass can leave its own --check failing (a long call reflowed twice): run it twice.
	stylua Code Tests && stylua Code Tests
fi

fail=0
check() {
	local name="$1"
	shift
	local out
	if out=$("$@" 2>&1); then
		echo "  ok    $name"
	else
		echo "  FAIL  $name"
		printf '%s\n' "$out" | sed 's/^/        /'
		fail=1
	fi
}

build_out="${TMPDIR:-/tmp}/roblox-game-check-$$.rbxl"
check "builds        (rojo)" rojo build default.project.json -o "$build_out"
rm -f "$build_out"
check "lint          (selene)" selene Code Tests
check "formatting    (stylua)" stylua --check Code Tests
check "tests         (lune)" lune run Tests/run.luau

# Types: --!strict is checked here, not only in Studio's editor, so a misspelled Config key fails. The map of
# where each script sits in the game comes from Rojo; Roblox's own types are in Types/ (from luau-lsp 1.70.1).
types() {
	local map="${TMPDIR:-/tmp}/roblox-game-sourcemap-$$.json"
	rojo sourcemap default.project.json -o "$map" >/dev/null || return 1
	local out status
	out=$(luau-lsp analyze --platform=roblox --sourcemap="$map" --definitions=@roblox=Types/globalTypes.d.luau Code 2>&1)
	status=$?
	rm -f "$map"
	printf '%s\n' "$out" | grep -vE '^\[(INFO|WARN)\]' | awk '!seen[$0]++'
	return "$status"
}
check "types         (luau-lsp)" types

if [ "$fail" -eq 0 ]; then
	echo "  All five checks pass."
else
	echo "  Not done: fix what failed, then run ./check.sh again."
fi
exit "$fail"
