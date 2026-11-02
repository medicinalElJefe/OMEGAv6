/** R758: conditional Canon decision interval, exact integer certificate.
 * The four stored components are ASSUMED to be nearest-rounded to 4 decimals.
 * Source generator precision is not attested; no CanonState or live decision.
 */
export const R758_TRUTH=Object.freeze({precisionAssumption:'CONDITIONAL_NEAREST_FOUR_DECIMAL_ROUNDING',originalGeneratorVerified:false,liveDecisionAuthority:false,globalPhysicalClaim:false,globalSharpSingmaster:'OPEN',canonicalMutation:false,releaseGate:'SOURCE_PRECISION_ATTESTATION_REQUIRED'});
const INT=/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,4})?$/;
function parse4(v,name){
 if(typeof v!=='string'||v.length>32||!INT.test(v))throw new TypeError(name+' must be a nonnegative decimal string with <=4 fractional digits');
 const [a,b='']=v.split('.');const x=BigInt(a)*10000n+BigInt(b.padEnd(4,'0')||'0');
 if(x<=0n)throw new RangeError(name+' must be strictly positive');
 return x;
}
const cmp=(n,d,pc)=>n*100n-BigInt(pc)*d;
const rat=(n,d)=>({numerator:n.toString(),denominator:d.toString()});
export function conditionalCanonGateR758({c,phi,q,lambda}){
 const C=parse4(c,'c'),P=parse4(phi,'phi'),Q=parse4(q,'q'),L=parse4(lambda,'lambda');
 const loN=(2n*C-1n)*(2n*P-1n),loD=20000n*(2n*Q+2n*L+22n);
 const hiN=(2n*C+1n)*(2n*P+1n),hiD=20000n*(2n*Q+2n*L+18n);
 if(loD<=0n||hiD<=0n)throw new Error('invalid interval denominator');
 const min42=cmp(loN,loD,42)>=0,min22=cmp(loN,loD,22)>=0;
 const max42=cmp(hiN,hiD,42)<0,max22=cmp(hiN,hiD,22)<0;
 const conditionalGate=min42?'STAY':max22?'ESCALATE':min22&&max42?'TURN':'PRECISION_HOLD';
 return {schema:'OMEGA_R758_ROUNDED_CANON_INTERVAL_V1',conditionalGate,
  lower:rat(loN,loD),upper:rat(hiN,hiD),stable:conditionalGate!=='PRECISION_HOLD',
  assumption:'CONDITIONAL_NEAREST_FOUR_DECIMAL_ROUNDING',sourceOriginalPrecisionVerified:false,
  liveActionAdmissible:false,globalSharpSingmaster:'OPEN',canonicalMutation:false};
}