---
name: new-game
description: Start a new Roblox game in this folder, set up the AI way: Rojo, the five checks, shared lessons, a plan file, Studio linked. Use when the person says new game, start a game, make a new Roblox game, set up a game, or wants to turn an idea note into a real game.
argument-hint: "<game name>"
---

# New game

Every game lives in `Work/<Game Name>/` and is built the same way. The method behind it is
`.claude/roblox/how-roblox-games-are-built.md`. The rules learned the hard way, for every game, are
`.claude/roblox/LESSONS.md`. Each game's `CLAUDE.md` loads the lessons, so read them once before you start.

Works on a Mac, and on Windows through WSL (Linux inside Windows). On Windows, `./os`, the checks and
Rojo run inside WSL, and Roblox Studio runs on the Windows side. The steps below say where the two differ.

## Do this

1. **Name it.** Take the name from `$ARGUMENTS`, or ask for it. Look for an idea note with
   `./os find "<name>"`. Only a note whose title is exactly the game's name becomes the game:
   `./os push "<name>"` turns it into work, and from then on `<Game Name>` below is the folder name
   that command prints. A note that only mentions the game stays a note. Otherwise
   `./os new work "<Game Name>" --domain games`, then write the idea into its README.md in a few
   lines. Ask the person for the idea in one sentence if you don't have it.
2. **Windows only: check where the folder is.** Run `pwd`. If it starts with `/mnt/`, this folder is
   on the Windows drive, and Rojo can't see changes made there, so Studio would never update. Stop and
   say so: the whole folder has to move into the Linux home (`~/...`). Don't move it yourself.
3. **Add the template:**
   `bash .claude/roblox/add-template.sh "Work/<Game Name>" "<Game Name>"`
   That adds the Rojo project, `start-rojo.sh`, the five checks (`check.sh`), the code folders,
   two sample tests, `CLAUDE.md` (loads the shared lessons) and `Plan.md`. It never overwrites a file.
4. **Check the tools.** Run `Work/<Game Name>/check.sh`.
   - Says `MISSING`? The tools aren't installed. See "Installing the tools" below.
   - Must end with "All five checks pass." on the empty game, before any game code is written.
     Then a later failure is the new code's fault, not the setup's.
5. **Connect Studio.** See "Linking Studio" below. Then confirm it yourself with the MCP:
   `list_roblox_studios`, pick that place, and check that `ServerScriptService.Server.Main` exists.
   Run a playtest and look for `[Server] ready` and `[Client] ready` in the output log.
6. **Hand over.** Say in one line that the game is ready, and that `/build-game` plans and builds it.

## Installing the tools

Everything here is downloaded from its official page, so **ask the person before each download.**

**Roblox Studio** (once per computer). From create.roblox.com. On Windows, install the normal Windows
Studio: it can't run inside WSL. Open it once and sign in.

**Rokit** installs and pins the other tools (Rojo, selene, StyLua, Lune, luau-lsp) from the game's
`rokit.toml`. In this folder's terminal (on Windows, the WSL one):

```bash
curl -sSf https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.sh | bash
```

- On Windows (WSL), a fresh Ubuntu often lacks `unzip`. If the script says so, the person runs
  `sudo apt install unzip curl` themselves (it asks for their password), then the script again.
- On Windows, use this Linux rokit inside WSL. Never the Windows `rokit.exe`: the tools must be Linux
  ones to watch a folder in the Linux home.

Then in the game's folder: `~/.rokit/bin/rokit install --no-trust-check`, and rerun `./check.sh`.
Once installed, every later game only needs `rokit install`.

## Linking Studio

Tell the person these steps, one at a time, and wait for each.

1. **Turn on Studio's MCP server** (once per computer). In Studio: Assistant, then the `...` menu,
   then Manage MCP Servers, and turn on "Enable Studio as MCP server". This folder already has the link
   in `.mcp.json` (it runs `.claude/roblox/studio-mcp.sh`, which finds Studio on a Mac or on Windows).
   Don't use Studio's Quick connect as well: on Windows it can't reach the AI inside WSL anyway.
   Then the person restarts this chat. The folder's settings already turn the `Roblox_Studio` server
   on; if Claude still asks to allow it, they say yes.
   If the link won't start, run `bash .claude/roblox/studio-mcp.sh </dev/null` and read what it prints.
   One line saying what to fix means just that. "Found Roblox Studio's link at …, handing over."
   followed by StudioMCP's "connection closed: initialize request" means the link works: it stopped
   only because this test sends it nothing. Then the problem is elsewhere (Studio not open, or the
   chat not restarted).
2. **Make a place.** In Studio, a new place for the game (Baseplate is fine), saved under the game's
   name, so the MCP can tell it apart from other games. Publishing waits until the game needs saving
   player data, a shop or real testers.
3. **The Rojo plugin** (once per computer). Its version must match the Rojo in `rokit.toml` (7.x). Pick
   one way and only one: two copies of the plugin double every script.
   - **Mac:** you run `~/.rokit/bin/rojo plugin install` in the game's folder. The person restarts Studio.
   - **Windows:** `rojo plugin install` does not work inside WSL. Instead, with the person's yes,
     download `Rojo.rbxm` from the Rojo release on GitHub that matches `rokit.toml`, into Studio's
     plugin folder on the Windows side:
     ```bash
     lad="$(bash .claude/roblox/win-localappdata.sh </dev/null)" && mkdir -p "$lad/Roblox/Plugins" \
       && curl -fL -o "$lad/Roblox/Plugins/Rojo.rbxm" https://github.com/rojo-rbx/rojo/releases/download/v<version>/Rojo.rbxm
     ```
     (`<version>` is the Rojo number in `rokit.toml`, like `7.7.1`. If the first part fails, it says
     why.) The person restarts Studio. If that file isn't in the release, the person installs Rojo
     from the Creator Store instead, and keeps the rokit Rojo on the same main number.
4. **Start syncing.** You run the game's `./start-rojo.sh` (it keeps Rojo running after the chat
   closes; never `rojo serve` in a chat's own shell). The person clicks Rojo in Studio, then Connect.
   On Windows, Studio reaches Rojo inside WSL at localhost; if it can't, they type `127.0.0.1` in
   the Rojo panel. Never start Rojo with `--address 0.0.0.0`: that opens it to the whole network.
   Only one game syncs at a time: if the script says another game has the port, ask
   the person before `./start-rojo.sh --stop`.

## Rules

- One game, one folder in `Work/`. Never put two games in one folder.
- Never overwrite a game's files. The template script skips anything already there.
- Make the game with `./os`, never with `mkdir` by hand.
- Don't write any game code here. Planning and building is `/build-game`.

## Done when

- `Work/<Game Name>/check.sh` says all five checks pass.
- Studio is connected through Rojo, and a playtest shows both "ready" lines.
- The person knows the next step is `/build-game`.
