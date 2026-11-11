# Model lessons for every game

Read before making a model or writing a prompt for one. Each line is a rule that came from a change
someone asked for or a mistake that could happen again. How lines get here and go: "How it learns" in
`SKILL.md`. One game's style or taste: that game's `Model Lessons.md`. Kit files: `kit/README.md`.
`- <the rule>. Why: <what goes wrong>.`

## Order of work
- Be quick: a model reaches the person well inside an hour. Run the kit's checks first (seconds, and they
  catch what screenshots miss), then a short set of screenshots (front three-quarter, side, behind and
  the worst close-ups), not dozens. Why: a look sheet that took over an hour felt slow and wasteful.
- The first model of a game (or of a new look) sets the look: make only that one, get a yes, and only
  then start the rest, each built to match it. Why: drafts made beside it in a look nobody had approved
  were all thrown away.
- That first model starts as 4 clearly different versions (different outline, head, finish), the
  prompt's sizes and part names kept, shown side by side to pick one; only then refine the pick. Why:
  round after round on one guess never got to a look they liked.

## Writing the prompt
- Lay a prompt out as short labelled lines on top (Make, What it does, Size, Looks like, Colours, Special
  parts, Files, Triangles, Show), a `---`, then the game's "Rules for every model" block (below). Why:
  long prompts can't be skimmed.
- "Low-poly" isn't enough: name the exact style picked, ban parts thinner than a tenth of the thing
  (unless the person asks for finer), and set a triangle range (300 to 800 for small things). Why: every
  model still came out detailed.
- Say what can't be guessed: every surface needed (a ceiling, a see-through window and what's outside
  it), only the bare surface under things that have their own models, and left or right with the X sign
  (facing -Z, -X is on your right). Why: "the right-hand end" with the wrong sign flipped a model.

### Rules for every model (copy into the game's Model Prompts.md, then fill in)
```
Rules for every model in this game:
- Title the view just "<model name>", nothing more.
- The game: <Game>, a Roblox game. <Two or three plain lines: what the player is, where it happens,
  how big the player is (Roblox characters are 5 tall), what it's seen from.>
- The look comes only from the STYLE line. If the game recolours parts in code: every part is one plain
  colour, with no painted detail, no pictures on it, no text, no gradients, because a part with painted
  detail can't be recoloured, so all the detail is in the shapes.
- Colours: every part is one colour from the Colours line. Name every part exactly as listed. Any
  extra piece is named starting with the colour slot it takes (Body_, Trim_, Accent_), so the game can
  recolour it by its name: a .glb can't carry Roblox attributes.
- Every piece is its own named part, never merged into one mesh. Anything the style adds to a piece
  (an outline shell, a bevel) is named after it and moves with it: Outline_<piece name>.
- Every glowing part is its own part named starting with Glow_ (the game makes it Neon).
- Moving parts: one named group each (Spin_ spins on and on, Sweep_ swings back and forth, Bob_ moves
  up and down, Aim_ turns to face a target, a hinged lid or door turns on its hinge). Its pivot sits
  exactly on its axle or hinge, it holds everything that moves with it (named plainly inside, never
  the group's own name), and it stays 0.3 clear of every other piece through its whole motion.
- Feet: a model that stands on legs, posts or stilts names the parts that touch the ground Foot_1,
  Foot_2 and so on. The game stands it on those.
- Markers: where the list asks for one, a tiny 0.2 cube with that exact name at that spot. The game
  turns markers into Attachments and adds any joints itself.
- No floor, base plate or ground under it, and nothing below height 0 (the game stands a model on its
  lowest point). Nothing thinner than about a tenth of the thing unless the person asks. A detail on a
  surface is sunk about half its thickness into it: never hovering, never in the same plane, or it flickers.
- Units: 1 unit = 1 stud. Centred on the origin, bottom at height 0, front facing -Z. A part ending
  in L is on the model's own left, at -X.
- Files: the .glb files on the Files line, colours baked into one 1024 x 1024 texture each, within the
  Triangles line, and every single part under 20,000 triangles (Roblox's limit). No lights, cameras,
  animations, skeleton or ground plane in a file.
- Show it: a 3D view to spin and zoom, plain white background, soft even light and a soft shadow, the
  models filling the view, the files inside the viewer so it can't come up empty. Then one short list
  of anything not done exactly as asked (a size, a name, the number of parts, the triangle count).
```
For pictures, the block says instead: no words, letters or numbers in any picture (the game writes them
in its own font, so leave room); each picture its own PNG with a see-through background, at exactly the
pixel size listed (twice its size on screen); "stretches" means it can be 9-sliced, with everything
special inside the slice margin; icons read at 32 pixels on screen; button states named `_Pressed`
and `_Locked`; one sheet with every picture labelled, on a light checkerboard.

