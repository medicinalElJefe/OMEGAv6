/**
 * R760 / Dewey V26 — observer-relative score interval *research*.
 * Exact rational affine transport and intersection, no source authority.
 * Source metric/score rounding, observer identity, clock, calibration and
 * Lipschitz/error bound are UNSUPPORTED unless separately attested.
 */
import {jointCanonPrecisionR759} from './canonJointPrecisionR759.js';
export const R760_BOUNDARY=Object.freeze({
 claim:'BOUNDED_OBSERVER_RELATIVE_INTERVAL_CONTRACTION',
 sourceObserverAttestation:'MISSING',
 physicallyCalibratedMotion:'NOT_ESTABLISHED',
 fiveAxisSmoothnessResolvesHold:false,
 originalCanonRowsNewlyResolved:0,
 originalCanonDecisionMutation:false,
 globalSharpSingmaster:'OPEN',
 productionAuthority:false,sourceAdmission:false,
 autoPingActivated:false
});
const DEC=/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]{1,18})?$/;
const abs=x=>x<0n?-x:x;
const gcd=(x,y)=>{x=abs(x);y=abs(y);while(y){const t=x%y;x=y;y=t;}return x||1n;};
function frac(n,d=1n){
 if(d===0n)throw new RangeError('zero rational denominator');
 if(d<0n){n=-n;d=-d;}
 const g=gcd(n,d);return {n:n/g,d:d/g};
}
function parseDecimal(v,name){
 if(typeof v!=='string'||v.length>48||!DEC.test(v))throw new TypeError(name+' requires bounded exact decimal text');
 const neg=v[0]==='-',u=neg?v.slice(1):v,[left,right='']=u.split('.'),
  denom=10n**BigInt(right.length),num=BigInt(left)*denom+BigInt(right||'0');
 return frac(neg?-num:num,denom);
}
const fromPair=p=>frac(BigInt(p.numerator),BigInt(p.denominator));
const add=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d);
const neg=a=>frac(-a.n,a.d);
const sub=(a,b)=>add(a,neg(b));
const mul=(a,b)=>frac(a.n*b.n,a.d*b.d);
const cmp=(a,b)=>a.n*b.d<b.n*a.d?-1:a.n*b.d>b.n*a.d?1:0;
const minimum=(a,b)=>cmp(a,b)<=0?a:b;
const maximum=(a,b)=>cmp(a,b)>=0?a:b;
const dto=x=>({numerator:x.n.toString(),denominator:x.d.toString()});
function category(lo,hi){
 if(cmp(lo,frac(42n,100n))>=0)return 'STAY';
 if(cmp(hi,frac(22n,100n))<0)return 'ESCALATE';
 if(cmp(lo,frac(22n,100n))>=0&&cmp(hi,frac(42n,100n))<0)return 'TURN';
 return 'PRECISION_HOLD';
}
export function observerRelativeCanonR760({metrics,storedScore,referenceLower,referenceUpper,scale='1',offset='0',error='0',sourceAttested=false}){
 const baseline=jointCanonPrecisionR759(metrics,storedScore);
 const L=parseDecimal(referenceLower,'referenceLower'),U=parseDecimal(referenceUpper,'referenceUpper');
 const a=parseDecimal(scale,'scale'),b=parseDecimal(offset,'offset'),e=parseDecimal(error,'error');
 if(cmp(L,U)>0)throw new RangeError('reference interval is reversed');
 if(cmp(e,frac(0n))<0)throw new RangeError('transport error cannot be negative');
 const start=add(mul(a,L),b),end=add(mul(a,U),b);
 const trLo=sub(minimum(start,end),e),trHi=add(maximum(start,end),e);
 const shared={schema:'OMEGA_R760_EXACT_OBSERVER_TRANSPORT_V1',
  observerInterval:{lower:dto(L),upper:dto(U)},
  transportedInterval:{lower:dto(trLo),upper:dto(trHi)},
  sourceClaimProvidedByCaller:sourceAttested===true,
  externalObservationVerified:false,transportBoundExternallyVerified:false,
  sourceAdmission:false,liveActionAdmissible:false,originalCanonMutation:false,
  globalSharpSingmaster:'OPEN',physicalDimensionsAsserted:false};
 if(baseline.status==='INCOMPATIBLE_CONDITIONAL_OBSERVATIONS_HOLD')
  return {...shared,status:'SOURCE_INCOMPATIBLE_HOLD',conditionalGate:'PRECISION_HOLD',sourceAssumption:'UNVERIFIED_NEAREST_4DP_SAME_LATENT_SCORE'};
 const baseLo=fromPair(baseline.interval.lower),baseHi=fromPair(baseline.interval.upper);
 const lo=maximum(baseLo,trLo),hi=minimum(baseHi,trHi);
 if(cmp(lo,hi)>0)return {...shared,status:'CONSTRAINT_CONTRADICTION_HOLD',conditionalGate:'PRECISION_HOLD',baseInterval:baseline.interval};
 const gate=category(lo,hi);
 return {...shared,status:gate==='PRECISION_HOLD'?'PRECISION_HOLD':'CONDITIONAL_ONLY_NOT_SOURCE_ADMITTED',
  conditionalGate:gate,baseInterval:baseline.interval,
  contractedInterval:{lower:dto(lo),upper:dto(hi)},
  sourceAssumption:'UNVERIFIED_NEAREST_4DP_AND_EXTERNAL_AFFINE_TRANSPORT',
  proofObligation:'INDEPENDENT_REFERENCE_TIME_FRAME_CALIBRATION_AND_ERROR_BOUND_REQUIRED'};
}
