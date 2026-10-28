#!/usr/bin/env python3
"""R680: source-exact B053 native State Traversal archive reconciliation.

Adds 58 original archive_docs from the independently verified B053 parent
release to its nested State_Traversal_Verified.zip without modifying the 366
original donor members. Supports either a complete B053 ZIP or its 30 original
wrapper parts. Python standard library only; Windows and Linux compatible.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile
import zipfile

RELEASE='OMEGA-B053-NATIVE-FOUNDATION-INTELLIGENCE'
RELEASE_ROOT='OMEGA_B053_FULL_SYSTEM/'
DONOR='SOURCE_VAULT/original_archives/State_Traversal_Verified.zip'
DONOR_ROOT='Dimensional_Relativity_Stabilized/'
DOCS='archive_docs/'
EXPECTED_DOC_FILES=58
EXPECTED_INDEX_ROWS=56
MAX_DONOR_UNCOMPRESSED=700*1024*1024
MAX_MANIFEST=8*1024*1024

def digest(data:bytes)->str:
    return hashlib.sha256(data).hexdigest()

def digest_file(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''):h.update(part)
    return h.hexdigest()

def legal_member(name:str,root:str)->bool:
    p=PurePosixPath(name)
    return name.startswith(root) and not p.is_absolute() and not any(x in ('.','..') for x in p.parts) and '\\' not in name and len(p.parts)>1

def assemble_30_parts(parts_dir:Path,output:Path)->None:
    """Consume the original wrapper container, not arbitrary joined ZIP bytes."""
    with output.open('wb') as assembled:
        for i in range(1,31):
            part=parts_dir/f'OMEGA_B053_FULL_SYSTEM_PART_{i:02d}_OF_30.zip'
            if not part.is_file():raise ValueError(f'R680 missing archive part {i}/30: {part}')
            with zipfile.ZipFile(part) as wrapper:
                expected=f'OMEGA_B053_FULL_SYSTEM.chunk_{i:03d}_of_030.bin'
                if wrapper.namelist()!=[expected]:raise ValueError(f'R680 unexpected part wrapper {i}')
                with wrapper.open(expected) as source:
                    shutil.copyfileobj(source,assembled,1024*1024)
    with zipfile.ZipFile(output) as release:
        if release.testzip():raise ValueError('R680 assembled release ZIP CRC failed')

def reconcile(release_path:Path,output:Path,report:Path,
              expected_docs:int=EXPECTED_DOC_FILES,
              expected_index_rows:int=EXPECTED_INDEX_ROWS)->dict:
    release_path,output,report=map(Path,(release_path,output,report))
    if release_path.resolve()==output.resolve():raise ValueError('R680 never overwrite parent release')
    output.parent.mkdir(parents=True,exist_ok=True)
    report.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(release_path) as outer:
        if outer.testzip():raise ValueError('R680 B053 release ZIP CRC failed')
        raw_manifest=outer.read(RELEASE_ROOT+'B053_FILE_MANIFEST.json')
        if len(raw_manifest)>MAX_MANIFEST:raise ValueError('R680 oversized manifest')
        manifest=json.loads(raw_manifest)
        if manifest.get('build')!=RELEASE:raise ValueError('R680 wrong release authority')
        declared={item['path']:(item['sha256'],item['bytes']) for item in manifest['files']}
        if DONOR not in declared:raise ValueError('R680 donor missing from original manifest')
        inner_name=RELEASE_ROOT+DONOR
        donor_bytes=outer.read(inner_name)
        expected_sha,expected_size=declared[DONOR]
        if digest(donor_bytes)!=expected_sha or len(donor_bytes)!=expected_size:raise ValueError('R680 source donor SHA256 mismatch')
        with zipfile.ZipFile(io.BytesIO(donor_bytes)) as donor:
            if donor.testzip():raise ValueError('R680 original donor ZIP CRC failed')
            originals=donor.infolist()
            if sum(item.file_size for item in originals)>MAX_DONOR_UNCOMPRESSED:raise ValueError('R680 donor decompression budget exceeded')
            original_names=set()
            for info in originals:
                if not legal_member(info.filename,DONOR_ROOT):raise ValueError('R680 unsafe original member: '+info.filename)
                if info.filename in original_names:raise ValueError('R680 repeated original member: '+info.filename)
                original_names.add(info.filename)
            adds=[]
            for info in outer.infolist():
                if info.is_dir() or not info.filename.startswith(RELEASE_ROOT+DOCS):continue
                relative=info.filename[len(RELEASE_ROOT):]
                if not legal_member(relative,DOCS):raise ValueError('R680 unsafe source document: '+relative)
                if relative not in declared:raise ValueError('R680 source document lacks manifest: '+relative)
                expected_sha,expected_size=declared[relative]
                blob=outer.read(info)
                if len(blob)!=expected_size or digest(blob)!=expected_sha:raise ValueError('R680 manifest mismatch for '+relative)
                new_name=DONOR_ROOT+relative
                if new_name in original_names:raise ValueError('R680 refuses to overwrite original donor member: '+new_name)
                adds.append((new_name,blob,expected_sha))
            if len(adds)!=expected_docs:raise ValueError(f'R680 original docs mismatch: {len(adds)} != {expected_docs}')
            document_blobs={name:blob for name,blob,_ in adds}
            index_key=DONOR_ROOT+DOCS+'index.json'
            if index_key not in document_blobs:raise ValueError('R680 missing original archive document index')
            index=json.loads(document_blobs[index_key])
            if not isinstance(index,list) or len(index)!=expected_index_rows:raise ValueError('R680 archive index cardinality mismatch')
            for row in index:
                if not isinstance(row,dict) or not isinstance(row.get('id'),str):raise ValueError('R680 invalid original library entry')
                dest=DONOR_ROOT+DOCS+row['id']
                if not legal_member(dest,DONOR_ROOT+DOCS) or dest not in document_blobs:raise ValueError('R680 archive index missing original bytes '+repr(row['id']))
            with tempfile.NamedTemporaryFile(dir=output.parent,prefix='r680-',suffix='.zip',delete=False) as t:
                temp=Path(t.name)
            try:
                with zipfile.ZipFile(temp,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as repaired:
                    for member in originals:
                        if member.is_dir():repaired.writestr(copy.copy(member),b'');continue
                        with donor.open(member) as source,repaired.open(copy.copy(member),'w',force_zip64=True) as sink:
                            shutil.copyfileobj(source,sink,1024*1024)
                    for new_name,blob,_ in adds:repaired.writestr(new_name,blob)
                with zipfile.ZipFile(temp) as check:
                    if check.testzip():raise ValueError('R680 repaired ZIP CRC failed')
                    for member in originals:
                        if member.is_dir():continue
                        if digest(donor.read(member))!=digest(check.read(member.filename)):raise ValueError('R680 original donor changed: '+member.filename)
                    for name,blob,expected_sha in adds:
                        if digest(check.read(name))!=expected_sha:raise ValueError('R680 modified archived document: '+name)
                temp.replace(output)
            finally:
                temp.unlink(missing_ok=True)
    proof={
       'schema':'OMEGA_B053_NATIVE_ARCHIVE_RECONCILIATION_R680',
       'release':RELEASE,'original_donor':DONOR,
       'donor_sha256':digest(donor_bytes),
       'original_members_preserved':len(originals),
       'source_verified_documents_added':len(adds),
       'indexed_documents_backed':len(index),
       'synthetic_documents':0,'overwritten_original_members':0,
       'output_sha256':digest_file(output),'output_bytes':output.stat().st_size,
       'crc':'PASS','source_manifest_sha256':'PASS',
       'admission':'LOCAL_SOURCE_ARCHIVE_ONLY',
       'production_verified':False,
       'truth_boundary':'Verified additive archive repair only, no native Windows boot, cloud durable history, physical reality or R125 CanonState mutation.'
    }
    report.write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
    return proof

def main()->None:
    p=argparse.ArgumentParser(description=__doc__)
    source=p.add_mutually_exclusive_group(required=True)
    source.add_argument('--release-zip',type=Path)
    source.add_argument('--parts-dir',type=Path)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--report',type=Path,required=True)
    args=p.parse_args()
    if args.parts_dir:
        with tempfile.TemporaryDirectory() as td:
            assembled=Path(td)/'B053.zip'
            assemble_30_parts(args.parts_dir,assembled)
            result=reconcile(assembled,args.output,args.report)
    else:result=reconcile(args.release_zip,args.output,args.report)
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
