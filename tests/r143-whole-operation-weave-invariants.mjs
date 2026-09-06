import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyNodeReceiptR143,compileWholeOperationWeaveR143,computeRelativityScaleR143,dependencyStateR143,joinWholeOperationWeaveR143,manifestR143} from '../src/wholeOperationWeaveR143.js';
import {applyWholeOperationReceiptR143,createWholeOperationRunR143,joinWholeOperationRunR143,setWholeOperationHostPlanR143} from '../src/wholeOperationStoreR143.js';

const must=(ok,msg)=>assert.ok(ok,'R143 '+msg),read=p=>fs.readFileSync(p,'utf8');
class RuntimeMock{constructor(){this.store=new Map();this.events=[]}async get(k,f){return this.store.has(k)?this.store.get(k):f}async put(k,v){this.store.set(k,v)}async event(type,message,data={}){const e={type,message,data};this.events.push(e);return e}}
const fixed='2026-09-06T22:30:00.000Z';
const healthy={swarmBinding:true,machine:{nodes:{genesis:{state:'LIVE'},optical:{state:'LIVE'}}},hybrid:{nativeExecutionClaimed:true,devices:[{id:'pc-1',online:true,revoked:false}]},federation:{runtime:{rcwa:{state:'LIVE'}}},rcwaState:'LIVE'};

const max=computeRelativityScaleR143('deep full uncertain causal optical fabrication research build verify on PC',{requestedScale:20736});
must(max.logicalScale===20736&&max.swarmCells===1728&&max.lanesPerCell===12,'20,736 logical scale must resolve as 1,728 cells × 12 lanes');
must(max.truthBoundary.includes('not a claim of physical dimensions'),'logical scale must never masquerade as physical dimension count');

const full=compileWholeOperationWeaveR143({intentId:'full-test',intent:'generate etched optical candidates, screen them, validate RCWA, then build and test the approved result on the PC with deep causal proof',createdAt:fixed,joinEventTime:Date.parse(fixed),hints:{requestedScale:20736},snapshot:healthy});
for(const id of ['N00_FRAME','N10_SWARM','N20_PROPOSE','N30_SCREEN','N35_FULLWAVE','N40_HOST','N80_JOIN','N90_ADMISSION'])must(full.nodes.some(x=>x.id===id),'full graph missing '+id);
must(full.nodes.find(x=>x.id==='N40_HOST').state==='AVAILABLE','current authenticated non-revoked PC heartbeat must expose host node as available');
must(full.nodes.find(x=>x.id==='N90_ADMISSION').state==='HELD_FOR_R125','R143 cannot self-admit');
must(full.edges.every(e=>['invariant','scar','proof','source','causal-frame'].every(x=>e.carry.includes(x))),'every graph edge must carry full Woven Continuity evidence classes');

const unproved=compileWholeOperationWeaveR143({intentId:'gated-test',intent:'generate optical candidate, screen and build it on PC',createdAt:fixed,joinEventTime:Date.parse(fixed),snapshot:{swarmBinding:true,machine:{nodes:{genesis:{state:'UNREACHABLE'},optical:{state:'LIVE'}}},hybrid:{nativeExecutionClaimed:true,devices:[{id:'pc-1',online:false,revoked:false}]},federation:{runtime:{rcwa:{state:'UNKNOWN'}}}}});
must(unproved.nodes.find(x=>x.id==='N20_PROPOSE').state==='UNAVAILABLE','unproved Genesis must remain unavailable');
must(unproved.nodes.find(x=>x.id==='N40_HOST').state==='UNAVAILABLE','nativeExecutionClaimed without current online device must not satisfy Sovereign node');
must(dependencyStateR143(unproved,'N30_SCREEN').reason.includes('N20_PROPOSE_UNAVAILABLE'),'unavailable proposal must causally block screen child');

let residual=applyNodeReceiptR143(full,'N00_FRAME',{state:'VERIFIED',verified:true,proofRef:'frame-proof',source:'test'});
residual=applyNodeReceiptR143(residual,'N10_SWARM',{state:'VERIFIED',verified:true,proofRef:'swarm-proof',source:'test'});
residual=applyNodeReceiptR143(residual,'N20_PROPOSE',{state:'FAILED',verified:false,scarIds:['proposal-failed'],source:'test'});
must(!dependencyStateR143(residual,'N30_SCREEN').ready,'failed parent must block child execution');
residual=applyNodeReceiptR143(residual,'N30_SCREEN',{state:'STALE',verified:false,scarIds:['screen-stale'],source:'R143_CAUSAL_DEPENDENCY_GATE'});
residual=applyNodeReceiptR143(residual,'N35_FULLWAVE',{state:'STALE',verified:false,scarIds:['solver-stale'],source:'R143_CAUSAL_DEPENDENCY_GATE'});
residual=applyNodeReceiptR143(residual,'N40_HOST',{state:'STALE',verified:false,scarIds:['host-stale'],source:'R143_CAUSAL_DEPENDENCY_GATE'});
must(dependencyStateR143(residual,'N80_JOIN').ready,'terminal failures/stale descendants must not deadlock residual join');
const j1=await joinWholeOperationWeaveR143(residual,null),j2=await joinWholeOperationWeaveR143(residual,null);
must(j1.state==='HELD_WITH_RESIDUALS'&&j1.scarIds.length>=4,'join must preserve failed/stale residual scars');
must(j1.finalHeadSha256===j2.finalHeadSha256&&j1.joinDigest===j2.joinDigest,'same graph + evidence must deterministically reproduce continuity head and join digest');
must(j1.worldHead?.schema==='OMEGA_CANONICAL_WORLD_CONTINUITY_R134','join must return exact full R134 world head');
must(j1.canonicalMutation===false&&j1.canonicalAdmissionAuthority==='R125','join remains evidence, not CanonState');

