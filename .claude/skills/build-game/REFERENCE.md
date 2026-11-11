# Detail for /build-game

Four parts: the shape of `Plan.md`, what Studio and its link can and can't do, the briefs to
copy, and how a bug review is written.

## The shape of Plan.md

The kit's `Plan.md` already has these headings. Fill them in this order.

```
# <Game>: the plan

Steps are built one at a time, in this order. A step is done when its "done when" is true,
./check.sh passes, the playtest is clean, and the person has seen it.

## The game in three sentences
<Who you are and what you do. What makes it tense or fun. Why you come back.>

## Sizes
<In studs: the player, the main things, the map. Fixed before building.>

## Core loop
- <What the player does again and again, one line each, ending with why they come back.>

## Rules for every step
- Look: <the style they picked, with a picture or a link>.
- Stand-ins: until a real model exists, a plain block of the right size and name in
  ReplicatedStorage.Models, so the real one swaps in with no code change.
- Test panel: Studio-only, folded by default. Each step adds the buttons it needs.
- The server decides every <money, item, result>. The client only asks.
- Phone, computer or both: <which>.
- Never happens: <the things they said must never happen>.

## Steps

### 1. <name>
- What: <one sentence>
- Done when: <what the person will see or be able to do>
- Test: <which Tests/ file and what it checks; what the playtest checks; what the person checks>
- Status: todo
```

When a step is done, its Status says so and what was made: `done. <files>, screenshots <paths>`.
Anything still owed (a two-player check, a sound check) goes on that line as **Still owed**.
A bug found later gets a new step (`6b. <name>`), never a rewrite of an old one.

## Studio facts every step needs

- **Studio isn't Team Create here.** Changes made through the Studio link (parts, lighting,
  ScreenGuis) live only in the open place until the person presses File > Save. Close Studio
  without saving and they're gone. Code is safe: it lives in files and Rojo syncs it back.
- **So world and UI are built by scripts.** Each is a `Tests/Build<Thing>.studio.luau` that can
  run again and again: it deletes only what it made (by name or a tag it sets), then makes it
  fresh. Run it through the Studio link in Edit mode, not in a playtest. Write the place in the
  script's first comment. After it runs, remind the person to save.
- **Stand-ins** sit in `ReplicatedStorage.Models` with a `StandIn` attribute. A build script
  never overwrites a model without that attribute: that one is real.
- **The test panel** is a ScreenGui only Studio shows. The server refuses every test-panel
  request unless `RunService:IsStudio()` is true, so it can never work in the live game. Buttons
  sit in folding groups, at most 10 per group, so the open panel fits Studio's play window.
- **Screenshots** go in `Work/<Game>/Screenshots/`, named `step-<N>-phone.png` and
  `step-<N>-pc.png`. Phone is 667 x 375, computer is 1920 x 1080. Use Studio's device view for
  the size. If the size can't be set, crop to it and say so in the report.
- **What the Studio link can't do:**
  - Two players. A solo playtest never shows a two-player bug. Test the rule as a pure function
    with a Lune test, add a test dummy if the game needs one, and list the real two-player test as
    still owed.
  - Sound. It can't hear. List each new sound as still owed.
  - Game Settings. The person changes those by hand.
  - DataStores. They fail in Studio until the game is published and the person turns on
    "Enable Studio Access to API Services" in Game Settings > Security. Until then, saves should
    fall back to memory and say so in the output log.
- **`require` inside the Studio link** hands back its own copy of a module, not the game's, and
  keeps it between calls. Never use it to read or change the game while it runs.

## A build step

