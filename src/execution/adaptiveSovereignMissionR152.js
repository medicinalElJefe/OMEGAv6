import {WORKERS_AI_MODEL} from '../worker.js';

export const R152_REVISION='R152';
export const R152_MISSION_SCHEMA='OMEGA_SOVEREIGN_FULL_BUILD_MISSION_R152';
export const R152_SOURCE_SCHEMA='OMEGA_SOVEREIGN_FULL_BUILD_R151';
export const R152_MAX_CYCLES=8;
export const R152_LAW='RETURNED HOST PROOF ADVANCES THE MISSION; DISCOVERY PRECEDES MUTATION; REPAIR IS READ-PROOF + PREIMAGE-SHA BOUND; PACKAGE FOLLOWS VERIFIED BUILD/TEST; COMPLETE IS NEVER INFERRED FROM QUEUE STATE';
const CODE_EXT='(?:ts|tsx|js|jsx|mjs|cjs|py|pyw|cs|css|html|json|jsonc)';
const MUTATION_OPS=new Set(['APPLY_PATCH','WRITE_TEXT']);
const MANIFEST_NAMES=new Set(['package.json','pyproject.toml','requirements.txt']);
const TERMINAL=new Set(['COMPLETE','FAILED','REPAIR_REQUIRED','HOLD_PROJECT_NOT_FOUND','HOLD_NO_DECLARED_VERIFICATION','HOLD_MAX_CYCLES','HOLD_DEVICE_PROOF','HOLD_PATCH_PROPOSAL','FAILED_PACKAGE']);
const now=()=>Date.now();
const txt=v=>String(v??'').trim();
const safeRel=v=>{const s=txt(v||'.').replace(/\\/g,'/');if(!s||s==='.')return'.';if(s.startsWith('/')||/^[A-Za-z]:/.test(s)||s.split('/').includes('..')||s.includes('\0'))return null;return s.split('/').filter(Boolean).join('/')||'.'};
const joinRel=(a,b)=>{const aa=safeRel(a),bb=safeRel(b);if(!aa||!bb)return null;if(aa==='.')return bb;if(bb==='.')return aa;return safeRel(`${aa}/${bb}`)};
const dirname=v=>{const s=safeRel(v);if(!s||s==='.')return'.';const p=s.split('/');p.pop();return p.join('/')||'.'};
const basename=v=>{const s=safeRel(v);return s?s.split('/').at(-1)||'':''};
const randomId=(prefix='job')=>{const a=new Uint8Array(4);crypto.getRandomValues(a);return `${prefix}_${now().toString(36)}_${[...a].map(x=>x.toString(16).padStart(2,'0')).join('')}`};
async function sha256(value){const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const modelText=result=>{if(!result)return'';if(typeof result==='string')return result;if(typeof result.response==='string')return result.response;if(typeof result.result?.response==='string')return result.result.response;const c=result.choices?.[0]?.message?.content;if(typeof c==='string')return c;if(Array.isArray(c))return c.map(x=>typeof x==='string'?x:(x?.text||'')).join('\n').trim();return''};
const proofFor=(job,id)=>job?.returnPacket?.stepProofs?.find?.(p=>p?.id===id)||null;
const stepFor=(job,id)=>job?.steps?.find?.(s=>s?.id===id)||null;
const isManifest=name=>MANIFEST_NAMES.has(String(name||'').toLowerCase())||/\.(?:sln|csproj)$/i.test(String(name||''));
const manifestKind=name=>{const n=String(name||'').toLowerCase();if(n==='package.json')return'NODE';if(n==='pyproject.toml'||n==='requirements.txt')return'PYTHON';if(n.endsWith('.sln')||n.endsWith('.csproj'))return'DOTNET';return'UNKNOWN'};
const manifestScore=(path,name)=>{const p=String(path||'').toLowerCase(),n=String(name||'').toLowerCase();let score=n==='package.json'?100:n==='pyproject.toml'?90:n.endsWith('.sln')?88:n.endsWith('.csproj')?84:n==='requirements.txt'?70:0;if(/omega|omegav6|canonforge/.test(p))score+=40;if(/archive|backup|old|dist|build|node_modules|\.omega_hybrid/.test(p))score-=60;return score};

export function discoverProjectR152(job){
 const found=[];
 for(const proof of job?.returnPacket?.stepProofs||[]){
  if(proof?.op!=='INDEX'||proof?.ok!==true)continue;
  const step=stepFor(job,proof.id),base=safeRel(step?.path||job?.projectPath||'.')||'.',rows=Array.isArray(proof?.result?.sample)?proof.result.sample:[];
  for(const row of rows){const rel=safeRel(row?.path);if(!rel)continue;const name=basename(rel);if(!isManifest(name))continue;const projectPath=joinRel(base,dirname(rel));if(!projectPath)continue;const manifestPath=joinRel(base,rel);found.push({path:projectPath,manifest:manifestPath,name,kind:manifestKind(name),score:manifestScore(projectPath,name)});}
 }
 found.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));return found[0]||null;
}
export function candidateRootsR152(job){
 const out=new Map();
 for(const proof of job?.returnPacket?.stepProofs||[]){
  if(proof?.op!=='INDEX'||proof?.ok!==true)continue;const step=stepFor(job,proof.id),base=safeRel(step?.path||job?.projectPath||'.')||'.',rows=Array.isArray(proof?.result?.sample)?proof.result.sample:[];
  for(const row of rows){const rel=safeRel(row?.path);if(!rel||rel==='.')continue;const top=rel.split('/')[0];if(!top||['.omega_hybrid','node_modules','dist','build','.git'].includes(top))continue;const path=joinRel(base,top);if(path&&!out.has(path))out.set(path,{path,score:(/omega|canonforge/i.test(path)?50:0)-(/archive|backup|old/i.test(path)?30:0)});}
 }
 return [...out.values()].sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).slice(0,16).map(x=>x.path);
}
export function extractErrorPathsR152(job){
 const project=safeRel(job?.projectPath||'.')||'.',source=(job?.returnPacket?.stepProofs||[]).filter(p=>p?.ok===false).map(p=>txt(p?.error)).join('\n')+'\n'+txt(job?.returnPacket?.log),re=new RegExp(`(?:^|[\\s'\"(])([A-Za-z0-9_.\\/-]+\\.${CODE_EXT})(?=[:(\\s'\"]|$)`,'g'),out=[];
 for(const m of source.matchAll(re)){let rel=safeRel(m[1]);if(!rel)continue;if(project!=='.'&&rel.startsWith(project+'/'))rel=rel.slice(project.length+1);const full=joinRel(project,rel);if(full&&!out.includes(full))out.push(full);if(out.length>=4)break;}return out;
}
export function nodeVerificationOpsR152(job){
 const proof=(job?.returnPacket?.stepProofs||[]).find(p=>p?.op==='READ_TEXT'&&p?.ok===true),raw=proof?.result?.text;if(!raw)return[];try{const scripts=JSON.parse(raw)?.scripts||{},ops=[];if(typeof scripts.build==='string'&&scripts.build.trim())ops.push('BUILD');if((typeof scripts.check==='string'&&scripts.check.trim())||(typeof scripts.test==='string'&&scripts.test.trim()))ops.push('TEST');return ops}catch{return[]}
}
function readEvidenceR152(job){
 const out=[];for(const proof of job?.returnPacket?.stepProofs||[]){if(proof?.op!=='READ_TEXT'||proof?.ok!==true)continue;const step=stepFor(job,proof.id),path=safeRel(step?.path),sha=txt(proof?.result?.sha256),text=String(proof?.result?.text||'');if(path&&/^[0-9a-f]{64}$/i.test(sha)&&text)out.push({path,sha256:sha.toLowerCase(),text:text.slice(0,30000)});}return out.slice(0,4);
}
function parseJsonObject(raw){const s=txt(raw).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)return null;try{return JSON.parse(s.slice(a,b+1))}catch{return null}}
export function validatePatchProposalR152(proposal,evidence){
 const byPath=new Map(evidence.map(e=>[e.path,e])),steps=[];for(const row of Array.isArray(proposal?.patches)?proposal.patches.slice(0,3):[]){const path=safeRel(row?.path),ev=path?byPath.get(path):null;if(!ev)continue;const replacements=[];let chars=0;for(const r of Array.isArray(row?.replacements)?row.replacements.slice(0,12):[]){const find=String(r?.find||''),replace=String(r?.replace??'');if(!find||find.length>12000||replace.length>18000)continue;const occurrences=ev.text.split(find).length-1;if(occurrences<1||occurrences>8)continue;chars+=find.length+replace.length;if(chars>90000)break;replacements.push({find,replace,occurrences});}if(replacements.length)steps.push({id:`P${String(steps.length+1).padStart(2,'0')}`,op:'APPLY_PATCH',label:'Apply AI-proposed exact replacement against returned host preimage',path,expectedSha256:ev.sha256,replacements});}return steps;
}

