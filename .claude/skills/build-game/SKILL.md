---
name: build-game
description: Make a Roblox game from its idea card, as one job. Plan it on one page, set the game up, build it one step per subchat, stop at every gate until the person has played it, and carry on while they are away (Mac with the Claude desktop app). Use when the person says plan the game, game plan, make the plan, what do we build first, plan the next gate, new game, start a game, set up a game, build the game, work on the game, next feature, add a feature, build gate 1, fix a bug in a game, I'm leaving, I'm going to work, I'm going to sleep, or build it overnight.
argument-hint: "<game name> [plan | set up | feature or bug | away]"
---

# Build a game

The one game-making skill. It plans the game on one page, sets it up, builds it one step at a time, stops at
every gate until the person has played it, and carries on while they are away. Good looks like: the game never
grows past a gate the person has not passed, and you checked every step yourself. The main chat checks;
subchats build.

Works on a Mac, and on Windows through WSL (Linux inside Windows). On Windows, `./os`, `./check.sh` and
`./start-rojo.sh` run in the WSL terminal, and Roblox Studio runs on Windows as normal.

## Before you start

- Read the About me note in `Notes/`, if there is one. The person's rules there beat anything in this folder.
- Read "What we tried" at the end of `REFERENCE.md`, beside this file (the researched method and its sources).
- About to use a dated number more than a month old? Open its source again first. Roblox's rules change often.
- The game's own rules are `Work/<Game>/CLAUDE.md`. Read it first, every time.

## Where are we?

Check from the top. The first row that is true says where to go. The files named are beside this one.

