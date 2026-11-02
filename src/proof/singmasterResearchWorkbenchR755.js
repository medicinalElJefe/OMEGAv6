/** R755 executable, bounded exact-arithmetic research workbench.
 * The packet is recomputed from declared inputs; no authority or theorem promotion.
 */
import {fibonacciAdjacentPairR752,classifyAdjacentPairR752} from './singmasterPellClassificationR752.js';
import {pellGcdSkinR753,pellRequiredValuationR753,screenAdditionalPellCandidateR753} from './singmasterPellSkinR753.js';
import {certifyHigherColumnR754} from './singmasterColumnCrossingR754.js';

export const R755_WORKBENCH_BOUNDARY=Object.freeze({
 schema:'OMEGA_R755_EXACT_PELL_WORKBENCH_V1',scope:'BOUNDED_ADJACENT_PAIR_AND_HIGHER_COLUMN',
 priorArt:'CLASSICAL_SINGMASTER_PELL_FIBONACCI',sharpSingmaster:'OPEN',
 fourfoldClosures:0,physicalDimensions:false,canonicalMutation:false,
 nativeDeviceProof:false,sourcePromotion:false
});
const parse=(v,name,min,max)=>{
 const s=String(v);
 if(!/^(0|[1-9][0-9]*)$/.test(s))throw new RangeError(name+' must be a nonnegative decimal integer');
 const n=Number(s);
 if(!Number.isSafeInteger(n)||n<min||n>max)throw new RangeError(name+' must be between '+min+' and '+max);
 return n;
};
export function computePellWorkbenchR755(tInput='3',columnInput='274',rowInput='550',primeInput='5'){
 const t=parse(tInput,'Pell index',2,5);
 const pair=fibonacciAdjacentPairR752(t),n=Number(pair.n),k=Number(pair.k);
 const column=parse(columnInput,'Higher column',k+2,Math.floor((n-2)/2));
 const row=parse(rowInput,'Candidate row',2*column,n-2);
 const prime=parse(primeInput,'Prime',2,97);
 if(![2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97].includes(prime))throw new RangeError('Prime must be one of the supported exact bases');
 const classification=classifyAdjacentPairR752(pair.n,pair.k);
 if(!classification.classified||classification.t!==t)throw Error('Exact adjacent classification failed');
 const skin=pellGcdSkinR753(t);
 if(skin.n!==pair.n||skin.k!==pair.k)throw Error('Pell skin and classification disagree');
 const crossing=certifyHigherColumnR754(n,k,column);
 if(!crossing.complete)throw Error('Higher-column interval not certified');
 const valuation=pellRequiredValuationR753(t,prime);
 const screen=screenAdditionalPellCandidateR753(t,row,column,[prime]);
 return {
  schema:R755_WORKBENCH_BOUNDARY.schema,
  input:{t,column,row,prime},
  pair:{n:pair.n,k:pair.k,interiorSquare:pair.interiorSquare},
  classification:{status:classification.status,steps:classification.t},
  arithmetic:{gcdFirst:skin.gcdFirst,gcdSecond:skin.gcdSecond,forcedDivisor:skin.forcedDivisor},
  valuation:{prime,requiredMinCarries:valuation.requiredMinCarries,sharedCoefficientCarries:valuation.actualSharedCoefficientCarries},
  crossing:{status:crossing.status,rowMin:crossing.rowMin,rowMax:crossing.rowMax,coveredRows:crossing.coveredRows,beforeRow:crossing.beforeRow,afterRow:crossing.afterRow,excludesEquality:crossing.excludesEquality},
  candidate:{row,column,status:screen.status,prime:screen.prime??null,minimum:screen.minimum??null,observed:screen.observed??null},
  boundary:R755_WORKBENCH_BOUNDARY
 };
}
export function verifyPellWorkbenchR755(serialized){
 if(typeof serialized!=='string'||serialized.length>30000)throw new RangeError('Bounded JSON witness required');
 const packet=JSON.parse(serialized);
 if(!packet||typeof packet!=='object'||Array.isArray(packet)||packet.schema!==R755_WORKBENCH_BOUNDARY.schema)throw Error('Unrecognized research witness');
 const input=packet.input;
 if(!input||typeof input!=='object')throw Error('Missing witness input');
 const expected=computePellWorkbenchR755(input.t,input.column,input.row,input.prime);
 if(JSON.stringify(packet)!==JSON.stringify(expected))throw Error('Witness differs from fresh exact computation');
 return expected;
}
