# The set-up part

A part of `/build-game`. Read it when the game has no folder in `Work/` yet. The plan part (`PLAN.md`) calls
it once the person has said yes to the one page. It is also the one home for "Starting Rojo", "An older game"
and "Installing the tools", which the build loop and the away part point to.
Every game lives in `Work/<Game Name>/` and is set up the same way: Rojo, the five checks, the shared
lessons and a plan file. The method behind it is `.claude/roblox/how-roblox-games-are-built.md`. The rules
learned the hard way, for every game, are `.claude/roblox/LESSONS.md`; each game's `CLAUDE.md` loads them.

Works on a Mac, and on Windows through WSL (Linux inside Windows). On Windows, `./os`, the checks and Rojo
run inside WSL, and Roblox Studio runs on the Windows side. The steps say where the two differ.

## Do this

1. **Check there's an idea card.** Take the game's name from what the person said, or ask for it, and find its
   note (`./os find "<name>"`). The note needs a `## Idea card` whose stop checks in `/game-idea` are all yes.
   None? Stop and run `/game-idea` first: this part doesn't judge ideas, and it makes no folder for an idea
   with no card. Why: an AI scoring an idea is not a fun check, and a game that passed one was called boring
   when played. Only a note whose title is exactly the game's name becomes the game; a note that only
   mentions it stays a note.
   Done when: you have read the card, and every stop check is yes.
2. **Make the game from the note.** `./os push "<name>"` turns the note into work, so the card lands in
   `Work/<Game Name>/README.md`, and from then on `<Game Name>` below is the folder name that command prints.
   The name is a working name: the person picks the real one later (`/market-game`).
   Done when: that README holds the card.
3. **Windows only: check where the folder is.** Run `pwd`. If it starts with `/mnt/`, this folder is on the
   Windows drive, and Rojo can't see changes made there, so Studio would never update. Stop and say so: the
   whole folder has to move into the Linux home (`~/...`). Don't move it yourself.
   Done when: `pwd` does not start with `/mnt/`.
4. **Add the template:**
   `bash .claude/roblox/add-template.sh "Work/<Game Name>" "<Game Name>"`
   That adds the Rojo project, `start-rojo.sh`, the five checks (`check.sh`), the code folders, a sample test,
   `CLAUDE.md` (loads the shared lessons), `roblox-game.yml` and `Plan.md`. It never overwrites a file.
   Done when: the script has listed each file it added, and `check.sh` and `Plan.md` are in the folder.
5. **Check the tools.** Run `"Work/<Game Name>/check.sh"`.
   - Says `MISSING`? The tools aren't installed. See "Installing the tools" below.
   - Done when: it ends with "All five checks pass." on the empty game, before any game code is written.
     Then a later failure is the new code's fault, not the setup's.
