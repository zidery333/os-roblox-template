# Meshy models: what we learned

`/make-model` (`SKILL.md`, beside this file) decides when Meshy is used.

**Meshy needs the person's own account and costs credits (real money).** Nothing here runs without them, and no step
that spends credits happens before the person has heard the cost and said yes. The finishing script in the kit also
needs Blender, the person's own install.

The proof lines come from models made in Meshy earlier. Meshy's versions, prices and screens change often:
read the card in Meshy before you trust any number here.

## Working with the person on a model

- **One change, one picture, one question.** Several versions or options at once confuse people. Make one change.
  Show it beside the one they like. Ask one yes or no.
- **Send the picture itself, never just a path**, in one message with its prompt. Telling someone which picture to
  attach, without sending a picture, wastes their time.
- **Only say they like something when they said so.** "Better" is not "liked". Never write "clearly better" about a
  model they did not like.
- **Their screenshots lead.** They mark what bugs them. You sort each mark into shape or paint and give the fix. Their
  eye beats any measure.
- **Ask what they see before you name it.** A word like "blur" can mean colour stains. Mark the spot and ask "this?".
- **Say the cost before any paid step.** Credits are real money, often across several apps. One paid test per idea.
  Stop after a failure.
- **Two failed tries on one step: stop.** Keep the best so far. Ask "Anything else?" before a paid edit.
- **When they talk, answer them.** Do not go off looking for a file while they are asking you something.
- **Never describe a picture you have not seen.** Name the exact picture and where it is.
- **Say what a step is for.** A retexture fixes paint, never shape. Say so before they spend credits on it.
- **Meshy's Agent is a canvas, not a chat.** You click which image to edit on a screen full of things made so far, and
  it adds it into the prompt. Each prompt stands alone. Tell the person which picture to click.
- **Never show them a model with a flaw you already know about.**

## What Meshy did well and badly (tested)

- **Picture to model.** Rule: Meshy copies the picture, mistakes and all. Clean it and make it big. Get a yes on the
  picture before paying for a model. Tested on one set of models: a floor, water or a second fin in the picture became
  a floor disc or a second tail, and very small pictures gave wrong body shapes. A wrong picture is cheap to redo and
  a wrong model costs far more.
- **Back, side and sheet views.** Rule: use one front picture only, redrawn by Meshy's Agent from a big blow-up of the
  design. Tested on one set of models: back views drew a tail's base as an extra leg, unmatched front and back
  pictures gave the wrong number of limbs, and one sheet of small views spoiled a model. Doubt: front-only also
  failed. See "Not settled".
- **Prompts.** Rule: short, positive, must-haves first. Say sizes and joins in plain words. Tested on one set of
  models: Meshy's Agent writes its own prompt from ours and drops lines. A long retexture prompt with a "no <colour>
  spots" line came back worse. Lines like "solid matte colours" made Meshy drop raised detail, and naming a colour for
  one detail could turn the whole model that colour. Loose pieces were fixed by a new run with "grow solidly out of the
  body, sunk into it like one piece". Doubt: nobody tested which lines survive.
- **Picture edits.** Rule: if they mostly like it, edit it. If not, redraw it from the plain picture with one prompt
  line changed. Number every change. Say what stays on each part you change. Attach only the plain picture: Meshy
  copies what it sees. Tested on one set of models: an edit that removed one detail also wiped a neighbouring one, and
  asking to take a part away could add one on the other side. Doubt: one sitting on one model.
- **Paint.** Rule: fix it in Meshy, never by script. Retexture the whole model first, with the approved front picture
  as the reference. Fix spots last with Texture Edit, because a retexture undoes them. A retexture fixes paint, never
  shape. Tested on one set of models: script repaints looked worse than a plain retexture, a text-only retexture
  changed every colour, and renders of our own as the reference carried their flaws. The Agent chat cannot fix a
  spot. A detail missing from both the colour and the bump texture cannot be added by retexture. Doubt: the notes say
  to use Texture Edit's Healing brush but record no result from it.
- **Triangle counts and remesh.** Rule: low counts cost detail and sharp paint. Skip Remesh when the model is already
  under the limit. Tested on one set of models: a full-detail model kept crisp details, a hard cut-down crumpled them,
  and Remesh on top of a low-triangle model mangled a part. Quad remesh gave holes and looked blobbier. Doubt: one
  test each.
- **Clean shading.** Rule: always on. It clears Meshy's own normals and smooths only below 30 degrees. Never use a
  file made with `--flat 0`. Tested on one set of models: it fixed dents on flat surfaces and kept Meshy's colours.
  Doubt: some dents are in the shape itself, and the last faint creases come from Meshy's bump texture.
- **Glow parts.** Rule: make a glowing detail its own part named `Glow_`, shaped like the real detail, smaller than
  the painted glow, with a dark part inside where it fits. Tested on one set of models: Meshy turns a glow colour into
  a soft cloud that looks very low quality, and `Glow_` parts come into Roblox dark grey until each is set to Neon.
  Doubt: a script that sharpened the glow made jagged edges and was dropped.

