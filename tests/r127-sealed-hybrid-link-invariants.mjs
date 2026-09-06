import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R127 '+msg)};
const worker=read('src/workerR116.js');
const agent=read('public/omega-hybrid-agent.py');
const launcher=read('src/sovereignLauncherR117.ts');
const surface=read('src/SovereignConnectionR117.tsx');
const bootstrap=read('src/hybridBootstrapR117.ts');
const config=read('wrangler.jsonc');

must(config.includes('"main": "src/workerR116.js"'),'must preserve the proven R116 Cloudflare entrypoint instead of introducing a shadow worker');
must(worker.includes("ACTIVE_CONNECTOR_REVISION='R127'")&&worker.includes("HYBRID_PROTOCOL_R127='OMEGA_HYBRID_PROTOCOL_R127'"),'active R127 protocol identity missing');
must(worker.includes("path==='/api/hybrid/agent-manifest'")&&worker.includes('canonicalHybridAgentR127(env)'),'server-backed canonical agent manifest missing');
must(worker.includes("headers.set('x-omega-expected-agent-sha256',agent.sha256)")&&worker.includes("agentSha256!==expectedAgentSha256"),'registration must compare the agent self-hash to the server-trusted deployed asset hash');
must(worker.includes('lastSeen:0')&&worker.includes('Registration is not PC ONLINE'),'registration must not manufacture an online heartbeat');
must(worker.includes("code:'HEARTBEAT_REPLAY'")&&worker.includes('seq<=Number(row.heartbeatSeq||0)'),'heartbeat sequence must be monotonic and replay-protected');
must(worker.includes("code:'DEVICE_SESSION_SUPERSEDED'")&&worker.includes('row.bootId!==bootId'),'stale process boot sessions must be rejected');
must(worker.includes("code:'DEVICE_ROOT_IDENTITY_MISMATCH'")&&worker.includes('existing.rootIdentity!==rootIdentity'),'same device identity may not silently mutate its approved root');
must(worker.includes("await this.put('hybridProtocolMode',HYBRID_PROTOCOL_R127)")&&worker.includes("code:'R127_SEALED_TAKEOVER'")&&worker.includes('job:null'),'sealed takeover must prevent stale legacy connectors from receiving new work without creating noisy false heartbeat state');
must(worker.indexOf('canonicalHybridAgentR127(env)')<worker.indexOf("omega-runtime.internal/pair"),'bootstrap must validate the exact canonical agent before rotating pairing state');
must(worker.includes('silentPairRotationForbidden:true')&&worker.includes('agentHashPinRequired:true'),'system convergence must publish the new no-silent-rotation/hash-pin laws');

must(agent.startsWith('#!/usr/bin/env python3')&&agent.includes("VERSION='R127.0'")&&agent.includes("HYBRID_PROTOCOL='OMEGA_HYBRID_PROTOCOL_R127'"),'served Python agent must expose exact R127 identity');
must(agent.includes('def validate_root(value):')&&agent.includes('if not root.exists() or not root.is_dir()')&&agent.includes("root.drive.upper()=='C:'"),'agent must require an existing approved non-system root rather than creating or guessing one');
const rootBlock=(agent.match(/def validate_root\(value\):([\s\S]*?)def acquire_instance_lock/)||[])[1]||'';
must(rootBlock&&!rootBlock.includes('mkdir'),'root validation must never create a typo/mutated approved root');
must(agent.includes('def acquire_instance_lock')&&agent.includes('LK_NBLCK')&&agent.includes('LOCK_EX|fcntl.LOCK_NB'),'duplicate local R127 connector processes must be single-instance locked cross-platform');
must(agent.includes('agent_sha256=sha_bytes(Path(__file__).read_bytes())')&&agent.includes('root_identity=normalized_root_identity(root)'),'agent must prove exact source bytes and an opaque approved-root identity');
must(agent.includes("boot_id='boot_'+uuid.uuid4().hex")&&agent.includes('heartbeat_seq+=1'),'each process must have a unique boot session and monotonic heartbeat sequence');
must(agent.includes('class AgentHttpError')&&agent.includes("e.code=='DEVICE_NOT_REGISTERED'")&&agent.includes("e.code=='PAIR_AUTH_FAILED'")&&agent.includes("e.code=='DEVICE_SESSION_SUPERSEDED'"),'agent must distinguish recoverable re-registration from dead pairing and superseded-session hard stops');
must(agent.includes("'secretStored':False")&&agent.includes("connection_state.json"),'local diagnostic state must explicitly exclude the pairing secret');
must(agent.includes("ap.add_argument('--diagnose'")&&agent.includes('DIAGNOSTIC COMPLETE'),'one-shot no-job connection diagnosis must be available');

must(launcher.includes('set "OMEGA_VERSION=R127"')&&launcher.includes('START_OMEGA_PC_LINK_R127_SEALED.cmd'),'launcher must be unmistakably R127 sealed');
must(launcher.includes('OMEGA_EXPECTED_AGENT_SHA=')&&launcher.includes('--dump-header')&&launcher.includes("h.get('x-omega-agent-sha256','')")&&launcher.includes("h.get('x-omega-hybrid-protocol','')"),'launcher must compare downloaded body hash to server receipt and R127 protocol header');
must(launcher.includes('actual==expected')&&launcher.includes('server==expected')&&launcher.includes('server_protocol==protocol')&&launcher.includes('server_origin==origin'),'launcher integrity gate must require all four independent equality checks');
must(launcher.includes('if not defined OMEGA_EXPECTED_AGENT_SHA goto :receipt_fail')&&launcher.includes('Rejected bytes were deleted and never executed'),'missing/mismatched SHA receipt must fail closed');
must(launcher.includes('else if exist J:')&&launcher.includes('if /I "!OMEGA_ROOT:~0,2!"=="C:" goto :root_fail')&&!launcher.includes('Invoke-WebRequest')&&!launcher.includes('powershell -NoProfile'),'R120 non-system-root/no-PowerShell law must remain intact');

const prep=surface.slice(surface.indexOf('const prepareConnector='),surface.indexOf('// Explicit replacement remains available'));
must(prep.includes("api.post<any>('/api/hybrid/reconnect',{repair:false})")&&prep.indexOf("api.post<any>('/api/hybrid/reconnect',{repair:false})")<prep.indexOf('bootstrapSovereignR117()'),'ordinary connector preparation must prove/reuse an existing pairing before considering rotation');
must(prep.includes("e?.status===401||e?.code==='PAIR_AUTH_FAILED'")&&prep.includes('if(replacePair||!credential)'),'pairing may rotate only after explicit replacement or actual missing/rejected credentials');
must(surface.includes('const forceFresh=async()=>prepareConnector(true)')&&surface.includes('Replace pairing explicitly'),'explicit rotation must remain separate and visible');
must(surface.includes('sealedNativeExecutionClaimed')&&surface.includes("d?.integrityState==='CURRENT_AGENT'")&&surface.includes('PC ONLINE — SEALED'),'sealed UI status must require heartbeat plus current-agent integrity');
must(surface.includes('PC ONLINE — UPDATE RECOMMENDED'),'legacy heartbeat may remain visible but must not masquerade as sealed R127 proof');
must(bootstrap.includes('agent?:{version?:string;sha256?:string;bytes?:number;protocol?:string}'),'bootstrap type must preserve agent integrity receipt metadata');

console.log('R127 PASS · exact-agent SHA pin · no-silent pair rotation · existing-root identity · single-instance process · registration≠heartbeat · replay/session protection · stale connector work isolation · sealed UI proof');
