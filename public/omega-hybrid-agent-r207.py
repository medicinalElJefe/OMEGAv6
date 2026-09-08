#!/usr/bin/env python3
"""OMEGA R207 canonical Hybrid Link proof wrapper.

R207 preserves the proven R34.1/R132/R205 executor as an immutable downloaded base
and adds the exact R141 return-payload fingerprint envelope required by the canonical
Worker proof-closure path. The wrapper does not widen the operation allow-list, root
boundary, shell policy, pairing authority, heartbeat truth, Canon authority, or solver
claims. Pairing is explicit.
"""
from __future__ import annotations
import hashlib,json,sys,types,urllib.request

VERSION='R207'
BASE_TRANSPORT_VERSION='R34.1'
BASE_CAPABILITY_REVISION='R132'
BASE_PROOF_EXTENSION='R205'
PROOF_CLOSURE_REVISION='R141'
R207_PROOF_EXTENSION='R207'
FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
BASE_PATH='/omega-hybrid-agent-base-r205.py'
BASE_IDENTITY_MARKER='OMEGA R34 local Hybrid Link agent'
PAIRING_IDENTITY_MARKER='Pairing is explicit.'
MAX_BASE_BYTES=512*1024
MAX_FINGERPRINT_PAYLOAD_BYTES=512*1024

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
    req=urllib.request.Request(url,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-Hybrid-R207-Wrapper/1'})
    with urllib.request.urlopen(req,timeout=30) as r:
        source=r.read(MAX_BASE_BYTES+1)
    if len(source)<1000 or len(source)>MAX_BASE_BYTES:raise RuntimeError('R207 base agent size proof failed.')
    text=source.decode('utf-8')
    for token in ("VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",BASE_IDENTITY_MARKER,PAIRING_IDENTITY_MARKER,'root-confined','shell=False',"'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'",'DESKTOP_HEALTH','FORENSIC_HASH_LEDGER'):
        if token not in text:raise RuntimeError('R207 base agent contract missing '+token)
    return text,sha_bytes(source)

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
        'proofExtensions':list(dict.fromkeys(list(packet.get('proofExtensions') or [])+[BASE_PROOF_EXTENSION,R207_PROOF_EXTENSION]))
    })
    return packet

def main():
    server=arg_value('--server',DEFAULT_SERVER).rstrip('/')
    base,base_digest=load_base(server)
    base_execute=base.execute_job
    base_capabilities=base.capabilities
    def execute_job_r207(job,root):return wrap_packet(base_execute(job,root),base_digest)
    def capabilities_r207():return base_capabilities()
    base.execute_job=execute_job_r207
    base.capabilities=capabilities_r207
    original_main=base.main
    print('OMEGA Hybrid Link proof wrapper',VERSION,'· base',base.VERSION,'execution',base.CAPABILITY_REVISION,'proof',BASE_PROOF_EXTENSION,'→',PROOF_CLOSURE_REVISION)
    print('Exact R141 semantic return fingerprint enabled. R125 remains sole CanonState admission authority.')
    original_main()

if __name__=='__main__':main()