6. **Connect Studio.** Tell the person these steps, one at a time, and wait for each.
   1. **Turn on Studio's MCP server** (once per computer). In Studio: Assistant, then the `...` menu, then
      Manage MCP Servers, and turn on "Enable Studio as MCP server". This folder already has the link in
      `.mcp.json` (it runs `.claude/roblox/studio-mcp.sh`, which finds Studio on a Mac or on Windows). Don't
      use Studio's Quick connect as well: on Windows it can't reach the AI inside WSL anyway. Then the person
      restarts this chat. The folder's settings already turn the `Roblox_Studio` server on; if Claude still
      asks to allow it, they say yes.
      If the link won't start, run `bash .claude/roblox/studio-mcp.sh </dev/null` and read what it prints. One
      line saying what to fix means just that. "Found Roblox Studio's link at …, handing over." followed by
      StudioMCP's "connection closed: initialize request" means the link works: it stopped only because this
      test sends it nothing. Then the problem is elsewhere (Studio not open, or the chat not restarted).
   2. **Make a place.** In Studio, a new place for the game (Baseplate is fine), saved under the game's name,
      so the MCP can tell it apart from other games. Publishing waits until the game needs saving player
      data, a shop or real testers.
   3. **The Rojo plugin** (once per computer). Its version must match the Rojo in `rokit.toml` (7.x). Pick one
      way and only one: two copies of the plugin double every script, so never also install it from the
      Creator Store.
      - **Mac:** you run `~/.rokit/bin/rojo plugin install` in the game's folder. The person restarts Studio.
      - **Windows:** `rojo plugin install` does not work inside WSL. Instead, with the person's yes, download
        `Rojo.rbxm` from the Rojo release on GitHub that matches `rokit.toml`, into Studio's plugin folder on
        the Windows side:
        ```bash
        lad="$(bash .claude/roblox/win-localappdata.sh </dev/null)" && mkdir -p "$lad/Roblox/Plugins" \
          && curl -fL -o "$lad/Roblox/Plugins/Rojo.rbxm" https://github.com/rojo-rbx/rojo/releases/download/v<version>/Rojo.rbxm
        ```
        (`<version>` is the Rojo number in `rokit.toml`, like `7.7.1`. If the first part fails, it says why.)
        The person restarts Studio. If that file isn't in the release, the person installs Rojo from the
        Creator Store instead, and keeps the rokit Rojo on the same main number.
   4. **Start syncing:** you start Rojo as "Starting Rojo" below says. The person then clicks Rojo in Studio,
      then Connect. On Windows, Studio reaches Rojo inside WSL at localhost; if it can't, they type
      `127.0.0.1` in the Rojo panel.
   Then confirm it yourself with the MCP: `list_roblox_studios`, pick that place, and check that
   `ServerScriptService.Server.Main` exists. Add `servePlaceIds` once the place has a place id ("Starting
   Rojo"). Run a playtest and look for `[Server] ready` and `[Client] ready` in the output log.
   Done when: both lines are in the log.
7. **Hand over.** Called from the plan part? Go back to step 7 of `PLAN.md`: it writes the plan into
   `Plan.md`. No plan yet? Say the plan part is next. After the plan, the build loop in `SKILL.md` builds
   Gate 1, the core loop in grey boxes. Done when: the person knows what is next.

## Starting Rojo

The whole rule lives here. The build loop and the away part (`AWAY.md`) point to it.

- Run the game's `./start-rojo.sh`. It starts Rojo on its own, so Rojo keeps going after the chat closes, and
  it does nothing if this game's Rojo is already up. Never `rojo serve` in a chat's own shell: that one stops
  when the chat closes. Then check Studio's Rojo panel says connected.
- No script yet? Copy `.claude/roblox/Template/start-rojo.sh` into the game's folder as it is: it reads the
  game's name itself.
- Never start Rojo with `--address 0.0.0.0`: that opens it to the whole network.
- Only one game syncs at a time. If the script says another game has the port, ask the person first. On a yes,
  they close that game's place in Studio **first**, then stop the other Rojo (`./start-rojo.sh --stop` in that
  game's folder, or on a Mac `kill $(lsof -ti tcp:34872 -sTCP:LISTEN)`) and run the script again.
- Once the place has a place id (`game.PlaceId` is not 0: a Team Create or published place), the game's
  `default.project.json` must have `"servePlaceIds": [<that id>],` under `"name"`. Add it if it's missing.
  Without it Rojo connects to whichever place asks, and a window left open can get the wrong game's scripts.

## An older game

Before its first build step, compare its `check.sh`, `Tests/Source.spec.luau` and `default.project.json`
(`servePlaceIds`) with `.claude/roblox/Template/` and copy the newer ones in, then run `./check.sh`: the
template gains checks that older games never got.

## Installing the tools

Everything here is downloaded from its official page, so **ask the person before each download.**

**Roblox Studio** (once per computer). From create.roblox.com. On Windows, install the normal Windows Studio:
it can't run inside WSL. Open it once and sign in.

**Rokit** installs and pins the other tools (Rojo, selene, StyLua, Lune, luau-lsp) from the game's
`rokit.toml`. In this folder's terminal (on Windows, the WSL one):

```bash
curl -sSf https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.sh | bash
```

- On Windows (WSL), a fresh Ubuntu often lacks `unzip`. If the script says so, the person runs
  `sudo apt install unzip curl` themselves (it asks for their password), then the script again.
- On Windows, use this Linux rokit inside WSL. Never the Windows `rokit.exe`: the tools must be Linux ones to
  watch a folder in the Linux home.

Then in the game's folder: `~/.rokit/bin/rokit install --no-trust-check`, and rerun `./check.sh`.
Once installed, every later game only needs `rokit install`.

## Rules

- One game, one folder in `Work/`. Never put two games in one folder.
- Never overwrite a game's files. The template script skips anything already there.
- Make the game with `./os`, never with `mkdir` by hand.
- Don't write any game code here. Planning is the plan part (`PLAN.md`), building is the build loop in
  `SKILL.md`.

## Done when

- The README has an `## Idea card` from `/game-idea`.
- `"Work/<Game Name>/check.sh"` says all five checks pass.
- Studio is connected through Rojo, and a playtest shows both "ready" lines.
- The person knows what is next: the plan part if there is no plan yet, then the build loop for Gate 1.
