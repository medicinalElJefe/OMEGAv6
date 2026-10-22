export const HYBRID_DONOR={
  title:'OMEGA_HYBRID_LINK_61917364224D_FULL_CHART_v21.xlsx',
  addressSpace:61917364224,
  packetSpace:20736,
  moduleCount:16,
  componentCount:24,
  phaseCount:12,
  gridRows:4608,
  coreIntent:'BRIDGE / VERIFY / RETURN',
  authorityRule:'bridge is connective tissue, never final runtime authority'
} as const;

export const HYBRID_PHASES=['01 Intent Lock','02 Source Intake','03 Fingerprint','04 Authority Score','05 Link Handshake','06 Conflict Pass','07 Merge/Quarantine','08 Return Packet','09 Runtime Sync','10 Proof Ledger','11 Package/Repair','12 Verification'] as const;

export const HYBRID_COMPONENTS=['IntentContract','SourceFingerprint','DonorRegistry','AdapterContract','Handshake','AuthorityScore','ConflictScan','QuarantineRule','MergeRule','ReturnPacket','ProofToken','Checksum','RollbackPoint','PatchDelta','OperatorDecision','RouteMap','NegativeSpaceMap','TopologyGraph','WorkbookSync','RuntimeSync','RendererSync','CLICommand','HealthCheck','SupportBundle'] as const;

export const HYBRID_MODULES=[
 ['HL00','Hybrid Link Mission Core','BRIDGE_NOT_RENDER','Bridge separate runtimes, files, ledgers, operators, and evidence streams without pretending they are one source.'],
 ['HL01','Link Kernel','HANDSHAKE_SPINE','Canonical link contract: request, proof, response, correction, return packet.'],
 ['HL02','Donor Intake Engine','SAFE_IMPORT','Import old builds/zips/files as donors, not authorities.'],
 ['HL03','Adapter Layer','MULTI_HOST_BRIDGE','Adapters for filesystem, workbook, runtime, renderer, CLI, API, desktop, logs.'],
 ['HL04','Authority Resolver','NO_SHADOW_STATE','Determines canonical source of truth and prevents duplicate downstream authority.'],
 ['HL05','Conflict Engine','MERGE_OR_QUARANTINE','Detects collisions, version drift, incompatible claims, and conflicting files.'],
 ['HL06','Return Packet Generator','CLOSURE_OUTPUT','Every link produces a reusable packet: summary, invariant, correction, next action, proof.'],
 ['HL07','Operator Dashboard','HUMAN_IN_LOOP','Interface helps operator execute workflow without replacing judgment.'],
 ['HL08','Recovery Board','ARTIFACT_TRIAGE','Classifies artifacts KEEP / DONOR / QUARANTINE / EXPAND NEXT.'],
 ['HL09','Patch / Delta System','SAFE_UPGRADE','Chained patches, backup/restore, checksum, rollback, repair.'],
 ['HL10','Ledger / Proof Spine','AUDIT_TRAIL','Every action is hashed, evidence-bound, reversible when possible.'],
 ['HL11','Transport Layer','LOCAL_FIRST_BRIDGE','CLI, WebSocket, localhost service, file bridge, desktop launcher transport.'],
 ['HL12','Renderer Bridge','FIELD_OUTPUT_LINK','Links state packets to images/video without letting render become authority.'],
 ['HL13','Workbook Bridge','EXCEL_ATLAS_LINK','Uses workbooks as atlas/ledger/control planes, not hidden runtime truth.'],
 ['HL14','Security Boundary','SANDBOX_GATE','Quarantine, allowlist, safe extraction, no blind execution of donor code.'],
 ['HL15','Packaging / Release','ONE_CLICK_HYBRID','Produces standalone hybrid package, proof report, launchers, and support bundle.']
] as const;

export const HYBRID_ADAPTERS=[
 ['Filesystem Adapter','zip/files/folders','fingerprinted donor records','never execute blindly'],
 ['Workbook Adapter','xlsx/csv','atlas/ledger tables','sheet is control plane, not hidden authority'],
 ['Runtime Adapter','local service/CLI','health/proof state','runtime emits evidence only'],
 ['Renderer Adapter','packet state','PNG/MP4/WebGPU frame','render is output, not source of truth'],
 ['Patch Adapter','delta package','backup/restore state','rollback mandatory'],
 ['WebSocket Adapter','live state stream','operator dashboard feed','message schema required']
] as const;

