---
name: build-game
description: Plan and build a Roblox game made with /new-game. Plan first with the person, then one subchat per step, each passing the five checks, a playtest and screenshots, then a bug review that also tidies the lessons. Use when they say build the game, work on the game, next step, add a feature, plan the game, or fix a bug in a game.
argument-hint: "<game name> [feature or bug]"
---

# Build a game

The main chat plans with the person, starts the subchats, checks their work and reports.
It writes no game code itself. The game lives in `Work/<Game>/`.

**Read first, every time:** `.claude/roblox/LESSONS.md` (rules for every Roblox game), then
`Work/<Game>/CLAUDE.md` (this game's rules and its own "Lessons"), then `Work/<Game>/Plan.md`.
A lesson there beats what you think you know about Roblox.

Works the same on Mac and Windows. On Windows, `./os`, `./check.sh` and `./start-rojo.sh` run
in the Linux (WSL) terminal, and Roblox Studio runs on Windows as normal.

## 1. Plan first

- No steps in `Plan.md` yet, or a new feature? Plan before any building.
- Interview the person with `AskUserQuestion`, up to 4 questions at a time, with buttons. Cover:
  the core loop, what makes it fun, sizes (player, buildings, map, in studs), what's in the first
  playable version, phone or computer or both, the look (ask for a picture), and what must never
  happen. Usually 20 to 40 questions in all.
- Stop when you could say the game back in three sentences and they agree.
- **Lock these before step 1:** the game in three sentences, the core loop, the sizes and the
  look. Changing them later means redoing steps, so ask now.
- Write `Plan.md` in the shape in `REFERENCE.md`: three sentences, sizes, core loop, "Rules for
  every step", then the steps. One feature per step, smallest playable thing first. Each step has
  **What**, **Done when**, **Test** and **Status**.
- Show them the steps and get a yes before building anything. Each settled choice goes in with
  `./os decide "<Game>" "<choice>"`.

## 2. Before the first step

- Rojo is running for this game: run `./start-rojo.sh` in the game's folder. It keeps Rojo up
  after the chat closes. Never run `rojo serve` in a chat's own shell. No script yet? Copy
  `.claude/roblox/Template/start-rojo.sh` in as it is.
- Studio has the game's place open, and its Rojo panel says connected.
- Before any Studio call, `list_roblox_studios` and pick the game's place by name.
- Tell them once: **the place isn't saved by the AI.** World and UI changes made in Studio are
  lost until they press File > Save. That's why world and UI are built by scripts (see below).

## 3. Build, one subchat per step

Follow the `subchat-chain` skill. Copy the build-step brief from `REFERENCE.md` and fill it in.
Every step:
- changes code only in `Code/` and `Tests/` files (Rojo syncs them into Studio). Never edit a
  script in Studio or with `multi_edit`;
- builds world and UI with a re-runnable `Tests/Build<Thing>.studio.luau` script that deletes
  only what it made, then runs it through the Studio link;
- writes the test first for anything in `Code/Shared/Logic/`;
- uses a plain stand-in block of the right size and name in `ReplicatedStorage.Models` for any
  model not made yet, so the real one swaps in with no code change; a saved model from
  `/make-model` is found by its part names (`Body_`/`Trim_`/`Accent_`, `Outline_`, `Glow_`,
  `Spin_`/`Sweep_`/`Bob_`/`Aim_`, `Foot_1`/`Foot_2`), as "Models" in `LESSONS.md` says;
- brings in a saved model's .glb when the step needs it: the person imports it with Studio's 3D
  Importer, or the AI uploads it with `open_cloud_invoke` as a Model asset and adds it with `insert_asset`.
  It goes in `ReplicatedStorage.Models` in place of the stand-in with the same name, part names kept;
  then rerun the step's checks and mark it "in the game" in `Model Prompts.md`;
- adds its own buttons to the Studio-only test panel when something is slow to reach by playing;
- ends with `./check.sh` saying all five pass, then a playtest with a clean output log, then
  screenshots at phone size (667 x 375) and computer size (1920 x 1080);
- adds a lesson line for each mistake it hit (see "Lessons" below);
- marks its step `Status: done` in `Plan.md`, then runs `./os checkpoint "<Game>: step <N>"`.

All steps of one game share one folder, so they run one at a time, with `use_worktree: false`.

**Check each step yourself before the next one:** run `./check.sh` in `Work/<Game>/`, read the
changed files (`git show --stat`), and look at the screenshots. A report is not proof.
Send the screenshots to the person, phone shot first.

## 4. The person tests it for real

After each step that changed something playable, ask them to play it in Studio (and on a phone
when it matters). Some things only they can test: two players, sound, anything in Game Settings,
and saving (DataStores) until they turn on API access. Ask for those by name.
What they say is a bug report: send it to the same subchat as a narrow fix, their words quoted.

## 5. Bug review and lessons tidy

When the planned steps are done, start one more subchat with the bug-review brief in
`REFERENCE.md`. It reads everything the steps changed and writes `Review <date>.md` in the game's
folder: each finding marked **Proven**, **Sure** or **Likely**, worst first, with file and line.
It fixes only small, clear bugs. It also tidies the lessons: rules in the game's `CLAUDE.md`
that fit any Roblox game move up to `.claude/roblox/LESSONS.md`, repeats are merged, and a rule a
check could catch becomes a check.

## 6. Tell them

One short summary: what was built, what was checked, what is still broken or untested, and the
next step in `Plan.md`. Add a dated line to the game's `## Log`.

## Lessons

Every mistake that could happen again (a failed check, a broken playtest, a wrong guess about
Roblox, the person correcting you) becomes one line, in the same turn as the fix:

`- <the rule>. Why: <what goes wrong>.`

Only this game? Its `CLAUDE.md`, under "Lessons (this game only)". Any Roblox game? `.claude/roblox/LESSONS.md`.
How a model is built or looks? `/make-model`'s own `LESSONS.md`.
Search first: if a rule already says it, make that one sharper instead of adding a second.

## Small fixes

A bug that touches one or two files can be fixed in this chat instead of a subchat. Same rules:
files only, a test that fails first, `./check.sh`, a playtest, a lesson line.

## Rules

- Plan before code. No step starts without their yes.
- One feature per step, one step per subchat.
- Done means `./check.sh` passes **and** a playtest is clean. Never one without the other.
- The server decides money, damage, items and saves. The client only asks.
- The person publishes. No subchat publishes the game or changes live settings unless they said so.

## Done when

Every planned step is marked done in `Plan.md` and was checked by you, the person saw each
step's screenshots, the bug review ran, the lessons were tidied, and they got one honest summary.
