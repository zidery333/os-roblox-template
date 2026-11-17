"""Render a model (a .blend or a .glb) from six angles, framed to its size, for checking.
Run: blender -b --factory-startup -P views.py -- <model.blend|model.glb> <out prefix> [turned]   (needs Blender, your own install)
Add "turned" after the prefix for a file already turned for Roblox. Writes <prefix>_front34.png, _side.png (from +X), _otherside.png (from -X), _back.png, _backleft34.png, _top.png.
Front is Blender -Y in the .blend and in an imported .glb alike. Exits 1 with a usage line if given no model or no prefix, or the model has no mesh."""
import bpy, sys
from mathutils import Vector
args_ = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
if len(args_) < 2: print('Usage: blender -b --factory-startup -P views.py -- <model.blend|model.glb> <out prefix> [turned]'); sys.exit(1)
src, out = args_[:2]; TURNED = len(args_) > 2 and args_[2] == 'turned'   # 'turned': a file already turned to face Roblox's front (its face is at +Y here)
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
if src.endswith('.glb'): bpy.ops.import_scene.gltf(filepath=src)
else:
    with bpy.data.libraries.load(src, link=False) as (fr, to): to.objects = list(fr.objects)
    for o in to.objects:
        if o and o.type == 'MESH': bpy.context.scene.collection.objects.link(o)
bpy.context.view_layer.update()
ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if not ms: print('no mesh found in', src); sys.exit(1)
pts = [o.matrix_world @ v.co for o in ms for v in o.data.vertices]
mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)]); c = (mn + mx) / 2
R = (mx - mn).length
sc = bpy.context.scene; 
for _e in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try: sc.render.engine = _e; break
    except TypeError: pass
sc.render.resolution_x = sc.render.resolution_y = 800
w = bpy.data.worlds.new('w'); sc.world = w; w.color = (0.42, 0.44, 0.5)
cam = bpy.data.cameras.new('c'); co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co; cam.type = 'ORTHO'
cam.ortho_scale = R * 0.95
for i, rot in enumerate([(0.8, 0.2, 0.6), (0.9, 0.2, 3.6)]):
    s = bpy.data.lights.new('s%d' % i, 'SUN'); s.energy = 2.6 if i == 0 else 1.6
    so = bpy.data.objects.new('s%d' % i, s); sc.collection.objects.link(so); so.rotation_euler = rot
for name, d in {'front34': (-0.7, -1, 0.35), 'side': (1, 0, 0.1), 'otherside': (-1, 0, 0.1), 'back': (0, 1, 0.15),
                'backleft34': (-0.8, 1, 0.45), 'top': (0.001, 0.05, 1)}.items():
    dv = Vector(d).normalized()
    if TURNED: dv.x, dv.y = -dv.x, -dv.y
    co.location = c + dv * R * 3
    co.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{out}_{name}.png'; bpy.ops.render.render(write_still=True)
