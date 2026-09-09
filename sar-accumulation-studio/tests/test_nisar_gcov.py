import json
from pathlib import Path
import h5py
import numpy as np
import rasterio

from processor.nisar_gcov import apply_provisional_phase_correction, export_gcov, parse_granule_name, power_to_db, read_gcov


def fixture(path: Path, frequency="A"):
    with h5py.File(path, "w") as h5:
        g = h5.create_group(f"/science/LSAR/GCOV/grids/frequency{frequency}")
        g.create_dataset("xCoordinates", data=np.array([500000., 500020., 500040., 500060.]))
        g.create_dataset("yCoordinates", data=np.array([3600060., 3600040., 3600020.]))
        p = g.create_dataset("projection", data=np.int32(32612)); p.attrs["epsg_code"] = "EPSG:32612"
        gamma = np.array([[1,2,3,4],[2,4,6,8],[3,6,9,12]], dtype="f4")
        g.create_dataset("HHHH", data=gamma)
        g.create_dataset("numberOfLooks", data=np.full(gamma.shape, 4, dtype="f4"))
        g.create_dataset("mask", data=np.ones(gamma.shape, dtype="u1"))
        g.create_dataset("rtcGammaToSigmaFactor", data=np.full(gamma.shape, 2, dtype="f4"))
        g.create_dataset("HHHV", data=(gamma + 1j * gamma).astype("c8"))
    return gamma


def test_parse_name_provisional():
    name = "NISAR_L2_PR_GCOV_001_001_A_001_4005_DHDH_A_20260617T000000_20260617T000030_P05023_P_F_J_001.h5"
    p = parse_granule_name(name)
    assert p["product"] == "GCOV" and p["crid"] == "P05023" and p["maturity"] == "PROVISIONAL"


def test_read_diagonal_and_sigma(tmp_path):
    f = tmp_path / "NISAR_L2_PR_GCOV_001_001_A_001_4005_DHDH_A_20260617T000000_20260617T000030_P05023_P_F_J_001.h5"
    gamma = fixture(f)
    r = read_gcov(f, "A", "HHHH")
    assert r.epsg == 32612 and r.shape == (3,4)
    assert np.allclose(r.gamma0, gamma)
    assert np.allclose(r.sigma0, gamma * 2)
    assert r.qa_valid.all()
    assert r.manifest()["semantics"]["inferred"] is False


def test_frequency_b_warning(tmp_path):
    f = tmp_path / "test.h5"; fixture(f, "B")
    r = read_gcov(f, "B", "HHHH")
    assert any("Frequency B" in w for w in r.warnings)


def test_off_diagonal_phase_correction(tmp_path):
    f = tmp_path / "test.h5"; fixture(f)
    r = read_gcov(f, "A", "HHHV")
    assert r.phase_correction["applied"] is True
    assert r.phase_correction["degrees"] == -59.0


def test_export_geotiff_and_manifest(tmp_path):
    f = tmp_path / "test.h5"; fixture(f)
    out = tmp_path / "out"; m = export_gcov(f, out, "A", "HHHH")
    assert "gamma0_db" in m["products"] and "sigma0_db" in m["products"]
    with rasterio.open(m["products"]["gamma0_db"]) as ds:
        assert ds.crs.to_epsg() == 32612 and ds.width == 4 and ds.height == 3
        assert ds.tags()["OMEGA_KIND"] == "MEASURED_SOURCE_DERIVED"
    manifest = json.loads(Path(m["manifest_path"]).read_text())
    assert manifest["schema"] == "omega.sar.nisar.gcov.measurement.v1"
    assert manifest["semantics"]["catalog_metadata_is_measurement"] is False
    assert manifest["output_sha256"]["gamma0_db"]


def test_power_db_and_phase_helpers():
    d = power_to_db(np.array([1.,10.,100.,0.]))
    assert np.allclose(d[:3], [0,10,20]) and np.isnan(d[3])
    c, meta = apply_provisional_phase_correction(np.array([1+0j]), "HHVH")
    assert meta["applied"] is False and np.allclose(c, [1+0j])
