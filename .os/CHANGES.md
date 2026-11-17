# What's new

Newest first. Each release says, in plain words, what you'll notice.
`./os update` shows you the ones that are new to you.

## 2026-11-17.2

- Built on the newest OS template, the normal folder this one adds to.
  Messages that used to say Zenith now say OS template.

From the normal template:

- The template is now called OS template. It used to be Zenith. Your own
  folder keeps whatever name it has.

## 2026-11-17.1

- A whole new way to make a game. Say "new game idea" first: Claude checks
  the idea and writes it on one idea card. Then "build the game" plans it on
  one page and builds it in gates.
- Gate 1 is only the core loop in grey boxes. You play it for about 15
  minutes, and nothing more gets built until you say it's fun.
- Three new skills: one for checking a game idea, one for designing the
  game's screens, and one for getting players (the game's page, thumbnails,
  publishing, and reading how players behave).
- Setting up a game is now part of "build the game". Saying "new game"
  still works.
- Building while you're away: say "I'm going to sleep" and it keeps going
  step by step. Needs a Mac with the Claude desktop app.
- "Make a model" can now use Blender or Meshy as well as code, with new
  checks. Meshy is paid, and Claude says the cost before using it.
- Many more lessons for every game, from building real games since the
  last release.
- A new game's checks catch five more mistakes: saving data without a
  safety net, emoji in the game's text, two values taken from one `if`
  that only gives one, Studio-only scripts in the game's code, and a test
  that hangs. Games you already made keep their old checks: ask Claude to
  bring the new `Tests/` files and `check.sh` across.

## 2026-11-12.1

- Nothing new in the Roblox part this time. What the normal folder gained
  is below.

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
