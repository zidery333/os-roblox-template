---
name: game-ui
description: >-
  Make a Roblox game's screens and first three minutes clear and rewarding on a phone, with two scores per screen.
  Use when the person says game ui, do the UI, make the screens, redo the UI, the UI looks bad, fix the HUD, make the
  menus, the buttons are hard to press, or onboarding.
argument-hint: "<game name> [screen or step]"
---
# Game UI
Make a game's screens and its first three minutes clear and rewarding on a phone. Start only after the grey-box gate
has passed (/build-game, Gate 1). Its jobs become `Plan.md` steps that /build-game builds, one at a time. "Top tier"
here means clear and rewarding in the first three minutes at phone size, then good-looking. Detail and sources:
`REFERENCE.md` beside this file.

Every screen gets two scores, never mixed. **Works**: the AI proves it with a scripted click path, a clean console and
script checks. **Looks right on a phone**: only the person, from phone-size screenshots and a real-phone pass. An AI
pass is not proof of the second (Roblox says its agent gives false passes): a screen that looks bad gets redone.

Same on Mac and Windows: on Windows, `./os` and the checks run in WSL, and Roblox Studio runs on Windows.

## Before you start
- Read the About me note in `Notes/`, if there is one (nothing here may break a line in it), and "What we tried" at
  the end of `REFERENCE.md`.
- A dated number more than a month old: open its source again before you use it. Roblox's rules change often.
- `Work/<Game>/Plan.md` must show Gate 1 passed, on a date the person gave. No date: say so in one line and stop.
- Read "Studio and the MCP" in `.claude/roblox/LESSONS.md`; search it for "thumbstick". Real mistakes: they still hold.
- Many calls here changed in 2025-26, after the AI's training: read each one's doc page ("Sources") before first use.

## Steps
Step 1 is once ever; 2-4 and 10 once per game; 5-9 on each screen; 11 on each UI step; 12 on each release. Show the
person one change, one picture, one question at a time. Send the picture itself, never just a path. Read "Not settled
here" first.
1. **Test the tools once.** With Studio open, check four things: the MCP skill `rbx-device-simulator-lua` sets a
   phone; `screen_capture` shows screen UI in play; `Color3:GetContrastRatio` exists; Open Cloud can create products
   and badges. LESSONS.md has fallbacks for the first two. The fourth makes a real product and badge: it waits for the
   person's yes, their price and their MCP money permission (step 10). *Done when:* each is a written yes or no in
   "What we tried".
2. **Study this month's chart.** Pull the Top Playing Now API and the pass, product and badge lists of the 3 closest
   new rivals. **The person, 30-45 min:** screen-records each one's first 3 minutes. *Done when:* a note per game
   covers its first 60 seconds, HUD and reward moment. Medium confidence: it shows what is sold, not why a game wins.
3. **Plan the opening as two windows.** A reward before 60 seconds. The first full loop before 180. Finishable alone:
   bots may fill the empty places. Name 5-8 funnel steps, one in each window. *Done when:* a scripted first-session
   test hits first reward under 45 s and first loop under 150 s. Those margins are our own, to leave room for loading.
4. **Make one house UI kit, one look per game.** One token table holds every colour, text size, padding and button
   state. Trial Roblox style sheets on one screen, built in Luau code, not Rojo files; else a plain Luau table. If
   the person has a look they already approved in another game, look at it for a start, never copy it blind.
   *Done when:* the person has picked one of 2-3 real sample screens (**the person, 5-10 min**) and no screen strays
   from the tokens.
5. **Lay out for thumbs and safe areas.** Buttons stay on the default `CoreUISafeInsets`. Keep both bottom corners
   clear; anchor action buttons to the jump button if shown. Tap targets at least 9 x 9 mm. Size with Scale; use
   `ViewportDisplaySize` buckets for mode choices, never pixel counts. Show only what the moment needs. *Done when:*
   script checks find nothing clickable in a `ScreenInsets = None` ScreenGui or thumb zone on phone, tablet and
   desktop.
6. **Wire input the current way.** Pick the UI mode from `UserInputService.PreferredInput` and listen for changes.
   Bind each action once in the Input Action System, one binding per source. Glyphs from `GetImageForKeyCode`.
   *Done when:* no `TouchEnabled` or new `ContextActionService` code is found; the person taps each touch button in
   step 12's phone pass.
7. **Make text readable.** Words get a set `TextSize`, `AutomaticSize`, `TextWrapped` and a `UITextSizeConstraint`,
   never under 9. `TextScaled` is for short numbers only. Text sits on a solid backing or carries a stroke. Icons over
   words. **The person, once ever, 20 min:** picks the minimum text height, the HUD element cap and the UI sounds on
   their phone. *Done when:* a script check passes 4.5:1 contrast and that minimum height at phone size.
