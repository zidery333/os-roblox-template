# How Roblox games are built with AI

A starter note that ships with this folder. It is what people who make Roblox games with an AI
actually do, from their videos and from Roblox's own pages. Timestamps like [04:37] point into each
video, so you can check the claim yourself.

## In one line

Code lives in files. Every change passes five checks before Studio sees it. Every mistake becomes a
written rule, so it never happens twice.

## The method

1. **Code lives in files, never typed into Studio.** Rojo (a free tool) copies the files into Studio
   each time they're saved. Studio and the files drifting apart sank SyphoDev's first try
   (SyphoDev [04:37], [11:11]). With code in files, the AI can check its own work before Studio ever
   sees it (fwjelaa [06:11]). Install the Rojo plugin one way only (`new game` picks the way for a Mac
   or for Windows). Installing it a second way gives two plugins and doubled scripts (fwjelaa [10:44]).
2. **Five checks gate every change.** It builds (`rojo build`), the lint is happy (selene), the
   layout is right (StyLua), the tests pass (Lune), and the types check (luau-lsp). The empty starter
   game must pass all five before any game code is written. Then a later failure is the AI's, not the
   setup's (SyphoDev [10:41]; fwjelaa [06:11]). Have the AI write the failing test first
   (fwjelaa [07:41]).
3. **Game numbers live apart from game objects.** Damage, prices and speeds go in plain config files,
   so they can be tested without Roblox, and balancing is just changing a number. Every remote's name
   goes in one file, so client and server can't drift apart (SyphoDev [10:10], [11:41]).
4. **A game's CLAUDE.md is a list of mistakes.** When the AI gets something wrong, ask it to add a rule
   so it never happens again (fwjelaa [11:16]). Each rule says what went wrong and why
   (SyphoDev [02:35]).
5. **Skills hold the detail.** A skill loads only when it's needed, for example saving data,
   networking, UI or animation (SyphoDev [01:32]–[03:07]; fwjelaa [11:47]).
6. **Plan first, then one feature at a time.** Have the AI ask 20–40 questions, read the plan, then
   say yes to it (fwjelaa [06:41]–[07:41]). Build a daily spinner, then rounds, then saving, one at a
   time. A whole game in one go gives a bland one (SmartyRBX 0ENeVVC9QT0 [10:14]).
7. **Playtest through Studio's MCP.** The AI can start and stop play, read the output log, take
   screenshots, and press keys and click (Roblox docs). Screenshots work while the game is stopped,
   and the log is all a running game gives back, so make as much as you can checkable while it's
   stopped (SyphoDev [10:10]). Measure maps against the real movement numbers: floating platforms,
   ledges nobody can reach, pits you can't climb out of (SyphoDev [14:49]).
8. **Check server against client.** For every change ask: where does this run, and could a cheater
   run it too? Paste the real error back and ask for that one fix (Generalist Programmer [05:40],
   [06:12]).
9. **The person brings the taste.** The AI doesn't know what feels good. Describe the screen shake,
   the effects and the feel yourself. Report a bug narrowly, with your guess at the cause
   (SmartyRBX da-wHJpNhBo [06:43]–[07:43]).
10. **Game passes and products by script.** Open Cloud (Roblox's web API) can make many passes and
    products in one go. Keep the key in an environment variable, never in chat (fwjelaa [14:51],
    [15:52]). Roblox's own MCP can now call Open Cloud with no key at all (its skill
    `rbx-open-cloud-usage`).

## Where they disagree

**Files and Rojo, or editing live in Studio through the MCP.** SyphoDev, fwjelaa, Leif and SmartyRBX
keep code in files. Crusherfire shows an MCP-only way, so you don't have to move to Rojo (6kcWSMJFaS4,
Nov 2025, before Roblox built the MCP into Studio). The files side has the better case: you get
history, and checks that run without Roblox. Roblox's MCP page says nothing either way. So: the MCP
builds the world and playtests, and the files hold the code.

**One big ask, or small steps.** SmartyRBX does both in different videos. Where he and SyphoDev both
land: lots of detail for the first core loop, small steps after.

## Judgement calls

