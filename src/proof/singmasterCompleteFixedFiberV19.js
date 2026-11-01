/**
 * R755/V19 exact COMPLETE fixed-value binomial fiber certificates.
 * For fixed A, C(r,l) increases with integer r>=2l. Stop only after
 * C(2l,l)>A, where monotone central binomial coefficients exclude ALL
 * larger l. Resource bounds produce HOLD, never theorem promotion.
 */
export const V19_BOUNDARY=Object.freeze({
  scope:'ONE_EXPLICIT_FIXED_BINOMIAL_VALUE_ALL_NONTRIVIAL_LEFT_HALF_REPRESENTATIONS',
  globalSharpSingmaster:'OPEN',infinitePellFamily:'NOT_CLASSIFIED_BY_FINITE_FIBERS',
  fourfoldAtlasNewClosures:0,physicalDimensionality:'NOT_INFERRED',
  externalCompleteCSVIngested:false,canonicalMutation:false,sourcePromotion:false
});
const I=x=>{if(typeof x==='bigint'&&x>=0n)return x;if(typeof x==='number'&&Number.isSafeInteger(x)&&x>=0)return BigInt(x);throw new TypeError('nonnegative exact integer required')};
const col=(l)=>{if(!Number.isSafeInteger(l)||l<0||l>100000)throw new RangeError('bounded column index required');return l};
export function chooseV19(row,l){
  const n=I(row),k=BigInt(col(l));if(k>n)throw new RangeError('column exceeds row');
  const K=k<n-k?k:n-k;let x=1n;
  for(let j=1n;j<=K;j++)x=x*(n-K+j)/j;
  return x;
}
export function completeFixedFiberV19(nInput,kInput,{maxColumns=384}={}){
 const n=I(nInput),k=col(kInput),bound=col(maxColumns);
 if(k<2||n<2n*BigInt(k)||bound<2)throw new RangeError('nontrivial left-half input and adequate budget required');
 const A=chooseV19(n,k),certificates=[],representations=[];
 let previousCrossing=4n;
 for(let l=2;l<=bound;l++){
  const base=BigInt(2*l);
  if(chooseV19(base,l)>A)return{
   scope:'COMPLETE_FIXED_VALUE_ONLY',status:'COMPLETE',value:A.toString(),
   firstImpossibleColumn:l,checkedColumns:certificates.length,
   multiplicity:representations.length,representations,certificates,
   globalSharpSingmaster:'OPEN',fourfoldAtlasNewClosures:0,canonicalMutation:false
  };
  let lo=base,hi=previousCrossing>base?previousCrossing:base;
  while(chooseV19(hi,l)<A)hi*=2n;
  while(lo<hi){const mid=(lo+hi)/2n;if(chooseV19(mid,l)<A)lo=mid+1n;else hi=mid;}
  const actual=chooseV19(lo,l),hit=actual===A;
  if(actual<A||(lo>base&&chooseV19(lo-1n,l)>=A))throw new Error('exact monotone-crossing invariant failure');
  certificates.push({column:l,crossingRow:lo.toString(),equality:hit});
  if(hit)representations.push({n:lo.toString(),k:l});
  previousCrossing=lo;
 }
 return {scope:'COMPLETE_FIXED_VALUE_ONLY',status:'RESOURCE_HOLD_NO_INFERENCE',
  checkedColumns:certificates.length,multiplicity:null,representations:[],
  certificates,globalSharpSingmaster:'OPEN',fourfoldAtlasNewClosures:0,canonicalMutation:false};
}
