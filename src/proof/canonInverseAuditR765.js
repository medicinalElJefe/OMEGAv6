/** R765 — exact directed inverse/outverse audit for R763/R764 modeled Canon trajectories.
 * Reversing an undirected ordinal edge does NOT automatically preserve admissibility:
 * increasing-coherence, endpoint-gated, and whole-path constraints are directional.
 * This is source-model mathematics only: no physical reversibility or native authority.
 */
import {R763_AXES,R763_SCOPE,verifyCanonPathWitnessR763} from './canonNavigationR763.js';
import {deriveCanonTrajectoryR764} from './canonTrajectoryR764.js';

const abs=n=>n<0n?-n:n;
const gcd=(a,b)=>{a=abs(a);b=abs(b);while(b){const t=a%b;a=b;b=t;}return a||1n;};
const fraction=(numerator,denominator)=>{
 const n=BigInt(numerator),d=BigInt(denominator);
 if(d<=0n)throw new RangeError('positive denominator required');
 const g=gcd(n,d);return [n/g,d/g];
};
const add=(a,b)=>fraction(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const neg=a=>[-a[0],a[1]];
const compare=(a,b)=>a[0]*b[1]<b[0]*a[1]?-1:a[0]*b[1]>b[0]*a[1]?1:0;
const exact=a=>({numerator:String(a[0]),denominator:String(a[1])});
const zero=()=>[0n,1n];
const parseLimit=value=>{
 if(value===null)return null;
 if(typeof value!=='string'||value.length>32||!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,12})?$/.test(value))
  throw new TypeError('source-verified bounded decimal required');
 const [whole,decimal='']=value.split('.');
 return fraction(BigInt(whole+decimal),10n**BigInt(decimal.length));
};
const exactState=node=>{
 const [D,S,R,M,P]=node.axes,[d,s,r,m,p]=node.axes.map(x=>x-1);
 return {score:fraction(node.scoreNumerator,node.scoreDenominator),
  burden:fraction(1+((4+d+s+r+m+p+d*s)%12),12),
  contradiction:fraction(1+((node.mode188-1)%12)+Math.abs(D-R)+Math.abs(S-M),34)};
};
function stateFailures(node,limits,prefix){
 const n=exactState(node),reasons=[];
 if(limits.minScore&&compare(n.score,limits.minScore)<0)reasons.push(prefix+'SCORE_BELOW_MINIMUM');
 if(limits.maxBurden&&compare(n.burden,limits.maxBurden)>0)reasons.push(prefix+'BURDEN_ABOVE_MAXIMUM');
 if(limits.maxContradiction&&compare(n.contradiction,limits.maxContradiction)>0)reasons.push(prefix+'CONTRADICTION_ABOVE_MAXIMUM');
 return reasons;
}
export function auditCanonInverseR765(witness){
 if(!witness||typeof witness!=='object'||Array.isArray(witness))throw new TypeError('R763 witness object required');
 const verified=verifyCanonPathWitnessR763(JSON.stringify(witness));
 const result=verified.result,query=verified.query;
 if(result.status!=='FOUND_IN_DECLARED_SYMBOLIC_GRAPH')throw new RangeError('only completed R763 paths support inverse audits');
 const trajectory=deriveCanonTrajectoryR764(verified);
 const path=result.path;
 const limits={minScore:parseLimit(query.minScore),maxBurden:parseLimit(query.maxBurden),
  maxContradiction:parseLimit(query.maxContradiction)};
 const source=path[0],target=path.at(-1);
 const flux=Object.fromEntries(R763_AXES.map(axis=>[axis,zero()]));
 const moves=Object.fromEntries(R763_AXES.map(axis=>[axis,0]));
 let total=zero(),structural=true;
 for(const edge of result.steps){
  if(!R763_AXES.includes(edge.axis))throw new Error('undeclared axis in verified path');
  const d=fraction(edge.exactDelta.numerator,edge.exactDelta.denominator);
  flux[edge.axis]=add(flux[edge.axis],d);total=add(total,d);
  moves[edge.axis]+=edge.direction;
  structural&&=edge.reversibleOrdinalEdge===true;
 }
 const transported=fraction(trajectory.totalExactScoreDelta.numerator,trajectory.totalExactScoreDelta.denominator);
 if(compare(total,transported)!==0)throw new Error('axis flux does not conserve exact score transport');
 const reasons=[];
 if(!structural)reasons.push('ORDINAL_REVERSE_EDGE_MISSING');
 if(query.scoreTrend==='NONDECREASING'&&result.steps.some(step=>step.scoreDeltaSign==='UP'))
  reasons.push('REVERSE_NONDECREASING_COHERENCE_VIOLATION');
 reasons.push(...stateFailures(source,limits,'RETURN_TARGET_'));
 if(query.pathConstraintScope==='ALL_NODES'){
  for(let i=0;i<path.length;i++){
   const bad=stateFailures(path[i],limits,'REVERSE_PATH_');
   if(bad.length){reasons.push('REVERSE_PATH_STATE_LIMIT_VIOLATION');break;}
  }
 }
 for(let a=0;a<R763_AXES.length;a++){
  const actual=target.axes[a]-source.axes[a];
  if(moves[R763_AXES[a]]!==actual)throw new Error('signed axis motion mismatches declared coordinates');
 }
 const forwardFlux=Object.fromEntries(R763_AXES.map(axis=>[axis,exact(flux[axis])]));
 const reverseFlux=Object.fromEntries(R763_AXES.map(axis=>[axis,exact(neg(flux[axis]))]));
 const roundTrip=R763_AXES.every(axis=>compare(add(flux[axis],neg(flux[axis])),zero())===0);
 return {schema:'OMEGA_R765_DIRECTED_INVERSE_AUDIT_V1',
  sourceModelDigest:R763_SCOPE.reconstructedCanonLedgerSha256,
  sourceIndex:source.index,destinationIndex:target.index,forwardHops:result.distance,
  returnGoalDecision:source.decision,returnGoalMode188:source.mode188,
  pathConstraintScope:query.pathConstraintScope,scoreTrend:query.scoreTrend,
  permittedAxes:[...query.allowedAxes],structurallyReversible:structural,
  reverseUnderSameEnvelope:reasons.length===0,reverseRefusalReasons:reasons,
  exactScoreFluxByAxis:forwardFlux,exactReverseFluxByAxis:reverseFlux,
  signedOrdinalAxisMoves:moves,forwardExactScoreDelta:exact(total),
  reverseExactScoreDelta:exact(neg(total)),exactPerAxisRoundTrip:roundTrip,
  phaseTransitions:trajectory.phaseTransitions,modeTransitions:trajectory.modeTransitions,
  boundaryScars:trajectory.scarCrossings,
  reversePathIsShortestProof:false,calibratedPhysicalReversibility:false,
  authenticatedHistoricalSource:false,canonicalMutation:false,deviceActionAuthority:false};
}
export function verifyCanonInverseAuditR765(witness,raw){
 if(typeof raw!=='string'||raw.length>65536)throw new TypeError('bounded R765 audit JSON required');
 const received=JSON.parse(raw),expected=auditCanonInverseR765(witness);
 if(JSON.stringify(received)!==JSON.stringify(expected))
  throw new Error('R765 inverse audit differs from source-recomputed exact conservation');
 return expected;
}
