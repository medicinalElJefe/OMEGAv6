"""R956: source-exact V35 nested Master Atlas SQLite staging.

Authenticate through the existing R881 Hub. Never extract or execute donor
Python; only verify the exact original V35 wrapper, nested ZIP, and one SQLite.
Atomic no-overwrite publication and deterministic provenance receipt.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import zipfile

SCHEMA="OMEGA_V35_ORIGINAL_ATLAS_PREPARE_R956"
WRAPPER_NAME="OMEGA_V35_PART_18.zip"
WRAPPER_SHA="a94cc36563893ccdd4c35225dbfdd08e2381393a8a7f296ba8f837c513860dab"
WRAPPER_BYTES=125605005
NESTED_NAME="OMEGA_SETUP/expansion/PSC_20736D_OMEGA_MASTER_ATLAS_UNDER_150MB.zip"
NESTED_SHA="406c4f43d1203a4b46b4e84726b6a4b4b1c6a484661ee53e9761dfbacab2900c"
NESTED_BYTES=125604773
DB_NAME="psc_finished_atlas.sqlite"
DB_SHA="24a03b232ebd35d755fe2f7152e04067c9e5755d0593dcc525a727480601fb38"
DB_BYTES=383766528
DB_ROWS=149679
BLOCK=1024*1024

def _digest_file(path:Path):
    sha=hashlib.sha256()
    with path.open("rb") as source:
        for b in iter(lambda:source.read(BLOCK),b""):
            sha.update(b)
    return sha.hexdigest()

def _prepare_v35(root:Path,args:dict,safe_under,*,wrapper_sha:str,wrapper_bytes:int,
                 nested_sha:str,nested_bytes:int,db_sha:str,db_bytes:int,db_rows:int):
    if not isinstance(args,dict) or set(args)!={"source","destination"}:
        raise ValueError("R956_V35_PREPARE_ARGUMENT_SCHEMA_HELD")
    name=args["source"]
    dest_name=args["destination"]
    if (not isinstance(name,str) or not name or len(name)>256 or
        Path(name).name!=WRAPPER_NAME):
        raise ValueError("R956_ORIGINAL_V35_PART18_REQUIRED_HELD")
    if (not isinstance(dest_name,str) or not dest_name or len(dest_name)>256 or
        Path(dest_name).name!=DB_NAME):
        raise ValueError("R956_ORIGINAL_V35_SQLITE_DESTINATION_HELD")
    source=safe_under(root,name,True)
    destination=safe_under(root,dest_name,False)
    if destination.exists():
        raise ValueError("R956_DESTINATION_ALREADY_EXISTS_HELD")
    destination.parent.mkdir(parents=True,exist_ok=True)
    # Recheck after folder creation; private namespace/symlink escapes hold.
    destination=safe_under(root,dest_name,False)
    if destination.exists() or not destination.parent.is_dir():
        raise ValueError("R956_DESTINATION_ALREADY_EXISTS_HELD")
    if source.stat().st_size!=wrapper_bytes or _digest_file(source)!=wrapper_sha:
        raise ValueError("R956_ORIGINAL_V35_WRAPPER_SHA256_HELD")
    temp_nested=None
    temp_db=None
    try:
        with tempfile.NamedTemporaryFile(dir=destination.parent,prefix="._v35_nested_",delete=False) as tmp:
            temp_nested=Path(tmp.name)
            with zipfile.ZipFile(source) as outer:
                entries=[e for e in outer.infolist() if not e.is_dir()]
                if len(entries)!=1 or entries[0].filename!=NESTED_NAME or entries[0].flag_bits&1:
                    raise ValueError("R956_V35_WRAPPER_MEMBER_HELD")
                if entries[0].file_size!=nested_bytes:
                    raise ValueError("R956_NESTED_SIZE_HELD")
                inner_hash=hashlib.sha256(); size=0
                with outer.open(entries[0]) as stream:
                    while b:=stream.read(BLOCK):
                        size+=len(b)
                        if size>nested_bytes: raise ValueError("R956_NESTED_EXPANSION_BOUND_HELD")
                        inner_hash.update(b);tmp.write(b)
            if size!=nested_bytes or inner_hash.hexdigest()!=nested_sha:
                raise ValueError("R956_NESTED_SHA256_HELD")
            tmp.flush();os.fsync(tmp.fileno())
        with zipfile.ZipFile(temp_nested) as nested:
            members={i.filename:i for i in nested.infolist()}
            if DB_NAME not in members or "source_manifest/OMEGA_MASTER_MANIFEST.json" not in members:
                raise ValueError("R956_SOURCE_SQLITE_OR_MANIFEST_MISSING_HELD")
            db_info=members[DB_NAME]
            if db_info.flag_bits&1 or db_info.file_size!=db_bytes:
                raise ValueError("R956_SOURCE_SQLITE_SIZE_HELD")
            manifest_info=members["source_manifest/OMEGA_MASTER_MANIFEST.json"]
            if manifest_info.file_size>2*1024*1024:
                raise ValueError("R956_ATLAS_SOURCE_MANIFEST_SIZE_HELD")
            manifest_bytes=nested.read(manifest_info)
            manifest=json.loads(manifest_bytes)
            declared=[p for p in manifest.get("files",[]) if isinstance(p,dict) and p.get("path")==DB_NAME]
            if (len(declared)!=1 or declared[0].get("sha256")!=db_sha or
                declared[0].get("size_bytes")!=db_bytes or
                manifest.get("stats",{}).get("rows")!=db_rows):
                raise ValueError("R956_ORIGINAL_V35_ATLAS_MANIFEST_HELD")
            with tempfile.NamedTemporaryFile(dir=destination.parent,prefix="._v35_atlas_",delete=False) as output:
                temp_db=Path(output.name)
                digest=hashlib.sha256(); written=0
                with nested.open(db_info) as src:
                    while b:=src.read(BLOCK):
                        written+=len(b)
                        if written>db_bytes: raise ValueError("R956_SQLITE_EXPANSION_BOUND_HELD")
                        digest.update(b);output.write(b)
                output.flush();os.fsync(output.fileno())
            if written!=db_bytes or digest.hexdigest()!=db_sha:
                raise ValueError("R956_SQLITE_SHA256_HELD")
        conn=sqlite3.connect(temp_db.as_uri()+"?mode=ro&immutable=1",uri=True,timeout=2)
        try:
            if conn.execute("PRAGMA quick_check").fetchone()[0]!="ok":
                raise ValueError("R956_ORIGINAL_SQLITE_QUICK_CHECK_HELD")
            count=conn.execute("SELECT count(*) FROM rows").fetchone()[0]
            if count!=db_rows:
                raise ValueError("R956_ORIGINAL_ATLAS_ROW_COUNT_HELD")
        finally:
            conn.close()
        try:
            os.link(temp_db,destination)
        except FileExistsError as exc:
            raise ValueError("R956_DESTINATION_ALREADY_EXISTS_HELD") from exc
        except OSError as exc:
            raise ValueError("R956_ATOMIC_PUBLICATION_UNAVAILABLE_HELD") from exc
    except (zipfile.BadZipFile, EOFError,sqlite3.DatabaseError) as exc:
        raise ValueError("R956_ORIGINAL_ARCHIVE_OR_SQLITE_INTEGRITY_HELD") from exc
    finally:
        if temp_db is not None: temp_db.unlink(missing_ok=True)
        if temp_nested is not None: temp_nested.unlink(missing_ok=True)
    return {"schema":SCHEMA,"source":name,"destination":Path(dest_name).as_posix(),
            "sourceWrapperSha256":wrapper_sha,"nestedArchiveSha256":nested_sha,
            "originalSqliteSha256":db_sha,"sourceManifestSha256":hashlib.sha256(manifest_bytes).hexdigest(),
            "originalRows":count,"sqliteQuickCheck":"PASS","sourceExact":True,
            "originalCodeExecuted":False,"canonicalWrites":0,
            "historicalRuntimeParityProven":False,"nativeGpuProven":False,"productionCertified":False}

def prepare_v35_atlas_r956(root:Path,args:dict,safe_under):
    return _prepare_v35(root,args,safe_under,wrapper_sha=WRAPPER_SHA,wrapper_bytes=WRAPPER_BYTES,
                        nested_sha=NESTED_SHA,nested_bytes=NESTED_BYTES,db_sha=DB_SHA,
                        db_bytes=DB_BYTES,db_rows=DB_ROWS)
