<!-- Researched 2026-11-15: three researchers per job, two checkers who tried to knock each claim down, one writer. Roblox's rules change often: re-read any dated number older than a month before leaning on it. -->
# GUI and player experience: the method (2026-11-15)

## The short version

- Judge every screen at phone size first: 83% of Roblox daily users are on mobile.
- "Top tier" means clear and rewarding in the first 3 minutes, not ornate. Home ranking counts new players who leave in under 60 seconds or within 180.
- AI builds UI as plain instances from one shared kit, then screenshots, clicks and script-checks it. The person approves looks and does a real-phone pass.
- Measure with an onboarding funnel from the first published build. No A/B tests below about 1,000 daily players.
- The right APIs changed in 2025-26, after the AI's training: read the doc page before first use.

## Steps

1. **Test the tools once.** With Studio open, check: the MCP skill `rbx-device-simulator-lua` sets a phone; `screen_capture` shows screen UI in play; `Color3:GetContrastRatio` exists; Open Cloud can create products and badges. *Done when:* each is a written yes or no. Confidence: high.

2. **Study this month's chart.** Pull the Top Playing Now API and the pass, product and badge lists of the 3 closest new rivals. The person records each one's first 3 minutes. *Done when:* a note per game covers its first 60 seconds, HUD and reward moment. Confidence: medium (shows what is sold, not why a game wins).

3. **Plan the opening as two gates.** A reward before 60 seconds; the first full loop before 180; finishable alone. Name 5-8 funnel steps, one in each window. *Done when:* a scripted first-session test hits first reward under 45 s and first loop under 150 s (our margins, leaving room for loading). Confidence: high on windows, medium on margins.

4. **Make one house UI kit, one look per game.** One token table: colours, text sizes, paddings, close button, disabled and locked states, price colours. Trial Roblox style sheets on one screen, built in Luau code, not Rojo files; else use a plain Luau table. *Done when:* the person has picked one of 2-3 sample screens and no screen uses a value outside the tokens. Confidence: medium.

5. **Lay out for thumbs and safe areas.** Interactive ScreenGuis keep the default `CoreUISafeInsets`; `ScreenInsets = None` only for backgrounds. Keep both bottom corners clear; anchor action buttons to the jump button if default controls show. Tap targets at least 9 x 9 mm. Size with Scale; use `ViewportDisplaySize` buckets for mode choices, never pixel counts. Show only what the moment needs. *Done when:* script checks find nothing clickable in a `None` ScreenGui or over a thumb zone, on phone, tablet and desktop screenshots. Confidence: high.

6. **Wire input the current way.** Pick the UI mode from `UserInputService.PreferredInput` and listen for changes. Bind each action once in the Input Action System, one binding per source. Glyphs from `GetImageForKeyCode`. *Done when:* a source check finds no `TouchEnabled` or new `ContextActionService` code, and each touch button was tapped on a real phone. Confidence: high.

7. **Make text readable.** Words get a set `TextSize`, `AutomaticSize`, `TextWrapped` and a `UITextSizeConstraint`; never under 9. `TextScaled` only for short numbers. Text sits on a solid backing or carries a stroke. Icons over words. *Done when:* a script check passes 4.5:1 contrast and a minimum text height at phone size. Confidence: high on the rule; nothing ties it to retention.

8. **Build the look from native effects.** Strokes, per-corner rounding, shadows (text shadows since 2026-11-05) and gradients replace most uploaded images. Upload only item and currency art: 1024 px or less, thick outline, no baked-in words. *Done when:* on-screen counts stay under 300 strokes and 100 shadows. Confidence: high on limits, medium on 1024 px (community source).