- Test or playtest? Anything with numbers or rules is a test. Feel, looks and flow are a playtest.
- When should a rule become a check? If a machine can catch it, make it a check, not a sentence.
- Build UI into StarterGui through the MCP, not in code while the game runs, so it stays easy to
  change in Studio (SmartyRBX 0ENeVVC9QT0 [13:18], [16:23]).

## What goes wrong

- **Never running it.** 11 AIs working at once wrote about 1,352 lines on a base that didn't build.
  The first run died on an unguarded DataStore call. The AI got 70% of the way in 42 minutes, and the
  last 30% is the game (Show The Ledger NMVVMfMxQdw [02:04], [03:05], [05:41]).
- **Made-up methods, a coin button in a LocalScript (cheaters can use it), `wait()` and `.connect`**
  instead of `task.wait` and `:Connect` (Generalist Programmer [04:06]–[05:08]).
- **A whole game in one go** gives gray blocks and plain buttons (fwjelaa [01:33]).
- **Bug loops:** one fix brings six bugs, and the AI breaks its own work. The MCP once copied a frame
  by mistake (SmartyRBX 0ENeVVC9QT0 [16:53]).
- **Emojis as icons** show as black boxes. Outline widths don't match (SyphoDev [12:42]).
- **An API key pasted in chat** is stored for good (SyphoDev [09:40]).
- **ScriptSync can quietly stop syncing.** The sign is a red dot on the service (SmartyRBX [12:17]).

## Kit

Claude Code (Pro is enough, says SyphoDev). Roblox Studio's built-in MCP. Rojo, Rokit (it installs the
other tools), selene, StyLua, Lune for tests, luau-lsp for types, and git. Open Cloud for passes and
products. For models, if you want them: Meshy (paid), or a free image-to-3D tool plus Blender to cut
the triangle count, since Roblox caps a mesh at 20k triangles (SyphoDev [05:38]–[07:40]).

## Practice

Say "new game", then get the empty starter to pass `./check.sh`, all five ok.

## Sources

- **Roblox Creator Hub, "Connect to the Roblox Studio MCP server"**,
  https://create.roblox.com/docs/studio/mcp. The tool list, and a warning to connect only AI apps you
  trust. Nothing on Rojo.
- **Roblox DevForum, "Studio MCP Server Updates and External LLM Support for Assistant"**,
  https://devforum.roblox.com/t/studio-mcp-server-updates-and-external-llm-support-for-assistant/4415631,
  Feb 2026. Added the play-mode tools.
- **The Roblox MCP's own skills** (debugging, unit tests, device and network simulators, Open Cloud,
  analytics, configs). Ask the MCP to list them.
- **SyphoDev**, https://www.youtube.com/watch?v=afuKhenJldY, about Oct 2026. The most complete method;
  no finished game shown. Promotes a Discord at the end.
- **fwjelaa**, https://www.youtube.com/watch?v=MzDuviVsMTQ, about Oct 2026. Says a game was built in
  under 7 hours and sold. Has an ad at the start and a sponsor midway.
- **SmartyRBX**, https://www.youtube.com/watch?v=0ENeVVC9QT0 and
  https://www.youtube.com/watch?v=da-wHJpNhBo, Mar–Jul 2026. Honest about limits. Sells a course.
- **Show The Ledger**, https://www.youtube.com/watch?v=NMVVMfMxQdw, about Aug 2026. Sells nothing.
  The best story of what goes wrong, but only one source.
- **Leif**, https://www.youtube.com/watch?v=IJDg6tRJmHo, May 2025. Tool setup only, no AI.
- **Generalist Programmer**, https://www.youtube.com/watch?v=UF40gDiAs8s, about Jul 2026. Sells a
  prompt pack; the free method is sound.
- **Crusherfire**, https://www.youtube.com/watch?v=6kcWSMJFaS4, Nov 2025. Mostly setup and a sponsor.
- Left out: videos with no AI in them, and ones that were mostly earnings claims or ads. Most games
  made with AI get few visits, and nobody with a big hit has shown how they use AI.
- Sales and player numbers in these videos couldn't be checked.

## Who to trust
<!-- Starts empty: leave the heading and this comment until the first line.
     Each time a source's advice works or fails when they try it, a dated
     line: who, what they said, what happened. Never change an old line; a
     new result is a new line. The next /learn on this reads it first. -->
