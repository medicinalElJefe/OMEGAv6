import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const APPLY=process.env.OMEGA_R125_APPLY==='1';
const RUNS_PATH=process.env.OMEGA_R125_RUNS_PATH||'/tmp/omega-r125-runs.json';
const EXECUTION_EVIDENCE_PATH=process.env.OMEGA_R143_EXECUTION_EVIDENCE_PATH||'';
const R124='public/omega-r124-selfbuild-state.json';
const OUT='public/omega-r125-accuracy-state.json';
const PROPOSAL='public/omega-r125-proposal.json';
const now=new Date().toISOString();
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const exists=p=>fs.existsSync(p);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const evidence=(kind,source,claim,value=true,verified=true,observedAt=now)=>({id:hash({kind,source,claim,value,observedAt}).slice(0,20),kind,source,observedAt,claim,verified,value});
const residuals=[];

const s124=exists(R124)?readJson(R124):null;
if(!s124){residuals.push({id:'R-R124-STATE-MISSING',kind:'INVARIANT_GAP',severity:'CRITICAL',summary:'R124 authority state is missing.',evidence:[evidence('SOURCE',R124,'required authority state file exists',false,true)],affected:[R124],reproducible:true});}

if(s124){
 const roadmap=Array.isArray(s124.roadmap)?s124.roadmap:[];
 const admitted=new Set(s124.admitted||[]);
 const admittedRows=roadmap.filter(x=>admitted.has(x.id));
 const targets=admittedRows.map(x=>x.target);
 const missing=targets.filter(x=>!exists(x));
 if(missing.length)residuals.push({id:'R-ADMITTED-MODULE-MISSING',kind:'INVARIANT_GAP',severity:'CRITICAL',summary:'One or more admitted R124 capabilities have no module on disk.',evidence:missing.map(x=>evidence('SOURCE',x,'admitted module exists',false,true)),affected:missing,reproducible:true});
 const complete=roadmap.length>0&&roadmap.every(x=>admitted.has(x.id));
 const latestReceiptByCapsule=new Map();
 for(const r of Array.isArray(s124.receipts)?s124.receipts:[])latestReceiptByCapsule.set(r.capsuleId,r);
 const receipts=admittedRows.map(x=>latestReceiptByCapsule.get(x.id)).filter(Boolean);
 const allReceiptTests=receipts.length===admittedRows.length&&receipts.every(r=>r.status==='ADMIT'&&r.tests?.r124===true&&r.tests?.r123===true&&r.tests?.r122===true&&r.tests?.r121===true&&r.tests?.build===true);
 const allReceiptLineage=receipts.length===admittedRows.length&&receipts.every(r=>r.status==='ADMIT'&&typeof r.rollbackRef==='string'&&r.rollbackRef.length>=7&&r.completedAt);
 const allTargetsPresent=targets.length===admittedRows.length&&targets.every(exists);
 const indexPath='src/generated/selfbuild/index.ts';
 if(complete&&allTargetsPresent&&!exists(indexPath))residuals.push({
  id:'R-CAPABILITY-INDEX-MISSING',kind:'CAPABILITY_UNWIRED',severity:'LOW',summary:'All R124 capsules are admitted and physically present but no generated capability export index exists.',
  evidence:[
   evidence('SOURCE',R124,'all admitted module targets exist on disk',allTargetsPresent,allTargetsPresent),
   evidence('TEST',R124,'all admitted capsule receipts passed R124/R123/R122/R121/build gates',allReceiptTests,allReceiptTests),
   evidence('PROOF',R124,'all admitted capsule receipts contain ADMIT status, completion time, and rollback lineage',allReceiptLineage,allReceiptLineage)
  ],affected:[indexPath],reproducible:true
 });
}

