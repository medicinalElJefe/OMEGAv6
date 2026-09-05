import {evaluateCorpusModes} from './corpusRuntime';
import {sourceBackedModeSummary,type SourceBackedModeResult} from './sourceBackedModeRuntimeR21';
import {ALL_MODES_BOUNDARY,evaluateCanonAuthorityStack,type CanonAuthorityResult} from './allModesAuthority';
import {compileModeExpressionR82,type ModeExpressionFamilyR82} from './modeExpressionRuntimeR82';
import {surfaceLayerBindingR104,type OmegaLayerR104} from './surfaceLayerContractR104';

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const sat=(x:any)=>{const a=Math.abs(Number(x)||0);return a/(1+a)};
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;

export type ModeExecutionStateR107='EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS'|'CATALOG_ONLY'|'AUTHORITY_ACTIVE'|'AUTHORITY_WATCH'|'AUTHORITY_QUIET';
export type ModeContributionR107={
 ref:string;name:string;family:ModeExpressionFamilyR82;state:ModeExecutionStateR107;applicable:boolean;weight:number;affinity:number;basis:string;boundary:string;
};

export type FullModeInfluenceR107={
 channels:Record<ModeExpressionFamilyR82,number>;
 sourceExactContributors:number;
 sourcePacketContributors:number;
 gatedSourceModes:number;
 catalogOnly:number;
 authorityLensContributors:number;
 catalogCount:number;
 authorityCount:number;
 boundary:string;
};

const FAMILY_LAYERS:Record<ModeExpressionFamilyR82,readonly OmegaLayerR104[]>={
 COHERENCE:['STATE','RELATION','COMPUTATION','PROOF'],
 FORECAST:['STATE','COMPUTATION','PROOF'],
 PRUNE:['RELATION','COMPUTATION','ACTION','PROOF'],
 RELATIVITY:['STATE','RELATION','COMPUTATION'],
 FLOW:['RELATION','COMPUTATION','OBSERVATION'],
 MEMORY:['STATE','MEMORY','RELATION','PROOF'],
 PROOF:['MEMORY','OBSERVATION','PROOF'],
 TOPOLOGY:['STATE','RELATION','COMPUTATION'],
 COMPRESSION:['RELATION','COMPUTATION','ACTION'],
 TRAVERSAL:['STATE','RELATION','COMPUTATION','ACTION'],
 RECURSION:['STATE','MEMORY','RELATION','COMPUTATION'],
 GOVERNANCE:['STATE','ACTION','PROOF'],
 SCALE:['STATE','RELATION','COMPUTATION'],
 LIGHT:['RELATION','COMPUTATION','OBSERVATION'],
 GENERIC:['INTELLIGENCE','COMPUTATION']
};

function sourceState(row:SourceBackedModeResult|undefined):ModeExecutionStateR107{
 if(!row)return'CATALOG_ONLY';
 return row.state;
}
function authorityState(row:CanonAuthorityResult):ModeExecutionStateR107{return row.state==='ACTIVE'?'AUTHORITY_ACTIVE':row.state==='WATCH'?'AUTHORITY_WATCH':'AUTHORITY_QUIET'}
function numericSourceWeight(row:SourceBackedModeResult|undefined,affinity:number){
 if(!row||row.state==='GATED_MISSING_INPUTS')return 0;
 if(typeof row.value==='number'&&Number.isFinite(row.value))return cl(.68*sat(row.value)+.32*affinity);
 if(row.state==='SOURCE_PACKET'||row.state==='DERIVED_RUNTIME')return cl(.28+.42*affinity);
 return 0;
}
function familyApplies(family:ModeExpressionFamilyR82,layers:readonly OmegaLayerR104[]){const required=FAMILY_LAYERS[family];return required.some(x=>layers.includes(x))}

