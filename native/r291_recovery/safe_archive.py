from __future__ import annotations
import hashlib,os,posixpath,shutil,stat,tempfile,zipfile
from pathlib import Path,PurePosixPath

TRUTH_BOUNDARY='Recovery verifies package identity and safe extraction only. Historical package acceptance does not establish current runtime, Canon, Hybrid, deployment, or scientific authority.'

def sha256(path:Path)->str:
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda:f.read(8*1024*1024),b''):h.update(chunk)
    return h.hexdigest()

def safe_member(name:str)->PurePosixPath:
    normalized=name.replace('\\','/')
    if not normalized or normalized.startswith('/') or normalized.startswith('\\') or (len(normalized)>1 and normalized[1]==':'):
        raise ValueError('unsafe absolute ZIP member: '+repr(name))
    clean=posixpath.normpath(normalized);parts=PurePosixPath(clean).parts
    if clean in ('.','..') or any(p in ('','..') for p in parts):raise ValueError('unsafe traversal ZIP member: '+repr(name))
    return PurePosixPath(*parts)

def safe_extract(archive:Path,destination:Path)->Path:
    destination=Path(destination);destination.mkdir(parents=True,exist_ok=True);seen=set();files=set();directories=set();root_names=set()
    with zipfile.ZipFile(archive) as z:
        for info in z.infolist():
            rel=safe_member(info.filename);root_names.add(rel.parts[0]);key=str(rel).casefold();mode=(info.external_attr>>16)&0xFFFF
            if stat.S_ISLNK(mode):raise ValueError('symlink member rejected: '+info.filename)
            if key in seen:raise ValueError('duplicate normalized ZIP member: '+info.filename)
            seen.add(key);ancestors=[str(PurePosixPath(*rel.parts[:i])).casefold() for i in range(1,len(rel.parts))]
            if key in directories or any(a in files for a in ancestors):raise ValueError('file/directory collision: '+info.filename)
            target=destination.joinpath(*rel.parts)
            if info.is_dir():directories.add(key);target.mkdir(parents=True,exist_ok=True);continue
            files.add(key);target.parent.mkdir(parents=True,exist_ok=True);tmp=target.with_name('.'+target.name+'.'+next(tempfile._get_candidate_names()))
            try:
                with z.open(info) as src,tmp.open('wb') as dst:shutil.copyfileobj(src,dst,8*1024*1024)
                os.replace(tmp,target)
            finally:
                if tmp.exists():tmp.unlink()
    if len(root_names)!=1:raise ValueError('archive must contain exactly one package root')
    return destination/next(iter(root_names))

def reconstruct_parts(base:Path,part_names:list[str],output:Path,expected_bytes:int,expected_sha256:str)->Path:
    base,output=Path(base),Path(output);parts=[base/n for n in part_names];missing=[p.name for p in parts if not p.is_file()]
    if missing:raise FileNotFoundError('missing partition files: '+', '.join(missing))
    output.parent.mkdir(parents=True,exist_ok=True)
    if output.is_file() and output.stat().st_size==expected_bytes and sha256(output)==expected_sha256:return output
    tmp=output.with_name('.'+output.name+'.partial')
    try:
        with tmp.open('wb') as dst:
            for part in parts:
                with part.open('rb') as src:shutil.copyfileobj(src,dst,8*1024*1024)
            dst.flush();os.fsync(dst.fileno())
        if tmp.stat().st_size!=expected_bytes or sha256(tmp)!=expected_sha256:raise RuntimeError('reconstructed master bytes or SHA-256 mismatch')
        os.replace(tmp,output);return output
    finally:
        if tmp.exists():tmp.unlink()

def preflight_free_space(path:Path,minimum_bytes:int)->int:
    free=shutil.disk_usage(Path(path).anchor or path).free
    if free<minimum_bytes:raise OSError(f'insufficient free space: need {minimum_bytes}, measured {free}')
    return free

def recovery_receipt(path:Path,expected_sha256:str)->dict:
    actual=sha256(path);return{'schema':'OMEGA_SAFE_ARCHIVE_RECOVERY_R291','path':str(path),'bytes':path.stat().st_size,'sha256':actual,'hashMatch':actual==expected_sha256,'truthBoundary':TRUTH_BOUNDARY}
