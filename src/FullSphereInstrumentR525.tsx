import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,Pause,Play,RotateCcw,ShieldCheck,Waypoints} from 'lucide-react';
import {corpusState} from './corpusRuntime';
import {R525_ARCHIVE_GRAMMAR,R525_ARCHIVE_FAMILY,R525_SPHERE_SCHEMA,selectSphereAddressR525,fullSphereProjectionR525,type R525FieldLens,type R525TimeLens} from './fullSphereRecoveryR525';
import './fullSphereRecoveryR525.css';

type Props={address:number;onAddress:(address:number)=>void};
const TEMPORAL:readonly R525TimeLens[]=['HISTORY','NOW','FORECAST'];
const FIELDS:readonly R525FieldLens[]=['CONTINUITY','SCAR','CONTRADICTION','FOLD'];
const round=(v:number)=>Math.round(v*1000)/1000;
export default function FullSphereInstrumentR525({address,onAddress}:Props){
 const[time,setTime]=useState<R525TimeLens>('NOW');
 const[lens,setLens]=useState<R525FieldLens>('CONTINUITY');
 const[yaw,setYaw]=useState(24);
 const[fold,setFold]=useState(.18);
 const[playing,setPlaying]=useState(false);
 const[visibleShells,setVisibleShells]=useState<readonly boolean[]>([true,true,true]);
 const toggleShell=(shell:number)=>setVisibleShells(current=>current.map((visible,i)=>i===shell?!visible:visible));
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setYaw(v=>v>=179?-179:v+1),62);return()=>window.clearInterval(id)},[playing]);
 const current=useMemo(()=>corpusState(address),[address]);
 const selected=useMemo(()=>selectSphereAddressR525(address,time,Number(current.autoPing.dataNext)),[address,time,current.autoPing.dataNext]);
 const packet=useMemo(()=>corpusState(selected),[selected]);
 const frame=useMemo(()=>fullSphereProjectionR525({address:selected,continuity:packet.metrics.continuity,plasticity:packet.metrics.plasticity,scar:packet.metrics.scar,contradiction:packet.metrics.contradiction,yaw,fold,lens}),[selected,packet,yaw,fold,lens]);
 const color=lens==='SCAR'?'#d4a8ba':lens==='CONTRADICTION'?'#d3a67a':lens==='FOLD'?'#84cbd0':'#d5d4bb';
 const timeNote=time==='HISTORY'?'Previous address in the enumerated lattice. This is NOT an observation of historical time.':time==='FORECAST'?'Declared autoPing successor projected from the model. No external future measurement is claimed.':'Current loaded source-packet address. Observation is not inferred from address geometry.';
 const reset=()=>{setYaw(24);setFold(.18);setPlaying(false);setLens('CONTINUITY');setTime('NOW');setVisibleShells([true,true,true])};
 return <section className='r525-full-sphere' data-r525-sphere={R525_SPHERE_SCHEMA} data-r525-source-family={R525_ARCHIVE_FAMILY} data-r525-active-address={selected} aria-label='Full Sphere state-bound visual instrument'>
  <div className='r525-head'>
   <div><span className='r525-eyebrow'>AG-008 · Historical visual grammar recovery · R525</span><h2>Full Sphere <i>Instrument</i></h2><p>Exact 20,736-address antipodal topology, three nested dodecahedral projections and model-state-bound visual channels. The historical six-video grammar is the recovery reference—not a claim of pixel-equivalent reconstruction.</p></div>
   <div className='r525-proof'><ShieldCheck size={15}/><span>DERIVED MODEL</span><b>NO CANON MUTATION</b></div>
  </div>
  <div className='r525-instrument-grid'>
   <div className='r525-stage'>
    <svg viewBox='0 0 960 620' role='img' aria-label='Three nested computed dodecahedral shells for the selected exact Full Sphere state, not a physical rendering'>
     <defs>
      <radialGradient id='r525-horizon'><stop offset='0' stopColor='#213e40' stopOpacity='.45'/><stop offset='.7' stopColor='#0c1c25' stopOpacity='.16'/><stop offset='1' stopColor='#050d15' stopOpacity='1'/></radialGradient>
      <linearGradient id='r525-meridian' x1='0' y1='0' x2='1' y2='1'><stop stopColor='#d5bb87' stopOpacity='.7'/><stop offset='.55' stopColor='#91babb' stopOpacity='.28'/><stop offset='1' stopColor='#d8b783' stopOpacity='.55'/></linearGradient>
     </defs>
     <rect width='960' height='620' fill='url(#r525-horizon)'/>
     {Array.from({length:6},(_,i)=><ellipse key={'orbit'+i} cx='480' cy='310' rx={120+i*52} ry={34+i*23} fill='none' stroke='url(#r525-meridian)' strokeOpacity={.14+i*.025} strokeDasharray={i%2?'3 14':'none'} transform={'rotate('+(i*17-36)+' 480 310)'}/>)}
     <circle cx='480' cy='310' r='248' fill='none' stroke='#9bbcc1' strokeOpacity='.15'/>
     <path d='M480 62V558M232 310H728' stroke='#92aeb7' strokeOpacity='.13' strokeDasharray='5 16'/>
     {frame.shells.filter(shell=>visibleShells[shell.shell]).map((shell)=><g key={shell.shell} data-r525-shell={shell.shell} stroke={color} strokeOpacity={shell.opacity} strokeWidth={shell.weight} fill='none' strokeLinejoin='round' strokeLinecap='round'>
       {shell.edges.map(([a,b])=><line key={a+'-'+b} data-r525-edge={shell.shell+'-'+a+'-'+b} x1={shell.points[a].x} y1={shell.points[a].y} x2={shell.points[b].x} y2={shell.points[b].y}/>)}
       {shell.points.map(p=><circle key={p.index} cx={p.x} cy={p.y} r={shell.shell===0?1.85:1.1} fill={color} fillOpacity={.35+.55*frame.amplitude} stroke='none'/>)}
      </g>)}
     <circle cx='480' cy='310' r='23' fill='none' stroke='#deb77a' strokeOpacity='.52' strokeWidth='1.3'/>
     <circle cx='480' cy='310' r='3.2' fill='#e7d7b9'/>
     <text x='30' y='40' fill='#b5d3d4' fontFamily='monospace' fontSize='13'>FULL SPHERE / SOURCE PACKET {String(frame.address).padStart(5,'0')}</text>
     <text x='30' y='62' fill='#8babb5' fontFamily='monospace' fontSize='12'>D{frame.exactCoordinate.D_domain} P{frame.exactCoordinate.P_phase} R{frame.exactCoordinate.R_reg} L{frame.exactCoordinate.L_lens} · {time} · {lens}</text>
     <text x='30' y='590' fill='#d4b68b' fontFamily='monospace' fontSize='12'>EXACT ANTIPODE: {String(frame.antipodeIndex0).padStart(5,'0')}</text>
     <text x='930' y='590' textAnchor='end' fill='#8dacb3' fontFamily='monospace' fontSize='11'>REPRESENTATIONAL / NOT OBSERVATIONAL</text>
    </svg>
    <div className='r525-stage-foot'><span><Waypoints size={15}/> 20 vertices × 3 shells · 30 edges × 3</span><span>R406 exact coordinate / R347 truth grammar</span></div>
   </div>
   <aside className='r525-panel'>
    <div className='r525-controls-block'>
     <label>Address-time projection <small>model context</small></label>
     <div className='r525-segments'>{TEMPORAL.map(t=><button key={t} type='button' data-r525-time={t} aria-pressed={time===t} onClick={()=>setTime(t)}>{t}</button>)}</div>
     <p className='r525-note'>{timeNote}</p>
    </div>
    <div className='r525-controls-block'><label>Visible geometric shells</label><div className='r525-lens-grid' data-r526-layer-controls='shell-isolation'>{visibleShells.map((visible,i)=><button key={i} type='button' data-r526-shell-toggle={i} aria-pressed={visible} onClick={()=>toggleShell(i)}>Shell {i+1} {visible?'on':'off'}</button>)}</div><small>Layer visibility changes the projection only; canonical state and source packet are unchanged.</small></div>
    <div className='r525-controls-block'><label>State projection lens</label><div className='r525-lens-grid'>{FIELDS.map(f=><button key={f} type='button' data-r525-lens={f} aria-pressed={lens===f} onClick={()=>setLens(f)}>{f}</button>)}</div></div>
    <div className='r525-controls-block'>
     <label htmlFor='r525-yaw'>Observer rotation <b>{Math.round(yaw)}°</b></label>
     <input id='r525-yaw' aria-label='Full Sphere observer rotation' type='range' min='-180' max='180' step='1' value={yaw} onChange={e=>setYaw(Number(e.target.value))}/>
     <label htmlFor='r525-fold'>Projection fold <b>{Math.round(fold*100)}%</b></label>
     <input id='r525-fold' aria-label='Full Sphere projection fold' type='range' min='0' max='1' step='.01' value={fold} onChange={e=>setFold(Number(e.target.value))}/>
     <div className='r525-transport'><button type='button' onClick={()=>setPlaying(p=>!p)} data-r525-motion={playing?'playing':'paused'}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':'Animate'} projection</button><button type='button' onClick={reset}><RotateCcw size={15}/> Reset</button></div>
    </div>
    <div className='r525-controls-block r525-readout'><label>Computed packet channels</label>
     <dl><div><dt>Continuity CΩ</dt><dd>{round(frame.continuity)}</dd></div><div><dt>Plasticity Φ</dt><dd>{round(frame.plasticity)}</dd></div><div><dt>Scar Σ</dt><dd>{round(frame.scar)}</dd></div><div><dt>Contradiction q</dt><dd>{round(frame.contradiction)}</dd></div></dl>
     <small>No physics units are inferred from source-packet model fields.</small>
    </div>
    <div className='r525-actions'><button type='button' data-r525-action='antipode' onClick={()=>onAddress(frame.antipodeIndex0)}>Select exact antipode <ArrowRight size={14}/></button><button type='button' data-r525-action='select-preview' disabled={selected===address} onClick={()=>onAddress(selected)}>Select preview address</button></div>
   </aside>
  </div>
  <footer className='r525-boundary'><b>Recovery coverage:</b> {R525_ARCHIVE_GRAMMAR.recoveredNow.length} implemented projection families in this instrument; {R525_ARCHIVE_GRAMMAR.stillMissing.length} historical/empirical source groups still unresolved. This instrument does not claim original video fidelity, physical celestial precession or observation of historical/forecast time.</footer>
 </section>;
}
