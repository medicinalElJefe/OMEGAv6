#!/usr/bin/env python3
"""OMEGA R34 local Hybrid Link agent.

R129 sealed successor. Stdlib-first, root-confined, allow-listed execution.
It never exposes arbitrary shell access. Pairing is explicit. Registration is
identity only; PC ONLINE is not claimable until a current authenticated
heartbeat succeeds. Every claimed native action returns bounded proof to the
canonical Worker.

R33 added atomic, preimage-hash-bound text patching with an automatic local backup.
R34 added explicit canonical reachability, authentication/registration, heartbeat,
and transport diagnostics. R34.1 hardened Windows approved-root parsing.
R129 pins the exact served agent SHA-256, binds a process boot session, rejects
heartbeat replay, refuses silent root mutation, and keeps duplicate connector
windows from competing for the same local runtime.
"""
from __future__ import annotations
import argparse, hashlib, json, os, platform, re, socket, subprocess, sys, time, urllib.error, urllib.request, uuid, zipfile
from pathlib import Path

VERSION='R129.0'
HYBRID_PROTOCOL='OMEGA_HYBRID_PROTOCOL_R129'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
HEARTBEAT_INTERVAL_SECONDS=4
MAX_BACKOFF_SECONDS=30
TEXT_EXT={'.txt','.md','.json','.jsonc','.js','.jsx','.ts','.tsx','.py','.pyw','.css','.html','.yml','.yaml','.toml','.ini','.cfg','.csv','.bat','.ps1','.cs','.csproj','.sln'}
SKIP_DIRS={'.git','node_modules','dist','build','.venv','venv','__pycache__','.wrangler','.omega_hybrid'}
MAX_FILES=25000
MAX_FILE_BYTES=8*1024*1024
MAX_PATCH_BYTES=512*1024
MAX_PATCH_REPLACEMENTS=24

class AgentError(RuntimeError): pass
class AgentHttpError(AgentError):
    def __init__(self,status,code,message,payload=None):
        super().__init__(message); self.status=int(status); self.code=str(code or 'HTTP_ERROR'); self.payload=payload or {}

def sha_bytes(data:bytes): return hashlib.sha256(data).hexdigest()
def sha_json(obj): return sha_bytes(json.dumps(obj,sort_keys=True,separators=(',',':')).encode())
def normalized_root_identity(root:Path):
    value=str(root.resolve()).replace('\\','/').rstrip('/') or '/'
    if os.name=='nt': value=value.casefold()
    return sha_bytes(value.encode('utf-8'))
def atomic_json(path:Path,payload):
    tmp=path.with_name(path.name+'.tmp_'+uuid.uuid4().hex[:8]);tmp.write_text(json.dumps(payload,indent=2,sort_keys=True),'utf-8');os.replace(tmp,path)

