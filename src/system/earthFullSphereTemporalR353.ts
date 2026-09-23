import{compileCanonicalTypedFieldR349,type TypedFieldR349}from'./wovenHardwareFieldR349';
import{compileTemporalBudgetFromR193R350,evolveTemporalTimelineR350,fieldHashR350,seekTemporalStateR350,timelineFramesR350,type TimelineR350}from'./temporalCheckpointReplayR350';
import{compilePacketMirrorR351,deterministicFrameReceiptR351}from'./gpuPacketMirrorR351';
import{cpuRenderStateReferenceR352,gpuComputePlanR352}from'./gpuComputeRuntimeR352';
import{createWgs84Orthographic,wrapLon,solarPoint,type GeoPoint}from'../earthProjectionR284';

export const R353_SCHEMA='OMEGA_EARTH_FULL_SPHERE_TEMPORAL_CONVERGENCE_R353' as const;
export const R353_REVISION='R353' as const;
export const R353_BOUNDARY='R353 joins returned-Earth provenance context, existing R284 WGS84 geometry, R350 deterministic model-time replay, and R351/R352 derived render-state into one read-only Full Sphere traversal instrument. Historical Full Sphere dodecahedron/antipode/precession/orbit motifs are recovered only as representational grammar. They are not observed Earth history, astronomical ephemerides, future measurements, physical dimensions, or CanonState. R125/R141/R146/R147 and existing Earth source adapters remain authoritative.';
export const R353_LAWS=[
 'EXISTING_EARTH_SOURCE_ADAPTERS_REMAIN_SOLE_OBSERVATION_INGRESS',
 'R284_WGS84_FORWARD_INVERSE_ROUNDTRIP_IS_REUSED_NOT_REIMPLEMENTED',
 'R350_INTEGER_MODEL_TIME_OWNS_HISTORY_NOW_FORECAST_REPLAY',
 'R352_RENDER_STATE_IS_DERIVED_AND_CANNOT_MUTATE_CANONICAL_STATE',
 'HISTORICAL_FULL_SPHERE_MEDIA_IS_PRESENTATION_DONOR_EVIDENCE_ONLY',
 'DODECAHEDRAL_ANTIPODE_PRECESSION_ORBIT_GRAMMAR_IS_REPRESENTATIONAL',
 'FORECAST_SCENARIOS_REMAIN_MODEL_PROJECTED_NOT_OBSERVED',
 'NO_GENERATED_SCENERY_SUBSTITUTION',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]as const;

export type DodecaPointR353={id:number;x:number;y:number;z:number;screenX:number;screenY:number;depth:number};
export type DodecaEdgeR353={a:number;b:number};
export type FullSphereTemporalR353={
 schema:typeof R353_SCHEMA;revision:typeof R353_REVISION;
 address:number;target:GeoPoint;antipode:GeoPoint;tick:number;nowTick:number;relation:'HISTORY'|'NOW'|'FORECAST';
 timeline:TimelineR350;frames:ReturnType<typeof timelineFramesR350>;
 selected:{fieldHash:string;continuity:number;plasticity:number;burden:number;contradiction:number;scar:number;evidence:number;invariant:number;motion:number};
 comparison:{historyHash:string;nowHash:string;forecastHash:string;scenarioSpread:number;uncertaintyLabel:'MODEL_SCENARIO_SPREAD_NOT_PROBABILITY'};
 observerProof:{sample:GeoPoint;projected:{x:number;y:number;z:number};roundTrip:GeoPoint|null;latResidualDeg:number;lonResidualDeg:number;pass:boolean};
 solar:{lat:number;lon:number;source:'R284_DERIVED_UTC_GEOMETRY'};
 grammar:{phase:number;angleDeg:number;points:DodecaPointR353[];edges:DodecaEdgeR353[];authority:'REPRESENTATIONAL_HISTORICAL_GRAMMAR_DONOR'};
 render:{packetHash:string;frameReceiptHash:string;cpuRenderHash:string;gpuPlanShaderHash:string;canonicalMutation:false};
 source:{evidenceHash:string|null;verifiedAt:string|null;authority:'RETURNED_CONTEXT'|'UNBOUND';generatedScenerySubstituted:false};
 boundary:string;
};

