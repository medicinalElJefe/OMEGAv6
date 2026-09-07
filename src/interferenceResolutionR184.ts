import {corpusState,decodeAddress,encodeAddress} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';

export const INTERFERENCE_REVISION='R184' as const;
export const INTERFERENCE_CALIBRATION_R184={
  continuityProtective:0.865606,
  burdenPressure:0.894663,
  contradictionPressure:0.82,
  scarPressure:0.58,
  phasePressure:0.54,
  accelerationPressure:0.42,
  evidenceProtection:0.35,
  provenance:'Recovered OMEGA chart calibration + canonical packet channels. Burden/continuity coefficients retain the previously charted 20,736-state directional strengths; remaining weights are bounded display/inference weights and are not empirical physical constants.'
} as const;

export type InterferenceStateR184={
  address:number;stateId:number;decision:string;
  score:number;components:{burden:number;contradiction:number;scar:number;phase:number;acceleration:number;continuityProtection:number;evidenceProtection:number};
  channels:{continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;evidence:number;motion:number;velocity:number;acceleration:number;phase:number};
};
export type InterferenceCandidateR184=InterferenceStateR184&{relation:'ADMITTED_NEXT'|'D+'|'D-'|'P+'|'P-'|'R+'|'R-'|'L+'|'L-';improvement:number;accepted:boolean};
export type InterferenceStepR184={step:number;from:InterferenceStateR184;accepted:InterferenceCandidateR184|null;candidates:InterferenceCandidateR184[];reason:string;scarReceipt:{kind:'INTERFERENCE_RESOLUTION';fromState:number;toState:number|null;before:number;after:number|null;delta:number;canonicalMutation:false}};
export type InterferenceResolutionR184={
  schema:'OMEGA_INTERFERENCE_RESOLUTION_R184';revision:'R184';sourceState:number;baseline:InterferenceStateR184;steps:InterferenceStepR184[];final:InterferenceStateR184;resolved:boolean;improvement:number;termination:string;reverseTrace:{previousState:number;previousScore:number;currentScore:number;direction:'IMPROVED_FROM_PREVIOUS'|'WORSENED_FROM_PREVIOUS'|'UNCHANGED'|'UNAVAILABLE'};calibration:typeof INTERFERENCE_CALIBRATION_R184;truthBoundary:string;
};

const EPS=1e-9,cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),signed=(x:number)=>Math.max(-1,Math.min(1,Number.isFinite(x)?x:0));
const wrap=(x:number)=>{const t=Math.PI*2;return((x+Math.PI)%t+t)%t-Math.PI};
function structuralNeighbors(address:number){const c=decodeAddress(address);return [
  ['D+',encodeAddress((c.d+1)%12,c.p,c.r,c.l)],['D-',encodeAddress((c.d+11)%12,c.p,c.r,c.l)],
  ['P+',encodeAddress(c.d,(c.p+1)%12,c.r,c.l)],['P-',encodeAddress(c.d,(c.p+11)%12,c.r,c.l)],
  ['R+',encodeAddress(c.d,c.p,(c.r+1)%12,c.l)],['R-',encodeAddress(c.d,c.p,(c.r+11)%12,c.l)],
  ['L+',encodeAddress(c.d,c.p,c.r,(c.l+1)%12)],['L-',encodeAddress(c.d,c.p,c.r,(c.l+11)%12)]
 ] as const}
