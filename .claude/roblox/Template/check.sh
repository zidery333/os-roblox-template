#!/usr/bin/env bash
# The five checks. Work only counts as done when all five say ok.
#   ./check.sh        run them
#   ./check.sh --fix  fix the formatting first, then run them
# Works on a Mac and on Windows inside WSL. The tools come from rokit (rokit.toml pins them).

unset CDPATH # a CDPATH someone set can send cd to another game's folder
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
	local out status
	out=$("$@" 2>&1)
	status=$?
	if [ "$status" -eq 0 ]; then
		echo "  ok    $name"
	else
		echo "  FAIL  $name"
		# 142 is the 5-minute stop on the tests below (perl's alarm).
		if [ "$status" -eq 142 ]; then
			out="${out:+$out
}Stopped after 5 minutes with no end: something waits for ever, often a syntax error in a module a test needs."
		fi
		printf '%s\n' "$out" | sed 's/^/        /'
		fail=1
	fi
}

build_out="${TMPDIR:-/tmp}/roblox-game-check-$$.rbxl"
check "builds        (rojo)" rojo build default.project.json -o "$build_out"
rm -f "$build_out"
check "lint          (selene)" selene Code Tests
check "formatting    (stylua)" stylua --check Code Tests
# Runs a command, and after $1 seconds stops it and everything it started (exit 142). Everything matters: the
# `lune` rokit puts on the PATH is a small program that starts the real Lune, so stopping only the first one would
# leave the real one running for ever. perl comes with every Mac and with Ubuntu on Windows.
with_limit() {
	perl -e '
		my $secs = shift;
		my $pid = fork() // die "cannot start: $!\n";
		if (!$pid) { setpgrp(0, 0); exec @ARGV or die "cannot run $ARGV[0]: $!\n" }
		setpgrp($pid, $pid);
		$SIG{ALRM} = sub { kill "KILL", -$pid; waitpid($pid, 0); exit 142 };
		alarm $secs;
		waitpid($pid, 0);
		exit($? & 127 ? 128 + ($? & 127) : $? >> 8);
	' "$@"
}

# A syntax error in a module a test needs can leave Lune printing it and then waiting for ever: stop it after
# 5 minutes.
check "tests         (lune)" with_limit 300 lune run Tests/run.luau

# Types: --!strict is checked here, not only in Studio's editor, so a misspelled Config key fails. The map of
# where each script sits in the game comes from Rojo; Roblox's own types are in Types/ (from luau-lsp 1.70.1).
types() {
	local map="${TMPDIR:-/tmp}/roblox-game-sourcemap-$$.json"
	rojo sourcemap default.project.json -o "$map" >/dev/null || return 1
	local out status
	out=$(luau-lsp analyze --platform=roblox --sourcemap="$map" --definitions=@roblox=Types/globalTypes.d.luau Code 2>&1)
	status=$?
	# An old Roblox call is only a warning to luau-lsp, which still says ok. Here it fails.
	if printf '%s\n' "$out" | grep -q "DeprecatedApi"; then
		status=1
	fi
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
