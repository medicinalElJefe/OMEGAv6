import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const APPLY=process.env.OMEGA_R125_APPLY==='1';
const RUNS_PATH=process.env.OMEGA_R125_RUNS_PATH||'/tmp/omega-r125-runs.json';
const R124='public/omega-r124-selfbuild-state.json';
const OUT='public/omega-r125-accuracy-state.json';
const PROPOSAL='public/omega-r125-proposal.json';
const now=new Date().toISOString();
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const exists=p=>fs.existsSync(p);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const evidence=(kind,source,claim,value=true,verified=true)=>({id:hash({kind,source,claim,value}).slice(0,20),kind,source,observedAt:now,claim,verified,value});
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
 const latestReceiptByCapsule=new Map();for(const r of Array.isArray(s124.receipts)?s124.receipts:[])latestReceiptByCapsule.set(r.capsuleId,r);
 const receipts=admittedRows.map(x=>latestReceiptByCapsule.get(x.id)).filter(Boolean);
 const allReceiptTests=receipts.length===admittedRows.length&&receipts.every(r=>r.status==='ADMIT'&&r.tests?.r124===true&&r.tests?.r123===true&&r.tests?.r122===true&&r.tests?.r121===true&&r.tests?.build===true);
 const allReceiptLineage=receipts.length===admittedRows.length&&receipts.every(r=>r.status==='ADMIT'&&typeof r.rollbackRef==='string'&&r.rollbackRef.length>=7&&r.completedAt);
 const allTargetsPresent=targets.length===admittedRows.length&&targets.every(exists);
 const indexPath='src/generated/selfbuild/index.ts';
 if(complete&&allTargetsPresent&&!exists(indexPath))residuals.push({id:'R-CAPABILITY-INDEX-MISSING',kind:'CAPABILITY_UNWIRED',severity:'LOW',summary:'All R124 capsules are admitted and physically present but no generated capability export index exists.',evidence:[evidence('SOURCE',R124,'all admitted module targets exist on disk',allTargetsPresent,allTargetsPresent),evidence('TEST',R124,'all admitted capsule receipts passed R124/R123/R122/R121/build gates',allReceiptTests,allReceiptTests),evidence('PROOF',R124,'all admitted capsule receipts contain ADMIT status, completion time, and rollback lineage',allReceiptLineage,allReceiptLineage)],affected:[indexPath],reproducible:true});
}

const r143Required=['src/authoritativeOperationChainR143.ts','tests/r143-authoritative-ui-operation-chain-invariants.mjs','.github/workflows/r143-authoritative-ui-operation-chain.yml'];
const r143Missing=r143Required.filter(x=>!exists(x));
if(r143Missing.length)residuals.push({id:'R-R143-OPERATION-CHAIN-MISSING',kind:'UI_OPERATION_CHAIN_FAILURE',severity:'HIGH',summary:'R143 authoritative UI operation-chain authority is incomplete on disk.',evidence:r143Missing.map(x=>evidence('SOURCE',x,'required R143 operation-chain authority exists',false,true)),affected:r143Missing,reproducible:true});

const r144Required=['tests/r144-runtime-deployment-attestation-invariants.mjs','.github/workflows/r144-runtime-deployment-attestation.yml','.github/workflows/release-evidence-live.yml'];
const r144Missing=r144Required.filter(x=>!exists(x));
const r144Worker=exists('src/workerR27.js')?fs.readFileSync('src/workerR27.js','utf8'):'';
const r144Panel=exists('src/GovernedBuildReceiptPanel.tsx')?fs.readFileSync('src/GovernedBuildReceiptPanel.tsx','utf8'):'';
if(!r144Worker.includes('OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144'))r144Missing.push('src/workerR27.js#OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144');
if(!r144Panel.includes('data-r144-runtime-attestation'))r144Missing.push('src/GovernedBuildReceiptPanel.tsx#data-r144-runtime-attestation');
if(r144Missing.length)residuals.push({id:'R-R144-DEPLOYMENT-ATTESTATION-MISSING',kind:'DEPLOYMENT_ATTESTATION_FAILURE',severity:'HIGH',summary:'R144 runtime deployment-attestation authority is incomplete on disk.',evidence:r144Missing.map(x=>evidence('SOURCE',x,'required R144 deployment-attestation authority exists',false,true)),affected:r144Missing,reproducible:true});

