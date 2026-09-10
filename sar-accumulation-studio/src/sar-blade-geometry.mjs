const EARTH_RADIUS_M=6378137;
const EPS=1e-12;

const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));

export function triangleAffine(source,dest){
  if(!Array.isArray(source)||source.length!==3||!Array.isArray(dest)||dest.length!==3)return null;
  const [[x0,y0],[x1,y1],[x2,y2]]=source,[[u0,v0],[u1,v1],[u2,v2]]=dest;
  if(![x0,y0,x1,y1,x2,y2,u0,v0,u1,v1,u2,v2].every(finite))return null;
  const den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);
  if(Math.abs(den)<EPS)return null;
  return {
    a:(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/den,
    c:(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/den,
    e:(u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/den,
    b:(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/den,
    d:(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/den,
    f:(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/den
  };
}

export function drawWarpTriangle(ctx,image,source,dest,{alpha=1,filter='none'}={}){
  const t=triangleAffine(source,dest);if(!t||!ctx||!image)return false;
  ctx.save();ctx.beginPath();ctx.moveTo(...dest[0]);ctx.lineTo(...dest[1]);ctx.lineTo(...dest[2]);ctx.closePath();ctx.clip();
  ctx.globalAlpha=clamp(alpha,0,1);ctx.filter=filter;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.transform(t.a,t.b,t.c,t.d,t.e,t.f);ctx.drawImage(image,0,0);ctx.restore();return true;
}

export function sourcePointForNode(node,sourceWindow,imageWidth,imageHeight){
  if(!node||!Array.isArray(sourceWindow)||sourceWindow.length!==4)return null;
  const [x0,y0,x1,y1]=sourceWindow.map(Number),spanX=Math.max(1,x1-x0-1),spanY=Math.max(1,y1-y0-1);
  if(![x0,y0,x1,y1,node.pixel,node.line,imageWidth,imageHeight].every(finite))return null;
  return [
    (Number(node.pixel)-x0)/spanX*Math.max(1,Number(imageWidth)-1),
    (Number(node.line)-y0)/spanY*Math.max(1,Number(imageHeight)-1)
  ];
}

export function drawMeshCellByBlades(ctx,image,sourceWindow,nodes,dest,{alpha=1,filter='none'}={}){
  if(!Array.isArray(nodes)||nodes.length!==4||!Array.isArray(dest)||dest.length!==4)return false;
  const [q00,q10,q01,q11]=nodes,[d00,d10,d01,d11]=dest;
  const imageWidth=Number(image.naturalWidth||image.videoWidth||image.width),imageHeight=Number(image.naturalHeight||image.videoHeight||image.height);
  const s00=sourcePointForNode(q00,sourceWindow,imageWidth,imageHeight),s10=sourcePointForNode(q10,sourceWindow,imageWidth,imageHeight),s01=sourcePointForNode(q01,sourceWindow,imageWidth,imageHeight),s11=sourcePointForNode(q11,sourceWindow,imageWidth,imageHeight);
  if(![s00,s10,s01,s11,...dest].every(p=>Array.isArray(p)&&p.every(finite)))return false;
  const a=drawWarpTriangle(ctx,image,[s00,s10,s11],[d00,d10,d11],{alpha,filter});
  const b=drawWarpTriangle(ctx,image,[s00,s11,s01],[d00,d11,d01],{alpha,filter});
  return a||b;
}

function unwrapLon(value,reference){let x=Number(value),r=Number(reference);while(x-r>180)x-=360;while(x-r<-180)x+=360;return x;}
function metersFromDelta(dLonDeg,dLatDeg,latDeg){const rad=Math.PI/180;return [EARTH_RADIUS_M*Math.cos(Number(latDeg)*rad)*Number(dLonDeg)*rad,EARTH_RADIUS_M*Number(dLatDeg)*rad];}
function inv2(a,b,c,d){const det=a*d-b*c;if(Math.abs(det)<EPS)return null;return {a:d/det,b:-b/det,c:-c/det,d:a/det,det};}

function nearestMeshNode(mesh,target){
  const nodes=[];for(const row of mesh?.nodes||[])for(const node of row||[])if(finite(node?.lon)&&finite(node?.lat)&&finite(node?.pixel)&&finite(node?.line))nodes.push(node);
  if(!nodes.length)return null;
  const lon=finite(target?.lon)?Number(target.lon):nodes[Math.floor(nodes.length/2)].lon,lat=finite(target?.lat)?Number(target.lat):nodes[Math.floor(nodes.length/2)].lat;
  return nodes.reduce((best,node)=>{const dx=(unwrapLon(node.lon,lon)-lon)*Math.cos(lat*Math.PI/180),dy=node.lat-lat,d=dx*dx+dy*dy;return !best||d<best.d?{node,d}:best;},null)?.node||null;
}

function localNeighbors(mesh,center){
  let found=null;
  for(let gy=0;gy<(mesh?.nodes||[]).length;gy++)for(let gx=0;gx<(mesh.nodes[gy]||[]).length;gx++)if(mesh.nodes[gy][gx]===center)found={gx,gy};
  if(!found)return null;
  const row=mesh.nodes[found.gy],left=row?.[Math.max(0,found.gx-1)],right=row?.[Math.min(row.length-1,found.gx+1)],up=mesh.nodes[Math.max(0,found.gy-1)]?.[found.gx],down=mesh.nodes[Math.min(mesh.nodes.length-1,found.gy+1)]?.[found.gx];
  if(![left,right,up,down].every(n=>finite(n?.lon)&&finite(n?.lat)&&finite(n?.pixel)&&finite(n?.line)))return null;
  return {left,right,up,down};
}

function derivative(a,b,axis,lat){
  const delta=Number(b[axis])-Number(a[axis]);if(Math.abs(delta)<EPS)return null;
  const dLon=unwrapLon(b.lon,a.lon)-Number(a.lon),dLat=Number(b.lat)-Number(a.lat),[east,north]=metersFromDelta(dLon,dLat,lat);
  return [east/delta,north/delta];
}

function singularValues2x2(a,b,c,d){
  const s11=a*a+c*c,s12=a*b+c*d,s22=b*b+d*d,tr=s11+s22,disc=Math.sqrt(Math.max(0,(s11-s22)*(s11-s22)+4*s12*s12));
  return [Math.sqrt(Math.max(0,(tr+disc)/2)),Math.sqrt(Math.max(0,(tr-disc)/2))];
}

export function analyzeBladeLens(mesh,target=null){
  const center=nearestMeshNode(mesh,target),n=localNeighbors(mesh,center);if(!center||!n)return {state:'BLADE_LENS_UNRESOLVED',reason:'Insufficient registered mesh support'};
  const lat=Number(center.lat),dp=derivative(n.left,n.right,'pixel',lat),dl=derivative(n.up,n.down,'line',lat);if(!dp||!dl)return {state:'BLADE_LENS_UNRESOLVED',reason:'Degenerate local mesh'};
  const J={eastPerPixel:dp[0],eastPerLine:dl[0],northPerPixel:dp[1],northPerLine:dl[1]};
  const inverse=inv2(J.eastPerPixel,J.eastPerLine,J.northPerPixel,J.northPerLine);if(!inverse)return {state:'BLADE_LENS_UNRESOLVED',reason:'Singular local Jacobian',center};
  const [major,minor]=singularValues2x2(J.eastPerPixel,J.eastPerLine,J.northPerPixel,J.northPerLine),condition=minor>EPS?major/minor:Infinity;
  const pixelAxisDeg=Math.atan2(J.northPerPixel,J.eastPerPixel)*180/Math.PI,lineAxisDeg=Math.atan2(J.northPerLine,J.eastPerLine)*180/Math.PI;
  const result={
    state:'BLADE_LENS_READY',center:{pixel:center.pixel,line:center.line,lon:center.lon,lat:center.lat},jacobianMetersPerSource:J,
    inverseSourcePerMeter:{pixelPerEast:inverse.a,pixelPerNorth:inverse.b,linePerEast:inverse.c,linePerNorth:inverse.d},
    determinantMeters2PerSourceCell:inverse.det,principalMetersPerPixel:{major,minor},conditionNumber:condition,pixelAxisDeg,lineAxisDeg,
    semantics:'Local differential lens from the registered SAR source grid. Forward Jacobian maps source-pixel motion to Earth ENU meters; inverse Jacobian reverse-computes focused source coordinates from local Earth offsets.'
  };
  globalThis.OMEGA_SAR_BLADE_LENS=result;return result;
}

export function reverseFocusOffset(lens,eastMeters,northMeters){
  if(lens?.state!=='BLADE_LENS_READY'||![eastMeters,northMeters].every(finite))return null;
  const I=lens.inverseSourcePerMeter;
  return {
    pixel:lens.center.pixel+I.pixelPerEast*Number(eastMeters)+I.pixelPerNorth*Number(northMeters),
    line:lens.center.line+I.linePerEast*Number(eastMeters)+I.linePerNorth*Number(northMeters)
  };
}
