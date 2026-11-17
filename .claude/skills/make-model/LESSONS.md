# Model lessons for every game

Read before making a model or writing a prompt for one. Each line is a rule that came from a change someone asked for
or a mistake that could happen again. How lines get here: "How it learns" in `SKILL.md`; how they get cut: `BENCH.md`.
One game's style or taste: that game's `Model Lessons.md`. Kit files: `kit/README.md`.
`- <the rule>. Why: <what goes wrong>. (<game>, <id> try <n>)`

## Order of work
- Run every Blender build in the foreground of the turn that needs it (Bash timeout up to 600000 ms; a longer build
  split into steps that each save the .blend), and never end a turn while a build is still running. Before saying a
  build is running, check it is (`pgrep -fl blender`). Why: a build left running in the background stops partway with no error. (A
  short build finishing in seconds is fine.)
- Anything shown in more than one pose (asleep and awake, closed and open) is ONE jointed model posed twice from the
  first draft, never separate builds, even for a look sheet. Why: a separate second build drifts from the first.
- Be quick: a model reaches the person well inside an hour. Run the kit's checks first (seconds, and they catch what
  screenshots miss), then a short set of screenshots (front three-quarter, side, behind and the worst close-ups), not
  dozens. Why: a slow model feels wasteful.
- The first model of a game (or of a new look) sets the look: make only that one, get a yes, and only then start the
  rest, each built to match it. Never draft several at once before the look is a yes. Why: drafts made in an unapproved look get thrown away.
  Every later model chat is handed that approved model's .glb and builds to match it (outline thickness, shading
  bands, smoothness), never the style line's words alone; a prompt names it on a "Built on" line. Why: "the style
  line" alone can mean anything.
  That first model starts as 4 clearly different versions (different outline, head, finish), the prompt's sizes and
  part names kept, shown side by side to pick one; only then refine the pick. Never refine one guess round after
  round. Why: many rounds on one design rarely reach a look the person likes.

## Writing the prompt
- Read these lessons before adding any prompt to a game's `Model Prompts.md`, from any chat. Every `Model Prompts.md`
  names its `Look model: <id>`, and `kit/check-order.mjs` must say OK before any model starts (the skill and the
  subchat brief both run it). Why: a model added from the main chat can start before the look model has a yes.
- Lay a prompt out as short labelled lines on top (Make, What it does, Size, Looks like, Colours, Special parts,
  Files, Triangles, Show), a `---`, then the game's "Rules for every model" block (below). Why: long prompts can't be
  skimmed, a view that fetches its file comes up empty, and "output only the .glb" gives the person nothing to look at.
- "Low-poly" isn't enough: name the exact style picked, ban parts thinner than a tenth of the thing (unless the person
  asks for finer), and set a triangle range (300 to 800 for small things). Why: every model still came out detailed.
- Say what can't be guessed: every surface needed (a ceiling, a see-through window and what's outside it), only the
  bare surface under things that have their own models, and left or right with the X sign (facing -Z, -X is on your
  right). Why: "the right-hand end" with the wrong sign flipped a model.

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
For pictures, the block says instead: no words, letters or numbers in any picture (the game writes them in its own
font, so leave room); each picture its own PNG with a see-through background, at exactly the pixel size listed (twice
its size on screen); "stretches" means it can be 9-sliced, with everything special inside the slice margin; icons read
at 32 pixels on screen; button states named `_Pressed` and `_Locked`; one sheet with every picture labelled, on a
light checkerboard.

Triangle ranges that worked: a small prop 300 to 800; a building 1,000 to 3,000; a big hero model or a creature rig up
to about 20,000 in all. A model placed hundreds of times stays near the bottom.

## Seeing your own work
- Take screenshots with `kit/shots-wait.mjs` (headless Chrome, each shot after the page sets `window.ready`): plain
  `--screenshot` gave random blank shots. Save each try under a new name: reading the same file name can show the old
  picture. The built-in browser can't open claude.ai links or `file://`.
