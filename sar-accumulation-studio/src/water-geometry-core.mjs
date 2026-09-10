const R=6378137;
const DEG=Math.PI/180;
const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));

export function terrariumElevation(r,g,b){return Number(r)*256+Number(g)+Number(b)/256-32768;}

export function lonLatToTile(lon,lat,z){
  const n=2**Number(z),x=(Number(lon)+180)/360*n,phi=clamp(Number(lat),-85.05112878,85.05112878)*DEG,y=(1-Math.asinh(Math.tan(phi))/Math.PI)/2*n;
  return {x,y,z:Number(z)};
}

export function tileToLonLat(x,y,z){
  const n=2**Number(z),lon=Number(x)/n*360-180,lat=Math.atan(Math.sinh(Math.PI*(1-2*Number(y)/n)))/DEG;
  return {lon,lat};
}

export function metersPerDegree(lat){return {east:R*Math.cos(Number(lat)*DEG)*DEG,north:R*DEG};}

function idx(x,y,w){return y*w+x;}
const D8=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];

export function deriveWaterGeometry(elevation,width,height,{lonSpanDeg=1,latSpanDeg=1,centerLat=0,minDropMeters=.01}={}){
  width=Math.trunc(width);height=Math.trunc(height);
  if(!(width>=3&&height>=3)||!elevation||elevation.length!==width*height)throw new Error('Water geometry requires a complete elevation grid >= 3×3');
  const m=metersPerDegree(centerLat),dx=Math.max(.01,Math.abs(Number(lonSpanDeg))*m.east/Math.max(1,width-1)),dy=Math.max(.01,Math.abs(Number(latSpanDeg))*m.north/Math.max(1,height-1));
  const flowTo=new Int32Array(width*height);flowTo.fill(-1);
  const slope=new Float32Array(width*height),aspect=new Float32Array(width*height),curvature=new Float32Array(width*height),drop=new Float32Array(width*height);
  const valid=new Uint8Array(width*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=idx(x,y,width),z=Number(elevation[i]);if(!finite(z))continue;valid[i]=1;
    const xl=Math.max(0,x-1),xr=Math.min(width-1,x+1),yu=Math.max(0,y-1),yd=Math.min(height-1,y+1),zl=Number(elevation[idx(xl,y,width)]),zr=Number(elevation[idx(xr,y,width)]),zu=Number(elevation[idx(x,yu,width)]),zd=Number(elevation[idx(x,yd,width)]);
    const dzdx=(finite(zr)&&finite(zl))?(zr-zl)/(Math.max(1,xr-xl)*dx):0,dzdy=(finite(zd)&&finite(zu))?(zd-zu)/(Math.max(1,yd-yu)*dy):0;
    slope[i]=Math.hypot(dzdx,dzdy);aspect[i]=Math.atan2(-dzdy,-dzdx);
    if([zl,zr,zu,zd].every(finite))curvature[i]=(zl+zr+zu+zd-4*z)/((dx+dy)*.5)**2;
    let best=-1,bestGrade=0,bestDrop=0;
    for(const [ox,oy] of D8){const xx=x+ox,yy=y+oy;if(xx<0||xx>=width||yy<0||yy>=height)continue;const j=idx(xx,yy,width),nz=Number(elevation[j]);if(!finite(nz))continue;const dist=Math.hypot(ox*dx,oy*dy),d=z-nz,grade=d/dist;if(d>minDropMeters&&grade>bestGrade){bestGrade=grade;best=j;bestDrop=d;}}
    flowTo[i]=best;drop[i]=bestDrop;
  }
  const indegree=new Uint16Array(width*height);for(let i=0;i<flowTo.length;i++)if(flowTo[i]>=0)indegree[flowTo[i]]++;
  const accumulation=new Float64Array(width*height);for(let i=0;i<accumulation.length;i++)accumulation[i]=valid[i]?1:0;
  const queue=[];for(let i=0;i<indegree.length;i++)if(valid[i]&&indegree[i]===0)queue.push(i);
  for(let q=0;q<queue.length;q++){const i=queue[q],j=flowTo[i];if(j>=0){accumulation[j]+=accumulation[i];if(--indegree[j]===0)queue.push(j);}}
  // Closed depressions and quantized flats remain local basins. A cell earns channel
  // conveyance only when upstream accumulation exceeds its own unit contribution.
  const wetness=new Float32Array(width*height),conveyance=new Float32Array(width*height);let maxAcc=1;
  for(const a of accumulation)if(a>maxAcc)maxAcc=a;
  const hasNetwork=maxAcc>1+1e-9,networkDen=hasNetwork?Math.log1p(maxAcc-1):1;
  for(let i=0;i<accumulation.length;i++){
    if(!valid[i])continue;const area=Math.max(1,accumulation[i])*dx*dy,sl=Math.max(1e-5,slope[i]);
    wetness[i]=Math.log(Math.max(1,area)/sl);
    const upstream=Math.max(0,accumulation[i]-1);conveyance[i]=hasNetwork?clamp(Math.log1p(upstream)/networkDen,0,1):0;
  }
  const sinks=[];for(let i=0;i<flowTo.length;i++)if(valid[i]&&flowTo[i]<0)sinks.push(i);
  return {schema:'omega.water-geometry.topographic-flow.v1',width,height,dxMeters:dx,dyMeters:dy,flowTo,slope,aspect,curvature,drop,accumulation,wetness,conveyance,sinks,maxAccumulation:maxAcc,boundary:'Terrain-derived drainage potential from DEM gradients and D8 accumulation. This is not observed water depth, discharge, flood extent, or hydraulic routing.'};
}

export function traceDrainage(geometry,startIndex,{maxSteps=4096}={}){
  if(!geometry?.flowTo)return [];const out=[],seen=new Set();let i=Number(startIndex);
  for(let step=0;step<maxSteps&&Number.isInteger(i)&&i>=0&&i<geometry.flowTo.length&&!seen.has(i);step++){
    seen.add(i);out.push(i);const next=geometry.flowTo[i];if(next<0)break;i=next;
  }
  return out;
}

export function waterGeometrySummary(geometry){
  if(!geometry)return null;let channels=0,steep=0;
  for(let i=0;i<geometry.conveyance.length;i++){if(geometry.conveyance[i]>=.62)channels++;if(geometry.slope[i]>=.18)steep++;}
  return {cells:geometry.width*geometry.height,channelPotentialCells:channels,steepCells:steep,sinks:geometry.sinks.length,maxAccumulation:geometry.maxAccumulation,dxMeters:geometry.dxMeters,dyMeters:geometry.dyMeters,boundary:geometry.boundary};
}