function state(field:Mandala20736Field,address:number):InterferenceStateR184{
  const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),r=corpusState(a),n=field.routeNext[a]??a;
  const continuity=cl(Number(r.metrics.continuity)),plasticity=cl(Number(r.metrics.plasticity)),contradiction=cl(Number(r.metrics.contradiction)),burden=cl(Number(r.metrics.burden)),scar=cl(Number(r.metrics.scar)),evidence=cl(Number(r.metrics.evidence)),motion=cl(Number(r.math.normalizedMotionRelativity)),velocity=signed(Number(field.velocity[a])),acceleration=signed(Number(field.acceleration[a])),phase=Number(field.phase[a])||0,phasePressure=cl(Math.abs(wrap(Number(field.phase[n])-phase))/Math.PI);
  const w=INTERFERENCE_CALIBRATION_R184,components={burden:w.burdenPressure*burden,contradiction:w.contradictionPressure*contradiction,scar:w.scarPressure*scar*(1-continuity),phase:w.phasePressure*phasePressure,acceleration:w.accelerationPressure*Math.abs(acceleration),continuityProtection:w.continuityProtective*continuity,evidenceProtection:w.evidenceProtection*evidence};
  const positive=components.burden+components.contradiction+components.scar+components.phase+components.acceleration,protective=components.continuityProtection+components.evidenceProtection,score=cl(positive/(positive+protective+EPS));
  return{address:a,stateId:a+1,decision:String(r.metrics.decision),score,components,channels:{continuity,plasticity,contradiction,burden,scar,evidence,motion,velocity,acceleration,phase}};
}
function candidateStates(field:Mandala20736Field,current:InterferenceStateR184):InterferenceCandidateR184[]{
  const next=field.routeNext[current.address]??current.address,raw:[InterferenceCandidateR184['relation'],number][]=[['ADMITTED_NEXT',next],...structuralNeighbors(current.address)];
  const seen=new Set<number>(),rows:InterferenceCandidateR184[]=[];
  for(const [relation,address] of raw){if(address===current.address||seen.has(address))continue;seen.add(address);const s=state(field,address);rows.push({...s,relation,improvement:current.score-s.score,accepted:false})}
  return rows.sort((a,b)=>b.improvement-a.improvement||a.score-b.score||a.address-b.address)
}
export function resolveInterferenceR184(field:Mandala20736Field,address:number,maxSteps=12,minImprovement=.004):InterferenceResolutionR184{
  const baseline=state(field,address),steps:InterferenceStepR184[]=[],visited=new Set<number>([baseline.address]);let current=baseline,termination='MAX_STEPS_REACHED';
  for(let i=0;i<Math.max(1,Math.min(24,maxSteps));i++){
    const candidates=candidateStates(field,current).filter(x=>!visited.has(x.address)),best=candidates[0]||null,accept=Boolean(best&&best.improvement>=minImprovement);
    const accepted=accept?{...best!,accepted:true}:null;
    const reason=!best?'NO_UNVISITED_ACTUAL_STATE_CANDIDATE':!accept?`NO_CANDIDATE_REDUCED_INTERFERENCE_BY_${minImprovement.toFixed(4)}`:`ACCEPTED_${best!.relation}_ACTUAL_STATE_RESIDUAL_REDUCTION`;
    steps.push({step:i,from:current,accepted,candidates:candidates.slice(0,9).map(x=>({...x,accepted:Boolean(accepted&&x.address===accepted.address)})),reason,scarReceipt:{kind:'INTERFERENCE_RESOLUTION',fromState:current.stateId,toState:accepted?.stateId??null,before:current.score,after:accepted?.score??null,delta:accepted?accepted.score-current.score:0,canonicalMutation:false}});
    if(!accepted){termination=reason;break}visited.add(accepted.address);current=accepted;if(current.score<=.08){termination='RESIDUAL_BELOW_0.08';break}
  }
  const previousAddress=Number(corpusState(baseline.address)?.autoPing?.previous),previous=Number.isFinite(previousAddress)?state(field,Math.max(0,Math.min(field.count-1,previousAddress))):null,reverseDirection=!previous?'UNAVAILABLE':baseline.score<previous.score-EPS?'IMPROVED_FROM_PREVIOUS':baseline.score>previous.score+EPS?'WORSENED_FROM_PREVIOUS':'UNCHANGED';
  return{schema:'OMEGA_INTERFERENCE_RESOLUTION_R184',revision:'R184',sourceState:baseline.stateId,baseline,steps,final:current,resolved:current.score<baseline.score-minImprovement,improvement:baseline.score-current.score,termination,reverseTrace:{previousState:previous?.stateId??0,previousScore:previous?.score??0,currentScore:baseline.score,direction:reverseDirection},calibration:INTERFERENCE_CALIBRATION_R184,truthBoundary:'R184 performs bounded internal-coherence reconstruction over actual addressable OMEGA states only. It never invents corrected channel values. Each accepted step must reduce the declared residual score by the minimum gate, rejected alternatives remain visible, loops are blocked, and every step emits a non-canonical scar receipt. Internal coherence is not empirical certainty; external physical/scientific claims still require independent evidence and validation.'};
}
