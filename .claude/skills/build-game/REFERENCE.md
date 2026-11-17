<!-- Researched 2026-11-15: three researchers per job, two checkers who tried to knock each claim down, one writer. Roblox's rules change often: re-read any dated number older than a month before leaning on it. -->
# Idea to a shipped plan: the working method (written 2026-11-15)

## The short version

- Write one page, not a design document. Build the core loop from plain parts first: no models, money or polish until the maker wants another go.
- Ship small and early. Judge by the game's own dashboard band, never by a percent from a blog.
- Design for what Home measures: nobody leaves in the first 180 seconds, a reason to return, a reason to invite.
- "Checks pass" and "worth playing" are two gates. Only the maker can pass the second.
- A new game reaches only age-checked 16+ players until it clears the 2026 publishing gate.

## Steps

1. **Set up the account, once.** Age check, 2-step verification, verified email. *Done when:* a game can be published to 16+. Confidence: high.
2. **Fill the one-page plan.** Loop in three words (do, repeat, grow). The proven loop borrowed, three reference games the maker played, the one difference. One line per Home signal: first 60 s, first 180 s, days 2-7, days 8-28, invite, spend. Release 1 is one loop, one area. Kill line, review date, a ship date they set (cut scope, not the date). *Done when:* it fits one page and the difference is named. Confidence: medium (no hit-maker has published a plan).
3. **Write the economy as numbers.** Every source and sink, in a pure module. *Done when:* a test simulating 60 minutes passes and the first upgrade is affordable inside the first session. Confidence: medium.
4. **Gate 1, grey box.** Core loop only. *Done when:* lint, format, types, build, tests and a scripted playtest pass, then the maker plays about 15 minutes and answers four questions: want another go, a choice that mattered, a reason to return tomorrow, hook in one line. A pass needs a yes to "want another go" and at most one "no" in all; otherwise back to `/game-idea`. Confidence: high on the order; the questions are a house rule.
5. **Build from a feature list.** One feature per fresh session. Each has "done when", "agent proves" (numbered player actions, expected state, screenshot) and "the maker checks" (exact steps, minutes). Open with a core-loop smoke test. Confirm the new code is in Studio before playtesting. Commit after each pass. One agent on Studio at a time. *Done when:* evidence is pasted, not claimed. Confidence: high.
6. **Script and log the first minutes.** Beats tied to 60 s, 180 s, 5 min and 10 min. Arrows and highlights, not text. Phone screen first. Each beat is an onboarding funnel step, step 1 on PlayerAdded. An economy event at every source and sink. Tunable numbers live in config. *Done when:* the steps show in View Events on the published game. Confidence: high (the in-between beats are a house choice).
7. **Saving, early and alone.** Versioned save, tested migration, session locking, a separate test copy. *Done when:* the maker saves, leaves and rejoins, and the agent reads the stored entry back. Confidence: high.
8. **Before public.** Phone run. A session with 2-3 friends. Join and leave mid-round. Every remote validated on the server. Three custom thumbnails (one is required for Home). An honest title and description. *Done when:* all ticked. Confidence: medium.
9. **Gate 2, real players.** Publish to 16+. No ads unless the game shows zero Home visits after one to two weeks, and only with the person's yes (ads cost real Robux). Read bounce, funnel, D1 and session time by acquisition source. Fix the biggest, earliest funnel drop before adding content. Review at day 10-14; two fix rounds at most. Beta mode (hidden from Home) is optional; unsure it helps. *Done when:* D1 and session time reach the middle of the dashboard band (keep going) or the top (put all hours here). Under the middle twice: stop. Before the band shows, compare funnel completion between rounds. Confidence: low (house rule; only the top end has a first-hand quote).
10. **Gate 3, progression.** Short, mid and long goals; daily quests as a data table. *Done when:* D7 is inside the band. Confidence: medium.
11. **Gate 4, money and all ages.** Starter pack and one or two passes. Then the content questionnaire, the 1,000 Robux fee, and 250 highly engaged plays in 60 days on the Audience Reach tab. Confidence: high on the facts.
12. **Keep it alive.** After every update check D1 and D7, session time, payer conversion and revenue, new users and play-through rate. The agent can pull these through Open Cloud once the maker grants analytics read (documented, untried). Drops reuse existing systems and models, at a cadence the maker can hold. Confidence: medium.

