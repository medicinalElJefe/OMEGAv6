import assert from 'node:assert/strict';
import {
 advanceSovereignMissionR153,
 discoverProjectFromSearchR153,
 manifestR153,
 R153_DISCOVERY_SIGNATURE_QUERY,
 R153_MISSION_SCHEMA
} from '../src/execution/adaptiveSovereignMissionR153.js';

const must=(value,message)=>assert.ok(value,'R180.1 '+message);
class Runtime{
 constructor(){
  this.map=new Map();this.events=[];
  this.deviceRows=[{id:'pc-r1801',online:true,revoked:false,capabilityRevision:'R132',capabilities:['INDEX','HASH_TREE','SEARCH_TEXT','READ_TEXT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT']}];
 }
 async get(key,fallback){return this.map.has(key)?structuredClone(this.map.get(key)):fallback}
 async put(key,value){this.map.set(key,structuredClone(value))}
 async devices(){return structuredClone(this.deviceRows)}
 async event(type,message,data={}){this.events.push({type,message,data})}
}

const runtime=new Runtime();
const mission={id:'mission-r1801',schema:R153_MISSION_SCHEMA,status:'ACTIVE',stage:'PROJECT_DISCOVERY',cycle:2,maxCycles:12,targetDeviceId:'pc-r1801',allowedOps:['INDEX','HASH_TREE','SEARCH_TEXT','READ_TEXT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'],objective:'Build the actual OMEGA project from returned host proof',currentJobId:'job-index-sample',projectPath:'.',history:[],repairAttempts:0,discoveryFallbackAttempts:0,canonicalMutation:false};
const sampledIndex={id:'job-index-sample',status:'COMPLETE',projectPath:'.',steps:[{id:'D01',op:'INDEX',path:'unrelated'}],returnPacket:{resultFingerprint:'a'.repeat(64),stepProofs:[{id:'D01',op:'INDEX',ok:true,result:{files:4,sample:[{path:'notes.txt'}]}}]}};
await runtime.put('missions',[mission]);await runtime.put('jobs',[sampledIndex]);

let next=await advanceSovereignMissionR153(runtime,sampledIndex);
assert.equal(next.status,'ACTIVE');
assert.equal(next.stage,'SIGNATURE_DISCOVERY');
assert.equal(next.discoveryFallbackAttempts,1);
assert.deepEqual(next.currentJob.steps.map(step=>step.op),['SEARCH_TEXT']);
assert.equal(next.currentJob.steps[0].path,'.');
assert.equal(next.currentJob.steps[0].query,R153_DISCOVERY_SIGNATURE_QUERY);
must(next.currentJob.steps[0].query.includes('omegav6-full-restore'),'current OMEGAv6 package signature must be searched');
must(next.canonicalMutation!==true,'discovery recovery must not mutate CanonState');

const searchJob=next.currentJob;
const returnedSearch={...searchJob,status:'COMPLETE',completedAt:Date.now(),returnPacket:{resultFingerprint:'b'.repeat(64),stepProofs:[{id:'Q01',op:'SEARCH_TEXT',ok:true,result:{query:R153_DISCOVERY_SIGNATURE_QUERY,matches:[{path:'docs/history.md',line:2,text:'omegav6-full-restore'},{path:'OMEGAv6/package.json',line:1,text:'{"name":"omegav6-full-restore"}'}]}}]}};
let jobs=await runtime.get('jobs',[]);jobs=jobs.map(job=>job.id===searchJob.id?returnedSearch:job);await runtime.put('jobs',jobs);
const discovered=discoverProjectFromSearchR153(returnedSearch);
assert.equal(discovered.path,'OMEGAv6');
assert.equal(discovered.manifest,'OMEGAv6/package.json');
assert.equal(discovered.kind,'NODE');

next=await advanceSovereignMissionR153(runtime,returnedSearch);
assert.equal(next.status,'ACTIVE');
assert.equal(next.stage,'NODE_PREFLIGHT');
assert.equal(next.projectPath,'OMEGAv6');
assert.equal(next.projectManifest,'OMEGAv6/package.json');
assert.deepEqual(next.currentJob.steps.map(step=>step.op),['HASH_TREE','READ_TEXT']);
assert.equal(next.currentJob.steps[1].path,'OMEGAv6/package.json');

const manifest=manifestR153();
must(manifest.stages.includes('SIGNATURE_DISCOVERY'),'manifest must expose bounded signature discovery stage');
assert.equal(manifest.discovery.signatureFallbackAttempts,1);
assert.equal(manifest.discovery.signatureFallbackOp,'SEARCH_TEXT');
assert.equal(manifest.discovery.mutationAllowed,false);
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');

console.log('R180.1 HYBRID BUILDOUT DISCOVERY PASS · incomplete broad INDEX sample -> one bounded SEARCH_TEXT proof -> real OMEGAv6 manifest -> original NODE_PREFLIGHT chain · current heartbeat capability gate preserved · no guessed path · no CanonState mutation');
