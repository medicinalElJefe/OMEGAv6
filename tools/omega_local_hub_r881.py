#!/usr/bin/env python3
"""OMEGA R881 bounded loopback automation hub. No shell commands or PC acceptance claims."""
from __future__ import annotations
import argparse
import csv
import hashlib
import hmac
import json
import os
from pathlib import Path, PurePosixPath
import secrets
import sqlite3
import threading
import time
from contextlib import contextmanager
import uuid
import zipfile
import stat
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

SCHEMA = "OMEGA_LOCAL_EDGE_HUB_R881"
MAX_BODY = 65536
MAX_FILES = 5000
MAX_FILE_SIZE = 64 * 1024 * 1024
ALLOWED_ORIGINS = frozenset({
    "https://omegav6.jeffdeweyeljefe.workers.dev",
    "http://127.0.0.1:5173", "http://localhost:5173",
    "http://127.0.0.1:8765", "http://localhost:8765"
})
def allowed_browser_origin(origin):
    """Allow canonical cloud UI or exact HTTP loopback host with a valid port.

    The portable Windows studio chooses an ephemeral loopback port. A broad
    wildcard CORS rule would be unsafe; an exact local origin still requires
    the separate Hub token and correct Host header for every API request.
    """
    if not isinstance(origin, str): return False
    if origin in ALLOWED_ORIGINS: return True
    try:
        parts = urlsplit(origin)
        return (parts.scheme == "http" and parts.hostname in ("127.0.0.1", "localhost")
                and parts.port is not None and 1 <= parts.port <= 65535
                and origin == f"http://{parts.hostname}:{parts.port}")
    except ValueError:
        return False

def load_local_inference_adapter_r899():
    import importlib.util
    adapter_path=Path(__file__).resolve().with_name("omega_local_inference_r899.py")
    if not adapter_path.is_file(): raise ValueError("R899_LOCAL_MODEL_ADAPTER_REQUIRED")
    spec=importlib.util.spec_from_file_location("_omega_local_inference_r899",adapter_path)
    adapter=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(adapter)
    return adapter


def audit_historical_zip_r921(root: Path, args: dict):
    """Inspect historic build archive bytes without extraction, import or execution.

    A bounded inventory proves member CRC and SHA-256 for the supplied file at
    the time of the audit. It does not prove runnable software, source trust,
    native device acceptance, or Canon admission.
    """
    if not isinstance(args, dict) or set(args)-{"source","expected_sha256"}:
        raise ValueError("R921_ARCHIVE_ARGUMENT_SCHEMA_HELD")
    rel=args.get("source")
    if not isinstance(rel,str) or not rel.lower().endswith(".zip"):
        raise ValueError("R921_ZIP_SOURCE_REQUIRED_HELD")
    source=safe_under(root,rel,True)
    compressed_size=source.stat().st_size
    if compressed_size<22 or compressed_size>512*1024*1024:
        raise ValueError("R921_ARCHIVE_SIZE_BOUND_HELD")
    expected=args.get("expected_sha256")
    if expected is not None and (not isinstance(expected,str) or len(expected)!=64 or
        any(ch not in "0123456789abcdef" for ch in expected)):
        raise ValueError("R921_EXPECTED_DIGEST_SCHEMA_HELD")
    archive_hash=sha_file(source)
    if expected is not None and expected!=archive_hash:
        raise ValueError("R921_ARCHIVE_SHA256_MISMATCH_HELD")
    entries=[]
    total=0
    seen=set()
    types={}
    try:
        with zipfile.ZipFile(source,"r") as archive:
            infos=archive.infolist()
            if len(infos)>5000:
                raise ValueError("R921_ARCHIVE_MEMBER_COUNT_HELD")
            for info in infos:
                name=unicodedata.normalize("NFC",info.filename)
                parts=PurePosixPath(name).parts
                if (not name or name.startswith("/") or "\\" in name or
                    ":" in name or not parts or any(part in (".","..") for part in parts) or
                    info.flag_bits&1 or (stat.S_IFMT(info.external_attr>>16)==stat.S_IFLNK)):
                    raise ValueError("R921_UNSAFE_ARCHIVE_ENTRY_HELD")
                normalized="/".join(parts).rstrip("/").casefold()
                if normalized in seen:
                    raise ValueError("R921_CASEFOLD_PATH_COLLISION_HELD")
                seen.add(normalized)
                if info.is_dir():
                    continue
                if info.file_size>512*1024*1024 or total+info.file_size>2*1024*1024*1024:
                    raise ValueError("R921_ARCHIVE_EXPANSION_BUDGET_HELD")
                total+=info.file_size
                extension=PurePosixPath(name).suffix.lower() or "(none)"
                types[extension]=types.get(extension,0)+1
                digest=hashlib.sha256()
                with archive.open(info,"r") as stream:
                    while True:
                        block=stream.read(1024*1024)
                        if not block: break
                        digest.update(block)
                entries.append({"path":name,"size":info.file_size,"crc32":format(info.CRC,"08x"),"sha256":digest.hexdigest()})
    except (zipfile.BadZipFile,EOFError,RuntimeError,NotImplementedError) as exc:
        raise ValueError("R921_INVALID_ARCHIVE_OR_CRC_HELD") from exc
    tree_hash=sha_bytes(json_bytes(sorted(entries,key=lambda e:e["path"])))
    return {"schema":"OMEGA_HISTORICAL_ARCHIVE_INTAKE_R921",
            "state":"HASHED_SOURCE_INVENTORY_ONLY",
            "archive":{"path":rel,"sha256":archive_hash,"compressedBytes":compressed_size},
            "fileCount":len(entries),"uncompressedBytes":total,
            "extensionCounts":dict(sorted(types.items())),
            "memberTreeSha256":tree_hash,
            "firstMembers":sorted(entries,key=lambda e:e["path"])[:24],
            "allMembersInTreeHash":True,
            "historicalCodeExecuted":False,"canonicalWrites":0,
            "nativePcAccepted":False,"gpuComputeProven":False,
            "sourceExecutionProven":False,"empiricalTruthProven":False,
            "proofTier":"OBSERVATION_OF_LOCAL_ARCHIVE_BYTES"}


