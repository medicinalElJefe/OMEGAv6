from __future__ import annotations

import argparse
import json

import h5py

from .nisar_gcov import export_gcov, list_gcov_layers
from .nisar_stack import compile_stack
from .omega_sar import export_gunw, read_gunw


def _json(value):
    print(json.dumps(value, indent=2, sort_keys=True, default=str))


def main(argv=None):
    p = argparse.ArgumentParser(
        description="OMEGA SAR evidence processor: NISAR GCOV amplitude, registered accumulation, and GUNW interferometry"
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    l = sub.add_parser("list", help="List NISAR GCOV datasets for a frequency")
    l.add_argument("input")
    l.add_argument("--frequency", default="A", choices=["A", "B"])

    e = sub.add_parser("extract", help="Extract source-backed NISAR GCOV layers")
    e.add_argument("input")
    e.add_argument("out_dir")
    e.add_argument("--frequency", default="A", choices=["A", "B"])
    e.add_argument("--term", default="HHHH")
    e.add_argument("--power", action="store_true")
    e.add_argument("--min-looks", type=float, default=1.0)

    s = sub.add_parser("stack", help="Compile strictly registered GCOV temporal statistics")
    s.add_argument("out_dir")
    s.add_argument("manifests", nargs="+")
    s.add_argument(
        "--product",
        default="gamma0_db",
        choices=["gamma0_db", "gamma0_power", "sigma0_db", "sigma0_power"],
    )

    gi = sub.add_parser("gunw-inspect", help="Inspect a NISAR GUNW pair without emitting derived displacement")
    gi.add_argument("input")
    gi.add_argument("--frequency", default="A", choices=["A"])
    gi.add_argument("--polarization", default="HH", choices=["HH", "VV"])
    gi.add_argument("--min-coherence", type=float, default=None)

    ge = sub.add_parser("gunw-extract", help="Export GUNW phase/coherence/QA and optionally signed range change")
    ge.add_argument("input")
    ge.add_argument("out_dir")
    ge.add_argument("--frequency", default="A", choices=["A"])
    ge.add_argument("--polarization", default="HH", choices=["HH", "VV"])
    ge.add_argument("--min-coherence", type=float, default=None)
    ge.add_argument(
        "--phase-to-range-sign",
        type=int,
        choices=[-1, 1],
        default=None,
        help="Explicit sign convention required before signed range change is emitted.",
    )

    a = p.parse_args(argv)

    if a.cmd == "list":
        with h5py.File(a.input, "r") as h5:
            _json(list_gcov_layers(h5, a.frequency))
        return 0

    if a.cmd == "stack":
        _json(compile_stack(a.manifests, a.out_dir, a.product))
        return 0

    if a.cmd == "gunw-inspect":
        result = read_gunw(
            a.input,
            polarization=a.polarization,
            frequency=a.frequency,
            min_coherence=a.min_coherence,
        )
        _json(result.manifest())
        return 0

    if a.cmd == "gunw-extract":
        _json(
            export_gunw(
                a.input,
                a.out_dir,
                polarization=a.polarization,
                frequency=a.frequency,
                min_coherence=a.min_coherence,
                phase_to_range_sign=a.phase_to_range_sign,
            )
        )
        return 0

    _json(
        export_gcov(
            a.input,
            a.out_dir,
            a.frequency,
            a.term,
            db=not a.power,
            min_looks=a.min_looks,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
