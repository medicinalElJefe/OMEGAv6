#!/usr/bin/env python3
"""OMEGA R207 canonical Hybrid Link proof wrapper.

OMEGA Hybrid Link agent compatibility signature.
R207 preserves the proven R34.1/R132/R205 executor as an immutable downloaded base
and adds the exact R141 return-payload fingerprint envelope required by the canonical
Worker proof-closure path. The wrapper does not widen the operation allow-list, root
boundary, shell policy, pairing authority, heartbeat truth, Canon authority, or solver
claims. Pairing is explicit.

R243 execution-motion is additive: while an allow-listed job is executing, this canonical
downloaded wrapper emits bounded authenticated lease/progress pulses carrying only exact
job/step identity, ordinal progress and elapsed time. Motion proves continued ownership of
a RUNNING claim, never execution success. Final success remains the exact R141 return.
"""
from __future__ import annotations
import hashlib,json,sys,threading,time,types,urllib.request

VERSION='R207'
BASE_TRANSPORT_VERSION='R34.1'
BASE_CAPABILITY_REVISION='R132'
BASE_PROOF_EXTENSION='R205'
PROOF_CLOSURE_REVISION='R141'
R207_PROOF_EXTENSION='R207'
EXECUTION_MOTION_EXTENSION='R243'
FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
BASE_PATH='/omega-hybrid-agent-base-r205.py'
EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'
BASE_IDENTITY_MARKER='OMEGA R34 local Hybrid Link agent'
PAIRING_IDENTITY_MARKER='Pairing is explicit.'
MAX_BASE_BYTES=512*1024
MAX_FINGERPRINT_PAYLOAD_BYTES=512*1024
PROGRESS_INTERVAL_SECONDS=3.0
PROGRESS_HTTP_TIMEOUT_SECONDS=10

REQUIRED_BASE_CONTRACT_TOKENS=(
 "VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",
 BASE_IDENTITY_MARKER,PAIRING_IDENTITY_MARKER,'root-confined','secure_path(root','Path escapes approved root.','shell=False',
 "'/api/hybrid/agent/register'","'/api/hybrid/agent/heartbeat'","'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'",
 'Browser may now truthfully show PC ONLINE','DESKTOP_HEALTH','FORENSIC_HASH_LEDGER',
 'def list_windows(','def focus_window(','def assert_window(','def screen_capture(','def read_visible_text(',
 'def mouse_move(','def click_mouse(','def send_key(','def type_text(','def scroll_mouse(','def record_macro(','def replay_macro(',
 "op=='CLICK'","op=='KEY'","op=='TYPE_TEXT'","op=='SCROLL'","op=='ASSERT_WINDOW'","op=='READ_VISIBLE_TEXT'","op=='RECORD_MACRO'","op=='REPLAY_MACRO'",
 "root/'.omega_hybrid'/'screens'","root/'.omega_hybrid'/'macros'",'WINDOWS_UI_AUTOMATION','assert_window(title)','MAX_MACRO_EVENTS=5000','max_runtime',
 'APPLY_PATCH requires expectedSha256',"replacements=step.get('replacements')",'def write_text(','WRITE_TEXT replacement requires expectedSha256',
 'def workbook_audit(',"executedMacros':False",'OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R132',"foundationWeightsChanged':False","learningType':'LOCAL_RETRIEVAL_AND_PROOF_PRIOR_INDEX'"
)

def sha_bytes(b:bytes):return hashlib.sha256(b).hexdigest()
def arg_value(name,default):
    try:
        i=sys.argv.index(name)
        return sys.argv[i+1] if i+1<len(sys.argv) else default
    except ValueError:return default

