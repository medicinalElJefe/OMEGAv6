export const R265_SCHEMA='OMEGA_WOVEN_DIMENSIONAL_RELATIVITY_R265';
export const R265_REVISION='R265';
export const R265_OPERATOR='FRAME/RESOLUTION/SKIN PARTITION → WATER TRANSPORT → WOVEN PATH/CORRESPONDENCE → VIOLET RE-EXPRESSION → INVARIANT + SCAR + ORIENTATION + PROVENANCE CARRY → RE-CONTEXTUALIZE/REPARTITION → PROVE';
export const R265_CYCLE=Object.freeze(['OBSERVE','WATER_TRANSPORT','WOVEN_PATH','VIOLET_REEXPRESSION','PROVE','CARRY','RECONTEXTUALIZE']);
export const R265_ADDRESS_LEVELS=Object.freeze([12,144,1728,20736,248832]);
export const R265_SKIN_CONTRACTS=Object.freeze({
 FUNCTION:'Preserve declared inputs/outputs, carry invariants and residuals, and return proof without inventing authority.',
 COMPUTE:'Apply Water transport, Woven correspondence, Violet re-expression and Dimensional Relativity as one state-transition envelope.',
 ORGANIZE:'Partition/repartition by dependency, frame and active resolution; do not confuse address size with physical dimensions.',
 LEARN:'Update only from explicit outcomes or observed transitions; carry scar/history and provenance; unchosen candidates are not failures.',
 RENDER:'Render a lawful projection of state; visual expression cannot mutate CanonState or silently rewrite evidence.',
 EXECUTE:'Execution receipts remain distinct from scientific truth, source promotion and CanonState admission.',
 SELF_BUILD:'Use the R265 cycle for planning/evaluation while R240 remains the single source-mutation/promotion authority.',
 EVIDENCE:'Label observed, returned, derived and inferred values distinctly; no internal coherence score becomes external empirical proof by itself.'
});
export const R265_AUTHORITY=Object.freeze({planning:'R265_CROSS_SKIN_STATE_AND_CYCLE_COMPILATION',sourceMutation:'R240_SINGLE_CANDIDATE_ONLY',dispatch:'R147',returnProof:'R141',history:'R146',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',addsPromotionAuthority:false});
export const R265_TRUTH_BOUNDARY='R265 is a tested software computation/organization/learning contract built from established OMEGA Water Geometry, Woven Continuity, Violet transfiguration semantics and dimensional-relativity address/frame rules. It does not turn 12^k address levels into literal physical dimensions, create a new physical primitive, claim a universal Violet law, equate internal coherence with external scientific proof, or change existing mutation/deployment/CanonState authorities.';
export const R265_HEALTHY_PROMOTION_BOUNDARY='R265 may require explicit carry/provenance or emit residual pressure, but it may not block a capability merely because it is new or uses a new skin. Healthy development remains forward-compatible when the invariant contract is preserved or explicitly version-migrated and re-proved through existing promotion authority.';
export const R265_INVARIANTS=Object.freeze([
 'ADDRESS_LEVELS_ARE_REPRESENTATIONAL_NOT_LITERAL_PHYSICAL_DIMENSIONS',
 'NO_NEW_PHYSICAL_PRIMITIVE',
 'SYMMETRY_AND_ASYMMETRY_ARE_INDEPENDENT_CHANNELS',
 'STRUCTURE_AND_ORIENTATION_ARE_FACTORED',
 'SCAR_HISTORY_IS_CARRIED_NOT_SILENTLY_RESET',
 'WATER_GEOMETRY_IS_FLOW_BOUNDARY_PRESSURE_MEMORY_UNDER_CONSTRAINT_NOT_STATIC_SHAPE_ONLY',
 'WOVEN_CONTINUITY_IS_PATH_CORRESPONDENCE_NOT_VISUAL_SIMILARITY_ONLY',
 'VIOLET_IS_SOFTWARE_TRANSFIGURATION_REEXPRESSION_WITH_FUTURE_PRESERVATION_NOT_A_COLOR_ONLY_OR_UNVALIDATED_PHYSICAL_LAW',
 'ROUND_TRIP_OR_COMMUTATION_PROOF_REQUIRES_MEASURED_RESIDUALS',
 'OBSERVED_RETURNED_DERIVED_INFERRED_PROVENANCE_MUST_REMAIN_DISTINCT',
 'UNCHOSEN_LEARNING_CANDIDATES_ARE_NOT_IMPLICIT_FAILURES',
 'FOUNDATION_WEIGHTS_CHANGED_MUST_NOT_BE_CLAIMED_WITHOUT_ACTUAL_WEIGHT_TRAINING_PROOF',
 'EXECUTION_SUCCESS_NEQ_SCIENTIFIC_TRUTH',
 'R240_SOURCE_PROMOTION_R125_CANON_ADMISSION_AND_CI_PRODUCTION_AUTHORITY_REMAIN_UNCHANGED',
 'HEALTHY_NEW_SKINS_MAY_PROMOTE_WHEN_INVARIANTS_ARE_PRESERVED_OR_VERSION_MIGRATED_AND_REPROVED'
]);

const EPS=1e-3;
const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const mean=(...xs)=>xs.reduce((a,b)=>a+Number(b||0),0)/Math.max(1,xs.length);
const gm=xs=>Math.pow(xs.reduce((a,b)=>a*Math.max(1e-12,clamp01(b)),1),1/Math.max(1,xs.length));
const finiteOrNull=n=>Number.isFinite(Number(n))?Number(n):null;
const sign=n=>Math.abs(Number(n)||0)<1e-12?0:Number(n)>0?1:-1;
const text=(v,fallback='UNSPECIFIED')=>String(v??fallback).trim()||fallback;
function atlasResolution(n){const x=Number(n);if(!Number.isInteger(x)||x<12)return false;let v=x;while(v>1&&v%12===0)v/=12;return v===1}

export function compileWovenDimensionalRelativityR265(input={}){
 const m=input.metrics||input;
 const continuity=clamp01(m.continuity??m.C??m.COmega),plasticity=clamp01(m.plasticity??m.Phi),contradiction=clamp01(m.contradiction??m.q),burden=clamp01(m.burden??m.Lambda),scar=clamp01(m.scar??input.scar),evidence=clamp01(m.evidence??input.evidence);
 const invariantCarry=clamp01(input.invariantCarry??mean(continuity,evidence,1-contradiction));
 const residualInput=clamp01(input.residual??m.residual);
 const water=input.water||{};
 const flow=clamp01(water.flow??water.speed??mean(continuity,plasticity)),boundary=clamp01(water.boundary??mean(contradiction,burden)),pressure=clamp01(water.pressure??burden),memory=clamp01(water.memory??input.memory??mean(continuity,scar)),curvature=clamp01(water.curvature??input.curvature),hysteresis=clamp01(water.hysteresis??scar),mu=Number.isFinite(Number(water.mu))?Number(water.mu):.5;
 const gradContinuity=finiteOrNull(water.gradContinuity),gradBurden=finiteOrNull(water.gradBurden),differentialReady=gradContinuity!==null&&gradBurden!==null,differentialField=differentialReady?gradContinuity-gradBurden+curvature+mu*hysteresis:null;
 const shapeSignature=clamp01(flow*boundary*pressure*memory);
 const waterTransport=clamp01(.28*flow+.18*(1-boundary)+.16*(1-pressure)+.12*memory+.10*(1-curvature)+.10*(1-hysteresis)+.06*continuity);
 const correspondence=clamp01(input.correspondence??input.softwareCorrespondence??mean(continuity,evidence,invariantCarry));
 const effectiveContinuity=clamp01(gm([continuity,plasticity,1-contradiction,1-burden,waterTransport]));
 const wovenContinuity=clamp01(Math.sqrt(correspondence*effectiveContinuity));
 const residualCarry=clamp01(mean(scar,contradiction,burden,residualInput));
 const futurePreservingSoftwareScore=clamp01(gm([wovenContinuity,plasticity,invariantCarry,waterTransport,evidence]));
 const violetAdmissible=futurePreservingSoftwareScore>=.45&&wovenContinuity>=.35&&invariantCarry>=.35;
 const canonicalS=(continuity*plasticity)/(contradiction+burden+EPS);
 const decision=canonicalS>=1.35?'STAY':canonicalS>=.82?'TURN':'ESCALATE';
 const computationCoherence=clamp01(gm([effectiveContinuity,waterTransport,wovenContinuity,futurePreservingSoftwareScore,invariantCarry,1-residualCarry]));
 const orientation=sign(input.orientation??input.sigma),orientationMagnitude=clamp01(Math.abs(Number(input.orientationMagnitude??input.orientation??input.sigma)||0));
 const frame=input.frame||{},sourceFrame=text(input.sourceFrame??frame.source),targetFrame=text(input.targetFrame??frame.target),sourceSkin=text(input.sourceSkin??frame.sourceSkin,'STATE'),targetSkin=text(input.targetSkin??frame.targetSkin,sourceSkin),sourceResolution=Number(input.sourceResolution??frame.sourceResolution??20736),targetResolution=Number(input.targetResolution??frame.targetResolution??sourceResolution),frameChanged=sourceFrame!==targetFrame||sourceSkin!==targetSkin||sourceResolution!==targetResolution;
 const roundTripResidual=finiteOrNull(input.roundTripResidual),commutationResidual=finiteOrNull(input.commutationResidual),residualThreshold=Number.isFinite(Number(input.residualThreshold))?Math.max(0,Number(input.residualThreshold)):.05;
 const roundTripStatus=roundTripResidual===null?'NOT_MEASURED':Math.abs(roundTripResidual)<=residualThreshold?'PASS':'FAIL',commutationStatus=commutationResidual===null?'NOT_MEASURED':Math.abs(commutationResidual)<=residualThreshold?'PASS':'FAIL';
 const provenance=Array.isArray(input.provenance)?input.provenance.map(String).filter(Boolean):input.provenance?[String(input.provenance)]:[];
 const provenanceState=provenance.length?'DECLARED':'MISSING';
 const promotionPosture=decision==='STAY'?'HEALTHY_FORWARD':decision==='TURN'?'FORWARD_WITH_RECONTEXTUALIZATION':'EVIDENCE_FIRST';
 const requiresExistingGateReview=roundTripStatus==='FAIL'||commutationStatus==='FAIL'||provenanceState==='MISSING';
 return{schema:R265_SCHEMA,revision:R265_REVISION,operator:R265_OPERATOR,cycle:[...R265_CYCLE],metrics:{continuity,plasticity,contradiction,burden,scar,evidence,canonicalS,decision,computationCoherence},water:{flow,boundary,pressure,memory,curvature,hysteresis,mu,shapeSignature,transportCoherence:waterTransport,differentialReady,differentialField},woven:{correspondence,effectiveContinuity,continuity:wovenContinuity,residualCarry,invariantCarry},violet:{mode:'SOFTWARE_TRANSFIGURATION_REEXPRESSION_CONTRACT',formulaClaimed:false,futurePreservingSoftwareScore,admissible:violetAdmissible},dimensionalRelativity:{sourceFrame,targetFrame,sourceSkin,targetSkin,sourceResolution,targetResolution,sourceResolutionIs12Power:atlasResolution(sourceResolution),targetResolutionIs12Power:atlasResolution(targetResolution),frameChanged,physicalDimensionsClaimed:false,orientation,orientationMagnitude,structureOrientationFactored:true},proof:{provenance,provenanceState,roundTripResidual,roundTripStatus,commutationResidual,commutationStatus,residualThreshold,externalScientificTruthClaimed:false},development:{promotionPosture,requiresExistingGateReview,blockedByR265:false,healthyPromotionBoundary:R265_HEALTHY_PROMOTION_BOUNDARY},invariants:[...R265_INVARIANTS],authority:R265_AUTHORITY,truthBoundary:R265_TRUTH_BOUNDARY};
}

export function compileSkinCycleR265(state={},skin='COMPUTE',context={}){
 const key=text(skin,'COMPUTE').toUpperCase(),contract=R265_SKIN_CONTRACTS[key]||R265_SKIN_CONTRACTS.COMPUTE;
 const compiled=state?.schema===R265_SCHEMA?state:compileWovenDimensionalRelativityR265({...context,...state,sourceSkin:context.sourceSkin??key,targetSkin:context.targetSkin??key});
 return{schema:'OMEGA_R265_SKIN_CYCLE',revision:R265_REVISION,skin:key,contract,cycle:[...R265_CYCLE],state:compiled,authority:R265_AUTHORITY,canonicalAdmission:false,sourceMutationAuthorized:false};
}

export function compareR265Structures(a={},b={}){
 const A=a?.schema===R265_SCHEMA?a:compileWovenDimensionalRelativityR265(a),B=b?.schema===R265_SCHEMA?b:compileWovenDimensionalRelativityR265(b);
 const structureKeys=['continuity','plasticity','contradiction','burden','scar','evidence','computationCoherence'];
 const deltas=Object.fromEntries(structureKeys.map(k=>[k,Math.abs(Number(A.metrics[k])-Number(B.metrics[k]))]));
 return{sameStructureWithinTolerance:Object.values(deltas).every(v=>v<=1e-9),orientationChanged:A.dimensionalRelativity.orientation!==B.dimensionalRelativity.orientation,deltas,physicalDimensionsClaimed:false};
}
