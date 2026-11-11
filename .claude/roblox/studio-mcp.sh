#!/usr/bin/env bash
# Starts Roblox Studio's MCP server, so the AI can talk to Studio. .mcp.json runs this.
# It finds Studio on a Mac, or on Windows when this folder runs inside WSL, then hands over to it.
# Rules: nothing may be printed to stdout before Studio takes over (that line is how the AI and
# Studio talk), and nothing may read stdin before then (the AI's first message is waiting there).
# Every message here goes to stderr, and every Windows call before the hand-over gets </dev/null.
#   To use a StudioMCP somewhere else, set STUDIO_MCP to its full path.

say() { printf 'Roblox Studio link: %s\n' "$*" >&2; }
hand_over() { printf "Found Roblox Studio's link at %s, handing over.\n" "$1" >&2; }

if [ -n "${STUDIO_MCP:-}" ]; then
	if [ -x "$STUDIO_MCP" ]; then
		hand_over "$STUDIO_MCP"
		exec "$STUDIO_MCP" "$@"
	fi
	say "STUDIO_MCP is set to $STUDIO_MCP, but nothing runnable is there. Fix the path or unset it."
	exit 1
fi

case "$(uname -s)" in
Darwin)
	for app in "/Applications/RobloxStudio.app" "$HOME/Applications/RobloxStudio.app"; do
		if [ -x "$app/Contents/MacOS/StudioMCP" ]; then
			hand_over "$app/Contents/MacOS/StudioMCP"
			exec "$app/Contents/MacOS/StudioMCP" "$@"
		fi
	done
	say "Roblox Studio isn't installed. Get it from create.roblox.com, open it once, then restart this chat."
	exit 1
	;;
esac

if ! grep -qi microsoft /proc/version 2>/dev/null && [ -z "${WSL_DISTRO_NAME:-}" ] \
	&& [ ! -e /proc/sys/fs/binfmt_misc/WSLInterop ]; then
	say "this only works on a Mac, or on Windows inside WSL. Roblox Studio doesn't run on Linux."
	exit 1
fi

# Windows, inside WSL. Studio lives on the Windows side under %LOCALAPPDATA%\Roblox.
here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
lad="$(bash "$here/win-localappdata.sh" </dev/null 2>/dev/null)"
case $? in
2)
	say "WSL can't run Windows programs right now (Windows interop is off), so it can't start Studio's link. Turn it back on in /etc/wsl.conf ([interop] enabled=true), run 'wsl --shutdown' in Windows, open Ubuntu again, then restart this chat."
	exit 1
	;;
0) ;;
*)
	say "can't find Roblox Studio on Windows. If it isn't installed, get it from create.roblox.com, open it once, then restart this chat. If it is, run 'bash .claude/roblox/win-localappdata.sh' to see why."
	exit 1
	;;
esac
if [ -z "$lad" ] || [ ! -d "$lad/Roblox" ]; then
	say "Roblox Studio isn't installed on Windows. Get it from create.roblox.com, open it once, then restart this chat."
	exit 1
fi

cmd="cmd.exe"
if ! command -v "$cmd" >/dev/null 2>&1; then
	cmd="/mnt/c/Windows/System32/cmd.exe"
fi

# Studio writes mcp.bat itself and keeps it pointing at the current version. That is the official
# way. cmd.exe starts in its folder and is given only its name: a full path with & ( ) or ^ in it
# (a user name can have them) would break cmd's own reading of the line.
if [ -f "$lad/Roblox/mcp.bat" ]; then
	cd "$lad/Roblox" || exit 1
	hand_over "$lad/Roblox/mcp.bat"
	exec "$cmd" /d /c mcp.bat "$@"
fi

# No mcp.bat: run the newest StudioMCP.exe straight (its folder name changes with every Studio update).
newest=""
for exe in "$lad"/Roblox/Versions/*/StudioMCP.exe; do
	if [ -f "$exe" ] && { [ -z "$newest" ] || [ "$exe" -nt "$newest" ]; }; then
		newest="$exe"
	fi
done
if [ -n "$newest" ]; then
	cd "$(dirname "$newest")" || exit 1
	hand_over "$newest"
	exec "$newest" "$@"
fi

say "Studio is installed, but its MCP server isn't turned on. In Studio: Assistant, then the ... menu, then Manage MCP Servers, turn on \"Enable Studio as MCP server\". Then restart this chat."
exit 1