```
Job: Build step <N> of <Game>: <the step's "What" from Plan.md>.

Background: <Game> is a Roblox game in Work/<Game>/. First read .claude/roblox/LESSONS.md,
then Work/<Game>/CLAUDE.md and Plan.md. This step's "done when" is: <copy it>.
Its test is: <copy it>. <Anything the person said about this step, quoted.>

Files and area: only Work/<Game>/ and its Studio place "<place name>". Code in Code/ and
Tests/. World and UI through Tests/Build<Thing>.studio.luau scripts run with the Studio link.
Don't touch other games or other steps.

Rules:
1. You are a subchat. Do only this step. Start no more subchats.
2. Code changes only in files. Rojo syncs them into Studio. Never change a script in Studio
   or with multi_edit. Before any Studio call, list_roblox_studios and pick "<place name>".
3. World and UI are built by a re-runnable Tests/Build<Thing>.studio.luau that deletes only
   what it made. Run it in Edit mode. The place isn't saved until the person presses File > Save.
4. Models not made yet are stand-in blocks in ReplicatedStorage.Models with a StandIn attribute.
5. Write the test first for anything in Code/Shared/Logic/, then the code.
6. If the step is slow to reach by playing, add buttons to the Studio-only test panel (the
   server refuses them unless RunService:IsStudio(); at most 10 per folding group).
7. Run ./check.sh until it says all five pass. Then playtest through the Studio link
   (start_stop_play, get_console_output, input tools if needed): no new errors or warnings.
   Stop the playtest.
8. Every mistake you hit that could happen again becomes one line,
   "- <the rule>. Why: <what goes wrong>.", in the game's CLAUDE.md under "Lessons (this game
   only)", or in
   .claude/roblox/LESSONS.md if it fits any Roblox game. Search for an existing rule first.
9. If anything visible changed, save screenshots to Work/<Game>/Screenshots/ as
   step-<N>-phone.png (667 x 375) and step-<N>-pc.png (1920 x 1080), and list their full
   paths. Nothing visible? Say "no screenshot: nothing visible changed".
10. Things the Studio link can't test (two players, sound, Game Settings, saving without API
    access) go on the step's Status line as "Still owed".
11. Don't publish the game.

Done means: ./check.sh passes, the playtest log is clean, the step is "Status: done" in
Plan.md, lesson lines are added for mistakes, and ./os checkpoint "<Game>: step <N> <name>"
has run.
End with a short message: what you did, files changed, lessons added, the screenshot paths,
what is still owed, and anything you're unsure of.
```

## A bug fix

```
Job: Fix this bug in <Game>: "<the person's words, quoted>".

Background: read .claude/roblox/LESSONS.md, then Work/<Game>/CLAUDE.md. <What you already
know: when it happens, the log line, your guess at the cause.>

Rules: the same as a build step (2 to 11). Find the cause before changing anything. Add a test
that fails because of the bug, then fix it. Add one lesson line saying how to avoid it next time.

Done means: the test passes, ./check.sh passes, a playtest shows the bug gone, the lesson line
is in, and ./os checkpoint "<Game>: fix <short name>" has run.
```

## Bug review

```
Job: Review everything built in <Game> since <commit or date>, find the bugs, and tidy the lessons.

Background: read .claude/roblox/LESSONS.md, Work/<Game>/CLAUDE.md and Plan.md first. Then
git log and git diff over that range.

Look for, in this order:
1. Client trust: anything a LocalScript decides that the server should (money, damage, items).
   Remotes the server doesn't check (type, range, cooldown, who owns it).
2. Saving: DataStore calls without pcall, saves that can lose data on leave or shutdown, one bad
   piece of a save breaking the whole load.
3. Two players: anything read from a player's place in a list, anything that breaks when one
   leaves, joins late or dies.
4. Leaks: connections never disconnected, things never destroyed, loops that never stop.
5. Old or made-up calls, remotes missing from Code/Shared/Net.luau.
6. Sizes: anything that no longer fits after a size changed (camera, hit boxes, speeds).
7. Anything in Plan.md marked done that doesn't work in a playtest.

Write Work/<Game>/Review <date>.md in the shape below. Fix only what is clearly a bug and
small, and mark it Fixed. List the rest.

Then tidy the lessons:
- Rules in the game's CLAUDE.md that fit any Roblox game move to .claude/roblox/LESSONS.md.
- Merge rules that say the same thing. Keep the shared file to 80 rules or fewer.
- Lessons about how a model is built or looks go to /make-model's own LESSONS.md.
- A rule a machine could catch becomes a check (a selene setting or a test), and its line goes.

Done means: the review file is written, ./check.sh passes, the lessons are tidied, and
./os checkpoint "<Game>: bug review" has run.
End with: bugs fixed, bugs left (worst first, with file and line), and what changed in the lessons.
```

## The shape of a review file

```
# <Game>: review, <date>

**Short answer:** <one or two sentences: how bad it is, and the worst thing found>.

How to read it:
- Proven = the reviewer ran it and saw it. Sure = the code leaves no other path.
  Likely = read from the code only, never seen in Studio.
- Check a finding in the code before fixing it.
- Paths are under Work/<Game>/. Each part is worst first.

## Fix these first
1. **<What goes wrong, in the player's words.>**
   - Where: <file:line>.
   - Why: <what the code does>.
   - Fix: <the smallest change>. <Proven / Sure / Likely.>

## Fix later
<Same shape.>

## Not bugs
<Things that looked wrong and aren't, one line each, so the next review doesn't chase them.>
```

The bugs that need fixing become new steps in `Plan.md`, worst first.
