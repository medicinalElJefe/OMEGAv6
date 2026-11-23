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
    def test_private_namespace_rejected_before_windows_path_normalization(self):
        for target in (".omega", ".omega/hub-r881.token", ".omega/jobs.sqlite"):
            with self.subTest(target=target), self.assertRaisesRegex(ValueError, "HUB_INTERNAL_STATE_HELD"):
                hubmod.safe_under(self.root, target, False)
        alternate_root = self.root / "data" / ".."
        with self.assertRaisesRegex(ValueError, "HUB_INTERNAL_STATE_HELD"):
            hubmod.safe_under(alternate_root, ".omega/hub-r881.token", False)

    def test_hub_db_location_must_be_private(self):
        with self.assertRaisesRegex(ValueError,"DB_MUST_RESIDE_IN_PRIVATE_HUB_DIR"):
            hubmod.Hub(self.root,self.root/"data"/"database.sqlite")
    def test_r902_real_sparse_tensor_execution_and_durable_receipt(self):
        request={"seeds":[{"cell":20735,"lane":20735,"mass":4096}],
                 "steps":4,"cell_axis":0,"lane_axis":1}
        job=self.hub.enqueue("SPHERE_TENSOR_STEP",request)
        result=self.hub.run_one()
        self.assertEqual(result["id"],job["id"])
        self.assertEqual(result["state"],"COMPLETED")
        self.assertEqual(result["result"]["schema"],"OMEGA_IMPLICIT_CELL_LANE_TENSOR_R902")
        self.assertEqual(result["result"]["implicitComponents"],429981696)
        self.assertEqual(result["result"]["totalMassAfter"],4096)
        self.assertTrue(result["result"]["conservationExact"])
        self.assertEqual(len(result["result_sha256"]),64)
        self.assertFalse(result["result"]["gpuComputeProven"])
        self.assertFalse(result["result"]["independentAiModelsTrained"])
        self.assertEqual(self.hub.replay(job["id"])["state"],"MATCH")

    def test_r904_complete_sparse_export_exact_content_and_receipts(self):
        import hashlib
        seeds=[{"cell":0,"lane":0,"mass":4096}]
        args={"seeds":seeds,"steps":4,"cell_axis":0,"lane_axis":1,
              "destination":"exports/full-state.csv"}
        queued=self.hub.enqueue("SPHERE_TENSOR_EXPORT",args)
        job=self.hub.run_one()
        self.assertEqual(job["id"],queued["id"])
        self.assertEqual(job["state"],"COMPLETED")
        receipt=job["result"]
        self.assertEqual(receipt["schema"],"OMEGA_SPARSE_TENSOR_EXPORT_R904")
        self.assertEqual(receipt["exportedRows"],receipt["tensor"]["activeComponents"])
        self.assertEqual(receipt["tensor"]["totalMassAfter"],4096)
        exported=self.root/"exports"/"full-state.csv"
        data=exported.read_bytes()
        self.assertTrue(data.startswith(b"cell,lane,mass\n"))
        self.assertEqual(len(data.splitlines()),receipt["exportedRows"]+1)
        self.assertEqual(hashlib.sha256(data).hexdigest(),receipt["artifact"]["sha256"])
        state_hash=hashlib.sha256()
        mass=0
        for line in data.decode("utf-8").splitlines()[1:]:
            cell,lane,weight=(int(x) for x in line.split(","))
            mass+=weight
            state_hash.update(f"{cell}:{lane}:{weight}\n".encode("ascii"))
        self.assertEqual(mass,4096)
        self.assertEqual(state_hash.hexdigest(),receipt["canonicalFullStateSha256"])
        self.assertEqual(receipt["canonicalFullStateSha256"],receipt["tensor"]["fullStateSha256"])
        self.assertEqual(len(job["result_sha256"]),64)
        self.assertFalse(receipt["gpuComputeProven"])

    def test_r905_exact_round_trip_and_tamper_refusal(self):
        export_args={"seeds":[{"cell":143,"lane":1727,"mass":4096}],
                     "steps":4,"cell_axis":2,"lane_axis":3,
                     "destination":"exports/r905-complete.csv"}
        export_job=self.hub.enqueue("SPHERE_TENSOR_EXPORT",export_args)
        exported=self.hub.run_one()
        self.assertEqual(exported["state"],"COMPLETED")
        verify_job=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":export_job["id"]})
        validated=self.hub.run_one()
        self.assertEqual(validated["id"],verify_job["id"])
        self.assertEqual(validated["state"],"COMPLETED")
        proof=validated["result"]
        self.assertEqual(proof["schema"],"OMEGA_SPARSE_EXPORT_ROUNDTRIP_R905")
        self.assertEqual(proof["state"],"EXACT_EXPORTED_STATE_MATCH")
        self.assertEqual(proof["exportedRows"],exported["result"]["exportedRows"])
        self.assertEqual(proof["totalMass"],4096)
        self.assertEqual(proof["fullStateSha256"],exported["result"]["canonicalFullStateSha256"])
        self.assertEqual(proof["fileSha256"],exported["result"]["artifact"]["sha256"])
        self.assertEqual(proof["originalExportReceiptSha256"],exported["result_sha256"])
        self.assertFalse(proof["signedProvenance"])
        self.assertEqual(self.hub.replay(verify_job["id"])["state"],"MATCH")
        path=self.root/"exports"/"r905-complete.csv"
        original=path.read_bytes()
        try:
            # Alter only one mass while preserving the total number of rows.
            changed=original.replace(b",256\n",b",257\n",1)
            if changed==original:
                changed=original.replace(b",",b",0",1)
            path.write_bytes(changed)
            tamper=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":export_job["id"]})
            held=self.hub.run_one()
            self.assertEqual(held["id"],tamper["id"])
            self.assertEqual(held["state"],"HELD")
            self.assertIn("R905_",held["error"])
        finally:
            path.write_bytes(original)
        restored=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":export_job["id"]})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")

    def test_r910_verified_original_complete_csv_download(self):
        export=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,
            "cell_axis":0,"lane_axis":1,"destination":"states/r910.csv"})
        exported=self.hub.run_one()
        self.assertEqual(exported["state"],"COMPLETED")
        original,digest=self.hub.verified_csv_artifact(export["id"])
        self.assertEqual(digest,exported["result"]["artifact"]["sha256"])
        self.assertTrue(original.startswith(b"cell,lane,mass\n"))
        self.assertEqual(len(original.splitlines()),exported["result"]["exportedRows"]+1)
        for bad in ("../escape","f"*32):
            with self.subTest(job=bad),self.assertRaises(ValueError):
                self.hub.verified_csv_artifact(bad)
        file=self.root/"states"/"r910.csv"
        source=file.read_bytes()
        try:
            file.write_bytes(source+b"X")
            with self.assertRaisesRegex(ValueError,"R905_"):
                self.hub.verified_csv_artifact(export["id"])
        finally:file.write_bytes(source)
        self.assertEqual(self.hub.verified_csv_artifact(export["id"])[1],digest)

    def test_r909_authenticated_artifact_contract_original_svg_only(self):
        original=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,
            "cell_axis":0,"lane_axis":1,"destination":"r909-source.csv"})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
        rendering=self.hub.enqueue("SPHERE_TENSOR_RENDER",{
            "export_job_id":original["id"],"destination":"art/r909.svg"})
        rendered=self.hub.run_one()
        self.assertEqual(rendered["state"],"COMPLETED")
        raw,digest=self.hub.verified_svg_artifact(rendering["id"])
        self.assertTrue(raw.startswith(b'<svg xmlns="http://www.w3.org/2000/svg"'))
        self.assertEqual(digest,rendered["result"]["artifact"]["sha256"])
        self.assertEqual(hubmod.sha_bytes(raw),digest)
        for invalid in (original["id"],"f"*32,"garbage","../r909.svg"):
            with self.subTest(job=invalid),self.assertRaisesRegex(ValueError,"R909_"):
                self.hub.verified_svg_artifact(invalid)
        art=self.root/"art"/"r909.svg"
        original_bytes=art.read_bytes()
        try:
            art.write_bytes(original_bytes+b'X')
            with self.assertRaisesRegex(ValueError,"R909_SVG_ARTIFACT_INTEGRITY_HELD"):
                self.hub.verified_svg_artifact(rendering["id"])
        finally:art.write_bytes(original_bytes)
        self.assertEqual(self.hub.verified_svg_artifact(rendering["id"])[1],digest)

    def test_r907_projection_from_verified_checkpoint_and_tamper_hold(self):
        import xml.etree.ElementTree as ET
        export=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,
            "cell_axis":0,"lane_axis":1,"destination":"projection-source.csv"})
        done=self.hub.run_one()
        self.assertEqual(done["state"],"COMPLETED")
        args={"export_job_id":export["id"],"destination":"art/reality.svg"}
        rendering=self.hub.enqueue("SPHERE_TENSOR_RENDER",args)
        visual=self.hub.run_one()
        self.assertEqual(visual["id"],rendering["id"])
        self.assertEqual(visual["state"],"COMPLETED")
        result=visual["result"]
        self.assertEqual(result["schema"],"OMEGA_SPARSE_PROJECTION_ARTIFACT_R907")
        self.assertEqual(result["sourceExportJobId"],export["id"])
        self.assertEqual(result["sourceExportReceiptSha256"],done["result_sha256"])
        self.assertEqual(result["sourceFullStateSha256"],done["result"]["canonicalFullStateSha256"])
        self.assertEqual(result["projection"]["totalMass"],4096)
        self.assertEqual(result["projection"]["addressableCells"],20736)
        svg=self.root/"art"/"reality.svg"
        ET.parse(svg)
        self.assertEqual(hubmod.sha_file(svg),result["artifact"]["sha256"])
        full_detail=self.hub.get(rendering["id"])
        self.assertEqual(len(full_detail["result"]["projection"]["projectionGrid"]),20736)
        listed=next(j for j in self.hub.list() if j["id"]==rendering["id"])
        self.assertNotIn("projectionGrid",listed["result"]["projection"])
        self.assertTrue(listed["result"]["projection"]["projectionGridOmittedFromJobList"])
        self.assertEqual(listed["result_sha256"],full_detail["result_sha256"])
        overwrite=self.hub.enqueue("SPHERE_TENSOR_RENDER",args)
        denied=self.hub.run_one()
        self.assertEqual(denied["state"],"HELD")
        self.assertIn("R907_PROJECTION_TARGET_EXISTS_HELD",denied["error"])
        with (self.root/"projection-source.csv").open("ab") as stream: stream.write(b"X")
        changed=self.hub.enqueue("SPHERE_TENSOR_RENDER",{
            **args,"destination":"art/not-created.svg"})
        held=self.hub.run_one()
        self.assertEqual(held["state"],"HELD")
        self.assertIn("R905_",held["error"])
        self.assertFalse((self.root/"art"/"not-created.svg").exists())

    def test_r906_verified_sparse_checkpoint_continuation_and_lineage(self):
        original=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,
            "cell_axis":0,"lane_axis":1,"destination":"history/first.csv"})
        first=self.hub.run_one()
        self.assertEqual(first["state"],"COMPLETED")
        resumed=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
            "export_job_id":original["id"],"destination":"history/second.csv",
            "steps":1,"cell_axis":0,"lane_axis":1})
        second=self.hub.run_one()
        self.assertEqual(second["state"],"COMPLETED")
        receipt=second["result"]
        self.assertEqual(receipt["schema"],"OMEGA_SPARSE_TENSOR_CONTINUATION_R906")
        self.assertEqual(receipt["sourceExportJobId"],original["id"])
        self.assertEqual(receipt["sourceExportReceiptSha256"],first["result_sha256"])
        self.assertEqual(receipt["sourceStateSha256"],first["result"]["canonicalFullStateSha256"])
        self.assertEqual(receipt["tensor"]["totalMassAfter"],4096)
        self.assertEqual(receipt["tensor"]["steps"],1)
        self.assertNotEqual(receipt["canonicalFullStateSha256"],receipt["sourceStateSha256"])
        self.assertFalse(receipt["gpuComputeProven"])
        self.assertTrue((self.root/"history"/"second.csv").exists())
        verify=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":resumed["id"]})
        checked=self.hub.run_one()
        self.assertEqual(checked["state"],"COMPLETED")
        self.assertEqual(checked["result"]["fullStateSha256"],receipt["canonicalFullStateSha256"])
        chained=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
            "export_job_id":resumed["id"],"destination":"history/third.csv",
            "steps":1,"cell_axis":0,"lane_axis":1})
        third=self.hub.run_one()
        self.assertEqual(third["state"],"COMPLETED")
        self.assertEqual(third["result"]["sourceExportJobId"],resumed["id"])
        self.assertEqual(third["result"]["tensor"]["totalMassAfter"],4096)

    def test_r906_nonintegral_checkpoint_and_tamper_refused(self):
        source=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":4}],"steps":1,
            "cell_axis":0,"lane_axis":1,"destination":"small.csv"})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")
        args={"export_job_id":source["id"],"destination":"no-output.csv",
              "steps":1,"cell_axis":0,"lane_axis":1}
        refused=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",args)
        held=self.hub.run_one()
        self.assertEqual(held["state"],"HELD")
        self.assertIn("R902_INTEGER_CONSERVATION_BOUND_HELD",held["error"])
        self.assertFalse((self.root/"no-output.csv").exists())
        file=self.root/"small.csv"
        original=file.read_bytes()
        try:
            file.write_bytes(original+b"X")
            tamper=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
                **args,"destination":"tampered-output.csv"})
            held=self.hub.run_one()
            self.assertEqual(held["state"],"HELD")
            self.assertIn("R905_",held["error"])
            self.assertFalse((self.root/"tampered-output.csv").exists())
        finally:
            file.write_bytes(original)

    def test_r905_refuses_arbitrary_reference_and_unrelated_job(self):
        for value in ("../escape",None,"g"*32):
            job=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":value})
            result=self.hub.run_one()
            self.assertEqual(result["state"],"HELD")
        plain=self.hub.enqueue("HASH_TREE",{"path":"data"})
        self.hub.run_one()
        job=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":plain["id"]})
        held=self.hub.run_one()
        self.assertEqual(held["state"],"HELD")
        self.assertIn("R905_COMPLETED_ORIGINAL_EXPORT_REQUIRED_HELD",held["error"])

    def test_r904_cannot_overwrite_or_escape_root(self):
        args={"seeds":[{"cell":0,"lane":0,"mass":16}],"steps":2}
        for name in (".omega/secret.csv","../outside.csv","data/one.csv"):
            queued=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{**args,"destination":name})
            result=self.hub.run_one()
            self.assertEqual(result["id"],queued["id"])
            self.assertEqual(result["state"],"HELD")
        self.assertTrue((self.root/"data"/"one.csv").exists())
        self.assertFalse((self.root/".omega"/"secret.csv").exists())

    def test_r902_invalid_mass_refuses_without_result_promotion(self):
        job=self.hub.enqueue("SPHERE_TENSOR_STEP",
                 {"seeds":[{"cell":0,"lane":0,"mass":5}],"steps":2})
        result=self.hub.run_one()
        self.assertEqual(result["state"],"HELD")
        self.assertIn("R902_INTEGER_CONSERVATION_BOUND_HELD",result["error"])
        self.assertNotEqual(result["result"]["state"],"DETERMINISTIC_SPARSE_TENSOR_EXECUTED")

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
            # Model inventory must never bypass the Hub's private token.
            with self.assertRaises(urllib.error.HTTPError) as unauthorized_models:
                urllib.request.urlopen(f"http://127.0.0.1:{port}/api/hub/models",timeout=2)
            self.assertEqual(unauthorized_models.exception.code,401)
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
            with self.assertRaises(urllib.error.HTTPError) as no_token:
                urllib.request.urlopen(urllib.request.Request(endpoint,headers={"Origin":portable["Origin"]}),timeout=2)
            self.assertEqual(no_token.exception.code,401)
            with self.assertRaises(urllib.error.HTTPError) as bad_token:
                urllib.request.urlopen(urllib.request.Request(endpoint,headers={"Origin":portable["Origin"],"X-Omega-Local-Token":"incorrect"}),timeout=2)
            self.assertEqual(bad_token.exception.code,401)
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
