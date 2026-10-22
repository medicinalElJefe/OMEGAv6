export type FederationNodeKey='omegaV6'|'genesis'|'optical'|'sovereign';
export type FederationStateTone='ready'|'working'|'history'|'blocked'|'offline'|'unknown';

export const FEDERATION_NODE_ORDER_R102:FederationNodeKey[]=['genesis','optical','sovereign','omegaV6'];

export const FEDERATION_NODES_R102:Record<FederationNodeKey,{
 id:string;label:string;verb:string;role:string;value:string;input:string;output:string;truth:string;url:string|null;
}>={
 genesis:{
  id:'omega-genesis',label:'GENESIS',verb:'PROPOSE',role:'Exploration + candidate-family generation',
  value:'Expands the search space without being allowed to silently rewrite accepted state.',
  input:'intent · project context · canonical snapshot',output:'proposals · candidate families · alternatives',
  truth:'Genesis may own node-local working state, but global federation admission remains OMEGAv6 authority.',
  url:'https://omega-genesis-v1.jeffdeweyeljefe.workers.dev'
 },
 optical:{
  id:'omega-optical',label:'OPTICAL',verb:'SCREEN',role:'Compiler + reduced-order optical screening',
  value:'Turns large candidate sets into ranked, proof-admissible structures before expensive full-wave compute.',
  input:'candidate packets · geometry · wavelength · target phase',output:'ranked candidates · scalar metrics · Tier-2 requests',
  truth:'Scalar/reduced-order screening is evidence for routing; it is not full-wave validation.',
  url:'https://omega-living-light-etching-private-woven2.vercel.app'
 },
 sovereign:{
  id:'omega-sovereign',label:'SOVEREIGN',verb:'SOLVE',role:'Authenticated high-compute execution',
  value:'Runs expensive local/full-wave work under a bounded machine root and returns reproducible result receipts.',
  input:'approved Tier-2 jobs · solver/material/numerical settings',output:'RCWA/FDTD-class result packets · convergence metadata · hashes',
  truth:'ONLINE means a current authenticated machine heartbeat; historical pairing never substitutes for live proof.',
  url:null
 },
 omegaV6:{
  id:'omega-v6',label:'OMEGAv6',verb:'ADMIT',role:'Canonical operator + proof/admission authority',
  value:'Correlates every handoff into one state, one lineage, one durable project history and one operator experience.',
  input:'intent · proposals · screening · solver receipts · evidence',output:'admit/HOLD decision · CanonState · proof chain · durable continuity',
  truth:'OMEGAv6 is the only global federation CanonState mutation authority unless a governed migration explicitly changes it.',
  url:'https://omegav6.jeffdeweyeljefe.workers.dev'
 }
};

export function federationToneR102(state:string|undefined):FederationStateTone{
 const s=String(state||'').toUpperCase();
 if(['LIVE','PC_ONLINE','RCWA_ONLINE','VERIFIED_DEVICE_ONLINE'].includes(s))return'ready';
 if(s.includes('RUNNING')||s.includes('CHECKING')||s.includes('QUEUED'))return'working';
 if(s.includes('PREVIOUSLY')||s.includes('PAIRED_AWAITING'))return'history';
 if(s.includes('ACCESS_GATED')||s.includes('REQUIRED')||s.includes('HOLD')||s.includes('BLOCK'))return'blocked';
 if(s.includes('OFFLINE')||s.includes('UNREACHABLE')||s.includes('NOT_STARTED'))return'offline';
 return'unknown';
}

export function federationNodeStateR102(key:FederationNodeKey,nodes:any){
 if(key==='omegaV6')return String(nodes?.omegaV6?.state||'CHECKING');
 if(key==='genesis')return String(nodes?.genesis?.state||'CHECKING');
 if(key==='optical')return String(nodes?.optical?.state||'CHECKING');
 return String(nodes?.sovereign?.state||'CHECKING');
}

export function federationFlowR102(nodes:any,runtime:any){
 const genesis=federationToneR102(nodes?.genesis?.state),optical=federationToneR102(nodes?.optical?.state),host=federationToneR102(nodes?.sovereign?.state),rcwa=federationToneR102(nodes?.sovereign?.rcwaState);
 const hostReady=host==='ready',solverReady=rcwa==='ready';
 if(genesis!=='ready')return{stage:'PROPOSE',gate:'GENESIS',summary:'Proposal/exploration service is not currently verified.',action:'Recover Genesis machine health before expecting automated proposal handoff.'};
 if(optical!=='ready')return{stage:'SCREEN',gate:'OPTICAL',summary:'Genesis is available; Optical machine access is the current federation gate.',action:'Recover the protected Optical health/screen channel without exposing its service credential to the browser.'};
 if(!hostReady)return{stage:'SOLVE',gate:'SOVEREIGN_LINK',summary:'Proposal and screening layers are available; authenticated PC execution is not currently proved.',action:'Reconnect the persisted Hybrid bridge and start the bounded PC agent.'};
 if(!solverReady)return{stage:'SOLVE',gate:'FULL_WAVE',summary:'The PC is proved online, but the full-wave worker is not currently available.',action:'Start the RCWA worker under the authenticated bridge; later FDTD/FEM workers can join the same proof transport.'};
 const jobs=runtime?.rcwa?.counts||{};
 if(Number(jobs.running||0)>0)return{stage:'SOLVE',gate:'RUNNING',summary:'Full-wave validation is executing.',action:'Keep the host online; result admission remains held until convergence and lineage return.'};
 if(Number(jobs.queued||0)>0)return{stage:'SOLVE',gate:'QUEUED',summary:'A proof-admissible full-wave job is waiting for the Sovereign worker.',action:'Keep the RCWA worker online so it can claim the queued packet.'};
 return{stage:'ADMIT',gate:'READY',summary:'All four federation roles are available for a closed proof loop.',action:'Route a real intent/candidate through proposal → screen → solve → admit and inspect the shared lineage receipt.'};
}
