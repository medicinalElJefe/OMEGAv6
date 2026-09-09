from __future__ import annotations
import argparse, json
import h5py
from .nisar_gcov import export_gcov, list_gcov_layers
from .nisar_stack import compile_stack


def main(argv=None):
    p = argparse.ArgumentParser(description="OMEGA NISAR GCOV evidence and accumulation processor")
    sub = p.add_subparsers(dest="cmd", required=True)
    l = sub.add_parser("list")
    l.add_argument("input")
    l.add_argument("--frequency", default="A", choices=["A", "B"])
    e = sub.add_parser("extract")
    e.add_argument("input")
    e.add_argument("out_dir")
    e.add_argument("--frequency", default="A", choices=["A", "B"])
    e.add_argument("--term", default="HHHH")
    e.add_argument("--power", action="store_true")
    e.add_argument("--min-looks", type=float, default=1.0)
    s = sub.add_parser("stack")
    s.add_argument("out_dir")
    s.add_argument("manifests", nargs="+")
    s.add_argument("--product", default="gamma0_db", choices=["gamma0_db", "gamma0_power", "sigma0_db", "sigma0_power"])
    a = p.parse_args(argv)
    if a.cmd == "list":
        with h5py.File(a.input, "r") as h5:
            print(json.dumps(list_gcov_layers(h5, a.frequency), indent=2, sort_keys=True))
        return 0
    if a.cmd == "stack":
        manifest = compile_stack(a.manifests, a.out_dir, a.product)
    else:
        manifest = export_gcov(a.input, a.out_dir, a.frequency, a.term, db=not a.power, min_looks=a.min_looks)
    print(json.dumps(manifest, indent=2, sort_keys=True, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
