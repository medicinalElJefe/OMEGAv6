import {runtimeStorageR168} from '../execution/runtimeStorageR168.js';

export const R181_REVISION='R181';
export const R181_SCHEMA='OMEGA_CONTINUOUS_CALIBRATION_FUSION_R181';
export const R181_PACKET_SCHEMA='OMEGA_CALIBRATION_EVIDENCE_PACKET_R181';
export const R181_STATE_SCHEMA='OMEGA_CALIBRATION_STATE_R181';
export const R181_LAWS=Object.freeze([
 'NEW_CALIBRATION_EVIDENCE_MAY_UPDATE_ESTIMATES_NOT_CANONSTATE',
 'OBSERVATION_INTERPRETATION_HYPOTHESIS_PERMISSION_EXECUTION_AND_VERIFICATION_REMAIN_DISTINCT',
 'SOURCE_PROVENANCE_CONFIDENCE_UNCERTAINTY_AND_TIMESTAMP_ARE_REQUIRED_FOR_ADMISSION',
 'MEASURED_AND_DOCUMENT_BACKED_EVIDENCE_OUTWEIGH_DERIVED_OR_MODEL_INFERRED_PRIORS',
 'NO_SINGLE_PACKET_MAY_SILENTLY_REPLACE_A_CALIBRATION_BASELINE',
 'WEIGHTED_FUSION_PRESERVES_RESIDUAL_VARIANCE_AND_EFFECTIVE_SAMPLE_WEIGHT',
 'MODE188_MAY_BE_DERIVED_WHEN_CONTINUITY_BURDEN_AND_CONTRADICTION_ARE_PRESENT_BUT_THRESHOLDS_ARE_NOT_INVENTED',
 'FOLD_SCALE_RELATIVITY_AND_CONTINUITY_WORKBOOK_RULES_ARE_REFERENCE_PRIORS_UNTIL_INDEPENDENTLY_RECALIBRATED',
 'CALIBRATION_STATE_CAN_INFORM_PLANNING_SCREENING_AND_NEXT_EXPERIMENTS_BUT_NOT_R147_DISPATCH',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

export const R181_REFERENCE_SOURCES=Object.freeze([
 {id:'gdrive:1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO',title:'Fold_Scale_Relativity_Calibration_Test_Harness_v1.xlsx',class:'CALIBRATION_HARNESS',role:'Defines variables, units, validity status, benchmark records and source-defined dispatch thresholds.',automaticLiveRead:false},
 {id:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',title:'universal_continuity_engine_v2_executable.xlsx',class:'CONTINUITY_REFERENCE',role:'Provides seed-test continuity thresholds, overlap weights, scar-carry weight and explicit caution against universal-proof inflation.',automaticLiveRead:false},
 {id:'gdrive:14bSQA2C24rXXgtE9hLrvYWiMO-s_46cT',title:'Dewey_Calculus_20736D_Trigonometry_Water_Geometry_Atlas(1).xlsx',class:'DEWEY_WATER_GEOMETRY_ATLAS',role:'Reference atlas for Dewey/water-geometry and trigonometric state-space calibration.',automaticLiveRead:false},
 {id:'gdrive:1QD_PtlygX94eRWsASOgd53y9WVDtqT0J',title:'water_geometry_dewey_mode188_20736D_state_space(3).xlsx',class:'MODE188_STATE_SPACE',role:'Reference state-space for water geometry, Mode188 and 20,736-address calibration.',automaticLiveRead:false},
 {id:'gdrive:13mBVKN6Vl7rSFnCRQ7h0c4ZRobtaHgep',title:'20736D_Motion_Relativity_Force_Atlas(3).xlsx',class:'MOTION_RELATIVITY_ATLAS',role:'Reference motion/relativity/force atlas for address-resolved calibration.',automaticLiveRead:false},
 {id:'gdrive:1qJSfvB0DXfsjThAc01pDdMp3c1GW-QaTUH5AOeO6lK0',title:'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS',class:'GOVERNED_INTELLIGENCE_ARCHITECTURE',role:'Typed provenance/confidence/authority and observation-to-action separation requirements.',automaticLiveRead:false}
]);

const BASELINE=Object.freeze({
 revision:'DRIVE_REFERENCE_PRIORS_2026_09',
 priors:{
  continuityThreshold:{value:.7,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  watchThreshold:{value:.5,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  pingThreshold:{value:.75,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  epsilon:{value:.01,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  edgeOverlapWeight:{value:.35,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  roleOverlapWeight:{value:.25,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  motifOverlapWeight:{value:.2,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  scarCarryWeight:{value:.2,sourceId:'gdrive:13Y5RhpdpHUi0ghx52vXVJ_BQGgBvnJ-W',status:'REFERENCE_PRIOR'},
  sourceDefinedTurnLower:{value:.85,sourceId:'gdrive:1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO',status:'SOURCE_DEFINED_REFERENCE_RULE'},
  sourceDefinedStayLowerExclusive:{value:1,sourceId:'gdrive:1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO',status:'SOURCE_DEFINED_REFERENCE_RULE'}
 },
 truthBoundary:'These values are imported reference priors from existing calibration workbooks, not immutable physical constants and not independent experimental validation.'
});

const EVIDENCE_WEIGHT=Object.freeze({MEASURED:1,DOCUMENT_BACKED:.9,BENCHMARKED:.85,INDEPENDENT_REPLICATION:.95,DERIVED:.65,SIMULATED:.55,USER_REPORTED:.4,MODEL_INFERRED:.2,REFERENCE_PRIOR:.25});
const INDEX='calibration:r181:index';const STATE='calibration:r181:state';const packetKey=id=>`calibration:r181:packet:${id}`;
const txt=(v,n=500)=>String(v??'').trim().slice(0,n);const id=v=>{const s=txt(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:''};
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v).sort())out[k]=stable(v[k]);return out}return v};
const sha=async value=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const finiteObject=input=>{const out={};for(const[k,v]of Object.entries(input&&typeof input==='object'?input:{})){const n=Number(v);if(Number.isFinite(n))out[txt(k,80)]=n}return out};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

function mode188(metrics){const continuity=Number(metrics.continuity??metrics.COmega??metrics['CΩ']),burden=Number(metrics.burden??metrics.Lambda??metrics['Λ']),contradiction=Number(metrics.contradiction??metrics.q);if(![continuity,burden,contradiction].every(Number.isFinite))return{applicable:false,formula:'S188=CΩ/(Λ+q+0.35Λq+0.05)',reason:'SOURCE_METRICS_INCOMPLETE'};const denominator=burden+contradiction+.35*burden*contradiction+.05;return{applicable:denominator>0,formula:'S188=CΩ/(Λ+q+0.35Λq+0.05)',inputs:{continuity,burden,contradiction},denominator,score:denominator>0?continuity/denominator:null,thresholdBoundary:'No STAY/TURN/ESCALATE threshold is inferred from S188 unless a separately admitted calibration source defines one.'}}
function omegaReference(metrics){const energy=Number(metrics.energy??metrics.E),burden=Number(metrics.burden??metrics.Lambda??metrics['Λ']),contradiction=Number(metrics.contradiction??metrics.q);if(![energy,burden,contradiction].every(Number.isFinite))return{applicable:false,formula:'Ω=E/(1+Λ+|q|)'};const value=energy/(1+burden+Math.abs(contradiction));return{applicable:true,formula:'Ω=E/(1+Λ+|q|)',value,sourceRule:{stay:value>1,turn:value>=.85&&value<=1,escalate:value<.85},sourceId:'gdrive:1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO',boundary:'Classification thresholds are source-defined calibration-harness rules, not universal physical laws.'}}

function normalizePacket(input={}){const source=input.source&&typeof input.source==='object'?input.source:{},evidenceClass=txt(input.evidenceClass,40).toUpperCase();const baseWeight=EVIDENCE_WEIGHT[evidenceClass]??0;const confidence=clamp(Number.isFinite(Number(input.confidence))?Number(input.confidence):1,0,1),uncertainty=clamp(Number.isFinite(Number(input.uncertainty))?Number(input.uncertainty):0,0,1),quality=clamp(Number.isFinite(Number(input.quality))?Number(input.quality):1,0,1);const metrics=finiteObject(input.metrics);return{schema:R181_PACKET_SCHEMA,revision:R181_REVISION,packetId:id(input.packetId)||`cal_${crypto.randomUUID().replaceAll('-','')}`,source:{id:id(source.id)||txt(source.id,160),title:txt(source.title,240),revision:txt(source.revision,120)||null,uri:txt(source.uri,500)||null,authority:txt(source.authority,120)||'EXTERNAL_EVIDENCE'},evidenceClass,observedAt:Number.isFinite(Number(input.observedAt))?Number(input.observedAt):Date.now(),ingestedAt:Date.now(),domain:txt(input.domain,80).toUpperCase()||'GENERAL',address:input.address&&typeof input.address==='object'?stable(input.address):null,metrics,confidence,uncertainty,quality,effectiveWeight:baseWeight*confidence*quality*(1-.75*uncertainty),proofRefs:Array.isArray(input.proofRefs)?input.proofRefs.map(x=>txt(x,500)).filter(Boolean).slice(0,32):[],notes:txt(input.notes,1200)||null,derived:{mode188:mode188(metrics),omegaReference:omegaReference(metrics)},canonicalMutation:false,canonicalAdmissionAuthority:'R125'};}
function validPacket(packet){if(!packet.source.id)return'CALIBRATION_SOURCE_ID_REQUIRED';if(!Object.prototype.hasOwnProperty.call(EVIDENCE_WEIGHT,packet.evidenceClass))return'CALIBRATION_EVIDENCE_CLASS_INVALID';if(!Object.keys(packet.metrics).length)return'CALIBRATION_METRICS_REQUIRED';if(packet.effectiveWeight<=0)return'CALIBRATION_EFFECTIVE_WEIGHT_ZERO';if(['MEASURED','DOCUMENT_BACKED','BENCHMARKED','INDEPENDENT_REPLICATION'].includes(packet.evidenceClass)&&!packet.proofRefs.length)return'CALIBRATION_PROOF_REFERENCE_REQUIRED';return null}

function fuse(packets){const buckets=new Map();for(const packet of packets){for(const[name,value]of Object.entries(packet.metrics)){if(!Number.isFinite(value))continue;const rows=buckets.get(name)||[];rows.push({value,weight:packet.effectiveWeight,packetId:packet.packetId,evidenceClass:packet.evidenceClass,observedAt:packet.observedAt});buckets.set(name,rows)}}const metrics={};for(const[name,rows]of buckets){const weight=rows.reduce((s,r)=>s+r.weight,0);if(weight<=0)continue;const mean=rows.reduce((s,r)=>s+r.value*r.weight,0)/weight,variance=rows.reduce((s,r)=>s+r.weight*(r.value-mean)**2,0)/weight;metrics[name]={value:mean,weightedVariance:variance,weightedStdDev:Math.sqrt(variance),effectiveWeight:weight,sampleCount:rows.length,min:Math.min(...rows.map(r=>r.value)),max:Math.max(...rows.map(r=>r.value)),latestObservedAt:Math.max(...rows.map(r=>r.observedAt)),sourcePacketIds:rows.map(r=>r.packetId).slice(-64)}}return metrics}
function residualSummary(metrics){const rows=Object.entries(metrics).map(([name,m])=>({name,relativeUncertainty:Math.abs(m.value)>1e-12?m.weightedStdDev/Math.abs(m.value):m.weightedStdDev,effectiveWeight:m.effectiveWeight,sampleCount:m.sampleCount})).sort((a,b)=>b.relativeUncertainty-a.relativeUncertainty);return{weakestFirst:rows.slice(0,24),metricCount:rows.length,highUncertaintyCount:rows.filter(x=>x.relativeUncertainty>.25).length}}

async function rebuildState(runtime,packets){const fused=fuse(packets),residual=residualSummary(fused),core={schema:R181_STATE_SCHEMA,revision:R181_REVISION,updatedAt:Date.now(),packetCount:packets.length,sourceCount:new Set(packets.map(x=>x.source.id)).size,domains:[...new Set(packets.map(x=>x.domain))].sort(),fusedMetrics:fused,residual,referenceBaseline:BASELINE,referenceSources:R181_REFERENCE_SOURCES,planningHints:{weakestMetrics:residual.weakestFirst.slice(0,12),rule:'Prioritize new measurements where weighted relative uncertainty is highest, then recompute before widening execution scope.'},executionBoundary:{dispatchAuthorized:false,executionInvoked:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125'},truthBoundary:'R181 calibration state is an evidence-weighted estimate layer. It may tune screening, planning, forecast confidence and experiment priority; it does not itself prove physical truth, authorize R147 dispatch or mutate CanonState.'},fingerprint=await sha(core),state={...core,fingerprint};await runtimeStorageR168(runtime).put(STATE,state);return state}

export function manifestR181(){return{ok:true,schema:R181_SCHEMA,revision:R181_REVISION,laws:R181_LAWS,packetSchema:R181_PACKET_SCHEMA,stateSchema:R181_STATE_SCHEMA,evidenceWeights:EVIDENCE_WEIGHT,referenceSources:R181_REFERENCE_SOURCES,referenceBaseline:BASELINE,durableStorage:'R168 SAME OMEGA_RUNTIME',automaticDrivePolling:false,continuousIngestion:true,recomputeOnIngest:true,planningIntegration:'EVIDENCE_WEIGHTED_HINTS_ONLY',dispatchAuthorized:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Connected Drive files supplied the current reference priors and provenance inventory, but the production Worker has no implicit Google Drive authority. New evidence enters only through explicit authenticated calibration packets or separately admitted connectors.'}}
export async function ingestCalibrationR181(runtime,input={}){const packet=normalizePacket(input),error=validPacket(packet);if(error)return{ok:false,status:400,code:error,packet:null};const storage=runtimeStorageR168(runtime),existing=await storage.get(packetKey(packet.packetId));if(existing)return{ok:false,status:409,code:'R181_CALIBRATION_PACKET_EXISTS',packet:existing};packet.packetSha256=await sha(packet);await storage.put(packetKey(packet.packetId),packet);const ids=await storage.get(INDEX)||[];await storage.put(INDEX,[packet.packetId,...ids.filter(x=>x!==packet.packetId)].slice(0,4096));const packets=await listCalibrationPacketsR181(runtime,4096),state=await rebuildState(runtime,packets);return{ok:true,status:201,packet,state,receipt:{schema:'OMEGA_CALIBRATION_INGEST_RECEIPT_R181',packetId:packet.packetId,packetSha256:packet.packetSha256,stateFingerprint:state.fingerprint,canonicalMutation:false,canonicalAdmissionAuthority:'R125'}}}
export async function listCalibrationPacketsR181(runtime,limit=256){const storage=runtimeStorageR168(runtime),ids=await storage.get(INDEX)||[],packets=[];for(const packetId of ids.slice(0,Math.min(4096,Math.max(1,Number(limit)||256)))){const packet=await storage.get(packetKey(packetId));if(packet)packets.push(packet)}return packets}
export async function readCalibrationStateR181(runtime){const storage=runtimeStorageR168(runtime),existing=await storage.get(STATE);if(existing)return existing;return rebuildState(runtime,await listCalibrationPacketsR181(runtime,4096))}
export async function recomputeCalibrationR181(runtime){return rebuildState(runtime,await listCalibrationPacketsR181(runtime,4096))}
export async function calibrationPacketR181(runtime,packetId){packetId=id(packetId);return packetId?await runtimeStorageR168(runtime).get(packetKey(packetId))||null:null}
