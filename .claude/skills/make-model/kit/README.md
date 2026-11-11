# Make-model kit

Code that worked before, for the /make-model skill. To run any of it: copy this folder to your
scratchpad, run `npm install` there (`package.json` lists the packages), and run the scripts from
that copy. Never install inside the game folder. Each file's first lines say how to run or use it.

**Mac and Windows.** Plain Node, so the same on both. On Windows run it inside WSL (Linux), with Node
from nvm, and keep the copy in the Linux home (`~/`), not `/mnt/c`. Screenshots need a Chrome:
on a Mac, Google Chrome is found by itself; in WSL, run
`npx @puppeteer/browsers install chrome-headless-shell@stable` in the kit copy, or set `CHROME_PATH`.

**The styles.** Builders are named after the look they make. The letters are just labels:
- style C, "bare minimum": the fewest flat-faced shapes, each with a black outline shell.
- style A, "painted toy": soft bevelled pieces, no outlines.
- style F, "faceted gem": every face a flat cut facet.
- style I, "wooden toy": style A with a faint wood grain.
- toon: two or three hard bands of light and shadow per colour, thick ink outlines.

## Building models (.glb)

- `style-c-glb.mjs`: style C prisms with black `Outline_` shells, the palette (up to 16 colours) and `exportGLB`. Most models start here; the other builders export with its `exportGLB`.
- `hull-pieces.mjs`: style C pieces made from points (rounded finds, blobs, sticks), unbroken rings and stars, and `settle()` to stand a model on 0.
- `hull-octagons.mjs`: boxes, octagon tubes and cones along any axis (tilted barrels, dishes) and a two-colour piece, for `hull-pieces.mjs`.
- `style-c-moving-parts.mjs`: pieces that turn or swing (legs, arms, wheels), with outlines that move with them.
- `style-c-flat-shape.mjs`: one piece from any flat outline, jagged or zigzag, with one unbroken outline.
- `style-c-tilted-piece.mjs`: one piece whose parts are each turned (a tool tilted at an elbow), outlines turning with them.
- `style-c-plates.mjs`: shapes that face the front (a frame with round holes, rings, a star of blades, a plus shape) with closed outlines, mixed with box prisms in one piece.
- `style-c-joined-boxes.mjs`: box pieces joined edge to edge (a long top in two halves) with no black line at the join, and shells kept under a walked-on top.
- `style-c-leaning-sign.mjs`: a flat sign leant back on a roof with a wedge stand behind it, so it reads from the front and from above.
- `style-a-painted-toy.mjs`: soft-bevelled pieces with no outlines (rounded boxes, cylinders, cones, domes, gem crystals) with painted light baked into one gradient texture.
- `style-i-wooden-toy.mjs`: style A pieces plus pegs and wheels, with a faint wood grain baked in that follows each piece.
- `style-f-faceted-gem.mjs`: flat-faceted low-poly pieces with no outlines, a shade per facet baked into one texture so it survives in Roblox.
- `candy-glb.mjs`: round, glossy, outline-free parts (spheres, capsules, rounded boxes, puffy lathes, gems), colours light on top to rich below.
- `clay-glb.mjs`: hand-pressed clay parts: shapes welded and lumped by seeded noise (same seed, same lumps), rolled snakes, a matte palette, and `fitBox()` to an exact size on 0.
- `brick-glb.mjs`: toy bricks and plates with a bevelled seam, studs, slopes, round bricks, flat decals and gems, added to `candy-glb.mjs` parts.
- `gadget-glb.mjs`: sleek gadget parts with few triangles: rounded slabs and panels with a chamfered edge, discs, domes, arcs and gems, satin metal, gloss, glass and glow materials, optional cheap outline shells.
- `voxel-glb.mjs`: block-world models from a grid of equal cubes, hidden faces dropped and same-colour runs merged, each cube its own slight shade.
- `toon-glb.mjs`: toon parts: two tones per colour baked in by facing, a thick ink `Outline_<piece>` shell on every piece, cheap chamfered boxes, bend/twist/bulge and `fitGroup()` to an exact size on 0. View it with a toon material, its sun along `LIGHT`, shells casting no shadow.
- `toon3.mjs`: `toon-glb.mjs` with three bands per colour [highlight, base, shadow], for creatures.
- `creature-shapes.mjs`: shapes for toon creatures: a lofted body along a spine, tapered tubes with closed round ends, bendable slabs (wings, fins), flat cones.
- `toon-extras.mjs`: for toon parts: a box chamfered on its upright and top edges only (36 triangles), and a faceted crystal with a glint and one closed ink shell.

