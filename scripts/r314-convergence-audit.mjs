import fs from 'node:fs';
import path from 'node:path';
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

 const capabilitySource=read(capabilityPath);
 const archiveSource=`${read(archiveAPath)}\n${read(archiveBPath)}`;
 const masterSource=read(masterPath);
 const workflowSource=read(workflowPath);
 const engineSource=read(enginePath);
 const state=JSON.parse(read(selfbuildPath));

 const capabilities=countCapabilityRows(capabilitySource);
 const archives=archiveIds(archiveSource);
 const stages=buildStageIds(masterSource);
 const roadmap=normalizeRoadmap(state);
 const realTargets=roadmap.filter(row=>typeof row?.target==='string'&&!row.target.startsWith('src/generated/selfbuildR170/'));
 const targetFamilies=unique(roadmap.map(row=>String(row?.target||'').split('/').slice(0,2).join('/')).filter(Boolean));
 const residuals=[];

 if(capabilities!==44)residuals.push({id:'R314-CAPABILITY-CENSUS',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 44 capability rows, found ${capabilities}`,source:'src/capabilityAuthority.ts'});
 if(archives.length!==22)residuals.push({id:'R314-ARCHIVE-CENSUS',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 22 archive families, found ${archives.length}`,source:'R288/R288B'});
 if(stages.length!==18)residuals.push({id:'R314-BUILD-GRAPH',severity:'CRITICAL',mode:'BLOCK',summary:`Expected 18 build stages, found ${stages.length}`,source:'src/convergenceMasterR314.ts'});
 if(!workflowSource.includes('schedule:'))residuals.push({id:'R314-CLOUD-SCHEDULE',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Existing governed self-build workflow has no cloud schedule',source:'.github/workflows/r170-governed-selfbuild.yml'});
 if(Number(state?.maxAutonomousGenerations||0)<=5)residuals.push({id:'R314-STATIC-GENERATION-CAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:`Self-build maxAutonomousGenerations=${state?.maxAutonomousGenerations??'missing'} prevents sustained convergence`,source:'public/omega-r170-selfbuild-state.json'});
 if(roadmap.length<=5)residuals.push({id:'R314-STATIC-CAPSULE-ROADMAP',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:`Self-build roadmap has only ${roadmap.length} capsules`,source:'public/omega-r170-selfbuild-state.json'});
 if(realTargets.length===0)residuals.push({id:'R314-GENERATED-ONLY-MUTATION',severity:'CRITICAL',mode:'BLOCK',summary:'All autonomous targets remain generated/projection files; no exact allowlisted product source repair can occur',source:'R170 workflow + state'});
 if(!workflowSource.includes('src/generated/selfbuildR170/'))residuals.push({id:'R314-SELFBUILD-ALLOWLIST-MISSING',severity:'CRITICAL',mode:'BLOCK',summary:'Expected current generated-target boundary was not found; inspect workflow authority before broadening mutation',source:'.github/workflows/r170-governed-selfbuild.yml'});
 if(!engineSource.includes('refuses overwrite')&&!engineSource.includes('existsSync')&&!engineSource.includes('writeFile'))residuals.push({id:'R314-SELFBUILD-ENGINE-UNKNOWN',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Self-build engine mutation semantics could not be identified',source:'scripts/r170-selfbuild-engine.mjs'});
 if(!masterSource.includes('BUILD_PROGRESS_REQUIRES_EVIDENCED_RESIDUAL_REDUCTION'))residuals.push({id:'R314-NO-GAIN-LAW',severity:'CRITICAL',mode:'BLOCK',summary:'Convergence master lacks measurable residual reduction law',source:'src/convergenceMasterR314.ts'});
 if(!masterSource.includes('SYNCHRONOUS_DATA_REQUIRES_EXPLICIT_CLOCK_FRAME_UNIT_AND_PROVENANCE_BINDING'))residuals.push({id:'R314-SYNC-SPINE-LAW',severity:'HIGH',mode:'QUEUE_FOR_REVIEW',summary:'Convergence master lacks explicit synchronous clock/frame/unit/provenance binding',source:'src/convergenceMasterR314.ts'});

 const vector=residualVectorR314({state:residuals.some(row=>row.mode==='BLOCK')?'HOLD':residuals.length?'TURN':'STAY',residuals});
 return {
  schema:'OMEGA_R314_CONVERGENCE_AUDIT',
  generatedAt:new Date().toISOString(),
  counts:{capabilities,archiveFamilies:archives.length,buildStages:stages.length,selfBuildCapsules:roadmap.length,realSourceTargets:realTargets.length,targetFamilies:targetFamilies.length},
  ids:{archiveFamilies:archives,buildStages:stages},
  selfBuild:{active:Boolean(state?.active),generation:Number(state?.generation||0),maxAutonomousGenerations:Number(state?.maxAutonomousGenerations||0),capsules:roadmap.map(row=>({id:row.id,target:row.target,status:row.status||null,repairId:row.repairId||null,mutationClass:row.mutationClass||null})),realSourceTargets:realTargets.map(row=>row.target)},
  residuals:vector.residuals,
  state:vector.state,
  pressure:vector.pressure,
  blocking:vector.blocking,
  fingerprint:vector.fingerprint,
  truthBoundary:'Static source audit only. It does not claim runtime, production, device, scientific, renderer, solver or CanonState proof.',
 };
}

if(import.meta.url===new URL(`file://${process.argv[1]}`).href){
 const args=parseArgs(process.argv.slice(2));
 const result=auditR314();
 const body=JSON.stringify(result,null,args.pretty?2:0)+'\n';
 if(args.out){fs.mkdirSync(path.dirname(args.out),{recursive:true});fs.writeFileSync(args.out,body)}
 process.stdout.write(body);
}
