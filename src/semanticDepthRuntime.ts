import type {Mandala20736Field,FieldLens} from './mandala20736Runtime';
import {mandalaLensWeight} from './mandala20736Runtime';

export const DEPTH_LEVELS=[
  {id:'DOMAIN',label:'12',title:'Domain shell',count:12,groupSize:1728,boundary:'Top-domain shell. Each visible node aggregates 1,728 layer-qualified states.'},
  {id:'PHASE',label:'144',title:'Domain × phase',count:144,groupSize:144,boundary:'144 base sequences. Each node aggregates 144 regulation/layer states.'},
  {id:'REGULATION',label:'1,728',title:'Domain × phase × regulation',count:1728,groupSize:12,boundary:'Regulated atlas. Each node aggregates its 12 layer-qualified states.'},
  {id:'LAYER',label:'20,736',title:'Full state membrane',count:20736,groupSize:1,boundary:'Complete representational state membrane. One point = one D/P/R/L address.'}
] as const;
export type DepthLevelIndex=0|1|2|3;
export type DepthNode={index:number;start:number;end:number;address:number;x:number;y:number;z:number;weight:number;C:number;Phi:number;q:number;Lambda:number;motion:number;evidence:number};

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export function groupForAddress(address:number,level:DepthLevelIndex){const spec=DEPTH_LEVELS[level],i=Math.max(0,Math.min(spec.count-1,Math.floor(address/spec.groupSize)));return{index:i,start:i*spec.groupSize,end:Math.min(20736,(i+1)*spec.groupSize)-1}}
export function addressForGroup(index:number,level:DepthLevelIndex,currentAddress:number){const spec=DEPTH_LEVELS[level],start=Math.max(0,Math.min(spec.count-1,index))*spec.groupSize,end=Math.min(20735,start+spec.groupSize-1);return Math.max(start,Math.min(end,currentAddress))}
export function compileDepthNodes(field:Mandala20736Field,level:DepthLevelIndex,lens:FieldLens){const spec=DEPTH_LEVELS[level],nodes:DepthNode[]=new Array(spec.count);for(let gi=0;gi<spec.count;gi++){const start=gi*spec.groupSize,end=Math.min(field.count,start+spec.groupSize);let x=0,y=0,z=0,w=0,C=0,Phi=0,q=0,Lambda=0,motion=0,evidence=0,n=0;const stride=Math.max(1,Math.floor(spec.groupSize/48));for(let a=start;a<end;a+=stride){const lw=mandalaLensWeight(field,a,lens),k=.25+.75*lw;x+=field.x[a]*k;y+=field.y[a]*k;z+=field.z[a]*k;w+=lw;C+=field.C[a];Phi+=field.Phi[a];q+=field.q[a];Lambda+=field.Lambda[a];motion+=field.motion[a];evidence+=field.evidence[a];n++}const d=Math.max(1,n);nodes[gi]={index:gi,start,end:end-1,address:start+Math.floor((end-start)/2),x:x/d,y:y/d,z:z/d,weight:cl(w/d),C:C/d,Phi:Phi/d,q:q/d,Lambda:Lambda/d,motion:motion/d,evidence:evidence/d}}return nodes}
export function semanticBreadcrumb(address:number){const d=Math.floor(address/1728),p=Math.floor((address%1728)/144),r=Math.floor((address%144)/12),l=address%12;return{d,p,r,l,label:`D${d+1} / P${p+1} / R${r+1} / L${l+1}`}}
export function depthTruthBoundary(){return 'Semantic zoom changes representational resolution, not physical scale. 12/144/1,728/20,736 are nested OMEGA address tiers. 145,152 Seven-Star and 61,917,364,224 capacity remain separate domain-specific/compressed address layers and are not fabricated as measured physical dimensions.'}
