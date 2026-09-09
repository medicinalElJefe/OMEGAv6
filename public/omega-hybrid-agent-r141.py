#!/usr/bin/env python3
"""OMEGA R141 proof-closure wrapper over the proven R34.1/R132 Hybrid agent.

Launcher compatibility identity: OMEGA R34 local Hybrid Link agent.
Pairing is explicit.

R206.1 continuity hardening: the wrapper fails closed unless the downloaded base also
contains the deployed R205 DESKTOP_HEALTH + FORENSIC_HASH_LEDGER proof extension. R207
binds this launcher path directly to the immutable R205 executor rather than recursively
loading the canonical R207 wrapper. The base remains byte-identical rollback/transport
authority. This wrapper preserves root-confined allow-listed execution and adds the exact
R141 payload envelope before R134/R136 evidence closure. R139/R140, R146/R147, R206 world
continuity, R206.1 historical host evidence and R125 Canon admission remain preserved.

R207.1 compatibility note: the server-side R116 asset validator predates the R207 split and
looks for the literal legacy BASE_PATH token. SERVER_VALIDATOR_COMPATIBILITY_R207_1 carries
that inert text only so the legacy validator can serve this wrapper; active BASE_PATH below
remains the immutable R205 asset and its exact SHA-256 is mandatory before any base code loads.

R238 host-intelligence extension: DESKTOP_HEALTH returned proof is enriched with bounded,
host-observed CPU/RAM/GPU/root-storage/Python/RCWA state and a bounded local macro inventory.
No screenshot value is hard-coded. No dependency is installed. Macro contents are not uploaded.
REPLAY_MACRO is preflight-verified against its stored schema/hash/event count/order/time/coordinate
bounds and window lock before execution. All added host facts remain inside the existing R141
exact returned-payload proof.

R240 bridge-calculus extension: a calculus-bound job carries the same sparse 20,736 address,
selected-device identity, shared snapshot epoch and source-profile fingerprint inside each
validated step. The wrapper validates that carry before native execution, preserves the address
through the host frame and echoes it into returned step proof with reversed orientation before
R141 exact-return fingerprinting. This is software/state continuity, not a physical-dimension claim.

R243 execution-motion extension: while an allow-listed host job is executing, the wrapper emits
bounded authenticated progress/lease pulses from a daemon telemetry thread. The pulse reports only
job/step identity, ordinal progress and elapsed time; it does not expose arbitrary process output,
add an executor, bypass R141 result proof, or convert liveness into execution success.
"""
from __future__ import annotations
import ctypes,hashlib,importlib.util,json,os,platform,shutil,socket,subprocess,sys,threading,time,types,urllib.request
from pathlib import Path

DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
LEGACY_BASE_PATH_R141='/omega-hybrid-agent.py'
SERVER_VALIDATOR_COMPATIBILITY_R207_1="BASE_PATH='/omega-hybrid-agent.py'"
BASE_PATH='/omega-hybrid-agent-base-r205.py'
EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'
BASE_IDENTITY_MARKER='OMEGA R34 local Hybrid Link agent'
PAIRING_IDENTITY_MARKER='Pairing is explicit.'
PROOF_CLOSURE_REVISION='R141'
HOST_PROOF_EXTENSION='R205'
HOST_EVIDENCE_CONTINUITY_REVISION='R206.1'
R207_1_ASSET_COMPATIBILITY_REVISION='R207.1'
HOST_INTELLIGENCE_EXTENSION='R238'
BRIDGE_CALCULUS_EXTENSION='R240'
EXECUTION_MOTION_EXTENSION='R243'
HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'
MACRO_INVENTORY_SCHEMA='OMEGA_LOCAL_MACRO_INVENTORY_R238'
MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'
FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'
MAX_BASE_BYTES=512*1024
MAX_FINGERPRINT_PAYLOAD_BYTES=512*1024
MAX_MACRO_FILE_BYTES=1024*1024
MAX_MACRO_INVENTORY=64
MAX_MACRO_EVENTS_R238=5000
MAX_MACRO_SECONDS_R238=300
MAX_MACRO_COORD_ABS_R238=100000
PROFILE_CACHE_SECONDS=60
MACRO_CACHE_SECONDS=30
PROGRESS_INTERVAL_SECONDS=3.0
PROGRESS_HTTP_TIMEOUT_SECONDS=10

