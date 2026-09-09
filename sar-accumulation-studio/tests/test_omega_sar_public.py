from pathlib import Path
import h5py
import numpy as np
from processor.omega_sar import NisarProduct, render_stack_gif
from processor.nisar_gcov import export_gcov


def fixture(path):
    with h5py.File(path,'w') as h5:
        g=h5.create_group('/science/LSAR/GCOV/grids/frequencyA')
        g.create_dataset('xCoordinates',data=np.array([500000.,500020.,500040.]))
        g.create_dataset('yCoordinates',data=np.array([3600040.,3600020.]))
        p=g.create_dataset('projection',data=np.int32(32612));p.attrs['epsg_code']='EPSG:32612'
        a=np.array([[1.,2.,3.],[2.,3.,4.]],dtype='f4')
        g.create_dataset('HHHH',data=a);g.create_dataset('mask',data=np.ones_like(a,dtype='u1'));g.create_dataset('numberOfLooks',data=np.full_like(a,4));g.create_dataset('rtcGammaToSigmaFactor',data=np.ones_like(a))


def test_heavy_processor_public_api_is_real(tmp_path):
    f=tmp_path/'scene.h5';fixture(f)
    inspected=NisarProduct(f).inspect()
    assert inspected.product == 'GCOV'
    assert any(d.term == 'HHHH' for d in inspected.datasets)
    measured=NisarProduct(f).read_gcov('A','HHHH')
    assert measured.dataset_path.endswith('/HHHH') and measured.manifest()['semantics']['inferred'] is False


def test_registered_gif_is_display_only(tmp_path):
    manifests=[]
    for i in range(2):
        f=tmp_path/f'scene{i}.h5';fixture(f)
        m=export_gcov(f,tmp_path/f'out{i}','A','HHHH');manifests.append(m['manifest_path'])
    result=render_stack_gif(manifests,tmp_path/'timeline.gif')
    assert result['frame_count'] == 2
    assert result['display_only'] is True and result['scientific_values_modified'] is False
    assert Path(result['output']).exists()
