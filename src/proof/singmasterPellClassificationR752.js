/** R752/V15 complete classification of consecutive-row and consecutive-column
 * nontrivial left-half binomial coincidences. Known Singmaster Pell family.
 * Exact BigInt only. Does not assert sharp Singmaster or physical dimensionality.
 */
import {pellCurveR752,pellInverseR752} from './singmasterPellThreadR752.js';
export const R752_CLASSIFICATION_SCOPE=Object.freeze({claim:'ALL_CONSECUTIVE_ROW_AND_COLUMN_NONTRIVIAL_BINOMIAL_EQUALITIES',globalProof:'ALGEBRAIC_DESCENT_AND_CASSINI',sharpSingmaster:'OPEN',fourfoldAtlasNewClosures:0,historicalPriorArt:'SINGMASTER_1975',canonicalMutation:false,sourcePromotion:false,productionAuthority:false});
const integer=x=>{if(typeof x==='bigint')return x;if(typeof x==='number'&&Number.isSafeInteger(x))return BigInt(x);if(typeof x==='string'&&/^(0|-?[1-9][0-9]*)$/.test(x))return BigInt(x);throw new TypeError('exact integer required')};
export function fibonacciPairFastR752(index){
 if(!Number.isSafeInteger(index)||index<0||index>10000)throw new RangeError('finite Fibonacci index required');
 function calc(n){if(n===0)return[0n,1n];const[a,b]=calc(Math.floor(n/2)),c=a*(2n*b-a),d=a*a+b*b;return n%2?[d,c+d]:[c,d]}
 return calc(index);
}
export function fibonacciAdjacentPairR752(t){
 if(!Number.isSafeInteger(t)||t<0||t>4096)throw new RangeError('bounded t required');
 const m=2*t+2,[b,c]=fibonacciPairFastR752(m),[a]=fibonacciPairFastR752(m-1);
 const n=b*c,k=b*a-1n,square=b*b;
 if(a*c-square!==1n||pellCurveR752(n,k)!==0n||n-k-1n!==square)throw Error('Cassini certificate fails');
 return{t,m,n:n.toString(),k:k.toString(),previousF:a.toString(),middleF:b.toString(),nextF:c.toString(),interiorSquare:square.toString(),nontrivial:t>0,globalSharpStatus:'OPEN',isOmegaCardinalityMatch:square===20736n,omegaPhysicalEquivalence:false};
}
export function classifyAdjacentPairR752(nInput,kInput,{maxSteps=4096}={}){
 let n=integer(nInput),k=integer(kInput);
 if(!Number.isSafeInteger(maxSteps)||maxSteps<1||maxSteps>10000)throw new RangeError('bounded descent resource required');
 if(k<2n||n-1n<2n*(k+1n))return{status:'NOT_ADMISSIBLE',classified:false,sharpSingmaster:'OPEN'};
 if(pellCurveR752(n,k)!==0n)return{status:'NOT_EQUAL',classified:false,sharpSingmaster:'OPEN'};
 let steps=0;const initial={n,k};
 while(k>0n){
  if(steps>=maxSteps)return{status:'RESOURCE_HOLD_NO_INFERENCE',classified:false,sharpSingmaster:'OPEN'};
  const v=pellInverseR752(n,k),N=v.n,K=v.k;
  if(pellCurveR752(N,K)!==0n||K<0n||K>=k||N<2n*(K+1n))throw Error('descent invariant failure');
  n=N;k=K;steps++;
 }
 if(n!==2n)throw Error('unexpected seed: Q(n,0) only permits n=0 or 2');
 const witness=fibonacciAdjacentPairR752(steps);
 if(witness.n!==initial.n.toString()||witness.k!==initial.k.toString())throw Error('Fibonacci classification mismatch');
 return{status:'CLASSIFIED_EXACT_ADJACENT_PAIR',classified:true,t:steps,evenIndex:witness.m,n:initial.n.toString(),k:initial.k.toString(),squareInterior:witness.interiorSquare,sharpSingmaster:'OPEN',fourfoldExclusion:false,physicalClaim:false};
}