## Checking models

- `inspect-glb.mjs`: each part's size, centre and triangles, then the whole model's, to compare with the prompt.
- `check-planes.mjs`: faces that would flicker (two looks in one plane). Run it on every model.
- `check-open-edges.mjs`: parts you can see through (an uncapped tube end, a hole in a shell). Run it on every model.
- `check-ground.mjs`: whether a model really rests on the floor: names parts hovering just off it, and fails one sitting on a point. Run it on every model.
- `check-spin-room.mjs`: turns every `Spin_` group a full turn and says how close it comes to anything else.
- `check-sweep.mjs`: swings `Sweep_` groups a half turn and `Aim_` heads a full circle, and says how close they come to other parts.
- `check-hinge.mjs`: swings hinged pieces (a lid round X; `--axis y` for an upright door) a quarter turn and says how close they come to every other part.
- `check-hinge-swing.mjs`: swings two hinged doors (a double gate) at once and says how close they come to other parts and each other.
- `check-joint-swing.mjs`: swings a creature's legs, head, jaw, wings and tail alone and in walking poses, and says which pieces touch or dip under the floor.
- `check-banned-colours.mjs`: flags PNGs using a colour the prompt bans (`--ban red,blue`; no default).
- `glb-colours-png.mjs`: writes a .glb's colour texture as a PNG, so the colour check can check a model.
- `glb-textures.mjs`: saves every texture inside .glb files as PNGs.
- `fit-corners.mjs`: frames an angled view by the models' own points on screen, centred, nothing cut off. Paste it into every view page.

## Looking at models

- `view-3d-page.mjs`: the one-page 3D view the person judges by (spin, zoom, `?view=front`, a player-sized block, extras as toggles).
- `view-multi-page.mjs`: one 3D view of several .glb files side by side (toggles, parts hidden, a character built from several files).
- `view-sheet-page.mjs`: a style test sheet: one .glb's top-level groups in a row, labelled, with Three-quarter, Top-down and Front buttons, each group's size and triangles, and a picture under it on a checkerboard.
- `view-look-sheet-page.mjs`: a pick-a-look page: several .glb in one spinnable row on white, toon-lit, a grey 5-tall player beside each, a label and a Download button over each; hooks for screenshots (`?focus=<id>&view=side`). Use it for the first model's 4 versions.
- `shots-wait.mjs`: screenshots of a view page from one headless Chrome, each after the page sets `window.ready`; about 2 s a shot, never blank.
- `crop-stage.mjs`: crops view-page screenshots to the 3D stage, for `contact-sheet.mjs`.
- `save-png-server.mjs`: serves a view page on this computer and saves the PNGs it sends back.

## Pictures (UI kits, icons, logos)

- `picture-helpers.mjs`: outline-then-fill drawing, rings, 9-slice and save.
- `stretch-frames.mjs`: stretchable buttons, slots and bars (swap its colours for the game's own).
- `recolour-picture.mjs`: recolours a saved PNG, keeping its shape and soft edges.
- `contact-sheet.mjs`: every PNG in a folder on one checkerboard sheet, labelled with name and size.
- `check-pictures.mjs`: each PNG's size and see-through pixels.
- `check-cut-edges.mjs`: PNGs whose drawing touches the edge (cut off).