# An independently inspected, byte-exact historical engine donor.
# This does not imply trusted physical observations, R237 admission or GPU acceptance.
B010_ARCHIVE_SHA256_R922="bb8df3a47008db98cf2348241e1bff035dd6ff5beacb5e5553a5693e41907d4e"
R922_AXES=frozenset(("view_mode","embodiment","scale","domain","color_profile","truth_mode","quality","time_authority"))
def execute_b010_r922(root:Path,args:dict):
    """Operator-authored execution of the exact reviewed B010 ZIP, no extraction.
    
    Run an independent donor state machine in a disposable private workspace.
    Never write into the current OMEGA Canon, SPHERE fabric or source archive.
    """
    if not isinstance(args,dict) or set(args)-{"source","steps","axes"}:
        raise ValueError("R922_B010_ARGUMENT_SCHEMA_HELD")
    rel=args.get("source")
    steps=args.get("steps",1)
    axes=args.get("axes",{})
    if not isinstance(rel,str) or not rel.lower().endswith(".zip") or type(steps) is not int or not 1<=steps<=12:
        raise ValueError("R922_B010_INPUT_BOUND_HELD")
    if (not isinstance(axes,dict) or set(axes)-R922_AXES or
        any(not isinstance(v,str) or len(v)>32 for v in axes.values())):
        raise ValueError("R922_B010_AXES_SCHEMA_HELD")
    archive=safe_under(root,rel,True)
    if archive.stat().st_size>512*1024*1024 or sha_file(archive)!=B010_ARCHIVE_SHA256_R922:
        raise ValueError("R922_B010_EXACT_SOURCE_SHA256_REQUIRED_HELD")
    # Independently confirm ZIP members and refusal boundaries BEFORE importing
    # Python code. The pinned SHA identifies the reviewed donor, never new code.
    audited=audit_historical_zip_r921(root,{"source":rel,"expected_sha256":B010_ARCHIVE_SHA256_R922})
    required={"omega/runtime_core.py","omega/state/packet.py","omega/traversal/packet.py",
              "omega/calculus/transition.py","omega/validation/acceptance.py"}
    if not required.issubset(x["path"] for x in audited["firstMembers"]):
        # The firstMembers display slice is not a complete inventory; validate
        # existence independently without relying on that lossy UI sample.
        with zipfile.ZipFile(archive) as original:
            if not required.issubset(original.namelist()):
                raise ValueError("R922_B010_REQUIRED_SOURCE_MEMBERS_HELD")
    import importlib
    import sys
    import tempfile
    if any(name=="omega" or name.startswith("omega.") for name in sys.modules):
        raise ValueError("R922_EXISTING_OMEGA_PYTHON_MODULE_NAMESPACE_HELD")
    from pathlib import Path as _Path
    private=root/".omega"
    private.mkdir(parents=True,exist_ok=True)
    sys.path.insert(0,str(archive))
    try:
        from_module=importlib.import_module("omega.runtime_core")
        with tempfile.TemporaryDirectory(prefix="b010-r922-",dir=str(private)) as temporary:
            base=_Path(temporary)
            runtime=from_module.OmegaRuntimeCore(workspace=":memory:",evidence_root=base/"evidence",
                              checkpoint_root=base/"checkpoints",stream_root=base/"world")
            try:
                if axes:
                    runtime.set_axes(**axes)
                frames=[]
                for _ in range(steps):
                    result=runtime.step(render_settings={"width":1920,"height":1080})
                    if result.get("acceptance",{}).get("passed") is not True:
                        raise ValueError("R922_B010_RUNTIME_ACCEPTANCE_HELD")
                    frames.append({"frame":result["state"]["frame"],
                        "statePacketSha256":result["state_packet_digest"],
                        "traversalPacketSha256":result["traversal_packet_digest"],
                        "transitionSha256":result["transition_digest"],
                        "renderControlSha256":result["render_control_packet_digest"],
                        "acceptanceSha256":result["acceptance"]["digest"],
                        "traversalAddress":result["traversal_packet"]["address"],
                        "selectedOperator":result["transition"]["selected"]})
                commands=runtime.audit_commands()
                if commands.get("missing")!=[]:
                    raise ValueError("R922_B010_COMMAND_BINDINGS_HELD")
                selected_axes=runtime.axes.__dict__.copy()
            finally:
                runtime.close()
    finally:
        sys.path.remove(str(archive))
        for key in [k for k in sys.modules if k=="omega" or k.startswith("omega.")]:
            del sys.modules[key]
    return {"schema":"OMEGA_VERIFIED_HISTORICAL_B010_EXECUTION_R922",
            "state":"HISTORICAL_DONOR_RUNTIME_EXECUTED_NOT_CANON_ADMITTED",
            "archiveSha256":B010_ARCHIVE_SHA256_R922,
            "archiveMemberTreeSha256":audited["memberTreeSha256"],
            "steps":steps,"axes":selected_axes,
            "frames":frames,"frameChainSha256":sha_bytes(json_bytes(frames)),
            "commandBindings":commands.get("count"),"missingCommandBindings":commands.get("missing"),
            "historicalSourceExecuted":True,"currentCanonWrites":0,
            "gpuComputeProven":False,"nativePcAccepted":False,
            "scientificTruthProven":False,"currentProductionAcceptance":False}


R924_LAWS=("OBJECTIVE","INFORMATION","IDENTITY","BOUNDARY","RELATIONSHIP","TRANSFORMATION",
           "RESOURCE","CONTINUITY","EVIDENCE","EVALUATION","EXPRESSION","RECURSION")
def correlate_duplex24_r924(root:Path,args:dict):
    """Reconcile all 24 historical BIN authorities and the complete ZIP distribution.

    No code execution, extraction, Canon mutation or release promotion.
    File presence != hash verification; historical metadata != a live proof.
    """
    if not isinstance(args,dict) or set(args)-{"manifest","archive_folder"}:
        raise ValueError("R924_DUPLEX_ARGUMENT_SCHEMA_HELD")
    rel=args.get("manifest")
    folder=args.get("archive_folder",".")
    if not isinstance(rel,str) or not rel.lower().endswith(".json") or not isinstance(folder,str):
        raise ValueError("R924_MANIFEST_PATH_REQUIRED_HELD")
    manifest_path=safe_under(root,rel,True)
    if manifest_path.stat().st_size>2*1024*1024:
        raise ValueError("R924_MANIFEST_TOO_LARGE_HELD")
    try:
        manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
    except (UnicodeError,ValueError) as exc:
        raise ValueError("R924_MANIFEST_JSON_HELD") from exc
    if not isinstance(manifest,dict):
        raise ValueError("R924_MANIFEST_SCHEMA_HELD")
    parts=manifest.get("outer_parts")
    payloads=manifest.get("payloads")
    if not isinstance(parts,list) or len(parts)!=20 or not isinstance(payloads,list) or len(payloads)!=24:
        raise ValueError("R924_EXACT_20_PART_24_BIN_SCHEMA_HELD")
    def valid_sha(value):
        return isinstance(value,str) and len(value)==64 and all(x in "0123456789abcdef" for x in value)
    observed_payload={}
    payload_index={}
    for item in payloads:
        if not isinstance(item,dict):
            raise ValueError("R924_PAYLOAD_RECORD_HELD")
        index=item.get("index")
        name=item.get("name")
        if type(index) is not int or not 1<=index<=24 or name!=f"P{index:02d}.bin" or index in payload_index:
            raise ValueError("R924_BIN_IDENTITY_HELD")
        expected_side="INVERSE" if index<=12 else "OUTVERSE"
        law=R924_LAWS[(index-1)%12]
        if item.get("space")!=expected_side or item.get("authority")!=f"{expected_side}_{law}" or not valid_sha(item.get("sha256")):
            raise ValueError("R924_BIN_AUTHORITY_OR_SHA_HELD")
        payload_index[index]=item
    if len(payload_index)!=24:
        raise ValueError("R924_INCOMPLETE_BIN_PARTITION_HELD")
    expected_parts={}
    for item in parts:
        if not isinstance(item,dict):
            raise ValueError("R924_PART_RECORD_HELD")
        name=item.get("file")
        if (not isinstance(name,str) or not name.startswith("OMEGA_V61_3_PART_") or
            not name.endswith(".zip") or len(name)!=23 or not name[17:19].isdigit() or
            not valid_sha(item.get("sha256")) or type(item.get("bytes")) is not int or
            item["bytes"]<22 or item["bytes"]>768*1024*1024 or name in expected_parts):
            raise ValueError("R924_DISTRIBUTION_PART_RECORD_HELD")
        expected_parts[name]=item
    if len(expected_parts)!=20 or sorted(expected_parts)!=[f"OMEGA_V61_3_PART_{i:02d}.zip" for i in range(1,21)]:
        raise ValueError("R924_DISTRIBUTION_SEQUENCE_HELD")
    results=[]
    verified=0
    present=0
    all_identified_payloads=set()
    for name in sorted(expected_parts):
        source=safe_under(root,(folder.rstrip("/")+"/" if folder!="." else "")+name,False)
        record=expected_parts[name]
        if not source.is_file():
            results.append({"file":name,"state":"MISSING","expectedSha256":record["sha256"]})
            continue
        present+=1
        if source.stat().st_size!=record["bytes"]:
            results.append({"file":name,"state":"SIZE_MISMATCH_HELD","expectedBytes":record["bytes"],
                            "observedBytes":source.stat().st_size})
            continue
        digest=sha_file(source)
        if digest!=record["sha256"]:
            results.append({"file":name,"state":"SHA256_MISMATCH_HELD","expectedSha256":record["sha256"],
                            "observedSha256":digest})
            continue
        try:
            with zipfile.ZipFile(source) as z:
                entries=z.namelist()
                if len(entries)!=record.get("entries"):
                    results.append({"file":name,"state":"ZIP_ENTRY_COUNT_HELD","expectedEntries":record.get("entries"),"observedEntries":len(entries)})
                    continue
                for filename in entries:
                    if filename.startswith("OMEGA_SETUP/") and filename.endswith(".bin"):
                        all_identified_payloads.add(filename.rsplit("/",1)[-1])
        except (zipfile.BadZipFile,OSError):
            results.append({"file":name,"state":"ZIP_STRUCTURE_HELD"})
            continue
        verified+=1
        results.append({"file":name,"state":"VERIFIED_DISTRIBUTION_BYTES",
                        "bytes":record["bytes"],"sha256":digest})
    pairs=[]
    for i,law in enumerate(R924_LAWS,1):
        inverse=payload_index[i]
        outverse=payload_index[i+12]
        pairs.append({"law":law,"inverse":inverse["name"],"outverse":outverse["name"],
                      "inverseSha256":inverse["sha256"],"outverseSha256":outverse["sha256"],
                      "inverseArchiveMemberLocated":inverse["name"] in all_identified_payloads,
                      "outverseArchiveMemberLocated":outverse["name"] in all_identified_payloads,
                      "authority":"HISTORICAL_MANIFEST_ONLY"})
    complete=verified==20 and len(all_identified_payloads)==24
    return {"schema":"OMEGA_HISTORICAL_DUPLEX24_CORRELATION_R924",
            "state":"COMPLETE_OUTER_DISTRIBUTION_HASHES_SOURCE_ONLY" if complete else "INCOMPLETE_ARCHIVE_SET_HELD",
            "manifestSha256":sha_file(manifest_path),"manifest":rel,
            "expectedParts":20,"locatedParts":present,"verifiedOuterParts":verified,
            "missingParts":[x["file"] for x in results if x["state"]=="MISSING"],
            "partResults":results,"duplexPairs":pairs,
            "payloadsLocatedByName":len(all_identified_payloads),
            "payloadBytesAllIndependentlyVerified":False,
            "historicExecutableFunctionalityProven":False,"canonicalWrites":0,
            "productionReady":False,"gpuComputeProven":False,
            "basis":"HISTORICAL_SOURCE_AND_LOCAL_FILE_HASHES_NOT_RUNTIME_PARITY"}