const advancedAuthorities=[
 {revision:'R151',id:'R-R151-ALL-MODES-FUSION-MISSING',kind:'ALL_MODES_FUSION_FAILURE',summary:'R151 provenance-weighted all-modes truth fusion or exact swarm census authority is incomplete.',required:['src/allModesTruthFusionR151.ts','src/allModesSwarmPartitionR151.ts','tests/r151-all-modes-truth-fusion-invariants.mjs','scripts/r151-full-atlas-scan.ts','.github/workflows/r151-all-modes-truth-fusion.yml']},
 {revision:'R152',id:'R-R152-UNIVERSAL-TRUTH-MISSING',kind:'UNIVERSAL_TRUTH_FAILURE',summary:'R152 universal evidence-to-all-modes truth envelope authority is incomplete.',required:['src/universalTruthEnvelopeR152.ts','tests/r152-universal-truth-envelope.mts','.github/workflows/r152-universal-truth-envelope.yml']},
 {revision:'R153',id:'R-R153-LEMMA-NOW-MISSING',kind:'CAUSAL_NOW_LEMMA_FAILURE',summary:'R153 lemma/motion/NOW/Woven Continuity authority is incomplete.',required:['src/lemmaMotionNowContinuityR153.ts','tests/r153-lemma-motion-now-continuity.mts','.github/workflows/r153-lemma-motion-now-continuity.yml']},
 {revision:'R154',id:'R-R154-RELATIVE-CAPACITY-MISSING',kind:'RELATIVE_CAPACITY_FAILURE',summary:'R154 motion-relative dimensional software-capacity authority is incomplete.',required:['src/relativeCapacityFabricR154.ts','src/relativeCapacityClientR154.ts','tests/r154-relative-capacity-fabric.mts','.github/workflows/r154-relative-capacity-fabric.yml']},
 {revision:'R164',id:'R-R164-REFLEX-AUTONOMIC-MISSING',kind:'REFLEX_AUTONOMIC_FAILURE',summary:'R164 returned-reflex to bounded R125 autonomic-swarm convergence authority is incomplete.',required:['src/execution/reflexAutonomicSwarmR164.js','tests/r164-reflex-autonomic-swarm-convergence-invariants.mjs','.github/workflows/r164-reflex-autonomic-swarm-convergence.yml']},
 {revision:'R166',id:'R-R166-RESIDUAL-WORLD-MISSING',kind:'RESIDUAL_WORLD_FAILURE',summary:'R166 read-only development residual to living-world projection authority is incomplete.',required:['src/world/developmentResidualWorldLensR166.js','tests/r166-development-residual-world-lens-invariants.mjs','.github/workflows/r166-development-residual-world-lens.yml']},
 {revision:'R167',id:'R-R167-OPTICAL-CONVERGENCE-MISSING',kind:'OPTICAL_CONVERGENCE_FAILURE',summary:'R167 active Optical R153.2 SCREEN_ONLY convergence authority is incomplete.',required:['wrangler.optical-machine-r1532.jsonc','public/omega-active-federation-r167.json','tests/r167-active-optical-r1532-convergence-invariants.mjs','.github/workflows/r167-active-optical-convergence.yml']},
 {revision:'R168',id:'R-R168-RESTORATION-CONVERGENCE-MISSING',kind:'RESTORATION_CONVERGENCE_FAILURE',summary:'R168 current-successor restoration, runtime-storage, applied-calculus and operator residual convergence authority is incomplete.',required:['src/system/appliedCalculusAuthorityR168.ts','src/execution/runtimeStorageR168.js','src/FullRestorationConvergenceR168.tsx','tests/r168-whole-system-truth-performance-restoration-invariants.mjs','tests/r168-full-restoration-current-successor-invariants.mjs','.github/workflows/r168-whole-system-truth-performance-restoration.yml']},
 {revision:'R168.1',id:'R-R1681-PROPAGATION-ACCEPTANCE-MISSING',kind:'RCWA_PROPAGATION_ACCEPTANCE_FAILURE',summary:'R168.1 byte-exact RCWA/Federation propagation acceptance authority is incomplete.',required:['scripts/diagnose_rcwa_live_r1681.mjs','scripts/verify_federation_live_r1681.mjs','.github/workflows/r168-1-rcwa-byte-diagnostic.yml']},
 {revision:'R169',id:'R-R169-FEDERATION-WORLD-MISSING',kind:'FEDERATION_ATTESTATION_WORLD_FAILURE',summary:'R169 federation attestation world-scar evidence authority is incomplete.',required:['src/world/federationAttestationWorldLensR169.js','tests/r169-federation-attestation-world-lens-invariants.mjs','.github/workflows/r169-federation-attestation-world-lens.yml']}
];
const advancedAuthorityState={};
for(const authority of advancedAuthorities){
 const missing=authority.required.filter(x=>!exists(x));
 if(authority.revision==='R154'){
  const worker=exists('src/workerR27.js')?fs.readFileSync('src/workerR27.js','utf8'):'';
  if(!worker.includes('/api/runtime-now-r154'))missing.push('src/workerR27.js#/api/runtime-now-r154');
  if(!worker.includes('/api/relative-capacity-r154'))missing.push('src/workerR27.js#/api/relative-capacity-r154');
 }
 advancedAuthorityState[authority.revision]=missing.length===0;
 if(missing.length)residuals.push({id:authority.id,kind:authority.kind,severity:'HIGH',summary:authority.summary,evidence:missing.map(x=>evidence('SOURCE',x,`${authority.revision} required authority surface exists`,false,true)),affected:missing,reproducible:true});
}

