<!-- Researched 2026-11-15: three researchers per job, two checkers who tried to knock each claim down, one writer. Roblox's rules change often: re-read any dated number older than a month before leaning on it. -->
# Making the 3D models for a Roblox game, mostly with AI

Written 2026-11-15, as research. Nothing was generated or run. Meshy and any other paid tool need the person's own account and cost credits or money: ask before every paid step. "Unsure" marks items a checker rated shaky.

## The short version

- Roblox's ranking cannot see art. Models must read at phone size and run on a cheap phone. Only hero models (collected, bought, on the icon) earn real effort.
- Four routes: structures built from parts by Luau code; filler props from Roblox's `generate_mesh` (no charge today); humanoids from `generate_avatar` or an R15 rig; heroes from one paid outside tool, one month at a time.
- Set the triangle target before generating: 20,000 per mesh is a wall, small props sit at a few hundred to 2,000.
- Ship on placeholder models once the loop is fun; upgrade heroes after.
- No route here has been run end to end. Prove each on one to three models first.

## Steps

1. **List the models from the plan.** Tag each kit, filler, hero or character, with size in studs, triangle budget, moving parts, and icon or not. *Done when:* every model has a role and budget; 5 to 15 heroes. *Confidence: medium.*
2. **Fix the look once.** One-page style sheet: palette, 5-stud grid, doors and walls at least 10 studs, pivot rule, one style sentence for every prompt. Make the icon character first. *Done when:* the person picked one of three or four looks and the character reads at 150 pixels. *Confidence: high* for grid rules, *medium* otherwise.
3. **Run a proving day.** 20 props through `generate_mesh`, one GLB through the upload route, one humanoid through `auto_setup_avatar`. Log failures, real triangle counts, minutes. *Done when:* each route worked once or was dropped. *Confidence: medium.*
4. **Structures and kit: code.** Claude writes Luau builders (walls, floors, bridges, stalls) on the grid with built-in materials and palette colours. `generate_procedural_model` only for a first shape (50 per 24 hours). *Done when:* 10 to 20 reusable pieces exist. *Confidence: high.*
5. **Filler props: `generate_mesh`.** Text prompt with the style sentence, size box, `maxTriangles` a few hundred to 2,000, up to 8 named parts, async batches. The MCP tool takes no picture. Colour parts from the palette and drop the generated texture (unsure: untested). *Done when:* each prop is under budget and reads on the phone-size sheet. *Confidence: medium.*
6. **Characters and creatures.** Humanoids: `generate_avatar` or a standard R15 rig, then any R15 animation (generated ones: 10 seconds or less, four a minute). Pets and creatures: rigid parts moved by one shared Luau motion module. Rig one or two bosses at most, after a test creature walks in Studio (unsure). *Done when:* a character plays an animation and a pet moves by code. *Confidence: medium; rigged creatures low.*
7. **Hero models, after a playtest passes.** Concept picture to one outside tool through its API or MCP server, model named in every call. On Meshy: T2 for props, T2.5 for characters, N1 texture, `target_polycount` set. Fallback: remesh, then texture. *Done when:* each hero GLB is under 10,000 triangles. *Confidence: medium* on numbers, *low* on which tool is best.
8. **Finish and check outside models by script.** Headless Blender sets size in studs (1 stud = 28 cm), front at -Z, base at zero and pivot, deletes floating bits and exports GLB (FBX only with a rig). Check triangles, one material, one UV set in 0 to 1, no holes or loose shells, texture size. Failures are regenerated or replaced by a code-built piece, never hand-fixed. Blender is the person's own install. *Done when:* all checks pass. *Confidence: high.*
9. **Gate, upload, record.** Claude views every texture and render and blocks letters, acronyms, logos and known characters. Upload with the Studio MCP's `open_cloud_invoke` and Roblox's `rbx-import-asset` skill (5 files of 20 MB a call, no API key). Uploads are permanent: ask before each batch. Log name, asset ID, source file, prompt, tool, plan and date in a repo manifest; Rojo cannot live-sync mesh IDs, and until 2027-01-19 every reimport gets a new ID. *Done when:* moderation is approved and the row is written. *Confidence: medium* (new route, unproven here).
10. **Dress each model by role.** One Luau function sets CollisionFidelity (Box by default, Hull for simple shapes), CanCollide/CanTouch/CanQuery off on decoration, Anchored, CastShadow, plus hit box, attachments and role tag. *Done when:* no model keeps importer defaults. *Confidence: high.*
11. **Budget, then phone.** A script counts triangles and unique mesh-plus-texture pairs in view. Reuse meshes: colour, rotation and scale batch for free. Streaming on, `StreamOutBehavior` Opportunistic. Check in Studio's Performance Simulator at 2 to 3 GB, then on a real cheap phone. *Done when:* under budget with a full server's pets. *Confidence: medium.*
12. **Review in batches.** One contact sheet of phone-size screenshots per update; single approval only for the look model, heroes and icon character. Weekly content is recolours, rescales and code-built pieces, at no cost. *Done when:* the person's review takes under 15 minutes. *Confidence: medium.*

