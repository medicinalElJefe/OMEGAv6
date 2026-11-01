/**
 * R751 / Dewey V12 fixed-(k,d) collision kernel.
 * For k>=2, d>=1, compare C(m+d,k)=C(m,l), k<l<=m/2.
 * The function firstDominanceM proves the remaining row search is finite:
 * at every m>=T, C(m,k+1)>C(m+d,k), making every higher l impossible.
 * Exact BigInt arithmetic including unbounded row indices for complete coefficient fibers; no external proof admission or production mutation.
 */
export const SINGMASTER_FIXED_GAP_BOUNDARY_R751='Exact fixed-parameter arithmetic only. Offline V12 atlas certificates require independent replay. Sharp Singmaster G09/G10/G13 remain OPEN.';
const int=(x,name,min=0)=>{
 if(!Number.isSafeInteger(x)||x<min||x>10000)throw new RangeError(name+' must be a bounded safe integer');
 return x;
};
export function chooseExactR751(n,k){
 int(k,'k');
 const N=typeof n==='bigint'?n:BigInt(int(n,'n'));
 if(N<0n||BigInt(k)>N)throw new RangeError('k cannot exceed nonnegative n');
 let p=1n,K=BigInt(k);
 if(N-K<K)K=N-K;
 for(let j=1n;j<=K;j++)p=p*(N-K+j)/j;
 return p;
}
export function firstDominanceMR751(k,d){
 int(k,'k',2);int(d,'d',1);
 const start=2*(k+1);
 const dominates=m=>chooseExactR751(m,k+1)>chooseExactR751(m+d,k);
 if(dominates(start))return start;
 let lo=start,hi=2*start;
 while(!dominates(hi)){lo=hi;hi*=2;if(hi>10000)throw new RangeError('implementation row-limit reached; not a mathematical nonexistence result');}
 while(hi-lo>1){
  const mid=Math.floor((hi+lo)/2);
  if(dominates(mid))hi=mid;else lo=mid;
 }
 return hi;
}
export function fixedGapPairsR751(k,d){
 int(k,'k',2);int(d,'d',1);
 const T=firstDominanceMR751(k,d),equalities=[];
 for(let m=2*(k+1);m<T;m++){
  const target=chooseExactR751(m+d,k);
  let low=k+1,high=Math.floor(m/2);
  while(low<=high){
   const l=Math.floor((low+high)/2),value=chooseExactR751(m,l);
   if(value===target){equalities.push({n:m+d,k,m,l,d,value:target.toString()});break;}
   if(value<target)low=l+1;else high=l-1;
  }
 }
 return {k,d,T,equalities,exactlyExhaustiveForThisPair:true,unboundedRowReduction:'PROVED_BY_MONOTONE_RATIO',globalSingmasterClaim:'OPEN',canonicalMutation:false};
}
export function completeFixedValueFiberR751(value){
 let a;
 try{a=BigInt(value);}catch{throw new TypeError('integer coefficient required');}
 if(a<2n)throw new RangeError('value >=2 required');
 const reps=[];
 for(let k=2;k<10000;k++){
  if(chooseExactR751(2*k,k)>a)break;
  let lo=BigInt(2*k),hi=BigInt(4*k);
  while(chooseExactR751(hi,k)<a)hi*=2n;
  while(lo<hi){const mid=(lo+hi)/2n;if(chooseExactR751(mid,k)<a)lo=mid+1n;else hi=mid;}
  if(chooseExactR751(lo,k)===a)reps.push({n:lo<=BigInt(Number.MAX_SAFE_INTEGER)?Number(lo):lo.toString(),k});
 }
 return {value:a.toString(),representations:reps,M:reps.length,scope:'COMPLETE_FIXED_VALUE_WITHIN_SAFE_EXECUTION_BOUND'};
}
