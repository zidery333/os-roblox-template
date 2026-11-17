# The plan part

A part of `/build-game`. Read it when the game has no one page yet, the next gate has no steps written, or
the person wants an older game re-gated. Do "Before you start" in `SKILL.md` first. The method and its sources
are in `REFERENCE.md`, beside this file.

Turn an idea card into one page: the loop, the one difference, four gates, a kill line and dates. Then write
out the features for the next gate only. Good looks like: the person reads it in one go, says yes, and the
build loop in `SKILL.md` can start Gate 1 from it with no more questions. This part writes no game code.

## Steps

The person's times are a checker's estimates, not sourced. Ask them one question at a time.

1. **Find the card.** It is `## Idea card` in the idea's note (`./os find "<name>"`), or in
   `Work/<Game>/README.md` once the set-up part (`SETUP.md`) has run. No card, or a stop check there that is
   not yes: stop and run `/game-idea`. An older game with only an `## Idea check`: `/game-idea` steps 5 and 6
   write its card first, from the game as it is now. Done when: you have read the card, the stop checks and
   the person's own lines in that file.
2. **Fill the one page (the person: about an hour, only if they have not yet played three reference games).**
   Take `ONE-PAGE.md` (beside this file) and fill each line from the card: the loop in three words (do, repeat,
   grow), the loop borrowed, three reference games the person played, the one difference, one line per thing
   Home measures (first 60 s, first 180 s, days 2-7, days 8-28, invite, spend), and release 1 as one loop in
   one area. A blank the card can't fill is a question for the person, not a guess.
   Done when: it fits one page and the difference is named. No difference named means no build.
3. **The person sets the kill line and the dates (about 5 minutes).** Three questions: what makes us stop this
   game, when do we review it, what is the ship date. You may show the house rule as one choice: "under the
   middle of the dashboard band on D1 and session time twice: stop" (low confidence: nobody has published a
   tested kill number). The ship date is their own guess: no source says how long a solo AI-built game takes.
   Later, cut scope, not the date. Done when: all three are on the page in their words.
4. **Write the economy as numbers.** On the page: every source and sink, and what the first upgrade costs.
   You propose these starting numbers; the person sees them in step 7, and a test checks them. The code is not
   this part's job. It is Gate 1's first feature: a pure module in `Code/Shared/Logic/`, its numbers in
   `Code/Shared/Config/`, and a test in `Tests/` that plays out 60 minutes and shows the first upgrade is
   affordable inside the first session. Done when: the page's Economy line has no blank.
5. **Fill the gates table.** Four gates, each with who passes it:
   - **Gate 1, grey box.** Only the core loop: no models, no menus, no saving, no shop. `./check.sh` and a
     scripted playtest pass, with the first action inside 60 seconds. Then **the person plays about 15
     minutes** and answers four questions: want another go? a choice that mattered? a reason to return
     tomorrow? can they say the hook in one line? A pass needs a yes to "want another go" and at most one "no"
     in all. A fail means back to `/game-idea`, not more building. (The four questions are a house rule.)
   - **Gate 2, real players.** First a phone run and one watch of 2-3 friends (15 minutes each). Then the
     person publishes to 16+, which lists no fee (page, thumbnail, first players: `/market-game`). The
     players' numbers pass it: D1 (back the next day) and session time reach the middle of the game's own
     dashboard band (halfway between its 50th and 90th lines), read for Home players, never blended with ad
     players. Until the band shows, compare funnel completion between rounds. At the top: put all hours here.
     Under the middle twice: stop, if the person's kill line says so; only the person stops a game. They
     review 10-14 days after players start coming (Home can show nothing for weeks: not a fail). Two fix
     rounds at most. Low confidence: a house rule.
   - **Gate 3, progression.** Players' numbers pass it: D7 (back a week later) is inside the band. Medium confidence.
   - **Gate 4, money and all ages.** A starter pack and one or two passes, then the content questionnaire,
     the 1,000 Robux fee and 250 highly engaged plays in 60 days, counted by Roblox. The person pays and sets
     every price. A cut from 250 to 100 was announced but not seen live: read the Audience Reach tab.
   Done when: the table has all four, and no gate has a "passed on" date that the person did not give.
6. **Write the features for the next gate only.** One feature per build step. Each has **What** (one
   sentence), **Done when** (what the person will see or be able to do), **Test** (what the AI proves: the
   `Tests/` file, numbered player actions, the state it expects, a screenshot), **The person checks** (their
   exact steps and the minutes) and `Status: todo`. A model is a named stand-in. Gate 1 opens with step 4's
   economy module. Later gates: `REFERENCE.md` steps 6-12. Done when: each feature has all five lines; no later
   gate is written out.
7. **Show the person, then write it (one read, one yes).** Put the page itself in the chat, not a path. Ask
   one thing: build this gate? On yes: no `Work/<Game>/Plan.md` means run the set-up part (`SETUP.md`) now
   (never make a game folder by hand). Then fill `## The one page`, `## Gates` and `## Steps` in `Plan.md` and
   take out its "Not written yet" line. An old plan with its own steps: add the page and the table at the top,
   and ask the person before changing anything below. `## Sizes` gets only what the gate needs and the person
   has said. Then `./os decide "<Game>" "<kill line and dates>"` (first run only) and
   `./os checkpoint "<Game>: plan, gate <N>"`.
   Done when: the person said yes, and `Plan.md` holds the page, the table and the gate's features.

## Never

- **Write a design document.** One page. Why: long plans get written and no game launches.
- **Plan past the next gate in detail.** Later gates stay one table row each. Why: after the first play of a
  game, large parts of its full plan get replaced within a day.
- **Let a build go past a gate the person has not passed, or count "checks pass" as "worth playing".** The
  whole rule is in `SKILL.md`, "Never"; an away run stops at the gate too (`AWAY.md`). Why: a skipped
  playtest hides a dull game, and games with no fun gate tend to grow big and turn out boring.
- **Put models, UI polish or money in Gate 1.** Models are made only when the person starts a model chat.
- **Make a design choice for the person.** Ask, and confirm any card line marked "(pitch)": that one is the
  AI's. Why: picks marked "can change" got built on with no yes from the person.
- **Write a fixed D1 percent as Roblox's target.** Roblox publishes none. Use the game's own dashboard band.
- **Plan growth on ads, A/B tests or weekly updates.** Players first got by an ad never count for Home. A/B
  tests need 500-1,000 daily players. Weekly updates are more than one person can keep up.
- **Plan for a chat to publish, pay or set a price.** Those are the person's.

## Hand over

- Next is the build loop in `SKILL.md`, for Gate 1. No game folder yet means the set-up part first (step 7).
  The loop needs: the one page at the top of `Plan.md`, the gates table, and Gate 1's features with all five
  lines each.
- When the person passes a gate, run this part again: write the date they gave in the table, then steps 6 and 7.
- Other skills (`/game-ui`, `/make-model`, `/market-game`, `/game-idea`): "Hand over" in `SKILL.md`.

## Done when

- The plan fits one page, names the one difference, has four gates with who passes each, and the person said yes.
- The kill line, review date and ship date are theirs, written down with `./os decide`.
- Only the next gate's features are written out, each with What, Done when, Test, The person checks and Status.
- "What we tried" in `REFERENCE.md` has a new dated line.
