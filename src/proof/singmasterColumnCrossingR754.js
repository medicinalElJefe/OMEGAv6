/** Exact monotonic crossing of a fixed left-half binomial column.
 * Strict integer inequalities prove no matching row exists in the declared
 * interval. No universal Singmaster claim, CanonState write or promotion.
 */
export const R754_BOUNDARY=Object.freeze({scope:'ONE_DECLARED_HIGHER_COLUMN_ALL_ELIGIBLE_ROWS',sharpSingmaster:'OPEN',globalFourfoldClosures:0,canonicalMutation:false,productionAuthority:false});
const safe=(v,name,min=0,max=100000)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw new RangeError(name+' must be a bounded safe integer');return v;};
export function binomialExactR754(nInput,kInput){
 const n=typeof nInput==='bigint'?nInput:BigInt(safe(nInput,'row'));
 const k=typeof kInput==='bigint'?kInput:BigInt(safe(kInput,'column'));
 if(n<0n||k<0n||k>n)throw new RangeError('nonnegative row and valid column required');
 let c=1n;const K=k<n-k?k:n-k;
 for(let i=1n;i<=K;i++)c=c*(n-K+i)/i;
 return c;
}
export function certifyHigherColumnR754(n,k,l){
 safe(n,'known row',4);safe(k,'known column',2);safe(l,'tested column',2);
 if(2*k>n||l<=k+1||2*l>n-2)return{status:'OUTSIDE_DECLARED_HIGHER_COLUMN_DOMAIN',complete:false,globalSingmaster:'OPEN'};
 const min=2*l,max=n-2,A=binomialExactR754(n,k);
 let low=min,high=max+1;
 while(low<high){const mid=Math.floor((low+high)/2);
  if(mid<=max&&binomialExactR754(mid,l)<A)low=mid+1;else high=mid;
 }
 const crossing=low;let status,before=null,after=null;
 if(crossing===min){
  const v=binomialExactR754(min,l);status=v===A?'EQUALITY_AT_MIN':'ALL_ROWS_ABOVE';after=min;
 }else if(crossing===max+1){
  if(binomialExactR754(max,l)>=A)throw Error('nonmonotonic crossing');
  status='ALL_ROWS_BELOW';before=max;
 }else{
  if(binomialExactR754(crossing-1,l)>=A)throw Error('pre-crossing condition fails');
  const v=binomialExactR754(crossing,l);if(v<A)throw Error('crossing condition fails');
  status=v===A?'EXACT_EQUALITY':'STRICT_BETWEEN_INTEGER_ROWS';
  before=crossing-1;after=crossing;
 }
 return{schema:'OMEGA_R754_EXACT_CROSSING_CERTIFICATE',status,complete:true,knownN:n,knownK:k,additionalL:l,rowMin:min,rowMax:max,coveredRows:max-min+1,beforeRow:before,afterRow:after,excludesEquality:!['EXACT_EQUALITY','EQUALITY_AT_MIN'].includes(status),globalSingmaster:'OPEN',globalFourfoldClosure:false,canonicalMutation:false};
}
export function pellPairR754(t){
 safe(t,'Pell orbit index',1,64);
 const fib=m=>{let a=0n,b=1n;for(let i=0;i<m;i++)[a,b]=[b,a+b];return a;};
 const m=2*t+2,n=fib(m)*fib(m+1),k=fib(m)*fib(m-1)-1n;
 if(n>BigInt(Number.MAX_SAFE_INTEGER))return{status:'ROW_BEYOND_SAFE_EXECUTION_LIMIT',globalSingmaster:'OPEN'};
 return{t,n:Number(n),k:Number(k)};
}
