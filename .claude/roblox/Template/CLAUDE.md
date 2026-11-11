# {{GAME}}

A Roblox game made in this folder with Claude. Read this whole file before touching the game.

@../../.claude/roblox/LESSONS.md

## How this game is built

- **Code lives in files under `Code/`.** Rojo copies them into Studio when they're saved.
  Never change a script inside Studio, and never with the MCP's `multi_edit`: Studio and the files
  would drift apart, and Rojo overwrites Studio's copy.
- **The MCP is for everything that isn't code:** building the world, models, UI in StarterGui,
  playtesting, reading the output log, screenshots.
- **Before any MCP call, check you have the right Studio.** Run `list_roblox_studios` and pick the
  window whose place is this game. Other games may be open too.
- **Start Rojo with `./start-rojo.sh`**, never `rojo serve` in a chat's own shell: that one stops when the chat
  closes. The script does nothing if this game's Rojo is already up. After a restart, press Connect in Studio's Rojo panel.
- **Done means `./check.sh` says all five ok** (the fifth, types, is luau-lsp: `--!strict` counts), and a playtest shows
  no new errors in the output log.
- **Where code goes:**
  - `Code/Shared/Config/` the numbers (prices, damage, speeds). Balance changes go here.
  - `Code/Shared/Logic/` pure rules, no Roblox services. Every module here gets a test in `Tests/`.
  - `Code/Shared/Net.luau` every remote's name. Add the name here first.
  - `Code/Server/` everything that matters (coins, damage, saves). The server decides.
  - `Code/Client/` input, camera, UI, effects. The client asks; it never decides.
- **The plan is `Plan.md`.** One step at a time, in its order.
- **On Windows, this folder lives in the Linux home inside WSL** (`~/...`), never on `/mnt/c`: Rojo can't see
  changes made there, so Studio would never update. Studio itself runs on the Windows side.

## Lessons (this game only)

When something goes wrong in this game, add one line here in the same turn as the fix.
Rules for every game go in `.claude/roblox/LESSONS.md` instead. Format:
`- <the rule>. Why: <what goes wrong>.`

