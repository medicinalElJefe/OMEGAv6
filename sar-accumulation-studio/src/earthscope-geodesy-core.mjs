const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)?Number(v):a));
const normKey=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const stationId=v=>{const s=String(v??'').trim().toUpperCase();return /^[A-Z0-9]{4}$/.test(s)?s:null;};

function csvLine(line){
  const out=[];let cell='',quoted=false;
  for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){out.push(cell.trim());cell='';}else cell+=c;}out.push(cell.trim());return out;
}
function scalar(value){const text=String(value??'').trim();if(text==='')return null;const n=Number(text);return Number.isFinite(n)?n:text;}
export function parseEarthScopePayload(text,contentType=''){
  const raw=String(text??''),type=String(contentType||'').toLowerCase();
  if(type.includes('json')||/^\s*[\[{]/.test(raw)){try{return {format:'json',value:JSON.parse(raw)};}catch{}}
  const lines=raw.split(/\r?\n/).filter(line=>line.trim()&&!/^\s*#/.test(line));if(!lines.length)return {format:'empty',value:[]};
  const delimiter=lines[0].includes(',')?',':lines[0].includes('|')?'|':null;if(!delimiter)return {format:'text',value:raw};
  const split=line=>delimiter===','?csvLine(line):line.split('|').map(x=>x.trim()),headers=split(lines[0]),rows=[];
  for(const line of lines.slice(1)){const cells=split(line);if(cells.length<2)continue;const row={};headers.forEach((h,i)=>row[h||`column_${i+1}`]=scalar(cells[i]));rows.push(row);}return {format:'table',value:rows};
}
export function flattenRows(value,out=[],depth=0){
  if(value==null||depth>8)return out;if(Array.isArray(value)){for(const v of value)flattenRows(v,out,depth+1);return out;}if(typeof value==='object'){const vals=Object.values(value);const scalarCount=vals.filter(v=>v==null||typeof v!=='object').length;if(scalarCount>=2)out.push(value);for(const v of vals)if(v&&typeof v==='object')flattenRows(v,out,depth+1);}return out;
}
function entries(row){return Object.entries(row||{}).map(([k,v])=>({raw:k,key:normKey(k),value:v}));}
function pick(row,aliases){const e=entries(row);for(const a of aliases){const key=normKey(a),hit=e.find(x=>x.key===key);if(hit&&hit.value!=null&&String(hit.value).trim()!=='')return hit.value;}return null;}
function pickTokens(row,groups){const e=entries(row);for(const terms of groups){const hit=e.find(x=>terms.every(term=>x.key.includes(normKey(term))));if(hit&&hit.value!=null&&String(hit.value).trim()!=='')return hit.value;}return null;}
function number(row,aliases,groups=[]){const v=pick(row,aliases)??pickTokens(row,groups),n=Number(v);return Number.isFinite(n)?n:NaN;}
function text(row,aliases,groups=[]){const v=pick(row,aliases)??pickTokens(row,groups);return v==null?null:String(v).trim()||null;}

export function normalizeEarthScopeStations(payload){
  const rows=flattenRows(payload),byId=new Map();
  for(const row of rows){const id=stationId(text(row,['station','site','siteid','stationid','fourcharacterid','sitecode','stationcode'],[['station','id'],['site','id']]));const lat=number(row,['latitude','lat','ddlatitude'],[['latitude']]),lon=number(row,['longitude','lon','long','ddlongitude'],[['longitude']]);if(!id||!finite(lat)||!finite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)continue;const prior=byId.get(id)||{};byId.set(id,{...prior,id,lat,lon,height:number(row,['height','elevation','ellipsoidheight','altitude'],[['height'],['elevation']]),name:text(row,['stationname','sitename','name','description'])||prior.name||null,network:text(row,['network','networkname','project'])||prior.network||null});}
  return [...byId.values()];
}
function velocityComponent(row,direction){const d=direction.toLowerCase();return number(row,[`${d}velocity`,`${d}vel`,`velocity${d}`,d==='up'?'verticalvelocity':`${d}rate`,d==='up'?'verticalrate':`${d}component`],[[d,'vel'],['vel',d],d==='up'?['vertical','vel']:[d,'rate']]);}
function velocitySigma(row,direction){const d=direction.toLowerCase();return number(row,[`${d}sigma`,`${d}velocitysigma`,`sigma${d}`,`${d}uncertainty`],[[d,'sigma'],[d,'uncert'],['sigma',d]]);}
function timeValue(row){const raw=text(row,['timestamp','datetime','date','epoch','time','enddate','solutiondate','lastdate'],[['epoch'],['date']]);if(!raw)return null;const t=new Date(raw);return Number.isFinite(t.getTime())?t.toISOString():raw;}

export function normalizeGnssVelocity(payload,{station=null,referenceFrame='IGS14',fallbackLocation=null}={}){
  const rows=flattenRows(payload),out=[];
  for(const row of rows){const id=stationId(text(row,['station','site','siteid','stationid'],[['station','id'],['site','id']]))||stationId(station);if(!id)continue;const east=velocityComponent(row,'east'),north=velocityComponent(row,'north'),up=velocityComponent(row,'up');if(![east,north,up].some(finite))continue;const lat=number(row,['latitude','lat','referencelatitude'],[['latitude']]),lon=number(row,['longitude','lon','referencelongitude'],[['longitude']]),start=text(row,['startdate','starttime','firstepoch','epochstart'],[['start','epoch'],['start','date']]),end=text(row,['enddate','endtime','lastepoch','epochend'],[['end','epoch'],['end','date']]),sigmaEast=velocitySigma(row,'east'),sigmaNorth=velocitySigma(row,'north'),sigmaUp=velocitySigma(row,'up');out.push({station:id,location:finite(lat)&&finite(lon)?{lon,lat}:fallbackLocation||null,referenceFrame:String(referenceFrame||'IGS14').toUpperCase(),analysisCenter:text(row,['analysiscenter','center'])||'CWU',observable:'GNSS long-term geodetic velocity',components:{east:finite(east)?east:null,north:finite(north)?north:null,up:finite(up)?up:null},uncertainty:{east:finite(sigmaEast)?Math.abs(sigmaEast):null,north:finite(sigmaNorth)?Math.abs(sigmaNorth):null,up:finite(sigmaUp)?Math.abs(sigmaUp):null},units:'mm/yr',timeSpan:{start:start||null,end:end||null},timestamp:timeValue(row),raw:row});}
  const seen=new Map();for(const v of out){const q=seen.get(v.station);if(!q||[v.timeSpan.end,v.timestamp].filter(Boolean).join('|')>[q.timeSpan.end,q.timestamp].filter(Boolean).join('|'))seen.set(v.station,v);}return [...seen.values()];
}

export function normalizeGnssPosition(payload,{station=null,referenceFrame='IGS14',fallbackLocation=null}={}){
  const rows=flattenRows(payload),out=[];
  for(const row of rows){const id=stationId(text(row,['station','site','siteid','stationid'],[['station','id'],['site','id']]))||stationId(station);if(!id)continue;const east=number(row,['east','eastposition','easting'],[['east','position']]),north=number(row,['north','northposition','northing'],[['north','position']]),up=number(row,['up','vertical','upposition','verticalposition'],[['up','position'],['vertical','position']]);if(![east,north,up].some(finite))continue;const lat=number(row,['latitude','lat','referencelatitude'],[['latitude']]),lon=number(row,['longitude','lon','referencelongitude'],[['longitude']]);out.push({station:id,location:finite(lat)&&finite(lon)?{lon,lat}:fallbackLocation||null,referenceFrame:String(referenceFrame||'IGS14').toUpperCase(),observable:'GNSS daily position solution',components:{east:finite(east)?east:null,north:finite(north)?north:null,up:finite(up)?up:null},units:text(row,['units','unit'])||'source-declared position units',timestamp:timeValue(row),raw:row});}
  return out.sort((a,b)=>String(a.timestamp||'').localeCompare(String(b.timestamp||'')));
}

function invert3(m){const [a,b,c,d,e,f,g,h,i]=m,det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);if(!finite(det)||Math.abs(det)<1e-12)return null;return [(e*i-f*h)/det,(c*h-b*i)/det,(b*f-c*e)/det,(f*g-d*i)/det,(a*i-c*g)/det,(c*d-a*f)/det,(d*h-e*g)/det,(b*g-a*h)/det,(a*e-b*d)/det];}
function matVec(m,v){return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];}
function localKm(origin,p){const rad=Math.PI/180;return {x:(p.lon-origin.lon)*Math.cos(origin.lat*rad)*111.320,y:(p.lat-origin.lat)*110.574};}
function fitPlane(samples,key,origin){let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0,sv=0,sxv=0,syv=0;for(const s of samples){const v=Number(s.components?.[key]);if(!finite(v)||!s.location)continue;const p=localKm(origin,s.location);n++;sx+=p.x;sy+=p.y;sxx+=p.x*p.x;syy+=p.y*p.y;sxy+=p.x*p.y;sv+=v;sxv+=p.x*v;syv+=p.y*v;}if(n<3)return null;const inv=invert3([n,sx,sy,sx,sxx,sxy,sy,sxy,syy]);if(!inv)return null;const beta=matVec(inv,[sv,sxv,syv]);let rss=0,count=0;for(const s of samples){const v=Number(s.components?.[key]);if(!finite(v)||!s.location)continue;const p=localKm(origin,s.location),pred=beta[0]+beta[1]*p.x+beta[2]*p.y;rss+=(v-pred)**2;count++;}return {offset:beta[0],dx:beta[1],dy:beta[2],rmse:count?Math.sqrt(rss/count):null,n:count};}
export function deriveGnssVelocityGradient(samples,{origin=null}={}){
  const good=(samples||[]).filter(s=>s?.location&&finite(s.components?.east)&&finite(s.components?.north));if(good.length<4)return null;const frame=good[0].referenceFrame;if(good.some(s=>s.referenceFrame!==frame))return null;const o=origin||{lon:good.reduce((a,s)=>a+s.location.lon,0)/good.length,lat:good.reduce((a,s)=>a+s.location.lat,0)/good.length},east=fitPlane(good,'east',o),north=fitPlane(good,'north',o);if(!east||!north)return null;const span=Math.max(...good.map(s=>Math.hypot(...Object.values(localKm(o,s.location)))));if(span<5)return null;const exx=east.dx,eyy=north.dy,exy=.5*(east.dy+north.dx),rotation=.5*(north.dx-east.dy),dilatation=exx+eyy,maxShear=Math.hypot(exx-eyy,2*exy);return {state:'GNSS_VELOCITY_GRADIENT_READY',origin:o,referenceFrame:frame,stationCount:good.length,spanKm:span,units:'microstrain/yr (numerically equal to mm/yr/km)',tensor:{exx,eyy,exy,rotation,dilatation,maxShear},fit:{eastRmse:east.rmse,northRmse:north.rmse},sourceStations:good.map(s=>s.station),evidence:{derivedFromMeasured:true,measurementPromotion:false},boundary:'Local affine velocity-gradient fit derived from source-proven GNSS station velocities in one reference frame. This is a spatial derivative of velocity measurements, not borehole strain, not stress, and not a new geodetic observation.'};}

export function velocityQuality(sample){const u=sample?.uncertainty||{},horizontal=Math.hypot(Number(u.east)||0,Number(u.north)||0),vertical=Math.abs(Number(u.up)||0),hasSigma=[u.east,u.north].some(finite),components=[sample?.components?.east,sample?.components?.north].filter(finite).length;return {components,horizontalSigma:hasSigma?horizontal:null,verticalSigma:finite(u.up)?vertical:null,wellConstrained:components===2&&(!hasSigma||horizontal<=2)&&(!finite(u.up)||vertical<=6),score:clamp(.55*(components/2)+.25*(hasSigma?1/(1+horizontal/2):.55)+.20*(sample?.location?1:0))};}