def request_json(server,path,payload,bridge_id,secret,timeout=30):
    data=json.dumps(payload).encode(); req=urllib.request.Request(server.rstrip('/')+path,data=data,method='POST',headers={'content-type':'application/json','x-omega-bridge-id':bridge_id,'x-omega-bridge-secret':secret,'x-omega-hybrid-protocol':HYBRID_PROTOCOL,'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            raw=r.read().decode('utf-8','replace')
            try: return json.loads(raw)
            except Exception: raise AgentError('Canonical endpoint returned non-JSON data.')
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8','replace')
        try: detail=json.loads(raw)
        except Exception: detail={'message':raw}
        code=detail.get('code') or 'HTTP_'+str(e.code); message=detail.get('reply') or detail.get('message') or code or raw[:300]
        raise AgentHttpError(e.code,code,f"HTTP {e.code}: {message}",detail)
    except urllib.error.URLError as e: raise AgentError(f'Canonical transport unavailable: {getattr(e,"reason",e)}')
    except TimeoutError: raise AgentError('Canonical request timed out')

def probe_server(server,timeout=15):
    req=urllib.request.Request(server.rstrip('/')+'/api/health',method='GET',headers={'cache-control':'no-cache','x-omega-hybrid-protocol':HYBRID_PROTOCOL,'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            body=r.read().decode('utf-8','replace')
            if int(getattr(r,'status',200))!=200: raise AgentError(f'Canonical health returned HTTP {getattr(r,"status","unknown")}')
            try: return json.loads(body)
            except Exception: return {'ok':True,'raw':body[:300]}
    except urllib.error.HTTPError as e: raise AgentError(f'Canonical health HTTP {e.code}')
    except urllib.error.URLError as e: raise AgentError(f'Canonical unreachable: {getattr(e,"reason",e)}')
    except TimeoutError: raise AgentError('Canonical health timed out')

def parse_pair(value):
    if '.' not in value: raise AgentError('Pairing code must contain bridge ID and secret.')
    bid,secret=value.split('.',1)
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,128}',bid) or len(secret)<24: raise AgentError('Invalid pairing code.')
    return bid,secret

def normalize_root_arg(value):
    raw=str(value or '.').strip().strip('"').strip()
    if not raw: return '.'
    raw=raw.rstrip('"').strip()
    if os.name=='nt' and re.fullmatch(r'[A-Za-z]:\\',raw): return raw+'.'
    return raw

def validate_root(value):
    root=Path(normalize_root_arg(value)).expanduser().resolve()
    if not root.exists() or not root.is_dir(): raise AgentError(f'Approved root does not exist as a directory: {root}')
    if os.name=='nt' and root.drive.upper()=='C:': raise AgentError('R129 refuses C: as the OMEGA approved runtime root.')
    return root

def acquire_instance_lock(state_dir:Path):
    lock_path=state_dir/'agent.lock'; handle=open(lock_path,'a+b');handle.seek(0);handle.write(b'1');handle.flush();handle.seek(0)
    try:
        if os.name=='nt':
            import msvcrt
            msvcrt.locking(handle.fileno(),msvcrt.LK_NBLCK,1)
        else:
            import fcntl
            fcntl.flock(handle.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
    except (OSError,IOError):
        handle.close();raise AgentError('Another OMEGA Hybrid connector is already active for this approved root. Close the old window before starting a new one.')
    return handle

def secure_path(root:Path,rel='.'):
    rel=str(rel or '.').replace('\\','/').strip()
    if rel.startswith('/') or re.match(r'^[A-Za-z]:',rel) or '..' in Path(rel).parts: raise AgentError('Path escapes approved root.')
    out=(root/rel).resolve(); rr=root.resolve()
    try: out.relative_to(rr)
    except ValueError: raise AgentError('Path escapes approved root.')
    return out

def iter_files(root:Path):
    count=0
    for base,dirs,files in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            p=Path(base)/name
            try:
                if p.is_symlink() or p.stat().st_size>MAX_FILE_BYTES: continue
            except OSError: continue
            yield p; count+=1
            if count>=MAX_FILES: return

def index_tree(path:Path):
    rows=[]
    for p in iter_files(path):
        rel=p.relative_to(path).as_posix(); rows.append({'path':rel,'bytes':p.stat().st_size,'ext':p.suffix.lower()})
    manifests=[x for x in rows if Path(x['path']).name.lower() in {'package.json','pyproject.toml','requirements.txt','setup.py','pom.xml','build.gradle','cargo.toml'} or x['path'].endswith(('.sln','.csproj'))]
    return {'files':len(rows),'manifests':manifests[:80],'sample':rows[:120]}

def hash_tree(path:Path):
    h=hashlib.sha256(); rows=[]
    for p in sorted(iter_files(path),key=lambda x:x.as_posix().lower()):
        rel=p.relative_to(path).as_posix(); digest=sha_bytes(p.read_bytes()); h.update(rel.encode());h.update(digest.encode());rows.append({'path':rel,'sha256':digest,'bytes':p.stat().st_size})
    return {'treeSha256':h.hexdigest(),'files':len(rows),'sample':rows[:120]}

def read_text(path:Path):
    if not path.is_file(): raise AgentError('READ_TEXT requires a file.')
    if path.stat().st_size>MAX_FILE_BYTES: raise AgentError('File exceeds bounded text-read size.')
    data=path.read_bytes(); return {'path':path.name,'sha256':sha_bytes(data),'bytes':len(data),'text':data.decode('utf-8','replace')[:120000]}

def search_text(path:Path,query:str,max_results=120):
    terms=[x.lower() for x in re.findall(r'[A-Za-z0-9_.-]{2,}',query or '')][:12]
    if not terms: raise AgentError('SEARCH_TEXT requires literal terms.')
    out=[]
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT: continue
        try: content=p.read_text('utf-8','replace')
        except Exception: continue
        low=content.lower()
        if not any(t in low for t in terms): continue
        for i,line in enumerate(content.splitlines(),1):
            if any(t in line.lower() for t in terms):
                out.append({'path':p.relative_to(path).as_posix(),'line':i,'text':line[:500]})
                if len(out)>=int(max_results or 120): return {'query':query,'matches':out}
    return {'query':query,'matches':out}

def command_for(path:Path,op:str,profile:str):
    profile=(profile or 'AUTO_BUILD').upper()
    if profile=='AUTO_BUILD':
        if (path/'package.json').exists():
            pkg=json.loads((path/'package.json').read_text('utf-8')); scripts=pkg.get('scripts',{})
            if op=='BUILD': return ['npm','run','build'] if 'build' in scripts else None
            for s in ('check','test'):
                if s in scripts:return ['npm','run',s]
        if (path/'pyproject.toml').exists() or (path/'requirements.txt').exists(): return [sys.executable,'-m','pytest','-q'] if op=='TEST' else None
        sln=next(path.glob('*.sln'),None); csproj=next(path.glob('*.csproj'),None)
        if sln or csproj:return ['dotnet','test' if op=='TEST' else 'build',str((sln or csproj).name)]
        return None
    if profile=='NODE_BUILD': return ['npm','run','build' if op=='BUILD' else 'check']
    if profile=='PYTHON_TEST': return [sys.executable,'-m','pytest','-q'] if op=='TEST' else None
    if profile=='DOTNET_BUILD': return ['dotnet','test' if op=='TEST' else 'build']
    return None

def run_declared(path:Path,op:str,profile:str):
    cmd=command_for(path,op,profile)
    if not cmd: raise AgentError(f'No declared {op.lower()} command discovered for {profile}.')
    p=subprocess.run(cmd,cwd=path,text=True,capture_output=True,timeout=900,shell=False)
    result={'command':cmd,'exitCode':p.returncode,'stdout':p.stdout[-18000:],'stderr':p.stderr[-12000:]}
    if p.returncode: raise AgentError(json.dumps(result))
    return result

def package_path(path:Path,root:Path):
    outdir=root/'.omega_hybrid'/'packages';outdir.mkdir(parents=True,exist_ok=True)
    out=outdir/(path.name+'_'+time.strftime('%Y%m%d_%H%M%S')+'.zip')
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in iter_files(path): z.write(p,p.relative_to(path).as_posix())
    return {'path':out.relative_to(root).as_posix(),'sha256':sha_bytes(out.read_bytes()),'bytes':out.stat().st_size}

def apply_patch(path:Path,root:Path,step:dict):
    if not path.is_file() or path.is_symlink(): raise AgentError('APPLY_PATCH requires a regular text file inside the approved root.')
    if path.suffix.lower() not in TEXT_EXT: raise AgentError('APPLY_PATCH is limited to allow-listed text/source extensions.')
    raw=path.read_bytes()
    if len(raw)>MAX_PATCH_BYTES: raise AgentError('APPLY_PATCH file exceeds the 512 KiB bounded patch limit.')
    expected=str(step.get('expectedSha256','')).lower()
    if not re.fullmatch(r'[0-9a-f]{64}',expected): raise AgentError('APPLY_PATCH requires expectedSha256 from a prior READ_TEXT/HASH proof.')
    before=sha_bytes(raw)
    if before!=expected: raise AgentError(f'APPLY_PATCH preimage mismatch: expected {expected}, observed {before}.')
    try: source=raw.decode('utf-8')
    except UnicodeDecodeError: raise AgentError('APPLY_PATCH requires valid UTF-8 source.')
    replacements=step.get('replacements')
    if not isinstance(replacements,list) or not 1<=len(replacements)<=MAX_PATCH_REPLACEMENTS: raise AgentError('APPLY_PATCH requires 1-24 exact replacements.')
    changed=source; applied=[]
    for idx,row in enumerate(replacements,1):
        if not isinstance(row,dict): raise AgentError(f'APPLY_PATCH replacement {idx} is invalid.')
        find=row.get('find'); replace=row.get('replace'); occurrences=int(row.get('occurrences',1))
        if not isinstance(find,str) or not find: raise AgentError(f'APPLY_PATCH replacement {idx} requires non-empty find text.')
        if not isinstance(replace,str): raise AgentError(f'APPLY_PATCH replacement {idx} requires replacement text.')
        if len(find.encode())+len(replace.encode())>128*1024: raise AgentError(f'APPLY_PATCH replacement {idx} exceeds bounded size.')
        observed=changed.count(find)
        if observed!=occurrences: raise AgentError(f'APPLY_PATCH replacement {idx} expected {occurrences} exact match(es), observed {observed}.')
        changed=changed.replace(find,replace,occurrences); applied.append({'index':idx,'occurrences':occurrences})
    after_bytes=changed.encode('utf-8')
    if after_bytes==raw: raise AgentError('APPLY_PATCH produced no change.')
    rel=path.relative_to(root)
    backup=root/'.omega_hybrid'/'backups'/(time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:8])/rel
    backup.parent.mkdir(parents=True,exist_ok=True); backup.write_bytes(raw)
    tmp=path.with_name(path.name+'.omega_patch_'+uuid.uuid4().hex+'.tmp')
    try:
        tmp.write_bytes(after_bytes); os.replace(tmp,path)
    finally:
        try:
            if tmp.exists(): tmp.unlink()
        except OSError: pass
    return {'path':rel.as_posix(),'beforeSha256':before,'afterSha256':sha_bytes(after_bytes),'backupPath':backup.relative_to(root).as_posix(),'replacementsApplied':applied,'atomic':True}

def train_local(path:Path,root:Path):
    docs=[];freq={}
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT: continue
        try: txt=p.read_text('utf-8','replace')[:400000]
        except Exception: continue
        words=re.findall(r'[A-Za-z][A-Za-z0-9_-]{2,}',txt.lower())
        if not words: continue
        digest=sha_bytes(txt.encode());docs.append({'path':p.relative_to(path).as_posix(),'sha256':digest,'tokens':len(words)})
        for w in set(words):freq[w]=freq.get(w,0)+1
    terms=sorted(freq.items(),key=lambda x:(-x[1],x[0]))[:3000]
    payload={'schema':'OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R33','createdAt':time.time(),'root':path.relative_to(root).as_posix() if path!=root else '.', 'documents':docs[:25000],'documentCount':len(docs),'termDocumentFrequency':terms,'foundationWeightsChanged':False}
    payload['indexSha256']=sha_json(payload)
    d=root/'.omega_hybrid';d.mkdir(parents=True,exist_ok=True);out=d/'sai_index_r33.json';out.write_text(json.dumps(payload,indent=2),'utf-8')
    eval_status='PASS' if len(docs)>0 else 'HOLD_NO_DOCUMENTS'
    return {'indexPath':out.relative_to(root).as_posix(),'indexSha256':payload['indexSha256'],'documents':len(docs),'evaluation':{'status':eval_status},'promotion':{'status':'ACTIVE_LOCAL_RETRIEVAL_INDEX' if eval_status=='PASS' else 'HELD'},'foundationWeightsChanged':False}

def execute_step(step,root:Path):
    op=str(step.get('op','')).upper(); path=secure_path(root,step.get('path','.'))
    if op=='INDEX': return index_tree(path)
    if op=='HASH_TREE': return hash_tree(path)
    if op=='READ_TEXT': return read_text(path)
    if op=='SEARCH_TEXT': return search_text(path,str(step.get('query','')),int(step.get('maxResults',120)))
    if op=='APPLY_PATCH': return apply_patch(path,root,step)
    if op in {'BUILD','TEST'}: return run_declared(path,op,str(step.get('profile','AUTO_BUILD')))
    if op=='PACKAGE': return package_path(path,root)
    if op=='TRAIN_LOCAL': return train_local(path,root)
    if op=='SAFE_IMPORT': return {'classification':'DONOR_QUARANTINED','fingerprint':hash_tree(path),'executed':False}
    if op=='WORKBOOK_AUDIT': return {'state':'REQUIRES_OPTIONAL_WORKBOOK_ADAPTER','path':path.relative_to(root).as_posix(),'executed':False}
    if op=='SUPPORT_BUNDLE': return package_path(path,root)
    if op=='WAIT': time.sleep(max(.1,min(30,float(step.get('milliseconds',1000))/1000)));return {'waitedMs':step.get('milliseconds',1000)}
    if op=='OPEN_URL':
        import webbrowser
        url=str(step.get('url',''))
        if not url.startswith('https://'): raise AgentError('Only HTTPS URLs are allowed.')
        return {'opened':bool(webbrowser.open(url)),'url':url}
    if op in {'CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO'}:
        raise AgentError(f'{op} requires the optional signed desktop automation adapter; this stdlib agent will not pretend it executed it.')
    raise AgentError('Unsupported operation '+op)

def execute_job(job,root:Path):
    proofs=[];outputs=[];logs=[];ok=True;evaluation=None;promotion=None
    for step in job.get('steps',[])[:24]:
        started=time.time();proof={'id':step.get('id'),'op':step.get('op'),'startedAt':started}
        try:
            result=execute_step(step,root);proof.update({'ok':True,'result':result,'completedAt':time.time()})
            if isinstance(result,dict) and result.get('path'):outputs.append(result['path'])
            if isinstance(result,dict) and result.get('backupPath'):outputs.append(result['backupPath'])
            if step.get('op')=='TRAIN_LOCAL':evaluation=result.get('evaluation');promotion=result.get('promotion');outputs.append(result.get('indexPath'))
        except Exception as e:
            ok=False;proof.update({'ok':False,'error':str(e)[:12000],'completedAt':time.time()});logs.append(str(e));proofs.append(proof);break
        proofs.append(proof)
    packet={'jobId':job.get('id'),'ok':ok,'stepProofs':proofs,'outputPaths':[x for x in outputs if x],'log':'\n'.join(logs)[-12000:],'evaluation':evaluation,'promotion':promotion}
    packet['resultFingerprint']=sha_json(packet)
    return packet

def main():
    ap=argparse.ArgumentParser(description='OMEGA R129 sealed Hybrid Link local agent')
    ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True,help='pairing code from OMEGA Hybrid Link')
    ap.add_argument('--root',default='.',help='existing approved local root; all file/process work stays inside it')
    ap.add_argument('--once',action='store_true',help='establish one heartbeat/poll cycle, then exit')
    ap.add_argument('--diagnose',action='store_true',help='authenticate, register, prove one heartbeat, then exit without polling work')
    args=ap.parse_args();server=args.server.rstrip('/');bridge_id,secret=parse_pair(args.pair)
    try: root=validate_root(args.root)
    except AgentError as e: print('ROOT FAIL —',e,file=sys.stderr);raise SystemExit(20)
    state_dir=root/'.omega_hybrid';state_dir.mkdir(exist_ok=True)
    try: instance_lock=acquire_instance_lock(state_dir)
    except AgentError as e: print('INSTANCE FAIL —',e,file=sys.stderr);raise SystemExit(24)
    _=instance_lock
    id_file=state_dir/'device_id.txt';device_id=id_file.read_text('utf-8').strip() if id_file.exists() else 'device_'+uuid.uuid4().hex
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,128}',device_id): device_id='device_'+uuid.uuid4().hex
    id_file.write_text(device_id,'utf-8')
    boot_id='boot_'+uuid.uuid4().hex;agent_sha256=sha_bytes(Path(__file__).read_bytes());root_identity=normalized_root_identity(root)
    caps=['TRAIN_LOCAL','INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','SAFE_IMPORT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','OPEN_URL','WAIT']
    state_file=state_dir/'connection_state.json';heartbeat_seq=0;announced_online=False
    def write_state(stage,**extra):
        atomic_json(state_file,{'schema':'OMEGA_HYBRID_LOCAL_STATE_R129','stage':stage,'updatedAt':time.time(),'server':server,'deviceId':device_id,'bootId':boot_id,'protocol':HYBRID_PROTOCOL,'version':VERSION,'agentSha256':agent_sha256,'rootIdentity':root_identity,'rootLabel':root.name or root.anchor,'heartbeatSeq':heartbeat_seq,'secretStored':False,**extra})
    def registration_payload():
        return {'bridgeId':bridge_id,'deviceId':device_id,'bootId':boot_id,'name':socket.gethostname(),'platform':platform.platform(),'version':VERSION,'protocol':HYBRID_PROTOCOL,'agentSha256':agent_sha256,'rootIdentity':root_identity,'capabilities':caps,'rootLabel':root.name or root.anchor}
    def register():
        nonlocal heartbeat_seq
        out=request_json(server,'/api/hybrid/agent/register',registration_payload(),bridge_id,secret,20);heartbeat_seq=0;write_state('REGISTERED_HEARTBEAT_REQUIRED',registered=True,online=False);return out
    def heartbeat():
        nonlocal heartbeat_seq
        heartbeat_seq+=1
        out=request_json(server,'/api/hybrid/agent/heartbeat',{'bridgeId':bridge_id,'deviceId':device_id,'bootId':boot_id,'protocol':HYBRID_PROTOCOL,'version':VERSION,'agentSha256':agent_sha256,'heartbeatSeq':heartbeat_seq},bridge_id,secret,15)
        write_state('ONLINE_HEARTBEAT_PROVEN',online=True,lastHeartbeatAt=time.time());return out
    print('OMEGA Hybrid Link agent',VERSION)
    print('Protocol:',HYBRID_PROTOCOL)
    print('Approved root:',root)
    print('Agent SHA-256:',agent_sha256)
    print('Root identity:',root_identity)
    print('[1/4] CANONICAL REACHABILITY:',server)
    try:
        probe_server(server)
        print('      PASS — /api/health reachable')
    except Exception as e:
        write_state('CANONICAL_UNREACHABLE',online=False,error=str(e)[:500]);print('      FAIL —',e,file=sys.stderr);print('      Check internet, DNS, firewall, or canonical runtime availability. No PC ONLINE claim was made.',file=sys.stderr);raise SystemExit(21)
    print('[2/4] AUTHENTICATING / REGISTERING SEALED DEVICE IDENTITY')
    try:
        register();print('      PASS — identity registered; PC ONLINE is still false until heartbeat proof')
    except AgentHttpError as e:
        write_state('REGISTER_REJECTED',online=False,errorCode=e.code,error=str(e)[:500]);print('      FAIL —',e,file=sys.stderr)
        if e.code=='PAIR_AUTH_FAILED': print('      Pairing credential is rejected. Use OMEGA to prepare the current R129 connector; this agent will not retry a dead credential.',file=sys.stderr)
        raise SystemExit(22)
    except Exception as e:
        write_state('REGISTER_FAILED',online=False,error=str(e)[:500]);print('      FAIL —',e,file=sys.stderr);raise SystemExit(22)
    print('[3/4] ESTABLISHING AUTHENTICATED MONOTONIC HEARTBEAT')
    try:
        heartbeat();announced_online=True;print('      PASS — authenticated heartbeat returned. Browser may now truthfully show PC ONLINE / SEALED.')
    except Exception as e:
        write_state('HEARTBEAT_FAILED',online=False,error=str(e)[:500]);print('      FAIL —',e,file=sys.stderr);print('      Registration alone is not PC ONLINE.',file=sys.stderr);raise SystemExit(23)
    if args.diagnose:
        print('[4/4] DIAGNOSTIC COMPLETE — no work was polled. Heartbeat will age stale after this process exits.');return
    print('[4/4] GOVERNED JOB POLL ACTIVE — keep this single window open')
    failures=0;backoff=HEARTBEAT_INTERVAL_SECONDS
    while True:
        try:
            if not announced_online: heartbeat();announced_online=True
            polled=request_json(server,'/api/hybrid/agent/poll',{'bridgeId':bridge_id,'deviceId':device_id,'bootId':boot_id,'protocol':HYBRID_PROTOCOL,'agentSha256':agent_sha256},bridge_id,secret,30);job=polled.get('job')
            if job:
                print('Running approved job',job.get('id'));packet=execute_job(job,root);packet.update({'bridgeId':bridge_id,'deviceId':device_id,'bootId':boot_id,'protocol':HYBRID_PROTOCOL,'agentSha256':agent_sha256});request_json(server,'/api/hybrid/agent/result',packet,bridge_id,secret,60);print('Returned proof:',packet['resultFingerprint'])
            if args.once:return
            time.sleep(HEARTBEAT_INTERVAL_SECONDS);heartbeat();failures=0;backoff=HEARTBEAT_INTERVAL_SECONDS
        except KeyboardInterrupt:
            write_state('STOPPED_BY_USER',online=False);print('Hybrid Link stopped by user. PC ONLINE will age to HEARTBEAT STALE.');return
        except AgentHttpError as e:
            write_state('HTTP_ERROR',online=False,errorCode=e.code,error=str(e)[:500]);announced_online=False
            if e.code=='DEVICE_NOT_REGISTERED':
                print('[RE-REGISTER] server requested sealed registration refresh.',file=sys.stderr)
                try: register();continue
                except Exception as inner: print('Re-registration failed:',inner,file=sys.stderr);raise SystemExit(22)
            if e.code=='HEARTBEAT_REPLAY':
                expected=int(e.payload.get('expectedGreaterThan') or heartbeat_seq);heartbeat_seq=max(heartbeat_seq,expected);print('[HEARTBEAT RESYNC] replay was rejected; sequence advanced without claiming a new proof.',file=sys.stderr);continue
            if e.code=='PAIR_AUTH_FAILED':
                print('[AUTH REJECTED] pairing is no longer valid. This process stops instead of hammering or silently rotating credentials.',file=sys.stderr);raise SystemExit(22)
            if e.code=='DEVICE_SESSION_SUPERSEDED':
                print('[SESSION SUPERSEDED] a newer sealed connector owns this device. Close this stale window and keep only the newest connector.',file=sys.stderr);raise SystemExit(25)
            failures+=1;print(f'[HTTP ERROR] attempt {failures}: {e}',file=sys.stderr)
        except Exception as e:
            failures+=1;announced_online=False;write_state('TRANSPORT_DEGRADED',online=False,error=str(e)[:500]);print(f'[TRANSPORT ERROR] attempt {failures}: {e}',file=sys.stderr)
        if failures>=3: print('Three consecutive cycles failed. Browser must not treat this host as currently online.',file=sys.stderr)
        time.sleep(backoff);backoff=min(MAX_BACKOFF_SECONDS,max(HEARTBEAT_INTERVAL_SECONDS,backoff*2))

if __name__=='__main__': main()