READ_ONLY_REPLAY = frozenset({"HASH_TREE", "CSV_STATS", "VERIFY_LEDGER_SPLIT", "SPHERE_TENSOR_STEP", "SPHERE_TENSOR_VERIFY", "SPHERE_TENSOR_AUDIT_LINEAGE", "HISTORICAL_ZIP_AUDIT", "HISTORICAL_B010_EXECUTE", "HISTORICAL_DUPLEX24_CORRELATE"})
OPS = frozenset({"HASH_TREE", "CSV_STATS", "COPY_ARTIFACT", "EXPORT_MANIFEST", "VERIFY_LEDGER_SPLIT", "VERIFY_LEDGER_SET", "LOCAL_INFER", "LOCAL_CHAT", "SPHERE_TENSOR_STEP", "SPHERE_TENSOR_EXPORT", "SPHERE_TENSOR_VERIFY", "SPHERE_TENSOR_CONTINUE", "SPHERE_TENSOR_RENDER", "SPHERE_TENSOR_AUDIT_LINEAGE", "HISTORICAL_ZIP_AUDIT", "HISTORICAL_B010_EXECUTE", "HISTORICAL_DUPLEX24_CORRELATE", "RESIDUAL_RESTORE"})
STATUS = frozenset({"QUEUED", "WAIT_EVENT", "RUNNING", "COMPLETED", "FAILED", "HELD", "CANCELLED"})
def utc_ms(): return int(time.time() * 1000)
def sha_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1048576), b""):
            h.update(chunk)
    return h.hexdigest()
def json_bytes(value): return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
def sha_bytes(value): return hashlib.sha256(value).hexdigest()
def safe_under(root: Path, relative: str, existing: bool = False) -> Path:
    if not isinstance(relative, str) or not relative or "\0" in relative: raise ValueError("PATH_REQUIRED")
    if relative.startswith("/") or relative.startswith("\\") or ":" in relative or "\\" in relative: raise ValueError("ABSOLUTE_OR_WINDOWS_PATH_HELD")
    part = PurePosixPath(relative)
    if ".." in part.parts or part.is_absolute(): raise ValueError("PARENT_TRAVERSAL_HELD")
    # Reject the daemon's private namespace before filesystem resolution.
    # On Windows the supplied root may have different path casing or an
    # alternate canonical representation; never let that change the error
    # class for a direct attempt to read .omega credentials/state.
    if part.parts and part.parts[0] == ".omega": raise ValueError("HUB_INTERNAL_STATE_HELD")
    canonical_root = root.resolve()
    dest = (canonical_root / str(part)).resolve()
    if not dest.is_relative_to(canonical_root): raise ValueError("OUTSIDE_APPROVED_ROOT_HELD")
    if dest.is_relative_to(canonical_root / ".omega"): raise ValueError("HUB_INTERNAL_STATE_HELD")
    if existing and not dest.is_file(): raise ValueError("SOURCE_FILE_REQUIRED")
    return dest
def receipt(path: Path, root: Path):
    size = path.stat().st_size
    if size > MAX_FILE_SIZE: raise ValueError("FILE_SIZE_LIMIT")
    return {"path":path.relative_to(root).as_posix(),"sha256":sha_file(path),"byteSize":size,"provenance":"OBS","proofTier":"OBS","hostAcceptance":False}