Triangle ranges that worked: a small prop 300 to 800; a building 1,000 to 3,000; a big hero model or a
creature rig up to about 20,000 in all. A model placed hundreds of times stays near the bottom.

## Seeing your own work
- Take screenshots with `kit/shots-wait.mjs` (headless Chrome, each shot after the page sets
  `window.ready`): plain `--screenshot` gave random blank shots. Save each try under a new name: reading
  the same file name can show the old picture. The built-in browser can't open claude.ai links or `file://`.
- Frame the view so the models fill about four fifths of its width. A view from an angle fits by the
  models' own points as seen on screen, never a sphere round the box (`kit/fit-corners.mjs`), and leaves
  room for the page's own labels and buttons. Why: angled views came out cut off and off to one side.
- If the game has upgrade levels of one model (a building that grows): a straight grid in
  `kit/view-multi-page.mjs` (each level placed with `pos`, `?view=straight`), one row per model, levels
  left to right, nothing cut off or overlapping. A row read from the front starts at +X, steps to -X.
- A straight-down view sets `camera.up` to +Z (front at the bottom) and fits each model's own box.
  Why: the top view came out upside down and mirrored.
- Draw `Glow_` parts unlit so they show their exact colour (lit, orange washes to yellow), and
  see-through glass after them without depth writes. Check a glow's colour in the screenshot.
- In three r128 with `outputEncoding = sRGBEncoding`, a coloured ground or unlit part needs
  `new THREE.Color(hex).convertSRGBToLinear()` (`scene.background` doesn't). Why: a near-black board
  showed as mid grey.
- Lit parts: hemisphere plus sun near 1 on top faces (0.62 + 0.48, as in `kit/view-sheet-page.mjs`),
  less an environment map's share. Too much light turns warm colours lemon and loses white on white.
- Set `castShadow = false` on `Outline_` shells: three.js casts a shadow from back faces, so an
  inside-out shell shades the whole piece inside it.

## Checks before showing
- Look at it the way a player will: screenshots at player eye height (about 4.5 up, 10 to 40 away,
  walking round it and backing off), plus a close-up of every join, every place two colours meet, and
  every edge where it meets the ground. Anything floating, gappy, see-through, lumpy or unfinished goes
  back, however good the hero shot is.
- Every part (each colour slot) shows from the view's front three-quarter: small pieces go at the front
  or side, never behind the main one, and the message to the main chat says which piece is which colour.
- Run `kit/check-planes.mjs`: no two faces from different parts (outlines included) in one plane and
  overlapping; keep 0.03 or more apart. Why: faces in one plane flicker as the camera moves.
  A toon shell on a chamfered box is a hair off flat and can't pass: make such tiles plain boxes.
- Run `kit/check-open-edges.mjs` (nothing to see through) and `kit/check-ground.mjs` (really resting on
  the floor) on every file.
- If the prompt bans colours, run `kit/check-banned-colours.mjs` on every file (3D: every PNG
  `kit/glb-colours-png.mjs` writes), reused pieces included. Never trust the eye.
- Anything that moves gets its swing checked over the whole turn, 0.3 clear: `check-sweep` (Sweep_,
  Aim_, Bob_), `check-spin-room` (Spin_), `check-hinge` (doors, lids), `check-hinge-swing` (double
  doors), `check-joint-swing` (legs, wings, tails). Part names they know: `REFERENCE.md`.
- Meet every prompt rule that can be met (thinnest part, names, piece count) before showing: the
  not-done list is only for what truly can't be done.

## Building it
- Take style C helpers from `kit/style-c-glb.mjs`, never from a saved model's script: those only show
  fit and shapes, and can hold old bugs.
- If the game tints parts in code: plain flat colour per part, smooth shading, no grain or speckle in the
  texture, no lighting trick that turns a tinted part muddy; check the view tinted as the game will.
- A detail on a surface (spots, studs, patches, cracks, moss) is sunk about half its thickness into it,
  so it reads as part of it, never hovering. Sinking also stops flicker, so it wins over any "sit 0.03
  off" rule. It still stands out enough to catch the light (about 8% of the width proud): one built
  fully under the surface can't be seen, so check every detail in a close-up.
- Raised lines on a flat cut-out (ridges, stitches) are their own cords sunk half into it, never a pinch
  of an ExtrudeGeometry's face: its flat caps have no points inside the outline, so pinching does nothing.
- Every part stands at 0 or above: the game stands a model on its lowest point. Anything resting on the
  floor needs a flat footprint in its final shape, cut after every random lean and lump, wide enough to
  look planted; an arch needs both feet cut flat at 0.
- A creature that lies on the floor never shows a flat bottom: it rests like a sleeping cat, belly, paws
  and tail sagging onto the floor, the flat contact hidden underneath. Sink each resting tube or ball to
  about 60% of its radius (centre 0.6 r up). Every flattened piece clamps at the one floor height (0);
  only a piece in another colour sits 0.04 up, so the two can't flicker. Give the view a dark contact
  shadow under every touch point.
- A ground piece (a patch of grass, a mat, a pad) has no edge a player can see under: it sits flush on
  the floor or sunk into it, and ends under the thing it belongs to.
- Outline shells are about 2% of each piece (never under 0.5 on big models), stop 0.5 over the floor,
  and are clamped where they'd poke through a wall; `piece()` does it by default (`floorY: -1000` for a
  piece built round its own pivot). On a creature that rests on the floor, run them down to 0.12: an
  ink line ending high reads as a gap. A piece split into convex bits gets one closed outline
  (`hull-pieces.mjs` `ringShape` / `fanShape`); one surface split edge to edge stops each shell short of
  the join (`kit/style-c-joined-boxes.mjs`).
