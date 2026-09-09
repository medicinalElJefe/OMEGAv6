function unwrapLon(value,reference){
  let x=Number(value),r=Number(reference);
  while(x-r>180)x-=360;
  while(x-r<-180)x+=360;
  return x;
}

function wrapLon(value){
  let x=Number(value);
  while(x>180)x-=360;
  while(x<-180)x+=360;
  return x;
}

function barycentricPixel(a,b,c,pixel,line){
  const ax=a.pixel,ay=a.line,bx=b.pixel,by=b.line,cx=c.pixel,cy=c.line;
  const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
  if(Math.abs(det)<1e-9)return null;
  const w1=((by-cy)*(pixel-cx)+(cx-bx)*(line-cy))/det;
  const w2=((cy-ay)*(pixel-cx)+(ax-cx)*(line-cy))/det;
  const w3=1-w1-w2;
  if(Math.min(w1,w2,w3)<-0.025||Math.max(w1,w2,w3)>1.025)return null;
  const span=Math.max(
    Math.hypot(ax-bx,ay-by),Math.hypot(ax-cx,ay-cy),Math.hypot(bx-cx,by-cy)
  );
  const ref=a.longitude;
  const lon=wrapLon(w1*unwrapLon(a.longitude,ref)+w2*unwrapLon(b.longitude,ref)+w3*unwrapLon(c.longitude,ref));
  const lat=w1*a.latitude+w2*b.latitude+w3*c.latitude;
  return {lon,lat,weights:[w1,w2,w3],gcpSpanPixels:span,corners:[a,b,c]};
}

export function pixelToEarth(product,pixel,line){
  pixel=Number(pixel);line=Number(line);
  const points=(product?.points||[]).filter(p=>[p.pixel,p.line,p.longitude,p.latitude].every(Number.isFinite));
  if(points.length<3)return {state:'PIXEL_GEOLOCATION_UNRESOLVED',reason:`Product geolocation grid has ${points.length} valid point(s)`};
  let exact=null;
  for(const p of points){
    const d=Math.hypot(p.pixel-pixel,p.line-line);
    if(d<1e-7){exact=p;break;}
  }
  if(exact)return {state:'PIXEL_GEOLOCATED_EXACT_GCP',lon:exact.longitude,lat:exact.latitude,gcpSpanPixels:0,corners:[exact]};
  const nearby=points.map(point=>({point,distance:Math.hypot(point.pixel-pixel,point.line-line)})).sort((a,b)=>a.distance-b.distance).slice(0,16);
  let best=null;
  for(let i=0;i<nearby.length-2;i++)for(let j=i+1;j<nearby.length-1;j++)for(let k=j+1;k<nearby.length;k++){
    const candidate=barycentricPixel(nearby[i].point,nearby[j].point,nearby[k].point,pixel,line);
    if(candidate&&(!best||candidate.gcpSpanPixels<best.gcpSpanPixels))best=candidate;
  }
  if(best)return {state:'PIXEL_GEOLOCATED_LOCAL_GCP_TRIANGLE',...best};
  const nearest=nearby[0];
  if(nearest&&nearest.distance<64)return {state:'PIXEL_GEOLOCATED_NEAREST_GCP',lon:nearest.point.longitude,lat:nearest.point.latitude,gcpDistancePixels:nearest.distance,corners:[nearest.point]};
  return {state:'PIXEL_GEOLOCATION_UNRESOLVED',reason:'Patch point lies outside local product GCP support',nearestDistancePixels:nearest?.distance??null};
}

export function buildPatchGeoMesh(product,sourceWindow,segments=4){
  if(!Array.isArray(sourceWindow)||sourceWindow.length!==4)throw new Error('sourceWindow must be [x0,y0,x1,y1]');
  const [x0,y0,x1,y1]=sourceWindow.map(Number);
  const n=Math.max(1,Math.min(12,Math.round(segments)||4));
  const nodes=[];
  let valid=0,maxSpan=0;
  for(let gy=0;gy<=n;gy++){
    const row=[];
    const line=y0+(y1-1-y0)*(gy/n);
    for(let gx=0;gx<=n;gx++){
      const pixel=x0+(x1-1-x0)*(gx/n);
      const geo=pixelToEarth(product,pixel,line);
      const node={gx,gy,pixel,line,...geo};
      if(Number.isFinite(node.lon)&&Number.isFinite(node.lat)){valid++;maxSpan=Math.max(maxSpan,Number(node.gcpSpanPixels)||0);}
      row.push(node);
    }
    nodes.push(row);
  }
  return {
    state:valid===(n+1)*(n+1)?'PATCH_GEOREGISTERED_GCP_MESH':'PATCH_GEOREGISTRATION_PARTIAL',
    segments:n,sourceWindow:[x0,y0,x1,y1],nodes,validNodeCount:valid,totalNodeCount:(n+1)*(n+1),maxGcpSpanPixels:maxSpan,
    semantics:'Piecewise-linear product-GCP geolocation mesh for display registration of the measured patch. The mesh does not alter SAR values.'
  };
}