let runs=[];if(exists(RUNS_PATH)){try{runs=readJson(RUNS_PATH)}catch{runs=[]}}
for(const run of Array.isArray(runs)?runs:[]){
 if(run.status==='completed'&&run.conclusion&&run.conclusion!=='success'&&run.conclusion!=='skipped'){
  const workflowName=String(run.workflowName||'unknown');
  const kind=/R169 Federation Attestation World Lens/i.test(workflowName)?'FEDERATION_ATTESTATION_WORLD_FAILURE':/R168\.1 RCWA Propagation Acceptance/i.test(workflowName)?'RCWA_PROPAGATION_ACCEPTANCE_FAILURE':/R168 Whole-System Truth Performance Restoration/i.test(workflowName)?'RESTORATION_CONVERGENCE_FAILURE':/R167 Active Optical R153\.2 Convergence/i.test(workflowName)?'OPTICAL_CONVERGENCE_FAILURE':/R166 Development Residual World Lens/i.test(workflowName)?'RESIDUAL_WORLD_FAILURE':/R164 Reflex Autonomic Swarm Convergence/i.test(workflowName)?'REFLEX_AUTONOMIC_FAILURE':/R154 Relative Capacity Fabric/i.test(workflowName)?'RELATIVE_CAPACITY_FAILURE':/R153 Lemma Motion NOW Continuity/i.test(workflowName)?'CAUSAL_NOW_LEMMA_FAILURE':/R152 Universal Truth Envelope/i.test(workflowName)?'UNIVERSAL_TRUTH_FAILURE':/R151 All Modes Truth Fusion/i.test(workflowName)?'ALL_MODES_FUSION_FAILURE':/R144 Runtime Deployment Attestation|Release Evidence Live Verify/i.test(workflowName)?'DEPLOYMENT_ATTESTATION_FAILURE':/R143 Authoritative UI Operation Chain/i.test(workflowName)?'UI_OPERATION_CHAIN_FAILURE':/R142 Proof Aware Capability Lifecycle/i.test(workflowName)?'EXECUTION_LIFECYCLE_FAILURE':'TEST_FAILURE';
  const severity=['FEDERATION_ATTESTATION_WORLD_FAILURE','RCWA_PROPAGATION_ACCEPTANCE_FAILURE','RESTORATION_CONVERGENCE_FAILURE','OPTICAL_CONVERGENCE_FAILURE','RESIDUAL_WORLD_FAILURE','REFLEX_AUTONOMIC_FAILURE','RELATIVE_CAPACITY_FAILURE','CAUSAL_NOW_LEMMA_FAILURE','UNIVERSAL_TRUTH_FAILURE','ALL_MODES_FUSION_FAILURE','DEPLOYMENT_ATTESTATION_FAILURE','UI_OPERATION_CHAIN_FAILURE','EXECUTION_LIFECYCLE_FAILURE'].includes(kind)?'HIGH':'MEDIUM';
  residuals.push({id:`R-CI-${run.databaseId||hash(run).slice(0,8)}`,kind,severity,summary:`Workflow ${workflowName} concluded ${run.conclusion}.`,evidence:[evidence('TEST',run.url||'github-actions',`workflow conclusion is ${run.conclusion}`,run.conclusion,true),evidence('SOURCE',run.headSha||'unknown','observed head SHA',run.headSha||'unknown',true)],affected:[workflowName],reproducible:false});
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

let repair=null;if(APPLY&&selected){if(selected.id==='R-CAPABILITY-INDEX-MISSING')repair=generateCapabilityIndex();else throw new Error('No registered deterministic repair for '+selected.id)}
const semantic={residuals:ranked.map(r=>({id:r.id,kind:r.kind,severity:r.severity,mode:r.mode,confidence:r.confidence,affected:r.affected,evidence:r.evidence.map(e=>({kind:e.kind,source:e.source,claim:e.claim,verified:e.verified,value:e.value}))})),selected:selected?.id??null,repair:repair?{changed:repair.changed,proof:repair.proof}:null,r124Generation:s124?.generation??null,r124Admitted:s124?.admitted??[],r143AuthorityComplete:r143Missing.length===0,r144AttestationComplete:r144Missing.length===0,advancedAuthorityState,githubRunsObserved:runs.length};
const state={schema:'omega.accuracy.r125.v6',authority:'OMEGAV6',observedAt:now,mode:repair?'REPAIRED':selected?'PROPOSE':ranked.length?'OBSERVE':'HEALTHY',accuracyPolicy:{mutationRequiresVerifiedEvidence:true,autoRepairMinConfidence:.92,autoRepairRisk:'LOW_ONLY',criticalResidualBlocks:true,unreproducibleResidualAutoRepair:false,observationOnlyNeverMutatesMain:true,advancedTruthCapacityFailuresNeverAutoRepair:true,modernRestorationFailuresNeverAutoRepair:true,propagationAcceptanceFailuresNeverAutoRepair:true,federationWorldFailuresNeverAutoRepair:true},residuals:ranked,selected:selected?selected.id:null,repair,sourceState:{r124Generation:s124?.generation??null,r124Admitted:s124?.admitted??[],r143AuthorityComplete:r143Missing.length===0,r144AttestationComplete:r144Missing.length===0,advancedAuthorityState,githubRunsObserved:runs.length},lineage:{baseSha:process.env.GITHUB_SHA||'UNKNOWN',semanticFingerprint:hash(semantic),stateSha256:''}};
state.lineage.stateSha256=hash({...state,lineage:{...state.lineage,stateSha256:''}});
fs.writeFileSync(OUT,JSON.stringify(state,null,2)+'\n');
fs.writeFileSync(PROPOSAL,JSON.stringify({schema:'omega.accuracy.proposal.r125.v6',observedAt:now,semanticFingerprint:state.lineage.semanticFingerprint,selected:selected?{id:selected.id,kind:selected.kind,mode:selected.mode,confidence:selected.confidence,summary:selected.summary}:null,repairApplied:!!repair,repair},null,2)+'\n');
console.log(JSON.stringify({status:repair?'REPAIRED':selected?'PROPOSE':ranked.length?'OBSERVE':'HEALTHY',residualCount:ranked.length,selected:selected?.id??null,selectedConfidence:selected?.confidence??null,repairApplied:!!repair,r143AuthorityComplete:r143Missing.length===0,r144AttestationComplete:r144Missing.length===0,advancedAuthorityState,semanticFingerprint:state.lineage.semanticFingerprint},null,2));