## Numbers to aim at

| Thing | Number | Source |
| --- | --- | --- |
| Triangles per mesh | 20,000, hard limit | Creator Hub mesh specifications |
| `generate_mesh` | 12 to 20,000; default 10,000; "100s to 1K" for small props | Live MCP schema; staff post 2026-03-19 |
| Working budgets | kit under 500, prop under 2,000, hero under 10,000 | Checker's example; Meshy tutorial 2026-08-06 |
| Texture size | 256 at about 5 studs, 512 at 10, 1024 at 20 | Creator Hub texture specifications |
| Scene in view on a phone | about 500 draw calls, 500,000 triangles, under 1.3 GB | Guest article 2024-08-20 (one expert's opinion; Roblox's example is double) |
| Rig | 4 bone influences per vertex; about 50,000 triangles (reported error, undocumented) | Mesh specifications; DevForum 2025-07-10 |

## What needs the person

- The person picks the look: 20 to 30 minutes per game. They pick the icon character from a sheet: 5 minutes.
- One-time setup: in Studio, Assistant Settings, MCP Permissions, approve the export folder and switch on "Publish & manage assets" (5 minutes); create the outside tool's API key as an environment variable, never in chat (5 minutes); choose user or group ownership (2 minutes); pay for the month (their own account, their own money).
- Say yes to each upload batch: 1 to 2 minutes of the person's time.
- Tool bake-off, once: 30 to 45 minutes judging the same five subjects from each tool in Studio.
- Batch review: under 15 minutes per update.
- Phone test before each public release: 10 to 15 minutes at the busiest spot.
- One decision (settled in `SKILL.md`, "Settled rules"): steps 5, 6 and 9 need Studio, so a model chat may use Studio's generate tools, with its drafts kept in one folder, and the game's main chat does the upload.

## Never do

- Go over 20,000 triangles a mesh, or leave the cut to Roblox's importer. The limit is hard; the importer's result is out of your hands.
- Decimate after texturing. Meshy's own order is generate, remesh, texture.
- Fix meshes by hand retopology. 20 minutes to 4 hours a model (vendor figure) ends a weekly pace.
- Export OBJ. It drops rigs and materials.
- Upload without the text gate and a yes. One reported ban came from AI-made text in an image, and the agent cannot delete uploads.
- Hide behind an alt account. Roblox bans linked alts for severe violations.
- Ship Tripo Free output (non-commercial, public), or Meshy Free output without credit (CC BY 4.0).
- Borrow meme characters, brands or another game's look. Roblox demotes look-alikes and top developers sue.
- Trust a vendor page for Roblox's limits, pay for 4K or 8K textures, or hold a launch for art.

## Where good sources disagree

- **Does art matter?** Makers of two hits (14 and 22 million peak) credit loop and weekly updates; a creature studio with 2 billion visits credits its look. Both hold: art matters when the model is the thing collected or shown off.
- **Built-in generator quality.** Roblox says improved; developers call it placeholder grade. Nobody has tested the current version.
- **Meshy or Tripo.** One test, by a Meshy employee on older dense models, favoured Tripo on shape and Meshy on texture. Tripo's price per Roblox-ready model runs from $0.10 (aggregator) to $0.40-$0.73 (checker's arithmetic); Meshy's is about $0.30 (arithmetic too; confirm in the apps).
- **Docs or live server.** The docs page omits four generation tools and says 10-second animations; the live tool says 1 to 30. Trust the live list, plan for 10.
- **Mesh Streaming.** Planned as default for July 2026, still opt-in with open bugs. RenderFidelity still applies where it is off.

