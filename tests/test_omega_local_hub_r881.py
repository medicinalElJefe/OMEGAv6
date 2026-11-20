import tempfile
import unittest
from pathlib import Path
import importlib.util

MODULE = Path(__file__).resolve().parents[1] / "tools" / "omega_local_hub_r881.py"
spec = importlib.util.spec_from_file_location("omega_local_hub_r881", MODULE)
hubmod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hubmod)

class LocalHubTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "data").mkdir()
        (self.root / "data" / "one.csv").write_text("a,b\n1,2\n3,4\n", encoding="utf-8")
        self.hub = hubmod.Hub(self.root, self.root / ".omega" / "jobs.sqlite")
    def tearDown(self):
        self.tmp.cleanup()
    def test_loopback_and_boundaries(self):
        self.assertEqual(hubmod.SCHEMA, "OMEGA_LOCAL_EDGE_HUB_R881")
        with self.assertRaises(ValueError): hubmod.safe_under(self.root, "../outside")
        with self.assertRaises(ValueError): hubmod.safe_under(self.root, "/etc/passwd")
        with self.assertRaises(ValueError): hubmod.safe_under(self.root, "C:/Windows/system.ini")
        with self.assertRaises(ValueError): hubmod.safe_under(self.root, r"J:\private")
    def test_hash_and_replay(self):
        job = self.hub.enqueue("HASH_TREE", {"path":"data"})
        done = self.hub.run_one()
        self.assertEqual(done["id"], job["id"])
        self.assertEqual(done["state"], "COMPLETED")
        self.assertEqual(len(done["result"]["files"]), 1)
        self.assertEqual(self.hub.replay(job["id"])["state"], "MATCH")
    def test_replay_detects_changed_inputs(self):
        job = self.hub.enqueue("HASH_TREE", {"path":"data"})
        self.hub.run_one()
        (self.root / "data" / "one.csv").write_text("a,b\n5,6\n", encoding="utf-8")
        self.assertEqual(self.hub.replay(job["id"])["state"], "DRIFT")
    def test_csv_and_schedule(self):
        future = hubmod.utc_ms()+1000000
        scheduled = self.hub.enqueue("CSV_STATS", {"source":"data/one.csv"}, scheduled_ms=future)
        self.assertIsNone(self.hub.run_one())
        self.assertEqual(self.hub.get(scheduled["id"])["state"], "QUEUED")
        immediate = self.hub.enqueue("CSV_STATS", {"source":"data/one.csv"})
        done = self.hub.run_one()
        self.assertEqual(done["id"], immediate["id"])
        self.assertEqual(done["result"]["dataRows"], 2)
    def test_event_release(self):
        job = self.hub.enqueue("CSV_STATS", {"source":"data/one.csv"}, event_name="file_received")
        self.assertIsNone(self.hub.run_one())
        self.assertEqual(self.hub.emit_event("file_received")["released"],1)
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
    def test_r195_hold(self):
        job = self.hub.enqueue("RESIDUAL_RESTORE", {"source":"data/one.csv"})
        self.assertEqual(job["state"], "HELD")
        self.assertEqual(job["error"], "R195_RESIDUAL_SOURCE_AND_AUTHORITY_REQUIRED")
        self.assertIsNone(self.hub.run_one())
    def test_copy_and_manifest(self):
        first=self.hub.enqueue("COPY_ARTIFACT", {"source":"data/one.csv","destination":"out/copy.csv"})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
        self.assertEqual(self.hub.replay(first["id"])["state"],"REPLAY_NOT_ADMISSIBLE")
        copied=(self.root/"out"/"copy.csv")
        self.assertEqual(hubmod.sha_file(copied),hubmod.sha_file(self.root/"data"/"one.csv"))
        manifest=self.hub.enqueue("EXPORT_MANIFEST",{"destination":"out/manifest.json","sources":["data/one.csv","out/copy.csv"]})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
        self.assertEqual(len(__import__("json").loads((self.root/"out"/"manifest.json").read_text())["sources"]),2)
    def test_counts_fail_closed(self):
        import json
        (self.root/"data"/"ledger.json").write_text(json.dumps([{"id":"x","tier":"VERIFIED_OR_INTERNALLY_TESTED"}]))
        job=self.hub.enqueue("VERIFY_LEDGER_SPLIT",{"source":"data/ledger.json"})
        self.assertEqual(self.hub.run_one()["state"],"HELD")
        self.assertEqual(self.hub.replay(job["id"])["state"],"REPLAY_NOT_ADMISSIBLE")
    def test_internal_sqlite_excluded(self):
        job=self.hub.enqueue("HASH_TREE",{"path":"."})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
        self.assertEqual(self.hub.replay(job["id"])["state"],"MATCH")
    def test_cancel_refusal(self):
        job=self.hub.enqueue("CSV_STATS",{"source":"data/one.csv"},scheduled_ms=hubmod.utc_ms()+100000)
        self.assertEqual(self.hub.cancel(job["id"])["state"],"CANCELLED")
        self.assertEqual(self.hub.cancel(job["id"])["state"],"CANNOT_CANCEL_ACTIVE_OR_FINAL")

if __name__=="__main__": unittest.main()
