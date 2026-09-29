export const OMEGA_EXACT_CANON_VERSION='OMEGA_EXACT_CANON_v3' as const;
export const OMEGA_EXACT_CANON_BOUNDARY='Canonical v3 preserves exact internal address/topology identities, score-family separation, provenance, orientation, scar/history and proof-tier boundaries. It does not convert model state into observation, does not promote 12^n address levels into physical dimensions, does not add a physical primitive, and does not replace CanonState or governed proof/promotion authority.' as const;

export type ExactProofTierV3=
 |'ENUMERATED'
 |'DERIVED'
 |'CORRELATED'
 |'INTERNALLY_TESTED'
 |'PILOT_SUPPORTED'
 |'BENCHMARKED'
 |'EXTERNALLY_VALIDATED';

export type ExactProvenanceV3='OBS'|'DER'|'INF'|'GAP'|'BND'|'SEAM'|'EQUIV'|'LOCKED';
export type ExactOrientationV3=-1|0|1;
export type FullSphereCoordinateV3={
 D_domain:number;
 P_phase:number;
 R_reg:number;
 L_lens:number;
};
export type ExactAtlasAddressV3={
 schema:'OMEGA_EXACT_ATLAS_ADDRESS_v3';
 version:typeof OMEGA_EXACT_CANON_VERSION;
 resolution:20736;
 index0:number;
 rowId1:number;
 coordinate:FullSphereCoordinateV3;
 antipodeCoordinate:FullSphereCoordinateV3;
 antipodeRowId1:number;
 antipodeIndex0:number;
 physicalDimensionsClaimed:false;
 transform:'FULL_SPHERE_CANONICAL_ANTIPODE';
};

export const EXACT_ATLAS_RESOLUTION_V3=20736 as const;
export const EXACT_ATLAS_RADIX_V3=12 as const;

const clampIndex=(index:number)=>Math.max(0,Math.min(EXACT_ATLAS_RESOLUTION_V3-1,Math.floor(Number(index)||0)));
const axis=(n:number)=>Math.max(1,Math.min(12,Math.floor(Number(n)||1)));
const opp6=(n:number)=>((axis(n)-1+6)%12)+1;

export function fullSphereCoordinateFromIndexV3(index:number):FullSphereCoordinateV3{
 const i=clampIndex(index);
 return{
  D_domain:Math.floor(i/1728)+1,
  P_phase:Math.floor((i%1728)/144)+1,
  R_reg:Math.floor((i%144)/12)+1,
  L_lens:(i%12)+1,
 };
}

export function fullSphereRowIdV3(c:FullSphereCoordinateV3){
 const D=axis(c.D_domain),P=axis(c.P_phase),R=axis(c.R_reg),L=axis(c.L_lens);
 return(D-1)*1728+(P-1)*144+(R-1)*12+L;
}

export function fullSphereAntipodeCoordinateV3(c:FullSphereCoordinateV3):FullSphereCoordinateV3{
 return{
  D_domain:opp6(c.D_domain),
  P_phase:13-axis(c.P_phase),
  R_reg:13-axis(c.R_reg),
  L_lens:opp6(c.L_lens),
 };
}

export function exactAtlasAddressV3(index:number):ExactAtlasAddressV3{
 const index0=clampIndex(index);
 const coordinate=fullSphereCoordinateFromIndexV3(index0);
 const rowId1=fullSphereRowIdV3(coordinate);
 const antipodeCoordinate=fullSphereAntipodeCoordinateV3(coordinate);
 const antipodeRowId1=fullSphereRowIdV3(antipodeCoordinate);
 return{
  schema:'OMEGA_EXACT_ATLAS_ADDRESS_v3',
  version:OMEGA_EXACT_CANON_VERSION,
  resolution:EXACT_ATLAS_RESOLUTION_V3,
  index0,rowId1,coordinate,antipodeCoordinate,antipodeRowId1,
  antipodeIndex0:antipodeRowId1-1,
  physicalDimensionsClaimed:false,
  transform:'FULL_SPHERE_CANONICAL_ANTIPODE',
 };
}

export function verifyExactAtlasAddressV3(a:ExactAtlasAddressV3){
 if(a?.schema!=='OMEGA_EXACT_ATLAS_ADDRESS_v3'||a.version!==OMEGA_EXACT_CANON_VERSION)return false;
 if(a.resolution!==EXACT_ATLAS_RESOLUTION_V3||a.physicalDimensionsClaimed!==false)return false;
 if(fullSphereRowIdV3(a.coordinate)!==a.rowId1||a.rowId1!==a.index0+1)return false;
 const anti=fullSphereAntipodeCoordinateV3(a.coordinate);
 if(fullSphereRowIdV3(anti)!==a.antipodeRowId1||a.antipodeIndex0!==a.antipodeRowId1-1)return false;
 const back=fullSphereAntipodeCoordinateV3(anti);
 return fullSphereRowIdV3(back)===a.rowId1;
}

export const EXACT_SYMBOL_REGISTRY_V3={
 D_domain:'Domain coordinate 1..12',
 P_phase:'Phase coordinate 1..12',
 R_reg:'Regulation coordinate 1..12',
 L_lens:'Lens/observer coordinate 1..12',
 C_omega:'Continuity',
 Lambda:'Burden / constraint load',
 q:'Contradiction',
 Phi:'Future plasticity / recoverability',
 M:'Memory / scar state',
 O:'Observer / projection',
 G:'Graph / relation substrate',
 S_dec:'Canonical decision score; never generic State S',
 D_diff:'Differentiation index',
 D_residual:'Residual/difference channel; never Domain D',
 Sigma_scar:'Scar/history carry where Sigma has this role',
 epsilon:'Versioned numerical stabilizer; never silently changed',
} as const;