const cl=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
const lonResidual=(a:number,b:number)=>Math.abs(wrapLon(a-b));
const mean=(a:Float32Array)=>{let n=0;for(let i=0;i<a.length;i++)n+=a[i];return n/Math.max(1,a.length)};

function dodecaBase(){
 const p=(1+Math.sqrt(5))/2,ip=1/p,pts:number[][]=[];
 for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])pts.push([x,y,z]);
 for(const a of[-1,1])for(const b of[-1,1]){pts.push([0,a*ip,b*p],[a*ip,b*p,0],[b*p,0,a*ip])}
 return pts.map(v=>{const n=Math.hypot(...v);return v.map(x=>x/n)});
}
const BASE=dodecaBase();
function dodecaEdges():DodecaEdgeR353[]{
 const distances:number[]=[];for(let i=0;i<BASE.length;i++)for(let j=i+1;j<BASE.length;j++)distances.push(Math.hypot(BASE[i][0]-BASE[j][0],BASE[i][1]-BASE[j][1],BASE[i][2]-BASE[j][2]));
 const edge=Math.min(...distances.filter(x=>x>1e-9)),tol=edge*1e-5,out:DodecaEdgeR353[]=[];
 for(let i=0;i<BASE.length;i++)for(let j=i+1;j<BASE.length;j++){const d=Math.hypot(BASE[i][0]-BASE[j][0],BASE[i][1]-BASE[j][1],BASE[i][2]-BASE[j][2]);if(Math.abs(d-edge)<=tol)out.push({a:i,b:j})}
 return out;
}
const EDGES=dodecaEdges();

export function compileDodecaGrammarR353(tick:number,totalTicks=12){
 const phase=((Math.floor(tick)%Math.max(1,totalTicks))+Math.max(1,totalTicks))%Math.max(1,totalTicks))/Math.max(1,totalTicks),angle=phase*Math.PI*2,tilt=.42*Math.PI/2,ca=Math.cos(angle),sa=Math.sin(angle),ct=Math.cos(tilt),st=Math.sin(tilt);
 const points:DodecaPointR353[]=BASE.map((v,id)=>{const x1=v[0]*ca-v[2]*sa,z1=v[0]*sa+v[2]*ca,y1=v[1],y=y1*ct-z1*st,z=y1*st+z1*ct,x=x1,scale=.78/(1.8-z*.45);return{id,x,y,z,screenX:.5+x*scale,screenY:.5-y*scale,depth:z}});
 return{phase,angleDeg:phase*360,points,edges:EDGES,authority:'REPRESENTATIONAL_HISTORICAL_GRAMMAR_DONOR' as const};
}

function sampleField(field:TypedFieldR349,address:number){
 const i=Math.max(0,Math.min(field.resolution-1,Math.floor(address)));
 return{fieldHash:fieldHashR350(field),continuity:field.continuity[i],plasticity:field.plasticity[i],burden:field.burden[i],contradiction:field.contradiction[i],scar:field.scar[i],evidence:field.evidence[i],invariant:field.invariant[i],motion:field.motion[i]};
}

export function observerRoundTripR353(center:GeoPoint){
 const projection=createWgs84Orthographic(center.lat,center.lon),sample={lat:cl(center.lat+5,-84,84),lon:wrapLon(center.lon+7)},p=projection.forward(sample.lat,sample.lon),back=projection.inverse(p.x,p.y),latResidualDeg=back?Math.abs(back.lat-sample.lat):Infinity,lonResidualDeg=back?lonResidual(back.lon,sample.lon):Infinity;
 return{sample,projected:{x:p.x,y:p.y,z:p.z},roundTrip:back?{lat:back.lat,lon:back.lon}:null,latResidualDeg,lonResidualDeg,pass:Boolean(back&&latResidualDeg<1e-6&&lonResidualDeg<1e-6)};
}

