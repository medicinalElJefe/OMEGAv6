import './r294-returned-evidence-closure-invariants.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activateProofCarryR292,clearActiveProofCarryR292,compileProofCarryR292} from '../src/proof/proofCarryRuntimeR292.js';
import {activeProofEvolutionSnapshotR293,compileProofEvolutionR293,PROOF_EVOLUTION_BOUNDARY_R293,PROOF_EVOLUTION_SCHEMA_R293} from '../src/proof/proofEvolutionRuntimeR293.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
globalThis.window={dispatchEvent:()=>true};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail}};

const packet=compileProofCarryR292({
 domainId:'TEST/PROOF',claimId:'R293_TEST',claimLabel:'R293 test claim',claimStatus:'OPEN',
 requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
 gates:[{id:'G1',status:'PASS'},{id:'G2',status:'OPEN',detail:'global closure missing'}],
 partitions:[{id:'P1',terminal:true,exhaustive:true},{id:'P2',terminal:true,exhaustive:false,scope:'unclosed family'}],
 transforms:[{id:'T1',preservesInvariant:true,domainMapVerified:true}],
 sources:[{id:'S1',authority:'PEER_REVIEWED'},{id:'S2',status:'SOURCE_MISSING',label:'missing forensic source'}],
 exactChecks:[{id:'E1',pass:true},{id:'E2',pass:false,detail:'replay needed'}]
});
assert.equal(packet.promotionEligible,false);
assert.equal(packet.decision,'ESCALATE');
assert(packet.unresolvedScars.some(x=>x.kind==='SOURCE'&&x.id==='S2'),'source-lineage gaps must survive as first-class proof scars');

const boundPacket={...packet,bound:true,routingSupport:.35+.65*packet.metrics.supportScore,supportScore:packet.metrics.supportScore,scarPressure:packet.metrics.scarPressure};
const evolution=compileProofEvolutionR293(boundPacket);
const replay=compileProofEvolutionR293(boundPacket);
assert.equal(evolution.schema,PROOF_EVOLUTION_SCHEMA_R293);
assert.equal(evolution.bound,true);
assert.equal(evolution.promotionEligible,false);
assert.equal(evolution.fingerprint,replay.fingerprint,'same proof context must compile to the same R293 work graph');
assert.deepEqual(evolution.cells,replay.cells,'proof-directed work ordering/addressing must be deterministic');
assert(evolution.cells.length>=4,'open gate, partition, source, and exact-check scars must become work cells');
assert(evolution.cells.some(x=>x.operation==='SOURCE_RECOVERY'));
assert(evolution.cells.some(x=>x.operation==='EXHAUSTIVE_PARTITION'));
assert(evolution.cells.some(x=>x.operation==='EXACT_REPLAY'));
for(const cell of evolution.cells){
 assert(cell.address.address>=0&&cell.address.address<1728,'R293 work cell must stay in the sparse 1,728-cell address space');
 assert(cell.address.laneStart>=0&&cell.address.laneEnd<20736,'R293 work lanes must stay inside the 20,736 planning lattice');
 assert.equal(cell.canonicalMutation,false);
 assert.equal(cell.sourcePromotionAuthority,false);
 assert.equal(cell.productionAuthority,false);
 assert.equal(cell.evidenceCreated,false);
}
assert.match(PROOF_EVOLUTION_BOUNDARY_R293,/does not create evidence/);
assert.equal(evolution.authority.canonAdmission,'R125');
assert.equal(evolution.authority.productionWriter,'.github/workflows/ci.yml');

clearActiveProofCarryR292();
const neutral=activeProofEvolutionSnapshotR293();
assert.equal(neutral.bound,false);
assert.equal(neutral.cells.length,0);
assert.equal(neutral.supportScore,1);
activateProofCarryR292(packet);
const live=activeProofEvolutionSnapshotR293();
assert.equal(live.bound,true);
assert.equal(live.claimId,'R293_TEST');
assert.equal(live.cells.length,evolution.cells.length);
clearActiveProofCarryR292();

const modes=fs.readFileSync('src/fullModeConvergenceRuntime.ts','utf8');
const woven=fs.readFileSync('src/wovenContinuityRuntimeR77.ts','utf8');
const selfBuild=fs.readFileSync('src/RecursiveSelfBuildR240.tsx','utf8');
const workbench=fs.readFileSync('src/SingmasterProofWorkbenchR290.tsx','utf8');
for(const token of ['activeProofEvolutionSnapshotR293',"id:'proof-evolution'",'proofEvolution:{','R293 additionally compiles unresolved scars into deterministic work cells'])assert(modes.includes(token),`ALL MODES missing ${token}`);
for(const token of ['activeProofEvolutionSnapshotR293','proofEvolution:{','R293 carries its unresolved scars into deterministic research work cells'])assert(woven.includes(token),`Woven continuity missing ${token}`);
for(const token of ['activeProofEvolutionSnapshotR293','R293 PROOF-DIRECTED FRONTIER','RESEARCH PLANNING ONLY','not a shadow source-mutation queue'])assert(selfBuild.includes(token),`recursive self-build surface missing ${token}`);
for(const token of ['compileProofEvolutionR293','R293 PROOF-DIRECTED FRONTIER','proofEvolutionFingerprint','deterministic work'])assert(workbench.includes(token),`Singmaster workbench missing ${token}`);

console.log('R293 PROOF-DIRECTED EVOLUTION PASS');
console.log(JSON.stringify({cells:evolution.cells.length,frontier:evolution.frontier.length,operations:evolution.operationCounts,support:evolution.supportScore,scarPressure:evolution.scarPressure}));
