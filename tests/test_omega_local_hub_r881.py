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
    def test_private_daemon_state_unreachable_by_jobs(self):
        (self.root / ".omega" / "hub-r881.token").write_text("secret-test", encoding="utf-8")
        with self.assertRaisesRegex(ValueError,"HUB_INTERNAL_STATE_HELD"):
            hubmod.safe_under(self.root,".omega/hub-r881.token", True)
        with self.assertRaisesRegex(ValueError,"HUB_INTERNAL_STATE_HELD"):
            hubmod.safe_under(self.root,".omega/jobs.sqlite", True)
        copy=self.hub.enqueue("COPY_ARTIFACT",{"source":"data/one.csv","destination":".omega/overwrite.bin"})
        self.assertEqual(self.hub.run_one()["state"],"HELD")
        self.assertIsNone((self.root/".omega"/"overwrite.bin").exists() or None)
        self.assertEqual(self.hub.get(copy["id"])["state"],"HELD")
    def test_hub_db_location_must_be_private(self):
        with self.assertRaisesRegex(ValueError,"DB_MUST_RESIDE_IN_PRIVATE_HUB_DIR"):
            hubmod.Hub(self.root,self.root/"data"/"database.sqlite")
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
    def test_restart_holds_interrupted_running_job(self):
        job=self.hub.enqueue("CSV_STATS", {"source":"data/one.csv"})
        with self.hub.connection() as c:
            c.execute("UPDATE jobs SET state='RUNNING' WHERE id=?",(job["id"],))
        restarted=hubmod.Hub(self.root,self.root / ".omega" / "jobs.sqlite")
        recovered=restarted.get(job["id"])
        self.assertEqual(recovered["state"],"HELD")
        self.assertEqual(recovered["error"],"CRASH_RECOVERY_REQUIRES_OPERATOR_REVIEW")
        self.assertIn("CRASH_RECOVERY_HELD",[x["event"] for x in recovered["history"]])
        self.assertIsNone(restarted.run_one())
    def test_real_loopback_http_auth_and_origin(self):
        import socket, subprocess, sys, time, urllib.request, urllib.error, json
        sock=socket.socket()
        sock.bind(("127.0.0.1",0))
        port=sock.getsockname()[1]
        sock.close()
        args=[sys.executable,str(MODULE),"--root",str(self.root),"--port",str(port)]
        proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
        try:
            token_file=self.root/".omega"/"hub-r881.token"
            for attempt in range(80):
                if token_file.exists():
                    try:
                        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/hub/status",timeout=.3):
                            pass
                    except urllib.error.HTTPError as exc:
                        if exc.code==401:break
                    except (OSError,TimeoutError):pass
                self.assertIsNone(proc.poll(),"Local hub process exited before its HTTP listener started")
                time.sleep(.05)
            else:self.fail("Loopback listener never became ready")
            token=token_file.read_text()
            endpoint=f"http://127.0.0.1:{port}/api/hub/status"
            with self.assertRaises(urllib.error.HTTPError) as bad:
                urllib.request.urlopen(urllib.request.Request(endpoint,headers={"X-Omega-Local-Token":"bad"}),timeout=2)
            self.assertEqual(bad.exception.code,401)
            valid={"X-Omega-Local-Token":token,"Origin":"https://omegav6.jeffdeweyeljefe.workers.dev"}
            with urllib.request.urlopen(urllib.request.Request(endpoint,headers=valid),timeout=2) as res:
                body=json.load(res)
                self.assertEqual(body["schema"],hubmod.SCHEMA)
                self.assertFalse(body["physicalPcAccepted"])
                self.assertEqual(res.headers["Access-Control-Allow-Origin"],valid["Origin"])
            # The portable studio uses an ephemeral loopback TCP port.
            portable={**valid,"Origin":"http://127.0.0.1:49152"}
            with urllib.request.urlopen(urllib.request.Request(endpoint,headers=portable),timeout=2) as res:
                self.assertEqual(res.status,200)
                self.assertEqual(res.headers["Access-Control-Allow-Origin"],portable["Origin"])
            portable_preflight=urllib.request.Request(endpoint,method="OPTIONS",headers={"Origin":portable["Origin"],"Access-Control-Request-Private-Network":"true"})
            with urllib.request.urlopen(portable_preflight,timeout=2) as res:
                self.assertEqual(res.headers["Access-Control-Allow-Private-Network"],"true")
            for forbidden_origin in ("http://evil.example:49152","https://127.0.0.1:49152",
                                     "http://127.0.0.1:49152.evil.example","http://127.0.0.1:49152/path",
                                     "http://127.0.0.1:49152@evil.example", "http://127.0.0.1:0",
                                     "http://127.0.0.1:99999","null"):
                with self.subTest(origin=forbidden_origin):
                    with self.assertRaises(urllib.error.HTTPError) as rejected:
                        urllib.request.urlopen(urllib.request.Request(endpoint,headers={**valid,"Origin":forbidden_origin}),timeout=2)
                    self.assertEqual(rejected.exception.code,401)
            spoofed={**valid,"Host":"evil.example"}
            with self.assertRaises(urllib.error.HTTPError) as bad:
                urllib.request.urlopen(urllib.request.Request(endpoint,headers=spoofed),timeout=2)
            self.assertEqual(bad.exception.code,401)
            with self.assertRaises(urllib.error.HTTPError) as bad:
                urllib.request.urlopen(urllib.request.Request(endpoint,headers={**valid,"Origin":"https://evil.example"}),timeout=2)
            self.assertEqual(bad.exception.code,401)
            preflight=urllib.request.Request(endpoint,method="OPTIONS",headers={"Origin":valid["Origin"],"Access-Control-Request-Private-Network":"true"})
            with urllib.request.urlopen(preflight,timeout=2) as res:
                self.assertEqual(res.headers["Access-Control-Allow-Private-Network"],"true")
            body=json.dumps({"operation":"CSV_STATS","args":{"source":"data/one.csv"}}).encode()
            request=urllib.request.Request(f"http://127.0.0.1:{port}/api/hub/jobs",data=body,method="POST",headers={**valid,"Content-Type":"application/json"})
            with urllib.request.urlopen(request,timeout=2) as res:
                self.assertEqual(res.status,202)
                data=json.load(res)
                self.assertEqual(data["job"]["state"],"QUEUED")
        finally:
            proc.terminate()
            try:proc.communicate(timeout=4)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.communicate()
    def test_cancel_refusal(self):
        job=self.hub.enqueue("CSV_STATS",{"source":"data/one.csv"},scheduled_ms=hubmod.utc_ms()+100000)
        self.assertEqual(self.hub.cancel(job["id"])["state"],"CANCELLED")
        self.assertEqual(self.hub.cancel(job["id"])["state"],"CANNOT_CANCEL_ACTIVE_OR_FINAL")

if __name__=="__main__": unittest.main()
