#!/usr/bin/env python3
"""R884 falsification interface: pinned data, preregistered gates, fail-closed claims.

This is a statistical evaluation harness, NOT evidence the historical QCD hypotheses
have been tested. A successful score supports only the supplied preregistered
model/dataset pair and cannot independently validate physics.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import math
from pathlib import Path

SCHEMA = "OMEGA_FALSIFICATION_HARNESS_R884"
QCD_GATES = tuple(f"OMEGAJ-{n:04d}" for n in range(91,101))
EMPIRICAL_INTERFACES = tuple(f"O{n:03d}" for n in range(1,15))
EXTERNAL_EQUATIONS = tuple(f"E{n:03d}" for n in range(28,54))
HYPOTHESES_INCLUSIVE = tuple(f"R{n:04d}" for n in range(209,224))
CAN_CORE = "CAN-CORE-001"
STATUSES = ("SUPPORTED_AGAINST_BASELINE","FALSIFIED_BY_DATA","INCONCLUSIVE_DATA_LIMIT")
ALL_GATES = QCD_GATES + EMPIRICAL_INTERFACES
def sha256(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda:f.read(1048576),b""):h.update(block)
    return h.hexdigest()
def norm_path(root, raw):
    if not isinstance(raw,str) or not raw or raw.startswith(("/", "\\")) or ".." in Path(raw).parts or "\\" in raw or ":" in raw:
        raise ValueError("DATASET_PATH_HELD")
    path=(root/raw).resolve()
    if not path.is_relative_to(root):raise ValueError("DATASET_PATH_OUTSIDE_ROOT_HELD")
    if not path.is_file():raise ValueError("PINNED_DATASET_MISSING")
    return path
def null_l1(y):
    ordered=sorted(y)
    return ordered[(len(ordered)-1)//2]
def mae(pairs):
    return sum(abs(a-b) for a,b in pairs)/len(pairs)
def held(gate,state,reason,extra=None):
    return {"schema":SCHEMA,"gate":gate,"state":state,"outcome":"INCONCLUSIVE_DATA_LIMIT",
            "reason":reason,"physicalProof":False,"canonPromotion":False,**(extra or {})}
def run_gate(root,registration):
    root=Path(root).resolve()
    if not isinstance(registration,dict):return held("UNKNOWN","REGISTRATION_REQUIRED","Must supply an explicit registration object.")
    gate=registration.get("gate")
    if gate not in ALL_GATES:return held(str(gate),"UNKNOWN_GATE_HELD","Only enumerated QCD/empirical gates are accepted; no invented test IDs.")
    required=["source_rule_ref","dataset_path","dataset_sha256","dataset_version","commit_sha","preregistered_at",
              "target_column","prediction_column","split_column","train_label","test_label","null_model","minimum_test_n",
              "improvement_margin","falsification_excess_margin"]
    missing=[x for x in required if x not in registration or registration[x] in (None,"")]
    if missing:return held(gate,"PREREGISTRATION_INCOMPLETE","Missing preregistration fields: "+",".join(missing))
    if registration["null_model"]!="TRAIN_MEDIAN_L1":return held(gate,"NULL_MODEL_SOURCE_REQUIRED","Only the declared train-median absolute-error baseline is implemented.")
    if not isinstance(registration["minimum_test_n"],int) or registration["minimum_test_n"]<3:return held(gate,"MIN_TEST_COUNT_HELD","Minimum test count must be an integer >=3.")
    for k in ("improvement_margin","falsification_excess_margin"):
        v=registration[k]
        if not isinstance(v,(int,float)) or not math.isfinite(v) or v<0:return held(gate,"MARGIN_INVALID","Margins must be nonnegative finite numbers.")
    try:
        dataset=norm_path(root,registration["dataset_path"])
        digest=sha256(dataset)
        if len(registration["dataset_sha256"])!=64 or digest.lower()!=registration["dataset_sha256"].lower():
            return held(gate,"HASH_MISMATCH_HELD","Pinned dataset bytes do not match registration.",{"computedSha256":digest})
        with dataset.open(newline="",encoding="utf-8-sig") as f:
            reader=csv.DictReader(f)
            required_cols=[registration[k] for k in ("target_column","prediction_column","split_column")]
            if not reader.fieldnames or any(k not in reader.fieldnames for k in required_cols):
                return held(gate,"MISSING_CSV_COLUMNS","Registered CSV fields not present.")
            rows=list(reader)
        train=[];test=[];seen=set()
        for i,row in enumerate(rows):
            group=row[registration["split_column"]]
            try:
                y=float(row[registration["target_column"]]);pred=float(row[registration["prediction_column"]])
                if not math.isfinite(y) or not math.isfinite(pred):raise ValueError()
            except (TypeError,ValueError):
                return held(gate,"NONFINITE_OR_NONNUMERIC","Invalid target/prediction at row "+str(i+2))
            if group==registration["train_label"]:train.append(y)
            elif group==registration["test_label"]:test.append((y,pred))
            else: return held(gate,"SPLIT_AMBIGUOUS","Dataset has an unregistered split label.")
        if len(train)<3 or len(test)<registration["minimum_test_n"]:
            return held(gate,"INSUFFICIENT_SPLIT_SIZE","Train/test sample counts are below preregistered minima.",{"train_n":len(train),"test_n":len(test)})
        baseline=null_l1(train)
        base_error=mae((y,baseline) for y,_ in test)
        model_error=mae(test)
        delta=base_error-model_error
        if delta>=registration["improvement_margin"] and delta>0:result="SUPPORTED_AGAINST_BASELINE"
        elif model_error-base_error>=registration["falsification_excess_margin"] and model_error>base_error:
            result="FALSIFIED_BY_DATA"
        else:result="INCONCLUSIVE_DATA_LIMIT"
        return {"schema":SCHEMA,"gate":gate,"state":"DATA_COMPUTED_SCOPED","outcome":result,
            "sourceRuleRef":registration["source_rule_ref"],"datasetVersion":registration["dataset_version"],
            "sourceCommit":registration["commit_sha"],"preregisteredAt":registration["preregistered_at"],
            "datasetSha256":digest,"train_n":len(train),"test_n":len(test),"nullModel":"TRAIN_MEDIAN_L1",
            "nullValue":baseline,"nullMae":base_error,"candidateMae":model_error,"deltaMae":delta,
            "improvementMargin":registration["improvement_margin"],"falsificationExcessMargin":registration["falsification_excess_margin"],
            "claimScope":"REGISTERED_DATASET_AND_METRIC_ONLY","physicalProof":False,"canonPromotion":False,
            "warning":"Passing a baseline comparison does not validate QCD physics or admit a Canon claim. Independent source-law and empirical adjudication remain required."}
    except (OSError,ValueError,UnicodeError,csv.Error) as e:
        return held(gate,"SOURCE_READ_FAILED",str(e))
def registry():
    return {"schema":SCHEMA,"gates":ALL_GATES,"qcdCoherence":QCD_GATES,"empiricalInterfaces":EMPIRICAL_INTERFACES,
        "externalEquations":EXTERNAL_EQUATIONS,"hypothesisNames":HYPOTHESES_INCLUSIVE,
        "hypothesisCountDeclared":14,"hypothesisCountInclusiveActually":len(HYPOTHESES_INCLUSIVE),
        "hypothesisMismatch":"R0209..R0223 inclusive defines 15 identifiers, not 14; source must disambiguate.",
        "canonCore":CAN_CORE,"default":"INCONCLUSIVE_DATA_LIMIT","physicalProof":False,"canonPromotion":False}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--root",type=Path,default=Path.cwd());p.add_argument("--registration",type=Path)
    args=p.parse_args()
    obj=registry() if args.registration is None else run_gate(args.root,json.loads(args.registration.read_text(encoding="utf-8")))
    print(json.dumps(obj,indent=2,sort_keys=True))
if __name__=="__main__":main()