- A moving piece carries its `Outline_` (and glow) as children at its pivot, posed in the view.
- A door or lid moves the way the real one does (a front door opens into the home): move what's in its
  swing, never turn the swing round.
- Replacing a stand-in or a model the game already places: search its name in the game's code first,
  keep the spots the code depends on, show its real surroundings in the view, and list any spot that moves.
- A creature's parts look grown together: legs, wings and tail sink at least a third of their thickness
  into the body, a tail tapers to its tip in one shape (no ball stuck on the end), and every join is
  checked from the side, below and three-quarter.
- A toon (cel-shaded) model's light and shadow edge follows its triangles, so big curved pieces get
  enough segments for a clean curve (a sphere 20 studs across: about 28 x 18 or more). Meet a triangle
  cap by cutting small or hidden bits, never the big curves. The view lets a model cast shadows on the
  ground but not on itself.
- Where two colours meet, one surface sinks smoothly into the other with enough segments that the line
  is a clean curve; spend triangles there first. A cap over another piece's end is flattened at the same
  floor height or lower, has as many segments as what it caps, and the capped piece stops inside it.
- Every tube or rope end is closed: a round cap, or a disc wider than the tube turned along its end.
- Eyelids hide inside the head when open and cover the whole eye when shut, with no back of a lid
  showing from any angle. Build a mirrored pair in the head's own frame, not each eye's, and check both.
- An open mouth reads from the view's own angle: a dark inside, the jaw clearly dropped, teeth sunk into
  the gum and pointing in. Teeth placed just outside the jaw read as rivets.
- A real object reads as itself at a glance: list the 4 or 5 shapes that say what it is and build each
  one clearly, then check its outline from the side. One box with a few bars stuck on reads as nothing.
- No big plain face: any face over about 50 x 50 studs gets a few chunky shapes, tops and insides seen
  from above included. A big wall a player looks at has depth and layers, not small things stuck on.
- If the game has upgrade levels of one model (a building that grows): they read as one thing growing.
  Each is the last made bigger and stronger, plus a new big shape seen from far off; the top level is
  grandest. Never swap the main piece for smaller ones.