def canonical_json(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def exact_payload(core):
    payload=canonical_json(core)
    if len(payload.encode('utf-8'))>MAX_FINGERPRINT_PAYLOAD_BYTES:raise RuntimeError('R207/R141 fingerprint payload exceeds bounded proof size.')
    return payload

def canonical_base_source(server):
    url=server.rstrip('/')+BASE_PATH
    req=urllib.request.Request(url,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-Hybrid-R207-R243-Wrapper/1'})
    with urllib.request.urlopen(req,timeout=30) as r:
        source=r.read(MAX_BASE_BYTES+1)
    if len(source)<1000 or len(source)>MAX_BASE_BYTES:raise RuntimeError('R207 base agent size proof failed.')
    digest=sha_bytes(source)
    if digest!=EXPECTED_BASE_SHA256:raise RuntimeError('R207 immutable R205 base SHA-256 mismatch.')
    text=source.decode('utf-8')
    for token in REQUIRED_BASE_CONTRACT_TOKENS:
        if token not in text:raise RuntimeError('R207 base agent contract missing '+token)
    return text,digest

def load_base(server):
    source,digest=canonical_base_source(server)
    module=types.ModuleType('omega_hybrid_agent_r205_base')
    module.__file__='<canonical-omega-hybrid-agent-base-r205.py>'
    exec(compile(source,module.__file__,'exec'),module.__dict__)
    return module,digest

def wrap_packet(packet,base_digest):
    core={k:packet.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')}
    payload=exact_payload(core)
    packet.update({
        'resultFingerprintSchema':FINGERPRINT_SCHEMA,
        'resultFingerprintR141Payload':payload,
        'resultFingerprintR141':sha_bytes(payload.encode('utf-8')),
        'proofClosureRevision':PROOF_CLOSURE_REVISION,
        'baseAgentSha256':base_digest,
        'proofExtensions':list(dict.fromkeys(list(packet.get('proofExtensions') or [])+[BASE_PROOF_EXTENSION,R207_PROOF_EXTENSION,EXECUTION_MOTION_EXTENSION]))
    })
    return packet

def main():
    server=arg_value('--server',DEFAULT_SERVER).rstrip('/')
    base,base_digest=load_base(server)
    base_execute=base.execute_job
    base_execute_step=base.execute_step
    base_request_json=base.request_json
    base_capabilities=base.capabilities
    transport={}
    motion={'active':False}
    motion_lock=threading.Lock()

    def motion_update(**values):
        with motion_lock:motion.update(values)

    def progress_payload(state_override=None):
        with motion_lock:
            if not motion.get('active') or not transport.get('deviceId') or not motion.get('jobId'):return None
            motion['seq']=int(motion.get('seq',0))+1
            started=float(motion.get('startedMono') or time.monotonic())
            return {
                'bridgeId':transport.get('bridgeId'),'deviceId':transport.get('deviceId'),'jobId':motion.get('jobId'),
                'seq':motion['seq'],'state':state_override or motion.get('state') or 'STEP_RUNNING',
                'stepId':motion.get('stepId') or '','stepOp':motion.get('stepOp') or '',
                'stepIndex':int(motion.get('stepIndex') or 0),'totalSteps':int(motion.get('totalSteps') or 0),
                'completedSteps':int(motion.get('completedSteps') or 0),
                'elapsedMs':max(0,int((time.monotonic()-started)*1000)),
                'message':str(motion.get('message') or '')[:240]
            }

    def send_progress(state_override=None):
        payload=progress_payload(state_override)
        if not payload:return False
        try:
            base_request_json(transport['server'],'/api/hybrid/agent/progress',payload,transport['bridgeId'],transport['secret'],PROGRESS_HTTP_TIMEOUT_SECONDS)
            return True
        except Exception as exc:
            motion_update(lastProgressError=str(exc)[:240])
            return False

    def progress_loop(stop_event):
        while not stop_event.wait(PROGRESS_INTERVAL_SECONDS):send_progress()

    def execute_step_r243(step,approved_root):
        op=str(step.get('op','')).upper();step_id=str(step.get('id') or '')
        with motion_lock:
            idx=int((motion.get('stepIndexById') or {}).get(step_id,motion.get('stepIndex') or 0))
            motion.update({'state':'STEP_RUNNING','stepId':step_id,'stepOp':op,'stepIndex':idx,'message':str(step.get('label') or op)[:240]})
        send_progress('STEP_RUNNING')
        try:
            result=base_execute_step(step,approved_root)
            with motion_lock:motion.update({'state':'STEP_COMPLETE','completedSteps':max(int(motion.get('completedSteps') or 0),idx),'message':f'{op} returned to the R207/R141 proof wrapper.'})
            send_progress('STEP_COMPLETE')
            return result
        except Exception:
            motion_update(state='STEP_COMPLETE',message=f'{op} returned a bounded failure to the R207/R141 proof wrapper.')
            send_progress('STEP_COMPLETE')
            raise

    def request_json_r243(server_url,path,payload,bridge_id,secret,timeout=30):
        if isinstance(payload,dict) and path in {'/api/hybrid/agent/register','/api/hybrid/agent/heartbeat','/api/hybrid/agent/poll'}:
            transport.update({'server':server_url,'bridgeId':bridge_id,'secret':secret,'deviceId':str(payload.get('deviceId') or transport.get('deviceId') or '')})
        if path in {'/api/hybrid/agent/register','/api/hybrid/agent/heartbeat'} and isinstance(payload,dict):
            payload=dict(payload);payload['proofExtensions']=list(dict.fromkeys([*(payload.get('proofExtensions') or []),EXECUTION_MOTION_EXTENSION]))
        return base_request_json(server_url,path,payload,bridge_id,secret,timeout)

    def execute_job_r243(job,root):
        steps=list(job.get('steps') or [])[:24]
        step_index={str(s.get('id') or ''):i+1 for i,s in enumerate(steps) if isinstance(s,dict)}
        motion_update(active=True,jobId=str(job.get('id') or ''),seq=0,state='CLAIMED',stepId='',stepOp='',stepIndex=0,totalSteps=len(steps),completedSteps=0,startedMono=time.monotonic(),stepIndexById=step_index,message='Authenticated host accepted the governed job.')
        send_progress('CLAIMED')
        stop_event=threading.Event();thread=threading.Thread(target=progress_loop,args=(stop_event,),name='omega-r243-progress',daemon=True);thread.start()
        try:
            packet=base_execute(job,root)
        finally:
            send_progress('RETURNING');stop_event.set();thread.join(timeout=1.0);motion_update(active=False,state='RETURNING')
        return wrap_packet(packet,base_digest)

    def capabilities_r207():return base_capabilities()
    base.execute_step=execute_step_r243
    base.request_json=request_json_r243
    base.execute_job=execute_job_r243
    base.capabilities=capabilities_r207
    original_main=base.main
    print('OMEGA Hybrid Link proof wrapper',VERSION,'· base',base.VERSION,'execution',base.CAPABILITY_REVISION,'proof',BASE_PROOF_EXTENSION,'→',PROOF_CLOSURE_REVISION,'motion',EXECUTION_MOTION_EXTENSION)
    print('Exact R141 semantic return fingerprint enabled; R243 lease/progress is liveness only. R125 remains sole CanonState admission authority.')
    original_main()

if __name__=='__main__':main()
