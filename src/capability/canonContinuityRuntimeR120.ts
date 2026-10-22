import {routeLayerOutputR111,type OmegaLayerR111} from './routeLayerOutputRegistryR111';

export const WOVEN_CONTINUITY_PHASES_R120=[
 'PARTITION',
 'EXCHANGE_TRANSFORM',
 'INVARIANT_CARRY',
 'SCAR_RESIDUAL_CARRY',
 'RECONTEXTUALIZE_REPARTITION'
] as const;

export const RSC_LOOP_R120=['PARENT','INTERACTION','SCAR','CONTINUITY','COMPRESSION','SKIN','INTERPRETATION','BEHAVIOR'] as const;
export const ATLAS_RESOLUTION_R120=[12,144,1728,20736,248832,61917364224] as const;
export const ORIENTATION_STATES_R120=[-1,0,1] as const;

export type CanonContinuityTraceR120={
 schema:'OMEGA_CANON_CONTINUITY_TRACE_R120';
 route:string;
 activePhases:readonly string[];
 rsc:readonly string[];
 atlasResolution:readonly number[];
 orientation:'SIGNED_FRAME'|'DECLARED_FRAME';
 symmetryLaw:string;
 handoffLaw:string;
 truthBoundary:string;
};

const hasAny=(layers:readonly OmegaLayerR111[],need:readonly OmegaLayerR111[])=>need.some(x=>layers.includes(x));

export function routeCanonTraceR120(route:string):CanonContinuityTraceR120{
 const contract=routeLayerOutputR111(route),layers=contract.layers;
 const phases:string[]=['PARTITION'];
 if(hasAny(layers,['RELATION','COMPUTATION','ACTION','INTELLIGENCE']))phases.push('EXCHANGE_TRANSFORM');
 if(hasAny(layers,['STATE','PROOF']))phases.push('INVARIANT_CARRY');
 if(layers.includes('MEMORY'))phases.push('SCAR_RESIDUAL_CARRY');
 phases.push('RECONTEXTUALIZE_REPARTITION');
 return {
  schema:'OMEGA_CANON_CONTINUITY_TRACE_R120',
  route,
  activePhases:phases,
  rsc:RSC_LOOP_R120,
  atlasResolution:ATLAS_RESOLUTION_R120,
  orientation:hasAny(layers,['RELATION','COMPUTATION'])?'SIGNED_FRAME':'DECLARED_FRAME',
  symmetryLaw:'Symmetry is preserved structure under a declared transform; asymmetry is direction, phase, history, local offset or emergence. 37/73 remain reference-kernel parameters unless independently validated.',
  handoffLaw:'partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition',
  truthBoundary:'Atlas levels are address/representation resolutions, not literal physical dimensions. This runtime coordinates computational and visual contracts; it does not invent physical validation.'
 };
}

export function continuityHandoffR120(fromRoute:string,toRoute:string){
 const a=routeLayerOutputR111(fromRoute),b=routeLayerOutputR111(toRoute);
 const shared=a.layers.filter(x=>b.layers.includes(x));
 const invariantCarry=a.layers.includes('PROOF')||a.layers.includes('STATE');
 const scarCarry=a.layers.includes('MEMORY')&&b.layers.includes('MEMORY');
 const score=Math.min(1,(shared.length/Math.max(1,new Set([...a.layers,...b.layers]).size))+(invariantCarry?.2:0)+(scarCarry?.15:0));
 return {schema:'OMEGA_CONTINUITY_HANDOFF_R120',fromRoute,toRoute,sharedLayers:shared,invariantCarry,scarCarry,score:Number(score.toFixed(4)),orientation:routeCanonTraceR120(toRoute).orientation};
}
