import tempfile
import unittest
import json
import hashlib
import importlib.util
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1]/"tools"/"omega_falsification_r884.py"
spec=importlib.util.spec_from_file_location("omega_falsification_r884",MODULE)
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class FalsificationTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.path=self.root/"dataset.csv"
        self.path.write_text("y,pred,split\n1,1,train\n2,2,train\n3,3,train\n4,4,train\n5,5,test\n6,6,test\n7,7,test\n8,8,test\n",encoding="utf-8")
        self.reg={"gate":"ΩJ-0091","source_rule_ref":"SOURCE_FIXTURE_ONLY",
                  "dataset_path":"dataset.csv","dataset_sha256":mod.sha256(self.path),
                  "dataset_version":"fixture-v1","commit_sha":"1234abc","preregistered_at":"2026-11-19",
                  "target_column":"y","prediction_column":"pred","split_column":"split",
                  "train_label":"train","test_label":"test","null_model":"TRAIN_MEDIAN_L1",
                  "minimum_test_n":3,"improvement_margin":0.1,"falsification_excess_margin":0.1}
    def tearDown(self):self.tmp.cleanup()
    def test_registry(self):
        r=mod.registry()
        self.assertEqual(len(r["gates"]),24)
        self.assertEqual(len(r["externalEquations"]),26)
        self.assertEqual(r["hypothesisCountInclusiveActually"],15)
        self.assertFalse(r["physicalProof"])
    def test_canonical_qcd_aliases(self):
        for requested in ("ΩJ-0091","T01","OMEGAJ-0091"):
            actual=mod.run_gate(self.root,{**self.reg,"gate":requested})
            self.assertEqual(actual["gate"],"ΩJ-0091")
            self.assertEqual(actual["outcome"],"SUPPORTED_AGAINST_BASELINE")
        self.assertEqual(mod.registry()["gateAliases"]["T10"],"ΩJ-0100")
    def test_support_scoped_not_physics(self):
        r=mod.run_gate(self.root,self.reg)
        self.assertEqual(r["outcome"],"SUPPORTED_AGAINST_BASELINE")
        self.assertEqual(r["candidateMae"],0)
        self.assertFalse(r["canonPromotion"])
    def test_bad_hash_held(self):
        r=mod.run_gate(self.root,{**self.reg,"dataset_sha256":"0"*64})
        self.assertEqual(r["state"],"HASH_MISMATCH_HELD")
        self.assertEqual(r["outcome"],"INCONCLUSIVE_DATA_LIMIT")
    def test_bad_gate_held(self):
        self.assertEqual(mod.run_gate(self.root,{**self.reg,"gate":"UNREGISTERED"})["state"],"UNKNOWN_GATE_HELD")
    def test_no_registration_no_promotion(self):
        self.assertEqual(mod.run_gate(self.root,{"gate":"O001"})["outcome"],"INCONCLUSIVE_DATA_LIMIT")
    def test_falsified_against_baseline(self):
        rows=self.path.read_text().replace("5,5,test","5,50,test").replace("6,6,test","6,60,test").replace("7,7,test","7,70,test").replace("8,8,test","8,80,test")
        self.path.write_text(rows)
        r=mod.run_gate(self.root,{**self.reg,"dataset_sha256":mod.sha256(self.path)})
        self.assertEqual(r["outcome"],"FALSIFIED_BY_DATA")
    def test_ambiguous_split_held(self):
        self.path.write_text(self.path.read_text().replace("8,8,test","8,8,other"))
        r=mod.run_gate(self.root,{**self.reg,"dataset_sha256":mod.sha256(self.path)})
        self.assertEqual(r["state"],"SPLIT_AMBIGUOUS")
    def test_relative_path_safety(self):
        self.assertEqual(mod.run_gate(self.root,{**self.reg,"dataset_path":"../outside.csv"})["state"],"SOURCE_READ_FAILED")
if __name__=="__main__":unittest.main()
