import {corpusState,evaluateCorpusModes} from './corpusRuntime';
import {evaluateCanonAuthorityStack} from './allModesAuthority';
import {compilePhysicsRelativityR132} from './physicsRelativityRuntimeR132';
import {compileDimensionalRelativityEvolutionR156,R156_RESOLUTION_LADDER} from './dimensionalRelativityEvolutionR156';
import {R48_COMPLETION_FAMILIES} from './completionRuntimeR48';
import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import {wholeSystemConvergenceManifestR155} from './system/wholeSystemConvergenceR155.js';

export const R158_REVISION='R158' as const;
export const R158_SCHEMA='OMEGA_CAPABILITY_UNIVERSE_R158' as const;
export const R158_VIEW_LAW='OUTPUT_PLANE_FIRST · CONTROLS_RESERVE_LAYOUT · INSPECTOR_DOCKS_OUTSIDE_OUTPUT · NAVIGATION_MUST_NOT_COVER_OR_CRUSH_ACTIVE_VISUAL' as const;
export const R158_TRUTH_BOUNDARY='R158 visualizes current source-mode evaluations, canon-authority evaluations, admitted/candidate capability families, historical completion provenance, routes, Woven carry and dimensional address frames. Geometry, animation, orbit, zoom and focus are operator projections only. They do not create execution proof, empirical physics, literal dimensions, device availability or CanonState admission.' as const;

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const num=(x:any,f=0)=>Number.isFinite(Number(x))?Number(x):f;
const text=(...xs:any[])=>xs.find(x=>typeof x==='string'&&x.trim())?.trim()||'';
const polar=(angle:number,radius:number,c=360)=>({x:c+Math.cos(angle)*radius,y:c+Math.sin(angle)*radius});
const safeArray=(x:any)=>Array.isArray(x)?x:[];

export type R158UniverseNode={
 kind:'SOURCE_MODE'|'CANON_AUTHORITY'|'CAPABILITY_FAMILY'|'COMPLETION_PROVENANCE'|'ROUTE';
 index:number;id:string;label:string;group:string;state:string;value:number;angle:number;radius:number;x:number;y:number;
 route?:string;detail:string;authority:string;
};

