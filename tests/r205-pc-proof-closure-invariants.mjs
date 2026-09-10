import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const agent=read('public/omega-hybrid-agent-base-r205.py'),canonicalAgent=read('public/omega-hybrid-agent.py'),worker=read('src/workerR32.js'),html=read('public/omega-pc-proof-r205.html'),client=read('public/omega-pc-proof-r205.js'),wrangler=read('wrangler.jsonc'),r141=read('public/omega-hybrid-agent-r141.py');
const must=(ok,msg)=>assert.ok(ok,msg);
for(const token of ["VERSION='R34.1'","CAPABILITY_REVISION='R132'","R205_PROOF_EXTENSION='R205'","DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'",'root-confined','shell=False'])must(agent.includes(token),`agent lineage/safety token missing: ${token}`);
must(!agent.includes('shell=True'),'R205 may not introduce arbitrary shell execution');
for(const op of ['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER']){must(agent.includes(`op=='${op}'`),`agent execution missing ${op}`);must(agent.includes(`'${op}'`),`agent capability list missing ${op}`);must(worker.includes(`'${op}'`),`durable runtime allow-list missing ${op}`);must(client.includes(`op:'${op}'`),`R205 operator plan missing ${op}`)}
for(const token of ['OMEGA_DESKTOP_HEALTH_R205','probe_server(DEFAULT_SERVER,15)','approvedRootWriteSmoke','nonSystemRoot','canonicalHealthReachable','healthSha256'])must(agent.includes(token),`AT09 proof token missing: ${token}`);
for(const token of ['OMEGA_FORENSIC_HASH_LEDGER_R205','OMEGA_FORENSIC_HASH_LEDGER_RECEIPT_R205',"root/'.omega_hybrid'/'forensics'",'HOLD_FILE_LIMIT','HOLD_READ_ERROR','complete=not capped and not errors','ledgerSha256','scopePolicy','sha_file(p)'])must(agent.includes(token),`AT10 proof token missing: ${token}`);
must(agent.includes("for k in ('path','backupPath','macroPath','ledgerPath')"),'forensic ledger path must be preserved in returned host outputs');
for(const token of ['proofExtensions:Array.isArray(b.proofExtensions)','target.capabilities?.includes(op)','DEVICE_CAPABILITY_REQUIRED','x-omega-bridge-secret',"x.online&&!x.revoked",'nativeExecutionClaimed:online.length>0'])must(worker.includes(token),`durable fail-closed proof gate missing: ${token}`);
must(worker.includes("proofExtensions:[...new Set(online.flatMap"),'current host proof-extension projection missing');
for(const token of ['OMEGA_PC_PROOF_CLOSURE_R205','AT09','AT10','tree hash ≠ complete forensic manifest','R125 remains sole Canon admission authority'])must(html.includes(token),`R205 truth UI missing ${token}`);
for(const token of ["post('/api/missions'",'targetDeviceId:state.device.id',"allowedOps:['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER']",'confirmedMission:true',"d?.online&&!d?.revoked",'r205Capable',"health?.state==='PASS'",'ledger?.complete===true',"String(ledger?.ledgerPath||'').startsWith('.omega_hybrid/forensics/')",'Canon mutation: false · Canon admission authority: R125'])must(client.includes(token),`R205 operator/closure invariant missing ${token}`);
for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'","op:'BUILD'","op:'TEST'","op:'PACKAGE'"])must(!client.includes(forbidden),`R205 proof mission gained mutation/build operation ${forbidden}`);
for(const retired of ['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203']){must(wrangler.includes(`"${retired}": {"type": "durable-object", "state": "deleted"}`),`${retired} provider-required retirement tombstone must remain under R229`);must(!wrangler.includes(`"class_name": "${retired}"`),`${retired} regained a live binding`);must(!wrangler.includes(`"${retired}": {"type": "durable-object", "storage": "sqlite"}`),`${retired} regained live storage`)}
for(const token of ["VERSION='R34.1'","CAPABILITY_REVISION='R132'","'/api/hybrid/agent/poll'","'/api/hybrid/agent/result'"])must(r141.includes(token),`R141 base-agent proof contract no longer recognizes inherited transport token ${token}`);
for(const token of ["VERSION='R207'","BASE_PATH='/omega-hybrid-agent-base-r205.py'","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"])must(canonicalAgent.includes(token),`R207 canonical wrapper missing R205 preservation/proof token ${token}`);
const syntax=spawnSync('python3',['-B','-c',"import ast,pathlib;ast.parse(pathlib.Path('public/omega-hybrid-agent-base-r205.py').read_text())"],{encoding:'utf8'});assert.equal(syntax.status,0,`R205 agent Python syntax failed: ${syntax.stderr}`);
const simulation=spawnSync('python3',['-B','-c',String.raw`import importlib.util,json,tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('omega_r205','public/omega-hybrid-agent-base-r205.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
with tempfile.TemporaryDirectory() as td:
 root=Path(td);target=root/'project';target.mkdir();(target/'a.txt').write_text('alpha');(target/'b.bin').write_bytes(b'beta')
 m.MAX_FILES=10;r=m.forensic_hash_ledger(target,root);assert r['state']=='PASS' and r['complete'] is True and r['files']==2
 manifest=json.loads((root/r['ledgerPath']).read_text());assert len(manifest['entries'])==2 and manifest['complete'] is True and manifest['treeSha256']==r['treeSha256']
 m.MAX_FILES=1;r2=m.forensic_hash_ledger(target,root);assert r2['state']=='HOLD_FILE_LIMIT' and r2['complete'] is False and r2['files']==1
print('R205_FORENSIC_SIM_PASS')`],{encoding:'utf8'});assert.equal(simulation.status,0,`R205 forensic pass/hold simulation failed: ${simulation.stderr||simulation.stdout}`);must(simulation.stdout.includes('R205_FORENSIC_SIM_PASS'),'R205 forensic simulation receipt missing');
console.log('R205/R229 PC PROOF CLOSURE PASS · frozen R34.1/R132/R205 base retains AT09/AT10 executor proof · R207 wrapper preserved · R201/R203 tombstoned without live authority · R125 unchanged');