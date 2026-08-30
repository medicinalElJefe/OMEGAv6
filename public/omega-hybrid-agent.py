#!/usr/bin/env python3
"""OMEGA R32 local Hybrid Link agent.

Stdlib-first, root-confined, allow-listed execution. It never exposes arbitrary shell access.
Pairing is explicit. Every claimed native action returns bounded proof to the canonical Worker.
"""
from __future__ import annotations
import argparse, hashlib, json, os, platform, re, socket, subprocess, sys, time, urllib.error, urllib.request, uuid, zipfile
from pathlib import Path

VERSION='R32.1'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
TEXT_EXT={'.txt','.md','.json','.jsonc','.js','.jsx','.ts','.tsx','.py','.pyw','.css','.html','.yml','.yaml','.toml','.ini','.cfg','.csv','.bat','.ps1','.cs','.csproj','.sln'}
SKIP_DIRS={'.git','node_modules','dist','build','.venv','venv','__pycache__','.wrangler','.omega_hybrid'}
MAX_FILES=25000
MAX_FILE_BYTES=8*1024*1024

class AgentError(RuntimeError): pass

def sha_bytes(data:bytes): return hashlib.sha256(data).hexdigest()
def sha_json(obj): return sha_bytes(json.dumps(obj,sort_keys=True,separators=(',',':')).encode())
def request_json(server,path,payload,bridge_id,secret,timeout=30):
    data=json.dumps(payload).encode(); req=urllib.request.Request(server.rstrip('/')+path,data=data,method='POST',headers={'content-type':'application/json','x-omega-bridge-id':bridge_id,'x-omega-bridge-secret':secret,'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r: return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8','replace')
        try: detail=json.loads(raw)
        except Exception: detail={'message':raw}
        raise AgentError(f"HTTP {e.code}: {detail.get('reply') or detail.get('message') or detail.get('code') or raw[:300]}")

def parse_pair(value):
    if '.' not in value: raise AgentError('Pairing code must contain bridge ID and secret.')
    bid,secret=value.split('.',1)
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,128}',bid) or len(secret)<24: raise AgentError('Invalid pairing code.')
    return bid,secret

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
    return {'path':path.name,'text':path.read_text('utf-8','replace')[:120000]}

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
    payload={'schema':'OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R32','createdAt':time.time(),'root':path.relative_to(root).as_posix() if path!=root else '.', 'documents':docs[:25000],'documentCount':len(docs),'termDocumentFrequency':terms,'foundationWeightsChanged':False}
    payload['indexSha256']=sha_json(payload)
    d=root/'.omega_hybrid';d.mkdir(parents=True,exist_ok=True);out=d/'sai_index_r32.json';out.write_text(json.dumps(payload,indent=2),'utf-8')
    eval_status='PASS' if len(docs)>0 else 'HOLD_NO_DOCUMENTS'
    return {'indexPath':out.relative_to(root).as_posix(),'indexSha256':payload['indexSha256'],'documents':len(docs),'evaluation':{'status':eval_status},'promotion':{'status':'ACTIVE_LOCAL_RETRIEVAL_INDEX' if eval_status=='PASS' else 'HELD'},'foundationWeightsChanged':False}

def execute_step(step,root:Path):
    op=str(step.get('op','')).upper(); path=secure_path(root,step.get('path','.'))
    if op=='INDEX': return index_tree(path)
    if op=='HASH_TREE': return hash_tree(path)
    if op=='READ_TEXT': return read_text(path)
    if op=='SEARCH_TEXT': return search_text(path,str(step.get('query','')),int(step.get('maxResults',120)))
    if op in {'BUILD','TEST'}: return run_declared(path,op,str(step.get('profile','AUTO_BUILD')))
    if op=='PACKAGE': return package_path(path,root)
    if op=='TRAIN_LOCAL': return train_local(path,root)
    if op=='SAFE_IMPORT': return {'classification':'DONOR_QUARANTINED','fingerprint':hash_tree(path),'executed':False}
    if op=='WORKBOOK_AUDIT': return {'state':'REQUIRES_OPTIONAL_WORKBOOK_ADAPTER','path':path.relative_to(root).as_posix(),'executed':False}
    if op=='SUPPORT_BUNDLE': return package_path(path,root)
    if op=='WAIT': time.sleep(max(.1,min(30,float(step.get('milliseconds',1000))/1000)));return {'waitedMs':step.get('milliseconds',1000)}
    if op=='OPEN_URL':
        import webbrowser
        url=str(step.get('url','')); 
        if not url.startswith('https://'): raise AgentError('Only HTTPS URLs are allowed.')
        return {'opened':bool(webbrowser.open(url)),'url':url}
    if op in {'CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO','APPLY_PATCH'}:
        raise AgentError(f'{op} requires the optional signed desktop automation/patch adapter; this stdlib agent will not pretend it executed it.')
    raise AgentError('Unsupported operation '+op)

