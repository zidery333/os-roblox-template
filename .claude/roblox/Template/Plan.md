# {{GAME}}: the plan

Written in the planning chat with the person making the game. Steps are built one at a time, in this
order. A step is done when its "done when" is true, `./check.sh` passes, the playtest is clean, and the
person has seen it.

## The game in three sentences

<!-- Who you are and what you do. What makes it tense or fun. Why you come back. -->

## Sizes

<!-- In studs: the player, the main things, the map. Fixed before building. -->

## Core loop

<!-- What the player does again and again, one line each, ending with why they come back. -->

## Rules for every step

- Look: <!-- the style they picked, with a picture or a link -->
- Stand-ins: until a real model exists, a plain block of the right size and name in
  ReplicatedStorage.Models, so the real one swaps in with no code change.
- Test panel: Studio-only, folded by default. Each step adds the buttons it needs.
- The server decides every <!-- money, item, result -->. The client only asks.
- Phone, computer or both: <!-- which -->
- Never happens: <!-- the things they said must never happen -->

## Steps

<!-- One feature each, smallest playable thing first. Copy this block per step.

### 1. <name>
- What: <one sentence>
- Done when: <what the person will see or be able to do>
- Test: <which Tests/ file and what it checks; what the playtest checks; what the person checks>
- Status: todo

When a step is done: "Status: done. <files>, screenshots <paths>", plus "Still owed: ..." for anything
left (a two-player check, a sound check). A bug found later gets a new step (6b), never a rewrite.

-->
