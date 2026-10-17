/**
 * R598: Seven-component conservative reaction/transport laboratory.
 * Represents modeled organization, not creation of physical matter.
 * Each site holds seven free channels, seven bound channels and retained scar.
 * All internal exchanges are paired transfers; the total scalar budget is conserved.
 */
export type WovenParams={width:number;height:number;seed:number;diffusion:number;exchange:number;binding:number;unbinding:number;anisotropy:number};
export type WovenState={params:WovenParams;free:Float64Array;bound:Float64Array;scar:Float64Array;step:number;initialMass:number;lastExchange:Float64Array;lastBinding:Float64Array;lastUnbinding:Float64Array};
const N=7;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const idx=(site:number,channel:number)=>site*N+channel;
export function wovenMass(s:WovenState){let total=0;for(const a of [s.free,s.bound])for(const v of a)total+=v;return total}
export function wovenInitial(params:WovenParams):WovenState{
 const p={width:Math.floor(clamp(params.width,4,96)),height:Math.floor(clamp(params.height,4,96)),seed:Math.floor(clamp(params.seed,0,2147483647)),diffusion:clamp(params.diffusion,0,.2),exchange:clamp(params.exchange,0,.2),binding:clamp(params.binding,0,.2),unbinding:clamp(params.unbinding,0,.2),anisotropy:clamp(params.anisotropy,0,1)};
 const cells=p.width*p.height,free=new Float64Array(cells*N),bound=new Float64Array(cells*N),scar=new Float64Array(cells);
 let rng=p.seed||1;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const site=y*p.width+x,r=Math.hypot((x+.5)/p.width-.5,(y+.5)/p.height-.5);
  for(let k=0;k<N;k++){const phase=Math.cos((k*2*Math.PI/N)+(x-y)*.08);free[idx(site,k)]=(.04+.13*Math.exp(-r*r*34))*(.7+.3*random())*(1+.2*phase)}
 }
 const state={params:p,free,bound,scar,step:0,initialMass:0,lastExchange:new Float64Array(N*N),lastBinding:new Float64Array(N),lastUnbinding:new Float64Array(N)};state.initialMass=wovenMass(state);return state;
}
export function wovenAdvance(s:WovenState):WovenState{
 const{width:w,height:h,diffusion:d,exchange:e,binding:b,unbinding:u,anisotropy:a}=s.params;
 const free=s.free.slice(),bound=s.bound.slice(),scar=s.scar.slice();
 const lastExchange=new Float64Array(N*N),lastBinding=new Float64Array(N),lastUnbinding=new Float64Array(N);
 // Diffusion is pairwise conservative across periodic x/y bonds.
 const transfer=(i:number,j:number,rate:number)=>{const delta=rate*(free[i]-free[j]);free[i]-=delta;free[j]+=delta};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let k=0;k<N;k++){
  const site=y*w+x,i=idx(site,k);
  transfer(i,idx(y*w+(x+1)%w,k),d*(1+.5*a*Math.cos(k*2*Math.PI/N)));
  transfer(i,idx(((y+1)%h)*w+x,k),d*(1-.5*a*Math.cos(k*2*Math.PI/N)));
 }
 // Directed cyclic inter-system exchange; each transfer is exactly balanced.
 for(let site=0;site<w*h;site++)for(let k=0;k<N;k++){
  const from=idx(site,k),to=idx(site,(k+1)%N);
  const flux=e*free[from]*(1+a*Math.sin((k+1)*2*Math.PI/N+s.step*.07))*.5;
  free[from]-=flux;free[to]+=flux;lastExchange[k*N+(k+1)%N]+=flux;
 }
 // Binding and unbinding are explicit reservoir transfers, not sources/sinks.
 for(let site=0;site<w*h;site++){
  let activity=0;
  for(let k=0;k<N;k++){
   const i=idx(site,k),neighbor=idx(site,(k+1)%N);
   const affinity=.25+.75*free[neighbor]/(free[neighbor]+.08);
   const bind=b*affinity*free[i],release=u*bound[i];
   free[i]+=release-bind;bound[i]+=bind-release;activity+=bind;lastBinding[k]+=bind;lastUnbinding[k]+=release;
  }
  // Scar is historical evidence of cumulative binding, not extra conserved mass.
  scar[site]+=activity;
 }
 return{params:s.params,free,bound,scar,step:s.step+1,initialMass:s.initialMass,lastExchange,lastBinding,lastUnbinding};
}
export function wovenObservables(s:WovenState){
 const cells=s.params.width*s.params.height,density=new Float64Array(cells);
 let occupied=0,peak=0,boundMass=0;
 for(let site=0;site<cells;site++){
  let total=0;for(let k=0;k<N;k++){total+=s.free[idx(site,k)]+s.bound[idx(site,k)];boundMass+=s.bound[idx(site,k)]}
  density[site]=total;peak=Math.max(peak,total);if(total>.7)occupied++;
 }
 return{density,peak,occupied,boundFraction:boundMass/wovenMass(s),mass:wovenMass(s),residual:wovenMass(s)-s.initialMass};
}

export function wovenChannelLedger(s:WovenState){
 const channels=Array.from({length:N},(_,k)=>{
  let free=0,bound=0;for(let site=0;site<s.params.width*s.params.height;site++){free+=s.free[idx(site,k)];bound+=s.bound[idx(site,k)]}
  const incoming=Array.from({length:N},(_,from)=>s.lastExchange[from*N+k]).reduce((a,b)=>a+b,0);
  const outgoing=Array.from({length:N},(_,to)=>s.lastExchange[k*N+to]).reduce((a,b)=>a+b,0);
  return{channel:k+1,free,bound,total:free+bound,incoming,outgoing,binding:s.lastBinding[k],unbinding:s.lastUnbinding[k]};
 });
 const total=channels.reduce((sum,c)=>sum+c.total,0);
 return{channels,total,exchange:s.lastExchange,conservationResidual:total-s.initialMass,step:s.step};
}
