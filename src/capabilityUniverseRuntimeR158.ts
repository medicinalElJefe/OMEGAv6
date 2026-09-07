import {STATE_COUNT,corpusState,decodeAddress} from './corpusRuntime';
import {compileAllModesTruthFusionR151} from './allModesTruthFusionR151';
import {compileRelativeCapacityFabricR154} from './relativeCapacityFabricR154';
import {wholeSystemConvergenceManifestR155} from './system/wholeSystemConvergenceR155.js';
import {compileDimensionalRelativityEvolutionR156,R156_RESOLUTION_LADDER,type R156Orientation} from './dimensionalRelativityEvolutionR156';

export const R158_SCHEMA='OMEGA_CAPABILITY_UNIVERSE_R158' as const;
export const R158_LAWS=Object.freeze([
 'VISUALIZE_THE_REAL_CAPABILITY_FABRIC_NOT_A_DECORATIVE_SUBSTITUTE',
 '241_MODE_LENS_CHANNELS_RETAIN_PROVENANCE_AND_GATE_STATE',
 '15_CAPABILITY_FAMILIES_RETAIN_R155_OWNER_DEPENDENCY_AND_PROOF_STATE',
 'R154_CAPACITY_IS_LOADED_FROM_THE_ACTUAL_RELATIVE_CAPACITY_COMPILER',
 'CANONICAL_ATLAS_LOD_CHANGES_RENDER_COST_NOT_CANONSTATE',
 'TWELVE_POWER_RESOLUTION_SHELLS_ARE_ADDRESS_FRAMES_NOT_PHYSICAL_DIMENSIONS',
 'UNBOUND_REFINEMENT_REMAINS_VISUALLY_DISTINCT_FROM_RESIDENT_CANONICAL_STATE',
 'ANIMATION_IS_A_STATE_BOUND_PROJECTION_NOT_EXECUTION_PROOF',
 'PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);
export type R158AtlasLod='FRAME_144'|'VOLUME_1728'|'FULL_20736';
export type R158ObserverFrame='GLOBAL'|'LOCAL';
export type R158ModeNode={index:number;id:string;name:string;group:string;gate:string;provenance:string;score:number;weight:number;angle:number;radius:number;x:number;y:number};
export type R158FamilyNode={index:number;family:string;state:string;authority:string;purpose:string;dependencies:string[];boundary:string;angle:number;x:number;y:number};
export type R158CapacityNode={index:number;route:string;workspace:string;kind:string;readiness:string;executionDomain:string;capabilityId:string;priority:number;combinedPressure:number;logicalLanes:number;fanout:number;temporalHz:number;historyDepth:number;viewResolution:number;solverFidelity:string;angle:number;x:number;y:number};
export type R158AtlasBuffer={lod:R158AtlasLod;count:number;addresses:Uint16Array;positions:Float32Array;attributes:Float32Array;boundary:string};

const TAU=Math.PI*2;
const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const polar=(angle:number,radius:number)=>({x:400+Math.cos(angle)*radius,y:400+Math.sin(angle)*radius});
const minimalDelta12=(v:number,origin:number)=>{let d=v-origin;if(d>6)d-=12;if(d<-6)d+=12;return d/6};

export function addressesForAtlasLodR158(anchor:number,lod:R158AtlasLod){
 const c=decodeAddress(Math.max(0,Math.min(STATE_COUNT-1,Math.floor(anchor)))),out:number[]=[];
 if(lod==='FRAME_144')for(let d=0;d<12;d++)for(let p=0;p<12;p++)out.push(((d*12+p)*12+c.r)*12+c.l);
 else if(lod==='VOLUME_1728')for(let d=0;d<12;d++)for(let p=0;p<12;p++)for(let r=0;r<12;r++)out.push(((d*12+p)*12+r)*12+c.l);
 else for(let i=0;i<STATE_COUNT;i++)out.push(i);
 return out;
}

const atlasCache=new Map<string,R158AtlasBuffer>();
export function compileAtlasBufferR158(anchor:number,lod:R158AtlasLod='VOLUME_1728',frame:R158ObserverFrame='GLOBAL'):R158AtlasBuffer{
 const a=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(anchor))),key=`${lod}:${frame}:${frame==='LOCAL'?a:'global'}`,hit=atlasCache.get(key);if(hit)return hit;
 const selected=decodeAddress(a),addressesList=addressesForAtlasLodR158(a,lod),positions=new Float32Array(addressesList.length*3),attributes=new Float32Array(addressesList.length*4),addresses=new Uint16Array(addressesList.length);
 for(let i=0;i<addressesList.length;i++){
  const address=addressesList[i],c=decodeAddress(address),r=corpusState(address),m=r.metrics||{},phaseA=TAU*(c.d+(c.p+.5)/12)/12,phaseB=TAU*(c.r+(c.l+.5)/12)/12;
  const local=frame==='LOCAL';
  const dx=local?minimalDelta12(c.d,selected.d):(c.d-5.5)/5.5,dp=local?minimalDelta12(c.p,selected.p):(c.p-5.5)/5.5,dr=local?minimalDelta12(c.r,selected.r):(c.r-5.5)/5.5,dl=local?minimalDelta12(c.l,selected.l):(c.l-5.5)/5.5;
  const ring=1.02+.24*Math.cos(phaseB)+.08*dp,scale=local?.78:1;
  positions[i*3]=scale*(Math.cos(phaseA)*ring+.10*dr);
  positions[i*3+1]=scale*(Math.sin(phaseA)*ring+.10*dl);
  positions[i*3+2]=scale*(.54*Math.sin(phaseB)+.15*dx+.08*dp);
  attributes[i*4]=cl(m.continuity);attributes[i*4+1]=cl(m.contradiction);attributes[i*4+2]=cl(m.evidence);attributes[i*4+3]=cl(r?.math?.normalizedMotionRelativity);
  addresses[i]=address;
 }
 const result={lod,count:addressesList.length,addresses,positions,attributes,boundary:`${lod} renders ${addressesList.length.toLocaleString()} resident canonical addresses. LOD and observer frame alter projection workload only; they do not create, delete or admit CanonState.`};
 if(atlasCache.size>10)atlasCache.clear();atlasCache.set(key,result);return result;
}

