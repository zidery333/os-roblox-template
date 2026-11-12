# What's new

Newest first. Each release says, in plain words, what you'll notice.
`./os update` shows you the ones that are new to you.

## 2026-11-12.1

- Nothing new in the Roblox part this time. What the normal folder gained
  is below.

From the normal template:

- Skills learn from their mistakes. When one goes wrong, or you correct
  it, your AI writes the lesson down beside that skill, and reads it the
  next time. Updates never touch what a skill has learned.

## 2026-11-11.2

- On Windows (WSL), "new game" stopped with an error before copying any
  starter files into the game. Fixed. Still not tried on a real Windows
  PC.
- A game's checks catch more mistakes: a misspelled remote name in server
  code, code saved as `.lua`, a test file that isn't named `.spec.luau`
  (it never ran), and old Roblox calls like `Humanoid:LoadAnimation`.
- They also stop failing correct code, like `part:GetMass()`, a
  `BodyColors` lookup, or a variable called `Remotes`. Games you made
  with the first release keep their old checks: ask Claude to bring the
  new `Tests/` files and `check.sh` across.
- Rojo starts and stops properly on a computer with a web proxy set.
- "Make a model" checks are stricter and more honest: every check now
  fails when it finds a problem (some only printed it), and the moving-part
  checks catch hits they used to miss.
- The lessons no longer describe one particular game.

## 2026-11-11.1

- The first OS Roblox. It's the normal folder for your notes, plans and
  files, plus what you need to make Roblox games with Claude.
- Say "new game" and Claude makes a game folder that passes all five checks
  while it's still empty, and walks you through linking Roblox Studio.
- Say "build the game" and Claude plans it with you, then builds it one step
  at a time. Each step has to pass the checks, a playtest and a screenshot.
- "Make a model" builds 3D models and pictures for your game's screens.
- Works on a Mac, and on Windows through WSL with Roblox Studio on Windows.
  Windows hasn't been tried on a real PC yet.