class Hub:
    def __init__(self, root: Path, db: Path):
        self.root = root.resolve()
        if not self.root.is_dir(): raise ValueError("APPROVED_ROOT_MUST_EXIST")
        self.db = db.resolve()
        if not self.db.is_relative_to(self.root / ".omega"): raise ValueError("DB_MUST_RESIDE_IN_PRIVATE_HUB_DIR")
        self.db.parent.mkdir(parents=True, exist_ok=True)
        self._stop = threading.Event()
        with self.connection() as c:
            c.executescript("""
                CREATE TABLE IF NOT EXISTS jobs(
                    id TEXT PRIMARY KEY, operation TEXT NOT NULL, args_json TEXT NOT NULL,
                    state TEXT NOT NULL, event_name TEXT, scheduled_ms INTEGER NOT NULL,
                    created_ms INTEGER NOT NULL, updated_ms INTEGER NOT NULL,
                    result_json TEXT, result_sha256 TEXT, error TEXT);
                CREATE TABLE IF NOT EXISTS history(
                    id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT NOT NULL,
                    at_ms INTEGER NOT NULL, event TEXT NOT NULL, details TEXT);
            """)
            stranded=[row["id"] for row in c.execute("SELECT id FROM jobs WHERE state='RUNNING'")]
            for job_id in stranded:
                c.execute("UPDATE jobs SET state='HELD',error='CRASH_RECOVERY_REQUIRES_OPERATOR_REVIEW',updated_ms=? WHERE id=?",(utc_ms(),job_id))
                self._record(c,job_id,"CRASH_RECOVERY_HELD","Previous process ended without durable execution result")
    @contextmanager
    def connection(self):
        c = sqlite3.connect(str(self.db), timeout=15)
        c.row_factory = sqlite3.Row
        try:
            with c: yield c
        finally: c.close()
    def _record(self, c, job_id, event, details=""):
        c.execute("INSERT INTO history(job_id,at_ms,event,details) VALUES(?,?,?,?)",(job_id,utc_ms(),event,details))
    def enqueue(self, operation, args=None, scheduled_ms=None, event_name=None):
        if operation not in OPS: raise ValueError("UNSUPPORTED_OPERATION")
        if args is None: args={}
        if not isinstance(args, dict): raise ValueError("ARGS_OBJECT_REQUIRED")
        if scheduled_ms is None: scheduled_ms=utc_ms()
        if not isinstance(scheduled_ms, int) or scheduled_ms < 0: raise ValueError("INVALID_SCHEDULE")
        if event_name is not None and (not isinstance(event_name,str) or not event_name.isidentifier() or len(event_name)>64): raise ValueError("INVALID_EVENT")
        job_id=uuid.uuid4().hex
        state="HELD" if operation=="RESIDUAL_RESTORE" else ("WAIT_EVENT" if event_name else "QUEUED")
        with self.connection() as c:
            c.execute("INSERT INTO jobs(id,operation,args_json,state,event_name,scheduled_ms,created_ms,updated_ms,error) VALUES(?,?,?,?,?,?,?,?,?)",
                (job_id,operation,json.dumps(args),state,event_name,scheduled_ms,utc_ms(),utc_ms(),"R195_RESIDUAL_SOURCE_AND_AUTHORITY_REQUIRED" if state=="HELD" else None))
            self._record(c,job_id,state)
        return self.get(job_id)
    def get(self, job_id):
        with self.connection() as c:
            row=c.execute("SELECT * FROM jobs WHERE id=?",(job_id,)).fetchone()
            if row is None: return None
            history=c.execute("SELECT at_ms,event,details FROM history WHERE job_id=? ORDER BY id",(job_id,)).fetchall()
        item=dict(row);item["args"]=json.loads(item.pop("args_json"));item["result"]=json.loads(item.pop("result_json")) if item.get("result_json") else None
        item["history"]=[dict(h) for h in history]
        return item
    def list(self, limit=100):
        with self.connection() as c:
            ids=[r["id"] for r in c.execute("SELECT id FROM jobs ORDER BY created_ms DESC LIMIT ?",(min(max(1,limit),200),))]
        items=[]
        for i in ids:
            item=self.get(i)
            # R907's complete 144x144 display data is requested explicitly
            # through GET /api/hub/jobs/<id>, never multiplied across all
            # 100 historical jobs. This is a read-only transport projection;
            # original durable result/sha256 remains intact.
            if item and item["operation"]=="SPHERE_TENSOR_RENDER":
                result=item.get("result")
                if isinstance(result,dict) and isinstance(result.get("projection"),dict):
                    result=dict(result)
                    projection=dict(result["projection"])
                    if "projectionGrid" in projection:
                        projection.pop("projectionGrid")
                        projection["projectionGridOmittedFromJobList"]=True
                    result["projection"]=projection
                    item={**item,"result":result}
            items.append(item)
        return items
    def emit_event(self, event_name):
        if not isinstance(event_name,str) or not event_name.isidentifier(): raise ValueError("INVALID_EVENT")
        with self.connection() as c:
            ids=[r["id"] for r in c.execute("SELECT id FROM jobs WHERE event_name=? AND state='WAIT_EVENT'",(event_name,))]
            c.execute("UPDATE jobs SET state='QUEUED',updated_ms=? WHERE event_name=? AND state='WAIT_EVENT'",(utc_ms(),event_name))
            for i in ids:self._record(c,i,"EVENT_MATCH",event_name)
        return {"event":event_name,"released":len(ids)}
    def verified_sparse_export(self, export_id, *, include_rows=False):
        import importlib.util
        if not isinstance(export_id,str) or len(export_id)!=32 or any(c not in "0123456789abcdef" for c in export_id):
            raise ValueError("R905_EXPORT_JOB_ID_INVALID_HELD")
        prior=self.get(export_id)
        if not prior or prior.get("state")!="COMPLETED" or prior.get("operation") not in ("SPHERE_TENSOR_EXPORT","SPHERE_TENSOR_CONTINUE"):
            raise ValueError("R905_COMPLETED_ORIGINAL_EXPORT_REQUIRED_HELD")
        original=prior.get("result")
        expected_schema=("OMEGA_SPARSE_TENSOR_EXPORT_R904" if prior["operation"]=="SPHERE_TENSOR_EXPORT"
                         else "OMEGA_SPARSE_TENSOR_CONTINUATION_R906")
        if not isinstance(original,dict) or original.get("schema")!=expected_schema:
            raise ValueError("R905_ORIGINAL_EXPORT_RECEIPT_REQUIRED_HELD")
        stored=prior.get("result_sha256")
        if not isinstance(stored,str) or stored!=sha_bytes(json_bytes(original)):
            raise ValueError("R905_DURABLE_RECEIPT_DRIFT_HELD")
        artifact=original.get("artifact")
        if not isinstance(artifact,dict):
            raise ValueError("R905_ARTIFACT_RECEIPT_REQUIRED_HELD")
        relative=artifact.get("path")
        target=safe_under(self.root,relative,True)
        module_path=Path(__file__).resolve().with_name("omega_sparse_verify_r905.py")
        if not module_path.is_file(): raise ValueError("R905_ROUNDTRIP_VERIFIER_REQUIRED_HELD")
        spec=importlib.util.spec_from_file_location("_omega_sparse_verify_r905",module_path)
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        verified=module.verify_sparse_export_r905(target,original,include_rows=include_rows)
        return prior, verified

    def audit_sparse_lineage_r912(self, export_id):
        """Verify *every* original checkpoint and SQLite receipt back to R904.

        Traverse iteratively, reject cyclic links and overdeep ancestry, and
        compare each R906 child's pinned parent result/state hashes to the
        parent's verified original receipt. Never reconstruct truth from a
        32-component display preview or trust only the current leaf.
        """
        if not isinstance(export_id,str) or len(export_id)!=32 or any(c not in "0123456789abcdef" for c in export_id):
            raise ValueError("R912_CHECKPOINT_JOB_ID_HELD")
        visited=set()
        current=export_id
        child=None
        chain=[]
        for depth in range(33):
            if current in visited: raise ValueError("R912_LINEAGE_CYCLE_HELD")
            if depth==32: raise ValueError("R912_LINEAGE_DEPTH_BOUND_HELD")
            visited.add(current)
            prior, verified=self.verified_sparse_export(current)
            original=prior["result"]
            if child is not None:
                child_receipt=child["result"]
                if (child_receipt.get("sourceExportJobId")!=current or
                    child_receipt.get("sourceExportReceiptSha256")!=prior["result_sha256"] or
                    child_receipt.get("sourceStateSha256")!=verified["fullStateSha256"] or
                    child_receipt.get("tensor",{}).get("totalMassBefore")!=verified["totalMass"]):
                    raise ValueError("R912_PARENT_RECEIPT_OR_STATE_DRIFT_HELD")
            chain.append({"jobId":current,
                          "receiptSha256":prior["result_sha256"],
                          "stateSha256":verified["fullStateSha256"],
                          "fileSha256":verified["fileSha256"],
                          "mass":verified["totalMass"],
                          "operation":prior["operation"]})
            if prior["operation"]=="SPHERE_TENSOR_EXPORT":
                break
            current=original.get("sourceExportJobId")
            child=prior
            if not isinstance(current,str):raise ValueError("R912_PARENT_JOB_ID_REQUIRED_HELD")
        else:
            raise ValueError("R912_LINEAGE_DEPTH_BOUND_HELD")
        return {"schema":"OMEGA_SPARSE_LINEAGE_AUDIT_R912",
                "state":"EXACT_COMPLETE_CHECKPOINT_LINEAGE_VERIFIED",
                "leafJobId":export_id,
                "rootExportJobId":chain[-1]["jobId"],
                "depth":len(chain),
                "totalMass":chain[0]["mass"],
                "sourceFullStateSha256":chain[0]["stateSha256"],
                "entries":chain,
                "signedProvenance":False,
                "nativePcAccepted":False,
                "gpuComputeProven":False,
                "empiricalTruthProven":False}

    def execute_local_chat_r916(self,args):
        """Run an actual linked local-model conversation from immutable job receipts.

        All context comes from completed, SHA-verified LOCAL_CHAT jobs. No
        remote model endpoints, autonomous execution or synthetic answers.
        """
        if not isinstance(args,dict) or set(args)-{"model","prompt","num_predict","previous_job_id"}:
            raise ValueError("R916_CHAT_ARGUMENT_SCHEMA_HELD")
        model=args.get("model")
        prompt=args.get("prompt")
        tokens=args.get("num_predict",256)
        if (not isinstance(model,str) or not isinstance(prompt,str)
            or not prompt.strip() or len(prompt)>4096 or "\0" in prompt
            or type(tokens) is not int or not 1<=tokens<=512):
            raise ValueError("R916_CHAT_INPUT_BOUND_HELD")
        parent=args.get("previous_job_id")
        turns=[]
        seen=set()
        while parent is not None:
            if (not isinstance(parent,str) or len(parent)!=32
                or any(c not in "0123456789abcdef" for c in parent)):
                raise ValueError("R916_CHAT_PARENT_ID_HELD")
            if parent in seen: raise ValueError("R916_CHAT_CYCLE_HELD")
            if len(turns)>=8: raise ValueError("R916_CHAT_CONTEXT_DEPTH_HELD")
            seen.add(parent)
            prior=self.get(parent)
            if (not prior or prior.get("state")!="COMPLETED"
                or prior.get("operation")!="LOCAL_CHAT"):
                raise ValueError("R916_CHAT_COMPLETED_PARENT_REQUIRED_HELD")
            original=prior.get("result")
            if (not isinstance(original,dict) or original.get("schema")!="OMEGA_LOCAL_CHAT_R916"
                or prior.get("result_sha256")!=sha_bytes(json_bytes(original))
                or original.get("model")!=model):
                raise ValueError("R916_CHAT_PARENT_INTEGRITY_OR_MODEL_HELD")
            prior_args=prior.get("args")
            if (not isinstance(prior_args,dict) or
                not isinstance(prior_args.get("prompt"),str) or
                not isinstance(original.get("response"),str) or
                original.get("promptSha256")!=sha_bytes(prior_args["prompt"].encode("utf-8"))):
                raise ValueError("R916_CHAT_PARENT_PROMPT_OR_REPLY_HELD")
            turns.append((parent,prior_args["prompt"],original["response"],prior.get("result_sha256")))
            parent=original.get("previousJobId")
        turns.reverse()
        segments=[]
        for _,question,answer,_ in turns:
            segments.append("User:\n"+question+"\nAssistant:\n"+answer)
        segments.append("User:\n"+prompt+"\nAssistant:\n")
        context="\n\n".join(segments)
        if len(context)>8192: raise ValueError("R916_CHAT_CONTEXT_BYTES_HELD")
        result=load_local_inference_adapter_r899().infer_local_r899({
            "model":model,"prompt":context,"num_predict":tokens})
        if result.get("schema")!="OMEGA_LOCAL_INFER_R899" or result.get("done") is not True:
            raise ValueError("R916_CHAT_BACKEND_COMPLETION_HELD")
        return {"schema":"OMEGA_LOCAL_CHAT_R916","state":"LOCAL_CHAT_REPLY_COMPLETED",
                "model":model,"response":result["response"],
                "promptSha256":sha_bytes(prompt.encode("utf-8")),
                "previousJobId":args.get("previous_job_id"),
                "contextJobIds":[item[0] for item in turns],
                "contextReceiptSha256":[item[3] for item in turns],
                "contextTurns":len(turns)+1,
                "tokensRequested":tokens,"backend":"OLLAMA_LOOPBACK_ONLY",
                "nativePcAccepted":False,"gpuProven":False,
                "semanticTruthProven":False}

    def execute(self,operation,args):
        if operation=="HISTORICAL_DUPLEX24_CORRELATE":
            return correlate_duplex24_r924(self.root,args)
        if operation=="HISTORICAL_ZIP_AUDIT":
            return audit_historical_zip_r921(self.root,args)
        if operation=="HISTORICAL_B010_EXECUTE":
            return execute_b010_r922(self.root,args)
        if operation=="LOCAL_CHAT":
            return self.execute_local_chat_r916(args)
        if operation=="RESIDUAL_RESTORE": raise ValueError("R195_RESIDUAL_SOURCE_AND_AUTHORITY_REQUIRED")
        if operation=="LOCAL_INFER":
            return load_local_inference_adapter_r899().infer_local_r899(args)
        if operation=="SPHERE_TENSOR_AUDIT_LINEAGE":
            if not isinstance(args,dict) or set(args)!={"export_job_id"}:
                raise ValueError("R912_LINEAGE_ARGUMENT_SCHEMA_HELD")
            return self.audit_sparse_lineage_r912(args["export_job_id"])
        if operation=="SPHERE_TENSOR_RENDER":
            import importlib.util
            if not isinstance(args,dict) or set(args)!={"export_job_id","destination"}:
                raise ValueError("R907_PROJECTION_ARGUMENT_SCHEMA_HELD")
            destination=args.get("destination")
            if not isinstance(destination,str) or not destination.lower().endswith(".svg"):
                raise ValueError("R907_NEW_SVG_DESTINATION_REQUIRED_HELD")
            self.audit_sparse_lineage_r912(args.get("export_job_id"))
            prior, verified_rows=self.verified_sparse_export(args.get("export_job_id"),include_rows=True)
            verified, rows=verified_rows
            module_path=Path(__file__).resolve().with_name("omega_sparse_projection_r907.py")
            if not module_path.is_file(): raise ValueError("R907_PROJECTION_MODULE_REQUIRED_HELD")
            spec=importlib.util.spec_from_file_location("_omega_sparse_projection_r907",module_path)
            module=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            svg,projected=module.project_verified_rows_r907(rows,verified["fullStateSha256"])
            if projected["totalMass"]!=verified["totalMass"]:
                raise ValueError("R907_MASS_CONSERVATION_HELD")
            target=safe_under(self.root,destination,False)
            if target.exists(): raise ValueError("R907_PROJECTION_TARGET_EXISTS_HELD")
            target.parent.mkdir(parents=True,exist_ok=True)
            try:
                with target.open("xb") as stream:stream.write(svg)
                file_receipt=receipt(target,self.root)
            except BaseException:
                try: target.unlink(missing_ok=True)
                except OSError: pass
                raise
            return {"schema":"OMEGA_SPARSE_PROJECTION_ARTIFACT_R907",
                    "state":"EXACT_VERIFIED_CELL_PROJECTION_SAVED",
                    "projection":projected,"artifact":file_receipt,
                    "sourceExportJobId":prior["id"],
                    "sourceExportReceiptSha256":prior["result_sha256"],
                    "sourceFullStateSha256":verified["fullStateSha256"],
                    "physicalPcAccepted":False,"gpuComputeProven":False}
        if operation=="SPHERE_TENSOR_VERIFY":
            if not isinstance(args,dict) or set(args)!={"export_job_id"}:
                raise ValueError("R905_EXPORT_JOB_ID_REQUIRED_HELD")
            self.audit_sparse_lineage_r912(args.get("export_job_id"))
            prior, validated=self.verified_sparse_export(args.get("export_job_id"))
            return {**validated,"exportJobId":prior["id"],
                    "originalExportReceiptSha256":prior["result_sha256"],
                    "artifactPath":prior["result"]["artifact"]["path"]}
        if operation=="SPHERE_TENSOR_CONTINUE":
            import importlib.util
            if not isinstance(args,dict) or set(args)!={"export_job_id","destination","steps","cell_axis","lane_axis"}:
                raise ValueError("R906_CONTINUATION_ARGUMENT_SCHEMA_HELD")
            export_id=args["export_job_id"]
            destination=args["destination"]
            if not isinstance(destination,str) or not destination.lower().endswith(".csv"):
                raise ValueError("R906_NEW_CSV_DESTINATION_REQUIRED_HELD")
            self.audit_sparse_lineage_r912(export_id)
            prior, verified_rows=self.verified_sparse_export(export_id,include_rows=True)
            verified, entries=verified_rows
            module_path=Path(__file__).resolve().with_name("omega_sparse_tensor_r902.py")
            if not module_path.is_file(): raise ValueError("R902_SPARSE_TENSOR_MODULE_REQUIRED")
            spec=importlib.util.spec_from_file_location("_omega_sparse_tensor_r902",module_path)
            module=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            steps=args["steps"]
            if type(steps) is not int or not 1 <= steps <= module.MAX_STEPS:
                raise ValueError("R906_CONTINUATION_STEP_BOUND_HELD")
            compute_args={"seeds":[{"cell":cell,"lane":lane,"mass":mass} for cell,lane,mass in entries],
                          "steps":steps,"cell_axis":args["cell_axis"],"lane_axis":args["lane_axis"]}
            result, rows=module.sparse_tensor_rows_r904(compute_args,max_seeds=module.MAX_NONZERO)
            if result["totalMassAfter"]!=verified["totalMass"]:
                raise ValueError("R906_CONTINUATION_CONSERVATION_HELD")
            target=safe_under(self.root,destination,False)
            if target.exists(): raise ValueError("R906_EXPORT_TARGET_EXISTS_HELD")
            target.parent.mkdir(parents=True,exist_ok=True)
            try:
                with target.open("x",newline="",encoding="utf-8") as stream:
                    writer=csv.writer(stream,lineterminator="\n")
                    writer.writerow(("cell","lane","mass"))
                    for cell,lane,mass in rows:writer.writerow((cell,lane,mass))
                file_receipt=receipt(target,self.root)
            except BaseException:
                try: target.unlink(missing_ok=True)
                except OSError: pass
                raise
            return {"schema":"OMEGA_SPARSE_TENSOR_CONTINUATION_R906",
                    "state":"VERIFIED_CHECKPOINT_CONTINUATION_EXPORTED",
                    "tensor":result,"artifact":file_receipt,"exportedRows":len(rows),
                    "canonicalFullStateSha256":result["fullStateSha256"],
                    "sourceExportJobId":prior["id"],
                    "sourceExportReceiptSha256":prior["result_sha256"],
                    "sourceStateSha256":verified["fullStateSha256"],
                    "physicalPcAccepted":False,"gpuComputeProven":False}
        if operation=="SPHERE_TENSOR_EXPORT":
            import importlib.util
            module_path=Path(__file__).resolve().with_name("omega_sparse_tensor_r902.py")
            if not module_path.is_file(): raise ValueError("R902_SPARSE_TENSOR_MODULE_REQUIRED")
            spec=importlib.util.spec_from_file_location("_omega_sparse_tensor_r902",module_path)
            module=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            destination=args.get("destination")
            if not isinstance(destination,str) or not destination.lower().endswith(".csv"):
                raise ValueError("R904_NEW_CSV_DESTINATION_REQUIRED_HELD")
            # All R902 inputs are validated by the same pure operator; no
            # new dimension or transition rules are introduced by export.
            compute_args={k:v for k,v in args.items() if k!="destination"}
            result, rows=module.sparse_tensor_rows_r904(compute_args)
            target=safe_under(self.root,destination,False)
            if target.exists(): raise ValueError("R904_EXPORT_TARGET_EXISTS_HELD")
            target.parent.mkdir(parents=True,exist_ok=True)
            try:
                with target.open("x",newline="",encoding="utf-8") as stream:
                    writer=csv.writer(stream,lineterminator="\n")
                    writer.writerow(("cell","lane","mass"))
                    for cell,lane,mass in rows: writer.writerow((cell,lane,mass))
                file_receipt=receipt(target,self.root)
            except BaseException:
                try: target.unlink(missing_ok=True)
                except OSError: pass
                raise
            return {"schema":"OMEGA_SPARSE_TENSOR_EXPORT_R904",
                "state":"COMPLETE_SPARSE_STATE_CSV_EXPORTED",
                "tensor":result,
                "artifact":file_receipt,
                "exportedRows":len(rows),
                "canonicalFullStateSha256":result["fullStateSha256"],
                "physicalPcAccepted":False,"gpuComputeProven":False}
        if operation=="SPHERE_TENSOR_STEP":
            import importlib.util
            module_path=Path(__file__).resolve().with_name("omega_sparse_tensor_r902.py")
            if not module_path.is_file(): raise ValueError("R902_SPARSE_TENSOR_MODULE_REQUIRED")
            spec=importlib.util.spec_from_file_location("_omega_sparse_tensor_r902",module_path)
            module=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module.sparse_tensor_run_r902(args)
        if operation=="VERIFY_LEDGER_SET":
            import importlib.util
            spec_path=Path(__file__).resolve().with_name("omega_absolute_truth_verifier_r884.py")
            if not spec_path.is_file(): raise ValueError("R884_TEN_LEDGER_VERIFIER_REQUIRED")
            manifest_path=safe_under(self.root,args.get("source",""),True)
            if manifest_path.stat().st_size>MAX_BODY:raise ValueError("LEDGER_MANIFEST_SIZE_LIMIT_HELD")
            with manifest_path.open("r",encoding="utf-8") as f:manifest=json.load(f)
            module_spec=importlib.util.spec_from_file_location("_omega_ten_ledger_verifier_r884",spec_path)
            verifier=importlib.util.module_from_spec(module_spec)
            module_spec.loader.exec_module(verifier)
            result=verifier.verify(self.root,manifest)
            if not result.get("ok"):raise ValueError("LEDGER_SET_"+str(result.get("state","UNKNOWN"))+"_HELD")
            return {"state":result["state"],"countReceipt":result,"inputManifest":receipt(manifest_path,self.root),
                    "authority":"R237_COUNT_ONLY_NOT_SEMANTIC_OR_PHYSICAL_PROOF"}
        if operation=="VERIFY_LEDGER_SPLIT":
            path=safe_under(self.root,args.get("source",""),True)
            with path.open("r",encoding="utf-8") as f: rows=json.load(f)
            if not isinstance(rows,list): raise ValueError("LEDGER_ARRAY_REQUIRED")
            ids=set();count={"VERIFIED_OR_INTERNALLY_TESTED":0,"DERIVED_OR_SCOPED":0,"EXTERNAL_OR_OPEN_FRONTIER":0}
            for row in rows:
                if not isinstance(row,dict) or row.get("id") in ids or row.get("tier") not in count: raise ValueError("INVALID_LEDGER_RECORD")
                ids.add(row["id"]);count[row["tier"]]+=1
            correct=len(rows)==7655 and tuple(count.values())==(6872,699,84)
            if not correct: raise ValueError("LEDGER_SPLIT_MISMATCH_HELD")
            return {"state":"COUNTS_REPLAYED_SCOPED","total":len(rows),"counts":count,"sourceReceipt":receipt(path,self.root),"physicalProof":False}
        if operation=="HASH_TREE":
            base=safe_under(self.root,args.get("path","."),False)
            if not base.is_dir(): raise ValueError("DIRECTORY_REQUIRED")
            out=[]
            for p in sorted(base.rglob("*")):
                if p == self.db or p.is_relative_to(self.root / '.omega'): continue
                if p.is_symlink(): continue
                if not p.is_file(): continue
                if len(out)>=MAX_FILES: raise ValueError("FILE_COUNT_LIMIT")
                if p.stat().st_size>MAX_FILE_SIZE: continue
                out.append(receipt(p,self.root))
            return {"files":out,"count":len(out),"state":"INTERNAL_FILE_HASHES_ONLY","nativePcAccepted":False}
        if operation=="CSV_STATS":
            path=safe_under(self.root,args.get("source",""),True)
            if path.stat().st_size>MAX_FILE_SIZE: raise ValueError("FILE_SIZE_LIMIT")
            with path.open("r",newline="",encoding="utf-8-sig") as f:
                reader=csv.reader(f);header=next(reader,[]);count=sum(1 for _ in reader)
            return {"source":receipt(path,self.root),"dataRows":count,"columns":header,"state":"CSV_PARSED_NOT_SEMANTICALLY_VALIDATED"}
        if operation=="COPY_ARTIFACT":
            source=safe_under(self.root,args.get("source",""),True)
            target=safe_under(self.root,args.get("destination",""),False)
            if target==source: raise ValueError("COPY_IDENTICAL_PATH")
            if target.exists(): raise ValueError("COPY_TARGET_EXISTS")
            if source.stat().st_size>MAX_FILE_SIZE: raise ValueError("FILE_SIZE_LIMIT")
            target.parent.mkdir(parents=True,exist_ok=True)
            data=source.read_bytes()
            with target.open("xb") as f:f.write(data)
            if sha_file(target)!=sha_bytes(data): raise ValueError("COPY_HASH_MISMATCH")
            return {"source":receipt(source,self.root),"target":receipt(target,self.root),"state":"BOUNDED_COPY_COMPLETED"}
        if operation=="EXPORT_MANIFEST":
            target=safe_under(self.root,args.get("destination",""),False)
            if target.suffix.lower()!=".json" or target.exists(): raise ValueError("NEW_JSON_TARGET_REQUIRED")
            sources=args.get("sources",[])
            if not isinstance(sources,list) or len(sources)>MAX_FILES:raise ValueError("INVALID_SOURCE_LIST")
            entries=[receipt(safe_under(self.root,p,True),self.root) for p in sources]
            obj={"schema":"OMEGA_MASTER_TRUTH_RUN_MANIFEST_R881","sources":entries,"proofTier":"OBS","localPcAccepted":False,"physicalProof":False}
            data=json_bytes(obj)
            target.parent.mkdir(parents=True,exist_ok=True)
            created=False
            try:
                # Exclusive creation closes the check/open overwrite race.
                with target.open("xb") as stream:
                    created=True
                    stream.write(data)
                if sha_file(target)!=sha_bytes(data):
                    raise ValueError("R915_MANIFEST_WRITE_DRIFT_HELD")
                return {"manifest":receipt(target,self.root),"sourceCount":len(entries),"state":"HASHED_MANIFEST_WRITTEN"}
            except FileExistsError:
                raise ValueError("R915_MANIFEST_DESTINATION_EXISTS_HELD")
            except BaseException:
                if created:
                    try: target.unlink(missing_ok=True)
                    except OSError: pass
                raise
        raise ValueError("UNSUPPORTED_OPERATION")
    def verified_csv_artifact(self,job_id):
        """Retrieve only an original, fully verified R904/R906 checkpoint.

        This download has an additional 8 MiB in-memory transport bound;
        the local file remains available at its original approved path.
        """
        self.audit_sparse_lineage_r912(job_id)
        prior,validated=self.verified_sparse_export(job_id)
        source=prior["result"]["artifact"]
        path=safe_under(self.root,source["path"],True)
        if not path.is_file() or path.stat().st_size>8*1024*1024:
            raise ValueError("R910_CSV_DOWNLOAD_BOUND_HELD")
        data=path.read_bytes()
        digest=sha_bytes(data)
        if (digest!=validated["fileSha256"] or len(data)!=source["byteSize"]
            or not data.startswith(b"cell,lane,mass\n")):
            raise ValueError("R910_CSV_DOWNLOAD_DRIFT_HELD")
        return data,digest

    def verified_svg_artifact(self,job_id):
        """Return only exact, complete R907 art bytes from an original job.

        No arbitrary path is accepted by the HTTP route.  The immutable
        original artifact and completed SQLite result are both hashed.
        """
        if not isinstance(job_id,str) or len(job_id)!=32 or any(c not in "0123456789abcdef" for c in job_id):
            raise ValueError("R909_ARTIFACT_JOB_ID_HELD")
        job=self.get(job_id)
        if not job or job.get("state")!="COMPLETED" or job.get("operation")!="SPHERE_TENSOR_RENDER":
            raise ValueError("R909_COMPLETED_RENDER_JOB_REQUIRED_HELD")
        result=job.get("result")
        if not isinstance(result,dict) or result.get("schema")!="OMEGA_SPARSE_PROJECTION_ARTIFACT_R907":
            raise ValueError("R909_ORIGINAL_RENDER_RECEIPT_REQUIRED_HELD")
        if not isinstance(job.get("result_sha256"),str) or job["result_sha256"]!=sha_bytes(json_bytes(result)):
            raise ValueError("R909_RENDER_RECEIPT_DRIFT_HELD")
        # A valid SVG file is not a verified derived export if its
        # original checkpoint chain has since drifted. Check that chain
        # and the render's exact pinned source-state/receipt references.
        source_id=result.get("sourceExportJobId")
        source_audit=self.audit_sparse_lineage_r912(source_id)
        if (result.get("sourceExportReceiptSha256")!=source_audit["entries"][0]["receiptSha256"] or
            result.get("sourceFullStateSha256")!=source_audit["entries"][0]["stateSha256"]):
            raise ValueError("R912_RENDER_SOURCE_RECEIPT_DRIFT_HELD")
        artifact=result.get("artifact")
        if not isinstance(artifact,dict) or not isinstance(artifact.get("path"),str) or not artifact["path"].lower().endswith(".svg"):
            raise ValueError("R909_SVG_ARTIFACT_REQUIRED_HELD")
        path=safe_under(self.root,artifact["path"],True)
        if not path.is_file() or path.stat().st_size>4*1024*1024:
            raise ValueError("R909_SVG_ARTIFACT_SIZE_HELD")
        data=path.read_bytes()
        digest=sha_bytes(data)
        if (digest!=artifact.get("sha256") or len(data)!=artifact.get("byteSize")
            or not data.startswith(b'<svg xmlns="http://www.w3.org/2000/svg"')
            or b"<script" in data.lower() or b"<!doctype" in data.lower()):
            raise ValueError("R909_SVG_ARTIFACT_INTEGRITY_HELD")
        return data,digest

    def run_one(self):
        with self.connection() as c:
            c.execute("BEGIN IMMEDIATE")
            row=c.execute("SELECT id,operation,args_json FROM jobs WHERE state='QUEUED' AND scheduled_ms<=? ORDER BY scheduled_ms,created_ms,id LIMIT 1",(utc_ms(),)).fetchone()
            if row is None:return None
            id=row["id"];c.execute("UPDATE jobs SET state='RUNNING',updated_ms=? WHERE id=?",(utc_ms(),id));self._record(c,id,"RUNNING")
        try:
            result=self.execute(row["operation"],json.loads(row["args_json"]))
            raw=json_bytes(result);state="COMPLETED";err=None
        except Exception as exc:
            result={"ok":False,"error":str(exc),"state":"HELD_OR_FAILED"};raw=json_bytes(result)
            state="HELD" if any(x in str(exc) for x in ["HELD","REQUIRED","OUTSIDE_APPROVED_ROOT"]) else "FAILED";err=str(exc)
        with self.connection() as c:
            c.execute("UPDATE jobs SET state=?,result_json=?,result_sha256=?,updated_ms=?,error=? WHERE id=?",
                (state,raw.decode(),sha_bytes(raw),utc_ms(),err,id));self._record(c,id,state,err or "")
        return self.get(id)
    def replay(self,job_id):
        job=self.get(job_id)
        if not job:return {"ok":False,"state":"NOT_FOUND"}
        if job["state"]!="COMPLETED" or job["operation"] not in READ_ONLY_REPLAY:return {"ok":False,"state":"REPLAY_NOT_ADMISSIBLE"}
        try:
            replayed=self.execute(job["operation"],job["args"])
            digest=sha_bytes(json_bytes(replayed))
        except Exception as exc:return {"ok":False,"state":"REPLAY_FAILED","reason":str(exc)}
        return {"ok":digest==job["result_sha256"],"state":"MATCH" if digest==job["result_sha256"] else "DRIFT","expected":job["result_sha256"],"observed":digest}
    def cancel(self,job_id):
        with self.connection() as c:
            row=c.execute("SELECT state FROM jobs WHERE id=?",(job_id,)).fetchone()
            if not row:return {"ok":False,"state":"NOT_FOUND"}
            if row["state"] not in ("QUEUED","WAIT_EVENT"):return {"ok":False,"state":"CANNOT_CANCEL_ACTIVE_OR_FINAL"}
            c.execute("UPDATE jobs SET state='CANCELLED',updated_ms=? WHERE id=?",(utc_ms(),job_id));self._record(c,job_id,"CANCELLED")
        return {"ok":True,"state":"CANCELLED"}
    def loop(self):
        while not self._stop.wait(.5):
            try:self.run_one()
            except Exception:pass
    def start(self):
        self.thread=threading.Thread(target=self.loop,daemon=True,name="omega-r881-worker");self.thread.start()
    def stop(self):
        self._stop.set()
        if hasattr(self,"thread"):self.thread.join(timeout=3)
