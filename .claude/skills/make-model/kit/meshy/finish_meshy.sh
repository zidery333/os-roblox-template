#!/usr/bin/env bash
# Finish one Meshy model for Roblox and make its check sheet. Runs on Mac, Linux and WSL.
# Needs: Blender (your own install: on the PATH, or BLENDER=<path to it>), and Python 3 with Pillow and numpy.
# Meshy itself needs your own account and costs credits: this script only finishes a file you already made there.
# Run from the model's own draft folder:
#   finish_meshy.sh <meshy.blend> <height in studs> <Name, e.g. DrakeRemesh> <picture.png>
# LABEL=<word> names this try (default "Remesh"): the Meshy file is kept as "Meshy/<Name> Meshy <LABEL>.blend" and the
# finished files go to "Drafts/<Name> <LABEL>". It never overwrites either: give a new LABEL for every new try
# (Restart, Retexture, Try 2...). OUT=<folder> picks the output folder yourself. FORCE=1 allows replacing an existing
# output folder (never the Meshy file). PARTS (default 6) is how many parts the model is split into, TURN (default 180)
# is the turn that makes it face Roblox's front. PY=<python> picks another Python.
# Exits 0 when the .glb was written, 1 on any problem (a missing file, no Blender, no Python packages, nothing exported), 2 for no arguments.
set -uo pipefail
unset CDPATH
SRC="${1:-}"; H="${2:-}"; NAME="${3:-}"; PIC="${4:-}"
[ -n "$PIC" ] || { echo "usage: finish_meshy.sh <meshy.blend> <height studs> <Name> <picture.png>"; exit 2; }
[ -f "$SRC" ] || { echo "no such file: $SRC"; exit 1; }
[ -f "$PIC" ] || { echo "no such picture: $PIC"; exit 1; }
here() { ( cd "$(dirname "$1")" 2>/dev/null && printf '%s/%s\n' "$(pwd -P)" "$(basename "$1")" ); }
K="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# Blender: BLENDER, else the one on the PATH, else the usual Mac app place.
B="${BLENDER:-}"
if [ -z "$B" ]; then
  if command -v blender >/dev/null 2>&1; then B="$(command -v blender)"
  elif [ -x /Applications/Blender.app/Contents/MacOS/Blender ]; then B=/Applications/Blender.app/Contents/MacOS/Blender
  else echo "Blender not found. Install Blender 4.1 or newer from blender.org (on WSL, the Linux build; Ubuntu's apt one is too old), or set BLENDER=<path>."; exit 1; fi
fi
# The picture steps need Pillow and numpy. The kit's own Python lives in ~/.venvs/meshy-kit; PY=<python> uses another.
PY="${PY:-}"
if [ -z "$PY" ]; then
  if [ -x "$HOME/.venvs/meshy-kit/bin/python" ]; then PY="$HOME/.venvs/meshy-kit/bin/python"; else PY=python3; fi
fi
"$PY" -I -c 'import PIL, numpy' 2>/dev/null || {
  echo "This Python has no Pillow/numpy: $PY. Make the kit's Python once (this downloads Pillow, numpy, scipy):"
  echo "  python3 -m venv ~/.venvs/meshy-kit && ~/.venvs/meshy-kit/bin/pip install pillow numpy scipy"
  exit 1; }
L="${LABEL:-Remesh}"
S="$(mktemp -d "${TMPDIR:-/tmp}/finish_XXXXXX")" || { echo "could not make a scratch folder"; exit 1; }
trap 'rm -rf "$S"' EXIT
# A file already in Meshy/ is used where it is. Anything else is copied in under this try's own name, never over
# another file: those Meshy files cost credits, so nothing could bring one back.
O="${OUT:-Drafts/$NAME $L}"
if [ -e "$O" ] && [ -z "${FORCE:-}" ]; then
  echo "STOP: $O already exists. Use a new LABEL or OUT, or FORCE=1 to replace it."; exit 1
fi
mkdir -p Meshy || exit 1
M="Meshy/$NAME Meshy $L.blend"
case "$(here "$SRC")" in
  "$(pwd -P)/Meshy/"*) M="$SRC";;
  *) if [ -e "$M" ] && ! [ "$SRC" -ef "$M" ]; then
       echo "STOP: $M already exists and is a different file. Run again with LABEL=<new word> for this try."; exit 1
     fi
     [ "$SRC" -ef "$M" ] || cp "$SRC" "$M" || exit 1;;
esac
"$B" -b --factory-startup -P "$K/finish_remesh.py" -- --src "$M" --out "$S" --name "$NAME" 2>&1 | grep -E "\[fin\]|Error|Traceback"
rm -rf "$O"
# a Meshy model made straight at low triangles may have no bump texture: pass --normal only when there is one
NARG=()
for n in "$S/${NAME}_Normal_"*.png; do [ -f "$n" ] && { NARG=(--normal "$n"); break; }; done
COL=""
for c in "$S/${NAME}_Color_"*.png; do [ -f "$c" ] && { COL="$c"; break; }; done
[ -n "$COL" ] || { echo "No colour texture came out of $M: is it a textured Meshy file?"; exit 1; }
"$B" -b --factory-startup -P "$K/split_sharp.py" -- --src "$M" --color "$COL" ${NARG[@]+"${NARG[@]}"} --out "$O" --name "$NAME" --parts "${PARTS:-6}" --height "$H" --turn "${TURN:-180}" 2>&1 | grep -E "clean shading|sized|turned|exported|WARN|Error|Traceback"
[ -f "$O/$NAME.glb" ] || { echo "FAIL: no $O/$NAME.glb was written. Run split_sharp.py by hand to see why."; exit 1; }
"$B" -b --factory-startup -P "$K/views.py" -- "$O/$NAME.glb" "$S/r" turned >/dev/null 2>&1
cat > "$S/exp.py" <<'PYEOF'
import bpy, sys
out=sys.argv[sys.argv.index('--')+1]
for o in bpy.data.objects: o.select_set(o.type=='MESH')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True)
PYEOF
"$B" -b "$M" -P "$S/exp.py" -- "$S/raw.glb" >/dev/null 2>&1
"$B" -b --factory-startup -P "$K/views.py" -- "$S/raw.glb" "$S/m" >/dev/null 2>&1
"$PY" -I "$K/sheet.py" "$O/$NAME Check.png" "$PIC::The picture" "$S/m_front34.png::Meshy's model" "$S/r_front34.png::Roblox file" "$S/r_side.png::Side" "$S/r_back.png::Back" || { echo "FAIL: the check sheet was not made"; exit 1; }
ls -la "$O/$NAME.glb"
