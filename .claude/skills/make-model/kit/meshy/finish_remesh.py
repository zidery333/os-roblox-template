"""Pull a Meshy Remesh file's colour AND normal map (the bump detail) out as PNGs, for split_sharp.py. The model is
not touched: resizing the mesh here broke Meshy's shading, so split_sharp.py does the sizing (--height) instead.
Run: blender -b --factory-startup -P finish_remesh.py -- --src <Remesh.blend> --out <dir> --name <Name> [--height <studs>]
Needs Blender (your own install) and numpy in Blender's Python. Exits 1 with a usage line if an option is missing.
"""
import bpy, sys, os
import numpy as np
from mathutils import Matrix
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []; A = {A[i].lstrip('-'): A[i + 1] for i in range(0, len(A) - 1, 2)}
if not all(k in A for k in ('src', 'out', 'name')):
    print('Usage: blender -b --factory-startup -P finish_remesh.py -- --src <Remesh.blend> --out <dir> --name <Name> [--height <studs>]'); sys.exit(1)
OUT = A['out']; NAME = A['name']; H = float(A.get('height', 1)); os.makedirs(OUT, exist_ok=True)
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
with bpy.data.libraries.load(A['src'], link=False) as (fr, to): to.objects = list(fr.objects)
o = next(x for x in to.objects if x and x.type == 'MESH'); bpy.context.scene.collection.objects.link(o)
co = np.empty(len(o.data.vertices) * 3); o.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
mn, mx = co.min(0), co.max(0); s = H / (mx[2] - mn[2]); c = (mn + mx) / 2
o.name = NAME
nt = o.data.materials[0].node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
def feeding(sock):
    for l in nt.links:
        if l.to_socket == sock:
            n = l.from_node
            while n.type != 'TEX_IMAGE' and n.inputs and any(i.is_linked for i in n.inputs):
                n = next(i.links[0].from_node for i in n.inputs if i.is_linked)
            return n.image if n.type == 'TEX_IMAGE' else None
col = feeding(bsdf.inputs['Base Color']); nor = feeding(bsdf.inputs['Normal'])
for im, kind in ((col, 'Color'), (nor, 'Normal')):
    if not im: print('[fin] no', kind, 'texture found'); continue
    im.filepath_raw = os.path.join(OUT, f'{NAME}_{kind}_{im.size[0]}.png'); im.file_format = 'PNG'; im.save()
    print('[fin]', kind, im.size[:], '->', im.filepath_raw)
tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
print('[fin] triangles', tris, '| size', [round(float(v), 2) for v in (mx - mn) * s])
