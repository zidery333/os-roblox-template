---
name: make-model
description: Make the models and UI pictures for a Roblox game made with /build-game, when the person starts a model chat. Each model is sorted by role, made by a route with proof, in its own subchat, shown on a page they can spin, and kept only after their yes. It learns from every change they ask for. Use when they say make the models, make the next models, make a model, do the model prompts, fix a model, finish my Meshy model, run the model bench, or start the model chat.
argument-hint: "[game] [which models, e.g. M04 or \"the next four\"]"
effort: high
---
# Make models
Make the models and UI pictures one game needs, when the person starts a model chat. The AI makes every one. Good
looks like this: every model has a role, a triangle budget and a route, and the person said yes to it on a page they
can spin. Claude writes the code or script that builds each model, here in the folder, so the person never pastes
a prompt or a file.

**Effort:** the main model chat runs on high effort. Each model subchat runs on medium: start it with `effort: "medium"`.

**Mac and Windows:** the kit is plain Node, the same on both (on Windows, inside WSL). How to get Node and Chrome on
each is in `REFERENCE.md`, under "Mac and Windows". Two routes need something of the person's own: Blender (route 3,
and finishing a Meshy model) is their own install, and Meshy (`MESHY.md`) is their own account and costs credits.

**Needs the Claude desktop app:** starting one subchat per model needs Claude Code in the Claude desktop app, which
can start sessions. In a plain terminal or another AI, make one model at a time yourself, following the brief in
`REFERENCE.md`.

## Before you start
- Read the About me note in `Notes/`, if there is one (no step here may break a line in it), and "What we tried" at the
  end of `ROUTES.md` beside this file: the researched method and its sources. "Settled rules" below are newer and win.
- Read `REFERENCE.md` (the subchat brief and the view), `kit/README.md` and `BENCH.md` (how this skill gets better
  by itself, and its two tables). Read `MESHY.md` only to finish a model the person already made in Meshy.
- A number in `ROUTES.md` with a date over a month old: open its source again first (the file lists them). Roblox's
  rules change often.
- Read the game's `CLAUDE.md` (it loads `.claude/roblox/LESSONS.md`: read "Models"), then `LESSONS.md` here: "Writing
  the prompt" first, then only the lines naming your route (search `Blender`, `Meshy`, or a style name). A game's own
  look: its `Model Lessons.md`.
- **The gate.** Make nothing until Gate 1, the grey box, has the person's date in `Work/<Game>/Plan.md`. No date: ask them.

## Settled rules
- **Who makes hero models?** The AI makes every model, and `BENCH.md` is how it gets better at it by itself. Paid
  outside tools are used only when the AI can't do the job.
- **May a model chat use Studio's generate tools?** Yes, when the person has Studio open with its MCP server
  connected. It may open Studio for two things only: those tools, and a look at a model in the game's own light.
  What it makes there goes at once into one folder, `ModelDrafts`. It takes that folder and any material it made out
  before the chat ends, and never saves the place. The game's place or an empty one, with a build chat maybe in it?
  Not settled: ask the person.

