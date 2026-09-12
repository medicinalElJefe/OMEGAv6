from __future__ import annotations
import importlib.util
import json
import pathlib
import sys
import tempfile
import types

ROOT=pathlib.Path(__file__).resolve().parents[1]
GPU=ROOT/'native'/'r291_gpu'

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    if spec is None or spec.loader is None: raise ImportError(f'cannot load {name} from {path}')
    module=importlib.util.module_from_spec(spec)
    sys.modules[name]=module
    spec.loader.exec_module(module)
    return module

parent=load('r291_parenting_compiler',GPU/'parenting_compiler.py')
compiled=parent.compile_atlas('r291-ci-native-gpu-proof')
checks=parent.validate(compiled)
assert checks['pass'],checks
assert compiled.packet_data.shape==(20736,20)
assert compiled.parent_edges.shape==(20735,2)
assert compiled.ancestry.shape==(20736,4)
assert compiled.metadata['packet_count']==20736
assert compiled.metadata['edge_count']==20735
assert compiled.metadata['parent_rule']=='layer -> regulation -> phase -> domain'

# Load supersampler as a package so its relative import resolves.
pkg=types.ModuleType('r291_gpu');pkg.__path__=[str(GPU)];sys.modules['r291_gpu']=pkg
sys.modules['r291_gpu.parenting_compiler']=parent
sup=load('r291_gpu.hierarchical_supersampler',GPU/'hierarchical_supersampler.py')

from PIL import Image,ImageDraw
with tempfile.TemporaryDirectory() as td:
    td=pathlib.Path(td);src=td/'source.png';out=td/'out'
    im=Image.new('RGBA',(96,64),(0,0,0,0));d=ImageDraw.Draw(im);d.rectangle((8,8,88,56),fill=(40,90,140,255));d.ellipse((24,8,72,56),fill=(220,180,80,255));im.save(src)
    audit=sup.render_hierarchical(sup.RenderConfig(image=str(src),output_dir=str(out),width=192,height=128,seed='r291-ci-native-gpu-proof',iterations=2,tile_rows=32,closure='bounded',tolerance=8.0,detail_strength=.30))
    assert audit['atlas']['parents']==20736
    assert audit['atlas']['compiler_checks']['pass'] is True
    assert audit['passes'][-1]['rmse']<audit['initial']['rmse']
    assert audit['final']['max_error']<=8.0
    assert audit['final']['open_gap_pixels']==0
    assert audit['cell_gap_summary']['status_counts']['OPEN']==0
    assert audit['cell_gap_summary']['status_counts']['CRITICAL']==0
    assert 'does not invent unseen photoreal detail' in audit['claim_boundary']
    assert pathlib.Path(audit['final']['output']).is_file()
    print(json.dumps({'compiler':checks,'initial_rmse':audit['initial']['rmse'],'preclosure_rmse':audit['preclosure']['rmse'],'final':audit['final'],'cell_gap_summary':audit['cell_gap_summary'],'claim_boundary':audit['claim_boundary']},indent=2))

print('R291 NATIVE GPU DONOR PASS · deterministic 20,736 parent lattice · bounded supersampling reconstruction · zero open gaps at declared tolerance')
