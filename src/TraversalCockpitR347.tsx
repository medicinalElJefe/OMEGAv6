import{useEffect,useMemo,useRef,useState}from'react';
import{Activity,Clock3,Crosshair,Eye,Globe2,Layers3,Pause,Play,RefreshCw,Route,ShieldCheck,Waypoints,Zap}from'lucide-react';
import{api}from'./platformAdapter';
import{corpusState}from'./corpusRuntime';
import{getMandala20736Field,mandalaLensWeight,type FieldLens,type Mandala20736Field}from'./mandala20736Runtime';
import{getVisualCalibration,type VisualCalibration}from'./visualCalibration';
import{freshnessLabelR105}from'./dataFreshnessR105';
import{LENS_CALCULUS}from'./lensCalculus';
import{R347_TRUTH_BOUNDARY,R347_VISUAL_GRAMMAR,lensScoreSetR347,modelMappedWgs84R347,routeR347,scaleReferenceR347,visualStateR347,type R347TaskView}from'./visualTraversalCockpitR347';
import'./traversalCockpitR347.css';

type Props={address:number;onSelect:(address:number)=>void;onNavigate?:(panel:string)=>void};
type Projected={i:number;x:number;y:number;r:number};
const VIEW_OPTIONS:{id:R347TaskView;label:string;copy:string}[]=[
 {id:'NOW',label:'Now',copy:'whole canonical field + current selected state'},
 {id:'ROUTE',label:'Route',copy:'admitted transition corridor and local context'},
 {id:'PROOF',label:'Proof',copy:'evidence-surviving structure dominates'},
 {id:'SCAR',label:'Scar',copy:'persistent history and residual carry'},
 {id:'FORECAST',label:'Forecast',copy:'conditional model route only'}
];
const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const fmt=(v:any,d=3)=>typeof v==='number'&&Number.isFinite(v)?v.toFixed(d):'—';
function metric(label:string,value:number,copy:string){return{label,value:cl(value),copy}}