export function compileFullSphereTemporalR353({address=0,lat=0,lon=0,evidence=null,steps=12,nowTick=6,tick=6,field}:{address?:number;lat?:number;lon?:number;evidence?:any;steps?:number;nowTick?:number;tick?:number;field?:TypedFieldR349}={}):FullSphereTemporalR353{
 const source=field||compileCanonicalTypedFieldR349(0),count=Math.max(4,Math.min(48,Math.floor(steps))),now=Math.max(1,Math.min(count-1,Math.floor(nowTick))),selectedTick=Math.max(0,Math.min(count,Math.floor(tick)));
 const compiled=compileTemporalBudgetFromR193R350({run:{requestedResolution:20736},hint:{logicalCores:4},currentPressure:0,predictedPressure:0,input:{addressScale:20736},history:{}});
 const timeline=evolveTemporalTimelineR350(source,{steps:count,checkpointEvery:2,orientations:[1,-1,1,0],transportRate:.125,nowTick:now,budget:compiled.budget}),frames=timelineFramesR350(timeline,now);
 const selectedState=seekTemporalStateR350(timeline,selectedTick),historyState=seekTemporalStateR350(timeline,Math.max(0,now-2)),nowState=seekTemporalStateR350(timeline,now),forecastState=seekTemporalStateR350(timeline,Math.min(count,now+2));
 const selected=sampleField(selectedState.field,address),history=sampleField(historyState.field,address),present=sampleField(nowState.field,address),forecast=sampleField(forecastState.field,address);
 const scenarioSpread=cl(Math.abs(forecast.plasticity-present.plasticity)+Math.abs(forecast.contradiction-present.contradiction)+Math.abs(forecast.motion-present.motion),0,3)/3;
 const target={lat:cl(lat,-90,90),lon:wrapLon(lon)},antipode={lat:-target.lat,lon:wrapLon(target.lon+180)},observerProof=observerRoundTripR353(target),grammar=compileDodecaGrammarR353(selectedTick,count),sun=solarPoint(new Date(0+selectedTick*3600000));
 const mirror=compilePacketMirrorR351(selectedState.field),frameReceipt=deterministicFrameReceiptR351(selectedState.field,selectedTick),cpu=cpuRenderStateReferenceR352(mirror),gpuPlan=gpuComputePlanR352(mirror);
 const relation=selectedTick<now?'HISTORY':selectedTick===now?'NOW':'FORECAST';
 return{schema:R353_SCHEMA,revision:R353_REVISION,address:Math.max(0,Math.min(20735,Math.floor(address))),target,antipode,tick:selectedTick,nowTick:now,relation,timeline,frames,selected,comparison:{historyHash:history.fieldHash,nowHash:present.fieldHash,forecastHash:forecast.fieldHash,scenarioSpread,uncertaintyLabel:'MODEL_SCENARIO_SPREAD_NOT_PROBABILITY'},observerProof,solar:{lat:sun.lat,lon:sun.lon,source:'R284_DERIVED_UTC_GEOMETRY'},grammar,render:{packetHash:frameReceipt.packet.packetHash,frameReceiptHash:frameReceipt.receiptHash,cpuRenderHash:cpu.outputHash,gpuPlanShaderHash:gpuPlan.shaderHash,canonicalMutation:false},source:{evidenceHash:typeof evidence?.evidenceHash==='string'?evidence.evidenceHash:null,verifiedAt:typeof evidence?.verifiedAt==='string'?evidence.verifiedAt:null,authority:evidence?.evidenceHash?'RETURNED_CONTEXT':'UNBOUND',generatedScenerySubstituted:false},boundary:R353_BOUNDARY};
}

export function proveFullSphereTemporalR353(model:FullSphereTemporalR353){
 const counts=model.grammar.points.length===20&&model.grammar.edges.length===30,hashes=[model.comparison.historyHash,model.comparison.nowHash,model.comparison.forecastHash].every(x=>/^[0-9a-f]{64}$/.test(x));
 return{schema:'OMEGA_EARTH_FULL_SPHERE_TEMPORAL_PROOF_R353' as const,wgs84RoundTrip:model.observerProof.pass,dodecahedronTopology:counts,temporalHashes:hashes,sourceBoundary:model.source.generatedScenerySubstituted===false,forecastBoundary:model.comparison.uncertaintyLabel==='MODEL_SCENARIO_SPREAD_NOT_PROBABILITY',gpuCanonicalMutation:model.render.canonicalMutation,pass:model.observerProof.pass&&counts&&hashes&&!model.source.generatedScenerySubstituted&&!model.render.canonicalMutation,boundary:R353_BOUNDARY};
}

export function fieldScenarioSummaryR353(field:TypedFieldR349){return{meanContinuity:mean(field.continuity),meanPlasticity:mean(field.plasticity),meanEvidence:mean(field.evidence),fieldHash:fieldHashR350(field)}}
