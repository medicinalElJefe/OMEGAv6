// R742: donor-derived four-axis traversal operators. Model-space only.
export const PI_ATLAS_COUNT_R742=20736;
const STRIDES=[1728,144,12,1];
export function decodePiAddressR742(address){
 if(!Number.isSafeInteger(address)||address<0||address>=20736)throw Error('R742 address outside 0..20735');
 return STRIDES.map(s=>Math.floor(address/s)%12);
}
export function encodePiAddressR742(digits){
 if(!Array.isArray(digits)||digits.length!==4||digits.some(d=>!Number.isSafeInteger(d)||d<0||d>=12))throw Error('R742 four base-12 digits required');
 return digits.reduce((n,d)=>n*12+d,0);
}
export function piAxisNeighborsR742(address){
 const digits=decodePiAddressR742(address),out=[];
 for(let axis=0;axis<4;axis++){
  const plus=[...digits],minus=[...digits];
  plus[axis]=(plus[axis]+1)%12;minus[axis]=(minus[axis]+11)%12;
  out.push(encodePiAddressR742(plus),encodePiAddressR742(minus));
 }
 return out;
}
export function piAtlasPositionR742(address,metrics=[0.5,0.5,0.5]){
 const digits=decodePiAddressR742(address);
 if(!Array.isArray(metrics)||metrics.length!==3||metrics.some(x=>!Number.isFinite(x)))throw Error('R742 finite metric triple required');
 const [po,pf,px,pt]=digits.map(v=>(v+0.5)*Math.PI/6);
 const [continuity,dewey,weakest]=metrics,major=18+6*Math.cos(pf);
 let x=major*Math.cos(po),y=major*Math.sin(po),z=8*Math.sin(pf);
 x+=2*Math.cos(po+px)*(0.6+continuity);
 y+=2*Math.sin(po+px)*(0.6+continuity);
 z+=2*Math.sin(px);
 const local=0.65*(0.5+dewey);
 x+=local*Math.cos(po+pf+px+pt);
 y+=local*Math.sin(po+pf+px+pt);
 z+=local*(2*weakest-1);
 return [Math.fround(x),Math.fround(y),Math.fround(z)];
}
// A reproducible axis-only witness, not donor-weighted A*. At most 24 moves.
export function piAxisWitnessR742(from,to){
 const a=decodePiAddressR742(from),b=decodePiAddressR742(to),path=[from],axes=[];
 for(let axis=0;axis<4;axis++){
  const forward=(b[axis]-a[axis]+12)%12,reverse=(a[axis]-b[axis]+12)%12;
  const sign=forward<=reverse?1:-1,steps=Math.min(forward,reverse);
  for(let k=0;k<steps;k++){
   a[axis]=(a[axis]+sign+12)%12;
   path.push(encodePiAddressR742(a));
   axes.push({axis,direction:sign});
  }
 }
 return {schema:'omega.r742.axis-witness.v1',from,to,path,axes,steps:axes.length,donorWeighted:false,physicalMeasurement:false};
}
export function verifyPiAxisWitnessR742(raw){
 if(typeof raw!=='string'||raw.length>16384)throw Error('R742 witness size refused');
 let value;try{value=JSON.parse(raw)}catch{throw Error('R742 invalid JSON')}
 if(!value||value.schema!=='omega.r742.axis-witness.v1')throw Error('R742 schema refused');
 const expected=piAxisWitnessR742(value.from,value.to);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R742 witness differs from recomputed route');
 return expected;
}