export const HYBRID_TESTS=[
 ['HT01','fingerprint duplicate detection','ACTIVE'],['HT02','safe zip extraction','ACTIVE'],['HT03','authority resolver no-shadow-state','ACTIVE'],['HT04','conflict scan quarantine','ACTIVE'],['HT05','adapter contract validation','ACTIVE'],['HT06','return packet completeness','ACTIVE'],['HT07','recovery board classification','ACTIVE'],['HT08','patch rollback proof','ACTIVE'],['HT09','workbook bridge roundtrip','PLANNED'],['HT10','runtime health check','PLANNED'],['HT11','renderer bridge output proof','PLANNED'],['HT12','support bundle completeness','PLANNED']
] as const;

export type HybridMetrics={continuity:number;burden:number;contradiction:number;evidence:number;scar?:number};
export type HybridPhaseState={phase:string;decision:'LINK'|'REPAIR'|'RETURN'|'QUARANTINE'|'LEDGER';score:number;proofRequired:boolean};
export type HybridMission={id:string;command:string;adapter:string;component:string;authority:'EVIDENCE_BOUND';deviceProof:string;linkRatio:number;handoff:number;triage:number;scar:number;returnSignal:number;decision:HybridPhaseState['decision'];phases:HybridPhaseState[];returnPacket:{field_object_id:string;summary:string;invariant_returned:string;correction:string;next_action:string;proof_status:string;reusable_rule:string}};

const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
export function fingerprint(text:string){return hash(text.trim().toLowerCase()).toString(16).padStart(8,'0')}
export function classifyAdapter(command:string){const s=command.toLowerCase();if(/xlsx|csv|workbook|sheet|excel/.test(s))return 'Workbook Adapter';if(/png|mp4|render|frame|image|video/.test(s))return 'Renderer Adapter';if(/patch|delta|rollback|repair|upgrade/.test(s))return 'Patch Adapter';if(/websocket|socket|stream|peer|phone|remote/.test(s))return 'WebSocket Adapter';if(/service|health|process|runtime|cli|command/.test(s))return 'Runtime Adapter';return 'Filesystem Adapter'}
export function linkRatio(continuity:number,bridgeLoad:number,contradiction:number){const d=bridgeLoad+contradiction+bridgeLoad*contradiction;return d<=0?1:continuity/d}
export function compileHybridMission(command:string,metrics:HybridMetrics,deviceProof='DEVICE_PROOF_REQUIRED'):HybridMission{
 const fp=fingerprint(command),seed=parseInt(fp,16)>>>0,adapter=classifyAdapter(command),component=HYBRID_COMPONENTS[seed%HYBRID_COMPONENTS.length];
 const C=clamp(metrics.continuity),q=clamp(metrics.contradiction),load=clamp((metrics.burden+q*.35)/1.35),trust=clamp((C+metrics.evidence+(1-q))/3),latency=clamp(.12+((seed%29)/100));
 const ratio=linkRatio(C,load,q),handoff=clamp(C*.34+trust*.34+(1-latency)*.16+(1-q)*.16),triage=clamp(Math.pow(Math.max(1e-8,C*trust*(1-load)*(1-q)*handoff),1/5)),scar=clamp((load+q+latency)/3),returnSignal=clamp((handoff+trust+triage+(1-scar)+C)/5);
 const native=/keyboard|mouse|filesystem|process|execute|install|launch|remote desktop|screen control/.test(command.toLowerCase()),proofMissing=deviceProof!=='VERIFIED';
 const phases=HYBRID_PHASES.map((phase,i)=>{const pressure=clamp((q+load)*(i/22)),score=clamp(returnSignal-pressure*.28+(i>6?triage*.08:0));let decision:HybridPhaseState['decision']=score>.68?'LINK':score>.47?'RETURN':'REPAIR';if(i===6&&q>.72)decision='QUARANTINE';if(i===9&&proofMissing)decision='LEDGER';if(native&&proofMissing&&i>=4)decision=i===6?'QUARANTINE':'REPAIR';return{phase,decision,score,proofRequired:true}});
 const final=phases[phases.length-1].decision,blocked=native&&proofMissing;
 return{id:`HL-${fp}`,command,adapter,component,authority:'EVIDENCE_BOUND',deviceProof,linkRatio:ratio,handoff,triage,scar,returnSignal,decision:blocked?'REPAIR':final,phases,returnPacket:{field_object_id:`hybrid://${fp}`,summary:blocked?'native action planned but not executed':'mission classified, scored and closed through Hybrid Link lifecycle',invariant_returned:'bridge may route evidence and plans but never impersonates runtime or device authority',correction:blocked?'hold execution until authenticated device heartbeat/proof return':'retain authority boundary and adapter truth rule',next_action:blocked?'obtain VERIFIED device proof, then re-evaluate the same mission packet':'route the return packet to the selected adapter or operator',proof_status:blocked?'PROOF_REQUIRED':final==='QUARANTINE'?'QUARANTINE':'STABLE',reusable_rule:'donors and remote actions never override canon without proof and tests'}};
}
