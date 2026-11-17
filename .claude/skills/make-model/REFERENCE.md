# /make-model: reference

## The subchat brief

Copy it, fill in the `<…>`, and send it as the subchat's whole brief. Start it on medium effort. For a fix or a
remake, fill in `<existing .glb>`; for a new model, delete that line. Paths are from the top of this folder (where
`./os` is).

```
Job: Make <id> <model name> for <Game> from its prompt, show it to the person, and only after their yes save
it, marked "saved, not in the game" (the game's main chat puts it in). Learn from every change they ask for.

First, before anything else: run
`node .claude/skills/make-model/kit/check-order.mjs "Work/<Game>/Model Prompts.md" <id>`.
If it says WAIT, build nothing: tell the person in one line what it waits for, and stop. If it says to attach the
look model's .glb, find that saved file in the game's Models/ folder and build to match its outlines, shading and
smoothness.

Background: <Game> is a Roblox game in Work/<Game>/. Read, before anything else:
- Work/<Game>/CLAUDE.md (it loads .claude/roblox/LESSONS.md: read "Models" closely),
- .claude/skills/make-model/LESSONS.md (model lessons for every game),
- Work/<Game>/Model Lessons.md if it exists (this game's model lessons, with its exact colours),
- .claude/skills/make-model/kit/README.md and the kit files it points to (code that worked before: start from it
  rather than writing it again),
- the prompt "<id>. <model name>" in Model Prompts.md, and its "Rules for every model".
This model's role is <kit, filler, hero or character>, its route is <1 code, 2 Studio's generate tools, 3 Blender by
script, 4 a paid outside tool, or a Meshy finish> and its budget is <N> triangles. Build it by that route, exactly as
the prompt, its rules and the lessons say. Files the prompt says are "attached" (a style test .glb, an older model, a
picture, another set's pieces) are in the game's Models/ or UI Kit/ folders: find and read the saved ones, and use
their exact colours.
This model already exists: <existing .glb>. Edit that file rather than building from nothing: keep every part and
name the change doesn't touch, so what the person already approved and what the game's code finds by name stay the
same.

Files and area: draft everything in your own scratchpad. Touch nothing in the game folder, Studio (route 2 aside:
follow "Settled rules" in SKILL.md, and keep its drafts in one Studio folder, ModelDrafts) or Model Prompts.md until
the person says yes. Never change game scripts or Plan.md. The lesson files and the kit are the only things you may
write to before their yes. Never run ./os checkpoint: the main chat does.

How to build it:
1. The route: follow "Roles and routes" in SKILL.md. Route 1 is code: a Node script from the kit, for blocky props,
   kit pieces, icons and UI pictures. Route 2 is Roblox Studio's own generate tools: they give no .glb, so for the
   steps below that need one, do what "Studio drafts" in BENCH.md says. Route 3 is Blender by script. Route 4 is a
   paid outside tool through its API. Use route 2, 3 or 4 only when the main chat names it for this model: a bench
   draft, or a subject that route won on the bench (BENCH.md). A model the person made in Meshy is a finish, not a
   route: never rebuild it; read MESHY.md and run kit/meshy/finish_meshy.sh. Any paid step: say the cost first and
   wait for a yes.
   Route 1, a new model: copy the kit folder into your scratchpad and run `npm install` there (never inside this
   folder). On Windows this all runs in WSL, with Node from nvm; keep the copy in the Linux home, not /mnt/c. One Node
   script builds it with three.js meshes, named as the prompt says (Outline_ shells and Glow_ parts as their own
   parts, where the game uses them), exported with exportGLB from the kit's style-c-glb.mjs as a binary .glb. Editing
   an existing .glb: use `@gltf-transform/core` (in the kit's package.json) in one script that reads it, makes the
   change (move, recolour, add, remove, rename parts) and writes it out again.
   Route 3, in Blender (the person's own install; `blender -b --factory-startup -P build.py -- <out.glb>`): write one
   Python script that makes the whole model from an empty scene, so it can be run again and changed later. Run it in
   the foreground (Bash timeout up to 600000 ms, long builds split into steps that save the .blend), never in the
   background, and never end your turn while a build runs: a build left behind stopped partway once, with no error.
   Use Blender's own tools: shapes from primitives, curves and extrusions, then Subdivision Surface and smooth shading
   for clean curves, Boolean or Remesh to fuse pieces into one skin, Shrinkwrap or Displace for sculpted forms. Name
   every object as the prompt says (Outline_ shells as their own objects: a copy pushed out along its normals with its
   faces flipped and a black material; Glow_ parts as their own). Front faces -Z in the .glb: Blender is Z-up and its
   glTF export turns +Y up, so build facing Blender's +Y (it exports as -Z) and check the exported file, not the
   scene. Apply every modifier except Armature before export (`export_apply=True`), one plain material colour per
   object, no textures (for a model built here; a model made in Meshy keeps its own textures: see SKILL.md).
   - A creature, or anything shown in more than one pose: one Armature with real bones (named as the prompt's
     joints), every mesh (outline shells too) parented to it with weights, so each pose is the same body bent. Build
     it in the approved pose as its rest shape; export the rest file, plus each other pose as its own posed .glb (or
     as glTF animations the view can switch between).
   - Editing an existing .glb: import it into Blender (`bpy.ops.import_scene.gltf`), change it there and export again,
     keeping every name the change doesn't touch.
2. Check it before showing it: `node inspect-glb.mjs <file>` (each part's name, box and triangles) against the
   prompt's size and triangle range. Then run check-planes.mjs, check-open-edges.mjs and check-ground.mjs on every
   file, check-clear.mjs on separate things that sit near each other, and the swing checks on anything that moves
   (the part names they look for are in "Part names the checks know" below). Every check exits 1 on a problem or when
   it found nothing to check: read what it printed. A failing check is a stop: fix it, never list it as "not done".
   The first model of a game sets the look for all the others: if this is it, take the most care, because nothing
   else starts until the person says yes, and make 4 clearly different versions on one look sheet
   (view-look-sheet-page.mjs) for them to pick from.
3. A picture prompt (a UI kit, icons, a logo, store images) gets PNGs instead, drawn in code at the size it asks. Run
   check-pictures.mjs and check-cut-edges.mjs on them (`--allow` names the pieces that stretch, so they may touch the
   edge). Skip any game mock-ups or phone screens the prompt asks for: the game chat places pieces from the prompt's
   own words.
4. If the prompt bans colours, check every file with check-banned-colours.mjs, not by eye: pass exactly the colours
   those lines name (`--ban red`, `--ban red,blue`). 3D: write its textures out with glb-colours-png.mjs and check
   every PNG it writes (a model with two palettes has two).
5. Make the view, one HTML page with everything inside it, published with the Artifact tool (if the Artifact tool is there): view-3d-page.mjs (one model), view-multi-page.mjs (several), view-sheet-page.mjs (a style sheet), or
   a picture sheet: every picture labelled with its name and size on a light checkerboard, nothing else.
   - 3D: three.js from cdnjs (an exact version), the .glb inside the page as base64, white background, soft even
     light, a soft shadow, OrbitControls to spin and zoom, framed to fill the view, a plain player-sized block beside
     it if the prompt asks for one.
6. Make screenshots as PNGs in your scratchpad with shots-wait.mjs: the front three-quarter view, a straight side
   view of every pose, views from player eye height (about 4.5 up, from several sides), and close-ups of every join,
   every place two colours meet, and where it meets the ground. Look at each one yourself. Anything floating, gappy,
   see-through, lumpy or muddy gets fixed before you message the main chat (LESSONS.md, "Checks before showing").

Then, the moment the draft is ready, SendMessage to the main model chat (`<main chat id>`) with: the view's link, the
screenshot's full path, the parts or picture list with sizes (and triangle count for 3D), which part is which colour,
the lesson lines you used, and one short list of anything you couldn't do exactly as asked. That message is what wakes
the main chat, so never skip it. End your turn and wait for the person's answer, which the main chat passes on.

When they ask for changes (or the main chat sends a draft back):
1. Ask: could I have got this right first time? If yes, write one lesson line now, before rebuilding, as "How it
   learns" in .claude/skills/make-model/SKILL.md says: any game goes in the skill's LESSONS.md, only this game goes
   in Work/<Game>/Model Lessons.md. Search first; sharpen a line rather than add a twin. Re-read the file right
   before editing: other subchats write to it too.
2. Change the script, rebuild, republish the same view, and message the main chat again the same way, plus the lesson
   line you wrote (or "no lesson: <why it couldn't have been known>").

Only when the person says yes:
1. Copy the .glb (or PNGs) into the folder Model Prompts.md and the shared lessons name
   (Work/<Game>/Models/<kind>/<Name>.glb, or Work/<Game>/UI Kit/<Set>/), and the build script beside it with the same
   name and `.mjs` (Node) or `.py` (Blender); a picture set's script goes in its folder as `<Set>.mjs`. Give it a top
   comment saying how to run it (the blender line or which npm packages, which kit files it needs), so it can be
   changed after you're gone.
2. Never upload or import, and open Studio only on route 2: the game's main chat puts models in when a step needs them.
3. Mark it in Model Prompts.md's table: the file, and "saved, not in the game".
4. Learn from it: a taste line only if the person named what they liked (in the game's Model Lessons.md). Code that
   would help the next model goes into the kit as its own file with a one-line top comment saying what it does.

Rules: you are a subchat, do only this model, start no more subchats. Never publish the game.
End by sending the main model chat (`<main chat id>`) a message with: the files saved (build script included), the
screenshot path, the lessons and kit files you wrote, anything unsure. The main chat checks it, checkpoints, and
archives this chat.
```

