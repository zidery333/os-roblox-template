"""Puts several pictures side by side on one labelled check sheet, each scaled to the same height.
Run: python3 sheet.py <out.png> "<picture.png>::<label>" ["<picture.png>::<label>" ...]   (needs Pillow)
Exits 1 with a usage line if given no output name or no pictures, or a picture can't be opened."""
import sys
from PIL import Image, ImageDraw
if len(sys.argv) < 3 or any('::' not in a for a in sys.argv[2:]):
    print('Usage: python3 sheet.py <out.png> "<picture.png>::<label>" ...'); sys.exit(1)
out, *items = sys.argv[1:]
H = 520; tiles = []
for it in items:
    p, label = it.split('::', 1)
    try: im = Image.open(p).convert('RGB')
    except OSError as e: print('cannot open', p, '-', e); sys.exit(1)
    w, h = im.size; s = H / h; im = im.resize((int(w * s), H), Image.LANCZOS)
    t = Image.new('RGB', (im.width, H + 40), (30, 30, 34)); t.paste(im, (0, 0)); ImageDraw.Draw(t).text((10, H + 12), label, fill=(235, 235, 235))
    tiles.append(t)
W = sum(t.width for t in tiles) + 10 * (len(tiles) - 1); sheet = Image.new('RGB', (W, H + 40), (30, 30, 34)); x = 0
for t in tiles: sheet.paste(t, (x, 0)); x += t.width + 10
sheet.save(out)
