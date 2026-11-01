/** Exact Pell-adjacent-collision gcd skin; independent of unmerged R752.
 * This is classical arithmetic with computational proof checks, not a new
 * global Singmaster theorem or a physics/dimension claim.
 */
export const R753_BOUNDARY=Object.freeze({domain:'NUMBER_THEORY/PASCAL/SINGMASTER_PELL_GCD_SKIN',theoremScope:'ADJACENT_ROW_AND_COLUMN_PAIR_ONLY',priorArt:'SINGMASTER_1975_CLASSICAL_FIBONACCI_GCD_KUMMER',sharpSingmaster:'OPEN',fourfoldClosures:0,physicalDimensionClaim:false,canonicalMutation:false,sourcePromotion:false,productionAuthority:false});
const N=v=>{if(typeof v==='bigint'&&v>=0n)return v;if(typeof v==='number'&&Number.isSafeInteger(v)&&v>=0)return BigInt(v);if(typeof v==='string'&&/^(0|[1-9][0-9]*)$/.test(v))return BigInt(v);throw new TypeError('nonnegative exact integer required');};
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
function fibPair(n){if(n===0)return[0n,1n];const[a,b]=fibPair(Math.floor(n/2)),c=a*(2n*b-a),d=a*a+b*b;return n%2?[d,c+d]:[c,d];}
function primeCheck(v){if(!Number.isSafeInteger(v)||v<2||v>10000)throw new RangeError('bounded prime required');for(let x=2;x*x<=v;x++)if(v%x===0)throw new RangeError('prime base required');return BigInt(v);}
export function pellGcdSkinR753(t){
 if(!Number.isSafeInteger(t)||t<1||t>4096)throw new RangeError('bounded Pell thread index required');
 const m=2*t+2,a=fibPair(m-2)[0],b=fibPair(m-1)[0],c=fibPair(m)[0],d=fibPair(m+1)[0];
 const n=c*d,k=a*d,g=gcd(n-1n,k+1n),L=c*((n-1n)/g);
 if(c*b-1n!==k||n-k!==b*d||n-k-1n!==c*c||b*d!==c*c+1n)throw Error('Fibonacci/Cassini identity failure');
 if(gcd(n,k)!==d||g!==gcd(b,2n)||gcd(c,n-1n)!==1n||(c*c+1n)%d!==0n)throw Error('gcd/modular identity failure');
 return{schema:'R753_PELL_GCD_SKIN',t,m,n:n.toString(),k:k.toString(),gcdFirst:d.toString(),gcdSecond:g.toString(),forcedDivisor:L.toString(),modularFact:'ALL_ODD_PRIME_FACTORS_OF_F_M_PLUS_1_ARE_ONE_MOD_FOUR',completeAdjacentPairClassification:'KNOWN_PRIOR_ART',globalFourfoldStatus:'OPEN',canonicalMutation:false};
}
export function kummerCarriesR753(rInput,lInput,pInput){
 let r=N(rInput),l=N(lInput),p=primeCheck(pInput);if(l>r)throw new RangeError('column beyond row');
 let other=r-l,carry=0n,total=0n;
 while(l||other||carry){const c=(l%p+other%p+carry)>=p?1n:0n;total+=c;carry=c;l/=p;other/=p;}
 return Number(total);
}
export function pellRequiredValuationR753(t,pInput){
 const p=primeCheck(pInput),skin=pellGcdSkinR753(t);let L=BigInt(skin.forcedDivisor),min=0;
 while(L%p===0n){L/=p;min++;}
 const observed=kummerCarriesR753(skin.n,skin.k,pInput);
 if(observed<min)throw Error('Kummer contradiction with gcd certificate');
 return{t,prime:pInput,requiredMinCarries:min,actualSharedCoefficientCarries:observed,truthScope:'NECESSARY_CONDITION_FOR_ALL_ALTERNATE_REPRESENTATIONS',fourfoldClaim:'OPEN'};
}
export function screenAdditionalPellCandidateR753(t,row,col,primeBases=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]){
 const skin=pellGcdSkinR753(t),r=N(row),l=N(col),n=BigInt(skin.n),k=BigInt(skin.k);
 if(l<=k+1n||r<2n*l||r>=n-1n)return{status:'OUTSIDE_DECLARED_THIRD_REPRESENTATION_WINDOW',fourfoldClaim:'OPEN'};
 for(const prime of primeBases){const req=pellRequiredValuationR753(t,prime).requiredMinCarries;if(req===0)continue;
  const v=kummerCarriesR753(r,l,prime);
  if(v<req)return{status:'CERTIFIED_NOT_EQUAL_BY_NECESSARY_VALUATION',prime,minimum:req,observed:v,fourfoldClaim:'OPEN'};
 }
 return{status:'NOT_EXCLUDED_BY_SELECTED_PRIMES',fourfoldClaim:'OPEN',equalityEstablished:false};
}