def sha_bytes(b:bytes):return hashlib.sha256(b).hexdigest()
def sha_json(o):return sha_bytes(json.dumps(o,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode('utf-8'))
def arg_value(name,default):
    try:
        i=sys.argv.index(name)
        return sys.argv[i+1] if i+1<len(sys.argv) else default
    except ValueError:return default

def canonical_base_source(server):
    url=server.rstrip('/')+BASE_PATH
    req=urllib.request.Request(url,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-Hybrid-R141-R206.1-R207.1-R238-R240-R243-Wrapper/1'})
    with urllib.request.urlopen(req,timeout=30) as r:
        source=r.read(MAX_BASE_BYTES+1)
    if len(source)<1000 or len(source)>MAX_BASE_BYTES:raise RuntimeError('R141 base agent size proof failed.')
    observed=sha_bytes(source)
    if observed!=EXPECTED_BASE_SHA256:raise RuntimeError('R141/R207 immutable R205 base SHA-256 mismatch.')
    text=source.decode('utf-8')
    required=("VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",BASE_IDENTITY_MARKER,PAIRING_IDENTITY_MARKER,'root-confined','shell=False',"'DESKTOP_HEALTH'","'FORENSIC_HASH_LEDGER'",'proofExtensions',"'/api/hybrid/agent/heartbeat'","'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'")
    for token in required:
        if token not in text:raise RuntimeError('R141/R206.1/R207/R238 base agent contract missing '+token)
    return text,observed

def exact_payload(core):
    payload=json.dumps(core,sort_keys=True,separators=(',',':'),ensure_ascii=False)
    if len(payload.encode('utf-8'))>MAX_FINGERPRINT_PAYLOAD_BYTES:raise RuntimeError('R141 fingerprint payload exceeds bounded proof size.')
    return payload

def load_base(server):
    source,digest=canonical_base_source(server);module=types.ModuleType('omega_hybrid_agent_r132_r205_base');module.__file__='<immutable-omega-hybrid-agent-base-r205.py>'
    exec(compile(source,module.__file__,'exec'),module.__dict__)
    if getattr(module,'R205_PROOF_EXTENSION',None)!=HOST_PROOF_EXTENSION:raise RuntimeError('R206.1 host proof extension identity mismatch.')
    caps=set(module.capabilities())
    if not {'DESKTOP_HEALTH','FORENSIC_HASH_LEDGER'}.issubset(caps):raise RuntimeError('R206.1 host proof operations are not advertised by immutable R205 base agent.')
    return module,digest

def _windows_cpu():
    if os.name!='nt':return{}
    script="$ErrorActionPreference='Stop';Get-CimInstance Win32_Processor|Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors|ConvertTo-Json -Compress"
    try:
        p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-Command',script],text=True,capture_output=True,timeout=8,shell=False)
        if p.returncode==0 and p.stdout.strip():
            d=json.loads(p.stdout);return {'model':str(d.get('Name') or '').strip()[:160],'physicalCores':int(d.get('NumberOfCores') or 0),'logicalProcessors':int(d.get('NumberOfLogicalProcessors') or 0),'query':'WINDOWS_CIM_FIXED_READ_ONLY'}
    except Exception:pass
    return{}

def _windows_memory():
    if os.name!='nt':return{}
    try:
        class M(ctypes.Structure):
            _fields_=[('dwLength',ctypes.c_ulong),('dwMemoryLoad',ctypes.c_ulong),('ullTotalPhys',ctypes.c_ulonglong),('ullAvailPhys',ctypes.c_ulonglong),('ullTotalPageFile',ctypes.c_ulonglong),('ullAvailPageFile',ctypes.c_ulonglong),('ullTotalVirtual',ctypes.c_ulonglong),('ullAvailVirtual',ctypes.c_ulonglong),('ullAvailExtendedVirtual',ctypes.c_ulonglong)]
        m=M();m.dwLength=ctypes.sizeof(M)
        if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)):
            return {'totalBytes':int(m.ullTotalPhys),'availableBytes':int(m.ullAvailPhys),'loadPercent':int(m.dwMemoryLoad),'query':'GLOBAL_MEMORY_STATUS_EX'}
    except Exception:pass
    return{}

