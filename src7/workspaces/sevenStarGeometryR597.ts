export type SevenStarPoint={x:number;y:number;radius:number;angle:number};
export type SevenStarFrame={nodes:SevenStarPoint[];edgeLengths:number[];perimeter:number;centroid:{x:number;y:number};rotation:number;address:number;asymmetry:number};
const TAU=2*Math.PI;
export const normalizeSevenStarAddress=(address:number)=>Math.max(0,Math.min(20735,Number.isFinite(address)?Math.floor(address):0));
export const normalizeSevenStarAngle=(degrees:number)=>((Number.isFinite(degrees)?degrees:0)%360+360)%360;
export function sevenStarFrame(address:number,degrees:number,asymmetry:number):SevenStarFrame{
 const a=normalizeSevenStarAddress(address),rotation=normalizeSevenStarAngle(degrees);
 const skew=Math.max(0,Math.min(1,Number.isFinite(asymmetry)?asymmetry:0));
 // 20,736 addresses are representation indices, not physical spatial dimensions.
 // The 144-cell address band modulates a bounded radial envelope while preserving 7-node topology.
 const band=(a%144)/143,theta=rotation*Math.PI/180;
 const nodes=Array.from({length:7},(_,i)=>{
  const angle=i*TAU/7-Math.PI/2+theta;
  const radial=135+skew*(18*Math.sin(i*TAU/7+theta)+12*(band-.5)*Math.cos(2*i*TAU/7-theta));
  return{x:210+radial*Math.cos(angle),y:210+radial*Math.sin(angle),radius:radial,angle};
 });
 const edgeLengths=nodes.map((p,i)=>Math.hypot(p.x-nodes[(i+1)%7].x,p.y-nodes[(i+1)%7].y));
 const centroid={x:nodes.reduce((s,p)=>s+p.x,0)/7,y:nodes.reduce((s,p)=>s+p.y,0)/7};
 return{nodes,edgeLengths,perimeter:edgeLengths.reduce((s,x)=>s+x,0),centroid,rotation,address:a,asymmetry:skew};
}
export function sevenStarAddressStep(address:number,node:number){
 const a=normalizeSevenStarAddress(address),step=(Math.max(1,Math.min(7,Math.floor(node)))*144);
 return(a+step)%20736;
}
