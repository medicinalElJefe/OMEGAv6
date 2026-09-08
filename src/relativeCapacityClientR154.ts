import {api,localState} from './platformAdapter';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {compileRelativeCapacityFabricR154} from './relativeCapacityFabricR154';
import type {R153Frame,R153Input} from './lemmaMotionNowContinuityR153';

export const R154_ANCHOR_KEY='omega.r154.relative-now-anchor.v1';
export type RuntimeNowR154={schema:'OMEGA_RUNTIME_NOW_R154';utcTime:string;runtimeVersionId:string|null;authority:'CLOUDFLARE_RUNTIME_CLOCK';canonicalMutation:false;truthBoundary:string};
export type RelativeCapacityManifestClientR154={schema:'OMEGA_RELATIVE_CAPACITY_FABRIC_R154';implemented:boolean;runtimeTimeEndpoint:string;canonicalMutation:false;admissionAuthority:'R125';truthBoundary:string};
export type RelativeNowAnchorR154={utcTime:string;monotonicMs:number;runtimeVersionId:string|null;createdAt:string;authority:'CLOUDFLARE_RUNTIME_CLOCK'};

const finiteIso=(value:any)=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const monotonic=()=>typeof performance!=='undefined'&&Number.isFinite(performance.now())?performance.now():0;

export async function fetchRuntimeNowR154(){return(await api.get<RuntimeNowR154>('/api/runtime-now-r154')).data}
export async function fetchRelativeCapacityManifestR154(){return(await api.get<RelativeCapacityManifestClientR154>('/api/relative-capacity-r154')).data}

export async function ensureRelativeNowAnchorR154(force=false,observedRuntime?:RuntimeNowR154){
 const prior=localState.read<RelativeNowAnchorR154|null>(R154_ANCHOR_KEY,null);
 const runtimeChanged=Boolean(observedRuntime?.runtimeVersionId&&prior?.runtimeVersionId&&observedRuntime.runtimeVersionId!==prior.runtimeVersionId);
 if(!force&&!runtimeChanged&&prior&&finiteIso(prior.utcTime)&&prior.authority==='CLOUDFLARE_RUNTIME_CLOCK')return prior;
 const now=observedRuntime||await fetchRuntimeNowR154();
 if(!finiteIso(now.utcTime))throw new Error('R154 runtime-time endpoint returned an invalid UTC time.');
 const anchor:RelativeNowAnchorR154={utcTime:now.utcTime,monotonicMs:monotonic(),runtimeVersionId:now.runtimeVersionId,createdAt:new Date().toISOString(),authority:now.authority};
 localState.write(R154_ANCHOR_KEY,anchor);
 return anchor;
}

export async function compileLiveRelativeCapacityR154(record:any,options:{panel?:string;intent?:string;observerFrame?:string;orientation?:-1|0|1;observerRelevance?:number;sourceObservationTime?:string;missionTick?:number;stateGeneration?:number;agentTurn?:number;modelGeneration?:number;causalDepth?:number;parentReceiptHash?:string;previousAddress?:number;truth?:R153Input['truth'];self?:R153Input['self'];forceAnchor?:boolean}={}){
 const runtimeNow=await fetchRuntimeNowR154();
 const anchor=await ensureRelativeNowAnchorR154(Boolean(options.forceAnchor),runtimeNow);
 const frame:R153Frame={serviceIdentity:'OMEGAV6_BROWSER',serviceRole:'OPERATOR_PROJECTION',runtimeRevision:'R154',canonicalSchemaVersion:String(RUNTIME_IDENTITY.schema),hostIdentity:'BROWSER_WORKSTATION',observerFrame:options.observerFrame||'FIELD',orientation:options.orientation??1};
 const currentMono=monotonic(),elapsedMono=Math.max(0,currentMono-anchor.monotonicMs),anchorUtcMs=Date.parse(anchor.utcTime),syntheticMonoBoundUtc=new Date(anchorUtcMs+elapsedMono).toISOString();
 const runtimeUtcMs=Date.parse(runtimeNow.utcTime),monoUtcMs=Date.parse(syntheticMonoBoundUtc),driftMs=Math.abs(runtimeUtcMs-monoUtcMs),sourceObservationTime=options.sourceObservationTime&&finiteIso(options.sourceObservationTime)?options.sourceObservationTime:runtimeNow.utcTime;
 const input:R153Input&{panel?:string;intent?:string}={address:Number(record?.address||0),previousAddress:options.previousAddress,time:{utcTime:runtimeNow.utcTime,sourceObservationTime,monotonicMs:currentMono,missionTick:Math.max(0,Math.floor(options.missionTick??0)),stateGeneration:Math.max(0,Math.floor(options.stateGeneration??0)),agentTurn:Math.max(0,Math.floor(options.agentTurn??0)),modelGeneration:Math.max(0,Math.floor(options.modelGeneration??0)),causalDepth:Math.max(0,Math.floor(options.causalDepth??0)),parentReceiptHash:options.parentReceiptHash,anchorUtcTime:anchor.utcTime,anchorMonotonicMs:anchor.monotonicMs},frame,truth:options.truth,observerRelevance:options.observerRelevance,self:options.self,panel:options.panel,intent:options.intent};
 const result=compileRelativeCapacityFabricR154(record,input);
 return{...result,runtimeClock:{authority:runtimeNow.authority,runtimeVersionId:runtimeNow.runtimeVersionId,anchorRuntimeVersionId:anchor.runtimeVersionId,anchorUtcTime:anchor.utcTime,runtimeUtcTime:runtimeNow.utcTime,monotonicProjectedUtc:syntheticMonoBoundUtc,observedDriftMs:driftMs,boundary:'Cloudflare runtime time is used as OMEGA runtime scheduling time. It is not claimed to be an independently calibrated UTC metrology source; R153/R154 reduce temporal confidence when runtime and monotonic anchor motion disagree. R210 automatically re-anchors browser scheduling continuity when the first-hand deployed Worker Version ID changes; a new runtime version never inherits a stale monotonic anchor.'}};
}
