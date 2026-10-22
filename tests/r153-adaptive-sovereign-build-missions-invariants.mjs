import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 advanceSovereignMissionR153,
 candidateRootsR153,
 discoverProjectR153,
 extractErrorPathsR153,
 manifestR153,
 nodeVerificationOpsR153,
 tagSovereignMissionR153,
 validatePatchProposalR153,
 R153_MAX_CYCLES,
 R153_MISSION_SCHEMA,
 R153_REVISION,
 R153_SOURCE_SCHEMA
} from '../src/execution/adaptiveSovereignMissionR153.js';

const must=(v,m)=>assert.ok(v,'R153 '+m);
class Runtime{
 constructor(){
  this.map=new Map();this.events=[];
  this.deviceRows=[{id:'pc-r153',name:'OMEGA PC',online:true,revoked:false,lastSeen:Date.now(),capabilityRevision:'R132',capabilities:['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT']}];
  this.env={AI:{run:async()=>({response:JSON.stringify({patches:[{path:'OMEGAv6/src/App.tsx',replacements:[{find:'const broken = true;',replace:'const broken = false;'}]}]})})}};
 }
 async get(k,fallback){return this.map.has(k)?structuredClone(this.map.get(k)):fallback}
 async put(k,v){this.map.set(k,structuredClone(v))}
 async event(type,message,data={}){this.events.push({type,message,data});return this.events.at(-1)}
 async devices(){return structuredClone(this.deviceRows)}
}
const packet=(stepProofs,log='')=>({resultFingerprint:'f'.repeat(64),stepProofs,outputPaths:[],log});

assert.equal(R153_REVISION,'R153');assert.equal(R153_MAX_CYCLES,12);
const mf=manifestR153();assert.equal(mf.maxCycles,12);assert.equal(mf.canonicalMutation,false);assert.equal(mf.canonicalAdmissionAuthority,'R125');assert.equal(mf.repair.maxAttempts,2);

const discoveryJob={projectPath:'.',steps:[{id:'S01',op:'INDEX',path:'.'}],returnPacket:packet([{id:'S01',op:'INDEX',ok:true,result:{sample:[{path:'archive/old/package.json'},{path:'OMEGAv6/src/App.tsx'},{path:'OMEGAv6/package.json'},{path:'other/requirements.txt'}]}}])};
const project=discoverProjectR153(discoveryJob);assert.equal(project.path,'OMEGAv6');assert.equal(project.manifest,'OMEGAv6/package.json');assert.equal(project.kind,'NODE');
const roots=candidateRootsR153(discoveryJob);assert.equal(roots[0],'OMEGAv6');must(roots.includes('other'),'candidate root derived from returned host index');

const errorJob={projectPath:'OMEGAv6',returnPacket:packet([{id:'S02',op:'BUILD',ok:false,error:'Build failed at src/App.tsx:12:7 and src/Other.ts:3'}],'src/App.tsx:12')};
assert.deepEqual(extractErrorPathsR153(errorJob),['OMEGAv6/src/App.tsx','OMEGAv6/src/Other.ts']);
const nodeJob={returnPacket:packet([{id:'S02',op:'READ_TEXT',ok:true,result:{text:JSON.stringify({scripts:{build:'vite build',check:'tsc -b'}})}}])};assert.deepEqual(nodeVerificationOpsR153(nodeJob),['BUILD','TEST']);
const ev=[{path:'OMEGAv6/src/App.tsx',sha256:'a'.repeat(64),text:'const broken = true;\n'}];
const patch=validatePatchProposalR153({patches:[{path:'OMEGAv6/src/App.tsx',replacements:[{find:'const broken = true;',replace:'const broken = false;'}]}]},ev);assert.equal(patch.length,1);assert.equal(patch[0].op,'APPLY_PATCH');assert.equal(patch[0].expectedSha256,'a'.repeat(64));assert.equal(patch[0].replacements[0].occurrences,1);assert.equal(validatePatchProposalR153({patches:[{path:'OMEGAv6/src/Missing.tsx',replacements:[{find:'x',replace:'y'}]}]},ev).length,0);

const runtime=new Runtime();
const baseMission={id:'mission-r153',schema:'OMEGA_MISSION_JOB_R32',objective:'Build OMEGA fully',status:'ACTIVE',targetDeviceId:'pc-r153',allowedOps:['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'],maxCycles:8,cycle:1,currentJobId:'job-discovery',currentJob:null,createdAt:Date.now()};
await runtime.put('missions',[baseMission]);await runtime.put('jobs',[]);
let mission=await tagSovereignMissionR153(runtime,{maxCycles:18,draft:{schema:R153_SOURCE_SCHEMA,projectPath:'.'}},baseMission);assert.equal(mission.schema,R153_MISSION_SCHEMA);assert.equal(mission.stage,'DISCOVERY');assert.equal(mission.maxCycles,12);

let job={id:'job-discovery',status:'COMPLETE',projectPath:'.',steps:[{id:'S01',op:'INDEX',path:'.'},{id:'S02',op:'HASH_TREE',path:'.'}],completedAt:Date.now(),returnPacket:packet([{id:'S01',op:'INDEX',ok:true,result:{sample:[{path:'OMEGAv6/package.json'},{path:'OMEGAv6/src/App.tsx'}]}},{id:'S02',op:'HASH_TREE',ok:true,result:{treeSha256:'1'.repeat(64),files:2}}])};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.stage,'NODE_PREFLIGHT');assert.equal(mission.cycle,2);assert.equal(mission.projectPath,'OMEGAv6');must(mission.currentJob.steps.some(s=>s.op==='READ_TEXT'&&s.path==='OMEGAv6/package.json'),'Node manifest preflight queued from host discovery');

