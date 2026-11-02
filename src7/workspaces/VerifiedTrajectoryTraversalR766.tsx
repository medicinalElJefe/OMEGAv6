import {useState} from 'react';
import {R764_LOCAL_KEY,deriveCanonTrajectoryR764,createCanonReplayCheckpointR764,verifyCanonReplayCheckpointR764} from '../../src/proof/canonTrajectoryR764.js';

type VerifiedSession={checkpoint:any;replay:ReturnType<typeof deriveCanonTrajectoryR764>};
const message=(e:unknown)=>e instanceof Error?e.message:String(e);

/** Cross-workspace execution handoff: a source-recomputed symbolic path drives the existing live traversal viewport. */
export default function VerifiedTrajectoryTraversalR766({onAddress}:{onAddress:(address:number)=>void}){
 const [session,setSession]=useState<VerifiedSession|null>(null);
 const [status,setStatus]=useState('Load a saved Science → Relativity path to drive this traversal view.');
 const [error,setError]=useState('');
 const read=()=>{
  const raw=localStorage.getItem(R764_LOCAL_KEY);
  if(raw===null)throw new Error('No browser-local R764 path checkpoint exists. Save one in Science → Relativity first.');
  const checkpoint=verifyCanonReplayCheckpointR764(raw);
  return {checkpoint,replay:deriveCanonTrajectoryR764(checkpoint.witness)};
 };
 const load=()=>{
  try{const verified=read();setSession(verified);setError('');
   setStatus('Verified symbolic path loaded. Select a frame to project its exact 20,736-address Atlas location.');}
  catch(e){setSession(null);setStatus('');setError('REFUSED: '+message(e));}
 };
 const project=(index:number)=>{
  try{
   if(!session)throw new Error('Load a verified path first');
   const fresh=read();
   if(JSON.stringify(fresh.checkpoint)!==JSON.stringify(session.checkpoint))
    throw new Error('Saved source changed since loading. Reload and reverify before traversing.');
   if(!Number.isSafeInteger(index)||index<0||index>=fresh.replay.frames.length)
    throw new RangeError('Frame is outside the verified path');
   const checkpoint=createCanonReplayCheckpointR764(fresh.checkpoint.witness,index);
   const raw=JSON.stringify(checkpoint);
   localStorage.setItem(R764_LOCAL_KEY,raw);
   verifyCanonReplayCheckpointR764(localStorage.getItem(R764_LOCAL_KEY)??'');
   const replay=deriveCanonTrajectoryR764(checkpoint.witness);
   const address=replay.frames[index].atlasAddress20736;
   onAddress(address);
   setSession({checkpoint,replay});setError('');
   setStatus('Projected verified frame '+(index+1)+' to Atlas address '+address+'; Science checkpoint updated.');
  }catch(e){setSession(null);setStatus('');setError('REFUSED: '+message(e));}
 };
 const frame=session?.checkpoint.frame??0;
 const current=session?.replay.frames[frame];
 return <section data-r766-traversal="executable" aria-label="Verified Canon trajectory traversal"
  style={{padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h2>R766 · Verified path → live traversal</h2>
  <p>Carry a saved, independently recomputed R763/R764 symbolic path from Science into the existing Matter, Immersive, Extreme or standard Traversal renderer. Each selected frame actually changes the shared Atlas viewport address; no CanonState mutation occurs.</p>
  <button type="button" data-r766-load onClick={load}>Load and verify Science path</button>
  {error&&<p data-r766-error role="alert">{error}</p>}
  {status&&<p data-r766-status role="status">{status}</p>}
  {session&&current&&<div data-r766-session>
   <p data-r766-frame>Frame {frame+1} / {session.replay.frames.length} · {current.key} · {current.decision} · Mode {current.mode188} · phase {current.phaseGroup} · Atlas address <b data-r766-address>{current.atlasAddress20736}</b></p>
   <svg data-r766-plot role="img" aria-label="Verified modeled score trajectory and selected frame" viewBox="0 0 700 200" width="100%" height="160">
    <polyline points={session.replay.plot.map(p=>p.x+','+p.y).join(' ')} fill="none" stroke="currentColor" strokeWidth="3"/>
    {session.replay.frames.map((f,i)=><circle key={f.index} cx={session.replay.plot[i].x} cy={session.replay.plot[i].y}
      r={i===frame?8:4} fill={i===frame?'#e5bf61':'#45a89b'} stroke={i===frame?'currentColor':'none'} strokeWidth="2">
      <title>{f.key+' · '+f.decision+' · modeled score '+f.score}</title>
     </circle>)}
   </svg>
   <p>Exact score carry {current.cumulativeExactDelta.numerator}/{current.cumulativeExactDelta.denominator} · boundary scars {current.cumulativeBoundaryScars} · outer domain {current.outerDomain}.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" data-r766-first disabled={frame===0} onClick={()=>project(0)}>First</button>
    <button type="button" data-r766-prev disabled={frame===0} onClick={()=>project(frame-1)}>Previous</button>
    <button type="button" data-r766-project onClick={()=>project(frame)}>Project current frame</button>
    <button type="button" data-r766-next disabled={frame===session.replay.frames.length-1} onClick={()=>project(frame+1)}>Next</button>
    <button type="button" data-r766-last disabled={frame===session.replay.frames.length-1} onClick={()=>project(session.replay.frames.length-1)}>Last</button>
   </div>
  </div>}
  <small data-r766-boundary>Source verification is repeated before every projection. Browser-local checkpoints can be replaced or deleted; stale or altered source refuses traversal. Ordinal motion and Atlas projection are modeled, not physical movement, historical donor authentication, native device execution or cross-device synchronization.</small>
 </section>;
}
