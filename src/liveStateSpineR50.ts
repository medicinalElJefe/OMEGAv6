export type SpineReality='SOURCE_LIVE'|'BROWSER_LIVE'|'CLOUD_LIVE'|'PROVIDER_BOUND'|'EXTERNAL_DEGRADED'|'DEVICE_PROOF_REQUIRED'|'UNAVAILABLE';
export type LiveStateArtifact={file:string;label:string;reality:SpineReality;value:string;proof:string;authority:string};

export const B015_REQUIRED_LIVE_STATE=[
 'UNIVERSE_PULSE.json','PHASE_AWARENESS.json','GEOMETRY_FRAME.json','LEMMA_NET.json','CANON_AWARENESS.json','AWARENESS_STATE.json','PERFORMANCE_STATE.json','PROOF_STATE.json','PROVIDER_STATE.json','PROJECTION_STATE.json','EXECUTION_STATE.json','STATE_SPINE_CHECKPOINT.json','EVERYWHERE_HUB_STATUS.json','SELF_MONITOR_STATUS.json'
] as const;

const finite=(v:any)=>Number.isFinite(Number(v));
const n=(v:any,d=3)=>finite(v)?Number(v).toFixed(d):'unknown';

export function compileLiveStateSpine(record:any,status:any,restore:any,extra?:{frameHash?:string;projectionView?:string;operatorLedgerCount?:number}){
 const m=record?.metrics||{},cloudLive=status?.cloud?.liveDeploymentVerification==='LIVE_PASS'||restore?.liveDeploymentVerification==='LIVE_PASS';
 const provider=status?.workersAI?.bound?`WORKERS_AI_BOUND:${status.workersAI.model}`:(status?.modelProvider||'GROUNDED_RUNTIME_ONLY');
 const hybrid=status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED';
 const stateId=record?.stateId??'unknown',address=finite(record?.address)?Number(record.address):Math.max(0,Number(stateId||1)-1),phase=Math.floor(address/144)%12+1;
 const decision=m.decision||record?.decision||'unknown';
 const rows:LiveStateArtifact[]=[
  {file:'UNIVERSE_PULSE.json',label:'Universe pulse',reality:'SOURCE_LIVE',value:`STATE ${stateId} · ${decision}`,proof:`CΩ ${n(m.continuity)} · Φ ${n(m.plasticity)} · q ${n(m.contradiction)} · Λ ${n(m.burden)}`,authority:'canonical packet runtime'},
  {file:'PHASE_AWARENESS.json',label:'Phase awareness',reality:'SOURCE_LIVE',value:`PHASE ${phase} / 12`,proof:`address ${address+1} / 20,736`,authority:'canonical address decoder'},
  {file:'GEOMETRY_FRAME.json',label:'Geometry frame',reality:'SOURCE_LIVE',value:`12 / 144 / 1728 / 20736`,proof:`representational hierarchy · state ${stateId}`,authority:'source-backed corpus geometry'},
  {file:'LEMMA_NET.json',label:'Lemma net',reality:'SOURCE_LIVE',value:`${record?.modeEvaluations?.length||record?.modeCount||179} evaluations`,proof:'source registry evaluation; membership is not hidden execution',authority:'mode/canon registry'},
  {file:'CANON_AWARENESS.json',label:'Canon awareness',reality:'SOURCE_LIVE',value:`${decision}`,proof:`scar ${n(m.scar)} · evidence ${n(m.evidence)}`,authority:'Mode188 / source calculus'},
  {file:'AWARENESS_STATE.json',label:'Awareness state',reality:'BROWSER_LIVE',value:`STATE ${stateId} · address ${address+1}`,proof:`current UI packet and operator context`,authority:'browser workstation projection'},
  {file:'PERFORMANCE_STATE.json',label:'Performance state',reality:cloudLive?'CLOUD_LIVE':'UNAVAILABLE',value:cloudLive?'PUBLIC WORKER LIVE':'public deployment not proven',proof:status?.cloud?.publicUrl||restore?.publicUrl||'no public URL returned',authority:'Cloudflare deployment receipt + health probes'},
  {file:'PROOF_STATE.json',label:'Proof state',reality:cloudLive?'CLOUD_LIVE':'BROWSER_LIVE',value:cloudLive?'LIVE PASS':'LOCAL PROOF ONLY',proof:`restoration ${restore?.state||status?.restoration?.state||'unknown'}`,authority:'release evidence + local proof ledger'},
  {file:'PROVIDER_STATE.json',label:'Provider state',reality:status?.workersAI?.bound?'PROVIDER_BOUND':'BROWSER_LIVE',value:provider,proof:'provider remains synthesis-only, never source authority',authority:'worker status envelope'},
  {file:'PROJECTION_STATE.json',label:'Projection state',reality:'BROWSER_LIVE',value:extra?.projectionView||'FIELD',proof:extra?.frameHash?`frame ${extra.frameHash.slice(0,16)}…`:'current render packet; frame hash not supplied',authority:'projection bridge / renderer'},
  {file:'EXECUTION_STATE.json',label:'Execution state',reality:hybrid==='VERIFIED'?'CLOUD_LIVE':'DEVICE_PROOF_REQUIRED',value:hybrid,proof:hybrid==='VERIFIED'?'paired-host proof returned':'native mutation cannot be claimed from cloud UI',authority:'Hybrid proof boundary'},
  {file:'STATE_SPINE_CHECKPOINT.json',label:'State spine checkpoint',reality:'BROWSER_LIVE',value:`STATE ${stateId} · ${decision}`,proof:`operator ledger ${extra?.operatorLedgerCount??0} · address ${address+1}`,authority:'browser persistence + deterministic packet identity'},
  {file:'EVERYWHERE_HUB_STATUS.json',label:'Everywhere hub status',reality:cloudLive?'CLOUD_LIVE':'UNAVAILABLE',value:cloudLive?'PUBLIC CLOUD NODE LIVE':'public node not proven',proof:`Hybrid ${hybrid} · Earth ${status?.earth?.liveFeeds||'EXTERNAL_DEGRADED_UNTIL_BOUND'}`,authority:'cloud status + external truth gates'},
  {file:'SELF_MONITOR_STATUS.json',label:'Self monitor status',reality:cloudLive?'CLOUD_LIVE':'BROWSER_LIVE',value:cloudLive?'MONITORING ACTIVE':'LOCAL MONITORING',proof:`health/status/restoration reconciliation · state ${stateId}`,authority:'R50 reconciler; not a claim of native watchdog execution'}
 ];
 return rows;
}

export function spineSummary(rows:LiveStateArtifact[]){const counts=rows.reduce((a,r)=>{a[r.reality]=(a[r.reality]||0)+1;return a},{ } as Record<SpineReality,number>);return{required:B015_REQUIRED_LIVE_STATE.length,present:rows.length,complete:rows.length===B015_REQUIRED_LIVE_STATE.length&&B015_REQUIRED_LIVE_STATE.every(x=>rows.some(r=>r.file===x)),counts,boundary:'R50 materializes the B015 required live-state contract in the current cloud/browser successor. It does not claim that browser-derived artifacts are the native B015 filesystem files or that the B015 Windows watchdog is running without target-machine proof.'}}
