/** R759: exact joint observation interval from R758 source-components AND
 * separately recorded source score. Both nearest-4DP models are CONDITIONAL.
 * An intersected score interval can reduce HOLD count but cannot mint source
 * authorization, retroactively verify rounding, or change CanonState.
 */
import {conditionalCanonGateR758} from './canonPrecisionIntervalR758.js';
export const R759_TRUTH=Object.freeze({
 model:'CONDITIONAL_COMMON_HIDDEN_SCORE_AND_NEAREST_4DP_COMPONENTS_AND_STORED_SCORE',
 historicalGeneratorAuthenticated:false,sourceScoreIndependentMeasurement:false,
 originalWorkbookModified:false,liveDecisionAuthority:false,canonicalMutation:false,
 globalSharpSingmaster:'OPEN',physicalEquivalence:'NOT_PROVED'
});
const pattern=/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,4})?$/;
function score4(v){
 if(typeof v!=='string'||!pattern.test(v))throw new TypeError('score must be nonnegative decimal text, max four fractional digits');
 const [i,j='']=v.split('.'),s=BigInt(i)*10000n+BigInt(j.padEnd(4,'0')||'0');
 if(s<=0n)throw new RangeError('positive score required');return s;
}
function frac(n,d){if(d<=0n)throw new Error('positive rational denominator required');return{n,d};}
function cmp(a,b){const delta=a.n*b.d-b.n*a.d;return delta>0n?1:delta<0n?-1:0;}
const mx=(a,b)=>cmp(a,b)>=0?a:b,mn=(a,b)=>cmp(a,b)<=0?a:b;
const threshold=x=>frac(BigInt(x),100n);
const label=(lo,hi)=>cmp(lo,threshold(42))>=0?'STAY':cmp(hi,threshold(22))<0?'ESCALATE':cmp(lo,threshold(22))>=0&&cmp(hi,threshold(42))<0?'TURN':'PRECISION_HOLD';
export function jointCanonPrecisionR759(metrics,storedScore){
 const p=conditionalCanonGateR758(metrics);
 const z=score4(storedScore),cLo=frac(BigInt(p.lower.numerator),BigInt(p.lower.denominator)),
 cHi=frac(BigInt(p.upper.numerator),BigInt(p.upper.denominator));
 const sLo=frac(2n*z-1n,20000n),sHi=frac(2n*z+1n,20000n);
 const lo=mx(cLo,sLo),hi=mn(cHi,sHi);
 if(cmp(lo,hi)>0)return{
  schema:'OMEGA_R759_JOINT_CONDITIONAL_CANON_V1',
  status:'INCOMPATIBLE_CONDITIONAL_OBSERVATIONS_HOLD',componentOnly:p.conditionalGate,
  jointGate:'PRECISION_HOLD',conditionallyStable:false,sourceAssumptionValidated:false,
  originalDecisionOverwritten:false,canonicalMutation:false,liveActionAdmissible:false};
 const gate=label(lo,hi);
 return{schema:'OMEGA_R759_JOINT_CONDITIONAL_CANON_V1',
  status:gate==='PRECISION_HOLD'?'PRECISION_HOLD':'CONDITIONALLY_CLASSIFIED',
  componentOnly:p.conditionalGate,jointGate:gate,
  interval:{lower:{numerator:lo.n.toString(),denominator:lo.d.toString()},upper:{numerator:hi.n.toString(),denominator:hi.d.toString()}},
  conditionallyStable:gate!=='PRECISION_HOLD',sourceAssumptionValidated:false,
  assumption:'NEAREST_4DP_SAME_LATENT_SCORE_COMPONENTS_AND_STORED_SCORE',
  originalDecisionOverwritten:false,canonicalMutation:false,liveActionAdmissible:false,
  sharpSingmaster:'OPEN'};
}