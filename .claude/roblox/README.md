# The Roblox folder

Everything the Roblox skills share. This is for you, the AI. The person never needs to open it.

| What | What it's for |
| --- | --- |
| `Template/` | The starter game. Every new game is a copy of it: Rojo setup, `Code/`, `Tests/`, `check.sh` with its five checks, the game's own `CLAUDE.md`, and a `Plan.md` that starts empty (the plan part of `/build-game` fills it with the one page, the gates and the steps). Change it here and every game made after gets the change. Games already made don't. |
| `add-template.sh` | Copies `Template/` into one game's folder in `Work/`, with the game's name filled in. It never writes over a file that is already there. `/build-game` (its set-up part) runs it. |
| `studio-mcp.sh` | Starts Roblox Studio's MCP server for Claude Code: the folder's `.mcp.json` runs it, so you can build in Studio, playtest, read the log and take screenshots. It finds Studio on a Mac, or on the Windows side when this folder runs inside WSL. If the link won't start, `bash .claude/roblox/studio-mcp.sh </dev/null` prints one line saying what to fix ("Found Roblox Studio's link at …, handing over." followed by StudioMCP's own "connection closed: initialize request" means the link is fine: it only stopped because nothing was typed to it). |
| `win-localappdata.sh` | WSL only: prints where Windows keeps Studio (`%LOCALAPPDATA%`) as a Linux path under `/mnt/c`. `studio-mcp.sh` and `/build-game` (its set-up part, to put the Rojo plugin in) use it. It copes with names cmd.exe garbles, and says when WSL can't run Windows programs. |
| `LESSONS.md` | Rules for every Roblox game. Each game's `CLAUDE.md` loads it, so every game knows them. |
| `how-roblox-games-are-built.md` | How people who make Roblox games with an AI actually work, with sources. Read it before a how-to answer about making a game. |

## How a game gets made

The skills run in this order, and each hands on to the next:

1. `/game-idea` writes the idea card, with stop checks the idea must pass.
2. `/build-game` plans the game on one page, sets it up (its set-up part makes the game's folder from
   `Template/`), writes the gates, then builds one step per subchat. The person plays each gate before
   anything past it is built. Its away part carries on while they are away (a Claude desktop app and Mac
   feature: the file says so at the top).
3. `/game-ui` makes the screens, from Gate 1 on.
4. `/make-model` makes models, only in a model chat the person starts.
5. `/market-game` makes the store page, thumbnails and first players, once Gate 1 is passed (publishing is part of Gate 2's work).
6. `/subchat-chain` runs the subchats that `/build-game` uses.

There is no `/new-game` skill: setting a game up is a part of `/build-game`.

## Where a lesson goes

When a check fails for a reason that could happen again, a playtest shows a mistake, or the person
corrects you, write one line in the same turn as the fix: `- <the rule>. Why: <what goes wrong>.`

- **Only this game?** That game's own `CLAUDE.md`, under "Lessons (this game only)".
- **Any Roblox game?** `LESSONS.md` here.
- **How a model is built or looks?** `/make-model`'s own `LESSONS.md`.

Search first. If a rule already says it, make that rule sharper instead of adding a second one. If a
machine could catch it, make it a check (a selene setting or a test in `Template/`) instead of a line.
Write a `LESSONS.md` line so it makes sense for any game: the rule and why, not the story.
