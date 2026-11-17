---
name: game-idea
description: Find a Roblox game idea worth a cheap test. The person plays rising games and says what they think, the notes build up, and the AI makes ideas from them plus the charts and research; the person picks the one they'd play. Use when they say game idea, game ideas, find me an idea, I need an idea, what should I make next, pitch me a game, idea round, check this idea, is this idea any good, I played some games, here are my notes on a game, or add this game.
argument-hint: "[idea name]"
---

# Game idea

Find one game idea worth a cheap test. The person plays games and says what they think. Their notes build up,
game after game, in a note called Games I've Played (in `Notes/`, if they keep one). The AI makes ideas from those
notes, the charts and research. Every idea answers the questions in `QUESTIONS.md` (beside this file). Ideas live
in the chat: only the one the person wants to build gets a note. Good looks like one idea card answering every
question, for a fresh game with its own hook, and not a copy of any game. Nothing is built here.

## Before you start

- Read the About me note in `Notes/`, if there is one: the person's own rules. Break none. Ask one question at a
  time, and keep every answer short.
- Read the person's Games I've Played note in `Notes/`, if there is one, in full: every game they played, in their
  words, and "What keeps showing up". No note yet? Ask them which games they play and like, one question at a time,
  and offer to start the note (`./os new note "Games I've Played" --domain games`). Never guess which games they
  have played.
- Read `QUESTIONS.md`: what every idea answers, and why.
- Read "What we tried" at the end of `.claude/skills/game-idea/REFERENCE.md`, which holds the research and sources.
  This skill follows its steps 1, 2, 4 and 5; steps 3 and 4 below replace its step 3.
- A dated number more than a month old? Open its source again before you use it: Roblox's rules change often.
- The person's old games and ideas count for nothing either way: nothing is picked or dropped for being like them.

## Steps

Steps 1 to 3 only grow Games I've Played, and run only when the person says they want to play, or says yes when
asked. Step 4 onward runs when they want an idea.

1. **Read the live charts.** *AI. None of the person's time.* Read Top Playing Now, Up-and-Coming and Top Trending
   from Roblox's public chart feed. For each riser record like share, created date and server size. No login is
   needed. Put nothing about the person or their games in a request. Feed base: `https://apis.roblox.com/explore-api/v1/`
   - `get-sorts?sessionId=1&device=computer&country=us` holds Up-and-Coming and Top Trending
   - `get-sort-content?sessionId=1&sortId=top-playing-now&device=computer&country=us` is Top Playing Now
   - `https://games.roblox.com/v1/games?universeIds=<ids>` gives created dates and server sizes (25 ids at most a call)
   - *Done when:* a dated list of 10 risers with those fields exists. Confidence: high.
2. **Pick three games for the person to play, and skip the current number one.** *AI. None of the person's time.*
   Pick three different kinds of game. Prefer kinds Games I've Played has few of: its "What keeps showing up" names
   the thin spot. No note yet? Ask which kinds they have played lately and pick kinds that are not those. Prefer
   games that have risen for a while, or small well-liked games nobody has copied (`omni-search` on
   `apis.roblox.com/search-api/` shows copies). Copies of a number one appear within a week, and an AI-built egg
   follower lost about 94% of its peak in 28 days. A new game is shown first only to age-checked players aged 16+:
   it must be fun for them, and for the person. Skip games they have already played.
   - *Done when:* three games, each a different kind, none already in Games I've Played. Confidence: medium.
3. **The person plays them and gives their notes.** *The person's part: about 30 minutes, when they say so.* Send
   them the three games by name. They play each about ten minutes on their phone and say what was fun, what wasn't,
   and would they open it again. Ask at most two short questions, only to fill a gap (no "open again" answer, say).
   Write each game into Games I've Played in their exact words, newest first, then rewrite "What keeps showing
   up". They may answer in a later chat: start here with their notes. This play is their part: no AI can judge fun
   for them.
   - *Done when:* each game has an entry with their words, and "What keeps showing up" is current. Confidence: high.
