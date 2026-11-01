import {fibonacciAdjacentPairR752,classifyAdjacentPairR752} from './singmasterPellClassificationR752.js';
import {pellCurveR752,pellForwardR752,pellInverseR752,pellNormR752,certifyPellMapR752} from './singmasterPellThreadR752.js';
export const R752_WORKBENCH_SCHEMA='OMEGA_R752_PELL_EXECUTABLE_WITNESS_V1';
export function computePellWorkbenchR752(input){
 const raw=String(input);
 if(!/^(0|[1-9][0-9]*)$/.test(raw))throw new RangeError('index must be a whole number from 0 to 64');
 const t=Number(raw);
 if(!Number.isSafeInteger(t)||t>64)throw new RangeError('index must be a whole number from 0 to 64');
 const pair=fibonacciAdjacentPairR752(t),n=BigInt(pair.n),k=BigInt(pair.k);
 const polynomial=certifyPellMapR752(),norm=pellNormR752(n,k),forward=pellForwardR752(n,k),inverse=pellInverseR752(forward.n,forward.k);
 if(!polynomial.isGlobalIdentity||pellCurveR752(n,k)!==0n||norm.norm!==-4n||inverse.n!==n||inverse.k!==k)throw Error('exact Pell invariant failed');
 const classification=t===0?{status:'SEED_ONLY',classified:false,sharpSingmaster:'OPEN'}:classifyAdjacentPairR752(n,k);
 if(t>0&&(!classification.classified||classification.t!==t))throw Error('exact adjacent-pair classification failed');
 return{schema:R752_WORKBENCH_SCHEMA,input:{t},pair,classification,polynomial,norm:{x:String(norm.x),y:String(norm.y),value:String(norm.norm)},forward:{n:String(forward.n),k:String(forward.k)},inverse:{n:String(inverse.n),k:String(inverse.k)},truth:{priorArt:'SINGMASTER_1975',scope:'ADJACENT_ROW_AND_COLUMN_PAIR_ONLY',sharpSingmaster:'OPEN',physicalMeasurement:false,canonMutation:false,sourcePromotion:false}};
}
export function verifyPellWorkbenchR752(raw){
 const value=typeof raw==='string'?JSON.parse(raw):raw;
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schema!==R752_WORKBENCH_SCHEMA)throw Error('R752 witness schema mismatch');
 const expected=computePellWorkbenchR752(value.input?.t);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R752 witness mismatch: exact recomputation refused altered or incomplete packet');
 return expected;
}
