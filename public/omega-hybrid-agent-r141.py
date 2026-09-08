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
"""
from __future__ import annotations
import hashlib,json,sys,types,urllib.request

DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
LEGACY_BASE_PATH_R141='/omega-hybrid-agent.py'
BASE_PATH='/omega-hybrid-agent-base-r205.py'
EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'
BASE_IDENTITY_MARKER='OMEGA R34 local Hybrid Link agent'
PAIRING_IDENTITY_MARKER='Pairing is explicit.'
PROOF_CLOSURE_REVISION='R141'
HOST_PROOF_EXTENSION='R205'
HOST_EVIDENCE_CONTINUITY_REVISION='R206.1'
FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'
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
    req=urllib.request.Request(url,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-Hybrid-R141-R206.1-R207-Wrapper/1'})
    with urllib.request.urlopen(req,timeout=30) as r:
        source=r.read(MAX_BASE_BYTES+1)
    if len(source)<1000 or len(source)>MAX_BASE_BYTES:raise RuntimeError('R141 base agent size proof failed.')
    observed=sha_bytes(source)
    if observed!=EXPECTED_BASE_SHA256:raise RuntimeError('R141/R207 immutable R205 base SHA-256 mismatch.')
    text=source.decode('utf-8')
    required=("VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",BASE_IDENTITY_MARKER,PAIRING_IDENTITY_MARKER,'root-confined','shell=False',"'DESKTOP_HEALTH'","'FORENSIC_HASH_LEDGER'",'proofExtensions',"'/api/hybrid/agent/heartbeat'","'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'")
    for token in required:
        if token not in text:raise RuntimeError('R141/R206.1/R207 base agent contract missing '+token)
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

def main():
    server=arg_value('--server',DEFAULT_SERVER).rstrip('/');base,base_digest=load_base(server);base_execute=base.execute_job
    def execute_job_r141(job,root):
        packet=base_execute(job,root)
        core={k:packet.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')}
        payload=exact_payload(core);digest=sha_bytes(payload.encode('utf-8'))
        packet.update({'resultFingerprintSchema':FINGERPRINT_SCHEMA,'resultFingerprintR141Payload':payload,'resultFingerprintR141':digest,'proofClosureRevision':PROOF_CLOSURE_REVISION,'baseAgentSha256':base_digest})
        return packet
    base.execute_job=execute_job_r141
    print('OMEGA Hybrid Link proof wrapper',PROOF_CLOSURE_REVISION,'· immutable base',base.VERSION,'execution',base.CAPABILITY_REVISION,'host proof',HOST_PROOF_EXTENSION,'continuity',HOST_EVIDENCE_CONTINUITY_REVISION)
    print('Exact return payload SHA-256 is enabled; R205 host proof, R206/R206.1 continuity and R125 admission boundaries remain intact.')
    base.main()

if __name__=='__main__':main()