4. **Make ideas; the person picks one.** *AI, then 1 minute of the person's.* Ideas stay in the chat: write none
   into a note. Otherwise you can make tens of thousands of ideas and keep tens of thousands of biases. Make two or
   three ideas, marked "(pitch)": two or three sentences, then one short line per question in `QUESTIONS.md`. Think
   outside the box: start from a fresh hook, not from pieces of the games in Games I've Played, and don't name those
   games in the pitch. Use their notes only to avoid what they didn't like. Pitch a whole idea, not half of one: what
   a whole round is like, and why that is fun every minute. Search Roblox for its core so it is not one game with a
   new skin. Ask which they'd build. A lesson from their answer goes into `QUESTIONS.md` as a new or changed
   question, never as a stored idea. "Decent, but not it": make a new set. Ask about step 2 only when they ask for
   more games to play; never push more play on them.
   - *Done when:* they named one idea they want to build. Confidence: medium.
5. **Write the idea card.** *AI. None of the person's time.* Only now make the note: `./os new note "<Idea name>"
   --domain games`. Under `## Idea card`, answer every question in `QUESTIONS.md` in full, by its rules. Below the
   card, put the dated riser list and their notes on the games it draws on (copied from Games I've Played, if they
   keep that note).
   - *Done when:* every question has an answer. Confidence: high for the first minute and return days (Roblox docs),
     medium for the rest.
6. **Run the stop checks.** *The person's part: 1 minute, for check a.* Put the card itself in the chat, not a
   path. They may change any line. One no stops the idea. Write each answer and why under `## Stop checks`. Checks
   a to e are the reference's five; f is a rule for every game made here. "Must work on Roblox" rests on questions
   1 and 9: built from live Roblox games.
   - a. Would the person play it for a week? Ask them. Never answer for them.
   - b. Own name, art and menus, with no borrowed characters, brands or memes?
   - c. Would it rate Minimal, Mild or Moderate?
   - d. Is progress more than "bigger numbers for money"?
   - e. Can the AI test most of it alone (logic, not feel)?
   - f. Does it work for one player and for a group, with bots in the empty places?
   - *Done when:* all six are answered. All yes: hand over. A no: one lesson into `QUESTIONS.md`, then step 4.
     Confidence: high for b and c (Roblox's rules), medium for the rest.

## Never

- **Write an idea into a note before the person wants to build or keep it.** Ideas pitched stay in the chat. One
  they say to keep or save gets its own note (`./os new note "<Idea name>" --domain games`) with the pitch, and one
  line in an Ideas I Like note in `Notes/`, if they keep one.
- **Ask the person to name what's missing, or what they'd change.** Most people can't, and judge well by playing,
  not by naming. Their notes are their part; making the idea is the AI's.
- **Recreate one game.** An idea that is one game with a new name or skin is a copy, theirs or anyone's. Roblox stops
  prioritising same-name, same-look copies: of 105 "Steal a" games, the original held about 92% of players.
- **Score ideas.** AI-scored idea rounds could not separate ideas, and the pick that got built turned out boring.
  The person picks; the grey box decides.
- **Play for the person.** No AI can judge fun. A game played only by scripts can grow big and
  still be dull.
- **Send them extra play.** Three games, about 30 minutes, and only when they say yes. Never build test versions of
  ideas for them to compare: it takes forever.
- **Build, plan or make models here.** Games built with no fun gate grow huge, turn out boring and never launch.
- **Walk past a no.** Only the person can overrule a stop: write their words and the date in the note.
- **Borrowed characters, brands or memes.** One person cannot absorb a takedown, and memes die.
- **Judge an idea by likes, visits or players at once.** None is a Home signal. They only pick what the person plays.
- **Pick a look, a colour or a price.** Those are the person's.

## Proof so far

- The research and its sources are in the reference. Roblox's rules change often, so check the dates.
- Weak spots: the odds are low and unpublished, and ideas from a thin Games I've Played lean toward its few kinds.
- After every use, add one dated line to "What we tried" in the reference. Add lines; never change one.

## Hand over

Next is `/build-game <Idea name>`. Its plan part plans from the note. After the person's yes its set-up part turns
the note into the game with `./os push`. It needs the note's name, a filled `## Idea card`, `## Stop checks` all
yes, and the person's notes on the games it draws on. Its Gate 1 is the grey-box test (the reference's step 6): the
verb only, in grey boxes, played by the person. A failed grey box comes back here: change the idea, not the polish.

## Done when

- Games I've Played has every game the person played this round, in their words, and a current "What keeps showing
  up" (or they keep no such note and said so).
- For an idea round: the note holds `## Idea card` with every line filled and `## Stop checks` with every check yes.
  Or the idea stopped, and the no and one lesson are written down.
- "What we tried" in the reference has a new dated line. On a pass, the person knows `/build-game` is next.
