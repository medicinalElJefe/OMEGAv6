/**
 * R756: exact, fixed-binomial central-column cutoff via bit-length sandwich.
 * Does not certify equality of any lower-column representation; G09/G10/G13 OPEN.
 * Source independently replayable from V20 downloadable GMP/Python archive.
 */
export const R756_TRUTH=Object.freeze({scope:'FIXED_VALUE_CENTRAL_CUTOFF_ONLY',globalSharpSingmaster:'OPEN',fullFiberProved:false,fourfoldRegionsClosed:0,sourcePromotion:false,canonicalMutation:false,productionAuthority:false});
const bounded=(v,name,min,max)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw new RangeError(name+' requires a bounded safe integer');return v;};
export function binomialExactR756(n,k){
 bounded(n,'n',0,200000);bounded(k,'k',0,200000);
 if(k>n)throw new RangeError('k exceeds row');
 let p=1n;const q=Math.min(k,n-k);
 for(let j=1;j<=q;j++)p=p*BigInt(n-q+j)/BigInt(j);
 return p;
}
export function certifiedCentralCutoffR756(n,k,{maxN=100000}={}){
 bounded(maxN,'maxN',4,200000);bounded(n,'n',4,200000);bounded(k,'k',2,200000);
 if(n>maxN)return{status:'RESOURCE_HOLD_NO_INFERENCE',sharpSingmaster:'OPEN',canonicalMutation:false};
 if(2*k>n)throw new RangeError('nontrivial left-half column required');
 const A=binomialExactR756(n,k),b=A.toString(2).length,low0=Math.floor((b-1)/2);
 const B=(A*BigInt(2*n+1)).toString(2).length,high0=Math.ceil(B/2);
 let calls=0;
 const center=l=>{calls++;return binomialExactR756(2*l,l);};
 if(center(low0)>A||center(high0)<=A)throw new Error('bit-bound invariants not satisfied');
 let lo=low0,hi=high0;
 while(hi-lo>1){const mid=lo+Math.floor((hi-lo)/2);if(center(mid)<=A)lo=mid;else hi=mid;}
 if(center(lo)>A||center(lo+1)<=A)throw new Error('exact endpoint inequalities failed');
 return{schema:'OMEGA_R756_EXACT_CUTOFF_CERTIFICATE',status:'EXACT_CUTOFF_CERTIFIED',n,k,
  targetBits:b,lastPossibleColumn:lo,firstImpossibleColumn:lo+1,firstCertifiedPossible:low0,
  firstExcludedByBitBound:high0,ambiguousColumns:high0-low0-1,centralEvaluations:calls,
  sharpSingmaster:'OPEN',fullFiberProved:false,fourfoldRegionsClosed:0,canonicalMutation:false};
}