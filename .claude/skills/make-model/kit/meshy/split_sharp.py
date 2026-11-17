"""Keep all of a texture's detail in Roblox: Roblox shows each MeshPart's texture at 1024 at most, so a 2048 texture
on one part loses 3/4 of its pixels. This splits the model into N parts (by where its faces are), gives each part its
own UV layout and its own 1024 colour (and normal) texture copied from the 2048 ones, so the model keeps 2048-level
detail. The shape is not changed at all; nothing is decimated or re-shaped.
Run: blender -b --factory-startup -P split_sharp.py -- --src <Model.blend> --color <Color_2048.png> [--normal <Normal_2048.png>]
     --out <dir> --name <Name> [--parts 4 --size 1024] [--height <studs>] [--turn <degrees>] [--flat 30]
Needs Blender 4.1 or newer (your own install). Exits 1 with a usage line if --src, --color, --out or --name is missing.
"""
import bpy, bmesh, sys, os
import numpy as np
if bpy.app.version < (4, 1, 0):
    print('Blender 4.1 or newer is needed (found %s). Get it from blender.org, or set BLENDER=<path>.' % '.'.join(map(str, bpy.app.version))); sys.exit(1)
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []; A = {A[i].lstrip('-'): A[i + 1] for i in range(0, len(A) - 1, 2)}
if not all(k in A for k in ('src', 'color', 'out', 'name')):
    print('Usage: blender -b --factory-startup -P split_sharp.py -- --src <Model.blend> --color <Color.png> [--normal <Normal.png>] --out <dir> --name <Name>'); sys.exit(1)
OUT = A['out']; NAME = A['name']; N = int(A.get('parts', 4)); S = int(A.get('size', 1024)); os.makedirs(OUT, exist_ok=True)
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
with bpy.data.libraries.load(A['src'], link=False) as (fr, to): to.objects = list(fr.objects)
src = next(x for x in to.objects if x and x.type == 'MESH'); bpy.context.scene.collection.objects.link(src)
col = bpy.data.images.load(A['color']); nor = bpy.data.images.load(A['normal']) if 'normal' in A else None
if nor: nor.colorspace_settings.name = 'Non-Color'
# 0. clean shading (default on; --flat 0 turns it off): Meshy's remesh carries hand-set normals that follow the
#    crumpled triangles of flat surfaces, so flat faces show dents and creases. Clear
#    them and shade smooth only across gentle angles: flat stays flat, rounded stays round, and Meshy's bump map then
#    sits on clean surfaces. The shape is not changed.
if A.get('flat', '30') != '0':
    import math
    for x in bpy.context.view_layer.objects: x.select_set(x == src)
    bpy.context.view_layer.objects.active = src
    try: bpy.ops.mesh.customdata_custom_splitnormals_clear()
    except Exception as e: print('[split] could not clear normals:', e)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(float(A.get('flat', '30'))))
    print('[split] clean shading: flat surfaces shade flat (smooth below', A.get('flat', '30'), 'degrees)')
# 1. which part each face goes to: k-means on face centres, but whole loose pieces stay together (no cut seams
#    through a piece); parts are balanced by surface area so each gets a fair share of texture
me = src.data; bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
island = [-1] * len(bm.faces); isl = 0
for f in bm.faces:
    if island[f.index] >= 0: continue
    st = [f]; island[f.index] = isl
    while st:
        g = st.pop()
        for e in g.edges:
            for h in e.link_faces:
                if island[h.index] < 0: island[h.index] = isl; st.append(h)
    isl += 1
island = np.array(island); cen = np.array([f.calc_center_median()[:] for f in bm.faces]); area = np.array([f.calc_area() for f in bm.faces])
# the biggest piece (the body) is split by position; small pieces follow the part nearest their centre
rng = np.random.default_rng(3); big = np.bincount(island, weights=area).argmax()
pts = cen[island == big]; w = area[island == big]
cent = pts[rng.choice(len(pts), N, replace=False, p=w / w.sum())]
for _ in range(40):
    lab = ((pts[:, None] - cent[None]) ** 2).sum(-1).argmin(1)
    cent = np.array([np.average(pts[lab == k], 0, w[lab == k]) if (lab == k).any() else cent[k] for k in range(N)])
part = ((cen[:, None] - cent[None]) ** 2).sum(-1).argmin(1)
for i in range(isl):
    if i == big: continue
    k = island == i; c = np.average(cen[k], 0, area[k]); part[k] = ((cent - c) ** 2).sum(-1).argmin()
