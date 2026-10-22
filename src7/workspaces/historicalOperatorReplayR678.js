/**
 * R678 source-donor replay reconciliation (B053 TRUE_OPERATOR_ENGINE_v9.zip).
 * Historical source claims T=60; archived Propagation_final_v9.csv is the
 * distribution after 59 effective update operations. Keep both facts.
 * All 1,728 original data rows match 59 updates at seven decimal places
 * (source SHA-256 of comma-joined fixed-7 values verified independently).
 */
import {propagateOperatorR676,operatorNodeR676} from './operatorGraphR676.js';

export const R678_DONOR_REPLAY_PROOF=Object.freeze({
 schema:'OMEGA_HISTORICAL_OPERATOR_REPLAY_R678',
 archive:'OMEGA-B053-NATIVE-FOUNDATION-INTELLIGENCE',
 source:'TRUE_OPERATOR_ENGINE_v9.zip/Propagation_final_v9.csv',
 claimedIterations:60,
 matchedEffectiveUpdates:59,
 seed:'12 normalized impulses at phase u=6 regulation v=6, one per domain',
 eta:.35,alpha:1,beta:.85,
 quantizationDecimals:7,
 fullVectorSha256:'5f2bed97e66c0fe0e0755d3c805ed591bd37a5100e099308c998f73280381ed5',
 archivedMatrixMaximumAbsoluteDifference:4.768371586472142e-8,
 beforeRepairL1Difference:.2992606925725243,
 observed59StepL1Difference:2.5582838971047146e-8,
 noPhysicalAccuracyClaim:true,
 archiveMetadataContradictionRetained:true,
 authority:'RECOVERED_DONOR_REPLAY_NOT_R125_CANON_ADMISSION'
});

export function historicalImpulseSeedR678(){
 const x=new Float64Array(1728);
 for(let d=0;d<12;d++)x[operatorNodeR676(d,6,6)]=1/12;
 return x;
}
export function replayHistoricalDonorR678(effectiveUpdates=59){
 if(!Number.isInteger(effectiveUpdates)||effectiveUpdates<1||effectiveUpdates>60)throw Error('R678 invalid effective update horizon');
 const result=propagateOperatorR676(historicalImpulseSeedR678(),{iterations:effectiveUpdates,eta:.35,alpha:1,beta:.85});
 return Object.freeze({...result,donorClaimedT:60,effectiveUpdates,metadataDiscrepancy:effectiveUpdates!==60,
  parityAuthority:'REPLAY_COMPARISON_ONLY',canonicalMutation:false,originalSourceFile:R678_DONOR_REPLAY_PROOF.source});
}
export async function verifyOriginalDonorReplayR678(values){
 if(!values||values.length!==1728)throw Error('R678 requires complete 1728-value vector');
 for(let i=0;i<1728;i++)if(!Number.isFinite(values[i])||values[i]<0)throw Error('R678 invalid replay value');
 if(!globalThis.crypto?.subtle)throw Error('R678 requires cryptographic proof runtime');
 const canonical=Array.from(values,v=>v.toFixed(7)).join(',');
 const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical));
 const sha256=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 return Object.freeze({schema:'OMEGA_HISTORICAL_OPERATOR_PARITY_CHECK_R678',
  sha256,expectedSha256:R678_DONOR_REPLAY_PROOF.fullVectorSha256,
  match:sha256===R678_DONOR_REPLAY_PROOF.fullVectorSha256,
  precision:'SOURCE_CSV_FIXED_7_DECIMALS',
  sourceAuthority:'SOURCE_BYTES_VERIFIED_LOCALLY',
  canonicalMutation:false,physicalClaim:false});
}