## What nobody knows yet

- Whether any top game ships AI-made models. Do not write it as fact.
- Roblox's real generation quotas. Limits and a usage dashboard are planned for late 2026.
- How current Meshy and Tripo low-poly modes compare at Roblox triangle counts, and whether Meshy's single-picture low-poly models get a model's back right.
- Whether palette colouring or one texture pass makes mixed models look like one set.
- Whether Meshy paid-month models stay the person's after cancelling. Its terms (2026-09-19, opened on the research day) say paid customers own output, say nothing on cancelling, and allow deleting an inactive account's files: download everything. Tripo's terms say paid output stays paid.
- Where concept pictures should come from, and how to hold one style across them.
- Minutes per usable model on any route, and who owns meshes made by Roblox's own generators.

## Sources

Roblox, first-hand (Creator Hub pages are undated; opened 2026-11-15)

- https://create.roblox.com/docs/art/modeling/specifications | General mesh specifications | opened 2026-11-15 | 20,000 triangles per mesh, watertight, 4 bone influences per vertex.
- https://create.roblox.com/docs/art/modeling/texture-specifications | Texture specifications | opened 2026-11-15 | One material and one UV set per mesh; 256/512/1024 sizing; says both 4096 and 1024.
- https://devforum.roblox.com/t/4k-texture-rendering/4316229 | 4k Texture Rendering (staff) | 2026-01-30 | 1024 is no longer a hard cap; 4K live, 8K accepted on import.
- https://create.roblox.com/docs/art/modeling/3d-importer | 3D Importer | 2026-03-31 | FBX and glTF carry rigs and PBR; OBJ is static mesh only.
- https://devforum.roblox.com/t/3d-importer-full-release/2057539 | 3D Importer Full Release (staff) | 2022-11-17, older than 2024, possibly out of date | Importer auto-simplifies meshes over the limit.
- https://devforum.roblox.com/t/assistant-updates-mesh-generation-new-mcp-server-tools-screenshot-tool-and-more/4527258 | Assistant Updates: Mesh Generation, New MCP Server Tools (staff) | 2026-03-19 | Default 10,000 triangles; "100s to 1K" for small props; developer replies calling output placeholder grade.
- https://create.roblox.com/docs/assistant/guide | Assistant for Studio guide | opened 2026-11-15 | Text or image input in Assistant; 8 parts; 50 procedural models per rolling 24 hours.
- https://create.roblox.com/docs/studio/mcp | Studio MCP server docs | opened 2026-11-15 | Lists 30 tools; lags the live server.
- Live Roblox Studio MCP tool schemas (`generate_mesh`, `open_cloud_invoke`, `generate_animation`) | read from the live server 2026-11-15, nothing run | 12 to 20,000 triangles, 8 part names, no image input; 5 files of 20 MB, approved folders, no API key; animation 1 to 30 seconds.
- https://devforum.roblox.com/t/4975849 | Studio MCP Server Updates: Open Cloud Access in Your MCP Client and Asset Import Workflows (staff) | 2026-11-04, updated 2026-11-05 | `open_cloud_invoke`, `rbx-import-asset`, "Publish & manage assets" permission, uploads cannot be deleted by the agent, owner is responsible.
- https://devforum.roblox.com/t/4977709 | Staff beta post on animation generation (title not recorded) | 2026-11-05 | 10 seconds through MCP, R15 only, four per minute, no charge now.
- https://devforum.roblox.com/t/4977769 | Staff post on asset versioning (title not recorded) | 2026-11-05 | Same asset ID across versions from 2027-01-19; new IDs per reimport until then.
- https://devforum.roblox.com/t/4880208 | Creator Roadmap, Fall 2026 update (staff) | 2026-09-18 | "Mesh gen limits & dashboard" planned for late 2026.
- https://devforum.roblox.com/t/full-release-procedural-models-build-parametrized-3d-models-with-code-or-ai/4642542 | Full Release: Procedural Models (staff) | 2026-05-18 | Procedural models are primitive parts driven by code.
- https://create.roblox.com/docs/avatar-setup/auto-setup-requirements | Avatar Setup specifications | opened 2026-11-15 | Humanoid only, A or T pose, clear neck, no accessories.
- https://devforum.roblox.com/t/introducing-new-texture-generation-tools-segment-any-mesh-and-image-previews/4890084 | New Texture Generation Tools, Segment Any Mesh (staff) | 2026-09-23 | Textures are "a starting point"; failure reports; 5-part segmenting.
- https://devforum.roblox.com/t/beta-introducing-quality-mode-for-texture-generation/4938282 | Quality Mode for Texture Generation (staff) | 2026-10-16 | Fast 1K and Quality 4K modes, no normal maps, new UVs.
- https://create.roblox.com/docs/discovery | Discovery | opened 2026-11-15 | Ranking signals contain no art measure; look-alike games are demoted; custom thumbnail required.
- https://create.roblox.com/docs/production/publishing/experience-icons | Experience icons | opened 2026-11-15 | Icons made at 512, shown as small as 150.
- https://create.roblox.com/docs/tutorials/curriculums/environmental-art/develop-polished-assets | Environmental art: Develop polished assets | opened 2026-11-15 | 5-stud grid, consistent pivots, silhouette-only geometry.
- https://create.roblox.com/docs/tutorials/curriculums/environmental-art/greybox-your-environment | Environmental art: Greybox your environment | opened 2026-11-15 | Doors and walls at least 10 studs.
- https://create.roblox.com/docs/tutorials/curriculums/environmental-art/assemble-an-asset-library | Environmental art: Assemble an asset library | opened 2026-11-15 | Collision and CanCollide/CanTouch/CanQuery by role.
- https://create.roblox.com/docs/parts/meshes | Meshes | opened 2026-11-15 | CollisionFidelity options and costs; RenderFidelity behaviour.
- https://create.roblox.com/docs/physics/units | Roblox units | opened 2026-11-15 | 1 stud = 28 cm.
- https://create.roblox.com/docs/performance-optimization/improve | Improve performance | opened 2026-11-15 | Same mesh plus same material batches; colour and scale are free.
- https://create.roblox.com/docs/performance-optimization/design | Design for performance | opened 2026-11-15 | Example budget of 1,000 draw calls and 1,000,000 triangles.
- https://create.roblox.com/docs/workspace/streaming | Instance streaming | opened 2026-11-15 | Streaming defaults; Opportunistic stream-out advised.
- https://devforum.roblox.com/t/4979313 | Staff post on the Performance Simulator (title not recorded) | 2026-11-06 | Simulates 2 and 3 GB phones' memory in Studio, not CPU or GPU speed.
- https://devforum.roblox.com/t/introducing-mesh-streaming-and-improved-cloud-lods-in-published-experiences-opt-in-phase/4601232 | Mesh Streaming and Improved Cloud LoDs, Opt-in Phase (staff) | 2026-04-27, thread active to 2026-11-11 | Still opt-in; unskinned meshes only.
- https://devforum.roblox.com/t/4972565 | Staff post on moderation of alt accounts (title not recorded) | 2026-11-02 | Linked alts are moderated for severe violations.