8. **Build the look from native effects.** Strokes, per-corner rounding, shadows and gradients replace most uploaded
   pictures. Upload only item and currency art, with the person's yes per batch: 1024 px or less (medium confidence),
   thick outline, no baked-in words. /make-model makes every UI picture (icons, item art), only when the person starts
   a model chat. Until then a screen uses plain shapes and text. Paid picture tools need the person's own account,
   cost credits, and are asked about before every use. *Done when:* on-screen counts stay under 300 strokes and 100
   shadows.
9. **Onboard by showing.** No tutorial screen. One highlighted control at a time. Explain a feature when the player
   first meets it. Give feedback on every tap. Show a hint only to players who have not acted: start at the person's
   first-run time plus a few seconds, kept in config. One shared feel module: 0.4-0.5 s eased tweens (low confidence),
   honouring `ReducedMotionEnabled`. *Done when:* step 3's test passes; the person feels it in step 12's phone pass.
   Medium confidence.
10. **Keep the shop small and legal.** Build it when `Plan.md` calls for money. **The person, 5 min per game:** MCP
    money permission, Shop button on, console and VR off. The person says what to sell and each price; the reference's
    start is low confidence. No pop-up on first load, never two stacked. Nothing random for Robux or Robux-bought
    currency without exact odds shown (totalling 100%) and a `PolicyService` check. *Done when:* `ProcessReceipt`
    passes its test.
11. **Run the check loop on every UI step.** Build, set phone size, play, screenshot, scripted click path, console,
    script checks. Then send the person the phone-size screenshots. **The person, 2 min per new screen:** yes, or
    what is wrong. *Done when:* console clean, checks pass, the person said yes. Report the two scores apart.
12. **Publish, measure, fix the biggest drop.** Only the person publishes (/market-game). **The person, 10-15 min per
    release:** the phone pass: stopwatch the join, play 3 minutes, tap every button with both thumbs. **The person,
    15 min each, before launch:** watches 2-3 friends play (once: /market-game step 3 too). Log funnel and economy
    events on the server from the first published build, never a later step from a path that skips earlier ones.
    Numbers to tune go in Experience Configs. Read the bounce bins under Analytics > Acquisition > Home
    Recommendations. Rule out crashes and slow joins before blaming design. No A/B tests below about 1,000 daily
    players. *Done when:* each release is compared with the game's own earlier weeks. Under about 100 first sessions a
    drop is only a hint (our caution, no source).

## Never
- Start before Gate 1 has passed. Games with no fun gate tend to grow big, turn out boring and don't launch.
- Take an AI pass, or the AI's view of its own screenshot, as proof. Roblox says its agent gives false passes.
- Pick a colour, style or look, or make or download a picture. The person picks from real versions.
- Choose the UI with `TouchEnabled`: it is true on touch laptops and handheld PCs.
- Put buttons in a ScreenGui with `IgnoreGuiInset` or `ScreenInsets = None`: they can land under the top bar or a notch.
- Use `TextScaled` on words: it ignores the player's Text Size setting, and the words can come out tiny.
- Trust the Device Simulator for memory, speed or tap feel. A button can fire by itself on a real phone.
- Ship `InputActionLabel`, UI blur or AnimatedImages (unreleased), BuilderIcons (unofficial) or a UI library (unproven).
- Publish, pay or set a price: those are the person's alone. Never ask for an API key in chat.

## Not settled here
Steps 4-6 give the reference's side. Where LESSONS.md or the game's Lessons differ, theirs holds until a trial on one
screen shows the other works too. Log each trial in "What we tried". Build details: never ask the person to judge them.
- UI along the top: its own `TopbarSafeInsets` ScreenGui (LESSONS.md), or every button on `CoreUISafeInsets`.
- Sizing: a `UIScale` tied to view height, or Scale sizes with `ViewportDisplaySize` buckets.
- Touch buttons: fire only on a clear tap, never `Activated` alone, or an Input Action System binding.
- Settled: a screen is made by a rebuild script in the game's `Tests/` folder (named like `<Screen>.studio.luau`), run
  through the MCP into StarterGui and reading the tokens. Never a hand edit that the next rebuild would wipe.
- The token table is the game's own style file under `Code/Shared/Config/` until one look has the person's yes
  across two games.

## Proof so far
- Research of 2026-11-15 (three researchers, two checkers, one writer); nobody saw a top game's real screens. The
  LESSONS.md screen rules are advice, not proof. Not yet run on a real game in this folder.
- After every use, add one dated line to "What we tried" in `REFERENCE.md`: what was done, on which game, what happened.

## Hand over
- To /build-game: the token table, script checks, first-session test, and each UI job as a `Plan.md` step (their yes).
- To /make-model: the pictures wanted and their pixel sizes; the person starts that chat. Back in `UI Kit/<Set>/`.
- Next is /market-game. It needs each screen's two scores and the funnel step names. It sends back its weakest number.

## Done when
- The first-session test passes: first reward under 45 s, first loop under 150 s, finishable alone.
- Every screen has two scores: "works" proven by the AI, "looks right on a phone" as the person's own dated yes.
- The person did the phone pass on this release, and "What we tried" in `REFERENCE.md` has a new dated line.