export const EXACT_EPSILON_VERSIONS_V3={
 legacy:0.01,
 canon:0.001,
 pcwdProof:1e-9,
} as const;

export const EXACT_SCORE_VARIANTS_V3=[
 {
  id:'PCWD_PROOF_SCORE_V1',
  scope:'PCWD proof/promotion routing only',
  formula:'(continuity*plasticity)/(contradiction+burden+alpha*recoveryError+beta*dynamicsError+gamma*observableError+epsilon)',
  mergeWithOtherScores:false,
 },
 {
  id:'CANON_DECISION_SCORE_V3',
  scope:'Canonical STAY/TURN/ESCALATE decision ratio',
  formula:'(C_omega*Phi)/(q+Lambda+epsilon)',
  epsilonVersion:'canon',
  thresholds:{STAY:'>1.08',TURN:'0.82..1.08',ESCALATE:'<0.82'},
  mergeWithOtherScores:false,
 },
 {
  id:'WATER_MODE188_RATIO',
  scope:'Water Geometry / historical Mode188 workbook',
  formula:'C/(Lambda+q+Lambda*q)',
  mergeWithOtherScores:false,
 },
 {
  id:'ORION_DIRECTIONAL_SCORE',
  scope:'Orion relational-motion lattice',
  formula:'(C_directional*Phi)/(q+Lambda+0.05)',
  mergeWithOtherScores:false,
 },
 {
  id:'WOVEN_RELATIONAL_SCORE',
  scope:'Woven relational whole-context score',
  formula:'(C_omega*W*Phi)/(q+Lambda+q*Lambda+A_minus+epsilon)',
  mergeWithOtherScores:false,
 },
 {
  id:'WOVEN_WHOLE_STATE_SCORE',
  scope:'Balanced whole-state Woven coherence',
  formula:'(C_omega*W*Phi*A_plus)/(q+Lambda+gamma*q*Lambda+A_minus+D_residual+epsilon)',
  mergeWithOtherScores:false,
 },
 {
  id:'CROSS_DOMAIN_WOVEN_CARRY',
  scope:'Cross-domain preservation/differentiation carry',
  formula:'P=(SA+SB)/2; D_diff=(AA+AB)/2; W_carry=2*P*D_diff/(P+D_diff)',
  mergeWithOtherScores:false,
 },
] as const;

export function canonicalDecisionScoreV3(input:{C_omega:number;Phi:number;q:number;Lambda:number;epsilon?:number}){
 const epsilon=Number.isFinite(Number(input.epsilon))?Number(input.epsilon):EXACT_EPSILON_VERSIONS_V3.canon;
 return(Number(input.C_omega)*Number(input.Phi))/(Number(input.q)+Number(input.Lambda)+epsilon);
}
export function canonicalDecisionV3(score:number):'STAY'|'TURN'|'ESCALATE'{
 const s=Number(score);
 return s>1.08?'STAY':s<0.82?'ESCALATE':'TURN';
}

export function crossDomainWovenCarryV3(input:{SA:number;AA:number;SB:number;AB:number}){
 const preservation=(Number(input.SA)+Number(input.SB))/2;
 const differentiation=(Number(input.AA)+Number(input.AB))/2;
 const denom=preservation+differentiation;
 const carry=denom===0?0:(2*preservation*differentiation)/denom;
 return{preservation,differentiation,carry};
}

export const EXACT_RECONCILIATION_LOCKS_V3=[
 'Canonical Full-Sphere antipode is distinct from PCWD Z2 atlas complement; neither silently replaces the other.',
 'All historical score families remain separately named and scoped; no averaging or silent substitution.',
 'Native distributions, covariance, history, frame, orientation and provenance survive until proof closure; compression is optional afterward.',
 'OBS/DER/INF/GAP/BND/SEAM/EQUIV/LOCKED provenance remains attached to evidence and relations.',
 'Unknown/GAP values are not promoted into observation by interpolation or model output.',
 '12→144→1728→20736→248832 and higher 12^n levels are address/state resolutions, not physical spatial dimensions.',
 'Baryon junction remains a derived relational/topological state, not a new physical primitive.',
 'Software holonomy/loop residual remains a path diagnostic unless independently mapped to a physical observable.',
 'Internal/build proof, benchmark support and external predictive validation remain distinct proof tiers.',
 'Negative benchmark results and failed mappings remain in the scar/evidence ledger.',
 'Metric orientation is explicit; lower-is-event and higher-is-event metrics are normalized before comparison.',
 'Epsilon is versioned; legacy 0.01, canon 0.001 and PCWD proof epsilon 1e-9 are not silently merged.',
 'Symbol collisions are prohibited in machine state even when legacy display notation is retained.',
 'Graph relations retain direction, support, uncertainty, provenance, status and time/frame metadata.',
 'Forecast branches remain distinguishable from observations and from Canon admission.',
 'Exact internal topology does not imply universal external ontology.',
] as const;

export const EXACT_STATE_CONTRACT_V3={
 schema:'OMEGA_EXACT_STATE_CONTRACT_v3',
 version:OMEGA_EXACT_CANON_VERSION,
 requiredFamilies:[
  'address',
  'frame_orientation',
  'continuity_burden_contradiction_plasticity',
  'symmetry_differentiation',
  'motion',
  'scar_history',
  'graph_relations',
  'evidence_provenance',
  'score_variant',
  'proof_receipt',
 ] as const,
 proofTiers:['ENUMERATED','DERIVED','CORRELATED','INTERNALLY_TESTED','PILOT_SUPPORTED','BENCHMARKED','EXTERNALLY_VALIDATED'] as const,
 boundary:OMEGA_EXACT_CANON_BOUNDARY,
} as const;
