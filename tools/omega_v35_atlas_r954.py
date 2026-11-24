"""R954 original V35 Master Atlas: pinned, read-only, indexed source-data query.

No inference, observational fact promotion, GPU claim, or CanonState mutation.
The source SQLite must be extracted from the verified V35 original archive.
"""
from __future__ import annotations
import hashlib
import re
import sqlite3
from pathlib import Path

SCHEMA = "OMEGA_V35_ORIGINAL_ATLAS_INDEXED_QUERY_R954"
ORIGINAL_SHA256 = "24a03b232ebd35d755fe2f7152e04067c9e5755d0593dcc525a727480601fb38"
ORIGINAL_BYTES = 383766528
ORIGINAL_ROWS = 149679
NAME = "psc_finished_atlas.sqlite"
ALLOWED_GATES = {"", "STAY", "TURN", "ESCALATE", "ADMIT"}
TOKEN = re.compile(r"[A-Za-z0-9_]{1,32}")
MAX_QUERY_LENGTH = 128

def _sha_file(path: Path) -> str:
    sha = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024*1024), b""):
            sha.update(block)
    return sha.hexdigest()

def _query_v35_index(root: Path,args:dict,safe_under,*,expected_sha256:str,expected_bytes:int,expected_rows:int):
    allowed = {"source","term","domain","gate","cursor","limit"}
    if not isinstance(args,dict) or set(args)-allowed or "source" not in args:
        raise ValueError("R954_V35_QUERY_ARGUMENT_SCHEMA_HELD")
    source_name=args["source"]
    if (not isinstance(source_name,str) or not source_name.endswith("/"+NAME) and source_name!=NAME
        or len(source_name)>256):
        raise ValueError("R954_ORIGINAL_SQLITE_SOURCE_REQUIRED_HELD")
    source=safe_under(root,source_name,True)
    if source.stat().st_size != expected_bytes:
        raise ValueError("R954_ORIGINAL_SQLITE_SIZE_HELD")
    source_sha=_sha_file(source)
    if source_sha!=expected_sha256:
        raise ValueError("R954_ORIGINAL_SQLITE_SHA256_HELD")
    raw_term=args.get("term","")
    raw_domain=args.get("domain","")
    raw_gate=args.get("gate","")
    cursor=args.get("cursor",0)
    limit=args.get("limit",10)
    if not isinstance(raw_term,str) or len(raw_term)>MAX_QUERY_LENGTH:
        raise ValueError("R954_QUERY_TERM_BOUND_HELD")
    if (not isinstance(raw_domain,str) or len(raw_domain)>100 or
        any(ord(ch)<32 for ch in raw_domain)):
        raise ValueError("R954_DOMAIN_BOUND_HELD")
    if not isinstance(raw_gate,str) or raw_gate not in ALLOWED_GATES:
        raise ValueError("R954_GATE_SOURCE_VALUE_HELD")
    if (type(cursor) is not int or cursor<0 or cursor>expected_rows or
        type(limit) is not int or not 1<=limit<=25):
        raise ValueError("R954_PAGE_BOUND_HELD")
    query_tokens=TOKEN.findall(raw_term)
    if raw_term.strip() and (not query_tokens or len(query_tokens)>8 or
       any(tok.upper() in {"AND","OR","NOT","NEAR"} for tok in query_tokens) or
       "".join(query_tokens).lower()!=re.sub(r"\s+","",raw_term).lower()):
        raise ValueError("R954_FTS_SAFE_TERMS_REQUIRED_HELD")
    # Bound and quote each literal FTS5 token; no user-provided MATCH syntax.
    fts = " AND ".join('"'+tok+'"' for tok in query_tokens)
    db_uri=source.as_uri()+"?mode=ro&immutable=1"
    con=sqlite3.connect(db_uri,uri=True,timeout=2)
    con.row_factory=sqlite3.Row
    try:
        con.execute("PRAGMA query_only=ON")
        integrity=con.execute("PRAGMA quick_check").fetchone()[0]
        if integrity!="ok":
            raise ValueError("R954_ORIGINAL_SQLITE_QUICK_CHECK_HELD")
        count=con.execute("SELECT count(*) FROM rows").fetchone()[0]
        if count!=expected_rows:
            raise ValueError("R954_ORIGINAL_ATLAS_ROW_COUNT_HELD")
        sql="SELECT r.row_id,r.source_file,r.sheet,r.row_number,r.domain,r.root,r.function,r.gate,r.row_text,r.row_json FROM rows r"
        clauses=["r.row_id > ?"]
        params=[cursor]
        if fts:
            sql+=" JOIN rows_fts ON rows_fts.rowid=r.row_id"
            clauses.append("rows_fts MATCH ?")
            params.append(fts)
        if raw_domain:
            clauses.append("r.domain = ?")
            params.append(raw_domain)
        if raw_gate:
            clauses.append("r.gate = ?")
            params.append(raw_gate)
        sql+=" WHERE "+" AND ".join(clauses)+" ORDER BY r.row_id ASC LIMIT ?"
        params.append(limit+1)
        batch=con.execute(sql,params).fetchall()
        page=batch[:limit]
        records=[]
        for row in page:
            text=row["row_text"] or ""
            raw_json=row["row_json"] or ""
            records.append({
                "rowId":row["row_id"],"sourceFile":row["source_file"],"sheet":row["sheet"],
                "originalRow":row["row_number"],"domain":row["domain"],"root":row["root"],
                "function":row["function"],"originalGate":row["gate"],
                "sourceTextPreview":text[:640],"sourceTextTruncated":len(text)>640,
                "originalRowJsonPreview":raw_json[:3500],"rowJsonTruncated":len(raw_json)>3500
            })
        return {"schema":SCHEMA,"sourceSha256":source_sha,"sourceByteSize":source.stat().st_size,
                "originalRows":count,"sourceSqliteQuickCheck":"PASS","queryTerm":raw_term,
                "domainFilter":raw_domain,"gateFilter":raw_gate,"cursorBefore":cursor,
                "returned":len(records),"hasMore":len(batch)>limit,
                "nextCursor":records[-1]["rowId"] if records else None,"records":records,
                "sourceIndex":"FTS5" if fts else "ROWID",
                "originalChartedRowsNotIndependentScientificObservations":True,
                "otherHistoricalSourceFilesIndependentlyProven":False,
                "historicalExecutorParityProven":False,"canonicalWrites":0,
                "gpuComputeProven":False,"productionCertified":False}
    except sqlite3.DatabaseError as exc:
        raise ValueError("R954_ORIGINAL_SQLITE_QUERY_HELD") from exc
    finally:
        con.close()

def query_v35_original_atlas_r954(root:Path,args:dict,safe_under):
    return _query_v35_index(root,args,safe_under,
        expected_sha256=ORIGINAL_SHA256,expected_bytes=ORIGINAL_BYTES,expected_rows=ORIGINAL_ROWS)