def execute_job(job,root:Path):
    proofs=[];outputs=[];logs=[];ok=True;evaluation=None;promotion=None
    for step in job.get('steps',[])[:24]:
        started=time.time();proof={'id':step.get('id'),'op':step.get('op'),'startedAt':started}
        try:
            result=execute_step(step,root);proof.update({'ok':True,'result':result,'completedAt':time.time()})
            if isinstance(result,dict) and result.get('path'):outputs.append(result['path'])
            if step.get('op')=='TRAIN_LOCAL':evaluation=result.get('evaluation');promotion=result.get('promotion');outputs.append(result.get('indexPath'))
        except Exception as e:
            ok=False;proof.update({'ok':False,'error':str(e)[:12000],'completedAt':time.time()});logs.append(str(e));proofs.append(proof);break
        proofs.append(proof)
    packet={'jobId':job.get('id'),'ok':ok,'stepProofs':proofs,'outputPaths':[x for x in outputs if x],'log':'\n'.join(logs)[-12000:],'evaluation':evaluation,'promotion':promotion}
    packet['resultFingerprint']=sha_json(packet)
    return packet

def main():
    ap=argparse.ArgumentParser(description='OMEGA R32 Hybrid Link local agent')
    ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True,help='pairing code from OMEGA Hybrid Link')
    ap.add_argument('--root',default='.',help='approved local root; all file/process work stays inside it')
    ap.add_argument('--once',action='store_true',help='poll once, then exit')
    args=ap.parse_args();server=args.server.rstrip('/');bridge_id,secret=parse_pair(args.pair);root=Path(args.root).expanduser().resolve();root.mkdir(parents=True,exist_ok=True)
    state_dir=root/'.omega_hybrid';state_dir.mkdir(exist_ok=True);id_file=state_dir/'device_id.txt'
    device_id=id_file.read_text().strip() if id_file.exists() else 'device_'+uuid.uuid4().hex
    id_file.write_text(device_id)
    caps=['TRAIN_LOCAL','INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','SAFE_IMPORT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','OPEN_URL','WAIT']
    payload={'bridgeId':bridge_id,'deviceId':device_id,'name':socket.gethostname(),'platform':platform.platform(),'version':VERSION,'capabilities':caps,'rootLabel':root.name}
    print('OMEGA Hybrid Link agent',VERSION);print('Approved root:',root);print('Registering with',server)
    request_json(server,'/api/hybrid/agent/register',payload,bridge_id,secret)
    while True:
        try:
            request_json(server,'/api/hybrid/agent/heartbeat',{'bridgeId':bridge_id,'deviceId':device_id,'version':VERSION},bridge_id,secret,15)
            polled=request_json(server,'/api/hybrid/agent/poll',{'bridgeId':bridge_id,'deviceId':device_id},bridge_id,secret,30);job=polled.get('job')
            if job:
                print('Running approved job',job.get('id'));packet=execute_job(job,root);packet.update({'bridgeId':bridge_id,'deviceId':device_id});request_json(server,'/api/hybrid/agent/result',packet,bridge_id,secret,60);print('Returned proof:',packet['resultFingerprint'])
            if args.once:return
        except KeyboardInterrupt:return
        except Exception as e: print('Bridge warning:',e,file=sys.stderr)
        time.sleep(4)

if __name__=='__main__': main()
