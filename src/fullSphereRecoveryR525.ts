import {exactAtlasAddressV3,verifyExactAtlasAddressV3} from './system/omegaExactCanonV3';

export const R525_SPHERE_SCHEMA='OMEGA_FULL_SPHERE_ARCHIVE_GRAMMAR_R525' as const;
export const R525_ARCHIVE_FAMILY='AG-008' as const;
export type R525TimeLens='HISTORY'|'NOW'|'FORECAST';
export type R525FieldLens='CONTINUITY'|'SCAR'|'CONTRADICTION'|'FOLD';
type V3=readonly [number,number,number];
const phi=(1+Math.sqrt(5))/2;
const inv=1/phi;
const vertices:V3[]=[];
for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])vertices.push([x,y,z]);
for(const y of [-inv,inv])for(const z of [-phi,phi])vertices.push([0,y,z]);
for(const x of [-inv,inv])for(const y of [-phi,phi])vertices.push([x,y,0]);
for(const x of [-phi,phi])for(const z of [-inv,inv])vertices.push([x,0,z]);
const d2=(a:V3,b:V3)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
const minEdge2=(2/phi)**2;
export const R525_DODECA_VERTICES=Object.freeze(vertices.map(v=>Object.freeze(v))) as readonly V3[];
export const R525_DODECA_EDGES=Object.freeze(vertices.flatMap((v,i)=>vertices.flatMap((w,j)=>j>i&&Math.abs(d2(v,w)-minEdge2)<1e-6?[[i,j] as const]:[])));
export const R525_ARCHIVE_GRAMMAR=Object.freeze({
 archivalVisuals:'AG-008: binary lens/folds; history/NOW/forecast; antipode; precession; nested dodecahedral projections',
 recoveredNow:['three nested mathematically constructed dodecahedral shells','exact R406 canonical antipode','address-derived frame selection','explicit lens/fold controls','bounded model-route forecast preview'],
 stillMissing:['original historical motion equations and camera parameters','original full sphere video pixel/phase fidelity','historical observed timeline','astronomical precession/orbital ephemerides'],
 truthBoundary:'Source-backed dodecahedron is an observer-facing projection, not a physical primitive or reconstructed historical simulation. HISTORY is adjacent address topology, not historical observations. FORECAST is model autoPing preview, not future empirical evidence.'
});
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(x)?x:min));
export function selectSphereAddressR525(address:number,time:R525TimeLens,forecastNext:number){
 const a=clamp(Math.floor(address),0,20735);
 return time==='NOW'?a:time==='HISTORY'?(a+20735)%20736:clamp(Math.floor(forecastNext),0,20735);
}
export function fullSphereProjectionR525(input:{
 address:number;continuity:number;plasticity:number;scar:number;contradiction:number;
 yaw:number;fold:number;lens:R525FieldLens
}){
 const address=Math.max(0,Math.min(20735,Math.floor(input.address)));
 const exact=exactAtlasAddressV3(address);
 if(!verifyExactAtlasAddressV3(exact))throw new Error('R525 exact address proof failed');
 const {D_domain,P_phase,R_reg,L_lens}=exact.coordinate;
 const yaw=clamp(input.yaw,-180,180)*Math.PI/180+(P_phase-1)*Math.PI/72;
 const pitch=(D_domain-6.5)*Math.PI/90;
 const fold=clamp(input.fold,0,1);
 const C=clamp(input.continuity,0,1),P=clamp(input.plasticity,0,1),scar=clamp(input.scar,0,1),q=clamp(input.contradiction,0,1);
 const amplitude=input.lens==='CONTINUITY'?C:input.lens==='SCAR'?scar:input.lens==='CONTRADICTION'?q:fold;
 const deformation=fold*(.12+.16*q);
 const cosP=Math.cos(pitch),sinP=Math.sin(pitch);
 const shells=[.98,.69,.41].map((size,k)=>{
  const points=R525_DODECA_VERTICES.map(([x,y,z],i)=>{
   const phase=(R_reg-1)*Math.PI/36+(L_lens-1)*Math.PI/72+k*.2;
   const spin=yaw+k*(.25+fold*.45)+phase;
   const cy=Math.cos(spin),sy=Math.sin(spin);
   const rx=x*cy-z*sy,rz=x*sy+z*cy,ry=y;
   const foldWeight=1+deformation*Math.sin((i+1)*Math.PI/10+phase);
   const yy=ry*cosP-rz*sinP,zz=ry*sinP+rz*cosP;
   const perspective=3.3/(3.3-zz*.22);
   return{index:i,x:Number((480+rx*size*237*foldWeight*perspective).toFixed(4)),y:Number((310+yy*size*237*foldWeight*perspective).toFixed(4)),z:zz};
  });
  return{shell:k,points,edges:R525_DODECA_EDGES,opacity:Number(((.26+.58*amplitude)*(1-k*.21)).toFixed(3)),weight:Number((.9+1.9*C-(k*.21)).toFixed(3))};
 });
 return Object.freeze({
  schema:R525_SPHERE_SCHEMA,address,index0:exact.index0,antipodeIndex0:exact.antipodeIndex0,
  exactCoordinate:exact.coordinate,antipodeCoordinate:exact.antipodeCoordinate,
  physicalDimensionsClaimed:false as const,observationClaimed:false as const,canonicalMutation:false as const,
  lens:input.lens,fold,amplitude,continuity:C,plasticity:P,scar,contradiction:q,shells,
  source:'R406 exact Full Sphere + R525 AG-008 typed projection',
  proof:'DETERMINISTIC_MODEL_PROJECTION_NOT_HISTORICAL_PIXEL_EQUIVALENCE'
 });
}