function sourceContributions(record:any,layers?:readonly OmegaLayerR104[]){
 const catalog=evaluateCorpusModes(record),runtime=sourceBackedModeSummary(record),byId=new Map(runtime.rows.map(x=>[x.id,x]));
 return catalog.results.map((row:any):ModeContributionR107=>{
  const execution=byId.get(String(row.id));
  const expr=compileModeExpressionR82(row,execution,record),applicable=!layers||familyApplies(expr.family,layers),affinity=cl(row.score),weight=applicable?numericSourceWeight(execution,affinity):0;
  return{ref:String(row.id),name:String(row.name),family:expr.family,state:sourceState(execution),applicable,weight,affinity,basis:execution?.formula||row.calculus||row.algebra||row.purpose||'catalog metadata',boundary:execution?.detail||expr.boundary};
 });
}
function authorityContributions(record:any,layers?:readonly OmegaLayerR104[]){
 return evaluateCanonAuthorityStack(record).map((row:CanonAuthorityResult):ModeContributionR107=>{
  const expr=compileModeExpressionR82(row,null,record),applicable=!layers||familyApplies(expr.family,layers),weight=applicable?cl(row.activation*.35):0;
  return{ref:`A${String(row.id).padStart(2,'0')}`,name:row.name,family:expr.family,state:authorityState(row),applicable,weight,affinity:cl(row.activation),basis:row.basis,boundary:expr.boundary};
 });
}

export function globalModeInfluenceR107(record:any):FullModeInfluenceR107{
 const source=sourceContributions(record),authority=authorityContributions(record),families=Object.keys(FAMILY_LAYERS) as ModeExpressionFamilyR82[],channels={} as Record<ModeExpressionFamilyR82,number>;
 for(const family of families){
  const sourceWeights=source.filter(x=>x.family===family&&x.state!=='CATALOG_ONLY'&&x.state!=='GATED_MISSING_INPUTS').map(x=>x.weight).filter(x=>x>0);
  const lensWeights=authority.filter(x=>x.family===family).map(x=>x.weight).filter(x=>x>0);
  // Executed/source-bound outputs dominate; authority lenses remain bounded secondary governance influence.
  const sourceMean=mean(sourceWeights),lensMean=mean(lensWeights),hasSource=sourceWeights.length>0;
  channels[family]=cl(hasSource ? .78*sourceMean+.22*lensMean : lensMean);
 }
 const exact=source.filter(x=>x.state==='EXECUTED_EXACT'&&x.weight>0).length,packet=source.filter(x=>(x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME')&&x.weight>0).length,gated=source.filter(x=>x.state==='GATED_MISSING_INPUTS').length,catalogOnly=source.filter(x=>x.state==='CATALOG_ONLY').length,lenses=authority.filter(x=>x.weight>0).length;
 return{channels,sourceExactContributors:exact,sourcePacketContributors:packet,gatedSourceModes:gated,catalogOnly,authorityLensContributors:lenses,catalogCount:ALL_MODES_BOUNDARY.sourceModeEvaluations,authorityCount:ALL_MODES_BOUNDARY.canonAuthorities,boundary:'R107 keeps the complete source-mode catalog available globally while applying only source-bound executable/packet outputs and bounded canon-lens activation. Catalog affinity alone never becomes execution. Gated formulas contribute zero until authoritative inputs exist.'};
}

export function surfaceModeFabricR107(surface:string,record:any){
 const layer=surfaceLayerBindingR104(surface),source=sourceContributions(record,layer.layers),authority=authorityContributions(record,layer.layers),applicable=[...source,...authority].filter(x=>x.applicable),contributing=applicable.filter(x=>x.weight>0).sort((a,b)=>b.weight-a.weight),gated=applicable.filter(x=>x.state==='GATED_MISSING_INPUTS'),catalogOnly=applicable.filter(x=>x.state==='CATALOG_ONLY');
 const global=globalModeInfluenceR107(record);
 return{
  schema:'OMEGA_FULL_MODE_CAPABILITY_FABRIC_R107',surface,layer,availability:{sourceCatalog:global.catalogCount,canonLenses:global.authorityCount,sourceRuntimeEvaluators:source.filter(x=>x.state!=='CATALOG_ONLY').length},
  applicableCount:applicable.length,contributingCount:contributing.length,gatedCount:gated.length,catalogOnlyCount:catalogOnly.length,
  topContributors:contributing.slice(0,12),gated:gated.slice(0,8),channels:global.channels,
  boundary:'All mode authorities are globally available. Surface applicability selects which lawful mode families are relevant to this instrument; only source-bound outputs and bounded derived lenses influence computation/visualization. Selection never invents missing inputs or creates a second CanonState.'
 };
}
