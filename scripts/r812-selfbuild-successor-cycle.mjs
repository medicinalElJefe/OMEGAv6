import fs from 'node:fs';
import path from 'node:path';
import {evaluateSuccessorCycleR535} from '../src/system/selfBuildSuccessorAdmissionR535.js';
import {verifySuccessorSourcesR542} from '../src/system/selfBuildSourceBytesProofR542.js';

export const R812_SCHEMA='OMEGA_GOVERNED_SUCCESSOR_CYCLE_R812';
/** Prepare a new bounded candidate cycle. Does not mutate the prior state or admit source. */
export function prepareSuccessorCycleR812({priorState,manifest,root=process.cwd()}){
 const bytes=verifySuccessorSourcesR542(manifest,{root});
 const admission=evaluateSuccessorCycleR535({priorState,capsules:manifest?.capsules,sourceProofs:manifest?.sourceProofs,deploymentProof:manifest?.deploymentProof});
 const reasons=[...bytes.reasons,...admission.reasons];
 // A manifest-supplied deploymentProof is a claim, not an independently checked GitHub/Worker receipt.
 // Never issue a pipeline-ready decision from self-asserted production evidence.
 const sourceReady=bytes.valid&&admission.status==='READY_FOR_SEPARATE_GOVERNED_REVIEW';
 const ready=false; // Source-only evaluation cannot authorize promotion.
 const cycle=ready?{
  schema:R812_SCHEMA,revision:'R812',active:true,generation:0,maxAutonomousGenerations:manifest.capsules.length,
  currentCapsuleId:null,admittedSourceCapsules:[],receipts:[],
  predecessor:{schema:priorState.schema||null,generation:priorState.generation,admittedSourceCapsules:[...priorState.admittedSourceCapsules],productionSha:manifest.deploymentProof.exactPromotedSha},
  roadmap:admission.executionOrder.map(id=>{
   const capsule=manifest.capsules.find(c=>c.id===id);
   const proof=bytes.checked.find(p=>p.capsuleId===id);
   return{id,title:String(capsule.title||id),target:capsule.target,prerequisites:[...capsule.prerequisites],sourceSha256:proof.actualSha256,risk:'REVIEW_REQUIRED'};
  }),
  sourceMutationAuthorized:false,canonicalAdmission:false,productionAdmissionAuthorized:false,
  requiresR245GeneratorExtension:true,requiresR503WorkerAdmission:true,requiresR164ResidualGate:true
 }:null;
 return{schema:R812_SCHEMA,status:sourceReady?'SOURCE_VERIFIED_AWAITING_INDEPENDENT_PRODUCTION_PROOF':'HELD',reasons:sourceReady?[...reasons,'INDEPENDENT_PRODUCTION_PROOF_REQUIRED']:reasons,sourceProof:bytes,admission,cycle};
}

/** Only a trusted external verifier may authorize the successor proposal.
 * The verifier must independently query the exact GitHub production run and live
 * deployment; values copied from the candidate manifest are never evidence. */
export async function verifyAndPrepareSuccessorCycleR812({priorState,manifest,root=process.cwd(),verifyProduction}){
 const source=prepareSuccessorCycleR812({priorState,manifest,root});
 if(source.status!=='SOURCE_VERIFIED_AWAITING_INDEPENDENT_PRODUCTION_PROOF')return source;
 if(typeof verifyProduction!=='function')return source;
 let proof;
 try{proof=await verifyProduction({expectedSha:manifest.deploymentProof.exactPromotedSha})}
 catch{return{...source,status:'HELD',reasons:[...source.reasons,'INDEPENDENT_PRODUCTION_QUERY_FAILED']}}
 const sha=manifest.deploymentProof.exactPromotedSha;
 const verified=proof?.verified===true&&proof?.source==='GITHUB_CI_AND_LIVE_WORKER'&&
  proof?.exactPromotedSha===sha&&proof?.liveRuntimeSha===sha&&
  proof?.productionBrowserVerified===true&&proof?.githubRunConclusion==='success'&&
  typeof proof?.githubRunId==='number'&&Number.isSafeInteger(proof.githubRunId)&&proof.githubRunId>0;
 if(!verified)return{...source,status:'HELD',reasons:[...source.reasons,'INDEPENDENT_PRODUCTION_PROOF_INVALID']};
 const admission=source.admission;
 const cycle={
  schema:R812_SCHEMA,revision:'R812',active:false,generation:0,maxAutonomousGenerations:manifest.capsules.length,
  currentCapsuleId:null,admittedSourceCapsules:[],receipts:[],
  predecessor:{schema:priorState.schema||null,generation:priorState.generation,admittedSourceCapsules:[...priorState.admittedSourceCapsules],productionSha:sha,githubRunId:proof.githubRunId},
  roadmap:admission.executionOrder.map(id=>{
   const capsule=manifest.capsules.find(c=>c.id===id);
   const row=source.sourceProof.checked.find(p=>p.capsuleId===id);
   return{id,title:String(capsule.title||id),target:capsule.target,prerequisites:[...capsule.prerequisites],sourceSha256:row.actualSha256,risk:'REVIEW_REQUIRED'};
  }),
  sourceMutationAuthorized:false,canonicalAdmission:false,productionAdmissionAuthorized:false,
  requiresR245GeneratorExtension:true,requiresR503WorkerAdmission:true,requiresR164ResidualGate:true
 };
 return{...source,status:'VERIFIED_FOR_SEPARATE_GOVERNED_REVIEW',reasons:[],cycle,independentProductionProof:{githubRunId:proof.githubRunId,exactPromotedSha:sha}};
}

export function writeSuccessorProposalR812({priorState,manifest,root=process.cwd(),output}){
 const result=prepareSuccessorCycleR812({priorState,manifest,root});
 if(!result.cycle)return result;
 if(!output)throw Error('Explicit output path required');
 const target=path.resolve(output),trusted=path.resolve(root);
 if(!target.startsWith(trusted+path.sep))throw Error('Output must remain inside checkout');
 if(fs.existsSync(target))throw Error('Refusing to overwrite an existing successor proposal');
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(result.cycle,null,2)+'\n',{flag:'wx'});
 return result;
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const [manifestPath,outputPath]=process.argv.slice(2);
 if(!manifestPath||!outputPath)throw Error('Usage: node scripts/r812-selfbuild-successor-cycle.mjs manifest.json proposal.json');
 const root=process.cwd();
 const priorState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const result=writeSuccessorProposalR812({priorState,manifest,root,output:outputPath});
 console.log(JSON.stringify({status:result.status,reasons:result.reasons,output:result.cycle?outputPath:null}));
 if(!result.cycle)process.exitCode=2;
}
