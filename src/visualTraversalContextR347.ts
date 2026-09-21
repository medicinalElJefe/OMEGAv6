import{corpusState,decodeAddress,STATE_COUNT}from'./corpusRuntime';
import{unifiedFromRecord}from'./unifiedCalculus';
import{computeLensScore,LENS_CALCULUS,type OmegaLens}from'./lensCalculus';
import{calibratedState,type VisualCalibration}from'./visualCalibration';
import{SCALE_DOMAINS}from'./motionDomainRuntime';

export const R347_REVISION='R347' as const;
export const R347_SCHEMA='OMEGA_HUMAN_VISUAL_TRAVERSAL_COCKPIT_R347' as const;
export type R347TaskView='NOW'|'ROUTE'|'PROOF'|'SCAR'|'FORECAST';

export const R347_VISUAL_GRAMMAR=Object.freeze([
 {channel:'POSITION',source:'20,736 source geometry',equation:'(x,y,z)=mandala20736Runtime source projection',meaning:'structure and relational location',boundary:'representational geometry unless an external physical coordinate system is explicitly bound'},
 {channel:'LUMINANCE_ALPHA',source:'calibrated evidence',equation:'α=.05+.70·E_c',meaning:'how strongly a state is evidenced',boundary:'opacity never upgrades truth class'},
 {channel:'LINE_WEIGHT',source:'calibrated continuity',equation:'w=.6+2.8·CΩ_c',meaning:'continuity of an admitted route',boundary:'line weight is visual encoding, not physical thickness'},
 {channel:'DEFORMATION',source:'contradiction + burden',equation:'δ=.55·q_c+.45·Λ_c',meaning:'constraint/pressure that deforms the model field',boundary:'model deformation, not measured force'},
 {channel:'PERSISTENCE',source:'scar/history',equation:'p=.15+.85·Σ_c',meaning:'retained path/history stays visible longer',boundary:'scar is model/history carry unless source evidence says otherwise'},
 {channel:'MOTION',source:'declared route derivatives',equation:'motion=route velocity/acceleration or returned timestamp delta',meaning:'change through a declared frame',boundary:'model-route motion is never labeled measured physical velocity'},
 {channel:'COLOR_CLASS',source:'truth class',equation:'OBSERVED / COMPUTED / FORECAST / HELD',meaning:'categorical authority, not magnitude',boundary:'continuous magnitude is not encoded by hue'},
 {channel:'UNCERTAINTY',source:'missingness + 1−evidence',equation:'uncertainty→reduced opacity / hollow structure / explicit label',meaning:'what is not established remains perceptually visible',boundary:'missing values remain missing'}
]);

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export function modelMappedWgs84R347(address:number){
 const c=decodeAddress(Math.max(0,Math.min(STATE_COUNT-1,Math.floor(address))));
 return{lat:-90+(c.d+.5)/12*180,lon:-180+(c.p*12+c.r+.5)/144*360,boundary:'Address→WGS84 is a deterministic query mapping only; it does not make the atlas address a physical Earth coordinate.'};
}
export function routeR347(address:number,count=48){
 const rows=[] as any[];let a=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(address)));
 for(let i=0;i<Math.max(1,Math.min(188,count));i++){const r=corpusState(a);rows.push({step:i,address:a,stateId:r.stateId,decision:r.metrics.decision,C:Number(r.metrics.continuity),Phi:Number(r.metrics.plasticity),q:Number(r.metrics.contradiction),Lambda:Number(r.metrics.burden),scar:Number(r.metrics.scar),evidence:Number(r.metrics.evidence),next:Number(r.autoPing.dataNext)});const n=Number(r.autoPing.dataNext);if(!Number.isFinite(n)||n===a)break;a=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(n)))}
 return rows;
}
export function visualStateR347(address:number,cal:VisualCalibration,lens:OmegaLens){
 const r=corpusState(address),u=unifiedFromRecord(r),c=calibratedState(r,cal);
 const score=computeLensScore(lens,{C:c.C,Phi:c.Phi,q:c.q,Lambda:c.Lambda,scar:c.scar,evidence:c.evidence,rsc:c.rsc,geometry:c.shape,motion:c.motion,symmetry:c.symmetry,forecast:c.forecast,route:Math.abs(c.routeDelta),gate:c.mode188,drive:c.relativity,velocity:c.routeDelta,acceleration:c.gain});
 return{record:r,unified:u,calibrated:c,lens,score,encoding:{alpha:.05+.70*c.evidence,lineWeight:.6+2.8*c.C,deformation:.55*c.q+.45*c.Lambda,persistence:.15+.85*c.scar,uncertainty:cl(1-c.evidence),salience:cl(.55*score+.45*c.evidence)},lensDescriptor:LENS_CALCULUS[lens]};
}
export function lensScoreSetR347(address:number,cal:VisualCalibration){
 const lenses=(Object.keys(LENS_CALCULUS)as OmegaLens[]),r=corpusState(address),c=calibratedState(r,cal);
 const input={C:c.C,Phi:c.Phi,q:c.q,Lambda:c.Lambda,scar:c.scar,evidence:c.evidence,rsc:c.rsc,geometry:c.shape,motion:c.motion,symmetry:c.symmetry,forecast:c.forecast,route:Math.abs(c.routeDelta),gate:c.mode188,drive:c.relativity,velocity:c.routeDelta,acceleration:c.gain};
 return lenses.map(lens=>({lens,score:computeLensScore(lens,input),descriptor:LENS_CALCULUS[lens]}));
}
export function scaleReferenceR347(index:number){return SCALE_DOMAINS[Math.max(0,Math.min(SCALE_DOMAINS.length-1,index|0))]}

