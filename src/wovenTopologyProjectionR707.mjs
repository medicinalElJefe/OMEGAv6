import {replayScenarioR706} from './relationalScenarioWorkbenchR706.mjs';

// R707 is a deterministic, source-model SVG topology projection of the R706/R623/R651/R653
// executor. It is not the historical AG-009 original SVG or a new CanonState writer.
const round=n=>Math.round(n*100)/100;
const point=(x,y)=>({x:round(x),y:round(y)});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const styles=Object.freeze({
 INGRESS:{stroke:'#49b8a5',dash:''},
 EGRESS:{stroke:'#e3b15c',dash:''},
 BLOCKED:{stroke:'#dc6670',dash:'7 5'},
 RESIDUE:{stroke:'#a19bdf',dash:'2 5'},
 RETURN:{stroke:'#68a9e8',dash:''}
});
const format=n=>Number(n).toFixed(4);
function cycleCount(nodes,edges){
 const adjacency=new Map(nodes.map(n=>[n.id,[]]));
 for(const e of edges)if(e.kind!=='BLOCKED')adjacency.get(e.from).push(e.to);
 const color=new Map(),cycles=new Set();
 const visit=(id,stack)=>{
  color.set(id,1);stack.push(id);
  for(const next of adjacency.get(id)){
   if(color.get(next)===1)cycles.add(stack.slice(stack.indexOf(next)).join('>')+'>'+next);
   else if(!color.get(next))visit(next,stack);
  }
  stack.pop();color.set(id,2);
 };
 for(const n of nodes)if(!color.get(n.id))visit(n.id,[]);
 return cycles.size;
}
export function projectWovenTopologyR707(input,frameIndex=0,mirrored=false){
 if(typeof mirrored!=='boolean')throw Error('R707 mirror must be boolean');
 const replay=replayScenarioR706(input);
 const {scenario,canonicalHistory}=replay;
 if(!Number.isInteger(frameIndex)||frameIndex<0||frameIndex>=scenario.edgeFrames.length)throw Error('R707 frame out of bounds');
 const previous=canonicalHistory[frameIndex],current=canonicalHistory[frameIndex+1];
 if(!previous||!current||current.length!==scenario.nodes.length)throw Error('R707 missing computed state');
 const centerX=320,centerY=220,radius=scenario.nodes.length===1?0:Math.min(157,Math.max(110,scenario.nodes.length*19));
 const nodes=scenario.nodes.map((n,i)=>{
  const angle=-Math.PI/2+2*Math.PI*i/scenario.nodes.length;
  const base=point(centerX+radius*Math.cos(angle),centerY+radius*Math.sin(angle));
  const p=mirrored?point(640-base.x,base.y):base;
  const state=current[i],prior=previous[i];
  if(state.id!==n.id||prior.id!==n.id)throw Error('R707 canonical identity drift');
  return {id:n.id,x:p.x,y:p.y,continuity:state.continuity,scar:state.scar,contradiction:state.contradiction,
   plasticity:state.plasticity,continuityDelta:state.continuity-prior.continuity};
 });
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const edges=scenario.edgeFrames[frameIndex].map((e,i)=>{
  const a=byId.get(e.from),b=byId.get(e.to),style=styles[e.kind];
  let start,end,control,path;
  if(e.from===e.to){
   start=point(a.x+10,a.y-20);end=point(a.x-10,a.y-20);
   const c1=point(a.x+65,a.y-86),c2=point(a.x-65,a.y-86);
   control=[c1,c2];
   path='M '+start.x+' '+start.y+' C '+c1.x+' '+c1.y+' '+c2.x+' '+c2.y+' '+end.x+' '+end.y;
  }else{
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
   start=point(a.x+ux*27,a.y+uy*27);end=point(b.x-ux*27,b.y-uy*27);
   const parallel=scenario.edgeFrames[frameIndex].slice(0,i).filter(x=>x.from===e.from&&x.to===e.to).length;
   const bend=18+parallel*12;
   const c=point((start.x+end.x)/2-uy*bend,(start.y+end.y)/2+ux*bend);
   control=[c];
   path='M '+start.x+' '+start.y+' Q '+c.x+' '+c.y+' '+end.x+' '+end.y;
  }
  return {id:'edge-'+i,from:e.from,to:e.to,kind:e.kind,weight:e.weight,start,end,control,path,
   stroke:style.stroke,dash:style.dash,width:round(1.4+3*e.weight),blocked:e.kind==='BLOCKED'};
 });
 const incoming=new Map(nodes.map(n=>[n.id,new Set()]));
 for(const e of edges)if(!e.blocked)incoming.get(e.to).add(e.from);
 const topology={nodes:nodes.length,edges:edges.length,blocked:edges.filter(e=>e.blocked).length,
  returns:edges.filter(e=>e.kind==='RETURN').length,
  multiParentNodes:[...incoming.values()].filter(s=>s.size>1).length,
  directedCycles:cycleCount(nodes,edges)};
 return {schema:'OMEGA_WOVEN_TOPOLOGY_R707',truthClass:'LOCAL_COMPUTED_VECTOR_MODEL_ONLY',
  source:'R706 scenario > R623 replay > R651/R653 canonical frame',frameIndex,frames:scenario.edgeFrames.length,
  mirrored,nodes,edges,topology,
  boundary:'Derived SVG geometry; historical AG-009 operator parity, physical interpretation, CanonState admission and native device proof remain unverified.'};
}
export function exportWovenTopologySvgR707(input,frameIndex=0,mirrored=false){
 const p=projectWovenTopologyR707(input,frameIndex,mirrored);
 const lines=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" role="img" aria-label="R707 source-computed woven topology">',
  '<title>R707 typed directional continuity topology — local model only</title>',
  '<desc>'+esc(p.boundary)+'</desc>',
  '<rect width="640" height="440" fill="#0d1821"/>',
  '<defs><marker id="r707-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#e9eef1"/></marker></defs>'];
 for(const e of p.edges)lines.push('<path data-kind="'+e.kind+'" d="'+e.path+'" fill="none" stroke="'+e.stroke+'" stroke-width="'+e.width+'"'+(e.dash?' stroke-dasharray="'+e.dash+'"':'')+' marker-end="url(#r707-arrow)"><title>'+esc(e.from+' to '+e.to+' '+e.kind+' '+format(e.weight))+'</title></path>');
 for(const n of p.nodes){
  const c=Math.max(0,Math.min(1,n.continuity));
  const r=round(15+10*c);
  lines.push('<circle cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="#143d4b" stroke="#d9e9e9" stroke-width="1.5"><title>'+esc(n.id+' continuity '+format(n.continuity)+' scar '+format(n.scar)+' contradiction '+format(n.contradiction))+'</title></circle>');
  lines.push('<text x="'+n.x+'" y="'+round(n.y+4)+'" text-anchor="middle" font-size="13" fill="#fff">'+esc(n.id)+'</text>');
 }
 lines.push('<text x="16" y="422" font-size="12" fill="#b4c7cc">R707 frame '+(p.frameIndex+1)+'/'+p.frames+' · MODEL ONLY · AG-009 parity unverified</text>','</svg>');
 return lines.join('\n');
}
