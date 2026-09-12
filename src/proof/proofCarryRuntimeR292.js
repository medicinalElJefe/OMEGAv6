const ACTIVE_KEY='omega.v6.proofCarry.r292.active';
export const PROOF_CARRY_SCHEMA_R292='OMEGA_PROOF_CARRY_R292';
export const PROOF_CARRY_BOUNDARY_R292='Proof Carry scores certificate completeness, invariant preservation, source coverage and exhaustiveness. It is not a probability of truth, does not manufacture external authority, and cannot by itself prove or promote a theorem.';

const CLOSED_GATE=new Set(['PASS','ESTABLISHED_EXTERNAL']);
const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const ratio=(a,b,empty=1)=>b>0?clamp(a/b):empty;
const stable=value=>{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;
 return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
};
export function proofCarryFingerprintR292(value){
 const text=stable(value);let hash=2166136261;
 for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}
 return`r292-${(hash>>>0).toString(16).padStart(8,'0')}`;
}

export function compileProofCarryR292(input={}){
 const gates=Array.isArray(input.gates)?input.gates:[];
 const partitions=Array.isArray(input.partitions)?input.partitions:[];
 const transforms=Array.isArray(input.transforms)?input.transforms:[];
 const sources=Array.isArray(input.sources)?input.sources:[];
 const checks=Array.isArray(input.exactChecks)?input.exactChecks:[];
 const requirements={
  exhaustivePartition:Boolean(input.requirements?.exhaustivePartition),
  sourceLineage:Boolean(input.requirements?.sourceLineage),
  invariantCarry:Boolean(input.requirements?.invariantCarry),
  exactChecks:Boolean(input.requirements?.exactChecks)
 };
 const closedGates=gates.filter(g=>CLOSED_GATE.has(String(g.status))).length;
 const openGates=gates.filter(g=>!CLOSED_GATE.has(String(g.status)));
 const terminalPartitions=partitions.filter(p=>p.terminal!==false);
 const exhaustivePartitions=terminalPartitions.filter(p=>p.exhaustive===true).length;
 const transformPass=transforms.filter(t=>t.preservesInvariant===true&&t.domainMapVerified!==false).length;
 const exactPass=checks.filter(c=>c.pass===true).length;
 const usableSources=sources.filter(s=>!['SOURCE_MISSING','REJECTED'].includes(String(s.status||s.authority))).length;
 const gateCoverage=ratio(closedGates,gates.length,1);
 const partitionCoverage=ratio(exhaustivePartitions,terminalPartitions.length,requirements.exhaustivePartition?0:1);
 const invariantCarry=ratio(transformPass,transforms.length,requirements.invariantCarry?0:1);
 const exactCoverage=ratio(exactPass,checks.length,requirements.exactChecks?0:1);
 const sourceCoverage=ratio(usableSources,sources.length,requirements.sourceLineage?0:1);
 const channels=[gateCoverage,partitionCoverage,invariantCarry,exactCoverage,sourceCoverage];
 const mean=channels.reduce((a,b)=>a+b,0)/channels.length;
 const weakest=Math.min(...channels);
 const supportScore=clamp(.65*mean+.35*weakest);
 const unresolvedScars=[
  ...openGates.map(g=>({kind:'GATE',id:String(g.id||'gate'),status:String(g.status||'OPEN'),detail:String(g.detail||g.label||'Unresolved gate')})),
  ...terminalPartitions.filter(p=>p.exhaustive!==true).map(p=>({kind:'PARTITION',id:String(p.id||'partition'),status:'OPEN',detail:String(p.scope||'Exhaustiveness missing')})),
  ...transforms.filter(t=>t.preservesInvariant!==true||t.domainMapVerified===false).map(t=>({kind:'TRANSFORM',id:String(t.id||'transform'),status:'HOLD',detail:String(t.detail||'Invariant/domain carry not certified')})),
  ...checks.filter(c=>c.pass!==true).map(c=>({kind:'EXACT_CHECK',id:String(c.id||'check'),status:'HOLD',detail:String(c.detail||'Exact check failed')}))
 ];
 const requirementPass={
  exhaustivePartition:!requirements.exhaustivePartition||partitionCoverage===1,
  sourceLineage:!requirements.sourceLineage||sourceCoverage===1,
  invariantCarry:!requirements.invariantCarry||invariantCarry===1,
  exactChecks:!requirements.exactChecks||exactCoverage===1
 };
 const promotionEligible=openGates.length===0&&Object.values(requirementPass).every(Boolean);
 const scarPressure=clamp(unresolvedScars.length/Math.max(1,gates.length+terminalPartitions.length+transforms.length+checks.length));
 const decision=promotionEligible?'CARRY':sourceCoverage<1||invariantCarry<1?'ESCALATE':'TURN';
 const core={
  schema:PROOF_CARRY_SCHEMA_R292,
  domainId:String(input.domainId||'UNBOUND'),
  claimId:String(input.claimId||'UNBOUND'),
  claimLabel:String(input.claimLabel||'Unbound proof context'),
  claimStatus:String(input.claimStatus||'UNBOUND'),
  requirements,
  metrics:{gateCoverage,partitionCoverage,invariantCarry,exactCoverage,sourceCoverage,supportScore,scarPressure},
  counts:{gates:gates.length,closedGates,terminalPartitions:terminalPartitions.length,exhaustivePartitions,transforms:transforms.length,transformPass,exactChecks:checks.length,exactPass,sources:sources.length,usableSources},
  requirementPass,
  promotionEligible,
  decision,
  unresolvedScars,
  boundary:PROOF_CARRY_BOUNDARY_R292
 };
 return{...core,fingerprint:proofCarryFingerprintR292(core)};
}

