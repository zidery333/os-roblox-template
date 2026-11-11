#!/usr/bin/env bash
# Prints the Windows folder %LOCALAPPDATA% as a Linux path: C:\Users\Sam\AppData\Local comes out as
# the same folder under /mnt/c.
# For WSL only: Roblox Studio, its plugins and its MCP link all live under it, in Roblox\.
#   bash .claude/roblox/win-localappdata.sh
# Only the path goes to stdout. Every message goes to stderr.
# Ends with: 0 found it; 1 can't find it; 2 Windows programs can't be run from WSL (the path is
# still printed when the folder search below found it); 3 this isn't WSL.
#
# How: ask cmd.exe. Two things go wrong with that, and both are handled here.
# - cmd.exe reads stdin if it's given one, which would eat the AI's first message to the MCP
#   server, so every call gets </dev/null.
# - A name with letters outside English comes back garbled (cmd prints in an old code page), so
#   the path it gives isn't a real folder. Then this looks through every user's AppData\Local
#   under /mnt/c for the Roblox folder instead.

say() { printf '%s\n' "$*" >&2; }
homes=/mnt/c/Users   # every Windows user's own folder, seen from WSL

if ! grep -qi microsoft /proc/version 2>/dev/null && [ -z "${WSL_DISTRO_NAME:-}" ] \
	&& [ ! -e /proc/sys/fs/binfmt_misc/WSLInterop ]; then
	say "This isn't WSL. %LOCALAPPDATA% only means something on Windows."
	exit 3
fi

cmd=""
if command -v cmd.exe >/dev/null 2>&1; then
	cmd="$(command -v cmd.exe)"
elif [ -x /mnt/c/Windows/System32/cmd.exe ]; then
	cmd=/mnt/c/Windows/System32/cmd.exe
fi

# cmd.exe won't start in a Linux folder (it sees a \\wsl.localhost path), so it runs from the C: drive.
win_lad=""
if [ -n "$cmd" ]; then
	# 'set' prints NAME=value without cmd reading the value as a command,
	# so a user name with & in it can't run anything. Its error goes to the
	# same pipe, so any output at all means Windows programs can run.
	raw="$(cd /mnt/c 2>/dev/null || cd /; "$cmd" /d /c set LOCALAPPDATA </dev/null 2>&1 | LC_ALL=C tr -d '\r')"
	win_lad="$(printf '%s\n' "$raw" | LC_ALL=C sed -n 's/^LOCALAPPDATA=//p' | head -n 1)"
fi
interop=1
if [ -z "${raw:-}" ]; then
	interop=0
fi

lad=""
if [ -n "$win_lad" ] && [ "$win_lad" != "%LOCALAPPDATA%" ]; then
	lad="$(wslpath -u "$win_lad" 2>/dev/null)"
fi
if [ -n "$lad" ] && [ -d "$lad" ]; then
	printf '%s\n' "$lad"
	exit 0
fi

# No real folder: look for it. A Roblox folder with mcp.bat in it beats one without. When there
# are several, the one named like cmd's own answer wins, else the one Roblox changed last.
user="$(printf '%s' "$win_lad" | LC_ALL=C tr '\\' '/' | LC_ALL=C sed -n 's#^[A-Za-z]:/[Uu]sers/\([^/]*\)/.*#\1#p')"
best=""
best_rank=0
for dir in "$homes"/*/AppData/Local; do
	[ -d "$dir/Roblox" ] || continue
	rank=1
	[ -f "$dir/Roblox/mcp.bat" ] && rank=2
	name="${dir#"$homes"?}"
	name="${name%%/*}"
	[ -n "$user" ] && [ "$name" = "$user" ] && rank=$((rank + 2))
	if [ "$rank" -gt "$best_rank" ] || { [ "$rank" -eq "$best_rank" ] && [ "$dir/Roblox" -nt "$best/Roblox" ]; }; then
		best="$dir"
		best_rank="$rank"
	fi
done

if [ "$interop" = 0 ]; then
	if [ -n "$cmd" ]; then
		say "WSL can't run Windows programs (cmd.exe gave nothing back): Windows interop is off. Turn it back on in /etc/wsl.conf ([interop] enabled=true), then run 'wsl --shutdown' in Windows and open Ubuntu again."
	else
		say "WSL can't see Windows (no cmd.exe, and no C: drive at /mnt/c)."
	fi
	[ -n "$best" ] && printf '%s\n' "$best"
	exit 2
fi
if [ -n "$best" ]; then
	printf '%s\n' "$best"
	exit 0
fi
say "Can't find Windows' %LOCALAPPDATA% folder (cmd.exe said: $win_lad), and no user's AppData\Local under $homes has a Roblox folder."
exit 1
