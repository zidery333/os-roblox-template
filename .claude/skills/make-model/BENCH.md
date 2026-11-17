# The bench: how /make-model gets better by itself
This skill's own design, not run yet: both tables are empty. Built on the "proving day" (step 3) and the one-time "tool
bake-off" ("What needs the maker themselves") in `ROUTES.md`. The aim: the AI gets better at making models, and learns
from every try. `SKILL.md` steps 2, 8 and 9 use it.

**The honest limit.** No AI can judge looks. The person's pick is the only signal for taste. The AI makes, checks,
counts and cuts by itself, but without their minutes on each bench run nothing is learned.

## The two numbers
Neither has a value yet. No target is set: the only test is whether a number moved since the last count.
- **Tries to yes.** How many drafts the person saw up to their yes, by role and by route: a yes on the first draft is
  1. Lower is better. A model dropped with no yes is written `no yes (N)`, and counts against its route.
- **First-time pass.** Of all drafts built, the share that passed every scripted kit check on the first run, with no
  fix in between. Higher is better. The checks: `inspect-glb.mjs` against the row's size and budget,
  `check-planes.mjs`, `check-open-edges.mjs`, `check-ground.mjs`, and `check-banned-colours.mjs` if a colour is banned.

## The five bench subjects
Fixed: they never change, so one run can be compared with the next. No line names a colour or a style. Sizes are wide,
tall, deep in studs, and are this bench's own choice. Budgets are the working budgets in `ROUTES.md`.

| # | Subject | Role | Studs | Triangles | Routes |
| --- | --- | --- | --- | --- | --- |
| B1 | A wall piece with one window opening | kit | 10, 10, 1 | under 500 | 1, 2, 3 |
| B2 | A crate with plank sides | filler, blocky | 3, 3, 3 | under 2,000 | 1, 2, 3 |
| B3 | A round jug with one handle | filler, curved | 3, 4, 3 | under 2,000 | 2, 3 |
| B4 | A fox standing on four legs | character | 2, 3, 4 | under 2,000 (borrowed) | 2, 3 |
| B5 | A treasure chest whose lid opens | hero | 4, 3, 3 | under 10,000 | 1, 2, 3 |

- Route 1 never makes B3 or B4: code-built curved things and creatures come out blocky. Route 4
  joins a run only with the person's yes on the cost first (it needs their own account and costs money).
- B4 borrows the prop budget: `ROUTES.md` sets none for creatures. It has no rig: that is unsure (`ROUTES.md` step 6).
- Part names: B4 `Body`, `Head`, `Tail`, `Leg_Front1`, `Leg_Front2`, `Leg_Back1`, `Leg_Back2`. B5 `Base`, `Lid`.

## A bench run
Only in a model chat the person started, and only on their yes: say a run is due and what it asks of them (step 4).
With no game past Gate 1, say that too. Bench models never go into a game. Ask before the kit's `npm install`, a
download.
1. **Make.** One subchat per route makes each of its subjects once. Its brief: the subject rows, the bench look,
   `LESSONS.md`, "How to build it" step 1 in `REFERENCE.md`, and: one build each, show nothing, save nothing in a
   game folder, send back each file, its triangles and minutes. Route 2 is `generate_mesh`;
   `generate_procedural_model` may add its own B1 and B2. *Done when:* each draft exists or its failure is noted.
2. **Check.** The main chat runs the kit's checks on every draft and notes its triangles. Fix nothing: the bench
   measures the route. A draft that fails a check stays off the sheet ("not shown" in its row): the person never sees
   a flaw we already know about. *Done when:* each draft has its "checks passed", like "3 of 4".
3. **One sheet per subject.** Phone size, the routes side by side, shot the same way, marked only A, B, C
   (`kit/view-look-sheet-page.mjs`: several .glb in one row, a label over each). Shuffle the letters per subject, name
   each file by its letter and keep the key in your scratchpad: a blind pick. *Done when:* no sheet gives a route away.
4. **The person picks (their part of a run: about 5 to 10 minutes, not yet measured).** Send each sheet itself, one at
   a time, with one question: "Which is best, and what is wrong with the others?" They may say none. A sheet bends
   "one draft, one picture, one question": if they find it hard, show one draft at a time. *Done when:* each sheet
   has their answer.
5. **Write it down.** One dated row per draft in "Bench results", their words quoted. A route wins a subject when they
   picked its draft. They said none: nothing wins, and the stand-in stays. Write each winner into "Route today" in
   `SKILL.md`. Add one dated line to "What we tried" in `ROUTES.md`. *Done when:* the rows are in.

Not worked out yet. The first run settles each one and writes the answer here:
- **The bench look.** No chat picks a colour or style for the person. Before the first run, ask them once which look
  the bench uses, with pictures of looks they have already said yes to. Every route then gets that one style line.
- **Studio drafts.** No Studio tool gives a .glb, so a route 2 draft has no kit checks, no spin page, no shot shared
  with the other routes and no file for step 8 of `SKILL.md`. On the bench: read its size and triangles in Studio,
  write "not run" for the other checks, and tell the person which draft is Studio's: its shot differs, so that pick is
  not blind. A .glb gets into Studio only by an upload. Before route 2 makes a game model, ask the person how one is
  kept.
- **Their minutes.** The research guessed 30 to 45 minutes for a bake-off judged in Studio. Time the first run.

## When to run it
- "Bench results" is empty: the first model chat.
- A tool changed: a new Studio generator, a new kit builder.
- Tries to yes went up from one model chat to the next. The count then writes "bench due" in "What we tried".

## The learning rules
- **Every model gets a row** in "Models", saved or dropped: route, tries to yes, their words. No row is ever changed.
- **A lesson line names the try it came from:** `(<game>, <id> try <n>)`. No try, no line.
- **The count, at the end of each model chat.** The main chat counts tries to yes per role and route from "Models", and
  first-time pass from the subchats' draft messages. It writes both in that day's "What we tried" line and compares
  them with the last chat's. Worse: find the lesson or change made since then that did it, and take it out.
- **A lesson is cut** when no draft has used it in 20 models, or when the bench shows it makes no difference. Each
  subchat names the lines it used, and the main chat marks them `used <model id>` at the line's end. To test one
  line: the same route makes one subject twice, with it and without, as two letters on a sheet. The person cannot
  tell them apart, or picks the one without: cut it.
- **Before any cut,** run `./os checkpoint` so the line can be brought back, and say in "What we tried" which lines went.
  A line that holds the person's own rule (their words, a never or an always) is cut only on their yes.
- **A rule a script can check** becomes a kit check, and its line is cut. Twin lines are merged into one.
- **`LESSONS.md` may not grow without proof.** A lessons file can grow a lot while approved models fall to none:
  that is a warning. Count it at every close. It grew and no number got better: the newest lines go.

## Bench results
| Date | Subject | Route | Triangles | Checks passed | Minutes | Person's pick | Their words |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Models
| Date | Game | Model | Role | Route | Tries to yes | Their words |
| --- | --- | --- | --- | --- | --- | --- |