const runtime=new RuntimeMock(),run=await createWholeOperationRunR143(runtime,{runId:'run-1',graph:compileWholeOperationWeaveR143({intentId:'store-test',intent:'verify one system fact',createdAt:fixed,joinEventTime:Date.parse(fixed),hints:{requestedScale:1},snapshot:healthy}),confirmedGraph:true});
must(run.graph.nodes.find(x=>x.id==='N00_FRAME').state==='VERIFIED','durable run creation must freeze and verify the departure frame');
const hostAttach=await setWholeOperationHostPlanR143(runtime,'run-1',{steps:[{id:'S01',op:'WAIT',ms:250}]},true);must(hostAttach?.error==='HOST_NODE_NOT_PRESENT','host plan cannot be attached to a graph without a host node');
let stored=await applyWholeOperationReceiptR143(runtime,'run-1','N80_JOIN',{state:'VERIFIED',verified:true,source:'test'});must(stored?.error==='DEPENDENCY_NOT_READY','direct join receipt cannot bypass dependencies');
const joined1=await joinWholeOperationRunR143(runtime,'run-1'),joined2=await joinWholeOperationRunR143(runtime,'run-1');must(joined1.joinReceipt?.finalHeadSha256===joined2.joinReceipt?.finalHeadSha256,'durable join must be idempotent');must(runtime.store.get('r143WorldHead')?.headSha256===joined1.joinReceipt.finalHeadSha256,'durable store must persist exact full final world head');

const worker=read('src/workerR116.js'),executor=read('src/wholeOperationExecutorR143.js'),api=read('src/wholeOperationApiR143.js'),store=read('src/wholeOperationStoreR143.js'),wrangler=read('wrangler.jsonc');
must(worker.includes("import {wholeOperationApiR143}")&&worker.includes("path.startsWith('/api/operation-weave/r143')"),'production Worker must mount R143 public API');
must(worker.includes('export class OmegaRuntime extends OmegaRuntimeR115'),'existing Durable Object inheritance spine must remain intact');
must(worker.includes("path.startsWith('/operation-weave/')")&&worker.includes('await this.authorized(request)'),'durable R143 run state must reuse existing bridge-secret authorization');
must(executor.includes('OMEGA_SWARM_COORDINATOR')&&executor.includes('OMEGA_GENESIS_MACHINE')&&executor.includes('OMEGA_OPTICAL_MACHINE'),'R143 executor must use real installed swarm/Genesis/Optical bindings');
must(executor.includes('/api/federation/rcwa/queue')&&executor.includes('/api/federation/rcwa/result/'),'R143 executor must use enacted RCWA transport');
must(executor.includes("if(!run.hostPlan?.confirmed)return")&&executor.includes('R141_EXACT_PAYLOAD_PROOF_CLOSURE'),'native execution must require explicit host plan and R141 proof closure');
must(executor.includes('R143_CAUSAL_DEPENDENCY_GATE')&&executor.includes("state:'STALE'"),'causally impossible descendants must become visible stale scars');
must(api.includes('R143_EXPLICIT_GRAPH_CONFIRMATION_REQUIRED')&&api.includes('R143_EXPLICIT_HOST_PLAN_CONFIRMATION_REQUIRED'),'public API must keep planning separate from execution/native authorization');
must(store.includes('if(run.joinReceipt)return run')&&store.includes("joinReceipt.worldHead"),'durable join must be idempotent and persist exact world head');
must(wrangler.includes('"main": "src/workerR116.js"'),'R143 must not replace proven Worker entrypoint');
for(const binding of ['OMEGA_RUNTIME','OMEGA_SWARM_CELL','OMEGA_SWARM_COORDINATOR','OMEGA_SWARM_BRANCH','OMEGA_SWARM_ORGAN','OMEGA_SWARM_ORGANISM','OMEGA_SWARM_AUTONOMIC'])must(wrangler.includes(`"name": "${binding}"`),'existing provisioned Durable Object binding lost: '+binding);
const manifest=manifestR143();must(manifest.canonicalMutation===false&&manifest.canonicalAdmissionAuthority==='R125','manifest must preserve R125 admission authority');
console.log('R143 WHOLE OPERATION WEAVE PASS · adaptive 1→12→144→1728→20736 logical compute · real swarm/machine/RCWA/Hybrid paths · causal stale propagation · deterministic residual join · exact R134 world head · no new Durable Object authority · R125 admission preserved');
