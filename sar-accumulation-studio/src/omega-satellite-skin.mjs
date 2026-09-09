const clamp01=v=>Math.max(0,Math.min(1,Number(v)));
const finite=v=>Number.isFinite(Number(v));

function solveLinearSystem(A,b){
  const n=b.length,M=A.map((row,i)=>[...row,b[i]]);
  for(let col=0;col<n;col++){
    let pivot=col;for(let r=col+1;r<n;r++)if(Math.abs(M[r][col])>Math.abs(M[pivot][col]))pivot=r;
    if(Math.abs(M[pivot][col])<1e-10)return null;
    [M[col],M[pivot]]=[M[pivot],M[col]];
    const div=M[col][col];for(let j=col;j<=n;j++)M[col][j]/=div;
    for(let r=0;r<n;r++)if(r!==col){const f=M[r][col];for(let j=col;j<=n;j++)M[r][j]-=f*M[col][j];}
  }
  return M.map(row=>row[n]);
}

export function captureSatelliteContext(image,meta={}){
  if(!image||!image.naturalWidth||!image.naturalHeight)return null;
  const width=Math.min(1024,image.naturalWidth),height=Math.max(1,Math.round(image.naturalHeight*(width/image.naturalWidth)));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,width,height);
  const data=ctx.getImageData(0,0,width,height).data;
  const bbox=Array.isArray(meta?.bbox)&&meta.bbox.length===4?meta.bbox.map(Number):[-180,-90,180,90];
  return {schema:'omega.realtime.satellite-context.v1',width,height,bbox,data,date:meta?.date||null,layers:meta?.layers||[],sourceUrl:meta?.sourceUrl||null,measurement:false,authority:'NASA EOSDIS GIBS'};
}

export function satelliteFeatures(context,lon,lat){
  if(!context?.data||!Array.isArray(context.bbox))return null;
  const [minLon,minLat,maxLon,maxLat]=context.bbox;
  if(lon<minLon||lon>maxLon||lat<minLat||lat>maxLat||maxLon<=minLon||maxLat<=minLat)return null;
  const x=Math.max(0,Math.min(context.width-1,Math.floor((lon-minLon)/(maxLon-minLon)*context.width)));
  const y=Math.max(0,Math.min(context.height-1,Math.floor((maxLat-lat)/(maxLat-minLat)*context.height)));
  const idx=(y*context.width+x)*4,r=context.data[idx]/255,g=context.data[idx+1]/255,b=context.data[idx+2]/255,a=context.data[idx+3]/255;
  if(a<.25)return null;
  const brightness=.2126*r+.7152*g+.0722*b;
  const rg=(r-g)/(r+g+1e-6),gb=(g-b)/(g+b+1e-6),rb=(r-b)/(r+b+1e-6);
  let texture=0,count=0;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const xx=Math.max(0,Math.min(context.width-1,x+dx)),yy=Math.max(0,Math.min(context.height-1,y+dy)),j=(yy*context.width+xx)*4;
    if(context.data[j+3]<64)continue;
    const q=.2126*(context.data[j]/255)+.7152*(context.data[j+1]/255)+.0722*(context.data[j+2]/255);texture+=Math.abs(q-brightness);count++;
  }
  texture=count?texture/count:0;
  return {x,y,r,g,b,brightness,rg,gb,rb,texture,vector:[1,brightness,rg,gb,texture]};
}

export function fitSatelliteToSar(anchors,context,{ridge=0.08}={}){
  const rows=[];
  for(const a of anchors||[]){
    if(a?.measured===false||!finite(a?.value)||!finite(a?.lon)||!finite(a?.lat))continue;
    const f=satelliteFeatures(context,Number(a.lon),Number(a.lat));if(!f)continue;
    rows.push({features:f.vector,value:Number(a.value),id:a.id||null});
  }
  if(rows.length<5)return {state:'SATELLITE_SAR_FIT_UNRESOLVED',confidence:0,support:rows.length};
  const p=rows[0].features.length,A=Array.from({length:p},()=>Array(p).fill(0)),b=Array(p).fill(0);
  for(const row of rows)for(let i=0;i<p;i++){b[i]+=row.features[i]*row.value;for(let j=0;j<p;j++)A[i][j]+=row.features[i]*row.features[j];}
  for(let i=1;i<p;i++)A[i][i]+=ridge*rows.length;
  const coeff=solveLinearSystem(A,b);if(!coeff)return {state:'SATELLITE_SAR_FIT_UNRESOLVED',confidence:0,support:rows.length};
  const actual=rows.map(r=>r.value),mean=actual.reduce((s,v)=>s+v,0)/actual.length,pred=rows.map(r=>r.features.reduce((s,v,i)=>s+v*coeff[i],0));
  const ssTot=actual.reduce((s,v)=>s+(v-mean)**2,0),ssRes=actual.reduce((s,v,i)=>s+(v-pred[i])**2,0),rmse=Math.sqrt(ssRes/actual.length),r2=ssTot>0?1-ssRes/ssTot:0;
  const spread=Math.max(1e-6,Math.sqrt(ssTot/actual.length));
  const support=1-Math.exp(-rows.length/12),quality=clamp01(Math.max(0,r2))*clamp01(1-rmse/(spread*2.5));
  return {state:'SATELLITE_SAR_FIT_READY',coeff,rmse,r2,support:rows.length,confidence:clamp01(support*(.25+.75*quality)),contextDate:context.date,layers:context.layers};
}

export function predictSarFromSatellite(context,fit,lon,lat){
  if(fit?.state!=='SATELLITE_SAR_FIT_READY')return null;
  const f=satelliteFeatures(context,lon,lat);if(!f)return null;
  const value=f.vector.reduce((s,v,i)=>s+v*fit.coeff[i],0);
  return {value,confidence:fit.confidence,uncertainty:Math.max(.8,fit.rmse||2),features:f,fit};
}