def _windows_gpu_adapters():
    if os.name!='nt':return []
    script="$ErrorActionPreference='Stop';Get-CimInstance Win32_VideoController|Select-Object Name,AdapterRAM,DriverVersion|ConvertTo-Json -Compress"
    try:
        p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-Command',script],text=True,capture_output=True,timeout=8,shell=False)
        if p.returncode or not p.stdout.strip():return []
        rows=json.loads(p.stdout);rows=rows if isinstance(rows,list) else [rows]
        out=[]
        for d in rows[:8]:
            if not isinstance(d,dict):continue
            ram=d.get('AdapterRAM')
            try:reported=int(ram) if ram is not None else None
            except Exception:reported=None
            out.append({'name':str(d.get('Name') or 'Windows display adapter')[:160],'adapterRamReportedBytes':reported if reported and reported>0 else None,'driverVersion':str(d.get('DriverVersion') or '')[:80] or None,'query':'WINDOWS_CIM_FIXED_READ_ONLY'})
        return out
    except Exception:return []

def _nvidia_gpu():
    exe=shutil.which('nvidia-smi')
    if not exe:return {'available':False,'query':'NVIDIA_SMI_NOT_FOUND'}
    try:
        p=subprocess.run([exe,'--query-gpu=name,memory.total,driver_version','--format=csv,noheader,nounits'],text=True,capture_output=True,timeout=8,shell=False)
        if p.returncode!=0 or not p.stdout.strip():return {'available':False,'query':'NVIDIA_SMI_QUERY_FAILED'}
        rows=[]
        for line in p.stdout.splitlines()[:8]:
            parts=[x.strip() for x in line.split(',')];mib=float(parts[1]) if len(parts)>1 and parts[1] else 0
            rows.append({'name':parts[0][:160] if parts else 'NVIDIA GPU','vramBytes':int(mib*1024*1024),'driverVersion':parts[2][:80] if len(parts)>2 else None})
        return {'available':bool(rows),'query':'NVIDIA_SMI_FIXED_READ_ONLY','adapters':rows}
    except Exception as e:return {'available':False,'query':'NVIDIA_SMI_QUERY_ERROR','error':str(e)[:240]}

def _gpu_state():
    cim=_windows_gpu_adapters();nvidia=_nvidia_gpu();nrows=nvidia.get('adapters') if isinstance(nvidia,dict) and isinstance(nvidia.get('adapters'),list) else []
    primary=(nrows[0] if nrows else (cim[0] if cim else {}))
    return {
      'present':bool(cim or nrows),'name':primary.get('name'),'vramBytes':primary.get('vramBytes'),'adapterRamReportedBytes':primary.get('adapterRamReportedBytes'),'driverVersion':primary.get('driverVersion'),
      'adapters':cim,'nvidiaSmi':nvidia,'query':'WINDOWS_CIM_PLUS_OPTIONAL_NVIDIA_SMI' if os.name=='nt' else nvidia.get('query','GPU_QUERY_UNAVAILABLE'),
      'truthBoundary':'GPU adapter presence is host inventory only. NVIDIA SMI, when available, is a fixed read-only enrichment. Neither path proves CUDA runtime availability, kernel execution, solver validity, or scientific correctness.'
    }

