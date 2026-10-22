import type{SarPolarizationR280}from'./sarTruthR280';

export interface PolChannelR280{polarization:Exclude<SarPolarizationR280,'DUAL'|'QUAD'|'UNKNOWN'>;re:number;im:number;calibrated:boolean}
export interface PolarimetricStateR280{channels:PolChannelR280[];basis:'LINEAR_HV';sourceBound:boolean}
export function channelPowerR280(c:PolChannelR280){return c.re*c.re+c.im*c.im}
export function polarimetricPowersR280(s:PolarimetricStateR280){const out:Record<string,number>={};for(const c of s.channels)out[c.polarization]=channelPowerR280(c);return out}
export function crossPolRatioR280(s:PolarimetricStateR280){const p=polarimetricPowersR280(s);const co=(p.HH||0)+(p.VV||0);const cross=(p.HV||0)+(p.VH||0);return co>0?cross/co:null}
export function polarimetricAdmissionR280(s:PolarimetricStateR280){const reasons:string[]=[];if(!s.sourceBound)reasons.push('SOURCE_REQUIRED');if(!s.channels.length)reasons.push('CHANNELS_REQUIRED');if(s.channels.some(c=>!c.calibrated))reasons.push('POLARIMETRIC_CALIBRATION_REQUIRED');return{admitted:reasons.length===0,reasons}}

export interface PolInSARR280{master:PolarimetricStateR280;slave:PolarimetricStateR280;coherenceByChannel:Partial<Record<'HH'|'VV'|'HV'|'VH',number>>;verticalPhaseCenterByChannelRad?:Partial<Record<'HH'|'VV'|'HV'|'VH',number>>;baselineM:number;temporalBaselineDays:number}
export function polInSARAdmissionR280(x:PolInSARR280){const reasons=[...polarimetricAdmissionR280(x.master).reasons,...polarimetricAdmissionR280(x.slave).reasons];const coh=Object.values(x.coherenceByChannel).filter((v):v is number=>typeof v==='number');if(!coh.length)reasons.push('INTERFEROMETRIC_COHERENCE_REQUIRED');if(coh.some(v=>v<0||v>1))reasons.push('COHERENCE_OUT_OF_RANGE');return{admitted:reasons.length===0,reasons,meanCoherence:coh.length?coh.reduce((a,b)=>a+b,0)/coh.length:null}}

export function relativeVerticalPhaseCentersR280(x:PolInSARR280){const p=x.verticalPhaseCenterByChannelRad||{};const keys=Object.keys(p) as Array<keyof typeof p>;return keys.flatMap((a,i)=>keys.slice(i+1).map(b=>({a,b,deltaRad:(p[b]??0)-(p[a]??0)})))}
