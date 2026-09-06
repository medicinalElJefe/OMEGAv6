#!/usr/bin/env python3
"""OMEGA R140 proof-closure wrapper over the proven R34.1/R132 Hybrid agent.

Launcher compatibility identity: OMEGA R34 local Hybrid Link agent.
Pairing is explicit.

The base agent remains byte-identical rollback/transport authority. This wrapper loads that
canonical source in memory, preserves its root-confined allow-listed execution, and adds an
exact canonical payload envelope so the Cloudflare Worker can verify the same bytes the PC
hashed before closing the return into R134/R136 evidence. R139 remains the separate unified
capability engine and is not replaced by this wrapper.
"""
from __future__ import annotations
import hashlib,json,sys,types,urllib.request

DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
BASE_PATH='/omega-hybrid-agent.py'
BASE_IDENTITY_MARKER='OMEGA R34 local Hybrid Link agent'
PAIRING_IDENTITY_MARKER='Pairing is explicit.'
PROOF_CLOSURE_REVISION='R140'
FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R140'
MAX_BASE_BYTES=512*1024
MAX_FINGERPRINT_PAYLOAD_BYTES=512*1024

def sha_bytes(b:bytes):return hashlib.sha256(b).hexdigest()
def arg_value(name,default):
    try:
        i=sys.argv.index(name)
        return sys.argv[i+1] if i+1<len(sys.argv) else default
    except ValueError:return default

def canonical_base_source(server):
    url=server.rstrip('/')+BASE_PATH
    req=urllib.request.Request(url,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-Hybrid-R140-Wrapper/1'})
    with urllib.request.urlopen(req,timeout=30) as r:
        source=r.read(MAX_BASE_BYTES+1);declared=(r.headers.get('x-omega-agent-sha256') or '').strip().lower()
    if len(source)<1000 or len(source)>MAX_BASE_BYTES:raise RuntimeError('R140 base agent size proof failed.')
    observed=sha_bytes(source)
    if declared and declared!=observed:raise RuntimeError('R140 base agent SHA-256 mismatch.')
    text=source.decode('utf-8')
    for token in ("VERSION='R34.1'","CAPABILITY_REVISION='R132'",BASE_IDENTITY_MARKER,PAIRING_IDENTITY_MARKER,'root-confined','shell=False',"'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'"):
        if token not in text:raise RuntimeError('R140 base agent contract missing '+token)
    return text,observed

def exact_payload(core):
    payload=json.dumps(core,sort_keys=True,separators=(',',':'),ensure_ascii=False)
    if len(payload.encode('utf-8'))>MAX_FINGERPRINT_PAYLOAD_BYTES:raise RuntimeError('R140 fingerprint payload exceeds bounded proof size.')
    return payload

def load_base(server):
    source,digest=canonical_base_source(server);module=types.ModuleType('omega_hybrid_agent_r132_base');module.__file__='<canonical-omega-hybrid-agent.py>'
    exec(compile(source,module.__file__,'exec'),module.__dict__)
    return module,digest

def main():
    server=arg_value('--server',DEFAULT_SERVER).rstrip('/');base,base_digest=load_base(server);base_execute=base.execute_job
    def execute_job_r140(job,root):
        packet=base_execute(job,root)
        core={k:packet.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')}
        payload=exact_payload(core);digest=sha_bytes(payload.encode('utf-8'))
        packet.update({'resultFingerprintSchema':FINGERPRINT_SCHEMA,'resultFingerprintR140Payload':payload,'resultFingerprintR140':digest,'proofClosureRevision':PROOF_CLOSURE_REVISION,'baseAgentSha256':base_digest})
        return packet
    base.execute_job=execute_job_r140
    print('OMEGA Hybrid Link proof wrapper',PROOF_CLOSURE_REVISION,'· base',base.VERSION,'execution',base.CAPABILITY_REVISION)
    print('Exact return payload SHA-256 is enabled; legacy base transport and R139 unified capability routing remain intact.')
    base.main()

if __name__=='__main__':main()