export type R347ScalarTruth='OBSERVED'|'COMPUTED'|'FORECAST'|'HELD';
export type R347ScalarInput={id:string;label:string;value?:number|null;unit?:string|null;source?:string|null;observedAt?:string|null;truth:R347ScalarTruth;uncertainty?:number|null};
export function admitScalarChannelR347(x:R347ScalarInput){
 const finite=typeof x.value==='number'&&Number.isFinite(x.value),unit=String(x.unit||'').trim(),source=String(x.source||'').trim(),at=String(x.observedAt||'').trim(),timestamp=at&&Number.isFinite(Date.parse(at));
 if(x.truth==='OBSERVED'&&(!finite||!unit||!source||!timestamp))return{...x,value:finite?x.value:null,truth:'HELD' as const,reason:'OBSERVED_SCALAR_REQUIRES_VALUE_UNIT_SOURCE_TIMESTAMP'};
 if(x.truth!=='HELD'&&!finite)return{...x,value:null,truth:'HELD' as const,reason:'FINITE_VALUE_REQUIRED'};
 return{...x,reason:'ADMITTED',uncertainty:typeof x.uncertainty==='number'&&Number.isFinite(x.uncertainty)?Math.max(0,x.uncertainty):null};
}
export const R347_UNIT_POLICY='A physical quantity enters the observed layer only with a finite value, explicit unit, source identity and observation timestamp. A label such as energy, force, power, velocity or temperature never supplies physical authority by itself. Model pressure, activity, route motion and visual deformation are never silently relabeled as physical energy.';