## Settings used

Meshy's versions and prices change often. Check the card in Meshy before you trust any number here.

- **Model (last used):** Image to 3D, Smart Topology (the card should say T2.5), target 900 under the triangle limit,
  texture 4K, no pose, licence Private.
- **Older model:** High Detail, Ultra 2K, newest texture model at 2K, Image Enhancement on, no pose.
- **Prices (Meshy's pricing page and changelog, as last read):** Smart Topology T2.5 (100 to 30,000 triangles) with a
  2K or 4K texture is about 15 credits. Remesh 5. Retexture 10. The N1 retexture (colour only, no words) 10.
  Multi-image input does not take T2.5. An Agent picture was about 12 credits. A sensible spending cap is 60 credits a
  model and 300 a set: agree one with the person.
- **Front picture:** a new Meshy 3D Agent chat, only the plain 4x picture attached, Meshy's Roblox skill off. The Agent
  does not build the model. Keep Meshy's full-size download (chat pastes are 384 to 640 pixels).
- **Retexture:** highest texture size, approved front picture as reference, a short positive prompt.
- **Texture Edit:** open the textured model from the list of generations, then Edit Texture in the viewer's toolbar.
  Computer only. Saving needs a paid plan. Click Apply, then Save to Model.

## Finishing a Meshy model for Roblox

The chain is `.claude/skills/make-model/kit/meshy/finish_meshy.sh`. Run it from the model's own draft folder:
`finish_meshy.sh <meshy.blend> <height in studs> <Name> <picture.png>`

- Options go in as environment variables: `LABEL` names this try (default Remesh), `OUT` is the output folder,
  `FORCE=1` replaces an output folder that is already there, `PARTS` (default 6), `TURN` (default 180), `BLENDER` (path
  to Blender if it is not on the PATH), `PY` (a Python with Pillow and numpy).
- It pulls the textures out. It splits the model into parts with a 1024 texture each. It cleans the shading. It sizes
  the model in studs. It turns it to face Roblox's front. It exports the .glb. It makes a check sheet.
- It needs Blender 4.1 or newer, and a Python with Pillow and numpy: by default at `~/.venvs/meshy-kit` (the script
  prints the command that makes it, and asks you to run it once: it downloads packages). It runs on Mac, Linux and WSL.
- Run every Blender job in the foreground. One left in the background stopped partway with no error.
- A Meshy file costs credits. Never save over one. A new try gets a new name.
- Getting the model into Studio: see the "Models" section of `.claude/roblox/LESSONS.md`.
- Tested on one set of models. No model finished this way has had a final yes yet.

## Checking a model

- **Check against the design picture, never against Meshy's own file.** Proof: checks that compared our files with
  Meshy's passed models the person disliked.
- **Use the same fixed views every time:** front, three-quarter, side, back and a face close-up, beside the design
  picture. Count legs, arms and tails from four sides.
- **Find flaws before the person does.** A fresh reviewer gets only the design picture and the renders. This is a
  first pass, never a verdict.
- **Sort every flaw.** Shape goes back for a new model run. Paint goes back to Meshy. Only parts, size and facing are
  ours to fix. A loose piece is fine if its gap to the body is under 0.1 studs.

## Not settled

The notes disagree here, or nothing was tested. Both sides are listed. No winner is picked.

- **Which way to check facing.** Side A: check the front in Roblox, not only in the file. A model exported with its
  front at -Z came into Roblox facing backwards. Side B: trust the Blender check sheet, not Studio. A model dropped
  into Studio can arrive turned even when the file is right, so turn the copy and leave the file. Re-turning a file by
  90 degrees cost a round.
- **Cutting triangles in Blender, or making the model low in Meshy.** For Blender: a set cut down and baked part by
  part passed; a Decimate that kept Meshy's own paint left details raised and no smears, but nobody judged it. Against
  Blender: a hard bake to a low count flattened raised details and crumpled small parts, and the person may rule
  cut-downs out. For Meshy: the last rule was Smart Topology at 900 under the limit. Against Meshy: a low count there
  gave a blurry texture.
- **Smart Topology or High Detail.** One test found Smart Topology blurrier, maybe on an older version. It later
  became the rule. The notes do not say how it ended.
- **Front picture only, or more views.** Front-only failed for bigger models. A model from front, back and side
  pictures looked good but had loose pieces. Later front-only became the rule.
- **"Roblox shows a texture at 1024 at most".** The split into parts rests on this. No source is given.

## Ruled out

- **Script colour fixes on top of Meshy's paint.** Retexturing in Meshy beat every script repaint tried. Fix paint in
  Meshy.
- **Reshaping or rebuilding a model the person made.** If the job is to animate it, animate it: no reshaping, no
  rebuilding in Blender. Allowed: deleting separate loose pieces, adding details in rows, fixing a spot the person
  names.
- **Code-built bodies passed off as a Meshy model, and hybrids** (Meshy's head on a code-built body). Both look poor.
  Do not build or offer either unless the person asks.
