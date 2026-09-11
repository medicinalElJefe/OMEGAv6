import{SAR_MISSION_REGISTRY_R280,type SarBandR280,type SarMissionSpecR280}from'./sarTruthR280';

export interface SarSourceNeedR280{
 requireComplex?:boolean; requireInterferometry?:boolean; requireDeformation?:boolean; requireVegetationPenetration?:boolean;
 requireFineUrbanDetail?:boolean; requireWideSwath?:boolean; maxRevisitDays?:number; preferredBands?:SarBandR280[]; maxResolutionM?:number;
}
export interface SarSourceScoreR280{mission:SarMissionSpecR280;score:number;reasons:string[];warnings:string[]}

const max=v=>v&&v.length?Math.max(...v):null;const min=v=>v&&v.length?Math.min(...v):null;
export function rankSarSourcesR280(need:SarSourceNeedR280,missions=SAR_MISSION_REGISTRY_R280):SarSourceScoreR280[]{
 return missions.map(m=>{let score=0;const reasons:string[]=[];const warnings:string[]=[];
  if(need.preferredBands?.some(b=>m.bands.includes(b))){score+=24;reasons.push('preferred band available')}
  if(need.requireVegetationPenetration&&m.bands.some(b=>b==='L'||b==='P')){score+=24;reasons.push('long-wavelength vegetation/volume sensitivity')}
  if(need.requireFineUrbanDetail&&m.bands.includes('X')){score+=20;reasons.push('X-band high-detail candidate')}
  if(need.requireInterferometry&&(m.id==='tandem-x'||m.id==='srtm'||m.id==='sentinel-1'||m.id==='nisar')){score+=20;reasons.push('interferometric use compatible')}
  if(need.requireDeformation&&(m.id==='sentinel-1'||m.id==='terrasar-x'||m.id==='radarsat'||m.id==='nisar')){score+=18;reasons.push('repeat-observation deformation candidate')}
  if(need.maxRevisitDays!=null){if(m.revisitDays!=null&&m.revisitDays<=need.maxRevisitDays){score+=14;reasons.push('revisit satisfies request')}else warnings.push('revisit unavailable or slower than request')}
  if(need.maxResolutionM!=null){const r=min(m.nominalResolutionM);if(r!=null&&r<=need.maxResolutionM){score+=10;reasons.push('nominal resolution satisfies request')}else warnings.push('resolution metadata unavailable or coarser than request')}
  if(need.requireWideSwath){const s=max(m.swathKm);if(s!=null&&s>=200){score+=10;reasons.push('wide-swath candidate')}else warnings.push('wide-swath capability not established in registry')}
  if(need.requireComplex)warnings.push('catalog capability does not prove complex product availability; bind an actual SLC/complex product before execution');
  return{mission:m,score,reasons,warnings};
 }).sort((a,b)=>b.score-a.score||a.mission.label.localeCompare(b.mission.label));
}

export function sourcePlannerTruthBoundaryR280(){return{
 recommendationOnly:true,
 rule:'Capability ranking recommends a source family; it does not prove a current acquisition, accessible product, complex phase availability, latency, or fitness for a specific scene.',
 next:['query real catalog','bind exact product id','verify processing level','verify acquisition geometry','verify calibration/provenance','compile processing DAG']
}}
