import assert from 'node:assert/strict';
import fs from 'node:fs';
import {activeProofCarrySnapshotR292,activateProofCarryR292,clearActiveProofCarryR292,compileProofCarryR292,readActiveProofCarryR292} from '../src/proof/proofCarryRuntimeR292.js';

const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
globalThis.window={dispatchEvent:()=>true};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail}};

const closed=compileProofCarryR292({
 domainId:'TEST',claimId:'CLOSED',claimLabel:'Closed packet',claimStatus:'CANDIDATE',
 requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
 gates:[{id:'G1',status:'PASS'},{id:'G2',status:'ESTABLISHED_EXTERNAL'}],
 partitions:[{id:'P1',terminal:true,exhaustive:true}],
 transforms:[{id:'T1',preservesInvariant:true,domainMapVerified:true}],
 sources:[{id:'S1',authority:'PEER_REVIEWED'}],
 exactChecks:[{id:'E1',pass:true}]
});
assert.equal(closed.promotionEligible,true,'fully closed certificate packet must become internally promotion-eligible');
assert.equal(closed.metrics.supportScore,1,'fully closed packet must have complete support score');
assert.equal(closed.unresolvedScars.length,0,'fully closed packet must carry no unresolved scars');
assert.equal(closed.decision,'CARRY');

const open=compileProofCarryR292({
 domainId:'TEST',claimId:'OPEN',claimLabel:'Open packet',claimStatus:'OPEN',
 requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
 gates:[{id:'G1',status:'PASS'},{id:'G2',status:'OPEN'},{id:'G3',status:'SOURCE_MISSING'}],
 partitions:[{id:'ROOT',terminal:false,exhaustive:false},{id:'P1',terminal:true,exhaustive:true},{id:'P2',terminal:true,exhaustive:false,scope:'unclosed family'}],
 transforms:[{id:'T1',preservesInvariant:true,domainMapVerified:true}],
 sources:[{id:'S1',authority:'PEER_REVIEWED'}],
 exactChecks:[{id:'E1',pass:true}]
});
assert.equal(open.promotionEligible,false,'open gates/families must block promotion');
assert(open.metrics.supportScore<1&&open.metrics.supportScore>0,'open packet support must be bounded between zero and one');
assert(open.unresolvedScars.some(x=>x.id==='G2')&&open.unresolvedScars.some(x=>x.id==='P2'),'open proof obligations must survive as scars');
assert.equal(open.decision,'TURN','unresolved but source-backed packet should TURN rather than claim closure');

clearActiveProofCarryR292();
const neutral=activeProofCarrySnapshotR292();
assert.equal(neutral.bound,false);
assert.equal(neutral.routingSupport,1,'unbound proof carry must be exactly neutral');
activateProofCarryR292(open);
assert.equal(readActiveProofCarryR292()?.claimId,'OPEN');
const bound=activeProofCarrySnapshotR292();
assert.equal(bound.bound,true);
assert(bound.routingSupport<1&&bound.routingSupport>=.35,'bound incomplete proof must exert bounded routing pressure');
assert.equal(bound.promotionEligible,false);
clearActiveProofCarryR292();
assert.equal(readActiveProofCarryR292(),null);

const singmaster=fs.readFileSync('src/proof/singmasterProofAtlasR290.ts','utf8');
const workbench=fs.readFileSync('src/SingmasterProofWorkbenchR290.tsx','utf8');
const woven=fs.readFileSync('src/wovenContinuityRuntimeR77.ts','utf8');
const allModes=fs.readFileSync('src/fullModeConvergenceRuntime.ts','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');

for(const token of ['compileSingmasterProofCarryR292','SINGMASTER_INVARIANT_TRANSFORMS_R292','claimStatus:SINGMASTER_PUBLIC_STATUS_R290','exhaustivePartition:true'])assert(singmaster.includes(token),`Singmaster adapter missing ${token}`);
for(const token of ['activateProofCarryR292','Run exact audit + bind','Bound R292 Singmaster certificate completeness into Woven Continuity and proof-aware ALL MODES scoring','proofCarry.metrics.supportScore'])assert(workbench.includes(token),`workbench missing ${token}`);
for(const token of ['activeProofCarrySnapshotR292','proofCarry:{','proofGlow=cl(law.proofGlow*(proofCarry.bound?proofCarry.routingSupport:1))'])assert(woven.includes(token),`Woven continuity missing ${token}`);
for(const token of ['activeProofCarrySnapshotR292',"key=`${op.from}:${op.to}:${proofCarry.fingerprint}`",'contextualProof=proofCarry.bound?cl(op.proof)*proofCarry.routingSupport:cl(op.proof)',"id:'proof-carry'",'promotionEligible:proofCarry.promotionEligible'])assert(allModes.includes(token),`ALL MODES convergence missing ${token}`);
assert(suite.includes("import './proofCarryR292.css'"),'proof-carry visual layer not loaded');
const routeBlock=(navigation.match(/export const OMEGA_NAVIGATION:OmegaNavItem\[\]=\[(.*?)\];/s)||[])[1]||'';
const routes=[...routeBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(routes.length,44,'R292 must not inflate the 44-route authority');
assert.equal(new Set(routes).size,44,'R292 must preserve unique route authority');

console.log('R292 PROOF-CARRY FABRIC PASS');
console.log(JSON.stringify({closedSupport:closed.metrics.supportScore,openSupport:open.metrics.supportScore,boundRoutingSupport:bound.routingSupport,openScars:open.unresolvedScars.length,routes:routes.length}));
