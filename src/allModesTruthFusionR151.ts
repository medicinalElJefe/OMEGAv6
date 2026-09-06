import {corpusState,evaluateCorpusModes,STATE_COUNT} from './corpusRuntime';
import {CANON_AUTHORITY_COUNT,evaluateCanonAuthorityStack} from './allModesAuthority';
import {sourceBackedModeSummary,type SourceBackedModeState} from './sourceBackedModeRuntimeR21';

export const R151_SCHEMA='OMEGA_ALL_MODES_TRUTH_FUSION_R151' as const;
export const R151_CHANNEL_COUNT=179+CANON_AUTHORITY_COUNT;
export const R151_LAWS=Object.freeze([
 'ONE_CANONICAL_PACKET_MANY_MODE_READINGS',
 'SOURCE_EXECUTION_AND_CANON_LENSES_REMAIN_DISTINCT_PROVENANCE_CLASSES',
 'GATED_MODES_CONTRIBUTE_GAP_PRESSURE_NOT_EXECUTED_TRUTH',
 'CATALOG_LENSES_INFORM_DISAGREEMENT_BUT_CANNOT_OUTVOTE_SOURCE_EXECUTION',
 'MODE_AGREEMENT_IS_NOT_INDEPENDENT_EMPIRICAL_REPLICATION',
 'FUSION_RECOMMENDATION_NEVER_OVERRIDES_CANONICAL_DISPATCH',
 'REPRESENTATION_DIMENSIONS_ARE_ATLAS_RESOLUTION_NOT_PHYSICAL_DIMENSIONS',
 'R125_REMAINS_THE_CANONSTATE_ADMISSION_AUTHORITY'
]);

