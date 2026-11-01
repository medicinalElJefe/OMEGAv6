/**
 * Dewey V9: exact discrete-time two-dimensional rotation/continuity laboratory.
 * This is not an empirical model of universal time or physics.
 * Canonical OMEGA Atlas addresses remain under their existing authority.
 */
export const DEWEY_V9_BOUNDARY = Object.freeze({
  model: 'INTEGER_2D_DISCRETE_LINEAR',
  group: 'C4_QUARTER_TURNS',
  evidence: 'EXACT_INTEGER_ALGEBRA_AND_FINITE_CANDIDATE_FILTER',
  globalSingmaster: 'OPEN',
  empiricalUniversality: 'UNSUPPORTED',
  canonicalMutation: false,
  sourcePromotionAuthority: false,
  productionAuthority: false,
});
const bi = v => {
  if(typeof v==='bigint')return v;
  if(typeof v==='number' && Number.isSafeInteger(v))return BigInt(v);
  if(typeof v==='string' && /^-?(0|[1-9][0-9]*)$/.test(v))return BigInt(v);
  throw new TypeError('exact integer required');
};
const mat = x => {
  if(!Array.isArray(x)||x.length!==2||x.some(r=>!Array.isArray(r)||r.length!==2))throw new TypeError('2x2 matrix required');
  return x.map(r=>r.map(bi));
};
const vec = x => {
  if(!Array.isArray(x)||x.length!==2)throw new TypeError('2-vector required');
  return x.map(bi);
};
const I=[[1n,0n],[0n,1n]], R=[[0n,-1n],[1n,0n]];
const mm=(a,b)=>a.map(row=>[0,1].map(j=>row[0]*b[0][j]+row[1]*b[1][j]));
const mv=(a,v)=>a.map(row=>row[0]*v[0]+row[1]*v[1]);
const diff=(a,b)=>a.map((x,i)=>x-b[i]);
const sq=x=>x.reduce((s,v)=>s+v*v,0n);
const serialize=x=>Array.isArray(x)?x.map(serialize):typeof x==='bigint'?x.toString():x;
const exponent=n=>{if(!Number.isSafeInteger(n)||n<0||n>100000)throw new RangeError('nonnegative bounded discrete steps required');return n;};
export function quarterRotation(q){if(!Number.isSafeInteger(q))throw new TypeError('integer quarter turns required');let k=((q%4)+4)%4;let out=I;while(k--)out=mm(out,R);return out;}
export function matrixPower(input,n){let p=exponent(n),base=mat(input),out=I;while(p){if(p%2)out=mm(out,base);base=mm(base,base);p=Math.floor(p/2);}return out;}
export function compositionDefect(input,x,t,q){
  const a=matrixPower(input,t),r=quarterRotation(q),v=vec(x);
  const rotateThenEvolve=mv(mm(a,r),v),evolveThenRotate=mv(mm(r,a),v),residual=diff(rotateThenEvolve,evolveThenRotate);
  return {schema:'DEWEY_V9_COMPOSITION_DEFECT',steps:t,quarterTurns:q,rotateThenEvolve:serialize(rotateThenEvolve),evolveThenRotate:serialize(evolveThenRotate),residual:serialize(residual),squaredDefect:sq(residual).toString(),equal:sq(residual)===0n,scope:'SPECIFIED_STATE_ONLY'};
}
export function rotatedReturnDefect(input,x,t,q){
  const a=matrixPower(input,t),r=quarterRotation(q),v=vec(x),evolved=mv(a,v),rotated=mv(r,v),residual=diff(evolved,rotated);
  return {schema:'DEWEY_V9_ROTATED_RETURN',steps:t,quarterTurns:q,evolved:serialize(evolved),rotatedInitial:serialize(rotated),residual:serialize(residual),squaredDefect:sq(residual).toString(),rotatedReturn:sq(residual)===0n,scope:'SPECIFIED_STATE_ONLY'};
}
export function equivarianceCertificate(input){
  const a=mat(input),left=mm(a,R),right=mm(R,a),commutator=left.map((row,i)=>row.map((z,j)=>z-right[i][j]));
  const allStates=commutator.every(row=>row.every(z=>z===0n));
  return {schema:'DEWEY_V9_EQUIVARIANCE',matrix:serialize(a),commutator:serialize(commutator),allIntegerStatesAndAllQuarterTurns:allStates,justification:'TR=RT iff T commutes with the generating quarter-turn; this implies T^t R^q=R^q T^t for every t>=0, q integer',scope:'UNIVERSAL_WITHIN_DECLARED_LINEAR_MODEL'};
}
function observed(state,obs){const r=quarterRotation(obs.quarterTurns),v=mv(r,vec(state));if(obs.kind==='x')return v[0];if(obs.kind==='norm2')return sq(v);throw new TypeError('observation kind x or norm2 required');}
export function filterFiniteCandidates(candidates,observations){
  if(!Array.isArray(candidates)||!Array.isArray(observations))throw new TypeError('finite lists required');
  let surviving=candidates.map(vec),trace=[];
  for(const obs of observations){if(!Number.isSafeInteger(obs.quarterTurns))throw new TypeError('integer quarter turns required');const target=bi(obs.value),before=surviving.length;
    surviving=surviving.filter(v=>observed(v,obs)===target);
    trace.push({kind:obs.kind,quarterTurns:obs.quarterTurns,measurement:target.toString(),before,after:surviving.length,excluded:before-surviving.length});
  }
  return {schema:'DEWEY_V9_FINITE_STATE_FILTER',initialCount:candidates.length,remainingCount:surviving.length,surviving:serialize(surviving),trace,scope:'EXACT_FINITE_HYPOTHESIS_SET_ONLY',theoremStatus:'NO_GLOBAL_INFERENCE'};
}
export const V9_MODELS=Object.freeze({
  uniform:[[2,0],[0,2]],anisotropic:[[2,0],[0,1]],relative:[[0,-1],[1,0]],shear:[[1,1],[0,1]],projection:[[1,0],[0,0]],reflection:[[1,0],[0,-1]],
});
export const V9_SCENARIO_NAMES=Object.freeze(Object.keys(V9_MODELS));