function verificationSteps(projectPath,ops,start=1){const steps=[{id:`S${String(start).padStart(2,'0')}`,op:'HASH_TREE',label:'Fingerprint the selected project before verification',path:projectPath,maxResults:5000}];let n=start+1;for(const op of ops){steps.push({id:`S${String(n++).padStart(2,'0')}`,op,label:op==='BUILD'?'Run the project-declared build':'Run the project-declared verification',path:projectPath,profile:'AUTO_BUILD'});}return steps}
function packageSteps(projectPath){return[{id:'S01',op:'PACKAGE',label:'Package only the successfully verified project',path:projectPath},{id:'S02',op:'SUPPORT_BUNDLE',label:'Return a bounded support/proof bundle for the verified project',path:projectPath}]}
function discoverySteps(roots){return roots.slice(0,16).map((path,i)=>({id:`D${String(i+1).padStart(2,'0')}`,op:'INDEX',label:'Inspect one host-proven candidate project root',path}))}
function missionHistory(mission,job){return[...(Array.isArray(mission.history)?mission.history:[]),{cycle:mission.cycle,stage:mission.stage,jobId:job.id,status:job.status,resultFingerprint:job.returnPacket?.resultFingerprint||null,returnedAt:job.completedAt||now()}].slice(-24)}
async function persistMission(runtime,mission){let missions=await runtime.get('missions',[]);missions=missions.map(m=>m.id===mission.id?mission:m);await runtime.put('missions',missions);return mission}
async function holdMission(runtime,mission,status,job,detail){const next={...mission,status,stage:status,currentJob:job||mission.currentJob,lastReturnedJobId:job?.id||mission.lastReturnedJobId||null,history:job?missionHistory(mission,job):mission.history||[],holdReason:detail||status,updatedAt:now()};await persistMission(runtime,next);await runtime.event('R152_MISSION_HELD',`Sovereign mission ${mission.id} held at ${status}.`,{missionId:mission.id,status,detail});return next}
async function completeMission(runtime,mission,job){const next={...mission,status:'COMPLETE',stage:'COMPLETE',currentJob:job,lastReturnedJobId:job.id,history:missionHistory(mission,job),completedAt:now(),updatedAt:now(),finalResultFingerprint:job.returnPacket?.resultFingerprint||null};await persistMission(runtime,next);await runtime.event('R152_MISSION_COMPLETE',`Sovereign mission ${mission.id} completed only after returned package proof.`,{missionId:mission.id,jobId:job.id,resultFingerprint:next.finalResultFingerprint});return next}
async function queueJobR152(runtime,mission,steps,projectPath,stage,extra={}){
 if(Number(mission.cycle||1)>=Number(mission.maxCycles||R152_MAX_CYCLES))return holdMission(runtime,mission,'HOLD_MAX_CYCLES',mission.currentJob,'The bounded mission cycle budget was exhausted; no unbounded retry is permitted.');
 const allowed=new Set(Array.isArray(mission.allowedOps)?mission.allowedOps:[]),safeSteps=[];for(const step of steps){const path=step.path?safeRel(step.path):'.';if(!allowed.has(step.op)||!path||MUTATION_OPS.has(step.op)&&(!/^[0-9a-f]{64}$/i.test(txt(step.expectedSha256))||!Array.isArray(step.replacements)))return holdMission(runtime,mission,'REPAIR_REQUIRED',mission.currentJob,`R152 rejected an unsafe or out-of-envelope ${step.op} step.`);safeSteps.push({...step,path});}
 const devices=await runtime.devices(),target=devices.find(d=>d.id===mission.targetDeviceId&&d.online&&!d.revoked);if(!target)return holdMission(runtime,mission,'HOLD_DEVICE_PROOF',mission.currentJob,'The selected PC heartbeat is no longer current.');const missing=[...new Set(safeSteps.map(s=>s.op).filter(op=>!target.capabilities?.includes(op)))];if(missing.length)return holdMission(runtime,mission,'HOLD_DEVICE_PROOF',mission.currentJob,`The current host does not advertise: ${missing.join(', ')}`);
 let jobs=await runtime.get('jobs',[]);const job={id:randomId('job'),schema:'OMEGA_SOVEREIGN_MISSION_JOB_R152',action:'MISSION_CYCLE',profile:'AUTO_BUILD',projectPath:safeRel(projectPath)||'.',instructions:`${mission.objective}\nR152 stage ${stage}. Advance only from returned host proof.`,allowedDomains:[],steps:safeSteps,targetDeviceId:target.id,targetCapabilityRevision:target.capabilityRevision||'LEGACY',status:'QUEUED',confirmed:true,queuedAt:now(),missionId:mission.id,missionCycle:Number(mission.cycle||1)+1,inputFingerprint:await sha256({missionId:mission.id,cycle:Number(mission.cycle||1)+1,stage,steps:safeSteps,targetDeviceId:target.id})};jobs.push(job);await runtime.put('jobs',jobs.slice(-120));const next={...mission,...extra,status:'ACTIVE',stage,cycle:Number(mission.cycle||1)+1,currentJobId:job.id,currentJob:job,updatedAt:now()};await persistMission(runtime,next);await runtime.event('R152_MISSION_CYCLE_QUEUED',`Sovereign mission ${mission.id} advanced to ${stage}.`,{missionId:mission.id,cycle:next.cycle,jobId:job.id,stage});return next;
}
async function proposeRepairR152(runtime,mission,job){
 const evidence=readEvidenceR152(job);if(!evidence.length||!runtime?.env?.AI)return null;const failure=txt(mission.failureEvidence).slice(-16000),system=`You repair software only from supplied returned host evidence. Return strict JSON only: {"patches":[{"path":"exact supplied path","replacements":[{"find":"exact existing text","replace":"replacement text"}]}]}. Use at most 3 files and 12 exact replacements per file. Do not invent paths, shell commands, dependencies, secrets, delete/move/rename actions, or whole-project rewrites. Preserve established functionality. If evidence is insufficient return {"patches":[]}.`;
 const user=`MISSION OBJECTIVE\n${txt(mission.objective).slice(0,5000)}\n\nFAILED BUILD/TEST EVIDENCE\n${failure}\n\nRETURNED SOURCE PREIMAGES\n${evidence.map(e=>`PATH ${e.path}\nSHA256 ${e.sha256}\nTEXT\n${e.text}`).join('\n\n').slice(0,90000)}`;try{const result=await runtime.env.AI.run(WORKERS_AI_MODEL,{messages:[{role:'system',content:system},{role:'user',content:user}],max_tokens:3200,temperature:.08,chat_template_kwargs:{enable_thinking:false}}),proposal=parseJsonObject(modelText(result)),steps=validatePatchProposalR152(proposal,evidence);return steps.length?steps:null}catch{return null}
}