type FusionProvenanceR151='SOURCE_EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS'|'CATALOG_LENS'|'CANON_AUTHORITY_LENS';
export type FusionOperatorR151='CARRY'|'CONSTRUCT'|'PRUNE'|'TURN'|'ESCALATE';
export type FusionChannelR151={id:string;name:string;score:number;weight:number;provenance:FusionProvenanceR151;gate:string;group:string;basis:string};

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const mean=(...xs:number[])=>xs.reduce((a,b)=>a+cl(b),0)/Math.max(1,xs.length);
const normalizedName=(s:any)=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
const stateWeight:Record<FusionProvenanceR151,number>={
 SOURCE_EXECUTED_EXACT:1,
 SOURCE_PACKET:.95,
 DERIVED_RUNTIME:.84,
 GATED_MISSING_INPUTS:0,
 CATALOG_LENS:.26,
 CANON_AUTHORITY_LENS:.34
};
function mappedProvenance(state:SourceBackedModeState|undefined):FusionProvenanceR151{
 if(state==='EXECUTED_EXACT')return'SOURCE_EXECUTED_EXACT';
 if(state==='SOURCE_PACKET')return'SOURCE_PACKET';
 if(state==='DERIVED_RUNTIME')return'DERIVED_RUNTIME';
 if(state==='GATED_MISSING_INPUTS')return'GATED_MISSING_INPUTS';
 return'CATALOG_LENS';
}
function weightedMean(rows:FusionChannelR151[]){let n=0,d=0;for(const r of rows){if(r.weight<=0)continue;n+=r.score*r.weight;d+=r.weight}return d?cl(n/d):0}
function weightedStd(rows:FusionChannelR151[],center=weightedMean(rows)){let n=0,d=0;for(const r of rows){if(r.weight<=0)continue;const dx=r.score-center;n+=r.weight*dx*dx;d+=r.weight}return d?Math.sqrt(n/d):0}
function activation(rows:ReturnType<typeof evaluateCanonAuthorityStack>,re:RegExp,fallback=.5){const hits=rows.filter(x=>re.test(x.name));return hits.length?mean(...hits.map(x=>x.activation)):fallback}
function fnv1a32(text:string){let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')}
function canonicalProjection(record:any):FusionOperatorR151{const d=String(record?.metrics?.decision||'').toUpperCase(),m=String(record?.metrics?.mode188||'').toUpperCase();if(m==='PRUNE')return'PRUNE';if(d==='TURN')return'TURN';if(d==='ESCALATE')return'ESCALATE';if(d==='STAY')return'CONSTRUCT';return'CARRY'}
function topBy<T>(rows:T[],score:(x:T)=>number,n=8){return[...rows].sort((a,b)=>score(b)-score(a)).slice(0,n)}

export function compileAllModesTruthFusionR151(record:any){
 const catalog=evaluateCorpusModes(record),source=sourceBackedModeSummary(record),canon=evaluateCanonAuthorityStack(record),byName=new Map(source.rows.map(x=>[normalizedName(x.name),x]));
 const sourceChannels:FusionChannelR151[]=catalog.results.map((x:any)=>{
  const backed=byName.get(normalizedName(x.name)),provenance=mappedProvenance(backed?.state),weight=stateWeight[provenance];
  return{id:`SRC:${String(x.id)}`,name:String(x.name),score:cl(x.score),weight,provenance,gate:String(x.gate||'UNKNOWN'),group:String(x.category||'SOURCE'),basis:backed?`${backed.formula} · ${backed.source}`:String(x.calculus||x.algebra||x.updateRule||x.purpose||'catalog semantic lens')};
 });
 const canonChannels:FusionChannelR151[]=canon.map(x=>({id:`CANON:${x.id}`,name:x.name,score:cl(x.activation),weight:stateWeight.CANON_AUTHORITY_LENS,provenance:'CANON_AUTHORITY_LENS',gate:x.state,group:x.group,basis:x.basis}));
 const channels=[...sourceChannels,...canonChannels],trusted=channels.filter(x=>x.provenance==='SOURCE_EXECUTED_EXACT'||x.provenance==='SOURCE_PACKET'||x.provenance==='DERIVED_RUNTIME'),catalogOnly=channels.filter(x=>x.provenance==='CATALOG_LENS'),canonOnly=channels.filter(x=>x.provenance==='CANON_AUTHORITY_LENS');
 const trustedConsensus=weightedMean(trusted),catalogConsensus=weightedMean(catalogOnly),canonConsensus=weightedMean(canonOnly),fusionConsensus=cl(.62*trustedConsensus+.20*catalogConsensus+.18*canonConsensus),dispersion=weightedStd(channels,fusionConsensus),agreement=cl(1-2*dispersion);
 const m=record?.metrics||{},C=cl(m.continuity),Phi=cl(m.plasticity),q=cl(m.contradiction),Lambda=cl(m.burden),scar=cl(m.scar),evidence=cl(m.evidence),stayShare=catalog.stay/Math.max(1,catalog.count),turnShare=catalog.turn/Math.max(1,catalog.count),escalateShare=catalog.escalate/Math.max(1,catalog.count),missingRatio=source.gatedCount/Math.max(1,source.rows.length);
 const truthLens=activation(canon,/truth|proof|evidence|reality admission|high father/i,evidence),pruneLens=activation(canon,/prune|false normality|scar|burden|fate-lock/i,mean(q,Lambda,scar)),guidanceLens=activation(canon,/guidance|forecast|future|plasticity|phase elasticity/i,Phi),continuityLens=activation(canon,/continuity|mother|sphere|woven/i,C);
 const truthConfidence=cl(evidence*(.45+.55*agreement)*(.45+.55*trustedConsensus)),unresolved=1-truthConfidence;
 const operatorPressure:Record<FusionOperatorR151,number>={
  CARRY:mean(C,Phi,evidence,agreement,continuityLens),
  CONSTRUCT:mean(stayShare,fusionConsensus,trustedConsensus,agreement,Phi,truthLens),
  PRUNE:mean(q,Lambda,scar,pruneLens,1-evidence),
  TURN:mean(turnShare,dispersion,Phi,guidanceLens,unresolved),
  ESCALATE:mean(escalateShare,q,Lambda,missingRatio,unresolved)
 };
 const advisoryOperator=(Object.entries(operatorPressure) as [FusionOperatorR151,number][]).sort((a,b)=>b[1]-a[1])[0][0],canonicalOperator=canonicalProjection(record),outliers=topBy(channels.filter(x=>x.weight>0),x=>Math.abs(x.score-fusionConsensus)*x.weight,10).map(x=>({id:x.id,name:x.name,provenance:x.provenance,score:x.score,deviation:Number(Math.abs(x.score-fusionConsensus).toFixed(6))})),weakestTrusted=[...trusted].sort((a,b)=>a.score-b.score)[0]||null,strongestTrusted=[...trusted].sort((a,b)=>b.score-a.score)[0]||null;
 const truthClass=evidence<.35?'LOW_EVIDENCE':agreement<.55?'HIGH_MODE_DISAGREEMENT':truthConfidence>=.68?'STRONG_INTERNAL_COHERENCE':'MIXED_INTERNAL_COHERENCE';
 const compact={address:Number(record?.address??-1),stateId:Number(record?.stateId??-1),fusionConsensus,agreement,truthConfidence,truthClass,canonicalOperator,advisoryOperator,operatorPressure,execution:{exact:source.exactCount,packet:source.packetCount,gated:source.gatedCount},gateDistribution:{stay:catalog.stay,turn:catalog.turn,escalate:catalog.escalate},canonStates:{active:canon.filter(x=>x.state==='ACTIVE').length,watch:canon.filter(x=>x.state==='WATCH').length,quiet:canon.filter(x=>x.state==='QUIET').length}};
 return{
  schema:R151_SCHEMA,laws:R151_LAWS,address:compact.address,stateId:compact.stateId,channelCount:channels.length,sourceModeCount:catalog.count,canonAuthorityCount:canon.length,modeStateEvaluationCount:channels.length,
  channels,provenance:{trustedSourceChannels:trusted.length,catalogLensChannels:catalogOnly.length,canonLensChannels:canonOnly.length,gatedSourceBacked:source.gatedCount},
  consensus:{trusted:trustedConsensus,catalog:catalogConsensus,canon:canonConsensus,fused:fusionConsensus,dispersion,agreement,truthConfidence,truthClass},
  gateDistribution:compact.gateDistribution,canonStates:compact.canonStates,
  operator:{canonical:canonicalOperator,advisory:advisoryOperator,agreement:canonicalOperator===advisoryOperator,pressure:operatorPressure,authority:'ADVISORY_ONLY_CANONICAL_DISPATCH_UNCHANGED'},
  weakestTrusted,strongestTrusted,outliers,missingInputPressure:missingRatio,
  fingerprint:fnv1a32(JSON.stringify(compact)),canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R151 fuses 179 source-mode evaluations and 62 higher-order canon/calculus lenses over one canonical packet with provenance weights. Correlated mode agreement is internal coherence, not 241 independent empirical replications. Gated modes add missing-input pressure but zero executed-truth weight. The advisory operator never overrides canonical source dispatch, R142 execution proof, R144 deployment attestation, physical measurement, or R125 CanonState admission.'
 };
}

const fusionCache=new Map<number,ReturnType<typeof compileAllModesTruthFusionR151>>();
export function allModesTruthFusionAtAddressR151(address:number){const a=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(address)||0))),hit=fusionCache.get(a);if(hit)return hit;const result=compileAllModesTruthFusionR151(corpusState(a));if(fusionCache.size>=2048){const first=fusionCache.keys().next();if(!first.done)fusionCache.delete(first.value)}fusionCache.set(a,result);return result}