9. **Onboard by showing.** No tutorial screen: Roblox says long tutorials make players quit. One highlighted control at a time, features explained when first met, feedback on every tap, a hint only for players who have not acted (start at the person's first-run time plus a few seconds, in config). One shared feel module, 0.4-0.5 s eased tweens, honouring `ReducedMotionEnabled`. *Done when:* step 3's test passes and the person has felt it on their phone. Confidence: medium (guidance, not measured); low on tween times.

10. **Keep the shop small and legal.** Turn on Roblox's built-in Shop button; write `ProcessReceipt` with a test. Version one: 1-2 permanent x2 passes, one very cheap first item, 5-8 products at real friction points, prices in config. No pop-up on first load, never two stacked. Nothing random for Robux or Robux-bought currency unless exact odds (totalling 100%) are shown and `PolicyService` is checked. *Done when:* the purchase test passes. Confidence: high on rules, low on price patterns.

11. **Run the check loop on every UI step.** Build, set phone size, play, screenshot, scripted click path, console, script checks. Score "works" and "looks shippable on a phone" separately. *Done when:* console clean, checks pass, and the person has said yes to the screenshots. Confidence: high.

12. **Publish, measure, fix the biggest drop.** Log funnel and economy events server-side from the first published build; never log a later step from a path that skips earlier ones. Tunables go in Experience Configs. Read the bounce bins under Analytics > Acquisition > Home Recommendations. Rule out crashes and slow joins before blaming design. *Done when:* each release is compared with the game's own earlier weeks. Under about 100 first sessions, a drop is only a hint (our caution, unsourced). Confidence: high.

## Numbers to aim at

| What | Number | Source |
| --- | --- | --- |
| Daily users by device | 83% mobile, 14% desktop, 3% console | Roblox 10-K FY2025 |
| Typical device | about 65% Android; about 60% of those on 2-4 GB RAM (rough) | Roblox hardware guide |
| Bounce windows | under 60 s, 61-180 s; no pass mark published | Discovery doc |
| Day 1 retention (unsure) | 10% typical, 13-16% strong, 20%+ rare; Roblox's own example range is 12-19% | GameAnalytics 2026; Roblox dashboard doc |
| Touch target | at least 9 x 9 mm | Roblox UI curriculum |
| Text | size 9 minimum; contrast 4.5:1 (3:1 large text) | TextLabel reference; W3C |
| On-screen budget | under 300 strokes, 100 shadows, 1,000 gradients | Roblox staff posts |
| Traffic floors | 100 daily players for benchmarks; 1,000 for experiments; 2,000 monthly visitors for rewarded ads | Creator Hub docs |
| Typical test win | 1 in 4 significant, about 5% playtime | Roblox staff post |

## What needs the person themselves

- Once: age check, ID verification, 2-step verification. 15-20 minutes.
- Once: pick minimum text height, HUD element cap and UI sounds on their phone. 20 minutes.
- Per new game: screen-record the 3 newest similar chart games. 30-45 minutes.
- Per game: pick the look from 2-3 sample screens. 5-10 minutes.
- Per game: publish flow, MCP money permission, Shop button on, console and VR off. 5 minutes, plus 1,000 Robux or a subscription for all-ages reach.
- Per new screen: yes or no on phone-size screenshots. 2 minutes.
- Per release: phone pass. Stopwatch the join, play 3 minutes, tap every button with both thumbs. 10-15 minutes.
- Before launch: watch 2-3 friends play as early testers. 15 minutes each.

## Never do

- Choose the UI with `TouchEnabled`. It is now true on touch laptops and handheld PCs.
- Put buttons in a ScreenGui with `IgnoreGuiInset` or `ScreenInsets = None`. They can land under the top bar or a notch.
- Use `TextScaled` on words. It ignores the player's Text Size setting.
- Take an automated "Pass", or the AI's view of its own screenshot, as proof. Roblox says its agent gives false passes and AI is weakest at UI polish.
- Trust the Device Simulator for memory, speed or tap feel. Roblox says it does not replace a real device.
- Ship `InputActionLabel`, UI blur or AnimatedImages. None is released for live games yet.
- Rely on the BuilderIcons font or add a UI library. The font is unofficial; no source shows a library helps.

## Where good sources disagree

- **How fast.** Roblox's retention doc says fun within 5 minutes; its ranking measures 60 and 180 seconds. Use the stricter.
- **Polish.** One record hit launched looking like a prototype; Roblox's grading of AI-built games fails a prototype look. Clarity first, then looks.
- **A bad start.** Roblox says no penalty; signals sit in a 28-day window and developers doubt it. Recoverable, not free.
- **Shops.** Roblox advises fair, unstacked offers; top games sell 100+ products and paid timer skips.
- **TextScaled.** Roblox's UI tutorial turns it on; its accessibility page and TextLabel reference say avoid it.

## What nobody knows yet

- What today's top games' screens look like. No researcher could see them.
- How much visual polish alone moves retention.
- Whether the 60-second clock starts at the join click or after loading.
- Whether Claude Code can switch the Device Simulator through the MCP, and whether style sheets survive Rojo.
- Roblox's signal weights, a good bounce rate, font sizes per device, edge margins.
- Not researched: in-world UI, touch camera settings, UI sounds, loading screens, translation length, browser play, the 2027 chat change.

## Sources

Writer's note: Every source below was opened by a researcher or a checker on 2026-11-15; where a checker corrected a researcher, the checker's version is used. Creator Hub doc pages carry no page date ("undated" = read live on 2026-11-15). Nothing here is older than 2024. No first-hand maker interviews or RDC talks were available to any run (search was off).

Audience and ranking
- https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm - Roblox Corp Form 10-K FY2025 - 2026-02-11 - 83/14/3 device split of daily users; 44% of revenue through the two mobile stores.
- https://create.roblox.com/docs/videos/hardware-testing-guide - Hardware Testing Guide (Roblox video transcript) - 2026-06-16 - about 65% Android, 10-15 minute sessions, keep UI off screen edges.
- https://create.roblox.com/docs/performance-optimization/test-on-hardware - Test on hardware - undated - 2-4 GB RAM share; emulator does not replace a real device.
- https://create.roblox.com/docs/discovery - Discovery - undated - first play bounce rate (under 60 s, 61-180 s) is in the top signal group.
- https://create.roblox.com/docs/discovery-faq - Discovery FAQ - undated - "no penalty", daily re-test, ad-acquired players excluded.
- https://devforum.roblox.com/t/4684575 - Recommended For You Algorithm Improvements That Better Value Long-Term Retention (staff) - 2026-06-15 - bounce signal added; 28-day window.
- https://create.roblox.com/docs/production/analytics/retention - Retention - undated - the looser "5 minutes or less" advice.
- https://devforum.roblox.com/t/boost-your-discovery-by-building-games-people-want-to-play/4779042 - Boost Your Discovery by Building Games People Want to Play (staff) - 2026-08-06 - clarity and fun before single metrics.

Onboarding and measuring
- https://create.roblox.com/docs/production/game-design/onboarding-techniques - Onboarding techniques - undated - visual cues, contextual tutorials, timed hints, feedback on every action.
- https://create.roblox.com/docs/production/game-design/onboarding - Onboarding - undated - end on a reward, starter items, low early thresholds.
- https://create.roblox.com/docs/production/analytics/funnel-events - Funnel events - undated - server-only, published games only, skipped steps count as done.
- https://create.roblox.com/docs/production/experiments - Experiments - undated - under 1,000 daily players "might struggle"; 14-60 days.
- https://devforum.roblox.com/t/running-successful-experiments-insights-from-top-creators/4549276 - Running Successful Experiments: Insights from Top Creators (staff) - 2026-03-31 - 1 in 4 tests significant, about 5% lift.
- https://create.roblox.com/docs/production/configs - Experience configs - undated - live-tunable values.
- https://www.gameanalytics.com/reports/2026-roblox-report - 2026 Roblox Benchmark Report (GameAnalytics) - 2026-09-01 - Day 1 percentiles (second-hand, definition not stated).
- https://create.roblox.com/docs/production/analytics/analytics-dashboard - Analytics dashboard - undated - 100 daily players for benchmarks; example range 12.11-18.73%.

Layout, input, text
- https://devforum.roblox.com/t/full-release-introducing-preferredinput-and-improved-touch-capabilities/3750890 - [Full Release] Introducing PreferredInput and Improved Touch Capabilities (staff) - 2025-06-17, full release 2025-10-14 - PreferredInput; TouchEnabled true on hybrid devices.
- https://devforum.roblox.com/t/client-beta-input-action-system-is-now-available-to-publish-in-experiences/3890979 - Input Action System thread (staff) - 2025-08-20, full release 2026-06-11 - one source per binding; ContextActionService to be sunset, no date.
- https://devforum.roblox.com/t/studio-beta-no-code-hotkey-hints-with-inputactionlabel/4779420 - [Studio Beta] No-code Hotkey Hints With InputActionLabel (staff) - 2026-08-06 - still beta, not publishable.
- https://devforum.roblox.com/t/4880208 - Creator Roadmap 2026: Fall Update - 2026-09-18 - InputActionLabel and UI blur dated early 2027.
- https://devforum.roblox.com/t/full-release-build-cross-platform-ui-with-the-viewportdisplaysize-api/3880384 - [Full Release] Build Cross-Platform UI with the ViewportDisplaySize API (staff) - 2025-08-14, full release 2025-10-21 - size buckets, not pixels; tablets share Small.
- https://create.roblox.com/docs/reference/engine/enums/ScreenInsets.md - ScreenInsets (enum reference) - undated - CoreUISafeInsets for interactive UI.
- https://create.roblox.com/docs/reference/engine/classes/ScreenGui.md - ScreenGui (engine reference) - undated - IgnoreGuiInset switches to DeviceSafeInsets.
- https://create.roblox.com/docs/ui/position-and-size - Position and size UI objects - undated - bottom corners, jump-button anchoring, phone versus tablet reach.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/tutorials/curriculums/user-interface-design/choose-an-art-style.md - UI design curriculum: Choose an art style - undated - 9 x 9 mm touch zone; icons over text.
- https://create.roblox.com/docs/production/publishing/accessibility - Accessibility guidelines - undated - TextScaled ignores PreferredTextSize; ReducedMotionEnabled.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/reference/engine/classes/TextLabel.yaml - TextLabel (engine reference) - undated - avoid TextScaled; text no lower than 9.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/tutorials/curriculums/user-interface-design/implement-designs-in-studio.md - UI design curriculum: Implement designs in Studio - undated - the tutorial that turns TextScaled on.
- https://devforum.roblox.com/t/4974212 - Build Accessible UI Faster: New Color3 Contrast & Luminance Methods (staff) - 2026-11-03 - GetContrastRatio.
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html - Understanding SC 1.4.3 Contrast (Minimum), WCAG 2.2 - undated standard - 4.5:1 and 3:1.
- https://create.roblox.com/docs/production/game-design/ui-ux-design - UI and UX design - undated - show only what the moment needs; conventions; consistency.

Look and feel
- https://devforum.roblox.com/t/full-release-ui-styling-is-officially-released/4275082 - [Full Release] UI Styling is officially released! (staff) - 2026-01-20 - style sheets and tokens.
- https://raw.githubusercontent.com/rojo-rbx/rojo/master/CHANGELOG.md - Rojo changelog - latest 7.7.1, 2026-10-01 - no mention of StyleSheet or StyleRule.
- https://devforum.roblox.com/t/studio-beta-uistroke-improvements-scaling-offsets-and-more/3958036 - UIStroke improvements (staff) - full release 2025-12-04 - under 300 strokes.
- https://devforum.roblox.com/t/full-release-new-ui-capabilities-shadows-individual-corners/4636263 - [Full Release] New UI Capabilities: Shadows & Individual Corners (staff) - full release 2026-06-23 - 100 shadows; per-corner rounding.
- https://devforum.roblox.com/t/full-release-upgraded-uishadow-capabilities/4934553 - [Full Release] Upgraded UIShadow Capabilities (staff) - 2026-10-14, full release 2026-11-05 - text shadows are live.
- https://devforum.roblox.com/t/full-release-upgraded-ui-gradients/4846594 - [Full Release] Upgraded UI Gradients (staff) - 2026-09-02, full release 2026-10-29 - gradient types; 1,000 ceiling.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/ui/animation.md - UI animation - undated - sample tween values (not measured optima).
- https://devforum.roblox.com/t/extremely-detailed-roblox-ui-importing-masterclass-w-free-plugin/4619363 - Roblox UI Importing Masterclass (community) - 2026-05-05 - 1024 px image limit.
- https://devforum.roblox.com/t/4576871 - Use Roblox's Own Icons in Your Game (community) - 2026-04-14 - BuilderIcons is unofficial, no licence stated.
- https://api.github.com/repos/dphfox/Fusion and https://github.com/centau/vide/releases - GitHub repo data - 2026-11-15 - Fusion still beta, Vide pre-release.

AI checking
- https://create.roblox.com/docs/studio/mcp - Connect to the Roblox Studio MCP server - undated - screen_capture, input tools, playtest; no UI generator.
- https://devforum.roblox.com/t/4657854 - New Studio Testing APIs and Assistant Improvements (staff) - 2026-05-28 - scriptable device simulator, VirtualInput.
- https://devforum.roblox.com/t/4566767 - [Studio Beta] Studio Assistant & MCP Playtest Agent (staff) - 2026-04-09 - false passes; do not rely on it alone.
- https://devforum.roblox.com/t/4861695 - [Full Release] New Device Simulator Toolbar and Network Simulator (staff) - 2026-09-09 - simulates screen and input, not hardware.
- https://about.roblox.com/newsroom/2026/10/how-roblox-evaluates-build-game-creation - How Roblox Evaluates Build Game Creation - 2026-10-08 - AI output is weakest at UI and visual polish.
- https://devforum.roblox.com/t/4975849 - Studio MCP Server Updates: Open Cloud Access (staff) - 2026-11-04 - products and passes through the MCP; permissions the agent cannot grant itself.

Shop, publishing, rivals
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/production/monetization/paid-random-items.md - Paid random items - undated - exact odds and PolicyService rule.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/production/promotion/rewarded-video-ads.md - Rewarded video ads - undated - 2,000 monthly visitors; opt-in, fixed reward.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/production/monetization/shop.md - Shop - first committed 2026-06-23 - built-in Shop; button off by default.
- https://raw.githubusercontent.com/Roblox/creator-docs/main/content/en-us/production/game-design/contextual-purchases.md - Contextual purchases - undated - no starter pack on first load, no stacked pop-ups.
- https://apis.roblox.com/explore-api/v1/get-sort-content?sessionId=00000000-0000-0000-0000-000000000000&sortId=top-playing-now - Roblox charts API, Top Playing Now - 2026-11-15 - the chart turns over fast; number one was under four months old.
- https://apis.roblox.com/developer-products/v2/universes/10563114921/developerproducts?limit=100 and https://apis.roblox.com/game-passes/v1/universes/10563114921/game-passes?passView=Full&pageSize=100 - Roblox product and pass APIs - 2026-11-15 - the top game's 2 passes and 100+ products from 1 Robux.
- https://devforum.roblox.com/t/4573166 - New Publishing Requirements & Evaluation Process for Games (staff) - 2026-04-13 - ID, 2-step verification, 1,000 Robux or subscription for all-ages reach.
- https://devforum.roblox.com/t/4930524 - A Simpler Path to Publish, Plus Invite Early Testers (staff) - 2026-10-12 - up to 10 early testers.
- https://en.wikipedia.org/wiki/Grow_a_Garden - Wikipedia: Grow a Garden - last edited 2026-11-09 - second-hand account of a record hit that launched rough.


## What we tried

Nothing yet. Each time a step in this file is used on a real game, add one dated line here: what was done, on which game, and what happened. Lines are only ever added, never changed. A step that fails twice gets fixed or cut.