def serve(hub,token,port):
    class Handler(BaseHTTPRequestHandler):
        def _send(self,obj,status=200):
            data=json_bytes(obj);self.send_response(status);self.send_header("Content-Type","application/json")
            self.send_header("Cache-Control","no-store")
            origin=self.headers.get("Origin","")
            if allowed_browser_origin(origin):
                self.send_header("Access-Control-Allow-Origin",origin);self.send_header("Vary","Origin")
                self.send_header("Access-Control-Allow-Headers","Content-Type,X-Omega-Local-Token")
                self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
                self.send_header("Access-Control-Allow-Private-Network","true")
            self.send_header("Content-Length",str(len(data)));self.end_headers();self.wfile.write(data)
        def _valid_host(self):
            port=self.server.server_address[1]
            return self.headers.get("Host","").lower() in (f"127.0.0.1:{port}",f"localhost:{port}")
        def _valid_origin(self):
            origin=self.headers.get("Origin","")
            return not origin or allowed_browser_origin(origin)
        def _authorized(self):
            return self._valid_host() and self._valid_origin() and hmac.compare_digest(self.headers.get("X-Omega-Local-Token",""),token)
        def do_OPTIONS(self):
            if not self._valid_host() or not allowed_browser_origin(self.headers.get("Origin","")):self._send({"ok":False,"state":"ORIGIN_OR_HOST_HELD"},403)
            else:self._send({"ok":True,"state":"PREFLIGHT_ONLY"})
        def _send_csv(self,data,digest):
            self.send_response(200)
            self.send_header("Content-Type","text/csv; charset=utf-8")
            self.send_header("Content-Disposition",'attachment; filename="omega-complete-verified-state.csv"')
            self.send_header("X-Content-Type-Options","nosniff")
            self.send_header("Cache-Control","no-store")
            self.send_header("X-Omega-Artifact-Sha256",digest)
            origin=self.headers.get("Origin","")
            if allowed_browser_origin(origin):
                self.send_header("Access-Control-Allow-Origin",origin)
                self.send_header("Vary","Origin")
                self.send_header("Access-Control-Expose-Headers","X-Omega-Artifact-Sha256")
            self.send_header("Content-Length",str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        def _send_svg(self,svg,digest):
            self.send_response(200)
            self.send_header("Content-Type","image/svg+xml; charset=utf-8")
            self.send_header("Content-Disposition",'attachment; filename="omega-verified-r907.svg"')
            self.send_header("Content-Security-Policy","sandbox; default-src 'none'; style-src 'none'")
            self.send_header("X-Content-Type-Options","nosniff")
            self.send_header("Cache-Control","no-store")
            self.send_header("X-Omega-Artifact-Sha256",digest)
            origin=self.headers.get("Origin","")
            if allowed_browser_origin(origin):
                self.send_header("Access-Control-Allow-Origin",origin)
                self.send_header("Vary","Origin")
                self.send_header("Access-Control-Expose-Headers","X-Omega-Artifact-Sha256")
            self.send_header("Content-Length",str(len(svg)))
            self.end_headers()
            self.wfile.write(svg)
        def do_GET(self):
            if not self._authorized():return self._send({"ok":False,"state":"AUTH_REQUIRED"},401)
            path=urlsplit(self.path).path
            if path.startswith("/api/hub/artifacts/csv/"):
                job_id=path.rsplit("/",1)[-1]
                try:
                    data,digest=hub.verified_csv_artifact(job_id)
                    return self._send_csv(data,digest)
                except ValueError as exc:
                    return self._send({"ok":False,"state":"CSV_ARTIFACT_HELD","reason":str(exc)},403)
            if path.startswith("/api/hub/artifacts/"):
                job_id=path.rsplit("/",1)[-1]
                try:
                    svg,digest=hub.verified_svg_artifact(job_id)
                    return self._send_svg(svg,digest)
                except ValueError as exc:
                    return self._send({"ok":False,"state":"ARTIFACT_HELD","reason":str(exc)},403)
            if path=="/api/hub/status":return self._send({"ok":True,"schema":SCHEMA,"jobs":len(hub.list()),"edgeAccepted":False,"physicalPcAccepted":False,"scope":"LOCAL_LOOPBACK_ONLY","R195":"HELD_SOURCE_REQUIRED"})
            if path=="/api/hub/models":
                try:
                    return self._send({"ok":True, **load_local_inference_adapter_r899().list_local_models_r899()})
                except ValueError as exc:
                    return self._send({"ok":False,"state":"LOCAL_MODELS_HELD","reason":str(exc)},503)
            if path=="/api/hub/jobs":return self._send({"ok":True,"jobs":hub.list()})
            if path.startswith("/api/hub/jobs/"):
                obj=hub.get(path.rsplit("/",1)[-1]);return self._send({"ok":bool(obj),"job":obj},200 if obj else 404)
            return self._send({"ok":False,"state":"NOT_FOUND"},404)
        def do_POST(self):
            if not self._authorized():return self._send({"ok":False,"state":"AUTH_REQUIRED"},401)
            # Refuse ambiguous framing before reading a byte.  In particular,
            # duplicate Content-Length, Transfer-Encoding, and non-decimal
            # lengths must not disconnect the operator or queue a partial job.
            lengths=self.headers.get_all("Content-Length",[])
            if (len(lengths)!=1 or self.headers.get("Transfer-Encoding") is not None
                or not lengths[0].isascii() or not lengths[0].isdigit()
                or len(lengths[0])>10):
                return self._send({"ok":False,"state":"INVALID_REQUEST_FRAMING_HELD"},400)
            length=int(lengths[0])
            if length<1 or length>MAX_BODY:return self._send({"ok":False,"state":"BODY_SIZE_HELD"},413)
            try:
                data=json.loads(self.rfile.read(length))
                if not isinstance(data,dict):raise ValueError("JSON_OBJECT_REQUIRED")
                path=urlsplit(self.path).path
                if path=="/api/hub/jobs":
                    obj=hub.enqueue(data.get("operation"),data.get("args"),data.get("scheduled_ms"),data.get("event_name"))
                    return self._send({"ok":True,"job":obj},202)
                if path=="/api/hub/events":return self._send({"ok":True, **hub.emit_event(data.get("event_name"))})
                if path.startswith("/api/hub/replay/"):return self._send(hub.replay(path.rsplit("/",1)[-1]))
                if path.startswith("/api/hub/cancel/"):return self._send(hub.cancel(path.rsplit("/",1)[-1]))
                return self._send({"ok":False,"state":"NOT_FOUND"},404)
            except Exception as exc:self._send({"ok":False,"state":"REQUEST_HELD","reason":str(exc)},400)
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(("127.0.0.1",port),Handler)
    try:server.serve_forever()
    finally:server.server_close()
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",required=True,help="Already existing approved project root (absolute path allowed for launcher only)")
    parser.add_argument("--db",default=None)
    parser.add_argument("--token-file",default=None)
    parser.add_argument("--port",type=int,default=8765)
    args=parser.parse_args()
    root=Path(args.root).expanduser().resolve()
    db=Path(args.db).expanduser() if args.db else root/".omega"/"hub-r881.sqlite"
    token_file=Path(args.token_file).expanduser() if args.token_file else root/".omega"/"hub-r881.token"
    if not token_file.resolve().is_relative_to(root / ".omega"): raise ValueError("TOKEN_MUST_RESIDE_IN_PRIVATE_HUB_DIR")
    token_file.parent.mkdir(parents=True,exist_ok=True)
    if token_file.exists():token=token_file.read_text(encoding="utf-8").strip()
    else:
        token=secrets.token_urlsafe(32)
        fd=os.open(str(token_file),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,"w",encoding="utf-8") as stream:stream.write(token)
    if len(token)<32:raise ValueError("TOKEN_TOO_SHORT")
    hub=Hub(root,db);hub.start()
    print("OMEGA R881 loopback-only hub listening on 127.0.0.1:"+str(args.port),flush=True)
    print("Token path: "+str(token_file),flush=True)
    print("Local integration-path only; native PC acceptance and federation closure remain unverified.",flush=True)
    try:serve(hub,token,args.port)
    finally:hub.stop()
if __name__=="__main__":main()
