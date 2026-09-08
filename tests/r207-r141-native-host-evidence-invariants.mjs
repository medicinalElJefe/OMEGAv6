import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const canonical=read('public/omega-hybrid-agent.py');
const wrapper=read('public/omega-hybrid-agent-r207.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const worker=read('src/workerR101.js');
const r141=read('src/hybridProofClosureR141.js');
const must=(ok,msg)=>assert.ok(ok,msg);
assert.equal(canonical,wrapper,'R207 canonical asset must be byte-identical to the explicit R207 wrapper');
assert.equal(sha(base),'49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046','R205 immutable base bytes drifted from production-proven SHA-256');
for(const token of ["VERSION='R207'","BASE_TRANSPORT_VERSION='R34.1'","BASE_CAPABILITY_REVISION='R132'","BASE_PROOF_EXTENSION='R205'","PROOF_CLOSURE_REVISION='R141'","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'","BASE_PATH='/omega-hybrid-agent-base-r205.py'",'canonical_json','exact_payload','wrap_packet'])must(wrapper.includes(token),`R207 wrapper missing ${token}`);
for(const token of ["VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'",'DESKTOP_HEALTH','FORENSIC_HASH_LEDGER','root-confined','shell=False'])must(base.includes(token),`frozen R205 base missing ${token}`);
must(!wrapper.includes('shell=True')&&!base.includes('shell=True'),'R207/R205 may not enable arbitrary shell execution');
must(!wrapper.includes("op=='APPLY_PATCH'")&&!wrapper.includes("op=='WRITE_TEXT'")&&!wrapper.includes("op=='BUILD'"),'R207 wrapper must not create a second operation implementation/allow-list');
for(const token of ["CANONICAL_AGENT_ASSET='/omega-hybrid-agent-r207.py'","IMMUTABLE_BASE_AGENT_ASSET='/omega-hybrid-agent-base-r205.py'","source.includes(\"VERSION='R207'\")","source.includes(\"FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'\")","'x-omega-agent-proof-closure':'R141'","'x-omega-agent-base-revision':'R205'"])must(worker.includes(token),`R207 canonical download authority missing ${token}`);
for(const token of ['EXACT_AGENT_PAYLOAD_SHA_AND_SEMANTIC_EQUALITY_REQUIRED_BEFORE_PROOF','resultFingerprintR141Payload','semanticMatch','R141_FINGERPRINT_VERIFIED','R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'])must(r141.includes(token),`R141 semantic verification boundary missing ${token}`);
const syntax=spawnSync('python3',['-c',"import ast,pathlib;[ast.parse(pathlib.Path(p).read_text()) for p in ['public/omega-hybrid-agent.py','public/omega-hybrid-agent-base-r205.py']]"],{encoding:'utf8'});assert.equal(syntax.status,0,`R207/R205 Python syntax failed: ${syntax.stderr}`);
const simulation=spawnSync('python3',['-c',String.raw`import importlib.util,hashlib,json
spec=importlib.util.spec_from_file_location('r207','public/omega-hybrid-agent.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
packet={'jobId':'job_r207_001','ok':True,'stepProofs':[{'id':'S01','op':'DESKTOP_HEALTH','ok':True,'result':{'schema':'OMEGA_DESKTOP_HEALTH_R205','state':'PASS'}}],'outputPaths':[],'log':'','evaluation':None,'promotion':None,'capabilityRevision':'R132','proofExtensions':['R205'],'resultFingerprint':'legacy'}
out=m.wrap_packet(packet,'a'*64);core={k:out.get(k) for k in ('jobId','ok','stepProofs','outputPaths','log','evaluation','promotion','capabilityRevision')};payload=json.dumps(core,sort_keys=True,separators=(',',':'),ensure_ascii=False);assert out['resultFingerprintSchema']=='OMEGA_AGENT_RETURN_FINGERPRINT_R141';assert out['resultFingerprintR141Payload']==payload;assert out['resultFingerprintR141']==hashlib.sha256(payload.encode()).hexdigest();assert out['proofClosureRevision']=='R141';assert out['baseAgentSha256']=='a'*64;assert out['proofExtensions']==['R205','R207'];assert out['resultFingerprint']=='legacy';print('R207_R141_ENVELOPE_SIM_PASS')`],{encoding:'utf8'});assert.equal(simulation.status,0,`R207 R141 envelope simulation failed: ${simulation.stderr||simulation.stdout}`);must(simulation.stdout.includes('R207_R141_ENVELOPE_SIM_PASS'),'R207 simulation receipt missing');
console.log('R207 R141-NATIVE HOST EVIDENCE PASS · immutable R205 executor bytes · exact semantic return envelope · no expanded execution authority · R125 preserved');