- Frame the view so the models fill about four fifths of its width. A view from an angle fits by the models' own
  points as seen on screen (move the target to centre them, then set the distance), never a sphere round the box
  (`kit/fit-corners.mjs`), and leaves room for the page's own labels and buttons. Why: angled views came out cut off
  and off to one side.
- If the game has upgrade levels of one model (a building that grows): a straight grid in `kit/view-multi-page.mjs`
  (each level placed with `pos`, `?view=straight`), one row per model, levels left to right, nothing cut off or
  overlapping. A row read from the front starts at +X, steps to -X.
- A straight-down view sets `camera.up` to +Z (front at the bottom) and fits each model's own box. Why: the top view
  came out upside down and mirrored.
- Draw `Glow_` parts unlit so they show their exact colour (lit, orange washes to yellow), and see-through glass after
  them without depth writes. Check a glow's colour in the screenshot.
- In three r128 with `outputEncoding = sRGBEncoding`, a coloured ground or unlit part needs
  `new THREE.Color(hex).convertSRGBToLinear()` (`scene.background` doesn't). Why: a near-black board showed as mid grey.
- Lit parts: hemisphere plus sun near 1 on top faces (0.62 + 0.48, as in `kit/view-sheet-page.mjs`), less an
  environment map's share. Too much light turns warm colours lemon and loses white on white.
- Set `castShadow = false` on `Outline_` shells: three.js casts a shadow from back faces, so an inside-out shell
  shades the whole piece inside it.
- A rigged (skinned) .glb in three r128: every material you swap onto a SkinnedMesh, outline and glow ones too, needs
  `skinning: true`, or that part stays in the rest pose while the bones move. Set `frustumCulled = false` on every
  skinned mesh too: three.js culls it by where it sits in the rest pose, so small parts (an eye, teeth) vanish in a
  close-up of another pose. Why: a skinned part can show in the wrong pose or vanish in the page while Blender shows it fine.

## Checks before showing
- Passing scripted checks is not "looks good". Before showing the person any draft, the main chat opens EVERY
  screenshot in the sheet at full size (each pose from the side, front, behind and player height, every close-up,
  every animation frame) and lists everything that looks wrong to a player: squashed or sunk parts, a bare bone with
  no skin, lumps and creases, a head pointing the wrong way, tiny details. Anything on that list goes back first. Why:
  a model can pass every check and still look wrong.
- A failing check is a stop, never a "not done" note: no draft reaches the person while the ground check, the 1-stud
  clearance, the nothing-under-the-floor check or a close-up (a detail sunk out of sight, a pad left flat) fails. The
  subchat fixes it or tells the main chat why it can't; the main chat never forwards a draft listing a failed check.
  Why: a failed check shows up in front of the person.
- Look at it the way a player will: screenshots at player eye height (about 4.5 up, 10 to 40 away, walking round it
  and backing off), plus a close-up of every join, every place two colours meet, and every edge where it meets the
  ground. Anything floating, gappy, see-through, lumpy or unfinished goes back, however good the hero shot is.
- Every pose a model shows gets a straight side view in the screenshots, the main one above all (plus
  three-quarter rear and a low side view at player height), looked at hard before showing: joints, tails and necks
  fail from the side first. Why: a pose shown with no side view can look wrong.
- The main chat checks a fix close up, against what the person asked, before saying it works: each detail the person named, from close, not just "fine from afar". Why: a fix can look right from far and be wrong close up.
- When the look comes from a reference picture, render the model from the picture's own angle and put the two side by
  side before every showing, and fix the shapes until they read alike (proportions, limb length, body line). Why: a draft can pass every check and still read differently next to the reference.
- Every part (each colour slot) shows from the view's front three-quarter: small pieces go at the front or side, never
  behind the main one, and the message to the main chat says which piece is which colour.
- Run `kit/check-planes.mjs`: no two faces from different parts (outlines included) in one plane and overlapping; keep
  0.03 or more apart. Why: faces in one plane flicker as the camera moves.
  A toon shell on a chamfered box is a hair off flat and can't pass: make such tiles plain boxes.
- Run `kit/check-open-edges.mjs` (nothing to see through) and `kit/check-ground.mjs` (really resting on the floor) on
  every file.
- If the prompt bans colours, run `kit/check-banned-colours.mjs` on every file (3D: every PNG `kit/glb-colours-png.mjs`
  writes), reused pieces included. Never trust the eye.
- Anything that moves gets its swing checked over the whole turn, 0.3 clear: `check-sweep` (Sweep_, Aim_, Bob_),
  `check-spin-room` (Spin_), `check-hinge` (doors, lids), `check-hinge-swing` (double doors), `check-joint-swing`
  (legs, wings, tails). Part names they know: `REFERENCE.md`.
- Any separate things that sit near each other (a handle and the body it sits on, wings and body, props and the
  model) get a clearance check by script before showing: `kit/check-clear.mjs`, 1 stud apart unless they are meant to
  touch. Why: a part can run through another and nobody sees it from the front.
  Posed wings, and every step of the swing from folded to posed that an animation plays, stay 1 stud clear
  of the body, head and other wing (`kit/check-wing-clear.mjs`), not judged by eye from one angle. The folded pose too:
  every point of a folded wing lies on or outside the body, tail and legs. "Clear" is a floor, never a target:
  hugging at exactly the limit flattens the look.
- Meet every prompt rule that can be met (thinnest part, names, piece count) before showing: the not-done list is only
  for what truly can't be done.
- A new method (a rig, skinned mesh, rebuild) must keep every look the person already approved: build the rig with the
  approved pose as its rest shape, so the other pose is the one reached by bending, and before showing, compare it
  with the approved .glb from the same angles side by side (and by a distance script). Fixing one check must never
  quietly undo an approved look. A replaced part (a new wing or tail) is compared with the approved one from
  behind and from the side before showing, and must look at least as good, not just pass the distance checks. Why: a
  rebuild can lose an approved look.
- When a new model must share an approved model's parts (the same head on a second pose), build it at the approved
  file's own final scale and measure the two parts in the head's own frame, both ways, before showing. A builder can
  shrink its model at export, so the same numbers at another scale give a different size. Why: the same part comes out a different size if the two files were fitted at different scales.
- Animating a model the person made or supplied (a Meshy file) means animating it, never changing it: its own pose is
  the rest, untouched, and standing with every bone at zero matches their file within 0.01 studs everywhere, side by
  side in the same light and texture. Every other pose comes only from turning bones; knees and elbows bend the real
  way. Never sculpt a new rest shape, smooth, reshape or retexture it; a crease from bending is reported or fixed by
  weights, never by reshaping. Why: re-sculpting drifts away from the person's model.
  A crease from bending is fixed by weights (spread the turn over a wider band of skin round the joint). Before
  showing, a script measures every pair of neighbouring triangles at each joint (shoulders, neck, any hinge) in every
  frame of every action against the rest, and any sharp new fold or squashed triangle there goes back. A fold count
  going down is not "fixed": shoot every joint close up from above, behind and three-quarter in every pose it has, and
  have a script list spikes (a point pulled far from where its neighbours put it) in every frame; any spike, pinched
  hole or torn edge goes back, never into the not-done list as "small". Any piece added to a supplied model (an
  eyelid or a patch) is cut from its own skin with its own texture and sits flush, so it reads as the same model.
- A skin in several parts (a Meshy finish's parts) moves as one: every seam point carries the same weights in each
  part. Check seam gaps (0) and every joint from below and the side in every frame of every action, with the game's
  own code motion added on top. Why: a seam splits open when a part moves.
- A blend between two poses (an animation, a view's pose switch) turns each joint the short way and in the order a
  real one moves (an arm lifts and swings out, then the hand opens), never all at once. Pose each bone
  by the smallest turn from its rest (no free roll about its own length), check every joint turns under 180 degrees,
  and check the 25%, 50% and 75% frames for spins, loops and clipping. A change of pose is keyed in stages, never one blend
  from pose to pose, and checked at every 10%. Why: a joint can spin a full turn on the way.
- Two poses of one model share one build: the same widths and depths, only posed differently; compare both side by
  side at the same scale from the side and top.

## Building it
- Take style C helpers from `kit/style-c-glb.mjs`, never from a saved model's script: those only show fit and shapes,
  and can hold old bugs.
- If the game tints parts in code: plain flat colour per part, smooth shading, no grain or speckle in the texture, no
  lighting trick that turns a tinted part muddy; check the view tinted as the game will.
- A detail on a surface (spots, studs, patches, cracks, moss) is sunk about half its thickness into it, so it reads as
  part of it, never hovering. Sinking also stops flicker, so it wins over any "sit 0.03 off" rule. It still stands out
  enough to catch the light (about 8% of the width proud): one built fully under the surface can't be seen, so check
  every detail in a close-up.
- Raised lines on a flat cut-out (ridges, stitches) are their own cords sunk half into it, never a pinch of an
  ExtrudeGeometry's face: its flat caps have no points inside the outline, so pinching does nothing.
- Every part stands at 0 or above: the game stands a model on its lowest point. Anything resting on the floor needs a
  flat footprint in its final shape, cut after every random lean and lump, wide enough to look planted; an arch needs
  both feet cut flat at 0.
- A model that lies on the floor never shows a flat bottom: it rests like a sleeping cat, with the flat contact hidden
  underneath. Sink each resting tube or ball to about 60% of its radius. Every flattened piece clamps at the one floor
  height (0); a different small lift per piece leaves slits and fails the check; only a piece in another colour sits
  0.04 up, so the two can't flicker. Give the view a dark contact shadow under every touch point.
- A ground piece (a patch of grass, a mat, a pad) has no edge a player can see under: it sits flush on the floor or
  sunk into it, and ends under the thing it belongs to.
- Outline shells are about 2% of each piece (never under 0.5 on big models), stop 0.5 over the floor, and are clamped
  where they'd poke through a wall; `piece()` does it by default (`floorY: -1000` for a piece built round its own
  pivot). On a model that rests on the floor, run them down to 0.12: an ink line ending high reads as a gap. A
  piece split into convex bits gets one closed outline (`hull-pieces.mjs` `ringShape` / `fanShape`); one surface split
  edge to edge stops each shell short of the join (`kit/style-c-joined-boxes.mjs`).
  Where a piece sinks into another (a shoulder into a body, a wing bone resting on a flank), its outline shell pokes
  out through the other piece's surface as thin black slivers: pull every shell point that ends up inside another
  piece back under that surface before export, so ink only shows on the true outline. A thin sheet (a wing membrane,
  a fin, an ear flap) gets an outline only round its edge: a shell offset over the whole sheet pokes through the far
  face wherever the sheet bends or is thinner than the offset, and shows as black patches.
- A moving piece carries its `Outline_` (and glow) as children at its pivot, posed in the view.
- A door or lid moves the way the real one does (a front door opens into the home): move what's in its swing, never
  turn the swing round.
- Replacing a stand-in or a model the game already places: search its name in the game's code first, keep the spots
  the code depends on, show its real surroundings in the view, and list any spot that moves.
- A piece cut from a skinned mesh in Blender (`bm.from_mesh(skin)` for a belly strip, lips, a patch) keeps the skin's
  own weight table, keyed by the skin's group order: remove `bm.verts.layers.deform` before giving it its own weights,
  or bones get swapped. Cap every point at 4 bones in Blender before posing (the .glb
  keeps 4), so Blender's checks match the game. Clear a weight by collecting group indices first: removing groups
  while looping over a vertex's groups skips some.
- Retopologising a Meshy mesh in Blender: QuadriFlow leaves holes on voxel meshes; use a voxel remesh, keep the
  biggest island, project onto a fine voxel copy and relax. Close the wing and fin holes on the fine voxel copy
  (delete, fill, poke) before the coarse remesh, or the remesh makes a double skin. Workbench renders of a mesh still
  holding Meshy's material come out speckled with holes: clear the materials first.
- A wide thin sheet from an AI model (a wing, a cape) can't be folded tight by bones: skinning crumples or shreds it.
  Before promising a folded pose from an AI model, test the fold first, and if it shreds, say so at once: the honest
  options are a looser fold, a rebuild with fold-friendly topology, or a different source picture. Plan the folded
  look and the open size together, before building: skin that never stretches holds the same area folded and open.
  Never fold a joint nearly flat onto itself (170 degrees): the skin crushes into shards.
- A model that must rest in one pose and also stand exactly as a source model: skin blending can't undo itself, so
  plain bending drifts when it returns. Solve each rest point so bending back lands on the source, sharpen weights,
  and pick a rest pose whose joints bend least. Skin shared by two bones that turn opposite ways wrinkles in one pose
  or the other: plan bone placement round that region before building.
- A creature's parts look grown together: limbs and tail sink at least a third of their thickness into the
  body, a tail tapers to its tip in one shape (no ball stuck on the end), and every join is checked from the side,
  below and three-quarter.
- A toon (cel-shaded) model's light and shadow edge follows its triangles, so big curved pieces get enough segments
  for a clean curve (a sphere 20 studs across: about 28 x 18 or more). The view lets a model cast shadows on the
  ground but not on itself (`receiveShadow` off on every model mesh; a wanted shadow, like under a folded wing, is
  sculpted as a crease in the shape, never a dark painted band or a shadow map). The baked bands come from the vertex
  normals, so they stair-step wherever a visible piece is coarse or two pieces meet: give the pieces round a join (a
  flank under a wing, a chest plate on a chest) the most segments. Meet a triangle cap by cutting small or hidden bits
  (spikes, toes, claws, undersides, the outlines of details), never the big curves.
- Where two colours meet, one surface sinks smoothly into the other with enough segments that the line is a clean
  curve; spend triangles there first. A pale belly piece is narrower than the body at the sides and deeper only
  underneath, built on the body's own grid, so it shows in one clean curve below and never in patches through the
  flank. A cap over another piece's end is flattened at the same floor height or lower, has as many segments as what it
  caps, and the capped piece stops inside it.
- Every tube or rope end is closed: a round cap, or a disc wider than the tube turned along its end.
- A cover over a detail (a lid over an eye) hides inside the model when open and covers the whole detail when shut,
  with no back showing from any angle. Shut, it stands about 0.1 off the face it covers, with no rim or step at its
  edge and the skin's own colour: a thick dome on top reads as a cap stuck on. Build a mirrored pair in the model's
  own frame, not each side's, and check both.
- A cut-open detail (a mouth) reads from the view's own angle, not only in close-ups: a dark inside deep enough to
  see, parts clearly apart, small parts sunk into what holds them. Parts placed just outside their base read as
  rivets. Build it from anatomy: one shared outline for the pair, the same small shape repeated and offset so they
  mesh, and a dark inside going back into the body.
- A real object reads as itself at a glance: list the 4 or 5 shapes that say what it is and build each one clearly,
  then check its outline from the side. One box with a few bars stuck on reads as nothing.
- No big plain face: any face over about 50 x 50 studs gets a few chunky shapes, tops and insides seen from above
  included. A big wall a player looks at has depth and layers, not small things stuck on.
- If the game has upgrade levels of one model (a building that grows): they read as one thing growing. Each is the
  last made bigger and stronger, plus a new big shape seen from far off; the top level is grandest. Never swap the main
  piece for smaller ones.
- Finishing a model the person made in Meshy: read `MESHY.md` beside this file, then run `kit/meshy/finish_meshy.sh`.
  Getting it into Studio (front at -Z, Glow_ to Neon) is in `.claude/roblox/LESSONS.md`.
