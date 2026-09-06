import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R127 invariant failed: ${msg}`)};
const launcher=read('src/sovereignLauncherR117.ts');
const surface=read('src/SovereignConnectionR117.tsx');
const worker=read('src/workerR101.js');
const agent=read('public/omega-hybrid-agent.py');

must(launcher.includes("const ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'"),'connector must have one canonical control origin');
must(!launcher.includes('omega-sovereign-convergence.foundasound.chatgpt.site/omega-hybrid-agent.py'),'retired preview download path must not exist');
must(launcher.includes('R127_ZERO_DRIFT_SHA256'),'R127 zero-drift validator must be active');
must(launcher.includes('OMEGA_SOVEREIGN\\\\R127'),'runtime must be isolated under the R127 approved-root namespace');
must(launcher.includes('if /I "!OMEGA_ROOT:~0,2!"=="C:" goto :root_fail'),'C: runtime fallback must remain forbidden');
must(launcher.includes('OMEGA_AGENT_PART')&&launcher.includes('.part'),'agent download must be quarantined before promotion');
must(launcher.includes('--dump-header')&&launcher.includes('x-omega-agent-sha256'),'connector must consume server-declared agent digest');
must(launcher.includes('hashlib.sha256(b).hexdigest()')&&launcher.includes('server==local'),'local bytes must exactly match the server SHA-256');
must(launcher.includes("needle='DEFAULT_SERVER='+chr(39)+'https://omegav6.jeffdeweyeljefe.workers.dev'+chr(39)"),'canonical agent identity needle must avoid nested cmd double quotes');
must(!launcher.includes('\\"DEFAULT_SERVER=\'https://omegav6.jeffdeweyeljefe.workers.dev\'\\" in s'),'known cmd quote-stripping validator defect must never return');
must(launcher.includes('-m py_compile "!OMEGA_AGENT_PART!"'),'quarantined exact download must pass parser preflight before promotion');
must(launcher.includes('move /y "!OMEGA_AGENT_PART!" "!OMEGA_AGENT!"'),'validated agent must be promoted atomically after verification');
const compileIndex=launcher.indexOf('-m py_compile "!OMEGA_AGENT_PART!"');
const promoteIndex=launcher.indexOf('move /y "!OMEGA_AGENT_PART!" "!OMEGA_AGENT!"');
must(compileIndex>=0&&promoteIndex>compileIndex,'parser preflight must occur before replacing the previous validated agent');
must(launcher.includes('Existing validated agent was not replaced.'),'compile failure must explicitly preserve the prior validated agent');
must(launcher.includes('if "!OMEGA_EXIT!"=="22" goto :auth_stop'),'auth failure must be terminal rather than blindly retried');
must(launcher.includes('if "!OMEGA_EXIT!"=="21" goto :transient_retry'),'only canonical reachability may use bounded retry');
must(launcher.includes('if !OMEGA_RETRY! GTR 4 goto :retry_exhausted'),'transient retry must be bounded');
must(launcher.includes('No fallback host was attempted'),'failure path must not mutate onto another control host');
must(launcher.includes('No downloaded bytes were executed'),'failed download must remain non-executable');

const validatorStart='!OMEGA_PY! -B -c \\"';
const validatorEnd='\\" \\"!OMEGA_AGENT_PART!\\" \\"!OMEGA_AGENT_HEADERS!\\"';
const validatorOffset=launcher.indexOf(validatorStart);
must(validatorOffset>=0,'generated SHA validator command must be discoverable');
const payloadStart=validatorOffset+validatorStart.length;
const payloadEnd=launcher.indexOf(validatorEnd,payloadStart);
must(payloadEnd>payloadStart,'generated SHA validator payload boundary must remain stable');
const sourcePayload=launcher.slice(payloadStart,payloadEnd);
must(!sourcePayload.includes('\\"'),'inline validator payload must contain no nested double quote that cmd.exe can strip');
const pythonPayload=sourcePayload.replaceAll('\\\\','\\');
const fixtureDir=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r127-validator-'));
try{
 const fixtureAgent=path.join(fixtureDir,'omega-hybrid-agent.py');
 const fixtureHeaders=path.join(fixtureDir,'headers.txt');
 const fixture="#!/usr/bin/env python3\n# OMEGA R34 local Hybrid Link agent\nDEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'\n# Pairing is explicit.\n"+'# validator fixture padding\n'.repeat(60);
 fs.writeFileSync(fixtureAgent,fixture,'utf8');
 const digest=createHash('sha256').update(fs.readFileSync(fixtureAgent)).digest('hex');
 fs.writeFileSync(fixtureHeaders,`HTTP/1.1 200 OK\r\nx-omega-agent-sha256: ${digest}\r\n`,'utf8');
 const proof=spawnSync('python3',['-B','-c',pythonPayload,fixtureAgent,fixtureHeaders],{encoding:'utf8'});
 must(proof.status===0,`generated SHA validator must execute successfully under Python: ${(proof.stderr||proof.stdout||'NO_OUTPUT').trim()}`);
 must((proof.stdout||'').includes('identity+digest: PASS'),'generated SHA validator must prove identity and exact digest');
 const compileProof=spawnSync('python3',['-B','-m','py_compile',fixtureAgent],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONPYCACHEPREFIX:path.join(fixtureDir,'pycache')}});
 must(compileProof.status===0,`quarantine parser preflight must accept known-good agent bytes: ${(compileProof.stderr||compileProof.stdout||'NO_OUTPUT').trim()}`);
}finally{fs.rmSync(fixtureDir,{recursive:true,force:true})}

must(surface.includes('R127 ZERO DRIFT'),'operator surface must name the active connector law');
must(surface.includes('DOWNLOAD R127 ZERO-DRIFT CONNECTOR'),'operator path must expose the hardened connector');
must(surface.includes('Credential issuance is not host proof')&&surface.includes('PC ONLINE requires a current authenticated heartbeat'),'UI must preserve proof-before-online truth boundary');
must(surface.includes('server-declared SHA-256'),'UI must explain byte-integrity validation');

must(worker.includes("path==='/api/hybrid/connector-manifest'"),'canonical connector manifest route must exist');
must(worker.includes("schema:'OMEGA_HYBRID_CONNECTOR_MANIFEST_R127'"),'manifest schema must be R127');
must(worker.includes("'x-omega-agent-sha256':a.digest"),'agent download must publish exact SHA-256');
must(worker.includes("'x-omega-hybrid-protocol':'R127_ZERO_DRIFT_SHA256'"),'download must publish protocol identity');
must(worker.includes('heartbeatFreshnessWindowMs:HEARTBEAT_FRESH_MS'),'status must expose heartbeat freshness semantics');
must(worker.includes('nativeExecutionClaimed:online.length>0'),'native execution claim must remain tied to current online device proof');
must(worker.includes('controlHostFallback:false')&&worker.includes('systemDriveRuntimeFallback:false'),'manifest/status must prohibit silent fallback');

must(agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'"),'agent itself must default to canonical OMEGAv6');
must(agent.includes('Path escapes approved root.'),'agent must retain root confinement');
must(agent.includes("'/api/hybrid/agent/heartbeat'"),'agent must retain authenticated heartbeat route');
must(agent.includes('Browser may now truthfully show PC ONLINE'),'agent must not claim online before accepted heartbeat');
must(agent.includes("CAPABILITY_REVISION='R132'")&&!agent.includes('requires the optional signed desktop automation adapter'),'R132 successor must replace the former deliberate automation refusal without weakening transport identity');
for(const fn of ['assert_window','click_mouse','send_key','type_text','scroll_mouse','read_visible_text','record_macro','replay_macro'])must(agent.includes('def '+fn+'('),`R132 real desktop execution missing ${fn}`);
must(agent.includes('shell=False')&&agent.includes('assert_window(title)'),'desktop execution must remain non-shell and foreground-window locked');

console.log('R127/R148 HYBRID ZERO-DRIFT PASS · one canonical host · approved-root confinement · quarantined SHA-256 download · generated validator execution proof · quarantine parser preflight before atomic promotion · heartbeat-only PC ONLINE · real proof-bound desktop execution · no silent fallback');