let runs=[];
if(exists(RUNS_PATH)){try{runs=readJson(RUNS_PATH)}catch{runs=[]}}
for(const run of Array.isArray(runs)?runs:[]){
 if(run.status==='completed'&&run.conclusion&&run.conclusion!=='success'&&run.conclusion!=='skipped'){
  residuals.push({id:`R-CI-${run.databaseId||hash(run).slice(0,8)}`,kind:'TEST_FAILURE',severity:'MEDIUM',summary:`Workflow ${run.workflowName||'unknown'} concluded ${run.conclusion}.`,evidence:[evidence('TEST',run.url||'github-actions',`workflow conclusion is ${run.conclusion}`,run.conclusion,true),evidence('SOURCE',run.headSha||'unknown','observed head SHA',run.headSha||'unknown',true)],affected:[run.workflowName||'unknown'],reproducible:false});
 }
}

let executionEvidence=null;
if(EXECUTION_EVIDENCE_PATH&&exists(EXECUTION_EVIDENCE_PATH)){try{executionEvidence=readJson(EXECUTION_EVIDENCE_PATH)}catch{executionEvidence=null}}
if(executionEvidence?.schema==='omega.execution.evidence.r143.v1'){
 for(const probe of Array.isArray(executionEvidence.probes)?executionEvidence.probes:[]){
  if(probe?.ok===true)continue;
  const observedAt=probe?.observedAt||executionEvidence.observedAt||now;
  const source=`${executionEvidence.canonicalUrl||'canonical-runtime'}${probe?.path||''}`;
  const refs=[
   evidence('DEPLOYMENT',source,`R143 bounded live probe ${probe?.id||'unknown'} failed`,probe?.detail||false,true,observedAt),
   evidence('SOURCE',probe?.capabilityId||'unknown-capability','R143 execution evidence identifies the affected registered capability',probe?.capabilityId||'unknown-capability',true,observedAt)
  ];
  if(probe?.sourceSha256||probe?.expectedSha256)refs.push(evidence('PROOF',probe?.path||source,'R143 source-lineage hash comparison was observed',`actual=${probe?.sourceSha256||'none'} expected=${probe?.expectedSha256||'none'}`,true,observedAt));
  residuals.push({id:`R143-${probe?.id||hash(probe).slice(0,10)}`,kind:probe?.residualKind||'DEPLOYMENT_UNPROVEN',severity:probe?.severity||'HIGH',summary:`R143 live execution residual: ${probe?.capabilityId||probe?.id||'unknown'} · ${probe?.detail||'probe failed'}`,evidence:refs,affected:[probe?.capabilityId||'unknown-capability',probe?.path||'unknown-path'],reproducible:true});
 }
}

function conf(r){const v=r.evidence.filter(x=>x.verified);if(!v.length)return 0;const d=new Set(v.map(x=>x.kind)).size;return Math.min(1,.62*(v.length/r.evidence.length)+.38*Math.min(1,d/3));}
for(const r of residuals)r.confidence=conf(r);

