#!/usr/bin/env bash
# Copies the game template into a game's folder in Work/.
#   bash .claude/roblox/add-template.sh "Work/<Game>" "<Game name>"
# Never overwrites a file that is already there. Works on a Mac and on Windows inside WSL.

set -euo pipefail
unset CDPATH # a CDPATH someone set makes cd print the folder, which would end up in $here
here="$(cd "$(dirname "$0")" && pwd)"
dest="${1:-}"
name="${2:-}"

if [ -z "$dest" ] || [ -z "$name" ]; then
	echo "  usage: bash .claude/roblox/add-template.sh \"Work/<Game>\" \"<Game name>\""
	exit 1
fi
if [ "$name" != "$(printf '%s' "$name" | tr -d '\000-\037')" ]; then
	echo "  the game name can't have a line break or tab in it"
	exit 1
fi

if [ ! -d "$dest" ]; then
	echo "  no folder at $dest: make the game first with ./os new work \"$name\""
	exit 1
fi

# The name as sed puts it in: plain for most files, with " and \ escaped for JSON files.
# | not / around the pattern: Linux's sed (on Windows, in WSL) reads a / inside [ ] as the end of it.
for_sed() { printf '%s' "$1" | sed 's|[&/\]|\\&|g'; }
plain="$(for_sed "$name")"
json="$(for_sed "$(printf '%s' "$name" | sed 's/[\"]/\\&/g')")"

dest="$(cd "$dest" && pwd)"
if grep -qi microsoft /proc/version 2>/dev/null; then
	case "$dest" in
	/mnt/*)
		echo "  warning: $dest is on the Windows drive. Rojo can't see changes there from WSL."
		echo "           Keep this folder in your Linux home (~/...) instead."
		;;
	esac
fi
cd "$here/Template"
find . -type f | while read -r f; do
	target="$dest/${f#./}"
	if [ -e "$target" ]; then
		echo "  kept   ${f#./} (already there)"
		continue
	fi
	mkdir -p "$(dirname "$target")"
	case "$f" in
	*.json) value="$json" ;;
	*) value="$plain" ;;
	esac
	sed "s/{{GAME}}/$value/g" "$f" >"$target"
	echo "  added  ${f#./}"
done
chmod +x "$dest/check.sh" "$dest/start-rojo.sh"
