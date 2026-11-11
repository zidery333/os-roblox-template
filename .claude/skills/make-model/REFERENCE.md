# /make-model: reference

## The subchat brief

Copy it, fill in the `<…>`, and send it as the subchat's whole brief. Start it on medium effort. For a
fix or a remake, fill in `<existing .glb>`; for a new model, delete that line. Paths are from the top
of this folder (where `./os` is).

```
Job: Make <id> <model name> for <Game> from its prompt, show it to the person, and only after their
yes save it, marked "saved, not in the game" (the game's main chat puts it in). Learn from every
change they ask for.

Background: <Game> is a Roblox game in Work/<Game>/. Read, before anything else:
- Work/<Game>/CLAUDE.md (it loads .claude/roblox/LESSONS.md: read "Models" closely),
- .claude/skills/make-model/LESSONS.md (model lessons for every game),
- Work/<Game>/Model Lessons.md if it exists (this game's model lessons and exact colours),
- .claude/skills/make-model/kit/README.md and the kit files it points to (code that worked
  before: start from it rather than writing it again),
- the prompt "<id>. <model name>" in Work/<Game>/Model Prompts.md, and its "Rules for every model".
Write code that builds the model exactly as the prompt, its rules and the lessons say. Files the
prompt says are "attached" (a style test .glb, an older model, a picture) are in the game's Models/
or UI Kit/ folders: find the saved ones and use their exact colours.
This model already exists: <existing .glb>. Edit that file rather than building from nothing: keep
every part and name the change doesn't touch, so what was already approved and what the game's
code finds by name stay the same.

Files and area: draft everything in your own scratchpad. Touch nothing in the game folder, Studio
or Model Prompts.md until the person says yes. Never change game scripts or Plan.md. The lesson
files and the kit are the only things you may write to before a yes. Never run ./os checkpoint:
the main chat does.

How to build it:
1. Copy the kit folder into your scratchpad and run `npm install` there (never inside this folder).
   On Windows this all runs in WSL, with Node from nvm; keep the copy in the Linux home, not /mnt/c.
   A new model: one Node script that builds it with three.js meshes, named as the prompt says
   (Outline_ shells and Glow_ parts as their own parts, where the game uses them), exported with
   exportGLB from the kit's style-c-glb.mjs as a binary .glb. Editing an existing .glb: use
   `@gltf-transform/core` (in the kit's package.json) in one script that reads it, makes the change
   (move, recolour, add, remove, rename parts) and writes it out again.
2. Check it before showing it: `node inspect-glb.mjs <file>` (each part's name, box and triangles)
   against the prompt's size and triangle range. Then run check-planes.mjs, check-open-edges.mjs and
   check-ground.mjs on every file, and the swing checks on anything that moves (the part names they
   look for are in "Part names the checks know" in .claude/skills/make-model/REFERENCE.md). Every
   check exits 1 on a problem or when it found nothing to check: read what it printed. The first model of a
   game sets the look for all the others: if this is it, make 4 clearly different versions on one
   look sheet (view-look-sheet-page.mjs) for the person to pick from.
3. A picture prompt (a UI kit, icons, a logo) gets PNGs instead, drawn in code at the size it asks.
   Run check-pictures.mjs and check-cut-edges.mjs on them (`--allow` names the pieces that stretch, so
   they may touch the edge). Skip any game mock-ups or phone screens.
4. If the prompt bans colours, check every file with check-banned-colours.mjs, not by eye. 3D: write
   its textures out with glb-colours-png.mjs and check every PNG it writes (a model with two palettes
   has two).
5. Make the view, one HTML page with everything inside it, published with the Artifact tool (load
   the artifact-design skill first): view-3d-page.mjs (one model), view-multi-page.mjs (several),
   view-sheet-page.mjs (a style sheet), or a picture sheet: every picture labelled with its name and
   size on a light checkerboard, nothing else.
6. Make screenshots as PNGs in your scratchpad with shots-wait.mjs: the front three-quarter view,
   views from player eye height (about 4.5 up, from several sides), and close-ups of every join,
   every place two colours meet, and where it meets the ground. Look at each one yourself. Anything
   floating, gappy, see-through, lumpy or muddy gets fixed before you message the main chat.

Then, the moment the draft is ready, SendMessage to the main model chat (`<main chat id>`) with:
the view's link, the screenshot's full path, the parts or picture list with sizes (and triangle
count for 3D), which part is which colour, and one short list of anything you couldn't do exactly
as asked. That message is what wakes the main chat, so never skip it. End your turn and wait for
the person's answer, which the main chat passes on.

When they ask for changes (or the main chat sends a draft back):
1. Ask: could I have got this right first time? If yes, write one lesson line now, before
   rebuilding, as "How it learns" in .claude/skills/make-model/SKILL.md says. Search first; sharpen
   a line rather than add a twin. Re-read the file right before editing.
2. Change the script, rebuild, republish the same view, and message the main chat again the same
   way, plus the lesson line you wrote (or "no lesson: <why it couldn't have been known>").

Only when they say yes:
1. Copy the .glb (or PNGs) into the folder Model Prompts.md names (Work/<Game>/Models/<kind>/<Name>.glb,
   or Work/<Game>/UI Kit/<Set>/), and the build script beside it with the same name and `.mjs` (a
   picture set's script goes in its folder as `<Set>.mjs`). Give it a top comment saying how to run
   it (which npm packages, which kit files it needs), so it can be changed after you're gone.
2. Never open Studio, upload or import: the game's main chat puts models in when a step needs them.
3. Mark it in Model Prompts.md's table: the file, and "saved, not in the game".
4. Learn from it: a taste line only if they named what they liked (in the game's Model Lessons.md).
   Code that would help the next model goes into the kit as its own file with a one-line top comment.

Rules: you are a subchat, do only this model, start no more subchats. Never publish the game.
End by sending the main model chat (`<main chat id>`) a message with: the files saved (build script
included), the screenshot path, the lessons and kit files you wrote, anything unsure. The main chat
checks it, checkpoints, and archives this chat.
```

