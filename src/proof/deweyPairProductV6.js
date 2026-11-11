// V6 exact pair-product defect, research-only: no global Singmaster closure.
export const DEWEY_PAIR_PRODUCT_BOUNDARY_V6 = 'Exact fixed-pair arithmetic only. G09, G10, G13 remain OPEN.';
const product=(lo,hi)=>{let x=1n;for(let j=lo;j<=hi;j++)x*=BigInt(j);return x;};
export function pairProductDefectV6(n,k,m,l){
  if(![n,k,m,l].every(Number.isSafeInteger)||!(2<=k&&k<l&&n>m&&m>=2*l&&n>=2*k))throw new RangeError('ordered nontrivial left-half pair required');
  const d=n-m,e=l-k,r=n-k,s=m-l;
  // C(n,k)/C(m,l) = product(m+1..n)*product(k+1..l)/product(s+1..r)
  const numerator=product(m+1,n)*product(k+1,l);
  const denominator=product(s+1,r);
  const defect=numerator-denominator;
  return {n,k,m,l,rowDisplacement:d,columnDisplacement:e,
    complementDisplacement:r-s,numerator:numerator.toString(),
    denominator:denominator.toString(),defect:defect.toString(),
    equal:defect===0n,ratioDirection:defect>0n?'greater':defect<0n?'smaller':'equal',
    scope:'EXACT_FIXED_PAIR_ONLY',globalTheoremStatus:'OPEN'};
}
