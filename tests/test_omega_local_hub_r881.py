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
    def test_r956_original_v35_safe_stage_and_indexed_query(self):
        import hashlib,io,json,sqlite3,zipfile,importlib.util
        path=MODULE.parent/"omega_v35_prepare_r956.py"
        spec=importlib.util.spec_from_file_location("omega_v35_prepare_r956",path)
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        atlas=MODULE.parent/"omega_v35_atlas_r954.py"
        atlas_spec=importlib.util.spec_from_file_location("omega_v35_atlas_r954",atlas)
        atlasmod=importlib.util.module_from_spec(atlas_spec)
        atlas_spec.loader.exec_module(atlasmod)
        source_db=self.root/"data"/"tiny_v35_sqlite.db"
        with sqlite3.connect(source_db) as db:
            db.execute("CREATE TABLE rows(row_id INTEGER PRIMARY KEY,source_file TEXT,sheet TEXT,row_number INTEGER,row_json TEXT,row_text TEXT,domain TEXT,root TEXT,function TEXT,gate TEXT)")
            db.execute('CREATE VIRTUAL TABLE rows_fts USING fts5(row_text,source_file,sheet,domain,root,function,gate,content="rows",content_rowid="row_id")')
            db.executemany("INSERT INTO rows VALUES(?,?,?,?,?,?,?,?,?,?)",[
                (1,"original.xlsx","Chart1",2,'{"name":"water"}',"water shift","water","OUTVERSE","flow","STAY"),
                (2,"original.xlsx","Chart1",3,'{"name":"water"}',"water pressure","water","INVERSE","load","TURN"),
                (3,"original.xlsx","Chart2",4,'{"name":"stone"}',"stone density","stone","OUTVERSE","weight","STAY")])
            db.execute("INSERT INTO rows_fts(rows_fts) VALUES('rebuild')")
        digest=lambda b:hashlib.sha256(b).hexdigest()
        original=source_db.read_bytes()
        manifest={"stats":{"rows":3},"files":[{"path":module.DB_NAME,
                  "size_bytes":len(original),"sha256":digest(original)}]}
        nested_io=io.BytesIO()
        with zipfile.ZipFile(nested_io,"w",compression=zipfile.ZIP_STORED) as nested:
            nested.writestr("source_manifest/OMEGA_MASTER_MANIFEST.json",json.dumps(manifest))
            nested.writestr(module.DB_NAME,original)
        nested_bytes=nested_io.getvalue()
        wrapper=self.root/"data"/module.WRAPPER_NAME
        with zipfile.ZipFile(wrapper,"w",compression=zipfile.ZIP_STORED) as outer:
            outer.writestr(module.NESTED_NAME,nested_bytes)
        original_wrapper=wrapper.read_bytes()
        args={"source":"data/"+module.WRAPPER_NAME,"destination":"data/v35/"+module.DB_NAME}
        expected=dict(wrapper_sha=digest(original_wrapper),wrapper_bytes=len(original_wrapper),
                      nested_sha=digest(nested_bytes),nested_bytes=len(nested_bytes),
                      db_sha=digest(original),db_bytes=len(original),db_rows=3)
        result=module._prepare_v35(self.root,args,hubmod.safe_under,**expected)
        self.assertEqual(result["schema"],module.SCHEMA)
        self.assertEqual(result["originalRows"],3)
        self.assertEqual(result["originalSqliteSha256"],digest(original))
        self.assertTrue(result["sourceExact"])
        self.assertFalse(result["historicalRuntimeParityProven"])
        self.assertEqual(result["canonicalWrites"],0)
        prepared=self.root/"data"/"v35"/module.DB_NAME
        self.assertEqual(prepared.read_bytes(),original)
        query=atlasmod._query_v35_index(self.root,{"source":args["destination"],
              "term":"water","limit":1,"cursor":0},hubmod.safe_under,
              expected_sha256=digest(original),expected_bytes=len(original),expected_rows=3)
        self.assertEqual(query["returned"],1)
        self.assertTrue(query["hasMore"])
        self.assertEqual(query["records"][0]["rowId"],1)
        self.assertEqual(query["sourceIndex"],"FTS5")
        with self.assertRaisesRegex(ValueError,"R956_DESTINATION_ALREADY_EXISTS_HELD"):
            module._prepare_v35(self.root,args,hubmod.safe_under,**expected)
        prepared.unlink()
        with self.assertRaisesRegex(ValueError,"R956_NESTED_SHA256_HELD"):
            module._prepare_v35(self.root,args,hubmod.safe_under,
                                **{**expected,"nested_sha":"0"*64})
        self.assertFalse(prepared.exists())
        with self.assertRaisesRegex(ValueError,"R956_ORIGINAL_V35_WRAPPER_SHA256_HELD"):
            module.prepare_v35_atlas_r956(self.root,args,hubmod.safe_under)
        wrapper.write_bytes(original_wrapper[:-1]+b"X")
        with self.assertRaisesRegex(ValueError,"R956_ORIGINAL_V35_WRAPPER_SHA256_HELD"):
            module._prepare_v35(self.root,args,hubmod.safe_under,**expected)
        with self.assertRaisesRegex(ValueError,"PARENT_TRAVERSAL_HELD"):
            module._prepare_v35(self.root,{**args,"destination":"../psc_finished_atlas.sqlite"},
                                hubmod.safe_under,**expected)
        self.assertFalse(prepared.exists())

    def test_r954_original_v35_indexed_query_and_refusal(self):
        import sqlite3,hashlib,importlib.util
        module_file=MODULE.parent/"omega_v35_atlas_r954.py"
        spec=importlib.util.spec_from_file_location("omega_v35_atlas_r954",module_file)
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        path=self.root/"data"/"psc_finished_atlas.sqlite"
        with sqlite3.connect(path) as db:
            db.execute("CREATE TABLE rows(row_id INTEGER PRIMARY KEY,source_file TEXT,sheet TEXT,row_number INTEGER,row_json TEXT,row_text TEXT,domain TEXT,root TEXT,function TEXT,gate TEXT)")
            db.execute('CREATE VIRTUAL TABLE rows_fts USING fts5(row_text,source_file,sheet,domain,root,function,gate,content="rows",content_rowid="row_id")')
            values=[(1,"a.csv","Tab1",2,'{"name":"water"}',"water motion","water domain","Parent","LocateRoot","STAY"),
                    (2,"a.csv","Tab1",3,'{"name":"water"}',"water field","water domain","Parent","LocateRoot","TURN"),
                    (3,"b.csv","Tab2",4,'{"name":"stone"}',"stone form","stone domain","Child","Constraint","STAY")]
            db.executemany("INSERT INTO rows VALUES(?,?,?,?,?,?,?,?,?,?)",values)
            db.execute("INSERT INTO rows_fts(rows_fts) VALUES('rebuild')")
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        args={"source":"data/psc_finished_atlas.sqlite","term":"water","limit":1,"cursor":0}
        first=module._query_v35_index(self.root,args,hubmod.safe_under,expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        self.assertEqual(first["returned"],1)
        self.assertTrue(first["hasMore"])
        self.assertEqual(first["records"][0]["rowId"],1)
        self.assertEqual(first["sourceIndex"],"FTS5")
        next_page=module._query_v35_index(self.root,{**args,"cursor":first["nextCursor"]},hubmod.safe_under,expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        self.assertEqual([r["rowId"] for r in next_page["records"]],[2])
        self.assertEqual(next_page["hasMore"],False)
        stay=module._query_v35_index(self.root,{**args,"gate":"STAY","limit":25},hubmod.safe_under,
              expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        turn=module._query_v35_index(self.root,{**args,"gate":"TURN","limit":25},hubmod.safe_under,
              expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        domain=module._query_v35_index(self.root,{**args,"domain":"water domain","limit":25},hubmod.safe_under,
              expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        self.assertEqual([r["rowId"] for r in stay["records"]],[1])
        self.assertEqual([r["rowId"] for r in turn["records"]],[2])
        self.assertEqual([r["rowId"] for r in domain["records"]],[1,2])
        with sqlite3.connect(path) as c:
            plan=[row[3] for row in c.execute(
              "EXPLAIN QUERY PLAN SELECT r.row_id FROM rows_fts JOIN rows r ON r.row_id=rows_fts.rowid WHERE rows_fts MATCH ? AND rows_fts.rowid > ? AND r.gate = ? ORDER BY rows_fts.rowid ASC LIMIT ?",
              ('"water"',0,"STAY",26))]
        self.assertTrue(any("VIRTUAL TABLE INDEX" in step for step in plan))
        self.assertFalse(any("TEMP B-TREE" in step for step in plan),"R957 must not require a temporary result-order sort")
        self.assertEqual(next_page["canonicalWrites"],0)
        self.assertFalse(next_page["historicalExecutorParityProven"])
        with self.assertRaisesRegex(ValueError,"R954_ORIGINAL_SQLITE_SIZE_HELD"):
            module.query_v35_original_atlas_r954(self.root,args,hubmod.safe_under)
        with self.assertRaisesRegex(ValueError,"R954_FTS_SAFE_TERMS_REQUIRED_HELD"):
            module._query_v35_index(self.root,{**args,"term":"water OR stone"},hubmod.safe_under,expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        with self.assertRaisesRegex(ValueError,"R954_PAGE_BOUND_HELD"):
            module._query_v35_index(self.root,{**args,"limit":500},hubmod.safe_under,expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)
        with self.assertRaisesRegex(ValueError,"R954_GATE_SOURCE_VALUE_HELD"):
            module._query_v35_index(self.root,{**args,"gate":"PROVEN"},hubmod.safe_under,expected_sha256=digest,expected_bytes=path.stat().st_size,expected_rows=3)

    def test_r947_original_b043_stream_assembler_no_overwrite_and_refusal(self):
        import hashlib, json, zipfile
        spec=importlib.util.spec_from_file_location(
            "omega_b043_reconstruct_r947",
            MODULE.parent / "omega_b043_reconstruct_r947.py")
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        folder=self.root/"data"/"r947_parts"
        folder.mkdir()
        pieces=[b"part-one-stream\n",b"part-two-stream\n"]
        master=b"".join(pieces)
        digest=lambda b:hashlib.sha256(b).hexdigest()
        manifest={"build":module.RELEASE,
                  "master":{"name":module.MASTER,"sha256":digest(master),"bytes":len(master)},
                  "part_count":2,"parts":[]}
        for i,chunk in enumerate(pieces,1):
            name=f"OMEGA_B043_FULL_SYSTEM_PART_{i:02d}_OF_02.zip"
            member=f"OMEGA_B043_FULL_SYSTEM.chunk_{i:03d}_of_002.bin"
            with zipfile.ZipFile(folder/name,"w",compression=zipfile.ZIP_STORED) as wrapper:
                wrapper.writestr(member,chunk)
            data=(folder/name).read_bytes()
            manifest["parts"].append({"index":i,"part":name,"chunk":member,
               "part_bytes":len(data),"chunk_bytes":len(chunk),
               "part_sha256":digest(data),"chunk_sha256":digest(chunk),
               "members":[member],"part_crc":"PASS"})
        (self.root/"data"/"OMEGA_B043_PARTITION_MANIFEST.json").write_text(
            json.dumps(manifest),encoding="utf-8")
        args={"manifest":"data/OMEGA_B043_PARTITION_MANIFEST.json",
              "archive_folder":"data/r947_parts","destination":"data/OMEGA_B043_FULL_SYSTEM.zip"}
        receipt=module._assemble_parts_r947(self.root,args,hubmod.safe_under,
            expected_count=2,expected_sha256=digest(master),expected_bytes=len(master))
        self.assertEqual(receipt["masterSha256"],digest(master))
        self.assertEqual(receipt["masterBytes"],len(master))
        self.assertEqual(receipt["verifiedWrapperCount"],2)
        self.assertTrue(receipt["sourceExactByteReconstruction"])
        self.assertFalse(receipt["donorCodeExecuted"])
        self.assertEqual(receipt["canonWrites"],0)
        self.assertEqual((self.root/"data"/module.MASTER).read_bytes(),master)
        with self.assertRaisesRegex(ValueError,"R947_DESTINATION_MUST_BE_NEW_MASTER_HELD"):
            module._assemble_parts_r947(self.root,args,hubmod.safe_under,
                expected_count=2,expected_sha256=digest(master),expected_bytes=len(master))
        (self.root/"data"/module.MASTER).unlink()
        with self.assertRaisesRegex(ValueError,"R947_MASTER_SOURCE_AUTHORITY_HELD"):
            module.reconstruct_b043_r947(self.root,args,hubmod.safe_under)
        # The official executor cannot accept the two-part fixture.
        queued=self.hub.enqueue("HISTORICAL_B043_RECONSTRUCT",args)
        held=self.hub.run_one()
        self.assertEqual(held["id"],queued["id"])
        self.assertEqual(held["state"],"HELD")
        self.assertFalse((self.root/"data"/module.MASTER).exists())
        original=(folder/manifest["parts"][0]["part"]).read_bytes()
        (folder/manifest["parts"][0]["part"]).write_bytes(original.replace(b"part-one-stream",b"part-one-tamper"))
        with self.assertRaisesRegex(ValueError,"R947_ORIGINAL_PART_SHA256_MISMATCH_HELD"):
            module._assemble_parts_r947(self.root,args,hubmod.safe_under,
                expected_count=2,expected_sha256=digest(master),expected_bytes=len(master))
        self.assertFalse((self.root/"data"/module.MASTER).exists())

    def test_r938_full_release_source_set_batch_hash_and_fail_closed(self):
        import hashlib
        import json
        import zipfile
        folder=self.root/"data"/"release_parts"
        folder.mkdir()
        entries=[]
        for i in range(1,3):
            name=f"OMEGA_TEST_PART_{i:02d}.zip"
            with zipfile.ZipFile(folder/name,"w",compression=zipfile.ZIP_STORED) as z:
                z.writestr(f"part_{i:02d}/readme.txt",b"source bytes "+str(i).encode())
            blob=(folder/name).read_bytes()
            entries.append({"index":i,"filename":name,"driveId":f"TEST_SOURCE_DRIVE_ID_{i:02d}",
                            "bytes":len(blob),"sha256":hashlib.sha256(blob).hexdigest()})
        index={"schema":"OMEGA_DRIVE_HISTORICAL_ARCHIVE_SOURCE_INDEX_R936",
               "groups":[{"id":"R938-TEST","expectedParts":2,"parts":entries}]}
        path=self.root/"data"/"release-index.json"
        path.write_text(json.dumps(index),encoding="utf-8")
        args={"manifest":"data/release-index.json","archive_folder":"data/release_parts","release":"R938-TEST"}
        queued=self.hub.enqueue("HISTORICAL_RELEASE_SET_AUDIT",args)
        receipt=self.hub.run_one()
        self.assertEqual(receipt["id"],queued["id"])
        self.assertEqual(receipt["state"],"COMPLETED",f"R938 valid source held: {receipt.get('error')}")
        result=receipt["result"]
        self.assertEqual(result["expectedParts"],2)
        self.assertEqual(result["locatedParts"],2)
        self.assertEqual(result["originalSourceDigestsMatched"],2)
        self.assertEqual(result["authorityState"],"SOURCE_DIGESTS_MATCHED_ZIP_PAYLOADS_NOT_EXECUTED")
        self.assertFalse(result["fullZipCrcVerified"])
        self.assertFalse(result["historicalRuntimeParityProven"])
        self.assertEqual(result["canonicalWrites"],0)
        self.assertEqual(self.hub.replay(queued["id"])["state"],"MATCH")
        (folder/entries[1]["filename"]).unlink()
        incomplete=hubmod.audit_historical_release_set_r938(self.root,args)
        self.assertEqual(incomplete["locatedParts"],1)
        self.assertEqual(incomplete["missingParts"],[entries[1]["filename"]])
        self.assertEqual(incomplete["authorityState"],"LOCAL_HASH_ONLY_NOT_ORIGINAL_RELEASE_AUTHORITY")
        original=(folder/entries[0]["filename"]).read_bytes()
        self.assertIn(b"source bytes 1",original)
        # Change a payload with identical length while retaining ZIP metadata.
        # A truncated/non-ZIP file must fail at the earlier metadata gate.
        (folder/entries[0]["filename"]).write_bytes(original.replace(b"source bytes 1",b"source bytes 2"))
        with self.assertRaisesRegex(ValueError,"R938_RELEASE_PART_SHA256_MISMATCH_HELD"):
            hubmod.audit_historical_release_set_r938(self.root,args)
        with self.assertRaisesRegex(ValueError,"R938_RELEASE_SET_ARGUMENT_SCHEMA_HELD"):
            hubmod.audit_historical_release_set_r938(self.root,{**args,"execute":True})
        with self.assertRaisesRegex(ValueError,"R938_RELEASE_ID_UNIQUE_SOURCE_REQUIRED_HELD"):
            hubmod.audit_historical_release_set_r938(self.root,{**args,"release":"MISSING"})
        index["groups"][0]["parts"][0]["filename"]="../unsafe.zip"
        path.write_text(json.dumps(index),encoding="utf-8")
        with self.assertRaisesRegex(ValueError,"R938_SOURCE_INDEX_MEMBER_HELD"):
            hubmod.audit_historical_release_set_r938(self.root,args)

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

    def test_r912_complete_ancestor_chain_and_checkpoint_tamper_refusal(self):
        root=self.hub.enqueue("SPHERE_TENSOR_EXPORT",{
            "seeds":[{"cell":0,"lane":0,"mass":16384}],"steps":4,
            "cell_axis":0,"lane_axis":1,"destination":"chain-root.csv"})
        first=self.hub.run_one()
        self.assertEqual(first["state"],"COMPLETED")
        middle=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
            "export_job_id":root["id"],"destination":"chain-middle.csv",
            "steps":1,"cell_axis":0,"lane_axis":1})
        second=self.hub.run_one()
        self.assertEqual(second["state"],"COMPLETED")
        leaf=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
            "export_job_id":middle["id"],"destination":"chain-leaf.csv",
            "steps":1,"cell_axis":0,"lane_axis":1})
        third=self.hub.run_one()
        self.assertEqual(third["state"],"COMPLETED")
        audit_job=self.hub.enqueue("SPHERE_TENSOR_AUDIT_LINEAGE",{"export_job_id":leaf["id"]})
        audit=self.hub.run_one()
        self.assertEqual(audit["state"],"COMPLETED")
        lineage=audit["result"]
        self.assertEqual(lineage["depth"],3)
        self.assertEqual(lineage["rootExportJobId"],root["id"])
        self.assertEqual([x["jobId"] for x in lineage["entries"]],[leaf["id"],middle["id"],root["id"]])
        self.assertTrue(all(x["mass"]==16384 for x in lineage["entries"]))
        self.assertFalse(lineage["signedProvenance"])
        self.assertEqual(self.hub.replay(audit_job["id"])["state"],"MATCH")
        render_valid=self.hub.enqueue("SPHERE_TENSOR_RENDER",{
            "export_job_id":leaf["id"],"destination":"chain-original-art.svg"})
        rendered=self.hub.run_one()
        self.assertEqual(rendered["state"],"COMPLETED")
        self.assertEqual(self.hub.verified_svg_artifact(render_valid["id"])[1],
                         rendered["result"]["artifact"]["sha256"])
        original=self.root/"chain-root.csv"
        content=original.read_bytes()
        try:
            original.write_bytes(content+b"X")
            denied=self.hub.enqueue("SPHERE_TENSOR_AUDIT_LINEAGE",{"export_job_id":leaf["id"]})
            held=self.hub.run_one()
            self.assertEqual(held["state"],"HELD")
            self.assertIn("R905_",held["error"])
            verify_leaf=self.hub.enqueue("SPHERE_TENSOR_VERIFY",{"export_job_id":leaf["id"]})
            self.assertEqual(self.hub.run_one()["state"],"HELD")
            with self.assertRaises(ValueError):
                self.hub.verified_svg_artifact(render_valid["id"])
            continued=self.hub.enqueue("SPHERE_TENSOR_CONTINUE",{
                "export_job_id":leaf["id"],"destination":"cannot-continue.csv",
                "steps":1,"cell_axis":0,"lane_axis":1})
            blocked=self.hub.run_one()
            self.assertEqual(blocked["state"],"HELD")
            self.assertFalse((self.root/"cannot-continue.csv").exists())
            render=self.hub.enqueue("SPHERE_TENSOR_RENDER",{
                "export_job_id":leaf["id"],"destination":"cannot-render.svg"})
            self.assertEqual(self.hub.run_one()["state"],"HELD")
            self.assertFalse((self.root/"cannot-render.svg").exists())
            with self.assertRaises(ValueError):
                self.hub.verified_csv_artifact(leaf["id"])
        finally:original.write_bytes(content)
        after=self.hub.enqueue("SPHERE_TENSOR_AUDIT_LINEAGE",{"export_job_id":leaf["id"]})
        self.assertEqual(self.hub.run_one()["state"],"COMPLETED")

    def test_r913_intermediate_state_and_sqlite_receipt_tamper_refusal(self):
        """An unchanged leaf cannot launder a corrupted middle CSV or receipt."""
        root = self.hub.enqueue("SPHERE_TENSOR_EXPORT", {
            "seeds": [{"cell": 0, "lane": 0, "mass": 16384}],
            "steps": 4, "cell_axis": 0, "lane_axis": 1,
            "destination": "r913-root.csv"})
        self.assertEqual(self.hub.run_one()["state"], "COMPLETED")
        middle = self.hub.enqueue("SPHERE_TENSOR_CONTINUE", {
            "export_job_id": root["id"], "destination": "r913-middle.csv",
            "steps": 1, "cell_axis": 0, "lane_axis": 1})
        self.assertEqual(self.hub.run_one()["state"], "COMPLETED")
        leaf = self.hub.enqueue("SPHERE_TENSOR_CONTINUE", {
            "export_job_id": middle["id"], "destination": "r913-leaf.csv",
            "steps": 1, "cell_axis": 0, "lane_axis": 1})
        self.assertEqual(self.hub.run_one()["state"], "COMPLETED")
        self.assertEqual(self.hub.audit_sparse_lineage_r912(leaf["id"])["depth"], 3)

        middle_file = self.root / "r913-middle.csv"
        original_bytes = middle_file.read_bytes()
        try:
            middle_file.write_bytes(original_bytes + b"tampered")
            with self.assertRaisesRegex(ValueError, "R905_"):
                self.hub.audit_sparse_lineage_r912(leaf["id"])
            with self.assertRaises(ValueError):
                self.hub.verified_csv_artifact(leaf["id"])
            denied = self.hub.enqueue("SPHERE_TENSOR_CONTINUE", {
                "export_job_id": leaf["id"], "destination": "r913-denied.csv",
                "steps": 1, "cell_axis": 0, "lane_axis": 1})
            self.assertEqual(self.hub.run_one()["state"], "HELD")
            self.assertFalse((self.root / "r913-denied.csv").exists())
        finally:
            middle_file.write_bytes(original_bytes)
        self.assertEqual(self.hub.audit_sparse_lineage_r912(leaf["id"])["depth"], 3)

        original_sha = self.hub.get(middle["id"])["result_sha256"]
        try:
            with self.hub.connection() as conn:
                conn.execute("UPDATE jobs SET result_sha256=? WHERE id=?",
                             ("0" * 64, middle["id"]))
            with self.assertRaisesRegex(ValueError, "R905_DURABLE_RECEIPT_DRIFT_HELD"):
                self.hub.audit_sparse_lineage_r912(leaf["id"])
            denied = self.hub.enqueue("SPHERE_TENSOR_RENDER", {
                "export_job_id": leaf["id"],
                "destination": "r913-denied.svg"})
            self.assertEqual(self.hub.run_one()["state"], "HELD")
            self.assertFalse((self.root / "r913-denied.svg").exists())
            with self.assertRaises(ValueError):
                self.hub.verified_csv_artifact(leaf["id"])
        finally:
            with self.hub.connection() as conn:
                conn.execute("UPDATE jobs SET result_sha256=? WHERE id=?",
                             (original_sha, middle["id"]))
        self.assertEqual(self.hub.audit_sparse_lineage_r912(leaf["id"])["depth"], 3)

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
    def test_r916_real_local_chat_context_and_durable_followup(self):
        from unittest.mock import patch
        from types import SimpleNamespace
        calls = []
        def infer(payload):
            calls.append(payload)
            return {"schema": "OMEGA_LOCAL_INFER_R899", "done": True,
                    "response": "answer-" + str(len(calls))}
        fake = SimpleNamespace(infer_local_r899=infer)
        with patch.object(hubmod, "load_local_inference_adapter_r899", return_value=fake):
            first = self.hub.enqueue("LOCAL_CHAT", {
                "model": "local-test", "prompt": "Explain the grid", "num_predict": 64})
            result1 = self.hub.run_one()
            self.assertEqual(result1["state"], "COMPLETED")
            self.assertEqual(result1["result"]["response"], "answer-1")
            self.assertEqual(result1["result"]["contextTurns"], 1)
            second = self.hub.enqueue("LOCAL_CHAT", {
                "model": "local-test", "prompt": "Continue with one example",
                "num_predict": 64, "previous_job_id": first["id"]})
            result2 = self.hub.run_one()
            self.assertEqual(result2["state"], "COMPLETED")
            self.assertEqual(result2["result"]["contextTurns"], 2)
            self.assertEqual(result2["result"]["contextJobIds"], [first["id"]])
            self.assertIn("Explain the grid", calls[1]["prompt"])
            self.assertIn("answer-1", calls[1]["prompt"])
            self.assertIn("Continue with one example", calls[1]["prompt"])
            restarted = hubmod.Hub(self.root, self.root / ".omega" / "jobs.sqlite")
            third = restarted.enqueue("LOCAL_CHAT", {
                "model": "local-test", "prompt": "Give the next step",
                "previous_job_id": second["id"]})
            result3 = restarted.run_one()
            self.assertEqual(result3["state"], "COMPLETED")
            self.assertEqual(result3["result"]["contextTurns"], 3)
            self.assertEqual(result3["result"]["contextJobIds"],
                             [first["id"], second["id"]])
            self.assertEqual(len(calls), 3)

    def test_r916_refuses_parent_tamper_and_model_mismatch(self):
        from unittest.mock import patch
        from types import SimpleNamespace
        fake = SimpleNamespace(infer_local_r899=lambda payload: {
            "schema": "OMEGA_LOCAL_INFER_R899", "done": True, "response": "local response"})
        with patch.object(hubmod, "load_local_inference_adapter_r899", return_value=fake):
            first = self.hub.enqueue("LOCAL_CHAT", {
                "model": "local-test", "prompt": "first"})
            self.assertEqual(self.hub.run_one()["state"], "COMPLETED")
            mismatch = self.hub.enqueue("LOCAL_CHAT", {
                "model": "other-model", "prompt": "second", "previous_job_id": first["id"]})
            self.assertEqual(self.hub.run_one()["state"], "HELD")
            self.assertIn("R916_CHAT_PARENT_INTEGRITY_OR_MODEL_HELD",
                          self.hub.get(mismatch["id"])["error"])
            original = self.hub.get(first["id"])["result_sha256"]
            try:
                with self.hub.connection() as conn:
                    conn.execute("UPDATE jobs SET result_sha256=? WHERE id=?",
                                 ("0"*64, first["id"]))
                follow = self.hub.enqueue("LOCAL_CHAT", {
                    "model": "local-test", "prompt": "followup",
                    "previous_job_id": first["id"]})
                held = self.hub.run_one()
                self.assertEqual(held["state"], "HELD")
                self.assertIn("R916_CHAT_PARENT_INTEGRITY_OR_MODEL_HELD", held["error"])
            finally:
                with self.hub.connection() as conn:
                    conn.execute("UPDATE jobs SET result_sha256=? WHERE id=?",
                                 (original, first["id"]))
            invalid = self.hub.enqueue("LOCAL_CHAT", {
                "model": "local-test", "prompt": "x", "endpoint": "https://remote.example"})
            self.assertEqual(self.hub.run_one()["state"], "HELD")
            self.assertIn("R916_CHAT_ARGUMENT_SCHEMA_HELD",
                          self.hub.get(invalid["id"])["error"])

    def test_r915_manifest_exclusive_creation_refuses_race_without_clobber(self):
        from unittest.mock import patch
        source = "data/one.csv"
        destination = "out/r915-raced.json"
        # Use the same canonicalized path as the production safe_under() call.
        # Windows tempfile roots can have alternate absolute spellings, so
        # comparing an unresolved test path to the resolved execution path
        # silently bypasses the deliberate race injection.
        target = hubmod.safe_under(self.root, destination, False)
        target.parent.mkdir(parents=True, exist_ok=True)
        original_open = Path.open
        injected = [False]

        def competing_open(path, mode="r", *args, **kwargs):
            if path == target and mode == "xb" and not injected[0]:
                injected[0] = True
                with original_open(path, "wb") as stream:
                    stream.write(b"independent-file")
            return original_open(path, mode, *args, **kwargs)

        job = self.hub.enqueue("EXPORT_MANIFEST", {
            "destination": destination, "sources": [source]})
        with patch.object(Path, "open", competing_open):
            refused = self.hub.run_one()
        self.assertTrue(injected[0], "R915 race was not exercised")
        self.assertEqual(refused["id"], job["id"])
        self.assertEqual(refused["state"], "HELD")
        self.assertIn("R915_MANIFEST_DESTINATION_EXISTS_HELD", refused["error"])
        self.assertEqual(target.read_bytes(), b"independent-file")
        self.assertEqual(self.hub.replay(job["id"])["state"], "REPLAY_NOT_ADMISSIBLE")


    def test_r921_historical_archive_hash_tree_replay_and_refusals(self):
        import hashlib
        import zipfile
        source = self.root / "data" / "historical-b010.zip"
        with zipfile.ZipFile(source,"w",compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr("omega/runtime_core.py", b"print('do-not-execute-me')\\n")
            z.writestr("native/src/main.cpp", b"int main(){return 0;}\\n")
            z.writestr("ledgers/BUILD_LEDGER.json", b'{"status":"SOURCE_ONLY"}')
        expected=hubmod.sha_file(source)
        job=self.hub.enqueue("HISTORICAL_ZIP_AUDIT",{"source":"data/historical-b010.zip","expected_sha256":expected})
        completed=self.hub.run_one()
        self.assertEqual(completed["id"],job["id"])
        self.assertEqual(completed["state"],"COMPLETED")
        result=completed["result"]
        self.assertEqual(result["schema"],"OMEGA_HISTORICAL_ARCHIVE_INTAKE_R921")
        self.assertEqual(result["fileCount"],3)
        self.assertEqual(result["archive"]["sha256"],expected)
        self.assertEqual(result["extensionCounts"],{".cpp":1,".json":1,".py":1})
        self.assertEqual(len(result["memberTreeSha256"]),64)
        self.assertFalse(result["historicalCodeExecuted"])
        self.assertFalse(result["sourceExecutionProven"])
        self.assertEqual(result["canonicalWrites"],0)
        self.assertEqual(self.hub.replay(job["id"])["state"],"MATCH")
        refused=self.hub.enqueue("HISTORICAL_ZIP_AUDIT",{"source":"data/historical-b010.zip","expected_sha256":"0"*64})
        self.assertEqual(self.hub.run_one()["state"],"HELD")
        self.assertIn("R921_ARCHIVE_SHA256_MISMATCH_HELD",self.hub.get(refused["id"])["error"])
        self.assertEqual(self.hub.replay(refused["id"])["state"],"REPLAY_NOT_ADMISSIBLE")
        with zipfile.ZipFile(source,"a") as z:
            z.writestr("evidence/next.json", b'{"revision":2}')
        self.assertEqual(self.hub.replay(job["id"])["state"],"REPLAY_FAILED")

        for name,rows,error in [
            ("zip-slip",[("../escape.py",b"x")],"R921_UNSAFE_ARCHIVE_ENTRY_HELD"),
            ("windows-collision",[("Omega/Run.py",b"a"),("omega/run.PY",b"b")],"R921_CASEFOLD_PATH_COLLISION_HELD"),
            ("windows-separator",[("omega/runtime.py",b"x")],"R921_UNSAFE_ARCHIVE_ENTRY_HELD"),
        ]:
            target=self.root / "data" / (name+".zip")
            with zipfile.ZipFile(target,"w") as z:
                for entry,payload in rows:z.writestr(entry,payload)
            if name=="windows-separator":
                # Python ZipInfo normalizes backslash to slash on Windows.
                # Patch both ZIP filename headers so every OS audits the
                # same genuinely unsafe raw entry rather than a sanitized one.
                raw=target.read_bytes()
                self.assertEqual(raw.count(b"omega/runtime.py"),2)
                target.write_bytes(raw.replace(b"omega/runtime.py",b"omega\\runtime.py"))
            queued=self.hub.enqueue("HISTORICAL_ZIP_AUDIT",{"source":"data/"+name+".zip"})
            reply=self.hub.run_one()
            self.assertEqual(reply["state"],"HELD",name)
            self.assertIn(error,reply["error"],name)
            self.assertEqual(self.hub.replay(queued["id"])["state"],"REPLAY_NOT_ADMISSIBLE")
        # No files are extracted or executed, and all 4 corrupted cases retain receipts.
        self.assertFalse((self.root / "escape.py").exists())


    def test_r922_historical_b010_execution_must_be_exact_pinned_source(self):
        import zipfile
        import hashlib
        self.assertEqual(hubmod.B010_ARCHIVE_SHA256_R922,
                         "bb8df3a47008db98cf2348241e1bff035dd6ff5beacb5e5553a5693e41907d4e")
        candidate=self.root/"data"/"untrusted-b010.zip"
        with zipfile.ZipFile(candidate,"w") as z:
            z.writestr("omega/runtime_core.py",b"raise RuntimeError('must not execute')")
        before=(self.root/".omega"/"b010-r922-").exists()
        for args,error in [
            ({"source":"data/untrusted-b010.zip","steps":0},"R922_B010_INPUT_BOUND_HELD"),
            ({"source":"data/untrusted-b010.zip","steps":13},"R922_B010_INPUT_BOUND_HELD"),
            ({"source":"data/untrusted-b010.zip","steps":True},"R922_B010_INPUT_BOUND_HELD"),
            ({"source":"data/untrusted-b010.zip","steps":1,"axes":{"invalid":"x"}},"R922_B010_AXES_SCHEMA_HELD"),
            ({"source":"data/untrusted-b010.zip","steps":1},"R922_B010_EXACT_SOURCE_SHA256_REQUIRED_HELD"),
            ({"source":"../untrusted-b010.zip","steps":1},"PARENT_TRAVERSAL_HELD"),
        ]:
            queued=self.hub.enqueue("HISTORICAL_B010_EXECUTE",args)
            received=self.hub.run_one()
            self.assertEqual(received["id"],queued["id"])
            self.assertEqual(received["state"],"HELD")
            self.assertIn(error,received["error"])
            self.assertEqual(self.hub.replay(queued["id"])["state"],"REPLAY_NOT_ADMISSIBLE")
        self.assertEqual((self.root/".omega"/"b010-r922-").exists(),before)


    def test_r924_full_duplex_24_bin_20_part_manifest_hash_correlations(self):
        import json
        import zipfile
        import hashlib
        laws=hubmod.R924_LAWS
        self.assertEqual(len(laws),12)
        assert len(set(laws))==12
        payloads=[]
        for i in range(1,25):
            side="INVERSE" if i<=12 else "OUTVERSE"
            payloads.append({"index":i,"name":f"P{i:02d}.bin",
               "space":side,"authority":side+"_"+laws[(i-1)%12],
               "sha256":hashlib.sha256(str(i).encode()).hexdigest()})
        parts=[]
        all_names=[p["name"] for p in payloads]
        for n in range(1,21):
            name=f"OMEGA_V61_3_PART_{n:02d}.zip"
            dest=self.root/"data"/name
            included=all_names[(n-1):(n)] if n<=19 else all_names[19:]
            with zipfile.ZipFile(dest,"w",compression=zipfile.ZIP_STORED) as z:
                for item in included:
                    z.writestr("OMEGA_SETUP/"+item,b"payload-not-executed")
            parts.append({"file":name,"bytes":dest.stat().st_size,
                          "sha256":hubmod.sha_file(dest),"entries":len(included)})
        manifest=self.root/"data"/"release.json"
        manifest.write_text(json.dumps({"outer_parts":parts,"payloads":payloads}),encoding="utf-8")
        args={"manifest":"data/release.json","archive_folder":"data"}
        job=self.hub.enqueue("HISTORICAL_DUPLEX24_CORRELATE",args)
        result=self.hub.run_one()
        self.assertEqual(result["id"],job["id"])
        self.assertEqual(result["state"],"COMPLETED")
        matrix=result["result"]
        self.assertEqual(matrix["schema"],"OMEGA_HISTORICAL_DUPLEX24_CORRELATION_R924")
        self.assertEqual(matrix["state"],"COMPLETE_OUTER_DISTRIBUTION_HASHES_SOURCE_ONLY")
        self.assertEqual(matrix["verifiedOuterParts"],20)
        self.assertEqual(matrix["payloadsLocatedByName"],24)
        self.assertEqual(len(matrix["duplexPairs"]),12)
        self.assertFalse(matrix["payloadBytesAllIndependentlyVerified"])
        self.assertFalse(matrix["productionReady"])
        self.assertEqual(matrix["canonicalWrites"],0)
        self.assertEqual(self.hub.replay(job["id"])["state"],"MATCH")
        (self.root/"data"/"OMEGA_V61_3_PART_05.zip").unlink()
        partial=self.hub.enqueue("HISTORICAL_DUPLEX24_CORRELATE",args)
        held=self.hub.run_one()
        self.assertEqual(held["id"],partial["id"])
        self.assertEqual(held["result"]["state"],"INCOMPLETE_ARCHIVE_SET_HELD")
        self.assertEqual(held["result"]["verifiedOuterParts"],19)
        self.assertEqual(held["result"]["missingParts"],["OMEGA_V61_3_PART_05.zip"])
        self.assertEqual(self.hub.replay(job["id"])["state"],"DRIFT")
        payloads[13]["authority"]="OUTVERSE_FAKE"
        manifest.write_text(json.dumps({"outer_parts":parts,"payloads":payloads}),encoding="utf-8")
        bad=self.hub.enqueue("HISTORICAL_DUPLEX24_CORRELATE",args)
        rejected=self.hub.run_one()
        self.assertEqual(rejected["state"],"HELD")
        self.assertIn("R924_BIN_AUTHORITY_OR_SHA_HELD",rejected["error"])


    def test_r925_exact_correlated_donor_field_and_duplex_receipts(self):
        import json
        import hashlib
        def completed(operation,args,payload):
            submitted=self.hub.enqueue(operation,args)
            encoded=hubmod.json_bytes(payload)
            with self.hub.connection() as conn:
                conn.execute("UPDATE jobs SET state='COMPLETED',result_json=?,result_sha256=? WHERE id=?",
                             (encoded.decode(),hubmod.sha_bytes(encoded),submitted["id"]))
            return submitted["id"]
        hexdigest=lambda b:hashlib.sha256(str(b).encode()).hexdigest()
        address=11498
        frame={"frame":1,"statePacketSha256":hexdigest("state"),
               "traversalPacketSha256":hexdigest("traversal"),
               "transitionSha256":hexdigest("transition"),
               "renderControlSha256":hexdigest("render"),
               "acceptanceSha256":hexdigest("acceptance"),
               "traversalAddress":address}
        donor={"schema":"OMEGA_VERIFIED_HISTORICAL_B010_EXECUTION_R922",
               "archiveSha256":hubmod.B010_ARCHIVE_SHA256_R922,
               "state":"HISTORICAL_DONOR_RUNTIME_EXECUTED_NOT_CANON_ADMITTED",
               "currentCanonWrites":0,"nativePcAccepted":False,
               "frames":[frame],"frameChainSha256":hubmod.sha_bytes(hubmod.json_bytes([frame]))}
        sparse={"schema":"OMEGA_IMPLICIT_CELL_LANE_TENSOR_R902",
                "conservationExact":True,"totalMassBefore":4096,"totalMassAfter":4096,
                "cellCount":20736,"lanesPerCell":20736,
                "physicalPcAccepted":False,"gpuComputeProven":False,
                "fullStateSha256":hexdigest("real-state")}
        source={"schema":"OMEGA_HISTORICAL_DUPLEX24_CORRELATION_R924",
                "duplexPairs":[{"law":s} for s in hubmod.R924_LAWS],
                "canonicalWrites":0,"productionReady":False,
                "state":"INCOMPLETE_ARCHIVE_SET_HELD","verifiedOuterParts":19}
        donor_id=completed("HISTORICAL_B010_EXECUTE",{"source":"data/pinned.zip"},donor)
        tensor_id=completed("SPHERE_TENSOR_STEP",
                            {"seeds":[{"cell":address,"lane":32,"mass":4096}],"steps":1},
                            sparse)
        duplex_id=completed("HISTORICAL_DUPLEX24_CORRELATE",{"manifest":"data/manifest.json"},source)
        args={"b010_job_id":donor_id,"tensor_job_id":tensor_id,"duplex_job_id":duplex_id}
        correlation=self.hub.enqueue("CORRELATE_HISTORICAL_FIELD",args)
        received=self.hub.run_one()
        self.assertEqual(received["state"],"COMPLETED")
        result=received["result"]
        self.assertEqual(result["schema"],"OMEGA_CROSS_ENGINE_CORRELATION_R925")
        self.assertEqual(result["address"],address)
        self.assertEqual(result["nestedStateComponents"],429981696)
        self.assertEqual(len(result["nodes"]),3)
        self.assertEqual(result["duplexCompleteness"],"INCOMPLETE_ARCHIVE_SET_HELD")
        self.assertEqual(result["correlationSha256"],hubmod.sha_bytes(hubmod.json_bytes(result["nodes"])))
        self.assertEqual(result["canonicalWrites"],0)
        self.assertFalse(result["historicalDonorAuthorityEscalated"])
        self.assertFalse(result["productionProof"])
        self.assertEqual(self.hub.replay(correlation["id"])["state"],"MATCH")
        with self.hub.connection() as conn:
            conn.execute("UPDATE jobs SET args_json=? WHERE id=?",
                         (json.dumps({"seeds":[{"cell":address+1,"lane":32,"mass":4096}],"steps":1}),tensor_id))
        refused=self.hub.enqueue("CORRELATE_HISTORICAL_FIELD",args)
        held=self.hub.run_one()
        self.assertEqual(held["state"],"HELD")
        self.assertIn("R925_SPHERE_ADDRESS_OR_CONSERVATION_HELD",held["error"])
        self.assertEqual(self.hub.replay(correlation["id"])["state"],"REPLAY_FAILED")
        with self.hub.connection() as conn:
            conn.execute("UPDATE jobs SET result_sha256=? WHERE id=?",("0"*64,donor_id))
        tampered=self.hub.enqueue("CORRELATE_HISTORICAL_FIELD",args)
        reply=self.hub.run_one()
        self.assertEqual(reply["state"],"HELD")
        self.assertIn("R925_SOURCE_RECEIPT_INTEGRITY_OR_AUTHORITY_HELD",reply["error"])

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
            # R914 malformed or ambiguous framing returns a stable JSON
            # refusal, not an uncaught exception or partial execution.
            import http.client
            cases=(
                (("Content-Length","not-a-number"),400,"INVALID_REQUEST_FRAMING_HELD"),
                (("Content-Length","-1"),400,"INVALID_REQUEST_FRAMING_HELD"),
                (("Content-Length","99999999999999999999999"),400,"INVALID_REQUEST_FRAMING_HELD"),
                (("Content-Length",str(hubmod.MAX_BODY+1)),413,"BODY_SIZE_HELD"),
            )
            for header,status,state in cases:
                with self.subTest(header=header):
                    client=http.client.HTTPConnection("127.0.0.1",port,timeout=2)
                    try:
                        client.putrequest("POST","/api/hub/jobs")
                        client.putheader("X-Omega-Local-Token",token)
                        client.putheader(*header)
                        client.endheaders()
                        response=client.getresponse()
                        self.assertEqual(response.status,status)
                        self.assertEqual(json.loads(response.read())["state"],state)
                    finally:client.close()
            for variant in ("duplicate","transfer"):
                with self.subTest(variant=variant):
                    client=http.client.HTTPConnection("127.0.0.1",port,timeout=2)
                    try:
                        client.putrequest("POST","/api/hub/jobs")
                        client.putheader("X-Omega-Local-Token",token)
                        client.putheader("Content-Length","2")
                        if variant=="duplicate":
                            client.putheader("Content-Length","2")
                        else:
                            client.putheader("Transfer-Encoding","chunked")
                        client.endheaders()
                        response=client.getresponse()
                        self.assertEqual(response.status,400)
                        self.assertEqual(json.loads(response.read())["state"],"INVALID_REQUEST_FRAMING_HELD")
                    finally:client.close()
            with urllib.request.urlopen(urllib.request.Request(endpoint,headers=valid),timeout=2) as res:
                self.assertEqual(res.status,200)
                self.assertEqual(json.load(res)["schema"],hubmod.SCHEMA)
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
