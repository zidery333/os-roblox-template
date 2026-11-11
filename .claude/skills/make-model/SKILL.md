---
name: make-model
description: Make the models and UI pictures for a Roblox game made with /new-game, from the game's Model Prompts.md, one subchat per model, with a 3D view to spin or a picture sheet, and nothing kept until the person says yes. It learns from every change they ask for. Use when they say make the models, make the next models, make a model, do the model prompts, fix a model, or start the model chat.
argument-hint: "[game] [which models, e.g. M04 or \"the next four\"]"
effort: high
---

# Make models

Claude writes code that builds each model, here in the folder, so the person never pastes a
prompt or a file. No Blender: models are built in Node (three.js for new ones, a .glb editing
tool for changes). It works for any game in `Work/` made with /new-game.

**Effort:** the main model chat runs on high effort. Each model subchat runs on medium: start it
with `effort: "medium"`.

**Mac and Windows:** plain Node, the same on both (on Windows, inside WSL). How to get Node and
Chrome on each is in `REFERENCE.md`, under "Mac and Windows".

## Who does what

- **The main model chat** talks with the person, starts one subchat per model, passes on what they
  say, checks each model before showing it, keeps the checkpoints and keeps the lessons tidy. It
  builds nothing itself. It never touches game code or `Plan.md`: the /build-game chat builds the game.
- **Each subchat** makes one model (or one set of pictures, like a UI kit) from its prompt, shows it,
  changes it until the person says yes, then saves it, marked "saved, not in the game". It never
  opens Studio: the game's main chat puts it in. It writes a lesson each time it is asked for a change
  it could have got right first time.

This needs Claude Code in the Claude desktop app, which can start sessions. In a plain terminal or
another AI, make one model at a time yourself, following the brief in `REFERENCE.md`.

## How it learns

Three things grow as models are made. Every subchat reads all three before it builds.

| What | Where | What goes in it |
| --- | --- | --- |
| Every-game lessons | `LESSONS.md` beside this file | Making a model well in any game: building it in code, the view, sizes, checks |
| This game's lessons | `Work/<Game>/Model Lessons.md` | This game only: its style, its exact colours, what the person liked or changed |
| The kit | `kit/` beside this file (`kit/README.md` lists every file) | Code that worked and will again: builders, checks, view pages |

- **When:** they ask for a change, or the main chat sends a draft back. Before fixing it, ask: could
  I have got this right first time? If yes, write one line in the same turn.
- **Taste:** only when they name what they liked ("the outlines are perfect"). A plain "yes" says
  nothing about what to repeat. Taste always goes in the game's `Model Lessons.md`, never in
  `LESSONS.md`: one person's taste is not a rule for every game.
- **Line:** `- <the rule>. Why: <what goes wrong>.` A few words each. No names, no dates.
- **Which file:** true in any game? `LESSONS.md` here. Only this game? Its `Model Lessons.md` (make
  the file with its first line).
- **Search first.** A rule that already says it gets sharper, not a twin. Re-read the file just
  before editing: other subchats write to it too.
- **The kit:** after a yes, code that would help the next model (a helper, a better check, a view
  fix) goes into `kit/` as its own file, with one line at the top saying what it does and how to run
  it, and a line in `kit/README.md`. Change an existing kit file only when it's broken.

## Do this

1. Read the game's `CLAUDE.md` (it loads `.claude/roblox/LESSONS.md`: read "Models"), this skill's
   `LESSONS.md`, the game's `Model Lessons.md` if it has one, and the top of `Model Prompts.md`: its
   order list says which models come next. No `Model Prompts.md` yet: ask the person what to make
   first and what it should look like (ask for a picture), and write its prompt there in the layout
   `LESSONS.md` gives ("Writing the prompt"), with the "Rules for every model" block under it.
2. Start one subchat per model with the brief in `REFERENCE.md`, putting this chat's own session id
   in it (`get_session` with "self"). **The first model sets the look:** start only that one, show it
   as 4 clearly different versions to pick from, and start the others only after the person says yes
   to one. After that, up to four drafting at a time, in the order list's order. Use
   `use_worktree: false`, initiation `"user_asked"` and `effort: "medium"`.
   - **Wait for what it builds on.** A prompt that says "make it after M03" or uses another model's
     pieces doesn't start until that model is a yes and saved. Start the next free one instead.
   - **Fix or remake?** If the model already has a .glb, say so in the brief: the subchat edits that
     file instead of building from nothing.
3. **Never wait for the others.** Each subchat messages this chat the moment its draft is ready,
   which wakes it. Deal with that one draft straight away: read the screenshot it sends and check it
   against the prompt and the lessons (size, exact colours, the game's style, named parts). Anything
   plainly wrong goes back before the person sees it, and is a lesson.
4. Show the person that draft at once: open its view with the Artifact tool's `open` action, give
   the link and the subchat's short list of what it couldn't do, and ask yes or what to change, with
   buttons. Every time they have to look, the link goes in that reply again.
5. Their answer goes to that same subchat straight away, their words quoted. A change means a lesson
   if it was avoidable, then a new draft and a new look. A yes means it saves the files. It never imports.
6. **Keep four going.** The moment a model is a yes, start the next free one. A model only saving its
   files doesn't count towards the four.
7. **When a subchat says its model is saved:** check its files are in the game folder with its build
   script beside them, it's marked "saved, not in the game" in `Model Prompts.md`, and its lessons and
   kit files are written. Then run `./os checkpoint "<Game>: model <id> <name>"` (only this chat
   checkpoints, so checkpoints never clash), and archive that subchat with `archive_session`. If it
   says it's still working, archive it when its "finished a turn" note comes.
8. When the list asked for is done, or the person stops, delete every subchat this chat archived
   with one `delete_session` call (one card to click for all of them).
9. After every few yeses, and at the end: tidy the lessons (`REFERENCE.md`, "Tidy the lessons").

## Rules

- **Nothing is kept until the person says yes.** Drafts live in the subchat's own scratchpad. Only
  after a yes does anything go into `Models/`, `UI Kit/` or `Model Prompts.md`. Lessons and the kit are
  the exception: they are about how to work, and are written as they're learned.
- **Every saved model keeps its build script beside it** (`Models/Props/Crate.glb` and `Crate.mjs`; a
  picture set's script in its own `UI Kit/<Set>/` folder), so it can be changed after its subchat is gone.
- Follow the prompt and the lessons exactly: the game's style, `Outline_` and `Glow_` parts where the
  game uses them, the size, the triangle range, front at -Z, bottom at 0. Never pick a colour they
  haven't chosen: the prompt's colours, a colour a saved set already uses (exactly), or ask.
- **The view is what they judge by:** a private Artifact page with everything inside it (no fetching).
  - A 3D model gets a 3D viewer: white background, soft even light, soft shadow, spin and zoom,
    filling the view, a player-sized block (5 tall) beside it when the prompt says.
  - Pictures (UI kits, icons, logos) get one sheet: every picture labelled with its name and size, on
    a light checkerboard so see-through edges show. No game mock-ups or phone screens.
- **Models only, never Studio.** The model chat and its subchats never open Studio, upload, import or
  change the game. The game's main chat puts saved models in when a step needs them.
- Never change game scripts, `Plan.md` or the world. Never publish the game.

## Done when

Every model asked for was shown, changed until the person said yes, saved in the right folder with its
build script, marked "saved, not in the game" in `Model Prompts.md` and checkpointed, its subchat
deleted, and the lessons tidied.
