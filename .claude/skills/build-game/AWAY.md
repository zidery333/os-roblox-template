# The away part

**Needs the Claude desktop app on a Mac.** Away mode hands each step to a new session and wakes itself up
with scheduled tasks and keep-awake tools, and only the desktop app on a Mac has them. On Windows (in WSL),
or without the desktop app, this part can't run: say so, and build one step at a time in this chat instead,
while the person is here (the build loop in `SKILL.md`).

A part of `/build-game`. Read it when the person says they are leaving, going to work or to sleep, or wants the
build to run overnight. It gets the build ready to carry on with nothing blocking it, and learns from every run.

The person is about to leave home. Later they'll send "Go" to this same chat from their phone. Everything the
build needs must already be working by then, because nobody will be at the Mac to click anything.
Say what you're doing in one line. Keep their part as small as possible: the most they should have to do
is one click before they go.

An overnight build while they sleep is an away run too: the same steps, plus step 7 (the backup timer) and the
morning report (see "When the run ends").

## How it learns

`AWAY-LESSONS.md` beside this file grows with every unattended run. Read it first, every time.

- **When:** something stalled, broke, waited on a click, picked the wrong game, ran out of limit badly, or
  two chats clashed; the person corrects how an away run works; or a review of an away plan finds a gap.
  Ask: could the setup have stopped this? If yes, write one line in the same turn as the fix.
- **After every run:** when the person is back (or the morning report is written), read what went wrong in it
  and add a line for each thing the setup could have stopped. A run with nothing wrong adds nothing.
- **Line:** `- <the rule>. Why: <what went wrong or nearly did>. (<game>, <date>)`
- **Which file:** how to run unattended: `AWAY-LESSONS.md`. About the game's code or Studio: the Roblox
  lessons (`.claude/roblox/LESSONS.md` or the game's `CLAUDE.md`). About models: `/make-model`'s.
- **Search first.** A rule that already says it gets sharper, not a twin.
- **Tidy:** keep it under 40 lines. A lesson that holds every time becomes a step below, and its line goes.

## Get ready (before they leave)

1. **Which game.** The one they name. If they name none, the one game in `Work/` that is pushing; if more than
   one game is pushing, or its Next action is a decision only the person can make, ask which. Read its
   `CLAUDE.md`, the `## Next action` in its `README.md`, and `AWAY-LESSONS.md`.
2. **Rojo.** Start it as "Starting Rojo" in `SETUP.md` says, `servePlaceIds` included. If the script says
   another game has the port, ask the person before they leave.
3. **Studio.** `list_roblox_studios` must show this game's place. Other places may be open too (another chat
   can have its own Studio window): every Studio call in the run uses this game's id, never another's, and every
   brief says so. Then check the link works: write a one-line file into `Code/Shared/` (`return 1`), check it
   shows in Studio with `execute_luau`, then delete the file. If it doesn't show up, ask the person to press
   Connect in Studio's Rojo panel, then check again.
4. **This chat.** Remote Control must be on (`get_session` "self": `remoteControlState`). If it's
   off, turn it on with `set_remote_control`.
5. **No sleep, screen included.** Check `pmset -g`: the line `sleep 0`, and the power source is AC.
   The screen must stay on too: Studio stops drawing when it sleeps, and every screenshot times out.
   Always start a fresh `nohup caffeinate -d -u -t 43200 >/dev/null 2>&1 &` (12 hours), even if
   `pgrep -fl "caffeinate -d"` shows one: an old one may run out while they're away. Remind them: lid open,
   charger in, Studio and the Claude app left open. Locking the screen is fine.
6. **Write down what Go does.** Put it in the game's `## Next action`, in one sentence (for example: start
   Rojo, check step N's screenshots, then start step N+1 with build-game). Name only steps inside the next gate
   the person has not passed. An older game with no gates: ask them now, before they leave ("Stop at the gate"
   below). Run `./os checkpoint "<Game>: ready for Go"`.