export function compileCapabilityUniverseR158(address:number,selectedPower=4,orientation?:number){
 const a=Math.max(0,Math.min(20735,Math.floor(num(address))));
 const record=corpusState(a);
 const catalog=evaluateCorpusModes(record);
 const authorities=evaluateCanonAuthorityStack(record);
 const physics=compilePhysicsRelativityR132(a);
 const evolution=compileDimensionalRelativityEvolutionR156(a,selectedPower,orientation);
 const convergence=wholeSystemConvergenceManifestR155();
 const sigma=evolution.orientation===0?1:evolution.orientation;
 const sourceRows=safeArray(catalog?.results);
 const authorityRows=safeArray(authorities);
 const currentFamilies=safeArray(convergence?.families);
 const completionRows=safeArray(R48_COMPLETION_FAMILIES);
 const routeRows=safeArray(OMEGA_ALL_ROUTES_R82);

 const modes:R158UniverseNode[]=sourceRows.map((row:any,index:number)=>{const value=clamp(num(row?.score)),angle=sigma*(index/Math.max(1,sourceRows.length))*Math.PI*2-Math.PI/2,radius=118+value*24,p=polar(angle,radius);return{kind:'SOURCE_MODE',index,id:text(row?.id,`M${String(index+1).padStart(3,'0')}`),label:text(row?.mode,row?.name,row?.label,`Mode ${index+1}`),group:text(row?.category,row?.family,'SOURCE MODE'),state:text(row?.gate,row?.decision,'TURN').toUpperCase(),value,angle,radius,x:p.x,y:p.y,detail:`source-backed mode evaluation · score ${value.toFixed(5)}`,authority:'SOURCE_MODE_EVALUATION'}});
 const canon:R158UniverseNode[]=authorityRows.map((row:any,index:number)=>{const value=clamp(num(row?.activation)),angle=-sigma*(index/Math.max(1,authorityRows.length))*Math.PI*2-Math.PI/2,radius=185+value*18,p=polar(angle,radius);return{kind:'CANON_AUTHORITY',index,id:text(row?.id,`A${String(index+1).padStart(3,'0')}`),label:text(row?.name,row?.label,row?.authority,`Authority ${index+1}`),group:text(row?.group,row?.category,'CANON AUTHORITY'),state:text(row?.state,'QUIET').toUpperCase(),value,angle,radius,x:p.x,y:p.y,detail:`canon/calculus authority evaluation · activation ${value.toFixed(5)}`,authority:'CANON_AUTHORITY_EVALUATION'}});
 const families:R158UniverseNode[]=currentFamilies.map((row:any,index:number)=>{const angle=sigma*(index/Math.max(1,currentFamilies.length))*Math.PI*2-Math.PI/2,radius=250,p=polar(angle,radius);return{kind:'CAPABILITY_FAMILY',index,id:String(row.family),label:String(row.family).replaceAll('_',' '),group:'R155 CURRENT CAPABILITY FAMILY',state:String(row.state),value:row.state==='ADMITTED_MAIN'?1:row.state==='INTEGRATED_CANDIDATE'?.66:.33,angle,radius,x:p.x,y:p.y,route:String(row.purpose||'').includes('visual')?'Visual Instrument':undefined,detail:`${row.purpose} · boundary: ${row.boundary}`,authority:String(row.authority)}});
 const completion:R158UniverseNode[]=completionRows.map((row:any,index:number)=>{const angle=-sigma*(index/Math.max(1,completionRows.length))*Math.PI*2-Math.PI/2,radius=292,p=polar(angle,radius);return{kind:'COMPLETION_PROVENANCE',index,id:String(row.id),label:String(row.name),group:'R48 SUCCESSOR PROVENANCE',state:String(row.successor),value:['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(String(row.successor))?1:.45,angle,radius,x:p.x,y:p.y,route:String(row.surface||'').split(' / ')[0],detail:`${row.proof} · remaining: ${row.remaining}`,authority:'R48_SUCCESSOR_LEDGER'}});
 const routes:R158UniverseNode[]=routeRows.map((route:any,index:number)=>{const ws=workspaceForRouteR82(String(route)),angle=sigma*(index/Math.max(1,routeRows.length))*Math.PI*2-Math.PI/2,radius=326,p=polar(angle,radius);return{kind:'ROUTE',index,id:`ROUTE_${index+1}`,label:String(route),group:`${ws.id} WORKSPACE`,state:'REGISTERED',value:1,angle,radius,x:p.x,y:p.y,route:String(route),detail:`registered route in ${ws.label} workspace`,authority:'OMEGA_EXPERIENCE_REGISTRY_R82'}});

 const sourceHarmonics=safeArray(physics?.sourceModeField?.harmonics);
 const authorityHarmonics=safeArray(physics?.canonAuthorityField?.harmonics);
 const membrane=(rows:any[],base:number,gain:number,carry:number)=>rows.map((h:any,index:number)=>{const angle=index/Math.max(1,rows.length)*Math.PI*2-Math.PI/2,radius=base+gain*clamp(num(h?.amplitude))+26*carry;return polar(angle,radius)});
 const invariantPath=membrane(sourceHarmonics,55,46,evolution.carry.invariant);
 const residualPath=membrane(authorityHarmonics,45,38,evolution.carry.residual);
 const countStates=(rows:R158UniverseNode[])=>rows.reduce((acc:Record<string,number>,row)=>{acc[row.state]=(acc[row.state]||0)+1;return acc},{});
 return{
  schema:R158_SCHEMA,revision:R158_REVISION,address:a,stateId:record.stateId,nextStateId:evolution.canonicalNextStateId,record,evolution,convergence,
  modes,canon,families,completion,routes,resolution:R156_RESOLUTION_LADDER,invariantPath,residualPath,
  counts:{sourceModes:modes.length,canonAuthorities:canon.length,currentCapabilityFamilies:families.length,completionFamilies:completion.length,routes:routes.length,resolutionFrames:R156_RESOLUTION_LADDER.length,exactExecuted:evolution.allModes.exactExecuted,exactSourcePacket:evolution.allModes.sourcePacket,exactGated:evolution.allModes.gated},
  states:{source:countStates(modes),canon:countStates(canon),families:countStates(families),completion:countStates(completion)},
  viewLaw:R158_VIEW_LAW,truthBoundary:R158_TRUTH_BOUNDARY
 };
}
