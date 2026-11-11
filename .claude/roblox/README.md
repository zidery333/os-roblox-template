# The Roblox folder

Everything the Roblox skills share. This is for you, the AI. The person never needs to open it.

| What | What it's for |
| --- | --- |
| `Template/` | The starter game. Every new game is a copy of it: Rojo setup, `Code/`, `Tests/`, `check.sh` with its five checks, and the game's own `CLAUDE.md`. Change it here and every game made after gets the change. Games already made don't. |
| `add-template.sh` | Copies `Template/` into one game's folder in `Work/`, with the game's name filled in. It never writes over a file that is already there. `/new-game` runs it. |
| `studio-mcp.sh` | Starts Roblox Studio's MCP server for Claude Code: the folder's `.mcp.json` runs it, so you can build in Studio, playtest, read the log and take screenshots. It finds Studio on a Mac, or on the Windows side when this folder runs inside WSL. If the link won't start, `bash .claude/roblox/studio-mcp.sh </dev/null` prints one line saying what to fix ("Found Roblox Studio's link at …, handing over." followed by StudioMCP's own "connection closed: initialize request" means the link is fine: it only stopped because nothing was typed to it). |
| `win-localappdata.sh` | WSL only: prints where Windows keeps Studio (`%LOCALAPPDATA%`) as a Linux path under `/mnt/c`. `studio-mcp.sh` and `/new-game` (to put the Rojo plugin in) use it. It copes with names cmd.exe garbles, and says when WSL can't run Windows programs. |
| `LESSONS.md` | Rules for every Roblox game. Each game's `CLAUDE.md` loads it, so every game knows them. |
| `how-roblox-games-are-built.md` | How people who make Roblox games with an AI actually work, with sources. Read it before a how-to answer about making a game. |

## Where a lesson goes

When a check fails for a reason that could happen again, a playtest shows a mistake, or the person
corrects you, write one line in the same turn as the fix: `- <the rule>. Why: <what goes wrong>.`

- **Only this game?** That game's own `CLAUDE.md`, under "Lessons (this game only)".
- **Any Roblox game?** `LESSONS.md` here.
- **How a model is built or looks?** `/make-model`'s own `LESSONS.md`.

Search first. If a rule already says it, make that rule sharper instead of adding a second one. If a
machine could catch it, make it a check (a selene setting or a test in `Template/`) instead of a line.
Write a `LESSONS.md` line so it makes sense for any game: the rule and why, not the story.
