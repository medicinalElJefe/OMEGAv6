export const B015_REQUIRED_LIVE_STATE=Object.freeze(['UNIVERSE_PULSE.json','PHASE_AWARENESS.json','GEOMETRY_FRAME.json','LEMMA_NET.json','CANON_AWARENESS.json','AWARENESS_STATE.json','PERFORMANCE_STATE.json','PROOF_STATE.json','PROVIDER_STATE.json','PROJECTION_STATE.json','EXECUTION_STATE.json','STATE_SPINE_CHECKPOINT.json','EVERYWHERE_HUB_STATUS.json','SELF_MONITOR_STATUS.json']);

const item=(file,reality,value,proof,authority)=>({file,reality,value,proof,authority});

export function workerLiveStateSpine({status,restoration,provider,publicUrl,now=new Date().toISOString()}){
 const cloudLive=restoration?.liveDeploymentVerification==='LIVE_PASS';
 const hybrid=status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED';
 const earth=status?.earth?.liveFeeds||'EXTERNAL_DEGRADED_UNTIL_BOUND';
 const aiBound=Boolean(status?.workersAI?.bound);
 const rows=[
  item('UNIVERSE_PULSE.json','SOURCE_CONTEXT_REQUIRED','BROWSER_PACKET_REQUIRED','Canonical packet state is client supplied; Worker will not invent a state ID or metric tuple.','canonical packet runtime'),
  item('PHASE_AWARENESS.json','SOURCE_CONTEXT_REQUIRED','BROWSER_PACKET_REQUIRED','Phase derives from canonical address; absent from a stateless Worker request.','canonical address decoder'),
  item('GEOMETRY_FRAME.json','CLOUD_LIVE','12 / 144 / 1728 / 20736','Representational hierarchy registered in deployed source.','deployed OMEGA source'),
  item('LEMMA_NET.json','CLOUD_LIVE','179 SOURCE EVALUATIONS','Registry count is source metadata, not a claim of hidden execution.','deployed source registry'),
  item('CANON_AWARENESS.json','SOURCE_CONTEXT_REQUIRED','BROWSER_PACKET_REQUIRED','Decision/scar/evidence belong to a canonical packet supplied by the runtime.','Mode188/source calculus'),
  item('AWARENESS_STATE.json','SOURCE_CONTEXT_REQUIRED','BROWSER_PACKET_REQUIRED','Worker request context alone does not identify the active browser packet.','browser workstation'),
  item('PERFORMANCE_STATE.json',cloudLive?'CLOUD_LIVE':'UNAVAILABLE',cloudLive?'PUBLIC WORKER VERIFIED':'PUBLIC WORKER NOT VERIFIED',publicUrl,'Cloudflare deployment + canonical probes'),
  item('PROOF_STATE.json',cloudLive?'CLOUD_LIVE':'UNAVAILABLE',restoration?.state||'unknown',`deployment verification ${restoration?.liveDeploymentVerification||'unknown'}`,'release evidence workflow + canonical probes'),
  item('PROVIDER_STATE.json',aiBound?'PROVIDER_BOUND':'CLOUD_LIVE',provider,'Provider is synthesis-only and never source authority.','Worker environment/status envelope'),
  item('PROJECTION_STATE.json','SOURCE_CONTEXT_REQUIRED','BROWSER_PROJECTION_REQUIRED','Projection/frame hash belongs to the current browser render packet.','projection bridge'),
  item('EXECUTION_STATE.json',hybrid==='VERIFIED'?'CLOUD_LIVE':'DEVICE_PROOF_REQUIRED',hybrid,hybrid==='VERIFIED'?'paired-host proof returned':'No native execution is claimed without a paired-host proof channel.','Hybrid proof boundary'),
  item('STATE_SPINE_CHECKPOINT.json','SOURCE_CONTEXT_REQUIRED','BROWSER_CHECKPOINT_REQUIRED','Checkpoint identity is carried by canonical packet/browser persistence.','state-spine checkpoint boundary'),
  item('EVERYWHERE_HUB_STATUS.json',cloudLive?'CLOUD_LIVE':'UNAVAILABLE',cloudLive?'PUBLIC CLOUD NODE LIVE':'PUBLIC NODE NOT VERIFIED',`Hybrid ${hybrid} · Earth ${earth}`,'Worker status + bounded external contracts'),
  item('SELF_MONITOR_STATUS.json',cloudLive?'CLOUD_LIVE':'UNAVAILABLE',cloudLive?'CLOUD SELF-CHECK AVAILABLE':'CLOUD SELF-CHECK UNVERIFIED','Worker health/status/restoration can be reconciled; native B015 crash watchdog is not claimed here.','R51 Worker monitor boundary')
 ];
 const present=B015_REQUIRED_LIVE_STATE.filter(f=>rows.some(r=>r.file===f)).length;
 return{ok:true,schema:'OMEGA_WORKER_LIVE_STATE_R51',generatedAt:now,required:B015_REQUIRED_LIVE_STATE.length,present,complete:present===B015_REQUIRED_LIVE_STATE.length,rows,boundary:'This endpoint is the stateless public-Worker expression of the B015 live-state contract. SOURCE_CONTEXT_REQUIRED means the Worker refuses to invent browser/canonical packet state. DEVICE_PROOF_REQUIRED remains in force for native execution. Native B015 filesystem artifacts, Windows watchdog, installer gates and transactional rollback require target-machine proof.'};
}
