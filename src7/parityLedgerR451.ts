import {OMEGA7_CAPABILITIES} from './capabilityRegistry';

export const R451_SCHEMA='OMEGA7_PARITY_EVIDENCE_R451' as const;
export type Omega7ParityLevel='ADAPTED'|'INTERACTION_PROVED'|'REPRESENTATIVE_PERFORMANCE_PROVED'|'FULL_PARITY_EVIDENCE';

const PERFORMANCE_ROUTES=new Set([
 'Command Center','Earth Now','Traversal','Relativity','Forecast','Workspace','Hybrid Link','Evidence & Proof'
]);
const FAILURE_RECOVERY_ROUTES=new Map<string,string>([
 ['Workspace','LAZY_CHUNK_FAILURE_ISOLATION'],
 ['Earth Now','POST_FAILURE_ALTERNATE_ROUTE_RECOVERY'],
 ['Hybrid Link','API_LOSS_FAIL_CLOSED']
]);

export type Omega7ParityEvidenceRow={
 capabilityId:string;
 legacyRoute:string;
 functionalProved:true;
 desktopProved:true;
 mobileTouchProved:true;
 failureRecoveryProved:boolean;
 failureRecoveryClass:string|null;
 performanceProved:boolean;
 rollbackEnvelopeProved:true;
 parityLevel:Omega7ParityLevel;
 remaining:('FAILURE_RECOVERY'|'PERFORMANCE')[];
 proofAuthority:{
  interaction:'R446_OMEGA_CLOUD_BRIDGE';
  failurePerformance:'R447_OMEGA_CLOUD_BRIDGE';
  rollback:'R449_OMEGA_CLOUD_BRIDGE';
 };
 canonicalMutation:false;
};

export const OMEGA7_PARITY_EVIDENCE:readonly Omega7ParityEvidenceRow[]=OMEGA7_CAPABILITIES.map(cap=>{
 const failureClass=FAILURE_RECOVERY_ROUTES.get(cap.legacyRoute)||null;
 const failureRecoveryProved=Boolean(failureClass);
 const performanceProved=PERFORMANCE_ROUTES.has(cap.legacyRoute);
 const remaining:Omega7ParityEvidenceRow['remaining']=[];
 if(!failureRecoveryProved)remaining.push('FAILURE_RECOVERY');
 if(!performanceProved)remaining.push('PERFORMANCE');
 const parityLevel:Omega7ParityLevel=
  failureRecoveryProved&&performanceProved?'FULL_PARITY_EVIDENCE':
  performanceProved?'REPRESENTATIVE_PERFORMANCE_PROVED':'INTERACTION_PROVED';
 return{
  capabilityId:cap.id,
  legacyRoute:cap.legacyRoute,
  functionalProved:true,
  desktopProved:true,
  mobileTouchProved:true,
  failureRecoveryProved,
  failureRecoveryClass:failureClass,
  performanceProved,
  rollbackEnvelopeProved:true,
  parityLevel,
  remaining,
  proofAuthority:{
   interaction:'R446_OMEGA_CLOUD_BRIDGE',
   failurePerformance:'R447_OMEGA_CLOUD_BRIDGE',
   rollback:'R449_OMEGA_CLOUD_BRIDGE'
  },
  canonicalMutation:false
 };
});

const count=(fn:(row:Omega7ParityEvidenceRow)=>boolean)=>OMEGA7_PARITY_EVIDENCE.filter(fn).length;
export const OMEGA7_PARITY_SUMMARY=Object.freeze({
 schema:R451_SCHEMA,
 total:OMEGA7_PARITY_EVIDENCE.length,
 functionalDesktopMobile:count(()=>true),
 failureRecovery:count(x=>x.failureRecoveryProved),
 performance:count(x=>x.performanceProved),
 fullParityEvidence:count(x=>x.parityLevel==='FULL_PARITY_EVIDENCE'),
 legacyRetired:0,
 remainingFailureRecovery:count(x=>!x.failureRecoveryProved),
 remainingPerformance:count(x=>!x.performanceProved),
 canonicalMutation:false
});

export function parityEvidenceForRoute(route:string){
 return OMEGA7_PARITY_EVIDENCE.find(x=>x.legacyRoute===route)||null;
}