export function compileCapabilityUniverseR158(record:any,options:{power?:number;orientation?:R156Orientation;observerFrame?:R158ObserverFrame}={}){
 const address=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(record?.address)||0))),fusion=compileAllModesTruthFusionR151(record),whole=wholeSystemConvergenceManifestR155(),evolution=compileDimensionalRelativityEvolutionR156(address,options.power??4,options.orientation),orientation=evolution.orientation||1;
 const modes:R158ModeNode[]=fusion.channels.map((row:any,index:number)=>{const angle=orientation*(index/Math.max(1,fusion.channels.length))*TAU-Math.PI/2,radius=176+52*cl(row.score)+18*cl(row.weight),p=polar(angle,radius);return{index,id:String(row.id),name:String(row.name),group:String(row.group),gate:String(row.gate),provenance:String(row.provenance),score:cl(row.score),weight:cl(row.weight),angle,radius,x:p.x,y:p.y}});
 const families:R158FamilyNode[]=whole.families.map((row:any,index:number)=>{const angle=-orientation*(index/Math.max(1,whole.families.length))*TAU-Math.PI/2,p=polar(angle,316);return{index,family:String(row.family),state:String(row.state),authority:String(row.authority),purpose:String(row.purpose),dependencies:Array.isArray(row.dependencies)?row.dependencies.map(String):[],boundary:String(row.boundary),angle,x:p.x,y:p.y}});
 const familyIndex=Object.fromEntries(families.map((x,i)=>[x.family,i]));
 const dependencyEdges=families.flatMap(f=>f.dependencies.filter(d=>familyIndex[d]!=null).map(d=>({from:f.family,to:d,fromIndex:f.index,toIndex:familyIndex[d]})));
 const provenanceCounts=modes.reduce((acc:Record<string,number>,x)=>{acc[x.provenance]=(acc[x.provenance]||0)+1;return acc},{}),gateCounts=modes.reduce((acc:Record<string,number>,x)=>{const k=x.gate.toUpperCase();acc[k]=(acc[k]||0)+1;return acc},{}),familyStates=families.reduce((acc:Record<string,number>,x)=>{acc[x.state]=(acc[x.state]||0)+1;return acc},{});
 return{schema:R158_SCHEMA,laws:R158_LAWS,address,stateId:record.stateId,nextStateId:evolution.canonicalNextStateId,observerFrame:options.observerFrame||'GLOBAL',fusion,evolution,wholeSystem:whole,modes,families,dependencyEdges,resolution:R156_RESOLUTION_LADDER,provenanceCounts,gateCounts,familyStates,counts:{channels:fusion.channelCount,sourceModes:fusion.sourceModeCount,canonAuthorities:fusion.canonAuthorityCount,capabilityFamilies:families.length,dependencyEdges:dependencyEdges.length,resolutionFrames:R156_RESOLUTION_LADDER.length,canonicalStates:STATE_COUNT},truthBoundary:'R158 is a source-bound visual composition over the proven R155 capability-family ownership model, R151 241-channel truth fusion and R156 dimensional-relativity candidate. Mode agreement remains internal coherence, capability-family state remains software authority, animation remains projection, and R125 remains the only CanonState admission authority.'};
}