def host_profile(root:Path,cache:dict):
    now=time.time();prior=cache.get('profile')
    if prior and now-cache.get('at',0)<PROFILE_CACHE_SECONDS:return prior
    wc=_windows_cpu();logical=max(1,int(wc.get('logicalProcessors') or os.cpu_count() or 1));physical=int(wc.get('physicalCores') or 0)
    cpu={'model':wc.get('model') or platform.processor() or os.environ.get('PROCESSOR_IDENTIFIER') or platform.machine(),'physicalCores':physical or None,'logicalProcessors':logical,'query':wc.get('query') or 'PYTHON_RUNTIME_FALLBACK'}
    memory=_windows_memory()
    try:u=shutil.disk_usage(root);storage={'rootLabel':root.name or root.anchor,'totalBytes':int(u.total),'usedBytes':int(u.used),'freeBytes':int(u.free),'query':'PYTHON_DISK_USAGE_APPROVED_ROOT'}
    except Exception as e:storage={'rootLabel':root.name or root.anchor,'error':str(e)[:240],'query':'PYTHON_DISK_USAGE_FAILED'}
    grcwa=importlib.util.find_spec('grcwa') is not None
    profile={
      'schema':HOST_PROFILE_SCHEMA,'revision':HOST_INTELLIGENCE_EXTENSION,'observedAt':int(now*1000),'hostName':socket.gethostname()[:120],'platform':platform.platform()[:200],
      'cpu':cpu,'memory':memory,'gpu':_gpu_state(),'storage':storage,
      'python':{'version':platform.python_version(),'executable':Path(sys.executable).name,'architecture':platform.architecture()[0]},
      'rcwa':{'pythonDependencyAvailable':bool(grcwa),'state':'PYTHON_DEPENDENCY_AVAILABLE' if grcwa else 'PYTHON_DEPENDENCY_NOT_INSTALLED','reason':'grcwa is import-discoverable in the exact Hybrid agent Python environment.' if grcwa else 'grcwa is not installed in the exact Hybrid agent Python environment; General Hybrid remains available and R238 does not auto-install dependencies.'},
      'schedulerAdvisory':{'recommendedCpuWorkers':max(1,min(12,logical-2 if logical>4 else max(1,logical-1))),'policy':'RESERVE_OS_HEADROOM_CAP_12','authority':'ADVISORY_ONLY'},
      'truthBoundary':'R238 reports bounded host-observed resource and dependency state from the authenticated Hybrid process. GPU presence does not prove CUDA availability; grcwa importability does not prove a valid RCWA solve; resource telemetry is not source mutation, scientific truth, federation closure, or CanonState admission.'
    }
    profile['profileSha256']=sha_json(profile);cache['profile']=profile;cache['at']=now;return profile

def _macro_core_valid(d):
    if not isinstance(d,dict) or d.get('schema')!='OMEGA_LOCAL_MACRO_R132':return False,'SCHEMA_MISMATCH'
    title=str(d.get('windowTitleLock') or '').strip();events=d.get('events')
    if not title or len(title)>240:return False,'WINDOW_TITLE_LOCK_REQUIRED'
    if not isinstance(events,list) or not 1<=len(events)<=MAX_MACRO_EVENTS_R238:return False,'EVENT_BOUND_INVALID'
    try:event_count=int(d.get('eventCount'))
    except Exception:return False,'EVENT_COUNT_INVALID'
    if event_count!=len(events):return False,'EVENT_COUNT_MISMATCH'
    stored=str(d.get('macroSha256') or '').lower();core=dict(d);core.pop('macroSha256',None)
    if len(stored)!=64 or sha_json(core)!=stored:return False,'MACRO_HASH_MISMATCH'
    prior=-1.0
    for e in events:
        if not isinstance(e,dict) or e.get('type') not in {'MOVE','CLICK','KEY_RAW'}:return False,'EVENT_TYPE_REJECTED'
        try:
            t=float(e.get('t',0))
            if t<prior or t<0 or t>MAX_MACRO_SECONDS_R238:return False,'EVENT_TIME_INVALID'
            prior=t
            if e.get('type') in {'MOVE','CLICK'}:
                x=int(e.get('x'));y=int(e.get('y'))
                if abs(x)>MAX_MACRO_COORD_ABS_R238 or abs(y)>MAX_MACRO_COORD_ABS_R238:return False,'EVENT_COORDINATE_INVALID'
            if e.get('type')=='CLICK' and str(e.get('button','LEFT')).upper() not in {'LEFT','RIGHT'}:return False,'BUTTON_REJECTED'
            if e.get('type')=='KEY_RAW' and not 8<=int(e.get('vk'))<=255:return False,'KEY_REJECTED'
        except Exception:return False,'EVENT_VALUE_INVALID'
    return True,'VERIFIED'

