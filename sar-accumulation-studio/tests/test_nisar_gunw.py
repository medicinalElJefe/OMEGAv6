from pathlib import Path

import h5py
import numpy as np
import pytest
import rasterio

from processor.omega_sar import (
    export_gunw,
    parse_gunw_granule_name,
    phase_to_range_change_m,
    read_gunw,
)


def fixture(path: Path, group_name='unwrappedInterferogram'):
    with h5py.File(path, 'w') as h5:
        root = h5.create_group('/science/LSAR/GUNW/grids/frequencyA')
        root.create_dataset('projection', data=np.int32(32612))
        layer = root.create_group(group_name)
        layer.create_dataset('xCoordinates', data=np.array([500000., 500080., 500160.]))
        layer.create_dataset('yCoordinates', data=np.array([3600080., 3600000.]))
        layer.create_dataset('mask', data=np.ones((2, 3), dtype='u1'))
        pol = layer.create_group('HH')
        phase = np.array([[1., 2., 3.], [4., 5., 6.]], dtype='f4')
        pol.create_dataset('unwrappedPhase', data=phase)
        pol.create_dataset('coherenceMagnitude', data=np.array([[.9, .8, .7], [.6, .5, .4]], dtype='f4'))
        pol.create_dataset('connectedComponents', data=np.ones((2, 3), dtype='u4'))
        pol.create_dataset('ionospherePhaseScreen', data=np.full((2, 3), .2, dtype='f4'))
        pol.create_dataset('ionospherePhaseScreenUncertainty', data=np.full((2, 3), .05, dtype='f4'))
        metadata = h5.create_group('/science/LSAR/GUNW/metadata')
        center = metadata.create_dataset('centerFrequency', data=np.float64(1.257e9))
        center.attrs['units'] = 'Hz'
    return phase


def test_reads_documented_unwrapped_interferogram_hierarchy(tmp_path):
    f = tmp_path / 'NISAR_L2_PR_GUNW_001_030_A_019_002_2000_SH_20260617T000000_20260617T000030_20260629T000000_20260629T000030_P05023_P_F_J_001.h5'
    phase = fixture(f)
    r = read_gunw(f)
    assert r.phase_path.endswith('/unwrappedInterferogram/HH/unwrappedPhase')
    assert np.allclose(r.unwrapped_phase, phase)
    assert r.qa_valid.all()
    assert r.wavelength_m is not None and r.wavelength_m > 0
    assert any('NOT applied' in w for w in r.warnings)
    manifest = r.manifest()
    assert manifest['evidence_class'] == 'SOURCE_PRODUCT_DERIVED_GUNW'
    assert manifest['semantics']['signed_displacement_emitted'] is False
    assert manifest['granule']['reference_start_time'] == '20260617T000000'
    assert manifest['granule']['secondary_start_time'] == '20260629T000000'


def test_accepts_newer_interferogram_group_variant(tmp_path):
    f = tmp_path / 'gunw.h5'
    fixture(f, 'interferogram')
    r = read_gunw(f)
    assert '/interferogram/HH/unwrappedPhase' in r.phase_path


def test_qa_honors_coherence_components_and_mask(tmp_path):
    f = tmp_path / 'gunw.h5'
    fixture(f)
    with h5py.File(f, 'r+') as h5:
        base = '/science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram'
        h5[f'{base}/HH/coherenceMagnitude'][0, 0] = .1
        h5[f'{base}/HH/connectedComponents'][0, 1] = 0
        h5[f'{base}/mask'][0, 2] = 0
    r = read_gunw(f, min_coherence=.3)
    assert not r.qa_valid[0, 0] and not r.qa_valid[0, 1] and not r.qa_valid[0, 2]
    assert r.qa_valid[1].all()
    assert r.manifest()['qa_valid_fraction'] == pytest.approx(.5)


def test_signed_range_change_requires_explicit_convention():
    phase = np.array([1.0])
    with pytest.raises(ValueError, match='EXPLICIT_PHASE_TO_RANGE_SIGN'):
        phase_to_range_change_m(phase, .24, None)
    assert np.allclose(phase_to_range_change_m(phase, .24, +1), phase * .24 / (4 * np.pi))
    assert np.allclose(phase_to_range_change_m(phase, .24, -1), -phase * .24 / (4 * np.pi))


def test_export_preserves_phase_and_corrections_separately(tmp_path):
    f = tmp_path / 'gunw.h5'
    fixture(f)
    m = export_gunw(f, tmp_path / 'out')
    assert 'unwrapped_phase_rad' in m['products'] and 'coherence' in m['products']
    assert 'ionosphere_phase_rad' in m['products'] and 'signed_range_change_m' not in m['products']
    assert m['semantics']['ionosphere_applied'] is False
    with rasterio.open(m['products']['unwrapped_phase_rad']) as ds:
        assert ds.crs.to_epsg() == 32612
        assert ds.tags()['OMEGA_KIND'] == 'SOURCE_PRODUCT_DERIVED_GUNW'


def test_explicit_signed_export_is_slant_range_and_records_convention(tmp_path):
    f = tmp_path / 'gunw.h5'
    fixture(f)
    m = export_gunw(f, tmp_path / 'out', phase_to_range_sign=-1)
    assert 'signed_range_change_m' in m['products']
    assert m['semantics']['signed_displacement_emitted'] is True
    assert m['semantics']['phase_to_range_sign'] == -1
    assert m['semantics']['range_change_is_slant_range_not_vertical_displacement'] is True
    with rasterio.open(m['products']['signed_range_change_m']) as ds:
        assert ds.tags()['OMEGA_KIND'] == 'DERIVED_FROM_SOURCE_GUNW_PHASE'
        assert ds.tags()['IONOSPHERE_APPLIED'] == 'false'


def test_gunw_filename_parser_never_invents_pair_times():
    parsed = parse_gunw_granule_name('gunw-without-standard-times.h5')
    assert parsed['product'] == 'GUNW'
    assert 'reference_start_time' not in parsed
    assert parsed['maturity'] == 'UNKNOWN'
