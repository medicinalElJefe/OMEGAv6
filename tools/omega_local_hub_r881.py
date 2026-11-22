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

READ_ONLY_REPLAY = frozenset({"HASH_TREE", "CSV_STATS", "VERIFY_LEDGER_SPLIT"})
OPS = frozenset({"HASH_TREE", "CSV_STATS", "COPY_ARTIFACT", "EXPORT_MANIFEST", "VERIFY_LEDGER_SPLIT", "VERIFY_LEDGER_SET", "LOCAL_INFER", "RESIDUAL_RESTORE"})
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
    dest = (root / str(part)).resolve()
    if not dest.is_relative_to(root): raise ValueError("OUTSIDE_APPROVED_ROOT_HELD")
    if dest.is_relative_to(root / '.omega'): raise ValueError("HUB_INTERNAL_STATE_HELD")
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
        return [self.get(i) for i in ids]
    def emit_event(self, event_name):
        if not isinstance(event_name,str) or not event_name.isidentifier(): raise ValueError("INVALID_EVENT")
        with self.connection() as c:
            ids=[r["id"] for r in c.execute("SELECT id FROM jobs WHERE event_name=? AND state='WAIT_EVENT'",(event_name,))]
            c.execute("UPDATE jobs SET state='QUEUED',updated_ms=? WHERE event_name=? AND state='WAIT_EVENT'",(utc_ms(),event_name))
            for i in ids:self._record(c,i,"EVENT_MATCH",event_name)
        return {"event":event_name,"released":len(ids)}
    def execute(self,operation,args):
        if operation=="RESIDUAL_RESTORE": raise ValueError("R195_RESIDUAL_SOURCE_AND_AUTHORITY_REQUIRED")
        if operation=="LOCAL_INFER":
            import importlib.util
            adapter_path=Path(__file__).resolve().with_name("omega_local_inference_r899.py")
            if not adapter_path.is_file(): raise ValueError("R899_LOCAL_MODEL_ADAPTER_REQUIRED")
            spec=importlib.util.spec_from_file_location("_omega_local_inference_r899",adapter_path)
            adapter=importlib.util.module_from_spec(spec)
            spec.loader.exec_module(adapter)
            return adapter.infer_local_r899(args)
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
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(json_bytes(obj))
            return {"manifest":receipt(target,self.root),"sourceCount":len(entries),"state":"HASHED_MANIFEST_WRITTEN"}
        raise ValueError("UNSUPPORTED_OPERATION")
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
        def do_GET(self):
            if not self._authorized():return self._send({"ok":False,"state":"AUTH_REQUIRED"},401)
            path=urlsplit(self.path).path
            if path=="/api/hub/status":return self._send({"ok":True,"schema":SCHEMA,"jobs":len(hub.list()),"edgeAccepted":False,"physicalPcAccepted":False,"scope":"LOCAL_LOOPBACK_ONLY","R195":"HELD_SOURCE_REQUIRED"})
            if path=="/api/hub/jobs":return self._send({"ok":True,"jobs":hub.list()})
            if path.startswith("/api/hub/jobs/"):
                obj=hub.get(path.rsplit("/",1)[-1]);return self._send({"ok":bool(obj),"job":obj},200 if obj else 404)
            return self._send({"ok":False,"state":"NOT_FOUND"},404)
        def do_POST(self):
            if not self._authorized():return self._send({"ok":False,"state":"AUTH_REQUIRED"},401)
            length=int(self.headers.get("Content-Length",0))
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