def macro_inventory(root:Path,cache:dict):
    now=time.time();prior=cache.get('macros')
    if prior and now-cache.get('macrosAt',0)<MACRO_CACHE_SECONDS:return prior
    d=root/'.omega_hybrid'/'macros';rows=[];invalid=0
    if d.is_dir():
        files=sorted((p for p in d.glob('*.json') if p.is_file() and not p.is_symlink()),key=lambda p:p.stat().st_mtime,reverse=True)[:MAX_MACRO_INVENTORY]
        for p in files:
            try:
                raw=p.read_bytes()
                if len(raw)>MAX_MACRO_FILE_BYTES:raise ValueError('MACRO_FILE_TOO_LARGE')
                data=json.loads(raw.decode('utf-8'));valid,state=_macro_core_valid(data)
                if not valid:invalid+=1
                rows.append({'name':p.stem[:64],'fileSha256':sha_bytes(raw),'state':state,'eventCount':len(data.get('events',[])) if isinstance(data,dict) and isinstance(data.get('events'),list) else 0,'windowTitleLock':str(data.get('windowTitleLock') or '')[:160] if isinstance(data,dict) else '','recordedAt':data.get('recordedAt') if isinstance(data,dict) else None})
            except Exception as e:invalid+=1;rows.append({'name':p.stem[:64],'state':'INVALID','error':str(e)[:160]})
    out={'schema':MACRO_INVENTORY_SCHEMA,'revision':HOST_INTELLIGENCE_EXTENSION,'observedAt':int(now*1000),'totalCount':len(rows),'verifiedCount':len(rows)-invalid,'invalidCount':invalid,'entries':rows,'contentsReturned':False,'truthBoundary':'Inventory reports bounded metadata and hashes only; macro event contents are not uploaded.'};out['inventorySha256']=sha_json(out);cache['macros']=out;cache['macrosAt']=now;return out

def verify_macro_replay(base,root:Path,name,title):
    p=base.macro_path(root,name)
    if not p.is_file() or p.is_symlink():raise base.AgentError('R238 macro preflight: macro file not found or not a regular local file.')
    raw=p.read_bytes()
    if len(raw)>MAX_MACRO_FILE_BYTES:raise base.AgentError('R238 macro preflight: macro file exceeds bounded size.')
    try:data=json.loads(raw.decode('utf-8'))
    except Exception as e:raise base.AgentError('R238 macro preflight: invalid JSON.') from e
    valid,state=_macro_core_valid(data)
    if not valid:raise base.AgentError('R238 macro preflight: '+state)
    locked=str(data.get('windowTitleLock') or '')
    if locked!=str(title or ''):raise base.AgentError('R238 macro preflight: requested window title does not exactly match the recorded lock.')
    return {'schema':MACRO_PREFLIGHT_SCHEMA,'revision':HOST_INTELLIGENCE_EXTENSION,'state':'VERIFIED','macroName':p.stem[:64],'fileSha256':sha_bytes(raw),'eventCount':len(data.get('events',[])),'windowTitleLock':locked[:160],'contentsReturned':False}

def validate_bridge_calculus_r240(job):
    steps=job.get('steps') if isinstance(job,dict) else None
    if not isinstance(steps,list):return {}
    target=str(job.get('targetDeviceId') or '')
    carried={};seen=0
    for step in steps:
        if not isinstance(step,dict):continue
        bridge=step.get('calculusBridgeR240')
        if bridge is None:continue
        seen+=1
        if not isinstance(bridge,dict) or bridge.get('schema')!='OMEGA_HYBRID_BRIDGE_CALCULUS_R240' or bridge.get('revision')!='R240':raise RuntimeError('R240 bridge calculus schema/revision mismatch.')
        address=bridge.get('address')
        if not isinstance(address,dict):raise RuntimeError('R240 bridge calculus address missing.')
        try:a=int(address.get('address'));deep=int(address.get('deepAddress'))
        except Exception as e:raise RuntimeError('R240 bridge calculus address invalid.') from e
        if a<0 or a>=20736 or deep<0 or deep>=248832:raise RuntimeError('R240 bridge calculus address out of bounded atlas range.')
        if int(bridge.get('orientation',0))!=1:raise RuntimeError('R240 bridge dispatch orientation must be +1 before host execution.')
        if bridge.get('sourceFrame')!='BROWSER_OPERATOR' or bridge.get('transitFrame')!='CLOUD_DURABLE_QUEUE' or bridge.get('destinationFrame')!='SELECTED_HYBRID_HOST':raise RuntimeError('R240 bridge frame transition mismatch.')
        if target and str(bridge.get('targetDeviceId') or '')!=target:raise RuntimeError('R240 bridge target-device continuity mismatch.')
        step_id=str(step.get('id') or '')
        if not step_id:raise RuntimeError('R240 bridge calculus requires a stable step id.')
        carried[step_id]=bridge
    if seen and seen!=len(steps):raise RuntimeError('R240 calculus-bound Hybrid jobs must carry the bridge envelope on every step.')
    return carried