Roblox community and third parties

- https://devforum.roblox.com/t/real-world-building-and-scripting-optimization-for-roblox/3127146 | Real world building and scripting optimization for Roblox (guest article) | 2024-08-20 | 500 draw calls, 500,000 triangles, under 1.3 GB; pets as anchored parts moved by code.
- https://devforum.roblox.com/t/error-your-rig-has-too-many-triangles-on-animation-import-from-blender/3807691 | Error: Your rig has too many triangles | 2025-07-10 | The 50,000-triangle rig error (one user report).
- https://devforum.roblox.com/t/roblox-account-banned-due-to-ai-asset/4918492 | Roblox account banned due to AI asset | 2026-10-06 | Ban over AI-made text in an image; appeal refused in minutes.
- https://rojo.space/docs/v7/sync-details/ | Rojo sync details | undated | MeshId cannot be live-synced.

Outside tools

- https://docs.meshy.ai/api/models.md | Meshy API: Models | 2026 | T2 (100 to 15,000), T2.5 (100 to 30,000), N1 texture; which model for which job.
- https://docs.meshy.ai/en/webapp/pricing and https://www.meshy.ai/pricing | Meshy pricing and credits | 2026 | Pro $20 for 1,000 credits; Smart Topology 5, texture 10; Free is CC BY 4.0.
- https://www.meshy.ai/terms-of-use | Meshy Terms of Service | last updated 2026-09-19, opened by the writer 2026-11-15 | Paid customers own output; silent on cancelling; inactive accounts' outputs may be deleted.
- https://docs.meshy.ai/en/roblox-plugin/bridge-to-roblox | Meshy: Bridge to Roblox | 2026 | Order "generate, remesh, texture"; bridge needs write access to the Roblox account.
- https://docs.meshy.ai/api/ai.md | Meshy API: AI and MCP | 2026 | Meshy MCP server usable from Claude Code on paid plans.
- https://www.meshy.ai/tutorials/3d-model-for-roblox-workflow | How to Import 3D Models into Roblox Studio (Meshy) | 2026-08-06 | 2,000 to 10,000 triangles for most props.
- https://www.tripo3d.ai/terms and https://www.tripo3d.ai/pricing | Tripo terms and pricing | terms updated 2026-11-13 (opened by a checker; pricing page returned 403 to the writer) | Free output is public and non-commercial; paid output stays paid after cancelling; credit table behind the $0.40 to $0.73 arithmetic.
- https://www.costbench.com/software/ai-3d-generation/tripo-ai/ | Tripo AI Pricing 2026 (aggregator) | 2026-11-13 | The $0.10 per model figure.
- https://hackernoon.com/how-i-stress-tested-3-ai-3d-generators-on-the-same-inputs-what-the-numbers-actually-show | How I Stress-Tested 3 AI 3D Generators (author works at Meshy) | 2026-06-03 | The only measured Meshy, Tripo, Rodin comparison; older dense models.
- https://www.nilo.io/articles/meshy-vs-tripo-roblox-models | Meshy vs Tripo for Roblox 3D Models (competing vendor) | 2026-11-09 | Retopology quoted at 20 minutes to 4 hours per asset; unverified.

