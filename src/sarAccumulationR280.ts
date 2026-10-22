import type{SarObservationR280}from'./sarTruthR280';

export interface SarStackFrameR280{
 observation:SarObservationR280;nativeSourceBound:boolean;syntheticTween:boolean;coherenceToPrevious?:number;changeClass?:'AMPLITUDE'|'COHERENCE'|'LOS_DEFORMATION'|'POLARIMETRY'|'MULTI_BAND';
}
export interface SarStackSummaryR280{
 frames:number;observedFrames:number;syntheticFrames:number;start:string|null;end:string|null;gaps:{from:string;to:string;days:number}[];warnings:string[];
}

export function summarizeSarStackR280(frames:SarStackFrameR280[]):SarStackSummaryR280{
 const sorted=[...frames].sort((a,b)=>Date.parse(a.observation.provenance.acquiredAt)-Date.parse(b.observation.provenance.acquiredAt));
 const gaps:{from:string;to:string;days:number}[]=[];for(let i=1;i<sorted.length;i++){const a=sorted[i-1].observation.provenance.acquiredAt,b=sorted[i].observation.provenance.acquiredAt;const d=(Date.parse(b)-Date.parse(a))/86400000;if(Number.isFinite(d)&&d>0)gaps.push({from:a,to:b,days:d})}
 const warnings:string[]=[];if(sorted.some(x=>x.syntheticTween))warnings.push('SYNTHETIC_TWEEN_PRESENT');if(sorted.some(x=>!x.nativeSourceBound))warnings.push('UNBOUND_FRAME_PRESENT');
 return{frames:sorted.length,observedFrames:sorted.filter(x=>x.nativeSourceBound&&!x.syntheticTween).length,syntheticFrames:sorted.filter(x=>x.syntheticTween).length,start:sorted[0]?.observation.provenance.acquiredAt||null,end:sorted.at(-1)?.observation.provenance.acquiredAt||null,gaps,warnings};
}

export function accumulationPlaybackFramesR280(frames:SarStackFrameR280[]){
 return[...frames].sort((a,b)=>Date.parse(a.observation.provenance.acquiredAt)-Date.parse(b.observation.provenance.acquiredAt)).map((x,index)=>({
  index,acquiredAt:x.observation.provenance.acquiredAt,sourceId:x.observation.provenance.sourceId,truth:x.observation.truth,
  nativeSourceBound:x.nativeSourceBound,syntheticTween:x.syntheticTween,coherenceToPrevious:x.coherenceToPrevious??null,
  label:x.syntheticTween?'SYNTHETIC TRANSITION':x.nativeSourceBound?'OBSERVED ACQUISITION':'UNBOUND FRAME'
 }));
}

export function stackAdmissionR280(frames:SarStackFrameR280[]){
 const summary=summarizeSarStackR280(frames);const reasons:string[]=[];if(summary.frames<2)reasons.push('TWO_OR_MORE_ACQUISITIONS_REQUIRED');if(summary.syntheticFrames>0)reasons.push('SYNTHETIC_FRAMES_CANNOT_BE_OBSERVATION_EVIDENCE');if(summary.observedFrames<2)reasons.push('TWO_BOUND_OBSERVATIONS_REQUIRED');
 return{admitted:reasons.length===0,reasons,summary};
}