export default function TraversalCockpitR347({address,onSelect,onNavigate}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),projected=useRef<Projected[]>([]),hoverRef=useRef<number|null>(null);
 const[field,setField]=useState<Mandala20736Field|null>(null),[cal,setCal]=useState<VisualCalibration|null>(null),[lens,setLens]=useState<FieldLens>('UNIFIED'),[view,setView]=useState<R347TaskView>('NOW'),[scaleIndex,setScaleIndex]=useState(4),[zoom,setZoom]=useState(1),[playing,setPlaying]=useState(true),[live,setLive]=useState(true),[earth,setEarth]=useState<any>(null),[status,setStatus]=useState<any>(null),[hybrid,setHybrid]=useState<any>(null),[externalError,setExternalError]=useState(''),[hover,setHover]=useState<number|null>(null),[now,setNow]=useState(Date.now());
 const reduced=useMemo(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 const target=useMemo(()=>modelMappedWgs84R347(address),[address]),route=useMemo(()=>routeR347(address,48),[address]),routeSet=useMemo(()=>new Set(route.map(x=>x.address)),[route]);
 const refreshExternal=async()=>{setExternalError('');const q=`/api/earth/evidence?lat=${target.lat.toFixed(5)}&lon=${target.lon.toFixed(5)}`;const rows=await Promise.allSettled([api.get<any>(q),api.get<any>('/api/status'),api.get<any>('/api/hybrid/status')]);const e=rows[0],s=rows[1],h=rows[2];if(e.status==='fulfilled')setEarth(e.value.data);if(s.status==='fulfilled')setStatus(s.value.data);if(h.status==='fulfilled')setHybrid(h.value.data);const failed=rows.filter(x=>x.status==='rejected');if(failed.length)setExternalError(`${failed.length} live source${failed.length===1?'':'s'} unavailable; missing values remain unbound.`)};
 useEffect(()=>{Promise.all([getMandala20736Field(),getVisualCalibration()]).then(([f,c])=>{setField(f);setCal(c)}).catch(e=>setExternalError(e instanceof Error?e.message:String(e)))},[]);
 useEffect(()=>{void refreshExternal()},[target.lat,target.lon]);
 useEffect(()=>{if(!live)return;const id=window.setInterval(()=>{setNow(Date.now());void refreshExternal()},60_000);return()=>window.clearInterval(id)},[live,target.lat,target.lon]);
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id)},[]);
 const selected=useMemo(()=>cal?visualStateR347(address,cal,lens):null,[address,cal,lens]),lensScores=useMemo(()=>cal?lensScoreSetR347(address,cal):[],[address,cal]),scale=scaleReferenceR347(scaleIndex),hoverRecord=useMemo(()=>hover==null?null:corpusState(hover),[hover]);
 const metrics=selected?[metric('Continuity CΩ',selected.calibrated.C,'route line weight'),metric('Plasticity Φ',selected.calibrated.Phi,'future capacity'),metric('Evidence',selected.calibrated.evidence,'luminance / opacity'),metric('Contradiction q',selected.calibrated.q,'field deformation'),metric('Burden Λ',selected.calibrated.Lambda,'constraint compression'),metric('Scar Σ',selected.calibrated.scar,'history persistence')]:[];

 useEffect(()=>{if(!field||!cal||!canvas.current)return;let raf=0,alive=true;const c=canvas.current,ctx=c.getContext('2d');if(!ctx)return;
 const draw=(ts:number)=>{if(!alive)return;const rect=c.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.max(320,Math.round(rect.width)),H=Math.max(320,Math.round(rect.height));if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#020608';ctx.fillRect(0,0,W,H);
 const animate=playing&&!reduced,t=animate?ts*.00008:0,yaw=.35+t*.32,pitch=-.16+.08*Math.sin(t*.7),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),focusX=field.x[address]||0,focusY=field.y[address]||0,focusZ=field.z[address]||0,baseScale=Math.min(W,H)*.78*zoom,low=W<760||(navigator.hardwareConcurrency||8)<=4,stride=low?4:W<1100?2:1,pts:Projected[]=[];
 const project=(i:number)=>{let x=field.x[i]-focusX,y=field.y[i]-focusY,z=field.z[i]-focusZ;const q=field.q[i],L=field.Lambda[i],deform=.55*q+.45*L,ang=field.phase[i];x+=Math.sin(ang)*.035*deform;y+=Math.cos(ang*.7)*.025*deform;const x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cp-z1*sp,z2=y*sp+z1*cp,depth=1.65-z2*.55,px=W/2+x1*baseScale/depth,py=H/2-y1*baseScale/depth;return{px,py,z:z2}};
 for(let i=0;i<field.count;i+=stride){const p=project(i);if(p.px<-20||p.px>W+20||p.py<-20||p.py>H+20)continue;const w=mandalaLensWeight(field,i,lens),E=field.evidence[i],C=field.C[i],scar=field.scar[i],isRoute=routeSet.has(i),isSelected=i===address,isHover=i===hoverRef.current;let visibility=1;if(view==='ROUTE')visibility=isRoute?1:.08;else if(view==='PROOF')visibility=.08+.92*w;else if(view==='SCAR')visibility=.08+.92*scar;else if(view==='FORECAST')visibility=isRoute ? .96 : .045;const alpha=(.025+.42*E)*visibility*(.45+.55*w),stress=cl(.58*field.q[i]+.42*field.Lambda[i]),r=(.55+1.8*(.55*C+.45*w))*(isSelected?2.8:isHover?2.1:1);if(isSelected||isHover||isRoute)pts.push({i,x:p.px,y:p.py,r:Math.max(7,r*2.2)});
 if(view==='SCAR'&&scar>.55){ctx.strokeStyle=`rgba(203,93,111,${.03+.16*scar})`;ctx.beginPath();ctx.arc(p.px,p.py,r*(1.5+scar*2),0,Math.PI*2);ctx.stroke()}
 const rr=Math.round(53+142*stress),gg=Math.round(146+72*(1-stress)),bb=Math.round(158+64*E);ctx.fillStyle=isSelected?`rgba(241,199,107,${Math.max(.85,alpha)})`:isRoute&&view==='FORECAST'?`rgba(134,193,169,${Math.max(.18,alpha)})`:`rgba(${rr},${gg},${bb},${alpha})`;ctx.fillRect(p.px-r/2,p.py-r/2,r,r)}
 ctx.setLineDash(view==='FORECAST'?[6,7]:[]);ctx.lineJoin='round';ctx.lineCap='round';for(let i=0;i<route.length-1;i++){const a=project(route[i].address),b=project(route[i+1].address),rec=corpusState(route[i].address),line=.7+2.6*cl(Number(rec.metrics.continuity)),ev=cl(Number(rec.metrics.evidence));ctx.strokeStyle=view==='FORECAST'?`rgba(130,196,168,${.18+.56*ev})`:`rgba(226,187,104,${.12+.55*ev})`;ctx.lineWidth=line;ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke()}ctx.setLineDash([]);
 const s=project(address);ctx.strokeStyle='#f0c973';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(s.px,s.py,11,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(s.px,s.py,18+18*(field.scar[address]||0),0,Math.PI*2);ctx.strokeStyle='rgba(240,201,115,.22)';ctx.stroke();
 projected.current=pts;ctx.fillStyle='rgba(226,238,240,.86)';ctx.font='11px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillText(`R347 · ${view} · ${lens} · STATE ${address+1} · ${field.count.toLocaleString()} ADDRESSES`,14,20);ctx.fillStyle='rgba(151,170,176,.82)';ctx.fillText(`${scale.label} reference · ${scale.extent} · ${scale.authority}`,14,38);
 raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>{alive=false;cancelAnimationFrame(raf)}},[field,cal,address,lens,view,zoom,playing,reduced,route,routeSet,scale.label,scale.extent,scale.authority]);

 const hit=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best:null|Projected=null,bd=18;for(const p of projected.current){const d=Math.hypot(p.x-x,p.y-y);if(d<Math.max(bd,p.r)){best=p;bd=d}}hoverRef.current=best?.i??null;setHover(best?.i??null)};
 const choose=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best:null|Projected=null,bd=18;for(const p of projected.current){const d=Math.hypot(p.x-x,p.y-y);if(d<Math.max(bd,p.r)){best=p;bd=d}}if(best)onSelect(best.i)};
 const observedAt=earth?.verifiedAt?Date.parse(earth.verifiedAt):NaN,observedFresh=Number.isFinite(observedAt)?freshnessLabelR105(observedAt,now):'unbound',hybridState=hybrid?.state||hybrid?.runtime?.state||'DEVICE_PROOF_REQUIRED',runtimeState=status?.state||status?.runtime?.state||'UNVERIFIED';

 return <section className='r347-cockpit'>
  <header className='r347-head'><div><span>R347 · HUMAN VISUAL TRAVERSAL COCKPIT</span><h2>One field. Separate truth classes. Direct visual correlation.</h2><p>The same canonical packet, live Earth evidence, route calculus, proof state and host/runtime status are organized into one task surface without converting model geometry into physical observation.</p></div><div className='r347-head-actions'><button onClick={()=>setPlaying(v=>!v)}>{playing?<Pause/>:<Play/>}{playing?'Pause motion':'Resume motion'}</button><button onClick={()=>void refreshExternal()}><RefreshCw/>Refresh live evidence</button></div></header>
  <div className='r347-truth-rail'>
   <article className='observed'><Globe2/><span><b>OBSERVED</b><small>{earth?.evidenceHash?`Earth evidence · ${observedFresh}`:'external evidence unbound'}</small></span></article>
   <article className='computed'><Layers3/><span><b>COMPUTED</b><small>{field?`${field.count.toLocaleString()} calibrated addresses`:'field compiling'}</small></span></article>
   <article className='forecast'><Route/><span><b>FORECAST</b><small>{route.length} conditional model-route states</small></span></article>
   <article className='held'><Zap/><span><b>PHYSICAL ENERGY HELD</b><small>No joule-valued source is bound to this frame.</small></span></article>
  </div>
  <div className='r347-controls'>
   <nav aria-label='Traversal task view'>{VIEW_OPTIONS.map(x=><button key={x.id} className={view===x.id?'active':''} onClick={()=>setView(x.id)}><b>{x.label}</b><small>{x.copy}</small></button>)}</nav>
   <label>Lens<select value={lens} onChange={e=>setLens(e.target.value as FieldLens)}>{Object.keys(LENS_CALCULUS).map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Reference scale<input type='range' min='0' max='7' step='1' value={scaleIndex} onChange={e=>setScaleIndex(Number(e.target.value))}/><b>{scale.label}</b></label>
   <label>Semantic zoom<input type='range' min='.65' max='2.25' step='.05' value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><b>{zoom.toFixed(2)}×</b></label>
   <button className={live?'active':''} onClick={()=>setLive(v=>!v)}><Activity/>{live?'Live refresh on':'Live refresh off'}</button>
  </div>
  <div className='r347-workspace'>
   <main className='r347-stage'>
    <canvas ref={canvas} onPointerMove={hit} onPointerLeave={()=>{hoverRef.current=null;setHover(null)}} onPointerDown={choose} aria-label='Calibrated 20,736 state traversal field'/>
    <div className='r347-stage-hud'><span><Crosshair/>Selected {address+1}</span><span><Waypoints/>Route {route.length}</span><span><Clock3/>Observed {observedFresh}</span></div>
    {hoverRecord&&<div className='r347-hover'><b>STATE {hoverRecord.stateId}</b><small>{hoverRecord.metrics.decision} · E {fmt(hoverRecord.metrics.evidence)} · CΩ {fmt(hoverRecord.metrics.continuity)}</small></div>}
   </main>
   <aside className='r347-inspector'>
    <header><Eye/><div><b>Selected state {address+1}</b><small>{selected?.record.metrics.decision||'—'} · lens {lens}</small></div></header>
    <div className='r347-metrics'>{metrics.map(m=><div key={m.label}><span>{m.label}</span><b>{fmt(m.value)}</b><i><em style={{width:`${m.value*100}%`}}/></i><small>{m.copy}</small></div>)}</div>
    <section className='r347-equations'><span>VISIBLE MATH</span><code>S=(CΩ·Φ)/(q+Λ+ε)</code><b>{selected?fmt(selected.unified.commonKernel,6):'—'}</b><code>{selected?.lensDescriptor.equation||'—'}</code><p>{selected?.lensDescriptor.boundary||'Lens boundary unavailable.'}</p></section>
    <section className='r347-live'><span>LIVE CORRELATION CONTEXT</span><div><b>WGS84 query</b><small>{target.lat.toFixed(4)}, {target.lon.toFixed(4)}</small></div><div><b>Runtime</b><small>{runtimeState}</small></div><div><b>Hybrid</b><small>{hybridState}</small></div><div><b>Weather</b><small>{earth?.localConditions?`${fmt(earth.localConditions.temperatureC,1)} °C · ${fmt(earth.localConditions.windKph,1)} km/h`:'unbound'}</small></div><div><b>Seismic</b><small>{earth?.seismic?`${earth.seismic.count??'—'} / 24h · Mmax ${fmt(earth.seismic.maxMagnitude,1)}`:'unbound'}</small></div><div><b>Space weather</b><small>{earth?.spaceWeather?`Kp ${fmt(earth.spaceWeather.kp,1)}`:'unbound'}</small></div></section>
    <section className='r347-why'><span>WHY IT LOOKS THIS WAY</span>{selected&&<><div><b>Opacity</b><small>{fmt(selected.encoding.alpha)} ← calibrated evidence</small></div><div><b>Line weight</b><small>{fmt(selected.encoding.lineWeight)} ← calibrated continuity</small></div><div><b>Deformation</b><small>{fmt(selected.encoding.deformation)} ← q + Λ</small></div><div><b>Persistence</b><small>{fmt(selected.encoding.persistence)} ← scar</small></div><div><b>Uncertainty</b><small>{fmt(selected.encoding.uncertainty)} ← 1 − evidence</small></div></>}</section>
   </aside>
  </div>
  <section className='r347-time'>
   <header><div><span>TIME CORRELATION</span><b>Observation time and model-route time stay separate.</b></div><small>{earth?.verifiedAt||'no returned observation timestamp'}</small></header>
   <div className='r347-observed-time'><span>OBSERVED UTC</span><i/><b>{earth?.verifiedAt?new Date(earth.verifiedAt).toLocaleString():'UNBOUND'}</b></div>
   <div className='r347-route-time'><span>MODEL ROUTE</span><div>{route.slice(0,24).map((x,i)=><button key={x.step} className={x.address===address?'active':''} onClick={()=>onSelect(x.address)} title={`t+${i} · state ${x.stateId} · E ${fmt(x.evidence)}`}><i style={{height:`${Math.max(12,x.evidence*100)}%`}}/><small>{i}</small></button>)}</div></div>
  </section>
  <section className='r347-lens-row'>{lensScores.map(x=><button key={x.lens} onClick={()=>setLens(x.lens as FieldLens)} className={x.lens===lens?'active':''}><span>{x.lens}</span><b>{fmt(x.score)}</b><small>{x.descriptor.render}</small></button>)}</section>
  <details className='r347-grammar'><summary><ShieldCheck/>Visual encoding registry · exact channel authority</summary><div>{R347_VISUAL_GRAMMAR.map(x=><article key={x.channel}><b>{x.channel}</b><code>{x.equation}</code><span>{x.meaning}</span><small>{x.boundary}</small></article>)}</div></details>
  {externalError&&<div className='r347-error'>{externalError}</div>}
  <footer><ShieldCheck/><span>{R347_TRUTH_BOUNDARY}</span>{onNavigate&&<><button onClick={()=>onNavigate('Earth Now')}>Open Earth evidence</button><button onClick={()=>onNavigate('Evidence & Proof')}>Open proof ledger</button><button onClick={()=>onNavigate('Matter Traversal')}>Open deep Matter traversal</button></>}</footer>
 </section>
}