Does art matter

- https://www.pcgamer.com/software/ai/roblox-wants-ai-to-make-its-games-photorealistic-but-the-devs-making-those-games-arent-sold-on-the-idea-i-dont-think-that-your-average-player-right-now-wants-to-do-that/ | PC Gamer: Roblox wants AI to make its games photorealistic | 2026-05-10 | Maker of a 14-million-peak hit calls minimal graphics a deliberate feature.
- https://gamesbeat.com/janzen-madsen-interview/ | GamesBeat: How Grow a Garden took off | 2025-09-07 | 22-million-peak hit credited to theme and weekly updates, not art.
- https://www.deconstructoroffun.com/blog/how-to-build-a-real-business-on-roblox-in-2026 | Deconstructor of Fun: How to Build a Real Business on Roblox in 2026 | 2026-04-06 | "Speed matters more than polish at launch."
- https://gamesbeat.com/twin-atlas-is-among-the-studios-changing-what-roblox-games-look-like-exclusive-interview/ | GamesBeat: Twin Atlas interview | 2026-07-01 | Counter-case: a consistent studio look behind a 2-billion-visit creature game.
- https://about.roblox.com/newsroom/2026/07/roblox-studio-fidelity-creator-interviews-twin-atlas-fluorlite-maximillian-ecos | Roblox Newsroom: Creators Discuss Working in Unique Art Styles | 2026-07-01 | That studio colours meshes with built-in Color and Material, not textures (basis of the palette-colouring idea).
- https://www.thestar.com.my/tech/tech-news/2026/03/25/robloxs-hit-game-steal-a-brainrot-battles-its-many-imitators | Bloomberg via The Star: Steal A Brainrot battles its many imitators | 2026-03-25 | Lawsuits over copied look; borrowed characters give no protection.

## What we tried

Nothing yet. Each time a step in this file is used on a real game, add one dated line here: what was done, on which game, and what happened. Lines are only ever added, never changed. A step that fails twice gets fixed or cut.
