const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const finite=v=>Number.isFinite(Number(v));
const expDecay=(x,tau)=>Math.exp(-Math.max(0,Number(x)||0)/Math.max(1e-9,Number(tau)||1));

export const LEMMA_STATES=Object.freeze({
  EXACT:'MEASURED_EXACT',
  REGIONAL:'MEASURED_REGIONAL',
  SOURCE:'SOURCE_COVERED',
  WOVEN:'DERIVED_WOVEN_CONTINUITY',
  CONTEXT:'CONTEXT_ONLY',
  UNKNOWN:'UNKNOWN_PRESERVED'
});

export function atlasLodForScale(scale,{width=1200,height=700}={}){
  const s=Math.max(1,Number(scale)||1),area=Math.max(1,Number(width)||1)*Math.max(1,Number(height)||1);
  const densityBoost=Math.max(.72,Math.min(1.55,Math.sqrt(area/(1200*700))));
  const base=s<1.8?12:s<4?18:s<12?24:s<45?32:s<180?40:s<900?48:56;
  const cols=Math.max(12,Math.min(72,Math.round(base*densityBoost))),rows=Math.max(6,Math.min(48,Math.round(cols*.52)));
  return {cols,rows,atlasAddress:s<2?'12':s<12?'144':s<180?'1728':s<900?'20736':'248832',physicalDimensionClaim:false};
}

export function continuityKernel({frameGapHours=0,spatialOverlap=1,cameraVelocity=0,historyCarry=0,orientation=1}={}){
  const temporal=expDecay(Math.abs(Number(frameGapHours)||0),72),spatial=clamp01(spatialOverlap),motion=1/(1+Math.max(0,Number(cameraVelocity)||0)*.018),scar=clamp01(historyCarry),orient=Math.max(0,Math.min(1,Math.abs(Number(orientation)||0)));
  const invariantCarry=clamp01(.38*temporal+.32*spatial+.18*motion+.12*orient),scarCarry=clamp01(.68*scar+.32*invariantCarry),continuity=clamp01(.72*invariantCarry+.28*scarCarry);
  return {temporal,spatial,motion,orientation:orient,invariantCarry,scarCarry,continuity};
}

export function translateLemmaState(input={},previous=null){
  const exact=!!input.exactMeasured,regional=!!input.regionalMeasured,coverage=Math.max(0,Number(input.sourceCoverage)||0),fieldConfidence=clamp01(input.fieldConfidence),admitted=String(input.gammaAdmission||'').startsWith('ADMIT'),contradictions=Math.max(0,Number(input.contradictions)||0),context=!!input.contextAvailable;
  const kernel=continuityKernel({frameGapHours:input.frameGapHours,spatialOverlap:input.spatialOverlap??(coverage?1:0),cameraVelocity:input.cameraVelocity,historyCarry:previous?.kernel?.scarCarry??previous?.confidence??0,orientation:input.orientation??1});
  let state=LEMMA_STATES.UNKNOWN,confidence=0,mode188='ESCALATE',evidenceClass='UNRESOLVED';
  if(exact){state=LEMMA_STATES.EXACT;confidence=1;mode188='STAY';evidenceClass='MEASURED';}
  else if(regional){state=LEMMA_STATES.REGIONAL;confidence=.96;mode188='STAY';evidenceClass='MEASURED';}
  else if(coverage>0){state=LEMMA_STATES.SOURCE;confidence=clamp01(.55+.10*Math.log1p(coverage)+.18*kernel.continuity);mode188=contradictions?'TURN':'STAY';evidenceClass='SOURCE_SUPPORT';}
  else if(admitted&&fieldConfidence>=.42){state=LEMMA_STATES.WOVEN;confidence=clamp01(fieldConfidence*(.62+.38*kernel.continuity));mode188=contradictions?'TURN':confidence>=.58?'STAY':'TURN';evidenceClass='DERIVED';}
  else if(context){state=LEMMA_STATES.CONTEXT;confidence=clamp01(.18+.26*kernel.continuity);mode188='TURN';evidenceClass='CONTEXT';}
  if(contradictions>0&&evidenceClass!=='MEASURED')confidence*=1/(1+.35*contradictions);
  const previousState=previous?.state||null,changed=!!previousState&&previousState!==state;
  const transition=changed?clamp01(.42+.38*kernel.continuity):1;
  const measuredWeight=exact?1:regional?.92:0,sourceWeight=evidenceClass==='SOURCE_SUPPORT'?clamp01(.42+.42*confidence):0,reconstructionWeight=evidenceClass==='DERIVED'?clamp01(.22+.58*confidence):0,contextWeight=evidenceClass==='CONTEXT'?clamp01(.15+.30*confidence):exact||regional?.04:.10;
  return {
    schema:'omega.lemma-state.mode188.v1',state,evidenceClass,confidence:clamp01(confidence),mode188,changed,transition,kernel,
    render:{measuredWeight,sourceWeight,reconstructionWeight,contextWeight,coverageWeight:coverage?clamp01(.22+.10*Math.log1p(coverage)):0},
    proof:{measured:exact||regional,inferred:evidenceClass==='DERIVED',sourceSupported:coverage>0,contradictions,unknownPreserved:state===LEMMA_STATES.UNKNOWN},
    semantics:'Mode188 here is a computational admission/translation policy over evidence states. Woven continuity carries bounded state/history across declared frames; it does not create missing SAR measurements or establish new physical laws.'
  };
}

export function translateFabricCell({coverage=0,newestAgeHours=null,meanAgeHours=null,orbitMix=0,measured=false,regional=false,fieldConfidence=0,gammaAdmission='',previous=null}={}){
  const age=finite(newestAgeHours)?Math.max(0,Number(newestAgeHours)):8760,temporalSupport=expDecay(age,24*45),coverageSupport=clamp01(Math.log1p(Math.max(0,coverage))/Math.log(9)),overlap=clamp01(.68*coverageSupport+.32*temporalSupport);
  const lemma=translateLemmaState({exactMeasured:measured,regionalMeasured:regional,sourceCoverage:coverage,fieldConfidence,gammaAdmission,frameGapHours:finite(meanAgeHours)?meanAgeHours:age,spatialOverlap:overlap,orientation:1-Math.min(1,Math.abs(Number(orbitMix)||0))*.15},previous);
  return {...lemma,coverage,newestAgeHours:finite(newestAgeHours)?Number(newestAgeHours):null,meanAgeHours:finite(meanAgeHours)?Number(meanAgeHours):null,temporalSupport,coverageSupport};
}
