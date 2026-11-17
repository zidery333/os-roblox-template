# {{GAME}}: the plan

Not written yet. The plan part of `/build-game` writes the one page, the gates and the features for the next gate here.
A step is done when its "done when" is true, `./check.sh` passes and the playtest is clean.
A gate is passed only when the person has played it and given the date. Nothing past a gate gets built before that.

## The one page

<!-- The plan part of /build-game fills this from `.claude/skills/build-game/ONE-PAGE.md`. One page, never more. -->

## Gates

<!-- Gate, what it proves, who passes it, passed on. Gate 1 is the core loop in grey boxes, played by the person. -->

## Sizes

<!-- How big the player, the main things and the map are, in studs. Only what the next gate needs. -->

## Steps

<!-- One feature each, only for the next gate. Copy this block per step.

### 1. <name>
- What: <one sentence>
- Done when: <what the person will see or be able to do>
- Test: <which Tests/ file and what it checks (a Logic module's test is `Tests/<Module>.spec.luau`); what the playtest proves, with a screenshot>
- The person checks: <the exact steps they do, and how many minutes>
- Status: todo

When a step is done: "Status: done. <files>, screenshots <paths>", plus "Still owed: ..." for anything
left (a two-player check, a sound check). A bug found later gets a new step at the end, never a rewrite of a done one.

-->
