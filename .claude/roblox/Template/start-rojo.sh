#!/usr/bin/env bash
# Starts Rojo for this game, on its own, so it keeps running after the chat that started it closes.
# Safe to run any time: if this game's Rojo is already running it says so and does nothing.
# If another game's Rojo has the port, it says which game and starts nothing.
#   ./start-rojo.sh         start it
#   ./start-rojo.sh --stop  stop whatever Rojo has the port (ask the person first if it's another game)
# The same file works for every game: it reads the game's name from default.project.json.
# Works on a Mac and on Windows inside WSL. Needs bash and python3, nothing else.

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.rokit/bin:$PATH"
port="${ROJO_PORT:-34872}"
url="${ROJO_URL:-http://127.0.0.1:$port/api/rojo}"
tmp="${TMPDIR:-/tmp}"
tmp="${tmp%/}"
log="$tmp/$(basename "$PWD" | tr -c 'A-Za-z0-9._\n-' '-')-rojo.log"
pidfile="$tmp/roblox-game-rojo-$port.pid"

wsl=0
if grep -qi microsoft /proc/version 2>/dev/null; then
	wsl=1
fi

if ! command -v python3 >/dev/null 2>&1; then
	echo "  FAIL  python3 is not installed. It comes with the folder's setup: run /setup again."
	exit 1
fi

# This game's name, as Rojo will report it.
game="$(python3 -c 'import json; print(json.load(open("default.project.json", encoding="utf-8")).get("name", ""))' 2>/dev/null)"
if [ -z "$game" ]; then
	echo "  FAIL  Can't read the game's name from default.project.json."
	exit 1
fi

# Prints the name of the game Rojo is serving on the port, or nothing if no Rojo answers.
# Rojo 7.7 answers in msgpack (packed binary), older ones in JSON. This reads both.
running_game() {
	python3 - "$url" <<'PY' 2>/dev/null
import json, sys, urllib.request
# No proxy: Rojo is on this computer, and a proxy set for the internet can't reach it.
try:
    data = urllib.request.build_opener(urllib.request.ProxyHandler({})).open(sys.argv[1], timeout=2).read()
except Exception:
    sys.exit(0)
if data.lstrip().startswith(b"{"):
    try:
        print(json.loads(data).get("projectName", "?"))
    except Exception:
        print("?")
    sys.exit(0)
at = data.find(b"projectName")
if at < 0:
    print("?" if data else "")
    sys.exit(0)
i = at + len(b"projectName")
b = data[i] if i < len(data) else 0
if 0xA0 <= b <= 0xBF:
    n, i = b - 0xA0, i + 1
elif b == 0xD9:
    n, i = data[i + 1], i + 2
elif b == 0xDA:
    n, i = int.from_bytes(data[i + 1:i + 3], "big"), i + 3
else:
    print("?")
    sys.exit(0)
print(data[i:i + n].decode("utf-8", "replace"))
PY
}

# True when the program with this number is Rojo. A saved number can belong to another program
# by now, so nothing is stopped without asking this first.
is_rojo() {
	local name
	name="$(ps -p "$1" -o comm= 2>/dev/null)"
	case "${name##*/}" in
	rojo | rojo.exe) return 0 ;;
	esac
	return 1
}

# Stops the Rojo on the port: the one this script started (its number is kept in a file), else
# whatever lsof or fuser finds listening there. Only ever a program that really is Rojo.
stop_rojo() {
	local pid=""
	if [ -f "$pidfile" ]; then
		pid="$(cat "$pidfile")"
	fi
	if [ -n "$pid" ] && ! { kill -0 "$pid" 2>/dev/null && is_rojo "$pid"; }; then
		pid=""
		rm -f "$pidfile"
	fi
	if [ -z "$pid" ]; then
		if command -v lsof >/dev/null 2>&1; then
			pid="$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null | head -1)"
		elif command -v fuser >/dev/null 2>&1; then
			pid="$(fuser "$port/tcp" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' | head -1)"
		fi
	fi
	if [ -z "$pid" ]; then
		echo "  FAIL  Can't tell which program has port $port. Close the terminal running rojo serve, then try again."
		return 1
	fi
	if ! is_rojo "$pid"; then
		echo "  FAIL  Port $port is held by program $pid, which isn't Rojo. Stopped nothing."
		return 1
	fi
	if ! kill "$pid" 2>/dev/null; then
		echo "  FAIL  Couldn't stop Rojo (program $pid). Close the terminal running it, then try again."
		return 1
	fi
	rm -f "$pidfile"
	sleep 1
	if [ -n "$(running_game)" ]; then
		echo "  FAIL  Rojo still answers on port $port. Close the terminal running it, then try again."
		return 1
	fi
	echo "  ok    Stopped Rojo on port $port."
}

if [ "${1:-}" = "--stop" ]; then
	if [ -z "$(running_game)" ]; then
		echo "  ok    No Rojo is running on port $port."
		exit 0
	fi
	stop_rojo
	exit $?
fi

if [ "$wsl" = 1 ]; then
	case "$PWD" in
	/mnt/*)
		echo "  FAIL  This game is on the Windows drive ($PWD)."
		echo "        Rojo can't see changes there from WSL, so Studio would never update."
		echo "        Keep this folder in your Linux home (~/...), then run this again."
		exit 1
		;;
	esac
fi

if ! command -v rojo >/dev/null 2>&1; then
	echo "  MISSING  rojo is not installed. In this folder, run: ~/.rokit/bin/rokit install --no-trust-check"
	exit 2
fi

now="$(running_game)"
if [ "$now" = "$game" ]; then
	echo "  ok    Rojo is already running for $game (port $port)."
	exit 0
elif [ -n "$now" ]; then
	echo "  FAIL  Port $port is taken by Rojo for another game: $now. Started nothing."
	echo "        Only one game syncs at a time. Stop that one first, then run this again:"
	echo "        ./start-rojo.sh --stop"
	exit 1
fi

# Rojo listens on 127.0.0.1 only (its default). On Windows, WSL passes that through to Windows, so
# Studio reaches it at localhost. Never use --address 0.0.0.0: that opens it to the whole network.
nohup rojo serve default.project.json --port "$port" >"$log" 2>&1 </dev/null &
echo $! >"$pidfile"
disown

for _ in 1 2 3 4 5 6 7 8 9 10; do
	sleep 1
	if [ "$(running_game)" = "$game" ]; then
		echo "  ok    Rojo started for $game (port $port). Log: $log"
		echo "        If Studio's Rojo panel says disconnected, press Connect in it."
		if [ "$wsl" = 1 ]; then
			echo "        If Studio can't reach localhost, type 127.0.0.1 and port $port in the Rojo panel."
		fi
		exit 0
	fi
done

# Stop the one this script started, so a slow or broken start doesn't leave it holding the port.
pid="$(cat "$pidfile" 2>/dev/null)"
if [ -n "$pid" ] && is_rojo "$pid"; then
	kill "$pid" 2>/dev/null
fi
rm -f "$pidfile"
echo "  FAIL  Rojo did not start. Log: $log"
tail -20 "$log"
exit 1