## Roles and routes
Every model gets a role (kit, filler, hero, character), a triangle budget and a route (1 code with the kit,
2 Studio's generate tools, 3 Blender, 4 a paid tool). The table, the budgets and what each route needs are in
`REFERENCE.md`, "Roles and routes". Read it before step 1.

## Steps
1. **List and sort.** From `Work/<Game>/Plan.md` and its stand-ins, give each model a prompt and a row in the order
   table of `Work/<Game>/Model Prompts.md`: role, size in studs, triangle budget, moving parts, icon or not, Make after,
   Status. Pictures: pixel size, no role. No colour or style in a prompt before step 3. *Done when:* no row has a gap.
2. **Give each row a route.** If `BENCH.md` says a run is due, ask the person, and on their yes run it first. Route 1:
   only its own kinds. Any other row: its bench winner, or the words "stand-in stays". *Done when:* no row lacks one.
3. **The look model first (20 to 30 minutes of the person's time a game).** Ask which model sets the look. The
   research says the icon character. Offer a small one too: a big creature can leave dozens of models waiting.
   Write `Look model: <id>` at the top of `Model Prompts.md`. Its subchat shows three or four real looks on one page
   (`kit/view-look-sheet-page.mjs`). The person picks. *Done when:* it is saved, with colours and the style line in
   `Model Lessons.md`.
4. **One subchat per model** (`start_session`), up to four drafting at once. The main chat builds nothing. Ask the
   person once first: each subchat runs the kit's `npm install`, a download. Start one only on OK from
   `node .claude/skills/make-model/kit/check-order.mjs "Work/<Game>/Model Prompts.md" <id>`
   Send the brief in `REFERENCE.md`, filled in, with `use_worktree: false`, initiation `"user_asked"`,
   `effort: "medium"` and your session id. Ask it to name the lesson lines it used and any check that failed first
   time. *Done when:* each has sent its draft.
   - **Wait for what it builds on.** A row that says "make after M03" doesn't start until M03 has a yes and is saved:
     `check-order.mjs` says WAIT. Start the next free one instead.
   - **Fix or remake?** If the model already has a .glb, say so in the brief: the subchat edits that file.
   - **Keep four going.** The moment a model has a yes, start the next free one. A model only saving its files
     doesn't count towards the four.
5. **Check each draft before the person sees it.** Open every screenshot at full size: size, triangles, colours, part
   names, front at -Z, bottom at 0, readable at phone size. Passing the scripts is not "looks good": list everything
   that looks wrong to a player. Wrong: send it back, with a lesson. *Done when:* it matches its row.
6. **Show the person (their step; minutes never measured here).** One draft, one picture, one question. Open the view
   (Artifact `open`), send the screenshot itself, and give the link in every reply where they must look. One sheet for
   kit and filler (research: under 15 minutes) is untried here and bends that rule: ask first. *Done when:* they answered.
7. **A change: how it learns.** Their words go to that subchat, quoted: one more try. Could it have been right first
   time? Then it writes one lesson line now, before rebuilding, with the try it came from: any game in `LESSONS.md`,
   this game in `Model Lessons.md`. A taste line only when they name what they liked. *Done when:* they see the new draft.
8. **A yes: save.** Anything textured gets the text check first: stop on letters, logos or known characters in
   any texture or render. The subchat saves the model beside its build script in `Work/<Game>/Models/<kind>/` or
   `Work/<Game>/UI Kit/<Set>/` (no script: a note with its source, picture, prompt and command), marked "saved, not in
   the game". *Done when:* you saw the files, wrote its `BENCH.md` row and ran
   `./os checkpoint "<Game>: model <id> <name>"` (only this chat checkpoints, so checkpoints never clash).
9. **Close.** Run the count in `BENCH.md` ("The learning rules"). Add its dated line to "What we tried". Tidy the
   lessons (`REFERENCE.md`, "Tidy the lessons"). Archive each saved subchat, then delete them all in one
   `delete_session` call. *Done when:* the line is in and none is left.

## How it learns
Every-game lessons in `LESSONS.md` here, this game's in `Work/<Game>/Model Lessons.md`, and code that worked in
`kit/`. Every subchat reads all three before it builds. How a line is written, and where taste goes: `REFERENCE.md`,
"How it learns".

## Never
- Make a model before Gate 1 has passed: the game runs on stand-ins until then. Why: a game can collect dozens of
  models and still not be fun to play.
- Make models on your own or outside a model chat the person started, or pick a colour, style or look for them.
- Start a new model in Meshy unless the person asks. Use route 2, 3 or 4 on a game model before a bench win.
- Reshape, smooth or repaint a model the person made or supplied: animating it means animating it, nothing else.
- Save a draft into `Models/` or `UI Kit/` before their yes, or save over a Meshy file they paid for.
- Change game code or `Plan.md`, or the game's world, or save its place: the game's main chat puts models in.
- Let any chat upload without the text check and the person's yes for that batch (1 to 2 minutes of their time). Why:
  uploads are permanent, and AI-made text in a picture can get an account banned. `generate_avatar` uploads by
  itself: never.
- Publish, pay, ask for an API key in chat, or download without asking, the kit's `npm install` included.
- Run a paid step (Meshy or any other) without saying the cost first and getting a yes.

## Proof so far
- `ROUTES.md` is research, not yet run here on a real game: no role list, budget, gate or proving day.
- `BENCH.md` is this skill's own design, not run yet: no route has won a subject.
- No route has been run yet in this folder: none has a yes yet.

## Hand over
- From /build-game: Gate 1 passed by the person, and a game that runs on stand-ins.
- To /build-game: each model's file, size and part names, marked "saved, not in the game". That chat puts it in, swaps
  the stand-in and asks the person before each upload batch. To /game-ui and /market-game: the saved pictures.

## Done when
Every model asked for has a role, a budget, a route, the person's yes on its view and a row in `BENCH.md`. Each is
saved with its build script, marked "saved, not in the game" and checkpointed. No subchat is left. The count is
written and the lessons are tidy.