bm.free()
print('[split] parts by area:', [round(float(area[part == k].sum()), 2) for k in range(N)])
# 2. each part: its own object, its own UV layout, its colour (and normal) copied from the source textures
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 4
objs = []
# cut into parts with Blender's own separate (keeps the shading normals exactly; cutting by hand scrambled them)
work = src.copy(); work.data = src.data.copy(); sc.collection.objects.link(work)
for i in range(N): work.data.materials.append(bpy.data.materials.new(f'part{i}'))
mi = np.array(part, np.int32); work.data.polygons.foreach_set('material_index', mi + len(src.data.materials))
for x in bpy.context.view_layer.objects: x.select_set(x == work)
bpy.context.view_layer.objects.active = work
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='MATERIAL'); bpy.ops.object.mode_set(mode='OBJECT')
pieces = {}
for x in list(bpy.context.view_layer.objects):
    if x.type == 'MESH' and x != src and len(x.data.polygons):
        nm = x.data.materials[x.data.polygons[0].material_index].name if x.data.materials else ''
        if nm.startswith('part'): pieces[int(nm[4:].split('.')[0])] = x
for k in range(N):
    o = pieces[k]; o.name = o.data.name = f'{NAME}_Part{k + 1}'
    o.data.uv_layers[0].name = 'MeshyUV'; o.data.uv_layers.new(name='UVMap')
    old = o.data.uv_layers['MeshyUV']; new = o.data.uv_layers['UVMap']        # fetched again: adding a layer moves them
    # new layout: Meshy's own islands kept (copied), re-packed to fill this part's texture
    uv = np.empty(len(o.data.loops) * 2, np.float32); old.data.foreach_get('uv', uv); new.data.foreach_set('uv', uv)
    o.data.uv_layers.active = new
    for x in bpy.context.view_layer.objects: x.select_set(x == o)
    bpy.context.view_layer.objects.active = o; bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.select_all(action='SELECT'); bpy.ops.uv.pack_islands(rotate=True, scale=True, margin_method='FRACTION', margin=0.004)
    bpy.ops.object.mode_set(mode='OBJECT')
    chk = np.empty(len(o.data.loops) * 2, np.float32); o.data.uv_layers['MeshyUV'].data.foreach_get('uv', chk)
    chk2 = np.empty(len(o.data.loops) * 2, np.float32); o.data.uv_layers['UVMap'].data.foreach_get('uv', chk2)
    print('[split] Meshy layout unchanged:', bool(np.allclose(chk, uv)), '| new layout packed:', not np.allclose(chk2, uv))
    def copy_tex(img, kind):
        m = bpy.data.materials.new('copy'); nt = m.node_tree
        for n in list(nt.nodes): nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial'); uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'MeshyUV'
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; t.interpolation = 'Cubic'; nt.links.new(uvn.outputs[0], t.inputs['Vector'])
        if kind == 'Normal':
            nm = nt.nodes.new('ShaderNodeNormalMap'); nm.uv_map = 'MeshyUV'; nt.links.new(t.outputs['Color'], nm.inputs['Color'])
            bs = nt.nodes.new('ShaderNodeBsdfDiffuse'); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal']); nt.links.new(bs.outputs[0], out.inputs[0])
        else:
            em = nt.nodes.new('ShaderNodeEmission'); nt.links.new(t.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], out.inputs[0])
        tgt = bpy.data.images.new(f'{o.name}_{kind}', S * 2, S * 2, alpha=False)
        if kind == 'Normal': tgt.colorspace_settings.name = 'Non-Color'
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = tgt; nt.nodes.active = tn
        o.data.materials.clear(); o.data.materials.append(m)
        bk = sc.render.bake; bk.use_selected_to_active = False; bk.margin = 16; bk.use_clear = True
        bpy.ops.object.bake(type='NORMAL' if kind == 'Normal' else 'EMIT', normal_space='TANGENT', uv_layer='UVMap')
        bpy.data.materials.remove(m)
        if kind == 'Color':   # check: each face's colour in the new texture matches the source texture under it
            def arr(im):
                a = np.empty(im.size[0] * im.size[1] * 4, np.float32); im.pixels.foreach_get(a); return a.reshape(im.size[1], im.size[0], 4)
            a_t, a_s = arr(tgt), arr(img); d = []
            mu, nu = o.data.uv_layers['MeshyUV'].data, o.data.uv_layers['UVMap'].data
            for poly in list(o.data.polygons)[::7]:
                ms = np.mean([mu[i].uv[:] for i in poly.loop_indices], 0); ns = np.mean([nu[i].uv[:] for i in poly.loop_indices], 0)
                cs = a_s[int(ms[1] % 1 * a_s.shape[0]), int(ms[0] % 1 * a_s.shape[1]), :3]; ct = a_t[int(ns[1] * a_t.shape[0]), int(ns[0] * a_t.shape[1]), :3]
                d.append(np.abs(cs - ct).mean())
            print('[split]', o.name, 'colour check: mean difference', round(float(np.mean(d)), 3), 'worst', round(float(np.max(d)), 3))
        tgt.scale(S, S)
        if 'salt' in A:   # change one corner pixel a hair, so Roblox treats it as a new image (a stuck review is keyed to the image's exact content)
            px_ = np.array(tgt.pixels[:], np.float32); px_[0] = (px_[0] + int(A['salt']) / 255.0) % 1.0; tgt.pixels.foreach_set(px_)
        tgt.filepath_raw = os.path.join(OUT, f'{o.name}_{kind}.png'); tgt.file_format = 'PNG'; tgt.save(); return tgt
    cimg = copy_tex(col, 'Color'); nimg = copy_tex(nor, 'Normal') if nor else None
    # keep only the new layout: copy it into the first layer and drop the second (removing the first one scrambled
    # the layout in Blender 5.2 when faces had been deleted)
    nu = np.empty(len(o.data.loops) * 2, np.float32); o.data.uv_layers['UVMap'].data.foreach_get('uv', nu)
    o.data.uv_layers.remove(o.data.uv_layers['UVMap']); first = o.data.uv_layers[0]; first.name = 'UVMap'
    first.data.foreach_set('uv', nu); o.data.uv_layers.active = first; first.active_render = True
    back = np.empty(len(o.data.loops) * 2, np.float32); o.data.uv_layers['UVMap'].data.foreach_get('uv', back)
    print('[split]', o.name, 'layout kept after clean-up:', bool(np.allclose(back, nu)))
    m = bpy.data.materials.new(o.name); nt = m.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Roughness'].default_value = 0.75
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = cimg; nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
    if nimg:
        t2 = nt.nodes.new('ShaderNodeTexImage'); t2.image = nimg; nm = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(t2.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    o.data.materials.clear(); o.data.materials.append(m); objs.append(o)
    print('[split]', o.name, sum(len(p.vertices) - 2 for p in o.data.polygons), 'triangles')
bpy.data.objects.remove(src)
bpy.context.view_layer.update()
if 'height' in A:      # size in studs, bottom at 0, centred: Blender's own apply-scale keeps the shading normals right
    pts = np.array([o.matrix_world @ v.co for o in objs for v in o.data.vertices])
    mn, mx = pts.min(0), pts.max(0); s_ = float(A['height']) / (mx[2] - mn[2])
    for o in objs:
        o.location = (-(mn[0] + mx[0]) / 2 * s_, -(mn[1] + mx[1]) / 2 * s_, -mn[2] * s_); o.scale = (s_, s_, s_)
    for x in bpy.context.view_layer.objects: x.select_set(x in objs)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    print('[split] sized to', A['height'], 'studs tall')
if 'turn' in A:        # Meshy's front ends up at +Z in the .glb, which Roblox shows facing backwards: turn it round (--turn 180)
    import math
    for o in objs: o.rotation_mode = 'XYZ'; o.rotation_euler = (0, 0, math.radians(float(A['turn'])))   # Meshy objects use quaternions: switch first or the turn is ignored
    for x in bpy.context.view_layer.objects: x.select_set(x in objs)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    print('[split] turned', A['turn'], 'degrees')
for x in bpy.context.view_layer.objects: x.select_set(x in objs)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, NAME + '.glb'), export_format='GLB', use_selection=True,
                          export_animations=False, export_skins=False, export_yup=True, export_apply=True)
bpy.ops.export_scene.fbx(filepath=os.path.join(OUT, NAME + '.fbx'), use_selection=True, object_types={'MESH'},
                         bake_anim=False, path_mode='COPY', embed_textures=True, axis_forward='-Z', axis_up='Y',
                         apply_scale_options='FBX_SCALE_ALL', mesh_smooth_type='FACE')
for im in list(bpy.data.images):
    if im.users == 0: bpy.data.images.remove(im)
bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, NAME + '.blend'), compress=True)
for f in os.listdir(OUT):
    if f.endswith('.blend1'): os.remove(os.path.join(OUT, f))
print('[split] exported', NAME, 'in', N, 'parts')
