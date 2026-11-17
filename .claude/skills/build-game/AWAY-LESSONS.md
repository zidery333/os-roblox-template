# Away lessons

**Needs the Claude desktop app on a Mac** (it hands steps to new sessions and wakes itself up). On Windows, in
WSL, build-game works one step at a time in this chat instead, so these lessons don't apply there.

Read before getting a build ready to run without the person (away, asleep, overnight) and before saying Go.
Each line came from something that stalled, broke or wasted an unattended run, or a gap found before one; how
lines get here and go: "How it learns" in `AWAY.md`. A lesson about the game itself goes to the Roblox
lessons, not here.
`- <the rule>. Why: <what goes wrong in general>.`
Keep each new line short, with no dates or counts.

## Starting
- Start working the moment the person pastes the prompt. Give their clicks in the first message, carry on
  without waiting, and check the Studio link as soon as they say "done", while they can still approve what
  Studio asks. Why: a link check made after they have gone to sleep can't be approved.
- Have a fresh reviewer (the reviewer helper) read any unattended plan before it starts. Why: a plan's own checks
  miss gaps a fresh reader finds, and some are serious.
- Auto mode's safety check can block making the backup timer and stopping another game's Rojo, or allow them.
  Why: it is not consistent, so ask for these approvals while the person is there.
- A resume chat that finds no heartbeat file takes the build over (no file means nobody owns it), and if the
  person turns out to be there, it asks for their one approval at once. Why: a build with no owner stalls, and
  the person can still approve Studio control while they are around.
- Steps drafted in a planning talk (a line or two each) aren't buildable: before an away run starts, each needs
  What, Done when, Test, sizes and numbers, written in one pass so the choices fit, then a fresh review. Why:
  helpers given thin steps make many design choices alone, and those choices don't fit together.

## While it runs
- Before they leave, ask whether a dropped Rojo link may be reconnected overnight by one approved computer-use
  click (Studio's Rojo panel: Okay, then Connect, or Accept on its "Sync changes" box), and get that approval
  while they're there. Why: Rojo can drop while they are away, and without that approval the code stops reaching
  Studio and the steps pile up written but unplayed.
- Ask them to save the place in Studio before they leave and say a non-Team-Create place keeps the run's world
  and UI only in the open window; every helper keeps what it builds in Studio as a `.studio.luau` rebuild
  script. Why: anything built in Studio and not saved is lost in a crash, and only the scripts bring it back.
- Get models into Studio unattended by upload, never Studio's Import: Import opens the Mac's file picker, which a
  Studio-only computer-use grant can't touch. Upload the .glb with the Studio MCP's open_cloud_invoke (Assets API)
  and place it with insert_asset; the person must first allow asset uploads and the folder in Studio's Assistant
  Settings, MCP Permissions. Why: the file picker stops an unattended run.
- A run of checks needs its review helper to be able to write: give it a helper type that can write files (or
  have it hand back the text), since the `reviewer` type can only read. Why: a read-only reviewer can't save its
  review or its sheets.
- A chat that takes over a run part-way checks the backup timers exist for this run. Why: a file can say "the
  backup timer picks up after it" while no timer was ever made, so nothing would resume the build.
- Every step brief says in its own words: never make and then remove a folder under `Code/` while Rojo serves; on
  a drop, restart Rojo, finish the files and report it, so the main chat (the only one with the click) presses
  Connect. Why: making and removing a folder can crash Rojo and leave Studio unlinked, even when the shared
  lessons already say so.

## When nobody can say Go
- Give an away plan enough writing work to fill a whole 5-hour window with Rojo down, or the backup runs end early
  with nothing to do. The best filler, for steps inside the gate only, is each next step's file half (Config,
  Logic and tests, marked "in progress" with a "Written offline" line), then a fresh review of it. Why: with Rojo
  cut off, writing files is the only progress left, and it is fast.
- A run file's Resuming steps must say what a timer does when the heartbeat says `stopped` and everything is
  ticked: nothing. Why: otherwise a later timer reads `stopped` as "take over" and sends a second report.

## Copying
- Copying from an old game, copy the working rules (sizes, part names, code), never its look, when the new game's
  style isn't picked yet. Why: the model prompts would carry the old game's look into every style.
- Make the backup timers in a turn the person typed themselves, before any helper is running. Why: auto mode may
  refuse timers made in a turn that holds a helper's report, or not save them, so they stop at their first command.
