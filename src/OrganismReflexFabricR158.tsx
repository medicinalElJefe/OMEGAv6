import {GitBranch,ShieldCheck,Waypoints} from 'lucide-react';
import {organismReflexManifestR156} from './system/organismReflexR156.js';
import './organismReflexFabricR158.css';

const polar=(i:number,n:number,r=112)=>{const a=i/Math.max(1,n)*Math.PI*2-Math.PI/2;return{x:150+Math.cos(a)*r,y:150+Math.sin(a)*r}};
const short=(v:string)=>v.replaceAll('_',' ').replace('RECONTEXTUALIZED','RECONTEXT').replace('ADMISSION CANDIDATE','ADMISSION');

export default function OrganismReflexFabricR158(){
 const reflex=organismReflexManifestR156(),points=reflex.stages.map((stage:string,i:number)=>({...polar(i,reflex.stages.length),stage,index:i}));
 return <section className='oref158' data-omega-view-guard='R158' aria-label='Promoted organism reflex control fabric'>
  <header><div><span>R156 PROMOTED ORGANISM REFLEX · R158 VISUAL BINDING</span><h3>Every specialist return comes back through one bounded organism</h3><p>The promoted cross-family reflex protocol is shown as control flow, scar/history carry and authority routing. It does not claim consciousness, physical agency, successful execution or CanonState admission.</p></div><GitBranch/></header>
  <div className='oref158-body'><div className='oref158-visual' data-omega-visual-output='true'><svg viewBox='0 0 300 300' role='img' aria-label='Observed through admission-candidate reflex cycle'>
   <circle cx='150' cy='150' r='114' className='oref158-ring'/><circle cx='150' cy='150' r='50' className='oref158-core'/>
   {points.map((p:any,i:number)=>{const q=points[(i+1)%points.length];return <line key={`e-${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className='oref158-edge'/>})}
   {points.map((p:any)=><g key={p.stage} transform={`translate(${p.x} ${p.y})`}><circle r='15'/><text y='2' textAnchor='middle'>{String(p.index+1).padStart(2,'0')}</text><text y='25' textAnchor='middle' className='label'>{short(p.stage)}</text></g>)}
   <text x='150' y='142' textAnchor='middle' className='core-title'>ONE</text><text x='150' y='156' textAnchor='middle' className='core-title'>ORGANISM</text><text x='150' y='174' textAnchor='middle' className='core-sub'>scar → next routing</text>
  </svg></div>
  <aside><div className='oref158-actions'>{reflex.actions.map((x:string)=><b key={x}>{x}</b>)}</div><section><span>REFLEX LOOP</span><p>{reflex.loop}</p></section><section><span>RESIDUAL ROUTING CLASSES · {reflex.residual_kinds.length}</span><div className='oref158-kinds'>{reflex.residual_kinds.map((x:string)=><code key={x}>{x.replaceAll('_',' ')}</code>)}</div></section><section><span>AUTHORITY</span><p>R155 owns capability-family authority. The promoted R156 organism reflex owns cross-family control/reflex routing. The separate R156 dimensional-relativity line is a derived projection candidate. Matching revision labels never merge those authorities.</p></section></aside></div>
  <footer><ShieldCheck/><span>{reflex.truth_boundary}</span><Waypoints/><span>R125 remains sole CanonState admission authority.</span></footer>
 </section>;
}