const recipes=[
 {id:'RR-CAPABILITY-EXPORT-INDEX',handles:['CAPABILITY_UNWIRED'],risk:'LOW',requires:['all-r124-capsules-admitted','all-admitted-modules-present','independent-source-test-proof-evidence'],preserves:['R124','R123','R122','R121','truth-boundaries'],generator:'generateCapabilityIndex'}
];
function mode(r){if(r.kind==='TRUTH_BOUNDARY_RISK'||r.severity==='CRITICAL')return'BLOCK';if(!r.reproducible||r.confidence<.72)return'OBSERVE_ONLY';const recipe=recipes.find(x=>x.handles.includes(r.kind));if(!recipe)return'QUEUE_FOR_REVIEW';return recipe.risk==='LOW'&&r.confidence>=.92?'AUTO_REPAIR':'QUEUE_FOR_REVIEW'}
const ranked=residuals.map(r=>({...r,mode:mode(r)})).sort((a,b)=>({CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[b.severity]-{CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[a.severity])||b.confidence-a.confidence);
const selected=ranked.find(x=>x.mode==='AUTO_REPAIR')||null;

function generateCapabilityIndex(){
 const s=readJson(R124);const admitted=new Set(s.admitted||[]);const rows=s.roadmap.filter(x=>admitted.has(x.id));
 for(const x of rows)if(!exists(x.target))throw new Error(`Refuse index generation: missing admitted target ${x.target}`);
 const rel=x=>'./'+path.basename(x.target,'.ts');
 const content='// GENERATED BY OMEGA R125 ACCURACY-FIRST ENGINE.\n// Exports only capabilities already admitted by R124, independently proof-gated, and present on disk.\n'+rows.map(x=>`export * from '${rel(x)}';`).join('\n')+'\n';
 fs.mkdirSync('src/generated/selfbuild',{recursive:true});fs.writeFileSync('src/generated/selfbuild/index.ts',content,'utf8');
 return{changed:['src/generated/selfbuild/index.ts'],proof:{admittedIds:rows.map(x=>x.id),targets:rows.map(x=>x.target),contentSha256:crypto.createHash('sha256').update(content).digest('hex')}};
}

let repair=null;
if(APPLY&&selected){if(selected.id==='R-CAPABILITY-INDEX-MISSING')repair=generateCapabilityIndex();else throw new Error('No registered deterministic repair for '+selected.id)}
const executionEvidenceObserved=Array.isArray(executionEvidence?.probes)?executionEvidence.probes.length:0;
const semantic={residuals:ranked.map(r=>({id:r.id,kind:r.kind,severity:r.severity,mode:r.mode,confidence:r.confidence,affected:r.affected,evidence:r.evidence.map(e=>({kind:e.kind,source:e.source,claim:e.claim,verified:e.verified,value:e.value}))})),selected:selected?.id??null,repair:repair?{changed:repair.changed,proof:repair.proof}:null,r124Generation:s124?.generation??null,r124Admitted:s124?.admitted??[],githubRunsObserved:runs.length,executionEvidenceObserved};
const state={schema:'omega.accuracy.r125.v2',authority:'OMEGAV6',observedAt:now,mode:repair?'REPAIRED':selected?'PROPOSE':ranked.length?'OBSERVE':'HEALTHY',accuracyPolicy:{mutationRequiresVerifiedEvidence:true,autoRepairMinConfidence:.92,autoRepairRisk:'LOW_ONLY',criticalResidualBlocks:true,unreproducibleResidualAutoRepair:false,observationOnlyNeverMutatesMain:true},residuals:ranked,selected:selected?selected.id:null,repair,sourceState:{r124Generation:s124?.generation??null,r124Admitted:s124?.admitted??[],githubRunsObserved:runs.length,executionEvidenceObserved,executionEvidenceSchema:executionEvidence?.schema||null},lineage:{baseSha:process.env.GITHUB_SHA||'UNKNOWN',semanticFingerprint:hash(semantic),stateSha256:''}};
state.lineage.stateSha256=hash({...state,lineage:{...state.lineage,stateSha256:''}});
fs.writeFileSync(OUT,JSON.stringify(state,null,2)+'\n');
fs.writeFileSync(PROPOSAL,JSON.stringify({schema:'omega.accuracy.proposal.r125.v2',observedAt:now,semanticFingerprint:state.lineage.semanticFingerprint,selected:selected?{id:selected.id,kind:selected.kind,mode:selected.mode,confidence:selected.confidence,summary:selected.summary}:null,repairApplied:!!repair,repair},null,2)+'\n');
console.log(JSON.stringify({status:repair?'REPAIRED':selected?'PROPOSE':ranked.length?'OBSERVE':'HEALTHY',residualCount:ranked.length,selected:selected?.id??null,selectedConfidence:selected?.confidence??null,repairApplied:!!repair,executionEvidenceObserved,semanticFingerprint:state.lineage.semanticFingerprint},null,2));