export function compileCapacityLayerR158(record:any,options:{orientation?:R156Orientation;observerFrame?:R158ObserverFrame;observerRelevance?:number;intent?:string;panel?:string;utcTime?:string;monotonicMs?:number}={}){
 const address=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(record?.address)||0))),now=options.utcTime||new Date().toISOString(),orientation=options.orientation??(corpusState(address)?.geometry?.phi>=0?1:-1),input={address,previousAddress:address,time:{utcTime:now,sourceObservationTime:now,monotonicMs:Number(options.monotonicMs??0),missionTick:0,stateGeneration:0,agentTurn:0,modelGeneration:0,causalDepth:0},frame:{serviceIdentity:'OMEGAv6',serviceRole:'CAPABILITY_UNIVERSE_R158',runtimeRevision:'R158',canonicalSchemaVersion:'R125_CANONSTATE',hostIdentity:'BROWSER_OBSERVER',observerFrame:options.observerFrame||'GLOBAL',orientation},observerRelevance:cl(options.observerRelevance??.62),timeScale:1,deepAtlas:false,panel:options.panel||'Relativity',intent:options.intent||'visualize full current capability fabric'} as any,capacity=compileRelativeCapacityFabricR154(record,input);
 const plans:R158CapacityNode[]=capacity.plans.map((row:any,index:number)=>{const angle=(index/Math.max(1,capacity.plans.length))*TAU-Math.PI/2,p=polar(angle,270+28*cl(row.pressures?.combined));return{index,route:String(row.route),workspace:String(row.workspace),kind:String(row.kind),readiness:String(row.readiness),executionDomain:String(row.executionDomain),capabilityId:String(row.capabilityId),priority:cl(row.relativePriority),combinedPressure:cl(row.pressures?.combined),logicalLanes:Number(row.capacity?.logicalLanes||1),fanout:Number(row.capacity?.logicalFanout||1),temporalHz:Number(row.capacity?.temporalHz||1),historyDepth:Number(row.capacity?.historyDepth||1),viewResolution:Number(row.capacity?.viewResolution||12),solverFidelity:String(row.capacity?.solverFidelity||'NONE'),angle,x:p.x,y:p.y}});
 return{schema:'OMEGA_CAPABILITY_UNIVERSE_CAPACITY_LAYER_R158',address,stateId:record.stateId,capacity,plans,summary:capacity.summary,truth:capacity.truth,now:capacity.now,motion:capacity.motion,atlasCoherence:capacity.atlasCoherence,boundary:'R158 capacity nodes come directly from R154 relative-capacity plans. Logical lanes, fanout, sampling rate and solver fidelity are scheduling/projection budgets until their own execution receipts prove invocation.'};
}
