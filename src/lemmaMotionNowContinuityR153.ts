import {corpusState,decodeAddress,encodeAddress,STATE_COUNT} from './corpusRuntime';
import {unifiedFromRecord} from './unifiedCalculus';
import {ATLAS_RESOLUTION_LEVELS_R101,deriveWeaveStateR100,WOVEN_CONTINUITY_OPERATOR_R100} from './weaveStateR100';
import {allModesTruthFusionAtAddressR151,scanCanonicalModeAtlasR151} from './allModesTruthFusionR151';
import {compileUniversalTruthEnvelopeR152,type UniversalTruthInputR152} from './universalTruthEnvelopeR152';

export const R153_SCHEMA='OMEGA_LEMMA_MOTION_NOW_CONTINUITY_R153' as const;
export const R153_LAWS=Object.freeze([
  'TIME_BEFORE_INTERPRETATION',
  'NO_NOW_STATE_WITHOUT_TIME_FRAME_AND_LINEAGE',
  'SAME_WALL_CLOCK_TIME_DOES_NOT_IMPLY_SAME_CAUSAL_STATE',
  'CANONICAL_ADDRESS_AND_TIME_BOUND_PROJECTION_ADDRESS_ARE_DISTINCT',
  'MOTION_CONTINUES_FROM_PERSISTED_ANCHOR_INSTEAD_OF_RESETTING_ON_RENDER_START',
  'LEMMA_EXCHANGE_FOLLOWS_WOVEN_CONTINUITY_ORDER',
  'INVARIANT_IDENTITY_SURVIVES_FRAME_AND_VIEW_TRANSFORM',
  'SCAR_UNCERTAINTY_AND_CONTRADICTION_SURVIVE_RECONTEXTUALIZATION',
  'VIEW_PROMOTION_ALLOCATES_REPRESENTATION_NOT_TRUTH',
  'ACCURACY_PROMOTION_ALLOCATES_PROOF_COMPUTE_NOT_CANON_ADMISSION',
  'COMPOUNDED_ATLAS_COHERENCE_IS_INTERNAL_COHERENCE_NOT_EMPIRICAL_REPLICATION',
  'SELF_MODEL_IS_RUNTIME_LINEAGE_AND_CAPABILITY_DESCRIPTION_NOT_SENTIENCE',
  'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

export type R153Clock={
  utcTime:string;
  sourceObservationTime:string;
  monotonicMs:number;
  missionTick:number;
  stateGeneration:number;
  agentTurn:number;
  modelGeneration:number;
  causalDepth:number;
  parentReceiptHash?:string;
  anchorUtcTime?:string;
  anchorMonotonicMs?:number;
};
export type R153Frame={
  serviceIdentity:string;
  serviceRole:string;
  runtimeRevision:string;
  canonicalSchemaVersion:string;
  hostIdentity:string;
  observerFrame:string;
  orientation:-1|0|1;
};
export type R153SelfDescriptor={
  buildId?:string;
  generation?:number;
  parentLoopFingerprint?:string;
  changeSet?:string[];
  proofRefs?:string[];
};
export type R153Input={
  address:number;
  previousAddress?:number;
  time:R153Clock;
  frame:R153Frame;
  previousFrame?:R153Frame;
  truth?:Omit<UniversalTruthInputR152,'address'>;
  observerRelevance?:number;
  timeScale?:number;
  driftToleranceMs?:number;
  observationLagToleranceMs?:number;
  deepAtlas?:boolean;
  self?:R153SelfDescriptor;
};

type ScaleCoherence={level:12|144|1728|20736;count:number;meanTruth:number;meanAgreement:number;meanDispersion:number;coherence:number;exact:boolean};
type LemmaOperator='PARTITION'|'EXCHANGE_TRANSFORM'|'INVARIANT_CARRY'|'SCAR_RESIDUAL_CARRY'|'RECONTEXTUALIZE'|'REPARTITION'|'PROJECTION_PROMOTION'|'ACCURACY_PROMOTION';
type LemmaExchange={index:number;operator:LemmaOperator;applied:boolean;reason:string;canonicalAddress:number;projectionAddress:number;utcTime:string;frame:string;orientation:-1|0|1;inputFingerprint:string;outputFingerprint:string;authority:string};

const TAU=Math.PI*2;
const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const gm=(xs:number[])=>Math.pow(xs.reduce((a,b)=>a*Math.max(1e-9,cl(b)),1),1/Math.max(1,xs.length));
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const wrap=(x:number,m:number)=>((x%m)+m)%m;
const finiteTime=(s:string)=>Number.isFinite(Date.parse(s));
const fnv1a32=(text:string)=>{let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')};
const resolutionFromScore=(score:number)=>(score<.24?12:score<.42?144:score<.60?1728:score<.78?20736:248832) as (typeof ATLAS_RESOLUTION_LEVELS_R101)[number];
const lanesFromScore=(score:number)=>score<.20?1:score<.38?12:score<.58?144:score<.78?1728:20736;

function validateTime(time:R153Clock){
  const errors:string[]=[];
  if(!finiteTime(time.utcTime))errors.push('UTC_TIME_REQUIRED');
  if(!finiteTime(time.sourceObservationTime))errors.push('SOURCE_OBSERVATION_TIME_REQUIRED');
  if(!Number.isFinite(time.monotonicMs)||time.monotonicMs<0)errors.push('MONOTONIC_TIME_REQUIRED');
  for(const k of ['missionTick','stateGeneration','agentTurn','modelGeneration','causalDepth'] as const){
    if(!Number.isInteger(time[k])||time[k]<0)errors.push(`${k.toUpperCase()}_REQUIRED`);
  }
  if(time.causalDepth>0&&!String(time.parentReceiptHash||'').trim())errors.push('PARENT_RECEIPT_REQUIRED_FOR_DESCENDANT');
  if(time.anchorUtcTime&&!finiteTime(time.anchorUtcTime))errors.push('ANCHOR_UTC_TIME_INVALID');
  if(time.anchorMonotonicMs!=null&&(!Number.isFinite(time.anchorMonotonicMs)||time.anchorMonotonicMs<0))errors.push('ANCHOR_MONOTONIC_INVALID');
  return errors;
}
function validateFrame(frame:R153Frame){
  const errors:string[]=[];
  for(const k of ['serviceIdentity','serviceRole','runtimeRevision','canonicalSchemaVersion','hostIdentity','observerFrame'] as const){
    if(!String(frame[k]||'').trim())errors.push(`FRAME_${k.toUpperCase()}_REQUIRED`);
  }
  if(![-1,0,1].includes(frame.orientation))errors.push('FRAME_ORIENTATION_REQUIRED');
  return errors;
}

function temporalBinding(time:R153Clock,driftToleranceMs:number,observationLagToleranceMs:number){
  const errors=validateTime(time);
  const utcMs=finiteTime(time.utcTime)?Date.parse(time.utcTime):NaN;
  const sourceMs=finiteTime(time.sourceObservationTime)?Date.parse(time.sourceObservationTime):NaN;
  const anchorUtc=time.anchorUtcTime&&finiteTime(time.anchorUtcTime)?Date.parse(time.anchorUtcTime):utcMs;
  const anchorMono=time.anchorMonotonicMs!=null&&Number.isFinite(time.anchorMonotonicMs)?Number(time.anchorMonotonicMs):time.monotonicMs;
  const elapsedWallMs=Number.isFinite(utcMs)&&Number.isFinite(anchorUtc)?utcMs-anchorUtc:0;
  const elapsedMonotonicMs=Number.isFinite(time.monotonicMs)&&Number.isFinite(anchorMono)?time.monotonicMs-anchorMono:0;
  if(time.anchorUtcTime&&elapsedWallMs<0)errors.push('ANCHOR_UTC_AFTER_NOW');
  if(time.anchorMonotonicMs!=null&&elapsedMonotonicMs<0)errors.push('MONOTONIC_BEFORE_ANCHOR');
  if(Number.isFinite(utcMs)&&Number.isFinite(sourceMs)&&sourceMs>utcMs+driftToleranceMs)errors.push('SOURCE_OBSERVATION_AFTER_NOW');
  const driftMs=time.anchorUtcTime&&time.anchorMonotonicMs!=null?Math.abs(elapsedWallMs-elapsedMonotonicMs):null;
  const observationLagMs=Number.isFinite(utcMs)&&Number.isFinite(sourceMs)?Math.max(0,utcMs-sourceMs):Infinity;
  const lineageScore=time.causalDepth===0||String(time.parentReceiptHash||'').trim()?1:0;
  const driftScore=driftMs==null?0.75:Math.exp(-driftMs/Math.max(1,driftToleranceMs));
  const freshnessScore=Number.isFinite(observationLagMs)?Math.exp(-observationLagMs/Math.max(1,observationLagToleranceMs)):0;
  const accuracy=errors.length?0:gm([lineageScore,driftScore,freshnessScore]);
  const d=new Date(Number.isFinite(utcMs)?utcMs:0);
  const seconds=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds()+d.getUTCMilliseconds()/1000;
  const dayFraction=wrap(seconds,86400)/86400;
  const phase12=Math.min(11,Math.floor(dayFraction*12));
  const progress12=dayFraction*12-phase12;
  const sector7=Math.min(6,Math.floor(dayFraction*7))+1;
  const progress7=dayFraction*7-(sector7-1);
  return{valid:errors.length===0,errors,utcMs,sourceMs,elapsedWallMs,elapsedMonotonicMs,elapsedSeconds:elapsedWallMs/1000,driftMs,observationLagMs,driftToleranceMs,observationLagToleranceMs,accuracy,driftScore,freshnessScore,lineageScore,dayFraction,phase12,progress12,sector7,progress7};
}

const scaleCache=new Map<string,ScaleCoherence>();
let fullScaleCache:ScaleCoherence|null=null;
function addressesForScale(address:number,level:12|144|1728){
  const c=decodeAddress(address),out:number[]=[];
  if(level===12)for(let l=0;l<12;l++)out.push(encodeAddress(c.d,c.p,c.r,l));
  if(level===144)for(let r=0;r<12;r++)for(let l=0;l<12;l++)out.push(encodeAddress(c.d,c.p,r,l));
  if(level===1728)for(let p=0;p<12;p++)for(let r=0;r<12;r++)for(let l=0;l<12;l++)out.push(encodeAddress(c.d,p,r,l));
  return out;
}
function scaleCoherence(address:number,level:12|144|1728):ScaleCoherence{
  const c=decodeAddress(address);
  const key=level===12?`12:${c.d}:${c.p}:${c.r}`:level===144?`144:${c.d}:${c.p}`:`1728:${c.d}`;
  const hit=scaleCache.get(key);if(hit)return hit;
  const rows=addressesForScale(address,level).map(a=>allModesTruthFusionAtAddressR151(a).consensus);
  const meanTruth=mean(rows.map(x=>x.truthConfidence)),meanAgreement=mean(rows.map(x=>x.agreement)),meanDispersion=mean(rows.map(x=>x.dispersion));
  const result:ScaleCoherence={level,count:rows.length,meanTruth,meanAgreement,meanDispersion,coherence:gm([meanTruth,meanAgreement,1-meanDispersion]),exact:true};
  if(scaleCache.size>256){const first=scaleCache.keys().next();if(!first.done)scaleCache.delete(first.value)}
  scaleCache.set(key,result);return result;
}
function fullScaleCoherence():ScaleCoherence{
  if(fullScaleCache)return fullScaleCache;
  const scan=scanCanonicalModeAtlasR151({stride:1,topK:1});
  const meanDispersion=mean(scan.domains.map(x=>x.disagreement));
  return fullScaleCache={level:20736,count:STATE_COUNT,meanTruth:scan.meanTruthConfidence,meanAgreement:scan.meanAgreement,meanDispersion,coherence:gm([scan.meanTruthConfidence,scan.meanAgreement,1-meanDispersion]),exact:true};
}

function donorLemma(record:any){
  const C=cl(record?.metrics?.continuity),Phi=cl(record?.metrics?.plasticity),scar=cl(record?.metrics?.scar);
  const water=.4*C+.4*Phi+.2*(1-scar);
  const thetaDeg=wrap(C*137.507764+Phi*188+scar*72,360),thetaRad=thetaDeg/180*Math.PI;
  const lemmaRaw=(C*water*(1+Math.cos(thetaRad)))/(1+scar+Math.abs(Math.sin(thetaRad))*.188);
  return{coherence:C,adaptation:Phi,scar,water,thetaDeg,thetaRad,lemmaRaw,lemmaBounded:cl(lemmaRaw),formula:'L=(CΩ·W·(1+cosθ))/(1+Scar+|sinθ|·0.188)',phaseFormula:'θ=(CΩ·137.507764+Φ·188+Scar·72) mod 360',waterFormula:'W=.4CΩ+.4Φ+.2(1−Scar)',authority:'DRIVE_DONOR_PATTERN_MODEL_NOT_PHYSICAL_LAW'};
}
function metricDelta(current:any,previous:any){
  const cm=current?.metrics||{},pm=previous?.metrics||{};
  const fields=['continuity','plasticity','contradiction','burden','scar','evidence'] as const;
  const deltas=Object.fromEntries(fields.map(k=>[k,Number(cm[k]||0)-Number(pm[k]||0)]));
  const magnitude=Math.sqrt(fields.reduce((n,k)=>n+Math.pow(Number(deltas[k])||0,2),0)/fields.length);
  return{fields:deltas,magnitude:cl(magnitude)};
}
function exchange(index:number,operator:LemmaOperator,applied:boolean,reason:string,canonicalAddress:number,projectionAddress:number,time:R153Clock,frame:R153Frame,input:any,output:any):LemmaExchange{
  return{index,operator,applied,reason,canonicalAddress,projectionAddress,utcTime:time.utcTime,frame:frame.observerFrame,orientation:frame.orientation,inputFingerprint:fnv1a32(JSON.stringify(input)),outputFingerprint:fnv1a32(JSON.stringify(output)),authority:'INTERNAL_REPLAYABLE_LEMMA_EXCHANGE_NOT_CANON_MUTATION'};
}

export function compileLemmaMotionNowR153(input:R153Input){
  const address=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(input.address)||0)));
  const previousAddress=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(input.previousAddress??address)||0)));
  const record=corpusState(address),previous=corpusState(previousAddress),coords=decodeAddress(address);
  const baseU=unifiedFromRecord(record),u={...baseU,orientation:input.frame.orientation};
  const time=temporalBinding(input.time,Math.max(1,Number(input.driftToleranceMs??500)),Math.max(1,Number(input.observationLagToleranceMs??5000)));
  const frameErrors=validateFrame(input.frame);
  const truth=compileUniversalTruthEnvelopeR152({address,...(input.truth||{})});
  const elapsedSeconds=time.elapsedSeconds,timeScale=Math.max(0,Number(input.timeScale??1));
  const weave=deriveWeaveStateR100(address,u as any,elapsedSeconds,timeScale),delta=metricDelta(record,previous),donor=donorLemma(record),fusion=allModesTruthFusionAtAddressR151(address);
  const temporalProjectionAddress=encodeAddress(coords.d,(coords.p+time.phase12)%12,coords.r,coords.l);
  const nextCandidate=Number(record?.autoPing?.dataNext),canonicalNext=Number.isFinite(nextCandidate)?Math.max(0,Math.min(STATE_COUNT-1,Math.floor(nextCandidate))):address;
  const motionAlpha=wrap(weave.phase,TAU)/TAU,observerRelevance=cl(input.observerRelevance??.5);
  const motionPressure=gm([cl(Math.abs(u.motionRelativity)),cl(delta.magnitude+.08),cl(weave.continuityFlux),cl(.35+.65*weave.residualCarry)]);
  const residualPressure=cl(Math.max(truth.uncertainty,truth.evidence.contradictionMass,fusion.consensus.dispersion,weave.residualCarry));
  const viewPromotion=cl(.24*weave.resolutionDemand+.22*motionPressure+.16*observerRelevance+.14*residualPressure+.12*time.accuracy+.12*donor.lemmaBounded);
  const accuracyPromotion=cl(.28*truth.uncertainty+.22*truth.evidence.contradictionMass+.18*fusion.consensus.dispersion+.12*(1-time.accuracy)+.10*cl(1-truth.evidence.externalAuthority)+.10*delta.magnitude);
  const viewResolution=resolutionFromScore(viewPromotion),accuracyLanes=lanesFromScore(accuracyPromotion);
  const scale12=scaleCoherence(address,12),scale144=scaleCoherence(address,144),scale1728=scaleCoherence(address,1728),scale20736=input.deepAtlas===true?fullScaleCoherence():null;
  const compoundAtlasCoherence=gm([scale12.coherence,scale144.coherence,scale1728.coherence,...(scale20736?[scale20736.coherence]:[])]);
  const frameChanged=Boolean(input.previousFrame&&(input.previousFrame.observerFrame!==input.frame.observerFrame||input.previousFrame.hostIdentity!==input.frame.hostIdentity||input.previousFrame.orientation!==input.frame.orientation));
  const stateChanged=previousAddress!==address||delta.magnitude>0;
  const nowAddressId=`A${address+1}:T${time.phase12+1}:S${time.sector7}:K${input.time.missionTick}:G${input.time.stateGeneration}:C${input.time.causalDepth}:O${input.frame.orientation}`;

  const start={address,coords,nowAddressId,time:{utcTime:input.time.utcTime,anchorUtcTime:input.time.anchorUtcTime||input.time.utcTime,elapsedSeconds},frame:input.frame.observerFrame,orientation:input.frame.orientation};
  const exchanges:LemmaExchange[]=[];
  exchanges.push(exchange(1,'PARTITION',true,'Resolve exact canonical D/P/R/L address and nested atlas context.',address,address,input.time,input.frame,start,{coords,weave:weave.hierarchy}));
  exchanges.push(exchange(2,'EXCHANGE_TRANSFORM',stateChanged||frameChanged||Math.abs(elapsedSeconds)>0,'Apply frame/time/motion exchange while canonical identity remains separate from projection.',address,temporalProjectionAddress,input.time,input.frame,{previousAddress,frameChanged,elapsedSeconds},{address,temporalProjectionAddress,canonicalNext,motionAlpha}));
  exchanges.push(exchange(3,'INVARIANT_CARRY',true,'Carry canonical state identity, source/evidence boundary, orientation and causal parent lineage.',address,temporalProjectionAddress,input.time,input.frame,{stateId:record.stateId,truth:truth.fingerprint},{stateId:record.stateId,truth:truth.fingerprint,orientation:input.frame.orientation,parentReceiptHash:input.time.parentReceiptHash||null}));
  exchanges.push(exchange(4,'SCAR_RESIDUAL_CARRY',true,'Carry source scar plus R152 uncertainty/contradiction residual instead of resetting history.',address,temporalProjectionAddress,input.time,input.frame,{scar:previous.metrics.scar,prior:input.truth?.scar||null},{scar:record.metrics.scar,uncertainty:truth.scarCarry.uncertainty,contradiction:truth.scarCarry.contradiction,residualPressure}));
  exchanges.push(exchange(5,'RECONTEXTUALIZE',true,'Bind authoritative NOW time, observer frame, orientation and projection-only temporal address.',address,temporalProjectionAddress,input.time,input.frame,{address,time:input.time.sourceObservationTime},{utcTime:input.time.utcTime,nowAddressId,phase12:time.phase12,sector7:time.sector7,projectionAddress:temporalProjectionAddress}));
  exchanges.push(exchange(6,'REPARTITION',viewResolution!==weave.effectiveResolution||accuracyLanes>1,'Repartition compute according to motion/view demand and unresolved accuracy pressure.',address,temporalProjectionAddress,input.time,input.frame,{baseResolution:weave.effectiveResolution},{viewResolution,accuracyLanes}));
  exchanges.push(exchange(7,'PROJECTION_PROMOTION',viewResolution>weave.effectiveResolution,'Promote representation detail only; this never increases truth authority or mutates CanonState.',address,temporalProjectionAddress,input.time,input.frame,{weaveResolution:weave.effectiveResolution,viewPromotion},{viewResolution,projectionOnly:true}));
  exchanges.push(exchange(8,'ACCURACY_PROMOTION',accuracyLanes>1,'Allocate proof/measurement compute where uncertainty, contradiction, drift or residuals require it.',address,temporalProjectionAddress,input.time,input.frame,{accuracyPromotion,weakestEdge:truth.weakestEdge},{accuracyLanes,nextAction:truth.nextAction,canonicalAdmissionAuthority:'R125'}));

  const self=input.self||{},loopPressure=cl(Math.max(viewPromotion,accuracyPromotion,residualPressure));
  const loopFingerprint=fnv1a32(JSON.stringify({schema:R153_SCHEMA,address,nowAddressId,time:input.time.utcTime,truth:truth.fingerprint,exchanges:exchanges.map(x=>x.outputFingerprint),buildId:self.buildId||null,generation:self.generation||0,parent:self.parentLoopFingerprint||null}));
  const developmentLoop={
    stages:[
      {stage:'OBSERVE',state:time.valid&&frameErrors.length===0?'PASS':'BLOCK',reason:time.valid&&frameErrors.length===0?'time/frame/source packet bound':'time or frame incomplete'},
      {stage:'DIFFERENCE',state:stateChanged||frameChanged||residualPressure>.25?'ACTIVE':'QUIET',reason:`state delta ${delta.magnitude.toFixed(6)} · frame ${frameChanged?'changed':'stable'} · residual ${residualPressure.toFixed(6)}`},
      {stage:'PROPOSE',state:loopPressure>.32?'ACTIVE':'QUIET',reason:`loop pressure ${loopPressure.toFixed(6)}`},
      {stage:'SIMULATE',state:'CANDIDATE_ONLY',reason:`view ${viewResolution} · accuracy lanes ${accuracyLanes}`},
      {stage:'PROVE',state:(self.proofRefs?.length||0)>0?'EVIDENCE_ATTACHED':'PROOF_REQUIRED',reason:(self.proofRefs?.length||0)>0?'development proof refs supplied':'candidate cannot self-admit'},
      {stage:'ADMIT',state:'EXTERNAL_R125_ONLY',reason:'self-development never mutates canonical authority directly'},
      {stage:'CARRY_SCAR',state:'ACTIVE',reason:`uncertainty ${truth.scarCarry.uncertainty.toFixed(6)} · contradiction ${truth.scarCarry.contradiction.toFixed(6)}`},
      {stage:'SCHEDULE_NEXT',state:'ACTIVE',reason:`next mission tick ${input.time.missionTick+1} · lane tier ${accuracyLanes}`}
    ],
    recognizedDifference:{stateChanged,frameChanged,metricDelta:delta.magnitude,temporalDriftMs:time.driftMs,residualPressure},
    nextMissionTick:input.time.missionTick+1,requestedAccuracyLanes:accuracyLanes,requestedViewResolution:viewResolution,fingerprint:loopFingerprint
  };
  const evidenceIds=truth.evidence.packets.map((x:any)=>x.id),proofRefs=self.proofRefs||[];
  const lineage=[
    {id:`source:${record.source.version}`,kind:'SOURCE',parents:[],evidenceIds:[],proofRefs:[]},
    {id:`observation:${truth.fingerprint}`,kind:'OBSERVATION',parents:[`source:${record.source.version}`],evidenceIds,proofRefs:[]},
    {id:`lemma:${loopFingerprint}`,kind:'LEMMA_STATE',parents:[`observation:${truth.fingerprint}`],evidenceIds,proofRefs},
    {id:`world:${record.stateId}`,kind:'WORLD_STATE',parents:[`lemma:${loopFingerprint}`],evidenceIds,proofRefs},
    {id:`projection:${temporalProjectionAddress+1}`,kind:'PRIMITIVE',parents:[`world:${record.stateId}`],evidenceIds:[],proofRefs:[]}
  ];

  return{
    schema:R153_SCHEMA,laws:R153_LAWS,valid:time.valid&&frameErrors.length===0,timeErrors:time.errors,frameErrors,
    canonical:{address,stateId:record.stateId,coordinates:coords,nextAddress:canonicalNext,mutation:false,admissionAuthority:'R125'},
    now:{id:nowAddressId,utcTime:input.time.utcTime,sourceObservationTime:input.time.sourceObservationTime,elapsedSinceAnchorSeconds:elapsedSeconds,temporalAccuracy:time.accuracy,observationLagMs:time.observationLagMs,clockDriftMs:time.driftMs,dailyPhase12:time.phase12,phaseProgress12:time.progress12,matterTimeSector7:time.sector7,sectorProgress7:time.progress7,missionTick:input.time.missionTick,stateGeneration:input.time.stateGeneration,causalDepth:input.time.causalDepth,timeScale,anchor:{utcTime:input.time.anchorUtcTime||input.time.utcTime,monotonicMs:input.time.anchorMonotonicMs??input.time.monotonicMs,persistenceKey:`omega-now-anchor:${input.frame.hostIdentity}:${record.source.version}`},boundary:'Daily 12-phase and seven-sector NOW addresses are exact modular time indexes. They are projection/control coordinates, not extra physical dimensions or evidence of a physical matter state.'},
    motion:{previousAddress,canonicalNext,projection:{fromAddress:address,toAddress:canonicalNext,alpha:motionAlpha,temporalProjectionAddress,projectionOnly:true},metricDelta:delta,motionRelativity:u.motionRelativity,motionPressure,weave:{id:weave.weaveId,operator:WOVEN_CONTINUITY_OPERATOR_R100,orientation:weave.orientation,phase:weave.phase,phaseBand:weave.phaseBand,continuityFlux:weave.continuityFlux,invariantCarry:weave.invariantCarry,residualCarry:weave.residualCarry,resolutionDemand:weave.resolutionDemand,effectiveResolution:weave.effectiveResolution}},
    lemma:{donorKernel:donor,exchanges,exchangeCount:exchanges.length,boundary:'The Drive donor lemma equation is preserved exactly as an internal pattern/coherence model and separately bounded for scheduling. It is not promoted to a new physical law without independent held-out validation.'},
    atlasCoherence:{scale12,scale144,scale1728,scale20736,compound:compoundAtlasCoherence,deepBodyIncluded:Boolean(scale20736),boundary:'Scale coherence is calculated from R151 provenance-separated truth/agreement/residuals across exact canonical cohorts. It measures internal multi-scale consistency, not independent empirical replication.'},
    promotion:{view:{score:viewPromotion,resolution:viewResolution,authority:'REPRESENTATION_AND_RESOURCE_ALLOCATION_ONLY'},accuracy:{score:accuracyPromotion,lanes:accuracyLanes,authority:'PROOF_MEASUREMENT_AND_VALIDATION_ALLOCATION_ONLY'},truthUnchanged:truth.truthConfidence,canonicalMutation:false},
    truth,
    selfModel:{schema:R153_SCHEMA,kind:'RUNTIME_SELF_DESCRIPTION_NOT_SENTIENCE',buildId:self.buildId||'UNSPECIFIED',developmentGeneration:Math.max(0,Math.floor(Number(self.generation||0))),parentLoopFingerprint:self.parentLoopFingerprint||null,changeSet:self.changeSet||[],proofRefs,runtimeComponents:['R100_WOVEN_CONTINUITY','R122_COMPUTED_REALITY','R126_CAUSAL_TIME_FRAME_MOTION','R151_ALL_MODES_TRUTH_FUSION','R152_UNIVERSAL_TRUTH_ENVELOPE','R153_LEMMA_MOTION_NOW'],currentAddress:address,currentNowAddress:nowAddressId,currentTruthFingerprint:truth.fingerprint,currentLemmaFingerprint:loopFingerprint,developmentLoop,boundary:'This is machine-readable runtime self-description, dependency/lineage awareness and development-loop state. It is not a claim of consciousness or subjective self-awareness.'},
    lineage,
    fingerprint:fnv1a32(JSON.stringify({address,nowAddressId,time:input.time.utcTime,truth:truth.fingerprint,lemma:loopFingerprint,projection:temporalProjectionAddress,viewResolution,accuracyLanes})),
    truthBoundary:'R153 binds exact canonical address, authoritative time, causal lineage, motion-relative projection, lemma exchange, scar carry, multi-scale internal coherence and development-loop metadata into one replayable NOW packet. Motion/view promotion never manufactures truth; time-sector mappings are control/projection indexes unless host-bound; external measurements, execution proof and R125 admission remain authoritative.'
  };
}

export function compileDeepLemmaMotionNowR153(input:R153Input){return compileLemmaMotionNowR153({...input,deepAtlas:true})}
