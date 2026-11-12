# OS Roblox

**Make Roblox games with Claude Code, in one folder that also keeps your notes, plans and files in order.**

You talk to Claude in plain words. It writes things down, puts them in the
right place, and keeps track of what you're working on. Open it tomorrow and
it knows where you left off.

![Made for Claude Code](https://img.shields.io/badge/made%20for-Claude%20Code-d97757)
![Version](https://img.shields.io/github/v/release/zidery333/os-roblox-template?label=version&display_name=release&color=2ea44f)
![MIT licence](https://img.shields.io/badge/licence-MIT-blue)

## Making Roblox games

**OS Roblox is the normal folder, plus everything you need to make Roblox
games with Claude.** It still keeps your notes, plans and files in order. On
top of that, you say "new game" and Claude sets up a game folder that's ready
to build, then builds it with you one step at a time, with Roblox Studio
linked so it can test what it made.

You don't need to know how to code. You bring the idea and the taste: what
the game is, what feels fun, what looks right. Claude writes the code, checks
it, and playtests it.

### What else you need

- Everything under [What you need](#what-you-need): Claude Code and a paid
  Claude plan.
- **Roblox Studio**, free from [create.roblox.com](https://create.roblox.com).
- **A Mac, or a Windows PC through WSL.** On Windows, the folder and Claude
  live inside WSL (see [Install](#install)), and Roblox Studio runs on
  Windows as normal. `new game` links the two.

### The first three things to say

Once it's installed, type these in the chat, one at a time:

1. `/setup` sets up the folder, the same as the normal one.
2. `new game` asks what your game is called, makes its folder, puts in the
   tools it needs, and walks you through linking Roblox Studio. You'll click
   a few buttons in Studio once.
3. Then say what you want to build, like "plan the game". Claude asks you
   questions first, writes a plan, and builds it one step at a time.

### Four skills it adds

| Say | What happens |
| --- | --- |
| "New game" | Makes a game folder that builds and passes all five checks while it's still empty |
| "Build the game" | Plans with you, then builds one step at a time. Each step has to pass the checks, a playtest and a screenshot |
| "Make a model" | Builds 3D models and pictures for your game's screens |
| "Split this up" | Runs a big job as a chain of smaller chats, then checks the work |

Every game learns from its own mistakes. When something goes wrong, Claude
writes down a rule so it doesn't happen again, in that game's notes, or for
every game if it applies to all of them.

### Honest bit

It has only been tried on a Mac so far. Windows through WSL should work the
same way, but no one has tried it on a real Windows PC yet. If something
breaks, tell Claude what happened, in plain words.

## New to this?

Claude is an AI: you type to it in plain words, and it answers. Claude Code is
the kind of Claude that can also open, write and move files on your computer,
inside one folder you pick.

OS Roblox is that folder. It's a place to keep anything you want to remember:
plans, notes, files, the things you're into. You tell Claude, and it writes it
down and puts it in the right place. Next week you ask "what did I decide about
the boiler?" and it finds it. You never learn a filing system. Claude does the
filing.

You don't need to know how to code. You'll paste a few lines once, to install
it, and after that you just talk.

## Already have an older folder?

Don't ask the old folder's Claude to fetch this one. It puts the new one inside
the old one, still linked to this page, and the two get mixed up. Instead:

1. Install OS Roblox fresh, with the steps under [Install](#install).
2. In the new folder, type `/setup`. When it asks about an old folder, tell it
   where yours is.

It copies everything across, filed the new way. Your old folder isn't changed
at all, and straight after it, one `./os undo` takes the whole lot back out.

## What it looks like

```text
  O S   R O B L O X
  ─────────────────
  ~/roblox

  ▍Work     3     Everything you're carrying — pushing on, or keeping level.
  ▍Notes    2     Anything you'll look up later — notes, PDFs, pictures, data.
   Archive  ·     No longer live. Still searchable.

  2 things on the go.
    Bakery stall                              ./os show bakery-stall
    Garden plan                               ./os show garden-plan
  1 thing you're just keeping level.
    Spanish lessons                           ./os show spanish-lessons
```

That's what you see when you type `./os`. Most days you won't type anything.
You just talk to Claude, and it does the filing.

## What it does

- **Writes anything down.** "Remember the plum tree gets pruned in late
  winter." It's filed straight away. There's no inbox to empty later.
- **Keeps track of your work.** Everything you're doing is either *on the go*,
  with a next step, or *kept level*, with nothing to do but keep it up. Things
  you're keeping level never nag you.
- **Finds things again.** Search forgives plurals and small typos, and offers
  a near word when nothing matches.
- **Lets you take things back.** `./os undo` reverses the last thing it did.
  Finished work goes to Archive, never the bin.
- **Remembers how you like things.** Say "keep answers short" once, and every
  new chat knows.
- **Stays up to date.** `./os update` brings the newest version and never
  touches your own work.

## Your three folders

| Folder | What goes in it |
| --- | --- |
| **Work** | Anything you're doing, or keeping up |
| **Notes** | Anything you'll want to look up later, files included |
| **Archive** | Things you've stopped carrying. Still searchable |

You never pick one. Claude does.

## Four helpers, ready to go

A helper is a second Claude sent off to do one big job on its own, so your
main chat stays clear. Ask for one by name: "get the researcher on this".

| | Helper | What it does |
| :---: | --- | --- |
| 🛠️ | **Builder** | Does the hands-on work inside one project: writes the code, drafts and files, and keeps the project's page true as it goes. |
| 🌐 | **Researcher** | Looks a subject up on the web and brings back one note, with its sources. Good before you decide anything. |
| 🔍 | **Reviewer** | Checks your work against what it's meant to be, and tells you what's wrong, worst first, with the fix. |
| 🎓 | **Student** | Studies a skill properly: finds people who do it for a living, reads or watches them in full, and brings back how they do it. |

## Eleven skills, built in

Say something like this, and Claude does it the same careful way every time.

| Say | What happens |
| --- | --- |
| "Set this up" | The first ten minutes: what it's for, a check of your computer, your old folder brought in |
| "Catch me up" | What's moving, what's gone quiet, what's waiting |
| "Save this" | Writes it down and files it |
| "What did I write about…?" | Finds it and pulls it together |
| "Let's go with…" | Writes the decision into the work it belongs to |
| "Teach me how the pros…" | Learns from good sources and brings back a note |
| "Hand this off" | Writes one note so someone else can pick it up |
| "Tidy up" | The weekly clean-up: gone stale, doubled up, unfiled |
| "Make this a skill" | Turns something you keep asking for into a new skill |
| "Done for today" | Writes down what happened and saves a checkpoint |
| "What can you do?" | The full menu |

## What you need

- A Mac, or a Windows PC (through WSL, see below). Roblox Studio, where
  games are played and tested, has no Linux version.
- A paid Claude plan: Pro, Max, Team or Enterprise. The free plan doesn't
  include Claude Code.
- About ten minutes.

## Install

Every step below is a command. Paste it into your terminal, the window you
type commands into, and press Return.

### 1. Open a terminal and get the tools

**🍎 Mac**

Press Cmd+Space, type Terminal, press Return. Then check for Python:

```bash
python3 --version
```

If a box pops up, click Install and wait. If it says Python is missing, run
`xcode-select --install`.

**🪟 Windows**

OS Roblox runs on Windows through WSL, a small copy of Linux that Windows can
run. Right-click the Start button and open **Terminal (Admin)**, or
**PowerShell (Admin)** on Windows 10. Then:

```powershell
wsl --install
```

Restart when it's done. Open **Ubuntu** from the Start menu, and make a
username and password when it asks. Ubuntu is your terminal from now on, for
every step below. In it:

```bash
sudo apt update && sudo apt install -y python3 curl unzip git
```

It asks for your password. Nothing shows as you type it, and that's normal.

### 2. Install Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

If it says `~/.local/bin` isn't in your PATH, paste the line it gives you.
Then close the terminal and open it again. Stuck? See
[Claude Code's setup page](https://code.claude.com/docs/en/setup).

### 3. Download OS Roblox

This puts it in a folder called `roblox` in your home folder.
Already have a `~/roblox`? Then use another name, like `~/roblox2`, in place of `~/roblox`
here and below. You can rename it later: `/setup` asks what to call it.

```bash
cd ~ && curl -fsSLO https://github.com/zidery333/os-roblox-template/archive/refs/heads/main.zip && unzip -qo main.zip && rm main.zip && mv os-roblox-template-main ~/roblox
```

Don't use `git clone` or GitHub Desktop. They keep the folder linked to this
page, so the Claude app shows it as this page's, whatever you call it. If you
already did, `/setup` cuts the link.

### 4. Start it

```bash
cd ~/roblox && ./os
```

```bash
claude
```

Log in and say yes to trusting the folder. Then type this in the chat:

```text
/setup
```

It says what everything is for, checks your computer has what it needs, and
brings in an old folder if you have one. About ten minutes. After that, just
talk.

**Using the Claude desktop app?** Do steps 1 and 3 in a terminal. Then in the
app, open the **Code** tab, start a new chat, pick the `roblox` folder in your home
folder, and type `/setup`. On Windows, run `claude` in the Ubuntu terminal
instead (step 4): the desktop app runs outside WSL, so it can't run this
folder's tools.

**Next time,** open your terminal and type `cd ~/roblox && claude`. Or, in the
Claude app, start a new chat in the same folder.

If `./os` ever says permission denied, type `bash os` instead, once. On
Windows, File Explorer shows your folder under **Linux**, then Ubuntu, home,
your username, roblox.

## Everyday commands

You don't need these, because Claude runs them for you. They're here if you'd
rather type.

| Command | What it does |
| --- | --- |
| `./os` | Where everything stands |
| `./os save "..."` | Write something down. It's filed straight away |
| `./os find <words>` | Search everything you've saved |
| `./os show <name>` | One thing: where it stands, its next step, its history |
| `./os undo` | Take back the last thing `./os` did |
| `./os close <name>` | Put something away in Archive |
| `./os help` | Every command |

## Get the newest version

Type `./os update` inside your folder. Your work and notes are never touched.
A skill you changed yourself is kept, and the new one is put beside it for you
to merge. Settings you changed keep your changes, with any new ones added.

## Other AIs

OS Roblox is built for Claude Code. Other AIs that can run commands on your
computer, like Codex or Gemini CLI, should work too, but nobody has tried them
yet. A chat-only app like ChatGPT can't.

The rules every AI follows are in `AGENTS.md`. `CLAUDE.md` and `GEMINI.md` are
one line each, pointing Claude Code and Gemini CLI at it. Codex reads
`AGENTS.md` by itself.

## Something not working?

Type `./os snag "what broke"` to write it down. To send them in, type
`./os snag --export`, read the `template-feedback.md` it writes, and send it
to **zidery333** on Discord.

## What's been tested

The program passes all 707 of its own checks. Type `./os test` to run them yourself.
They show that `./os` files, finds and undoes things the way it says. They
can't show that your AI files things well, or that any of this helps you.

No stranger has used this version yet. Its checks have only been run on a
Mac: Windows should work, but nobody has tried it yet.

## Licence

MIT. See [LICENSE](LICENSE).