export async function tagSovereignMissionR152(runtime,requestBody,mission){
 if(requestBody?.draft?.schema!==R152_SOURCE_SCHEMA||!mission?.id)return mission;let missions=await runtime.get('missions',[]),stored=missions.find(m=>m.id===mission.id)||mission,projectPath=safeRel(requestBody?.draft?.projectPath)||'.',stage=projectPath==='.'?'DISCOVERY':'BUILD_VERIFY';const tagged={...stored,schema:R152_MISSION_SCHEMA,sourceSchema:R152_SOURCE_SCHEMA,adaptiveRevision:R152_REVISION,maxCycles:Math.min(R152_MAX_CYCLES,Number(stored.maxCycles||R152_MAX_CYCLES)),stage,projectPath,repairAttempts:0,history:[],truthLaw:R152_LAW,updatedAt:now()};missions=missions.map(m=>m.id===tagged.id?tagged:m);await runtime.put('missions',missions);await runtime.event('R152_MISSION_TAGGED',`Sovereign mission ${tagged.id} bound to proof-driven adaptive continuation.`,{missionId:tagged.id,stage,maxCycles:tagged.maxCycles});return tagged;
}
export async function hydrateSovereignMissionsR152(runtime,data){const jobs=await runtime.get('jobs',[]),missions=(Array.isArray(data?.missions)?data.missions:[]).map(m=>m?.schema===R152_MISSION_SCHEMA?{...m,currentJob:jobs.find(j=>j.id===m.currentJobId)||m.currentJob}:m);return{...data,missions,adaptiveRevision:R152_REVISION,adaptiveLaw:R152_LAW}}

