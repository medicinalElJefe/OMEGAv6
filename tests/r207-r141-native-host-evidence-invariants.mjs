import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const canonical=read('public/omega-hybrid-agent.py');
const wrapper=read('public/omega-hybrid-agent-r207.py');
const proofWrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const worker=read('src/workerR101.js');
const worker116=read('src/workerR116.js');
const r141=read('src/hybridProofClosureR141.js');
const must=(ok,msg)=>assert.ok(ok,msg);
const baseSha='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046';
assert.equal(canonical,wrapper,'R207 canonical asset must be byte-identical to the explicit R207 wrapper');
assert.equal(sha(base),baseSha,'R205 immutable base bytes drifted from production-proven SHA-256');
for(const token of ["VERSION='R207'","BASE_TRANSPORT_VERSION='R34.1'","BASE_CAPABILITY_REVISION='R132'","BASE_PROOF_EXTENSION='R205'","PROOF_CLOSURE_REVISION='R141'","R207_PROOF_EXTENSION='R207'","EXECUTION_MOTION_EXTENSION='R243'","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'","BASE_PATH='/omega-hybrid-agent-base-r205.py'",`EXPECTED_BASE_SHA256='${baseSha}'`,'if digest!=EXPECTED_BASE_SHA256','R207 immutable R205 base SHA-256 mismatch','REQUIRED_BASE_CONTRACT_TOKENS','canonical_json','exact_payload','wrap_packet','OMEGA Hybrid Link agent compatibility signature','PROGRESS_INTERVAL_SECONDS=3.0',"'/api/hybrid/agent/progress'"])must(wrapper.includes(token),`R207/R243 wrapper missing ${token}`);
for(const token of ["VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",'DESKTOP_HEALTH','FORENSIC_HASH_LEDGER','root-confined','shell=False'])must(base.includes(token),`frozen R205 base missing ${token}`);
must(!wrapper.includes('shell=True')&&!base.includes('shell=True'),'R207/R205 may not enable arbitrary shell execution');
for(const implementation of ['apply_patch','write_text','build','desktop_health','forensic_hash_ledger'])must(!new RegExp(`^\\s*def\\s+${implementation}\\s*\\(`,'m').test(wrapper),`R207 wrapper must not create a second executor implementation: def ${implementation}(`);
for(const token of ["CANONICAL_AGENT_ASSET='/omega-hybrid-agent-r207.py'","IMMUTABLE_BASE_AGENT_ASSET='/omega-hybrid-agent-base-r205.py'","source.includes(\"VERSION='R207'\")","source.includes(\"FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'\")","'x-omega-agent-proof-closure':'R141'","'x-omega-agent-base-revision':'R205'","EXECUTION_MOTION_REVISION='R243'"])must(worker.includes(token),`R207/R243 canonical download authority missing ${token}`);
for(const token of ["BASE_PATH='/omega-hybrid-agent-base-r205.py'",`EXPECTED_BASE_SHA256='${baseSha}'`,'R141/R207 immutable R205 base SHA-256 mismatch',"'/api/hybrid/agent/heartbeat'",'HOST_EVIDENCE_CONTINUITY_REVISION=\'R206.1\''])must(proofWrapper.includes(token),`R117/R141 launcher proof wrapper missing direct immutable-base gate ${token}`);
must(worker116.includes("url.searchParams.get('r117')==='1'")&&worker116.includes("'/omega-hybrid-agent-r141.py'"),'R117 launcher path must remain explicitly routed through the R141 proof wrapper');
for(const token of ['EXACT_AGENT_PAYLOAD_SHA_AND_SEMANTIC_EQUALITY_REQUIRED_BEFORE_PROOF','resultFingerprintR141Payload','semanticMatch','R141_FINGERPRINT_VERIFIED','R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'])must(r141.includes(token),`R141 semantic verification boundary missing ${token}`);
const syntax=spawnSync('python3',['-c',"import ast,pathlib;[ast.parse(pathlib.Path(p).read_text()) for p in ['public/omega-hybrid-agent.py','public/omega-hybrid-agent-r207.py','public/omega-hybrid-agent-r141.py','public/omega-hybrid-agent-base-r205.py']]"],{encoding:'utf8'});assert.equal(syntax.status,0,`R207/R243/R141/R205 Python syntax failed: ${syntax.stderr}`);
const simulation=spawnSync('python3',['-c',String.raw`import importlib.util,hashlib,json
spec=importlib.util.spec_from_file_location('r207','public/omega-hybrid-agent.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.EXPECTED_BASE_SHA256=='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'
assert m.EXECUTION_MOTION_EXTENSION=='R243'
packet={'jobId':'job_r207_001','ok':True,'stepProofs':[{'id':'S01','op':'DESKTOP_HEALTH','ok':True,'result':{'schema':'OMEGA_DESKTOP_HEALTH_R205','state':'PASS'}}],'outputPaths':[],'log':'','evaluation':None,'promotion':None,'capabilityRevision':'R132','proofExtensions':['R205'],'resultFingerprint':'legacy'}
out=m.wrap_packet(packet,m.EXPECTED_BASE_SHA256);core={k:out.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')};payload=json.dumps(core,sort_keys=True,separators=(',',':'),ensure_ascii=False);assert out['resultFingerprintSchema']=='OMEGA_AGENT_RETURN_FINGERPRINT_R141';assert out['resultFingerprintR141Payload']==payload;assert out['resultFingerprintR141']==hashlib.sha256(payload.encode()).hexdigest();assert out['proofClosureRevision']=='R141';assert out['baseAgentSha256']==m.EXPECTED_BASE_SHA256;assert out['proofExtensions']==['R205','R207','R243'];assert out['resultFingerprint']=='legacy';print('R207_R141_R243_ENVELOPE_SIM_PASS')`],{encoding:'utf8'});assert.equal(simulation.status,0,`R207/R243 R141 envelope simulation failed: ${simulation.stderr||simulation.stdout}`);must(simulation.stdout.includes('R207_R141_R243_ENVELOPE_SIM_PASS'),'R207/R243 simulation receipt missing');
console.log('R207/R243 R141-NATIVE HOST EVIDENCE PASS · canonical and explicit R207 assets byte-identical · runtime-pinned immutable R205 executor SHA · R243 motion extension additive · R117/R141 direct-base path preserved · exact semantic return envelope · no expanded execution authority · R125 preserved');
await import('./r2071-r141-asset-validator-repair-invariants.mjs');
