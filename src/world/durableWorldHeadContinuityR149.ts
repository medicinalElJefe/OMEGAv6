import {activeProjectIdR87,recordProjectWorldRefR149,syncProjectContinuityR97} from '../omegaProjectContinuityR87';

export const R149_REVISION='R149';
export const R149_SCHEMA='OMEGA_DURABLE_WORLD_HEAD_CONTINUITY_R149';
export const R149_LAWS=Object.freeze([
 'R140_WORLD_FRAME_IS_THE_ONLY_WORLD_HEAD_INPUT',
 'R134_OPERATION_REF_IS_CONTINUITY_EVIDENCE_NOT_CANONSTATE_ADMISSION',
 'R87_PROJECT_CONTINUITY_REMAINS_THE_BROWSER_CACHE_AND_ORGANIZATION_LAYER',
 'R97_AUTHENTICATED_CONTINUITY_SYNC_REMAINS_THE_ONLY_DURABLE_TRANSPORT_USED_HERE',
 'UNPAIRED_STATE_REMAINS_BROWSER_LOCAL_WITHOUT_FALSE_DURABILITY_CLAIMS',
 'WORLD_HEAD_PERSISTENCE_DOES_NOT_PROVE_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_OR_PHOTOREAL_REALITY',
 'NO_NEW_DURABLE_OBJECT_OR_CANONSTATE_AUTHORITY_IS_INTRODUCED',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

function validReceipt(receipt:any){
 const ref=receipt?.frame?.operationRef;
 return Boolean(
  receipt?.schema==='OMEGA_LIVING_WORLD_OPERATION_BRIDGE_R140'&&
  ref?.schema==='OMEGA_CONTINUITY_OPERATION_REF_R134'&&
  ref?.worldId==='OMEGA_CANONICAL_WORLD'&&
  /^[a-f0-9]{64}$/.test(String(ref?.headSha256||''))&&
  ref?.authority==='DURABLE_CONTINUITY_REFERENCE_NOT_CANON'&&
  ref?.canonicalMutation===false
 );
}

export async function persistWorldHeadR149(receipt:any){
 if(!validReceipt(receipt))return{ok:false,schema:R149_SCHEMA,revision:R149_REVISION,state:'REJECTED_INVALID_R140_WORLD_RECEIPT',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const projectId=activeProjectIdR87();
 if(!projectId)return{ok:false,schema:R149_SCHEMA,revision:R149_REVISION,state:'NO_ACTIVE_PROJECT',headSha256:receipt.frame.operationRef.headSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const project=await recordProjectWorldRefR149(projectId,receipt);
 if(!project)return{ok:false,schema:R149_SCHEMA,revision:R149_REVISION,state:'PROJECT_REFERENCE_REJECTED',projectId,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const sync=await syncProjectContinuityR97();
 return{
  ok:true,schema:R149_SCHEMA,revision:R149_REVISION,state:sync?.ok?sync.state:'BROWSER_LOCAL_ONLY',projectId,
  headSha256:receipt.frame.operationRef.headSha256,worldId:'OMEGA_CANONICAL_WORLD',operationRef:receipt.frame.operationRef,
  durableSync:sync,canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R149 stores the existing R134 continuity operation reference inside the existing R87 project snapshot and asks the existing authenticated R97 continuity transport to synchronize it. A paired authenticated sync can make the reference recoverable across sessions; an unpaired or failed sync remains browser-local. Neither state proves deployment, native execution, solver validity, photoreal rendering, or CanonState admission.'
 };
}

let installed=false;
export function installDurableWorldHeadContinuityR149(){
 if(installed||typeof window==='undefined')return false;
 installed=true;
 window.addEventListener('omega-r140-world-frame',((e:Event)=>{
  const receipt=(e as CustomEvent<any>).detail;
  void persistWorldHeadR149(receipt).then(result=>window.dispatchEvent(new CustomEvent('omega-r149-world-continuity',{detail:result}))).catch(()=>{});
 }) as EventListener);
 return true;
}

export function manifestR149(){return{
 ok:true,schema:'OMEGA_DURABLE_WORLD_HEAD_CONTINUITY_MANIFEST_R149',revision:R149_REVISION,laws:R149_LAWS,
 chain:['R86 operation','R140 living-world bridge','R136 adaptive visual frame','R134 continuity operation ref','R149 project world ref','R87 project snapshot','R97 authenticated continuity sync'],
 persistence:{browserCache:'R87',durableTransport:'R97',worldAuthority:'R134',admissionAuthority:'R125',newDurableAuthorityIntroduced:false},
 truthBoundary:'R149 advances recoverable canonical-world continuity only. It cannot manufacture public deployment proof, PC-online proof, scientific solver validation, or computed-photoreal validation.'
};}