export async function advanceSovereignMissionR152(runtime,job){
 if(!job?.id||!job?.returnPacket)return null;let missions=await runtime.get('missions',[]),mission=missions.find(m=>m?.schema===R152_MISSION_SCHEMA&&m.currentJobId===job.id);if(!mission||TERMINAL.has(String(mission.status||'')))return mission||null;mission={...mission,currentJob:job,lastReturnedJobId:job.id,history:missionHistory(mission,job),updatedAt:now()};await persistMission(runtime,mission);if(mission.status==='PAUSED')return mission;
 const stage=String(mission.stage||''),passed=job.status==='COMPLETE';
 if(stage==='DISCOVERY'||stage==='PROJECT_DISCOVERY'){
  if(!passed)return holdMission(runtime,mission,'HOLD_PROJECT_NOT_FOUND',job,'Host discovery did not complete successfully.');const project=discoverProjectR152(job);if(project){if(project.kind==='NODE')return queueJobR152(runtime,mission,[{id:'S01',op:'HASH_TREE',label:'Fingerprint selected Node project before reading its declared scripts',path:project.path,maxResults:5000},{id:'S02',op:'READ_TEXT',label:'Read the selected package manifest from host proof',path:project.manifest}],project.path,'NODE_PREFLIGHT',{projectPath:project.path,projectManifest:project.manifest,projectKind:project.kind});const verifyOps=project.kind==='PYTHON'?['TEST']:['BUILD','TEST'];return queueJobR152(runtime,mission,verificationSteps(project.path,verifyOps),project.path,'BUILD_VERIFY',{projectPath:project.path,projectManifest:project.manifest,projectKind:project.kind,verifyOps});}
  const roots=candidateRootsR152(job);if(roots.length&&stage==='DISCOVERY')return queueJobR152(runtime,mission,discoverySteps(roots),'.','PROJECT_DISCOVERY',{candidateRoots:roots});return holdMission(runtime,mission,'HOLD_PROJECT_NOT_FOUND',job,'No buildable project manifest was proven inside the bounded discovery surface. Select a project root explicitly rather than guessing.');
 }
 if(stage==='NODE_PREFLIGHT'){
  if(!passed)return holdMission(runtime,mission,'HOLD_NO_DECLARED_VERIFICATION',job,'Node project preflight did not return readable manifest proof.');const verifyOps=nodeVerificationOpsR152(job);if(!verifyOps.length)return holdMission(runtime,mission,'HOLD_NO_DECLARED_VERIFICATION',job,'package.json did not prove a build/check/test script. OMEGA will not invent a shell command.');return queueJobR152(runtime,mission,verificationSteps(mission.projectPath,verifyOps),mission.projectPath,'BUILD_VERIFY',{verifyOps});
 }
 if(stage==='BUILD_VERIFY'||stage==='REPAIR_VERIFY'){
  if(passed)return queueJobR152(runtime,mission,packageSteps(mission.projectPath),mission.projectPath,'PACKAGE');const paths=extractErrorPathsR152(job),attempts=Number(mission.repairAttempts||0);if(attempts>=2||!paths.length)return holdMission(runtime,mission,'REPAIR_REQUIRED',job,attempts>=2?'Two bounded repair attempts were exhausted. Returned failure proof is preserved for operator review.':'Build/test failed but did not prove a safe source path to read. No guessed mutation was attempted.');const readSteps=paths.map((path,i)=>({id:`R${String(i+1).padStart(2,'0')}`,op:'READ_TEXT',label:'Read only a source path named by returned failure proof',path}));const failureEvidence=(job.returnPacket?.stepProofs||[]).filter(p=>p?.ok===false).map(p=>txt(p.error)).join('\n')+'\n'+txt(job.returnPacket?.log);return queueJobR152(runtime,mission,readSteps,mission.projectPath,'REPAIR_READ',{failureEvidence:failureEvidence.slice(-20000)});
 }
 if(stage==='REPAIR_READ'){
  if(!passed)return holdMission(runtime,mission,'REPAIR_REQUIRED',job,'Source preimage read failed; mutation is forbidden without exact returned preimage proof.');const patches=await proposeRepairR152(runtime,mission,job);if(!patches?.length)return holdMission(runtime,mission,'HOLD_PATCH_PROPOSAL',job,'Workers AI did not produce an exact patch that validated against returned source preimages. No mutation occurred.');const verifyOps=Array.isArray(mission.verifyOps)&&mission.verifyOps.length?mission.verifyOps:['BUILD','TEST'],steps=[...patches,...verificationSteps(mission.projectPath,verifyOps,patches.length+1)];return queueJobR152(runtime,mission,steps,mission.projectPath,'REPAIR_VERIFY',{repairAttempts:Number(mission.repairAttempts||0)+1});
 }
 if(stage==='PACKAGE')return passed?completeMission(runtime,mission,job):holdMission(runtime,mission,'FAILED_PACKAGE',job,'Verified code returned a package/support-bundle failure; build truth remains separate from package truth.');
 return holdMission(runtime,mission,'REPAIR_REQUIRED',job,`Unknown adaptive stage ${stage}; no guessed continuation was queued.`);
}
export async function resumeSovereignMissionR152(runtime,mission){if(mission?.schema!==R152_MISSION_SCHEMA||mission.status!=='ACTIVE')return mission;const jobs=await runtime.get('jobs',[]),job=jobs.find(j=>j.id===mission.currentJobId);if(job?.returnPacket&&['COMPLETE','FAILED'].includes(job.status))return advanceSovereignMissionR152(runtime,job);return mission}
export function manifestR152(){return{revision:R152_REVISION,schema:R152_MISSION_SCHEMA,maxCycles:R152_MAX_CYCLES,law:R152_LAW,stages:['DISCOVERY','PROJECT_DISCOVERY','NODE_PREFLIGHT','BUILD_VERIFY','REPAIR_READ','REPAIR_VERIFY','PACKAGE','COMPLETE'],repair:{maxAttempts:2,requiresReturnedReadPreimage:true,exactReplacementOnly:true,aiCanProposeButCannotBypassValidation:true},canonicalMutation:false,canonicalAdmissionAuthority:'R125'}}