## Numbers to aim at

| Number | Target | Source |
| --- | --- | --- |
| First-play bounce | Nobody leaves under 60 s or at 61-180 s | Roblox Discovery doc |
| Reach the fun | 5 minutes or less | Roblox Retention doc |
| Session length | Past 10 minutes | Roblox Creator Rewards doc |
| Playtime that counts | Up to 60 minutes a day | Roblox Discovery doc |
| D1, D7, session time | Top of your own 50th-90th percentile band (doc's D1 example: 12.11%-18.73%) | Roblox Analytics dashboard doc |
| Sanity anchor only | Big games: median D1 10.3%, session 9.8 min; top 1% D1 22.2% | GameAnalytics 2026 (third-party) |
| Publishing gate | 250 highly engaged 16+ plays in 60 days; 1,000 Robux | Roblox Kids and Select, Publish docs |
| Starter pack | 99, 199 or 299 Robux; 2-5 items; 24 h to 3 days; about 90% off | Roblox Starter pack doc |
| A/B tests | Not below 500-1,000 daily players | Roblox Experiments doc |
| Money | 70% share; $0.0038 per Robux; 30,000 Robux to cash out | Roblox Earn, DevEx docs |

## What needs the maker

Times are the fit checker's estimates, not sourced.

- Account set-up: 20 minutes, once. Studio MCP permissions: 5 minutes per game.
- Three reference games per idea: about an hour.
- Kill line: 5 minutes. Each review: 15 minutes. Gate play: about 15 minutes.
- Phone check per UI change: 5-10 minutes. Save, leave, rejoin: 10 minutes.
- Friends session before public: 30-45 minutes.
- Publish, thumbnails, real-gameplay video: about an hour. Later releases: 5 minutes each.
- Ad round: 10 minutes. Card payment is 18+; Robux-to-credits is 13+ and cannot be undone.
- Always the maker's: picking models, paying Robux, setting prices, stopping a game.

## Never do

- **Write a fixed D1 percent as Roblox's target.** Roblox publishes none; the 30-60% blog figures have no primary source.
- **Plan growth on ads, or buy them before the first minutes work.** Players first acquired by ads never count toward Home ranking.
- **Start a model chat or polish UI before Gate 1.** Their picking time is the bottleneck.
- **Treat passing checks or a playtest-agent Pass as "good".** Roblox's own example scored 98 engineering, 100% playtest, 31 design.
- **Leave dropped design notes where a build chat reads them.** In one post-mortem the agent built the abandoned idea. Use `./os close`.
- **Let the agent rewrite outside its feature's files.** One unrequested rewrite cost a week.
- **Rename a data store, or call saving done from one playtest.** A new name is an empty store.
- **Hard-code a price.** Regional prices and Plus discounts would show wrong.
- **Plan A/B tests or weekly updates for a new solo game.** Too few players; unsustainable.
- **Ship a copy with no difference.** "Non-unique" games lose reach and may get no ad delivery.
- **Let the agent spend Robux, publish, price or upload unasked.** The MCP's Open Cloud tool can; uploads are permanent.
- **Keep "wait 28 days", "pick a genre the algorithm likes" or "chase total visits".** The Discovery FAQ contradicts each.

## Where good sources disagree

- **Update cadence.** Roblox's pages give four ranges, weekly to monthly. Grow a Garden and 99 Nights ran weekly; Fisch's maker says quality over quantity.
- **Ads.** Roblox reports a median 14% lift in play sessions across 21 campaigns, and over 70% of its top 100 earners ran ads. Developers report ad cohorts retaining worse; one hit studio says it never pays for players.
- **Hide or ship.** The beta-mode post says stay out of Home until ready. The Discovery FAQ says a weak start carries no penalty.
- **Written specs.** A vendor benchmark shows gains on features. A study of 88,052 pull requests found no defect benefit. Neither covers games.
- **Fee refund.** One Roblox page says automatic 90 days after eligibility; another says after holding 100 highly engaged players for 60 days (re-read today).
- **Sync tool.** Roblox's agent guide uses Script Sync; its Rojo page recommends a Rojo setup yet warns Rojo is unsupported. Both work.

## What nobody knows yet

- Whether the cut from 250 to 100 highly engaged plays is live. The doc said 250 today.
- Whether beta-mode or ad plays count toward that threshold, and whether beta data carries over.
- What an ad play costs with only 16+ players reachable. The last published average is August 2025.
- Whether numbers from 16+ players predict how under-16s behave.
- How long a solo, AI-assisted first build takes. Experienced small teams report one to four months.
- Any tested kill number. How close is too close under the "non-unique" rule.
- Whether the agent can run a multi-client join and leave test through the MCP.

## Sources

Writer's note: I re-opened two pages today (marked "re-read by writer"). All others were opened by the researchers or checkers, not by me. Nothing older than 2024 is used. Dropped as wrong or out of date per the checkers: the $0.008 cost per play as a current figure, "12,500 plays per $100", the Feb 28 / Mar 3 impressions example, "SpongeBob Tower Defense shipped in six weeks with four people", "52 consecutive weekly updates", "ad traffic has lower D1" as a measured Roblox finding, "Roblox recommends against Rojo", and beta mode as the default launch.

Roblox, first-hand
- https://create.roblox.com/docs/production/publishing/kids-and-select.md | Roblox Kids and Select | live page, re-read by writer 2026-11-15 | 16+ only before evaluation; 250 unique highly engaged plays in 60 days; Plus or Premium for 2 months as the alternative to the fee; refund "90 days after your game becomes eligible"; expedited review 50,000 Robux.
- https://create.roblox.com/docs/production/publishing/publish-experiences-and-places.md | Publish experiences and places | live page, re-read by writer 2026-11-15 | 1,000 Robux refundable fee; refund "if your experience maintains 100 highly engaged players for 60 days without moderation"; Enable Beta Mode under Configure > Settings > Audience.
- https://devforum.roblox.com/t/making-publishing-easier-our-vision-and-whats-coming/4865780 | Making publishing easier (staff) | 2026-09-11 | Announced cut from 250 to 100 "this November"; one-question 16+ path; up to 10 early testers.
- https://create.roblox.com/docs/discovery | Discovery | live page, read 2026-11-15 | The four "most important" signals, 60 s and 61-180 s bounce windows, 60-minute daily cap, custom thumbnail required, non-unique games lose priority.
- https://create.roblox.com/docs/discovery-faq | Discovery FAQ | live page, read 2026-11-15 | Ads carry no penalty; ad-acquired players never become ranking signals; no 28-day wait; genre not a factor; per-user averages; no penalty for a weak start.
- https://devforum.roblox.com/t/how-we-are-improving-home-this-year/4502571 | How we are improving Home this year (staff) | 2026-03-09, updated 2026-07-29 | Weighting is becoming per-user; no thresholds will be published.
- https://create.roblox.com/docs/production/analytics/analytics-dashboard | Analytics dashboard | live page, read 2026-11-15 | Benchmarks shown as a 50th-90th percentile band; D1 example 12.11%-18.73%; over 10 DAU and 10 play hours for 7 days to see KPIs.
- https://create.roblox.com/docs/en-us/production/analytics.md | Analytics overview | live page, read 2026-11-15 | Order of work (retention and session time before traffic); the four checks after each update.
- https://devforum.roblox.com/t/analytics-view-retention-by-acquisition-source-and-select-your-benchmark-set/4010157 | Retention by acquisition source (staff) | 2025-10-16 | Retention can be split by source; benchmarks do not affect Home distribution.
- https://create.roblox.com/docs/get-started/strategies | Recommended strategies | live page, read 2026-11-15 | KPIs before development, MVP around the core loop, test early, four playtest formats, cadence range.
- https://create.roblox.com/docs/production/game-design/core-loops | Core loops | live page, read 2026-11-15 | Three-part loop; progression engine required.
- https://create.roblox.com/docs/production/analytics/retention | Retention | live page, read 2026-11-15 | Reach the fun in 5 minutes or less; D1 = loop and first session, D7 = progression, D30 = content and social.
- https://create.roblox.com/docs/production/game-design/onboarding | Onboarding | live page, read 2026-11-15 | Teach by doing, quick early rewards, visible goals.
- https://create.roblox.com/docs/production/game-design/design-for-roblox | Design for Roblox | live page, read 2026-11-15 | Most players on phones; long text tutorials bore; single-player games struggle.
- https://create.roblox.com/docs/production/analytics/funnel-events | Funnel events | live page, read 2026-11-15 | Onboarding funnel API, step 1 on PlayerAdded, View Events for validation.
- https://devforum.roblox.com/t/improving-onboarding-through-funnel-events/3064458 | Improving Onboarding through Funnel Events (staff) | about July 2024 | Fix drop-offs before content; 29.52% reached step 2 in the worked example.
- https://create.roblox.com/docs/production/analytics/event-types | Event types and limits | live page, read 2026-11-15 | 10 funnels, 100 steps, 120 + 20 x CCU requests per minute; names the rbx-instrument-analytics skill.
- https://create.roblox.com/docs/production/analytics/economy-events | Economy events | live page, read 2026-11-15 | Log every source and sink.
- https://create.roblox.com/docs/production/game-design/balance-virtual-economies | Balance virtual economies | live page, read 2026-11-15 | Sources, sinks and expected-value method for the economy sheet.
- https://create.roblox.com/docs/production/experiments | Experiments | live page, read 2026-11-15 | Under 1,000 daily players "might struggle to get useful data".
- https://devforum.roblox.com/t/live-now-use-configs-and-experiments-to-grow-your-game-faster/4051385 | Configs and experiments launch (staff) | 2025-11-06 | Under 500 DAU, grow first; configs for live tuning.
- https://create.roblox.com/docs/production/game-design/starter-pack-design.md | Starter pack design | live page, read 2026-11-15 | Price points, 2-5 items, 24 h to 3 days, about 90% off.
- https://create.roblox.com/docs/production/earn-on-roblox | Earn on Roblox | live page, read 2026-11-15 | 70% share; median DevEx creator $1,550 for 2025.
- https://create.roblox.com/docs/en-us/production/monetization/developer-exchange.md | Developer Exchange | live page, read 2026-11-15 | $0.0038 per Robux; 30,000 minimum.
- https://create.roblox.com/docs/en-us/production/monetization/regional-pricing.md | Regional pricing | live page, read 2026-11-15 | Why prices must not be hard-coded.
- https://create.roblox.com/docs/creator-rewards | Creator Rewards | live page, read 2026-11-15 | The 10-minute session target.
- https://create.roblox.com/docs/en-us/production/publishing/thumbnails.md | Thumbnails | live page, read 2026-11-15 | 2-5 active thumbnails; real-gameplay video rules.
- https://create.roblox.com/docs/production/game-design/content-updates | Content updates | live page, read 2026-11-15 | One of the four cadence ranges; drops built on existing systems.
- https://create.roblox.com/docs/production/game-design/liveops-essentials | LiveOps essentials | live page, read 2026-11-15 | "Weekly to monthly"; keep cadence sustainable.
- https://devforum.roblox.com/t/a-new-way-to-test-before-launch-experience-betas/4144485 | Experience Betas | 2025-12-11 | Beta mode keeps a game out of Home; carry-over question unanswered.
- https://create.roblox.com/docs/en-us/production/promotion/ads-manager.md | Ads Manager | live page, read 2026-11-15 | Plays and Engagement objectives; payment ages; non-unique games may get no delivery; no current cost per play.
- https://devforum.roblox.com/t/ads-manager-rdc-recap-earnings-roas-reporting-incrementality/4909790 | Ads Manager RDC recap (staff) | 2026-10-02 | 21 campaigns, median 14% lift in play sessions.
- https://devforum.roblox.com/t/ads-manager-updates-acquire-new-users-continuous-campaigns-and-more/3862159 | Ads Manager Updates (staff) | 2025-08-05 | Last published average cost per play; now out of date.
- https://devforum.roblox.com/t/sponsored-ads-traffic-degrades-the-engagement-metrics-used-for-discovery-causing-paid-acquisition-to-harm-organic-ranking/4838351 | Developer bug report | 2026-08-29 | Ad cohorts retaining worse; unanswered by staff.
- https://s27.q4cdn.com/984876518/files/content_files/Q3-2026-Earnings-Shareholder-Letter.pdf | Roblox Q3 2026 Shareholder Letter | 2026-10-29 | Over 70% of top 100 earners ran ads; AI-built games reached the top 20.
- https://devforum.roblox.com/t/rdc26-what-we-announced/4865880 | RDC26: What We Announced (staff) | 2026-09-12 | 28% of the top 100 by hours were under 90 days old; backs shipping small and early.
- https://about.roblox.com/newsroom/2026/10/how-roblox-evaluates-build-game-creation | How Roblox Evaluates Build Game Creation | 2026-10-08 | 98 engineering, 100% playtest, 31 design; source of the four design questions.
- https://devforum.roblox.com/t/studio-beta-studio-assistant-mcp-playtest-agent/4566767 | Playtest Agent beta (staff) | 2026-04-09 | False passes; do not rely on it alone.
- https://devforum.roblox.com/raw/4975849 | Studio MCP Server Updates: Open Cloud Access (staff) | 2026-11-09 | Agent can create products, publish and read stored data with permission; run agents in sequence.
- https://create.roblox.com/docs/en-us/cloud/guides/analytics.md | Open Cloud Analytics guide | live page, read 2026-11-15 | Agent can query D1, D7, session time and Home signals.
- https://create.roblox.com/docs/en-us/cloud/guides/analytics/benchmarks.md | Open Cloud Benchmarks (experimental) | live page, read 2026-11-15 | Percentile band readable by API.
- https://create.roblox.com/docs/cloud-services/data-stores.md | Data stores | live page, read 2026-11-15 | Studio access off by default; use a test copy.
- https://create.roblox.com/docs/ai/coding-harness.md | Build with a coding harness | live page, read 2026-11-15 | Script Sync + MCP + Git setup; one tested phase at a time.
- https://create.roblox.com/docs/projects/rojo.md | Rojo | live page, read 2026-11-15 | Rojo documented and recommended for code-only setups, with an unsupported warning.

Makers and third parties
- https://www.gameanalytics.com/reports/2026-roblox-report | GameAnalytics 2026 Roblox Report | data Aug 2025 to Jul 2026 | Sanity-anchor retention and session figures for games with 1M+ monthly players; vendor data, different counting.
- https://www.deconstructoroffun.com/blog/how-to-build-a-real-business-on-roblox-in-2026 | How to Build a Real Business on Roblox in 2026 | 2026-04-06 | The "90th percentile" quote behind the top end of the kill rule.
- https://devforum.roblox.com/t/creator-spotlight-the-story-behind-99-nights-in-the-forest/4036940 | Creator Spotlight: 99 Nights in the Forest | 2025-10-31 | Small scope, constant playtesting, weekly updates.
- https://devforum.roblox.com/t/creator-spotlight-woozynate-makes-a-splash-with-fisch/3269481 | Creator Spotlight: Fisch | 2024-11-22 | Solo four-month build; quality over quantity of updates.
- https://gamesbeat.com/janzen-madsen-interview/ | Janzen Madsen interview | 2025-09-07 | Most of his games failed; weekly updates on Grow a Garden.
- https://naavik.co/podcast/the-creator-led-studio-playbook/ | The Creator-Led Studio Playbook | 2025-11-04 | A hit studio that does not pay for players; short build cycles.
- https://naavik.co/podcast/mastering-the-roblox-meta/ | Mastering the Roblox Meta | 2024-05-22 | Drop prototypes nobody plays; kill on cost against income.
- https://thechase.space/posts/i-built-a-roblox-game-with-ai-heres-what-i-learned-and-how | I Built a Roblox Game with AI | 2025-10-24 | Stale design docs, unrequested rewrite, untested join and leave.
- https://github.com/rodrigo-guerraa/roblox-hub | roblox-hub toolkit | 2026-10-16 | "Agent proves" versus "human checks" split; never rename a data store; purchase dialogs and phones need a human.
- https://code.claude.com/docs/en/best-practices.md | Best practices for Claude Code | live page, read 2026-11-15 | Runnable pass/fail check, evidence, fresh session per feature; retired sub-agent and emphasis advice.
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | Effective harnesses for long-running agents | 2025-11-26 | Feature list with pass flags, one feature per session, smoke test first.
- https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ESEM.2026.84 | Specification Artifacts Do Not Reduce Defects (ESEM 2026) | 2026-10-05 | 88,052 pull requests; no defect benefit from specs.
- https://uvik.net/blog/spec-driven-development-benchmark/ | Uvik SDD Benchmark 2026 | 2026-11-02 | Vendor benchmark: specs help on features, not bug fixes.

## What we tried

Each time a step in this file is used on a real game, add one dated line here: what was done, on which game, and what happened. Lines are only ever added, never changed. A step that fails twice gets fixed or cut. Nothing has been tried yet.

Add a dated line after each use of this method on a real game (what was done, which game, what happened).