7. **Overnight: the backup timer and the night file.** Write `Work/<Game>/Night Build.md` (the person's rules
   for the night, the step list, the heartbeat commands, and a "Resuming" section a fresh chat can follow; the
   gate rule below wins over any "build it all" line) and write the heartbeat as owner `main`. Then make the
   timer as **one-time tasks** (`create_scheduled_task` with `fireAt`), never a recurring cron: one a few
   minutes after the 5-hour limit resets, then one an hour and two hours later, each with
   `notifyOnCompletion: false` and the same short prompt ("read Night Build.md, Resuming, follow it"). A
   one-time task turns itself off after it fires, so nothing is left to clean up. Make them while the person is
   awake: if making one is refused, give them the exact thing to do.
   A chat that takes over a run part-way (a hand-over, a new main chat) runs `list_scheduled_tasks` first and
   makes the timers if none exist for this run; the hand-over line in the night file says whether they exist.

Then tell them, in the usual reply shape, what's ready and the one thing (if any) they still have to do.

## When they say "Go"

Do what the game's `## Next action` says, with the build loop in `SKILL.md`. Before starting a step, run
`./start-rojo.sh` and check the link again (step 3). The person is away, so nothing waits for them: every
brief says to finish the step and put any questions at the end. Send them screenshots with
`SendUserFile` as each step is checked. Changes to the build loop while they're away:
- **Give each step to a subagent** (the Agent tool, general-purpose: it can use the Studio tools),
  not a subchat. With nobody typing here, "subchat finished" notes stop waking this chat after a few
  in a row, and the build stalls. One subagent at a time: they share Studio and the folder.
- **Stop at the gate.** A game planned with the plan part (`PLAN.md`) has gates in its `Plan.md`. The run
  builds up to the next gate the person hasn't passed and no further, not even a later step's "file half": the
  rest of the time goes on tests, checks and fixes for what's built. The "file half" filler in
  `AWAY-LESSONS.md` is only for steps inside that gate. An older game with no gates: ask the person before they
  leave. Why: games with no fun gate tend to grow big and turn out boring.
- **Keep going, inside that gate, until the limit itself stops the build:** don't stop early to save it. One
  build step uses about 7-12% of the 5-hour limit. Every brief says to mark the step "in progress" first and
  keep a short "progress:" note under it in `Plan.md`, so the timer's chat can finish a step the limit cut off.
- **Update the `## Next action` after every step,** so a chat cut off part-way never loses its place.
- **While a helper is building, this chat neither edits `Plan.md` nor runs `./os checkpoint`:** write planning
  changes after it hands back, or a checkpoint sweeps up its half-done work.
- **A long chat gets summed up to save room.** After that, read `Plan.md`'s `Status:` lines, the next step's
  block and the `## Next action` again before the next step (never a long file whole: a long plan file is slow to read).

## When the run ends

The chat that ends the run (this one, or a timer's own chat) writes `Work/<Game>/Morning Report.md`: what was
built, what was checked, what's broken or untested, what the person must do, and their questions. It writes
`0 stopped` to the heartbeat, checkpoints, then sends them the report with `SendUserFile` (status `proactive`)
and says in one line which chat did the work and when: a timer run is its own chat, under Scheduled in the
sidebar, so they won't see it here.

## Rules

- Don't publish the game, and don't change Studio's settings.
- Don't run a computer-use step they haven't approved: an approval box on the Mac can't be clicked from their
  phone. If something needs a click in Studio, ask them before they leave.
- Keep their one-click list to things only they can do. Check everything else yourself.
- No models get made or uploaded in an away run, unless the person said yes to that upload batch before they
  left (models only when they start a model chat themselves; uploads are permanent). A step that needs one
  gets a named stand-in and its row in the game's `Model Prompts.md`, and the morning report says a model chat
  is waiting for them.

## Done when

- Before they leave: Rojo is running on its own and Studio picks up file changes, Remote Control is on, the Mac
  won't sleep, the next action says exactly what Go does, a checkpoint is saved, and the person knows if they
  have anything left to do.
- Overnight too: the night file is written, the timers exist, and the morning report reached them.
- After every run: it stopped at the gate, and `AWAY-LESSONS.md` has a line for each thing the setup could
  have stopped.
