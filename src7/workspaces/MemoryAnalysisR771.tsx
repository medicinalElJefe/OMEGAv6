import {useState} from 'react';
import GroundedIntelligenceR724 from './GroundedIntelligenceR724';
import MemoryContinuityR725 from './MemoryContinuityR725';
import MemoryTrajectoryR726 from './MemoryTrajectoryR726';

/**
 * R771 restores existing verified memory executors to the native Memory route.
 * The same R722 source store and shared Atlas address are used in Intelligence;
 * this is an additional user-facing entry point, not a second memory authority.
 */
export type MemoryAnalysisModeR771='EVIDENCE'|'CONTINUITY'|'TRAJECTORY';
const MODES:readonly {id:MemoryAnalysisModeR771;label:string;description:string}[]=[
 {id:'EVIDENCE',label:'Grounded evidence',description:'Retrieve digest-verified notes with source citations'},
 {id:'CONTINUITY',label:'Continuity comparison',description:'Recompute numerical deltas between two verified observations'},
 {id:'TRAJECTORY',label:'Trajectory replay',description:'Trace, recover and replay recorded observations'}
];

export default function MemoryAnalysisR771({onAddress}:{onAddress:(address:number)=>void}){
 const [mode,setMode]=useState<MemoryAnalysisModeR771>('EVIDENCE');
 return <section data-r771-memory-analysis data-r771-active={mode} aria-label='Source-verified memory analysis'
  style={{maxWidth:'100%',minWidth:0,overflowWrap:'anywhere',padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8}}>
  <h2>Memory · Verified analysis</h2>
  <p>Execute existing source-bound memory, continuity and trajectory tools here without leaving the Memory workspace. Changing instruments clears their transient result, not the original snapshots.</p>
  <div role='group' aria-label='Memory analysis instrument' style={{display:'flex',flexWrap:'wrap',gap:8}}>
   {MODES.map(option=><button type='button' key={option.id} data-r771-select={option.id}
    aria-pressed={mode===option.id} title={option.description} onClick={()=>setMode(option.id)}>{option.label}</button>)}
  </div>
  <div data-r771-executor={mode}>
   {mode==='EVIDENCE'?<GroundedIntelligenceR724 onAddress={onAddress}/>:
    mode==='CONTINUITY'?<MemoryContinuityR725 onAddress={onAddress}/>:
    <MemoryTrajectoryR726 onAddress={onAddress}/>}
  </div>
  <small data-r771-boundary>Each executor independently verifies browser-local R28 source digests before using them. SHA-256 is not an authorship signature. No cloud synchronization, model training, native host action, empirical forecast or CanonState admission is implied.</small>
 </section>;
}