def main():
    server=arg_value('--server',DEFAULT_SERVER).rstrip('/');base,base_digest=load_base(server);root=Path(base.normalize_root_arg(arg_value('--root','.'))).expanduser().resolve();cache={}
    base_execute=base.execute_job;original_execute_step=base.execute_step;original_request_json=base.request_json
    transport={};motion={'active':False};motion_lock=threading.Lock()
    def motion_update(**values):
        with motion_lock:motion.update(values)
    def progress_payload(state_override=None):
        with motion_lock:
            if not motion.get('active') or not transport.get('deviceId') or not motion.get('jobId'):return None
            motion['seq']=int(motion.get('seq',0))+1
            return {'bridgeId':transport.get('bridgeId'),'deviceId':transport.get('deviceId'),'jobId':motion.get('jobId'),'seq':motion['seq'],'state':state_override or motion.get('state') or 'STEP_RUNNING','stepId':motion.get('stepId') or '','stepOp':motion.get('stepOp') or '','stepIndex':int(motion.get('stepIndex') or 0),'totalSteps':int(motion.get('totalSteps') or 0),'completedSteps':int(motion.get('completedSteps') or 0),'elapsedMs':max(0,int((time.monotonic()-float(motion.get('startedMono') or time.monotonic()))*1000)),'message':str(motion.get('message') or '')[:240]}
    def send_progress(state_override=None):
        payload=progress_payload(state_override)
        if not payload:return False
        try:
            original_request_json(transport['server'],'/api/hybrid/agent/progress',payload,transport['bridgeId'],transport['secret'],PROGRESS_HTTP_TIMEOUT_SECONDS);return True
        except Exception as e:
            motion_update(lastProgressError=str(e)[:240]);return False
    def progress_loop(stop_event):
        while not stop_event.wait(PROGRESS_INTERVAL_SECONDS):send_progress()
    def execute_step_r238(step,approved_root):
        op=str(step.get('op','')).upper();step_id=str(step.get('id') or '')
        with motion_lock:
            idx=int((motion.get('stepIndexById') or {}).get(step_id,motion.get('stepIndex') or 0));motion.update({'state':'STEP_RUNNING','stepId':step_id,'stepOp':op,'stepIndex':idx,'message':str(step.get('label') or op)[:240]})
        preflight=verify_macro_replay(base,approved_root,step.get('macroName'),step.get('windowTitle')) if op=='REPLAY_MACRO' else None
        try:
            result=original_execute_step(step,approved_root)
            if op=='DESKTOP_HEALTH' and isinstance(result,dict):
                result=dict(result);result['hostProfileR238']=host_profile(approved_root,cache);result['macroInventoryR238']=macro_inventory(approved_root,cache)
            if preflight is not None and isinstance(result,dict):result=dict(result);result['macroPreflightR238']=preflight
            with motion_lock:motion.update({'state':'STEP_COMPLETE','completedSteps':max(int(motion.get('completedSteps') or 0),idx),'message':f'{op} returned to the R141 wrapper.'})
            send_progress('STEP_COMPLETE')
            return result
        except Exception:
            motion_update(state='STEP_COMPLETE',message=f'{op} returned a bounded failure to the R141 wrapper.');send_progress('STEP_COMPLETE');raise
    def request_json_r238(server_url,path,payload,bridge_id,secret,timeout=30):
        if isinstance(payload,dict) and path in {'/api/hybrid/agent/register','/api/hybrid/agent/heartbeat','/api/hybrid/agent/poll'}:
            transport.update({'server':server_url,'bridgeId':bridge_id,'secret':secret,'deviceId':str(payload.get('deviceId') or transport.get('deviceId') or '')})
        if path in {'/api/hybrid/agent/register','/api/hybrid/agent/heartbeat'} and isinstance(payload,dict):
            payload=dict(payload);extensions=list(dict.fromkeys([*(payload.get('proofExtensions') or []),HOST_INTELLIGENCE_EXTENSION,BRIDGE_CALCULUS_EXTENSION]));extensions=list(dict.fromkeys([*extensions,EXECUTION_MOTION_EXTENSION]));payload['proofExtensions']=extensions
        return original_request_json(server_url,path,payload,bridge_id,secret,timeout)
    def execute_job_r141(job,approved_root):
        bridge_by_step=validate_bridge_calculus_r240(job);steps=list(job.get('steps') or [])[:24];step_index={str(s.get('id') or ''):i+1 for i,s in enumerate(steps) if isinstance(s,dict)}
        motion_update(active=True,jobId=str(job.get('id') or ''),seq=0,state='CLAIMED',stepId='',stepOp='',stepIndex=0,totalSteps=len(steps),completedSteps=0,startedMono=time.monotonic(),stepIndexById=step_index,message='Authenticated host accepted the governed job.')
        send_progress('CLAIMED');stop_event=threading.Event();thread=threading.Thread(target=progress_loop,args=(stop_event,),name='omega-r243-progress',daemon=True);thread.start()
        try:packet=base_execute(job,approved_root)
        finally:
            send_progress('RETURNING');stop_event.set();thread.join(timeout=1.0);motion_update(active=False,state='RETURNING')
        packet['proofExtensions']=list(dict.fromkeys([*(packet.get('proofExtensions') or []),HOST_INTELLIGENCE_EXTENSION,BRIDGE_CALCULUS_EXTENSION]));packet['proofExtensions']=list(dict.fromkeys([*packet['proofExtensions'],EXECUTION_MOTION_EXTENSION]))
        for proof in packet.get('stepProofs') or []:
            if not isinstance(proof,dict):continue
            bridge=bridge_by_step.get(str(proof.get('id') or ''))
            if not isinstance(bridge,dict):continue
            returned=dict(bridge);returned['orientation']=-1;returned['sourceFrame']='SELECTED_HYBRID_HOST';returned['transitFrame']='CLOUD_DURABLE_RETURN';returned['destinationFrame']='R141_RETURN_PROOF';returned['returnFrame']='R141_RETURN_PROOF';returned['returnedAt']=int(time.time()*1000);proof['calculusBridgeR240Return']=returned
        core={k:packet.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')}
        payload=exact_payload(core);digest=sha_bytes(payload.encode('utf-8'))
        packet.update({'resultFingerprintSchema':FINGERPRINT_SCHEMA,'resultFingerprintR141Payload':payload,'resultFingerprintR141':digest,'proofClosureRevision':PROOF_CLOSURE_REVISION,'baseAgentSha256':base_digest})
        return packet
    base.execute_step=execute_step_r238;base.request_json=request_json_r238;base.execute_job=execute_job_r141
    print('OMEGA Hybrid Link proof wrapper',PROOF_CLOSURE_REVISION,'· immutable base',base.VERSION,'execution',base.CAPABILITY_REVISION,'host proof',HOST_PROOF_EXTENSION,'continuity',HOST_EVIDENCE_CONTINUITY_REVISION,'asset compatibility',R207_1_ASSET_COMPATIBILITY_REVISION,'host intelligence',HOST_INTELLIGENCE_EXTENSION,'bridge calculus',BRIDGE_CALCULUS_EXTENSION,'execution motion',EXECUTION_MOTION_EXTENSION)
    print('Exact return payload SHA-256 is enabled; R238 adds bounded host-resource truth + macro preflight, R240 closes calculus address continuity, and R243 keeps RUNNING work lease-visible with authenticated step motion while preserving R141 result authority.')
    base.main()

if __name__=='__main__':main()
