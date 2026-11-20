#!/usr/bin/env python3
"""R884 ten-ledger source verifier. Count checks require exact pinned source bytes.

Manifest format:
{
 "schema":"OMEGA_TEN_LEDGER_INPUT_R884",
 "ledgers":[{"path":"ledgers/one.csv","sha256":"64-hex","id_column":"id",
             "tier_column":"tier","sheet_name":"optional for .xlsx"}, ... exactly 10]
}
Classifications must be explicit in the input source; no inferred/corrected tiers.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import sys
from zipfile import ZipFile
from xml.etree import ElementTree as ET

SCHEMA="OMEGA_TEN_LEDGER_VERIFIER_R884"
TIER_EXPECTED={
    "VERIFIED_OR_INTERNALLY_TESTED":6872,
    "DERIVED_OR_SCOPED":699,
    "EXTERNAL_OR_OPEN_FRONTIER":84,
}
EXPECTED_TOTAL=7655
EXPECTED_LEDGERS=10
MAX_INPUT_BYTES=64*1024*1024
MAX_RECORDS_PER_LEDGER=100000
SHA=re.compile(r"^[0-9a-fA-F]{64}$")
MAIN="{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL="{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
PACK="{http://schemas.openxmlformats.org/package/2006/relationships}"

def sha_bytes(data:bytes)->str:
    return hashlib.sha256(data).hexdigest()

def resolve(root:Path,relative:str)->Path:
    if not isinstance(relative,str) or not relative or relative.startswith(("/","\\")) or "\\" in relative or ":" in relative or ".." in PurePosixPath(relative).parts:
        raise ValueError("RELATIVE_SOURCE_PATH_REQUIRED")
    p=(root/relative).resolve()
    if not p.is_relative_to(root) or not p.is_file():raise ValueError("PINNED_SOURCE_FILE_MISSING_OR_ESCAPED")
    if p.stat().st_size>MAX_INPUT_BYTES:raise ValueError("PINNED_SOURCE_SIZE_EXCEEDED")
    return p

def _excel_column(a:str)->int:
    n=0
    for c in a.upper():
        if not ("A"<=c<="Z"):break
        n=n*26+(ord(c)-64)
    return n-1

def _xlsx_rows(blob:bytes,sheet_name:str|None):
    """Read a selected XLSX sheet by its workbook relationship, no guessed sheet."""
    with ZipFile(io.BytesIO(blob)) as z:
        names=set(z.namelist())
        for required in ("xl/workbook.xml","xl/_rels/workbook.xml.rels"):
            if required not in names:raise ValueError("XLSX_WORKBOOK_PART_MISSING")
        if sum(i.file_size for i in z.infolist())>256*1024*1024:raise ValueError("XLSX_UNCOMPRESSED_SIZE_HELD")
        workbook=ET.fromstring(z.read("xl/workbook.xml"))
        relation_xml=ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relations={node.attrib["Id"]:node.attrib["Target"] for node in relation_xml}
        sheets=workbook.find(MAIN+"sheets")
        if sheets is None or not list(sheets):raise ValueError("XLSX_SHEET_NOT_FOUND")
        matches=[node for node in sheets if node.attrib.get("name")==sheet_name] if sheet_name else list(sheets)
        if len(matches)!=1:raise ValueError("XLSX_SHEET_SELECTION_REQUIRED")
        rel_id=matches[0].attrib.get(REL+"id")
        target=relations.get(rel_id)
        if not target:raise ValueError("XLSX_SHEET_RELATION_NOT_FOUND")
        if target.startswith("/"):filename=target.lstrip("/")
        else:filename="xl/"+target.lstrip("./")
        if ".." in PurePosixPath(filename).parts or filename not in names:raise ValueError("XLSX_SHEET_PATH_HELD")
        strings=[]
        if "xl/sharedStrings.xml" in names:
            root=ET.fromstring(z.read("xl/sharedStrings.xml"))
            for string in root.findall(MAIN+"si"):
                strings.append("".join(t.text or "" for t in string.iter(MAIN+"t")))
        worksheet=ET.fromstring(z.read(filename))
        data=worksheet.find(MAIN+"sheetData")
        if data is None:raise ValueError("XLSX_NO_SHEET_DATA")
        rows=[]
        for row in data.findall(MAIN+"row"):
            cols={}
            for c in row.findall(MAIN+"c"):
                cell_ref=c.attrib.get("r","A1")
                m=re.match(r"^[A-Z]+",cell_ref)
                if not m:raise ValueError("XLSX_INVALID_CELL_REFERENCE")
                idx=_excel_column(m.group(0))
                if idx<0 or idx>2048:raise ValueError("XLSX_COLUMN_BOUND_HELD")
                ctype=c.attrib.get("t","")
                if ctype=="inlineStr":
                    value="".join(t.text or "" for t in c.iter(MAIN+"t"))
                else:
                    v=c.find(MAIN+"v")
                    value="" if v is None else (v.text or "")
                    if ctype=="s":
                        index=int(value)
                        if not 0<=index<len(strings):raise ValueError("XLSX_INVALID_STRING_INDEX")
                        value=strings[index]
                cols[idx]=value
            rows.append(cols)
            if len(rows)>MAX_RECORDS_PER_LEDGER+1:raise ValueError("RECORD_COUNT_LIMIT")
        if not rows:return []
        keys=rows[0]
        return [{str(keys.get(col,"")):str(values.get(col,"")) for col in keys} for values in rows[1:]]

def read_ledger(blob:bytes,ext:str,sheet_name:str|None):
    if ext==".json":
        rows=json.loads(blob)
        if not isinstance(rows,list):raise ValueError("JSON_LEDGER_ARRAY_REQUIRED")
    elif ext==".csv":
        rows=list(csv.DictReader(io.StringIO(blob.decode("utf-8-sig"))))
    elif ext==".xlsx":
        rows=_xlsx_rows(blob,sheet_name)
    else:raise ValueError("UNSUPPORTED_LEDGER_FORMAT")
    if len(rows)>MAX_RECORDS_PER_LEDGER:raise ValueError("RECORD_COUNT_LIMIT")
    return rows

def verify(root:Path,manifest:dict)->dict:
    root=root.resolve()
    def rejected(code,extra=None):
        return {"schema":SCHEMA,"ok":False,"state":code,"expected":TIER_EXPECTED,"physicalProof":False,"canonPromotion":False,**(extra or {})}
    if not isinstance(manifest,dict) or manifest.get("schema")!="OMEGA_TEN_LEDGER_INPUT_R884":
        return rejected("MANIFEST_SCHEMA_REQUIRED")
    sources=manifest.get("ledgers")
    if not isinstance(sources,list) or len(sources)!=EXPECTED_LEDGERS:return rejected("EXACT_TEN_LEDGERS_REQUIRED")
    counts={key:0 for key in TIER_EXPECTED};seen=set();path_seen=set();receipts=[];total=0
    for num,source in enumerate(sources):
        if not isinstance(source,dict):return rejected("LEDGER_SPEC_REQUIRED",{"index":num})
        rel=source.get("path");pin=source.get("sha256")
        if not isinstance(pin,str) or not SHA.fullmatch(pin):return rejected("LEDGER_HASH_REQUIRED",{"index":num})
        try:
            path=resolve(root,rel)
            if path in path_seen:return rejected("DUPLICATE_SOURCE_FILE",{"path":rel})
            path_seen.add(path)
            data=path.read_bytes();digest=sha_bytes(data)
            if digest.lower()!=pin.lower():return rejected("LEDGER_SHA_MISMATCH",{"path":rel,"actualSha256":digest})
            id_key=source.get("id_column","id");tier_key=source.get("tier_column","tier")
            if not isinstance(id_key,str) or not isinstance(tier_key,str) or not id_key or not tier_key or id_key==tier_key:
                return rejected("LEDGER_COLUMN_SCHEMA_INVALID",{"path":rel})
            rows=read_ledger(data,path.suffix.lower(),source.get("sheet_name"))
            if not rows:return rejected("EMPTY_LEDGER_HELD",{"path":rel})
            for row in rows:
                if not isinstance(row,dict):return rejected("LEDGER_ROW_NOT_OBJECT",{"path":rel})
                item_id=row.get(id_key);tier=row.get(tier_key)
                if not isinstance(item_id,str) or not item_id.strip():return rejected("LEDGER_ID_REQUIRED",{"path":rel})
                if item_id in seen:return rejected("CROSS_LEDGER_DUPLICATE_ID",{"path":rel,"recordId":item_id})
                seen.add(item_id)
                if tier not in counts:return rejected("LEDGER_TIER_INVALID",{"path":rel,"recordId":item_id,"tier":tier})
                counts[tier]+=1
                total+=1
            receipts.append({"source":rel,"sha256":digest,"byteSize":len(data),"records":len(rows),
                "sheet":source.get("sheet_name"),"proofTier":"OBS","role":"PINNED_SOURCE_BYTES"})
        except (OSError,ValueError,UnicodeError,KeyError,IndexError,ET.ParseError,OverflowError) as e:
            return rejected("LEDGER_SOURCE_OR_PARSE_HELD",{"path":str(rel),"reason":str(e)})
    if total!=EXPECTED_TOTAL or counts!=TIER_EXPECTED:
        return rejected("LEDGER_COUNT_MISMATCH_HELD",{"actualTotal":total,"actualTiers":counts,"sources":receipts})
    return {"schema":SCHEMA,"ok":True,"state":"TEN_LEDGER_COUNTS_REPLAYED_FROM_PINNED_BYTES",
        "total":total,"counts":counts,"ledgers":EXPECTED_LEDGERS,"sourceReceipts":receipts,
        "historicalSemanticsVerified":False,"empiricalPhysicalProof":False,"canonPromotion":False,
        "truthBoundary":"Byte pins and category totals verified. Formal semantics, empirical data and physical proof remain separate gates."}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--root",required=True,type=Path)
    p.add_argument("--manifest",required=True,type=Path)
    p.add_argument("--output",type=Path,default=None)
    args=p.parse_args()
    source=args.manifest.read_bytes()
    result=verify(args.root,json.loads(source))
    result["inputManifestReceipt"]={"sha256":sha_bytes(source),"byteSize":len(source)}
    payload=json.dumps(result,sort_keys=True,indent=2).encode("utf-8")+b"\n"
    if args.output is not None:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_bytes(payload)
    sys.stdout.buffer.write(payload)
    return 0 if result["ok"] else 2
if __name__=="__main__":raise SystemExit(main())
