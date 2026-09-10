const DEG=Math.PI/180;
const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const mix=(a,b,t)=>a+(b-a)*t;

function percentileStretch(value,low,high,gamma=.82){
  if(!finite(value)||!finite(low)||!finite(high)||high<=low)return null;
  return Math.pow(clamp((Number(value)-Number(low))/(Number(high)-Number(low)),0,1),gamma);
}

export function bilinearGrid(grid,width,height,x,y){
  if(!grid||width<1||height<1)return NaN;
  x=clamp(x,0,width-1);y=clamp(y,0,height-1);
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(width-1,x0+1),y1=Math.min(height-1,y0+1),tx=x-x0,ty=y-y0;
  const a=Number(grid[y0*width+x0]),b=Number(grid[y0*width+x1]),c=Number(grid[y1*width+x0]),d=Number(grid[y1*width+x1]);
  const values=[a,b,c,d].filter(finite);if(!values.length)return NaN;
  const fallback=values.reduce((s,v)=>s+v,0)/values.length;
  return mix(mix(finite(a)?a:fallback,finite(b)?b:fallback,tx),mix(finite(c)?c:fallback,finite(d)?d:fallback,tx),ty);
}

export function sampleTerrainField(terrain,field,lon,lat){
  if(!terrain?.bbox||!field||!terrain.width||!terrain.height)return NaN;
  const [w,s,e,n]=terrain.bbox,lonSpan=e-w,latSpan=n-s;if(!(lonSpan>0&&latSpan>0))return NaN;
  const x=(Number(lon)-w)/lonSpan*(terrain.width-1),y=(n-Number(lat))/latSpan*(terrain.height-1);
  return bilinearGrid(field,terrain.width,terrain.height,x,y);
}

function unwrapNear(lon,anchor){let x=Number(lon);while(x-anchor>180)x-=360;while(x-anchor<-180)x+=360;return x;}

export function meshGeoAtSource(mesh,pixel,line){
  if(!mesh?.nodes||!Array.isArray(mesh.sourceWindow)||mesh.sourceWindow.length!==4)return null;
  const [x0,y0,x1,y1]=mesh.sourceWindow,n=Math.max(1,Number(mesh.segments)||mesh.nodes.length-1),sx=x1-x0,sy=y1-y0;if(!(sx>0&&sy>0))return null;
  const ux=clamp((Number(pixel)-x0)/sx,0,1)*n,uy=clamp((Number(line)-y0)/sy,0,1)*n,gx=Math.min(n-1,Math.floor(ux)),gy=Math.min(n-1,Math.floor(uy)),tx=ux-gx,ty=uy-gy;
  const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>finite(q?.lon)&&finite(q?.lat)))return null;
  const anchor=Number(q00.lon),l00=anchor,l10=unwrapNear(q10.lon,anchor),l01=unwrapNear(q01.lon,anchor),l11=unwrapNear(q11.lon,anchor),lon=mix(mix(l00,l10,tx),mix(l01,l11,tx),ty),lat=mix(mix(Number(q00.lat),Number(q10.lat),tx),mix(Number(q01.lat),Number(q11.lat),tx),ty);
  return {lon:((lon+540)%360)-180,lat};
}

export function terrainLight(slope,aspect,{azimuthDeg=315,elevationDeg=43}={}){
  slope=Math.max(0,Number(slope)||0);aspect=Number(aspect)||0;
  // deriveWaterGeometry aspect points downhill. For gradient magnitude s, the upward
  // surface normal is proportional to [s*cos(aspect), s*sin(aspect), 1].
  const inv=1/Math.hypot(slope,1),nx=slope*Math.cos(aspect)*inv,ny=slope*Math.sin(aspect)*inv,nz=inv,az=Number(azimuthDeg)*DEG,el=Number(elevationDeg)*DEG,lx=Math.cos(el)*Math.cos(az),ly=Math.cos(el)*Math.sin(az),lz=Math.sin(el);
  return clamp(nx*lx+ny*ly+nz*lz,-1,1);
}

function localSarTexture(db,width,height,x,y){
  const i=y*width+x,c=Number(db[i]);if(!finite(c))return 0;
  const l=Number(db[y*width+Math.max(0,x-1)]),r=Number(db[y*width+Math.min(width-1,x+1)]),u=Number(db[Math.max(0,y-1)*width+x]),d=Number(db[Math.min(height-1,y+1)*width+x]);
  const gx=(finite(r)?r:c)-(finite(l)?l:c),gy=(finite(d)?d:c)-(finite(u)?u:c);return clamp(Math.hypot(gx,gy)/12,0,1);
}

