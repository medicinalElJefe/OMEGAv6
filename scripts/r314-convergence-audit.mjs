import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {residualVectorR314} from '../src/system/autonomousConvergenceR314.js';

const read=file=>fs.readFileSync(file,'utf8');
const exists=file=>fs.existsSync(file);
const unique=array=>[...new Set(array)];

function parseArgs(argv){
 const args={out:null,pretty:true};
 for(let i=0;i<argv.length;i++){
  if(argv[i]==='--out')args.out=argv[++i]||null;
  if(argv[i]==='--compact')args.pretty=false;
 }
 return args;
}

function countCapabilityRows(source){
 const block=(source.match(/OMEGA_CAPABILITY_AUTHORITY:[^=]*=\[(.*?)\] as const;/s)||[])[1]||'';
 return (block.match(/\{name:'/g)||[]).length;
}

function archiveIds(source){
 return unique([...source.matchAll(/id:'(AG-\d+)'/g)].map(match=>match[1])).sort();
}

function buildStageIds(source){
 return unique([...source.matchAll(/id:'(R314-B\d+)'/g)].map(match=>match[1])).sort();
}

function normalizeRoadmap(state){
 return Array.isArray(state?.roadmap)?state.roadmap:[];
}

export function auditR314(root=process.cwd()){
 const capabilityPath=path.join(root,'src/capabilityAuthority.ts');
 const archiveAPath=path.join(root,'src/archiveGenomeLedgerR288.ts');
 const archiveBPath=path.join(root,'src/archiveGenomeLedgerR288b.ts');
 const masterPath=path.join(root,'src/convergenceMasterR314.ts');
 const workflowPath=path.join(root,'.github/workflows/r170-governed-selfbuild.yml');
 const selfbuildPath=path.join(root,'public/omega-r170-selfbuild-state.json');
 const enginePath=path.join(root,'scripts/r170-selfbuild-engine.mjs');
 const sourceCanonPath=path.join(root,'public/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv');
 const r334ClosurePath=path.join(root,'public/canon/Dewey_OMEGA_CERN_Dewey_Relativity_Closure_v3_2026-09-19.csv');
 const r334BridgePath=path.join(root,'public/canon/Dewey_OMEGA_CERN_ADV02_ADV04_Quantitative_Bridge_2026-09-19.csv');
 const r339AdvPath=path.join(root,'public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv');
 const r339ModulePath=path.join(root,'src/system/calibrationAdvancementR339.js');

 const capabilitySource=read(capabilityPath);
 const archiveSource=`${read(archiveAPath)}\n${read(archiveBPath)}`;
 const masterSource=read(masterPath);
 const workflowSource=read(workflowPath);
 const engineSource=read(enginePath);
 const r339ModuleSource=exists(r339ModulePath)?read(r339ModulePath):'';
 const state=JSON.parse(read(selfbuildPath));
 const sourceCanonExists=exists(sourceCanonPath),sourceCanonBytes=sourceCanonExists?fs.readFileSync(sourceCanonPath):Buffer.alloc(0),sourceCanonSha=sourceCanonExists?createHash('sha256').update(sourceCanonBytes).digest('hex'):'',sourceCanonLines=sourceCanonExists?sourceCanonBytes.toString('utf8').split(/\r?\n/).filter((x,i,all)=>i<all.length-1||x.length>0).length:0,sourceCanonRecords=Math.max(0,sourceCanonLines-1);
 const calibrationMeta=(file,expectedSha,expectedRecords)=>{const present=exists(file),bytes=present?fs.readFileSync(file):Buffer.alloc(0),sha256=present?createHash('sha256').update(bytes).digest('hex'):'',lines=present?bytes.toString('utf8').split(/\r?\n/).filter((x,i,all)=>i<all.length-1||x.length>0).length:0,records=Math.max(0,lines-1);return{present,sha256,expectedSha,records,expectedRecords,path:path.relative(root,file).replaceAll('\\','/')}};
 const r334Closure=calibrationMeta(r334ClosurePath,'bbb0a6957512a0fd87a0668c914b62be459910e011c2c882b3d96c38cb844d8c',23);
 const r334Bridge=calibrationMeta(r334BridgePath,'2fa0753e49445b9e8d0d7b56b320503aec61e091a3f7eae17619c74ad84936ba',36);
 const r339Adv=calibrationMeta(r339AdvPath,'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410',25);

 const capabilities=countCapabilityRows(capabilitySource);
 const archives=archiveIds(archiveSource);
 const stages=buildStageIds(masterSource);
 const roadmap=normalizeRoadmap(state);
 const realRoadmapTargets=roadmap.filter(row=>typeof row?.target==='string'&&!row.target.startsWith('src/generated/selfbuildR170/'));
 const realizedRealTargets=realRoadmapTargets.filter(row=>exists(path.join(root,row.target)));
 const targetFamilies=unique(roadmap.map(row=>String(row?.target||'').split('/').slice(0,2).join('/')).filter(Boolean));
 const residuals=[];

 if(capabilities!==44)residuals.push({id:'R314-CAPABILITY-CENSUS',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 44 capability rows, found ${capabilities}`,source:'src/capabilityAuthority.ts'});
 if(archives.length!==22)residuals.push({id:'R314-ARCHIVE-CENSUS',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 22 archive families, found ${archives.length}`,source:'R288/R288B'});
 if(stages.length!==18)residuals.push({id:'R314-BUILD-GRAPH',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 18 build stages, found ${stages.length}`,source:'src/convergenceMasterR314.ts'});
 if(!workflowSource.includes('schedule:'))residuals.push({id:'R314-CLOUD-SCHEDULE',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Existing governed self-build workflow has no cloud schedule',source:'.github/workflows/r170-governed-selfbuild.yml'});
 if(Number(state?.maxAutonomousGenerations||0)<=5)residuals.push({id:'R314-STATIC-GENERATION-CAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:`Self-build maxAutonomousGenerations=${state?.maxAutonomousGenerations??'missing'} prevents sustained convergence`,source:'public/omega-r170-selfbuild-state.json'});
 if(roadmap.length<=5)residuals.push({id:'R314-STATIC-CAPSULE-ROADMAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:`Self-build roadmap has only ${roadmap.length} capsules`,source:'public/omega-r170-selfbuild-state.json'});
 if(realRoadmapTargets.length===0)residuals.push({id:'R314-GENERATED-ONLY-ROADMAP',severity:'CRITICAL',mode:'BLOCK',summary:'Autonomous roadmap contains no exact allowlisted product-source repair target',source:'R170 workflow + state'});
 if(realizedRealTargets.length===0)residuals.push({id:'R314-NO-REALIZED-SOURCE-REPAIR',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'No roadmap-defined product-source repair has yet been realized in the checked source tree',source:'R170 workflow + state'});
 if(!workflowSource.includes('src/generated/selfbuildR170/'))residuals.push({id:'R314-SELFBUILD-ALLOWLIST-MISSING',severity:'CRITICAL',mode:'BLOCK',summary:'Expected current generated-target boundary was not found; inspect workflow authority before broadening mutation',source:'.github/workflows/r170-governed-selfbuild.yml'});
 if(!engineSource.includes('existsSync')&&!engineSource.includes('writeFile'))residuals.push({id:'R314-SELFBUILD-ENGINE-UNKNOWN',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Self-build engine mutation semantics could not be identified',source:'scripts/r170-selfbuild-engine.mjs'});
 if(!masterSource.includes('BUILD_PROGRESS_REQUIRES_EVIDENCED_RESIDUAL_REDUCTION'))residuals.push({id:'R314-NO-GAIN-LAW',severity:'CRITICAL',mode:'BLOCK',summary:'Convergence master lacks measurable residual reduction law',source:'src/convergenceMasterR314.ts'});
 if(!masterSource.includes('SYNCHRONOUS_DATA_REQUIRES_EXPLICIT_CLOCK_FRAME_UNIT_AND_PROVENANCE_BINDING'))residuals.push({id:'R314-SYNC-SPINE-LAW',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Convergence master lacks explicit synchronous clock/frame/unit/provenance binding',source:'src/convergenceMasterR314.ts'});
 if(!sourceCanonExists)residuals.push({id:'R328-SOURCE-CANON-MISSING',severity:'CRITICAL',mode:'BLOCK',summary:'R328 source-exact semantic canon CSV is missing',source:'public/canon'});
 if(sourceCanonExists&&sourceCanonSha!=='478922fb496a9402a82063908811dd9e264a0214e198dac4fb6ecfe2e95807bf')residuals.push({id:'R328-SOURCE-CANON-HASH',severity:'CRITICAL',mode:'BLOCK',summary:`R328 source canon SHA mismatch ${sourceCanonSha}`,source:'public/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv'});
 if(sourceCanonExists&&sourceCanonRecords!==3743)residuals.push({id:'R328-SOURCE-CANON-CENSUS',severity:'CRITICAL',mode:'BLOCK',summary:`R328 source canon record count ${sourceCanonRecords} != 3743`,source:'public/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv'});
 if(!masterSource.includes('SOURCE_EXACT_SEMANTIC_CANON_REMAINS_SEPARATE_FROM_IMPLEMENTATION_CANON'))residuals.push({id:'R328-CANON-LAYER-SEPARATION',severity:'CRITICAL',mode:'BLOCK',summary:'Convergence master does not preserve semantic-source versus implementation-canon separation',source:'src/convergenceMasterR314.ts'});
 for(const [id,data] of [['R334-CLOSURE',r334Closure],['R334-BRIDGE',r334Bridge]]){
  if(!data.present)residuals.push({id:`${id}-MISSING`,severity:'CRITICAL',mode:'BLOCK',summary:`R334 calibrated dataset missing ${data.path}`,source:data.path});
  else if(data.sha256!==data.expectedSha)residuals.push({id:`${id}-HASH`,severity:'CRITICAL',mode:'BLOCK',summary:`R334 calibrated dataset SHA mismatch ${data.sha256}`,source:data.path});
  if(data.present&&data.records!==data.expectedRecords)residuals.push({id:`${id}-CENSUS`,severity:'CRITICAL',mode:'BLOCK',summary:`R334 calibrated dataset records ${data.records} != ${data.expectedRecords}`,source:data.path});
 }
 if(!masterSource.includes('R334_B06_PROGRESS_RECEIPT')||!masterSource.includes('RELATIONAL_TRANSITIONS_REQUIRE_PROVENANCE_SCAR_AND_QTI_PROOF_BEFORE_FORECAST_OR_NEXT_PARENT'))residuals.push({id:'R334-CONVERGENCE-BINDING',severity:'CRITICAL',mode:'BLOCK',summary:'R314 convergence master does not preserve the proof-governed R334 relational/calibration binding',source:'src/convergenceMasterR314.ts'});
 for(const [id,data] of [['R339-ADV',r339Adv]]){
  if(!data.present)residuals.push({id:`${id}-MISSING`,severity:'CRITICAL',mode:'BLOCK',summary:`R339 advancement dataset missing ${data.path}`,source:data.path});
  else if(data.sha256!==data.expectedSha)residuals.push({id:`${id}-HASH`,severity:'CRITICAL',mode:'BLOCK',summary:`R339 advancement dataset SHA mismatch ${data.sha256}`,source:data.path});
  if(data.present&&data.records!==data.expectedRecords)residuals.push({id:`${id}-CENSUS`,severity:'CRITICAL',mode:'BLOCK',summary:`R339 advancement dataset records ${data.records} != ${data.expectedRecords}`,source:data.path});
 }
 const r339ManifestTokens=[
  "rows:4285,columns:68,bytes:7938333",
  "sha256:'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891'",
  "repositoryNormalizedSha256:'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2'",
  "repositoryNormalizedBytes:7934043",
  "repositoryNormalizedSha256:'a3677e2b5a22b37235948999ed0896defbf706d13531676e84448096231913f4'",
  "repositoryNormalizedBytes:7884622",
  "invariant:'EXACT_R334_MASTER_V3_PREFIX'",
  "noRetuning:true"
 ];
 if(!exists(r339ModulePath)||r339ManifestTokens.some(token=>!r339ModuleSource.includes(token)))residuals.push({id:'R339-MASTER-MANIFEST',severity:'CRITICAL',mode:'BLOCK',summary:'R339 master-v4 hash/census, exact R334 prefix, or no-retuning contract is incomplete',source:'src/system/calibrationAdvancementR339.js'});
 if(!masterSource.includes('R339_PROPAGATION_RECEIPT')||!masterSource.includes('FROZEN_PROSPECTIVE_FORECASTS_MUST_NOT_BE_RETUNED_AFTER_TARGET_INSPECTION')||!masterSource.includes('FUTURE_COMPATIBILITY_REQUIRES_INDEPENDENT_RESULT_COMMON_BASIS_COVARIANCE_AND_ASSUMPTION_CARRY'))residuals.push({id:'R339-CONVERGENCE-BINDING',severity:'CRITICAL',mode:'BLOCK',summary:'R314 convergence master does not preserve R339 frozen-forecast propagation and no-retuning laws',source:'src/convergenceMasterR314.ts'});

 const vector=residualVectorR314({state:residuals.some(row=>row.mode==='BLOCK')?'HOLD':residuals.length?'TURN':'STAY',residuals});
 return {
  schema:'OMEGA_R314_CONVERGENCE_AUDIT',
  generatedAt:new Date().toISOString(),
  counts:{capabilities,archiveFamilies:archives.length,buildStages:stages.length,selfBuildCapsules:roadmap.length,realRoadmapTargets:realRoadmapTargets.length,realizedRealTargets:realizedRealTargets.length,targetFamilies:targetFamilies.length,sourceCanonRecords,sourceCanonLines,r334CalibratedRecords:r334Closure.records+r334Bridge.records,r339AdvancementRecords:r339Adv.records,r339MasterRecords:4285,r339InheritedRecords:4260,r339AppendedRecords:25},
  sourceExactCanon:{present:sourceCanonExists,sha256:sourceCanonSha,expectedRepositoryNormalizedSha256:'478922fb496a9402a82063908811dd9e264a0214e198dac4fb6ecfe2e95807bf',originalSourceSha256:'1c805af0e6e3a5ef2bb869bfc7d389ecba8746ba18b311859dca88b4b400a8eb',records:sourceCanonRecords,expectedRecords:3743},
  calibratedCernRelativity:{revision:'R334',closure:r334Closure,bridge:r334Bridge,masterRecords:4260,inheritedBridgeRecords:4237,deltaRecords:23,canonicalAdmission:false,externalReplicationGate:'OPEN'},
  calibratedCernAdvancement:{revision:'R339',advancement:r339Adv,masterRecords:4285,inheritedR334Records:4260,appendedDerivedNoOverwriteRecords:25,masterOriginalSha256:'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891',masterRepositoryNormalizedSha256:'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2',r334PrefixRepositoryNormalizedSha256:'a3677e2b5a22b37235948999ed0896defbf706d13531676e84448096231913f4',forecastContract:'R339_FROZEN_FORECAST_V4_2026-09-19',noRetuning:true,canonicalAdmission:false,futureIndependentValidationGate:'OPEN'},
  ids:{archiveFamilies:archives,buildStages:stages},
  selfBuild:{active:Boolean(state?.active),generation:Number(state?.generation||0),maxAutonomousGenerations:Number(state?.maxAutonomousGenerations||0),capsules:roadmap.map(row=>({id:row.id,target:row.target,status:row.status||null,repairId:row.repairId||null,mutationClass:row.mutationClass||null})),realRoadmapTargets:realRoadmapTargets.map(row=>row.target),realizedRealTargets:realizedRealTargets.map(row=>row.target)},
  residuals:vector.residuals,
  state:vector.state,
  pressure:vector.pressure,
  blocking:vector.blocking,
  fingerprint:vector.fingerprint,
  truthBoundary:'Static source audit only. It does not claim runtime, production, device, scientific, renderer, solver or CanonState proof.',
 };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=parseArgs(process.argv.slice(2));
 const result=auditR314();
 const body=JSON.stringify(result,null,args.pretty?2:0)+'\n';
 if(args.out){fs.mkdirSync(path.dirname(args.out),{recursive:true});fs.writeFileSync(args.out,body)}
 process.stdout.write(body);
}