| What is true | Go to |
| --- | --- |
| An older game made before gates existed: `Plan.md` has steps but no `## Gates` table | Ask the person first (below) |
| No `## Idea card` with its stop checks all yes | Stop. Run `/game-idea` |
| No one page, or no steps written for the next gate the person has not passed | `PLAN.md` |
| No game folder in `Work/` | `SETUP.md` (the plan part calls it after the person's yes on the page) |
| Steps are waiting for that gate, or the person has a bug to fix, and they are here | The build loop below |
| The person says they are leaving, going to work or to sleep, or sends "Go" | On a Mac with the Claude desktop app: `AWAY.md`. On Windows (WSL), or without the desktop app: away mode can't run, so say so, and build one step at a time in this chat while they are here |
| That gate's steps are all built | The person plays the gate (step 4 below) |

- The order: plan from the idea's note, the person's yes, set-up if there is no game folder, the page into
  `Plan.md`, Gate 1.
- An older game: ask the person before building more. They pick: re-gate it (`PLAN.md`), or carry on as it is
  (the card and one-page rows do not apply). Write their pick with `./os decide`, so they are asked once. A bug
  they report needs no such ask. Before its first step it gets the newer checks: "An older game" in `SETUP.md`.

## The build loop

It builds the plan's steps for the next gate the person has not passed, and invents no features. Follow the
`subchat-chain` skill. All steps of one game share one folder, so they run one at a time, with
`use_worktree: false`. Rojo must be running for this game first: "Starting Rojo" in `SETUP.md`.

1. **One subchat per step.** Copy the build-step brief from `BRIEFS.md` and fill it in. It holds the step's
   rules: code only in `Code/` files, the world and UI only through the MCP, the test first for
   `Code/Shared/Logic/`, a lesson line for every mistake. A step that adds or changes a screen follows `/game-ui`'s
   check loop and reports two scores apart. Done when: `./check.sh` says all five pass, the MCP playtest log is
   clean, anything visible that changed has a screenshot, the step is `Status: done`, and `./os checkpoint` ran.
2. **Check each step yourself before the next one.** Run `Work/<Game>/check.sh`. Read what changed in the
   game's folder since the last step (`git log --stat <last step's commit>..HEAD -- "Work/<Game>"`, plus
   `git status -- "Work/<Game>"`: another chat's checkpoint can sweep part of a step into its own commit).
   Look at the screenshot. A report is not proof. Done when: all three match what the subchat said.
3. **The person tests it for real.** After each step that changed something playable, ask them to play it in
   Studio (and on the phone when it matters). What they say is a bug report: send it to the same subchat as a
   narrow fix, with their words quoted. Done when: they have played it and their bug reports are fixed.
4. **The gate.** When the gate's steps are all built, the person plays the gate (from Gate 2 the players'
   numbers count too: `PLAN.md` step 5). Write their answers under the gate in the Gates table, and the date
   only if they passed it. Passed: the plan part writes the next gate's steps. Not passed: "Hand over".
   Done when: their answers are in the table.
5. **Bug review and lessons tidy.** Start one more subchat with the "Bug review" brief in `BRIEFS.md`. It looks
   for bugs across everything the steps changed and tidies the lessons. Done when: you checked it as in step 2.
6. **Tell the person.** One short summary: what was built, what was checked, what is still broken or untested,
   and the next step in `Plan.md`. Add a dated line to the game's `## Log`. Done when: both are written.

- **A gap or a new feature.** The plan doesn't say something the next step needs (a size in studs, a rule)?
  Ask the person with `AskUserQuestion`, only what this gate needs. A feature they ask for mid-build goes into
  `Plan.md` as a step first (What, Done when, Test, "The person checks"), with their yes. Settled:
  `./os decide "<Game>" "<choice>"`.
- **A bug.** One or two files: fix it in this chat by the same rules (files only, `./check.sh`, playtest, a
  lesson line if it was a mistake that could happen again). Bigger: a subchat with the bug-fix brief in `BRIEFS.md`.

## Never

- **Build past a gate the person has not passed, or count "checks pass" as "worth playing".** Only the person
  can say the second. Gate 1 always comes first: only the core loop in grey boxes, with no models, menus, saving
  or shop. `./check.sh` and a scripted playtest pass, with the first action inside 60 seconds. Then the person
  plays about 15 minutes and answers the plan's four questions. A pass needs a yes to "want another go" and at
  most one "no" in all. A fail means back to `/game-idea`, never more building. Why: games with no fun
  gate tend to grow big and turn out boring.
- **Call a step done or a gate passed on less than this.** A step is done when its "done when" is true,
  `./check.sh` passes and the playtest is clean. A gate is passed only when the person has played it and given
  the date, written in `Plan.md`'s Gates table.
- **Make or upload a model in a build step.** The step uses a named stand-in and adds a row to
  `Model Prompts.md`: name, size in studs, moving parts; no colour or style. Putting an approved model in is
  its own step: the text and logo check first (`/make-model`), then the person's yes for each upload batch, since
  uploads are permanent. Models get made only when the person starts a model chat themselves. Why: picking
  models is the person's slow part, and an upload can't be taken back.
- **Pick a colour, style or look from words.** The person picks from real versions (`/game-ui`, `/make-model`).
- **Start a step that is not in `Plan.md` without the person's yes.** Plan before code. One feature per step.
- **Edit a script in Studio or with `multi_edit`.** Code changes only in files.
- **Publish the game or change live settings.** The person publishes, pays and sets prices. No chat does.

## Proof so far

- The method is web research from 2026-11-15 (three researchers, two checkers, one writer); sources in
  `REFERENCE.md`. Confidence: high on the order (grey box first), medium on the one page, low on Gate 2's numbers.
- Big plan, big build, no launch is the usual way these games fail. This method is new: it needs real games to
  prove it.
- After every use, add a dated line to "What we tried" in `REFERENCE.md`: what was done, which game, what happened.

## Hand over

- Gate 1 passed: `/game-ui` can start, and `/make-model` (the named stand-ins) when the person starts a model chat.
- Gate 1 passed: `/market-game` can start. The page, thumbnails and publishing are part of Gate 2's work; then first players and the weekly read.
- Gate 1 failed: back to `/game-idea` with their answers. A later gate not passed: its rule in `PLAN.md` step 5.

## Done when

- You were sent to `PLAN.md`, `SETUP.md` or `AWAY.md`: that part's own "Done when" is true.
- The build loop: every step for this gate is `Status: done` and was checked by you. The person has played the
  gate and their answers are in the Gates table. The bug review ran, the lessons were tidied, and they got one
  honest summary.
- "What we tried" in `REFERENCE.md` has a new dated line.