export function scanCanonicalModeAtlasR151(options:{stride?:number;topK?:number}={}){
 const stride=Math.max(1,Math.min(STATE_COUNT,Math.floor(Number(options.stride)||1))),topK=Math.max(1,Math.min(64,Math.floor(Number(options.topK)||16))),domains=Array.from({length:12},(_,i)=>({domain:i+1,count:0,truth:0,agreement:0,disagreement:0,lowEvidence:0})),phases=Array.from({length:144},(_,i)=>({domain:Math.floor(i/12)+1,phase:i%12+1,count:0,truth:0,agreement:0})),best:any[]=[],risks:any[]=[];let sampled=0,truth=0,agreement=0;
 const pushTop=(arr:any[],row:any,key:string,descending=true)=>{arr.push(row);arr.sort((a,b)=>descending?b[key]-a[key]:a[key]-b[key]);if(arr.length>topK)arr.length=topK};
 for(let address=0;address<STATE_COUNT;address+=stride){const record=corpusState(address),f=compileAllModesTruthFusionR151(record),d=record.coordinates.d,p=record.coordinates.p,phaseIndex=d*12+p,c=f.consensus;sampled++;truth+=c.truthConfidence;agreement+=c.agreement;domains[d].count++;domains[d].truth+=c.truthConfidence;domains[d].agreement+=c.agreement;domains[d].disagreement+=c.dispersion;if(c.truthClass==='LOW_EVIDENCE')domains[d].lowEvidence++;phases[phaseIndex].count++;phases[phaseIndex].truth+=c.truthConfidence;phases[phaseIndex].agreement+=c.agreement;pushTop(best,{address,stateId:record.stateId,truth:c.truthConfidence,agreement:c.agreement,operator:f.operator.advisory},'truth',true);pushTop(risks,{address,stateId:record.stateId,risk:cl(c.dispersion+(1-c.truthConfidence)),dispersion:c.dispersion,truth:c.truthConfidence,operator:f.operator.advisory},'risk',true)}
 const normDomain=domains.map(x=>({...x,truth:x.count?x.truth/x.count:0,agreement:x.count?x.agreement/x.count:0,disagreement:x.count?x.disagreement/x.count:0})),normPhases=phases.map(x=>({...x,truth:x.count?x.truth/x.count:0,agreement:x.count?x.agreement/x.count:0}));
 return{schema:'OMEGA_ALL_MODES_ATLAS_SCAN_R151',stateCount:STATE_COUNT,sampledStates:sampled,stride,channelsPerState:R151_CHANNEL_COUNT,modeStateEvaluations:sampled*R151_CHANNEL_COUNT,fullAtlasModeStateEvaluations:STATE_COUNT*R151_CHANNEL_COUNT,meanTruthConfidence:sampled?truth/sampled:0,meanAgreement:sampled?agreement/sampled:0,domains:normDomain,domainPhases:normPhases,strongestStates:best,highestResidualStates:risks,canonicalMutation:false,boundary:'A full stride=1 scan evaluates all 20,736 canonical states across the 241 provenance-separated mode/lens channels (4,997,376 mode-state readings). This is an internal computational census, not 4,997,376 independent observations of physical reality.'};
}