export function activateProofCarryR292(packet){
 if(!packet||packet.schema!==PROOF_CARRY_SCHEMA_R292)throw new Error('R292 proof-carry packet required');
 const value={...packet,boundAt:Date.now(),authority:'BROWSER_LOCAL_PROOF_CONTEXT'};
 try{localStorage.setItem(ACTIVE_KEY,JSON.stringify(value));window.dispatchEvent(new CustomEvent('omega-r292-proof-carry-changed',{detail:value}))}catch{}
 return value;
}
export function clearActiveProofCarryR292(){try{localStorage.removeItem(ACTIVE_KEY);window.dispatchEvent(new CustomEvent('omega-r292-proof-carry-changed',{detail:null}))}catch{}}
export function readActiveProofCarryR292(){
 try{const raw=localStorage.getItem(ACTIVE_KEY);if(!raw)return null;const value=JSON.parse(raw);return value?.schema===PROOF_CARRY_SCHEMA_R292?value:null}catch{return null}
}
export function activeProofCarrySnapshotR292(){
 const active=readActiveProofCarryR292();
 if(!active)return{schema:PROOF_CARRY_SCHEMA_R292,bound:false,fingerprint:'R292-UNBOUND',claimStatus:'UNBOUND',claimLabel:'No active proof context',promotionEligible:false,routingSupport:1,supportScore:1,scarPressure:0,unresolvedScars:[],decision:'CARRY',boundary:'No proof project is bound, so R292 is neutral and preserves pre-R292 traversal/mode scoring.'};
 const supportScore=clamp(active.metrics?.supportScore);
 return{schema:PROOF_CARRY_SCHEMA_R292,bound:true,fingerprint:String(active.fingerprint||proofCarryFingerprintR292(active)),claimStatus:String(active.claimStatus||'UNKNOWN'),claimLabel:String(active.claimLabel||active.claimId||'Proof context'),promotionEligible:Boolean(active.promotionEligible),routingSupport:clamp(.35+.65*supportScore),supportScore,scarPressure:clamp(active.metrics?.scarPressure),unresolvedScars:Array.isArray(active.unresolvedScars)?active.unresolvedScars:[],decision:String(active.decision||'TURN'),boundary:PROOF_CARRY_BOUNDARY_R292};
}