job={...mission.currentJob,status:'COMPLETE',completedAt:Date.now(),returnPacket:packet([{id:'S01',op:'HASH_TREE',ok:true,result:{treeSha256:'2'.repeat(64)}},{id:'S02',op:'READ_TEXT',ok:true,result:{sha256:'b'.repeat(64),text:JSON.stringify({scripts:{build:'vite build',check:'tsc -b'}})}}])};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.stage,'BUILD_VERIFY');assert.deepEqual(mission.verifyOps,['BUILD','TEST']);must(mission.currentJob.steps.some(s=>s.op==='BUILD'),'declared build queued');must(mission.currentJob.steps.some(s=>s.op==='TEST'),'declared verification queued');

job={...mission.currentJob,status:'FAILED',completedAt:Date.now(),returnPacket:packet([{id:'S01',op:'HASH_TREE',ok:true,result:{treeSha256:'3'.repeat(64)}},{id:'S02',op:'BUILD',ok:false,error:'src/App.tsx:12:7 Type error'}],'src/App.tsx:12:7 Type error')};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.stage,'REPAIR_READ');assert.equal(mission.currentJob.steps.length,1);assert.equal(mission.currentJob.steps[0].op,'READ_TEXT');assert.equal(mission.currentJob.steps[0].path,'OMEGAv6/src/App.tsx');

job={...mission.currentJob,status:'COMPLETE',completedAt:Date.now(),returnPacket:packet([{id:'R01',op:'READ_TEXT',ok:true,result:{sha256:'a'.repeat(64),text:'const broken = true;\n'}}])};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.stage,'REPAIR_VERIFY');assert.equal(mission.repairAttempts,1);const patchStep=mission.currentJob.steps.find(s=>s.op==='APPLY_PATCH');must(patchStep,'exact patch queued');assert.equal(patchStep.path,'OMEGAv6/src/App.tsx');assert.equal(patchStep.expectedSha256,'a'.repeat(64));must(mission.currentJob.steps.some(s=>s.op==='BUILD'),'repair cycle rebuilds');must(mission.currentJob.steps.some(s=>s.op==='TEST'),'repair cycle re-verifies');

job={...mission.currentJob,status:'COMPLETE',completedAt:Date.now(),returnPacket:packet(mission.currentJob.steps.map(s=>({id:s.id,op:s.op,ok:true,result:s.op==='HASH_TREE'?{treeSha256:'4'.repeat(64)}:{}})))};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.stage,'PACKAGE');assert.deepEqual(mission.currentJob.steps.map(s=>s.op),['PACKAGE','SUPPORT_BUNDLE']);

job={...mission.currentJob,status:'COMPLETE',completedAt:Date.now(),returnPacket:packet([{id:'S01',op:'PACKAGE',ok:true,result:{path:'.omega_hybrid/packages/OMEGAv6.zip',sha256:'5'.repeat(64)}},{id:'S02',op:'SUPPORT_BUNDLE',ok:true,result:{path:'.omega_hybrid/packages/OMEGAv6_support.zip',sha256:'6'.repeat(64)}}])};
mission=await advanceSovereignMissionR153(runtime,job);assert.equal(mission.status,'COMPLETE');assert.equal(mission.stage,'COMPLETE');assert.equal(mission.finalResultFingerprint,'f'.repeat(64));assert.equal(mission.history.length,6);assert.equal(new Set(mission.history.map(x=>x.jobId)).size,6,'each returned host job appears once in mission history');
const stored=(await runtime.get('missions',[])).find(m=>m.id==='mission-r153');assert.equal(stored.status,'COMPLETE');must(runtime.events.some(e=>e.type==='R153_MISSION_COMPLETE'),'completion receipt emitted');

const worker=fs.readFileSync('src/workerR116.js','utf8'),shim=fs.readFileSync('src/execution/adaptiveSovereignMissionR152.js','utf8');
for(const token of ["from './execution/adaptiveSovereignMissionR152.js'",'tagSovereignMissionR152','advanceSovereignMissionR152','hydrateSovereignMissionsR152','resumeSovereignMissionR152','x-omega-sovereign-mission','adaptiveSovereignMission:manifestR152()'])must(worker.includes(token),'R116 compatibility mount missing '+token);
for(const token of ['advanceSovereignMissionR153 as advanceSovereignMissionR152','R153_REVISION as R152_REVISION',"from './adaptiveSovereignMissionR153.js'"])must(shim.includes(token),'R153 compatibility shim missing '+token);
must(!fs.existsSync('src/workerR153.js'),'R153 must extend the proven R116 Durable Object instead of creating a shadow production Worker');
console.log('R153 ADAPTIVE SOVEREIGN BUILD MISSIONS PASS · current R152 optical convergence preserved · authenticated host return advances discovery -> preflight -> build/test -> preimage-bound repair -> rebuild/test -> package -> explicit COMPLETE · 12-cycle bounded envelope supports two repair attempts · R125 admission unchanged');