export type R347PhysicalQuantityKind='ENERGY'|'POWER'|'FLUX'|'TEMPERATURE'|'VELOCITY'|'FIELD_STRENGTH'|'OTHER';
export type R347PhysicalQuantityInput=R347ScalarInput&{kind:R347PhysicalQuantityKind;frame?:string|null};
export function admitPhysicalQuantityR347(x:R347PhysicalQuantityInput){
 const admitted=admitScalarChannelR347(x),frame=String(x.frame||'').trim();
 if(admitted.truth==='HELD')return{...admitted,kind:x.kind,frame:frame||null,physicalAuthority:false};
 if(['VELOCITY','FIELD_STRENGTH'].includes(x.kind)&&!frame)return{...admitted,truth:'HELD' as const,reason:'PHYSICAL_VECTOR_OR_FIELD_REQUIRES_REFERENCE_FRAME',kind:x.kind,frame:null,physicalAuthority:false};
 return{...admitted,kind:x.kind,frame:frame||null,physicalAuthority:true};
}
export const R347_PHYSICAL_QUANTITY_REGISTRY=Object.freeze([
 {kind:'ENERGY',canonicalUnit:'J',status:'HELD_UNTIL_BOUND',requires:['finite value','unit','source','observation time']},
 {kind:'POWER',canonicalUnit:'W',status:'HELD_UNTIL_BOUND',requires:['finite value','unit','source','observation time']},
 {kind:'FLUX',canonicalUnit:'declared source unit',status:'HELD_UNTIL_BOUND',requires:['finite value','unit','source','observation time']},
 {kind:'VELOCITY',canonicalUnit:'m/s',status:'HELD_UNTIL_BOUND',requires:['finite value','unit','source','observation time','reference frame']},
 {kind:'FIELD_STRENGTH',canonicalUnit:'declared SI/source unit',status:'HELD_UNTIL_BOUND',requires:['finite value','unit','source','observation time','reference frame']}
] as const);

export type R347SourceClock={id:string;label:string;source:string;observedAt:string|null;verifiedAt:string|null;timeClass:'OBSERVATION'|'SNAPSHOT_VERIFICATION';bound:boolean};
export function sourceClocksR347(earth:any):R347SourceClock[]{
 const src=(x:any)=>String(x?.source||x?.provider||x?.endpoint||'').trim(),iso=(x:any)=>{const s=String(x||'').trim();return s&&Number.isFinite(Date.parse(s))?s:null};
 return[
  {id:'weather',label:'Weather observation',source:src(earth?.sources?.openMeteo),observedAt:iso(earth?.localConditions?.time),verifiedAt:iso(earth?.sources?.openMeteo?.verifiedAt),timeClass:'OBSERVATION',bound:Boolean(src(earth?.sources?.openMeteo)&&iso(earth?.localConditions?.time))},
  {id:'space-weather',label:'Kp observation',source:src(earth?.sources?.swpc),observedAt:iso(earth?.spaceWeather?.observationTime),verifiedAt:iso(earth?.sources?.swpc?.verifiedAt),timeClass:'OBSERVATION',bound:Boolean(src(earth?.sources?.swpc)&&iso(earth?.spaceWeather?.observationTime))},
  {id:'seismic',label:'USGS seismic snapshot',source:src(earth?.sources?.usgs),observedAt:null,verifiedAt:iso(earth?.sources?.usgs?.verifiedAt),timeClass:'SNAPSHOT_VERIFICATION',bound:Boolean(src(earth?.sources?.usgs)&&iso(earth?.sources?.usgs?.verifiedAt))},
  {id:'events',label:'EONET event snapshot',source:src(earth?.sources?.eonet),observedAt:null,verifiedAt:iso(earth?.sources?.eonet?.verifiedAt),timeClass:'SNAPSHOT_VERIFICATION',bound:Boolean(src(earth?.sources?.eonet)&&iso(earth?.sources?.eonet?.verifiedAt))}
 ];
}
export function contextCompletenessR347(channels:ReturnType<typeof admitScalarChannelR347>[],clocks:R347SourceClock[]){
 const admitted=channels.filter(x=>x.truth!=='HELD').length,clockBound=clocks.filter(x=>x.bound).length,total=channels.length+clocks.length;
 return total?{admitted,clockBound,total,ratio:(admitted+clockBound)/total}:{admitted:0,clockBound:0,total:0,ratio:0};
}

export const R347_TRUTH_BOUNDARY='R347 changes visual organization, projection and interaction only. Existing source, CanonState, R125 admission, R342/R344 SAR gates, Hybrid authority and deployment authority remain unchanged. 20,736 is an address space, route steps are model time, each returned Earth source retains its own observation or snapshot-verification clock, and physical energy/power/flux remain UNBOUND unless a unit-bearing source establishes them. Co-location and visual synchronization are correlation aids, not causal proof.';
