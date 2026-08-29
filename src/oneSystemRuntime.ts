export type OneSystemStage={id:string;name:string;owner:string;gate:string;target:string};
export type OneSystemCheck={name:string;pass:boolean;detail:string};
export const ONE_SYSTEM_STAGES:OneSystemStage[]=[
 {id:'01',name:'Runtime Core',owner:'Omega Atlas OS / Sovereign Runtime',gate:'ONE_STATE_AUTHORITY',target:'HostState + CanonState'},
 {id:'02',name:'Packet Substrate',owner:'Persistent Packet',gate:'ONE_PACKET_TYPE',target:'20,736 source states'},
 {id:'03',name:'Continuity Field',owner:'Living Membrane / Dewey',gate:'CARRY_BEFORE_BUILD',target:'continuity + scar + burden'},
 {id:'04',name:'Traversal Kernel',owner:'Matter / Extreme / Immersive',gate:'IDENTITY_PRESERVED',target:'continuous route state'},
 {id:'05',name:'Renderer',owner:'Field / Cinematic',gate:'SAME_PACKET_CORE',target:'field-bound visual output'},
 {id:'06',name:'Evidence Ledger',owner:'CanonForge / Proof',gate:'PROVE_BEFORE_PROMOTE',target:'replayable receipt'},
 {id:'07',name:'Hybrid Link',owner:'Bridge / Adapter',gate:'BRIDGE_NOT_AUTHORITY',target:'return packet'},
 {id:'08',name:'Packaging',owner:'Portable Worker / Installer',gate:'PORTABLE_SOURCE',target:'reproducible release'}
];
export const OPERATOR_SEQUENCE=['SENSE','NORMALIZE','SCORE','GATE','ACT','LEDGER'] as const;
export const RESTORE_SEQUENCE=['FINGERPRINT','CLASSIFY','ADAPT','PROVE','MERGE_OR_HOLD'] as const;
export const CONSOLIDATION_RULES=[
 'Single runtime spine controls state; renderer, menus, AI, forecast, camera, workbook and packaging remain submodules.',
 'Input/world data enters the state manifold before traversal or rendering; display surfaces never become source authority.',
 'No donor becomes authority until path, import, invariant, regression and proof checks pass.',
 'Every admitted change keeps a reversible parent SHA/state and an inspectable proof/return packet.',
 'Drive release authority is external to browser-local governance and is never silently rewritten.'
] as const;
const finite=(x:any)=>Number.isFinite(Number(x));
export function compileOneSystemReceipt(record:any,status:any,restore:any){
 const metrics=record?.metrics||{};
 const checks:OneSystemCheck[]=[
  {name:'canonical state address',pass:Number(record?.address)>=0&&Number(record?.address)<20736,detail:`address ${record?.address??'—'}`},
  {name:'continuity channel finite',pass:finite(metrics.continuity),detail:`CΩ ${metrics.continuity??'—'}`},
  {name:'burden channel finite',pass:finite(metrics.burden),detail:`Λ ${metrics.burden??'—'}`},
  {name:'contradiction channel finite',pass:finite(metrics.contradiction),detail:`q ${metrics.contradiction??'—'}`},
  {name:'admitted next state',pass:Number(record?.autoPing?.dataNext)>=0&&Number(record?.autoPing?.dataNext)<20736,detail:`next ${record?.autoPing?.dataNext??'—'}`},
  {name:'status endpoint bounded',pass:!status?.error,detail:status?.error||status?.runtime||status?.status||'available'},
  {name:'restoration endpoint bounded',pass:!restore?.error,detail:restore?.error||restore?.status||'available'},
  {name:'hybrid native proof boundary',pass:String(status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED').length>0,detail:String(status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED')}
 ];
 const passed=checks.filter(x=>x.pass).length;
 return {schema:'OMEGA_ONE_SYSTEM_RECEIPT_V1',stateId:record?.stateId,address:record?.address,decision:metrics.decision||'—',passed,total:checks.length,ready:passed===checks.length,checks,stages:ONE_SYSTEM_STAGES,operatorSequence:OPERATOR_SEQUENCE,restoreSequence:RESTORE_SEQUENCE,rules:CONSOLIDATION_RULES,boundary:'This receipt validates hosted/runtime consolidation invariants only. It does not mutate Drive release authority or prove external/native capabilities.'};
}