## Mac and Windows

The kit is plain Node, so it runs the same on both.
- **Mac:** Node from nodejs.org or Homebrew. Google Chrome in `/Applications` is found by itself.
- **Windows:** everything runs inside WSL (the Linux terminal `./os` runs in), never in Windows
  itself. Put Node in WSL with nvm, not with `apt` (too old) and not the Windows Node:
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash`, open a new
  terminal, then `nvm install --lts`. For screenshots, put a Linux Chrome in WSL from the kit copy:
  `npx @puppeteer/browsers install chrome-headless-shell@stable` (the kit finds it there; or set
  `CHROME_PATH`). If Chrome won't start, it is missing Linux libraries: `ldd <chrome> | grep not`
  lists them, and `sudo apt install` puts them in. Keep the scratch copy in the Linux home (`~/`),
  not under `/mnt/c`: it is much faster there.
- **Which Chrome:** any recent one works (tried with Chrome 157). The kit's puppeteer-core 23.11.1 was
  made for Chrome 131: if a newer one ever won't start, install
  `chrome-headless-shell@131.0.6778.204` the same way. Node must be 18 or newer.
- Studio is never touched by this skill, so nothing here needs the Windows side.

## Part names the checks know

The kit's checks find parts and groups by name, so a model that uses these names gets checked. A name
may start with its colour slot (`Trim_Mount`, `Body_Axle`). A moving group is a group holding its
parts, never a part itself: a part named `Spin_Fan` is not checked as a spinner.

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
| `Outline_…` | an outline shell: left out of the swing checks, check-ground and check-open-edges | several |
| `Glow_…` | a glowing part (the game makes it Neon): a different look in check-planes, never "lifted" in check-ground | check-planes, check-ground |

Hinged lids and doors have no left-out name: they stay 0.3 clear of everything, as the rules say.

## Tidy the lessons

- Merge repeats, sharpen vague lines, drop lines the kit now does by itself.
- A game lesson that turned up in a second game moves up to this skill's `LESSONS.md` (without its
  taste, names or story).
- A rule a script can catch (a size, a triangle count, a banned colour) goes into a kit check instead.
- Keep this skill's `LESSONS.md` under 170 lines and each game's under 40.
- Tidy only when no subchat is writing to them, so no line is lost.