export function buildTerrainReliefSurface(terrain,water,{azimuthDeg=315,elevationDeg=43}={}){
  if(!terrain?.elevation||!terrain.width||!terrain.height)return null;
  const width=terrain.width,height=terrain.height,rgba=new Uint8ClampedArray(width*height*4),g=water?.geometry||water||null;
  for(let i=0;i<width*height;i++){
    const z=Number(terrain.elevation[i]);if(!finite(z))continue;
    const slope=Number(g?.slope?.[i])||0,aspect=Number(g?.aspect?.[i])||0,curv=Number(g?.curvature?.[i])||0,q=clamp(Number(g?.conveyance?.[i])||0,0,1),light=terrainLight(slope,aspect,{azimuthDeg,elevationDeg}),relief=clamp(.54+.37*light-.06*Math.tanh(curv*2500),.12,1),j=i*4;
    // Neutral relief preserves the semantics: topography shapes illumination; it does
    // not invent an optical land-cover color. Drainage potential only adds a restrained
    // cool bias at high conveyance and is explicitly derived, not observed water.
    const wet=q>.48?Math.pow((q-.48)/.52,1.4):0,base=Math.round(255*relief);
    rgba[j]=Math.round(base*(1-.16*wet));rgba[j+1]=Math.round(base*(1-.03*wet));rgba[j+2]=Math.min(255,Math.round(base*(1+.18*wet)));rgba[j+3]=Math.round(34+78*Math.abs(light)+42*wet);
  }
  return {width,height,rgba,semantics:'DEM-derived shaded relief with derived drainage-potential modulation; no optical land-cover synthesis and no observed-water claim.'};
}

export function buildTerrainShapedSarSurface(patch,terrain,water,{azimuthDeg=315,elevationDeg=43,reliefStrength=.32,textureStrength=.12}={}){
  if(!patch?.db||!patch.width||!patch.height||!patch?.geoMesh)return null;
  const width=patch.width,height=patch.height,rgba=new Uint8ClampedArray(width*height*4),low=patch.stats?.p02??-30,high=patch.stats?.p98??0,mesh=patch.geoMesh,[x0,y0,x1,y1]=patch.sourceWindow||mesh.sourceWindow||[0,0,width,height],sx=(x1-x0)/width,sy=(y1-y0)/height,g=water?.geometry||water||null;
  let terrainSamples=0,validSar=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x,j=i*4,db=Number(patch.db[i]),sar=percentileStretch(db,low,high);if(sar==null)continue;validSar++;
    const sourcePixel=x0+(x+.5)*sx,sourceLine=y0+(y+.5)*sy,geo=meshGeoAtSource(mesh,sourcePixel,sourceLine),slope=geo?sampleTerrainField(terrain,g?.slope,geo.lon,geo.lat):NaN,aspect=geo?sampleTerrainField(terrain,g?.aspect,geo.lon,geo.lat):NaN,curv=geo?sampleTerrainField(terrain,g?.curvature,geo.lon,geo.lat):NaN,convey=geo?sampleTerrainField(terrain,g?.conveyance,geo.lon,geo.lat):NaN;
    const hasTerrain=finite(slope)&&finite(aspect);if(hasTerrain)terrainSamples++;
    const light=hasTerrain?terrainLight(slope,aspect,{azimuthDeg,elevationDeg}):.62,ao=finite(curv)?clamp(.5-.5*Math.tanh(curv*2400),0,1):.5,texture=localSarTexture(patch.db,width,height,x,y),relief=clamp(.68+.32*light,0,1),shape=clamp((1-reliefStrength)+reliefStrength*relief+.055*(ao-.5)+textureStrength*texture,0,1.25),v=clamp(sar*shape,0,1),wet=finite(convey)&&convey>.58?Math.pow(clamp((convey-.58)/.42,0,1),1.6):0;
    // Calibrated SAR remains the luminance source. Terrain changes illumination only.
    // Derived drainage potential gets a very small cool bias rather than becoming a
    // fake water mask. The output is a DISPLAY RENDER, never a new measurement array.
    const base=Math.round(255*v),r=base*(1-.10*wet),gg=base*(1-.025*wet),b=base*(1+.12*wet);
    rgba[j]=Math.round(clamp(r,0,255));rgba[j+1]=Math.round(clamp(gg,0,255));rgba[j+2]=Math.round(clamp(b,0,255));rgba[j+3]=255;
  }
  return {width,height,rgba,stats:{validSar,terrainSamples,terrainCoverage:validSar?terrainSamples/validSar:0},display:{sarRangeDb:[low,high],sarGamma:.82,reliefStrength,textureStrength,azimuthDeg,elevationDeg},evidence:{sarMeasured:true,terrainMeasuredContext:!!terrain?.rawDem,waterObserved:false,displayDerived:true},boundary:'Display synthesis only: calibrated Sentinel-1 GRD controls luminance; DEM normals modulate relief; D8 drainage potential is derived context. Original SAR dB/power arrays are unchanged. Not RTC, not 3-D measured geometry, not water depth/discharge, and not synthetic SAR.'};
}
