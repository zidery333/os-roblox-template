# Briefs for the build loop

A part of `/build-game`. The build loop in `SKILL.md` says when each one is used.
Copy one, fill in the `<…>`, and send it as the subchat's whole brief. Each brief stands alone.

## A build step

```
Job: Build step <N> of <Game>: <the step's "what" from Plan.md>.

Background: <Game> is a Roblox game in Work/<Game>/ (in this folder). First read its CLAUDE.md
(it loads the shared lessons), then the one page and the Gates table at the top of Plan.md, then only this step's
block (from its heading to the next one; never a big Plan.md whole) and any Design/ section it names (older games
only). This step's "done when" is: <copy it>. Its gate is <N>: build nothing that belongs to a later gate.
<Anything the person said about this step, quoted.>

Files and area: only Work/<Game>/ and its Studio place "<place name>". Code in Code/ and Tests/.
World and UI through the Roblox Studio MCP. Don't touch other games or other steps.

Rules:
1. You are a subchat. Do only this step. Start no more subchats. First set the step's line in Plan.md to
   "Status: in progress" with a short "progress:" line under it, and keep that line current, so a chat that picks
   up after a cut-off can finish the step. Edit only your step's own lines in Plan.md: other chats add steps.
2. Code changes only in files. Rojo syncs them into Studio. Never change a script in Studio or
   with multi_edit. Before any MCP call, list_roblox_studios and pick "<place name>".
3. Write the test first for anything in Code/Shared/Logic/, then the code.
4. Run ./check.sh until it says all five pass. Then playtest through the MCP (start_stop_play,
   get_console_output, and input tools if needed): no new errors or warnings. Stop the playtest.
5. Every mistake you hit that could happen again (a failed check, a broken playtest, a wrong
   guess about an API) becomes one line in the right lessons file, as
   .claude/roblox/LESSONS.md explains. Search for an existing rule first.
6. Take a screenshot with screen_capture if anything visible changed, save it into
   Work/<Game>/Screenshots/ named step-<N>.png, and list its full path. Nothing visible?
   Say "no screenshot: nothing visible changed".
7. Don't publish the game. When the step changed the world or UI, save the place (save_place) after the playtest.
8. Never make or upload a model. Use the step's named stand-in, and add its row to Model Prompts.md: name, size in
   studs, moving parts. No colour or style: the look is the person's pick.
9. A step that adds or changes a screen follows /game-ui's check loop (phone size, scripted click path, script
   checks) and reports two scores apart: "works", which you prove, and "looks right on a phone", which only the
   person gives.

Done means: ./check.sh passes, the playtest log is clean, the step is "Status: done" in Plan.md,
lesson lines are added for mistakes, and ./os checkpoint "<Game>: step <N> <name>" has run.
End with a short message: what you did, files changed, lessons added, the screenshot path,
anything you're unsure of.
```

## A bug fix

```
Job: Fix this bug in <Game>: "<the person's words, quoted>".

Background: read Work/<Game>/CLAUDE.md first. <What you already know: when it happens, the log
line, your guess at the cause.>

Rules: the same as a build step (2 to 7). Find the cause before changing anything. Add a test that
fails because of the bug, then fix it. Add one lesson line saying how to avoid it next time.

Done means: the test passes, ./check.sh passes, a playtest shows the bug gone, the lesson line is
in, and ./os checkpoint "<Game>: fix <short name>" has run.
```

## Bug review

```
Job: Review everything built in <Game> since <commit or date>, find the bugs, and tidy the lessons.

Background: read Work/<Game>/CLAUDE.md and Plan.md's Status: lines first (never the whole Plan.md). Then git log and
git diff over that range, limited to -- "Work/<Game>" (other chats' work shares the history).

Look for, in this order:
1. Client trust: anything a LocalScript decides that the server should (money, damage, items).
   Remotes the server doesn't check (type, range, cooldown, ownership).
2. DataStore calls without pcall, saves that can lose data on leave or shutdown.
3. Leaks: connections never disconnected, instances never destroyed, loops that never stop.
4. Deprecated calls, invented methods, remotes missing from Net.luau.
5. Anything in Plan.md marked done that doesn't actually work in a playtest.

Then tidy the lessons:
- Rules in the game's CLAUDE.md that apply to any Roblox game move to .claude/roblox/LESSONS.md.
- Merge rules that say the same thing. The shared lessons file aims for 80 rules and must never pass 120.
- A rule a machine could catch: make it a check (selene setting or a test), then drop the line.

Fix only what is clearly a bug and small. List the rest, ranked.
Done means: ./check.sh passes, the lessons are tidied, and ./os checkpoint "<Game>: bug review" has run.
End with: bugs fixed, bugs left (ranked, with file and line), and what changed in the lessons.
```