## The view

What the person judges a model by: a private Artifact page with everything inside it (no fetching).
- A 3D model gets a 3D viewer: white background, soft even light, soft shadow, spin and zoom, filling the view, a
  player-sized block (5 tall) beside it when the prompt says.
- Pictures (UI kits, icons, logos) get one sheet: every picture on it, each labelled with its name and size, on a light
  checkerboard so see-through edges show. No game mock-ups or phone screens, even when the prompt asks for them: the
  game chat places pieces from the prompt's own words.

## Mac and Windows

The kit is plain Node, so it runs the same on both.
- **Mac:** Node from nodejs.org or Homebrew. Google Chrome in `/Applications` is found by itself.
- **Windows:** everything runs inside WSL (the Linux terminal `./os` runs in), never in Windows itself. Put Node in
  WSL with nvm, not with `apt` (too old) and not the Windows Node:
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash`, open a new terminal, then
  `nvm install --lts`. For screenshots, put a Linux Chrome in WSL from the kit copy:
  `npx @puppeteer/browsers install chrome-headless-shell@stable` (the kit finds it there; or set `CHROME_PATH`). If
  Chrome won't start, it is missing Linux libraries: `ldd <chrome> | grep not` lists them, and `sudo apt install`
  puts them in. Keep the scratch copy in the Linux home (`~/`), not under `/mnt/c`: it is much faster there.
- **Which Chrome:** any recent one works. The kit's puppeteer-core 23.11.1 was made for Chrome 131: if a newer one
  ever won't start, install `chrome-headless-shell@131.0.6778.204` the same way. Node must be 18 or newer.
- **Blender** (route 3 and the Meshy finish) is the person's own install: from blender.org on a Mac or Windows (on
  Windows, use the Linux build in WSL; it must be Blender 4.1 or newer, not the old `apt` one, or set `BLENDER=<path>`). The kit's scripts
  find `blender` on the PATH, or the Mac app.
- **Studio** is touched only by route 2 (its generate tools). Roblox Studio runs on the Windows side or the Mac, and
  its MCP server must be connected to Claude Code for those tools.

## Part names the checks know

The kit's checks find parts and groups by name, so a model that uses these names gets checked. A name may start with
its colour slot (`Trim_Mount`, `Body_Axle`). A moving group is a group holding its parts, never a part itself: a part
named `Spin_Fan` is not checked as a spinner.

| Name | What it is | Used by |
| --- | --- | --- |
| `Spin_…` | a group that spins on and on, round its own up | check-spin-room |
| `Sweep_…` | a group that swings back and forth, a half turn round its own up | check-sweep |
| `Aim_…` | a group that turns to face a target, a full circle round its own up | check-sweep |
| `Bob_…` | a group that moves up and down (`--bob` studs each way, 0.5 unless the prompt says) | check-sweep |
| any name you pass | a hinged lid or door: a node whose pivot sits on its hinge | check-hinge |
| `Gate1`, `Gate2`, or names you pass | the two halves of a double door | check-hinge-swing |
| `Mount`, `Axle` | the still part a moving group sits on or turns round: left out, as it touches on purpose | check-spin-room, check-sweep |
| `Collar` | the ring an `Aim_` head turns on: left out, its gap printed on its own | check-sweep |
| `Turntable` | a piece inside a moving group that turns in place on its `Mount`: left out | check-sweep |
| `Leg_Front1`, `Leg_Front2`, `Leg_Back1`, `Leg_Back2` | a creature's legs, also tried in walking poses | check-joint-swing |
| `Wing…` | a creature's wing: kept 1 stud clear of everything past the shoulder, and how far it folds back is printed | check-wing-clear |
| `Outline_…` | an outline shell: left out of the swing checks, check-ground and check-open-edges | several |
| `Glow_…` | a glowing part (the game makes it Neon): a different look in check-planes, never "lifted" in check-ground | check-planes, check-ground |
| `Belly_Teeth`, `MouthInside`, `Pupils` | pieces that live inside a closed head: never named as hovering in check-ground (`--skip` leaves out others) | check-ground |

Hinged lids and doors have no left-out name: they stay 0.3 clear of everything, as the rules say. `check-clear.mjs`
takes any part-name prefixes you pass, in pairs: `"Handle|Body"`.

## Tidy the lessons

- Merge repeats, sharpen vague lines, drop lines the kit now does by itself.
- A game lesson that turned up in a second game moves up to this skill's `LESSONS.md` (without its taste, names or
  story).
- A rule a script can catch (a size, a triangle count, a banned colour) goes into a kit check instead.
- `LESSONS.md` may not grow without proof: `BENCH.md`, "The learning rules". Keep each game's `Model Lessons.md`
  under 40 lines.
- Tidy only when no subchat is writing to them, so no line is lost.

## Roles and routes
| Role | What it is | Triangles (Roblox's hard limit: 20,000 a mesh) | Route today |
| --- | --- | --- | --- |
| kit | reused pieces: walls, floors, stalls | under 500 | 1 |
| filler | background props | under 2,000 | 1 if blocky. Curved: the bench winner |
| hero | collected, bought or on the icon: 5 to 15 a game | under 10,000 | bench winner, after Gate 2 (real players) |
| character | players, enemies, creatures | none set: ask | creature: the bench winner. Humanoid: R15 rig, no model |

Bench winner: the route the person picked for that kind of subject in `BENCH.md`. None yet for creatures, curved props
or heroes, so the named stand-in stays. Heroes wait for Gate 2 unless the person says otherwise. Never leave the
triangle cut to Roblox's importer. The budgets are the research's example. Textures: 256 at about 5 studs, 512 at 10,
1024 at 20.
1. **Code, with the Node kit** (`kit/`): blocky props, kit pieces, icons and UI pictures. No route has been run yet in this
   folder. Never creatures or curved things: code-built ones come out blocky.
2. **Roblox Studio's own generate tools.** Allowed, never tried here: bench first. Needs Studio and its MCP server on
   the person's computer. `generate_mesh`: words (no picture), a size box, `maxTriangles` (12 to 20,000), up to 8
   part names; gives a textured mesh. `generate_procedural_model`: words or a picture; gives plain parts to tune.
   `generate_texture` repaints a mesh in place, `segment_mesh` splits one into up to 5 parts, `generate_material`
   makes a material. None gives a .glb.
3. **Blender by script.** Bench only, until it wins a subject. Needs the person's own Blender install.
4. **A paid outside tool through its API** (`ROUTES.md` step 7). Never run here. It needs the person's own account and
   costs credits or money: say the cost and ask before any paid step. They make the key themselves, never in chat.
   Ask which tool.
- **Meshy** (`MESHY.md`) needs the person's own Meshy account, and every run costs credits. It is no longer a route
  for new models. It stays to finish one the person already made, or when they ask: `MESHY.md`, then
  `kit/meshy/finish_meshy.sh`. Never reshape it.

## How it learns
Three things grow as models are made. Every subchat reads all three before it builds.

| What | Where | What goes in it |
| --- | --- | --- |
| Every-game lessons | `LESSONS.md` beside this file | Making a model well in any game: building it, the view, sizes, checks |
| This game's lessons | `Work/<Game>/Model Lessons.md` | This game only: its style, its exact colours, what the person liked or changed |
| The kit | `kit/` beside this file (`kit/README.md` lists every file) | Code that worked and will again: builders, checks, view pages |

- **Taste:** only when they name what they liked ("the outlines are perfect"). A plain "yes" says nothing about what
  to repeat. Taste always goes in the game's `Model Lessons.md`, never in `LESSONS.md`.
- **Line:** `- <the rule>. Why: <what goes wrong>. (<game>, <id> try <n>)`. A few words each. Search first: a rule
  that already says it gets sharper, not a twin. Re-read the file just before editing: other subchats write to it.
- **The kit:** after a yes, code that would help the next model goes into `kit/` as its own file, with one line at the
  top saying what it does and how to run it, and a line in `kit/README.md`. Change an existing kit file only when
  it's broken.
- **How lines get cut:** `BENCH.md`, "The learning rules".
