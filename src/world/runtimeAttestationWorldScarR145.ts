import {emitOperationR86} from '../omegaOperationBusR86';

export const R145_REVISION='R145';
export const R145_SCHEMA='OMEGA_RUNTIME_ATTESTATION_WORLD_SCAR_R145';
export const R145_LAWS=Object.freeze([
 'R144_RUNTIME_ATTESTATION_IS_READ_ONLY_WORLD_EVIDENCE',
 'ATTESTATION_RETURN_DOES_NOT_PROVE_PUBLIC_DEPLOYMENT_OR_EXTERNAL_VERIFICATION',
 'R86_REMAINS_OPERATION_EVENT_AUTHORITY',
 'R140_REMAINS_LIVING_WORLD_OPERATION_BRIDGE',
 'R134_REMAINS_CANONICAL_WORLD_CONTINUITY_AUTHORITY',
 'R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'
]);

const text=(v:unknown,n=180)=>String(v??'').trim().slice(0,n);
const unique=(values:unknown[])=>[...new Set(values.map(v=>text(v)).filter(Boolean))];

export function compileRuntimeAttestationScarR145(attestation:any){
 if(attestation?.schema!=='OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144'||attestation?.revision!=='R144'||!text(attestation?.attestationSha256))return null;
 const sourceIds=unique([
  attestation.attestationSha256,
  attestation?.bindings?.sourceSha,
  attestation?.bindings?.packageReceiptSha256,
  attestation?.bindings?.cloudflareVersionId
 ]);
 return{
  runtimeAttestationReturned:true,
  runtimeAttestationSchema:attestation.schema,
  runtimeAttestationRevision:attestation.revision,
  sourceIds,
  scarIds:[text(attestation.attestationSha256)],
  attestationSha256:text(attestation.attestationSha256),
  packagedSourceSha:text(attestation?.bindings?.sourceSha)||null,
  packageReceiptSha256:text(attestation?.bindings?.packageReceiptSha256)||null,
  cloudflareVersionId:text(attestation?.bindings?.cloudflareVersionId)||null,
  lifecycle:{
   implemented:text(attestation?.lifecycle?.implemented)||'UNAVAILABLE',
   tested:text(attestation?.lifecycle?.tested)||'EXTERNAL_GITHUB_EVIDENCE_REQUIRED',
   merged:text(attestation?.lifecycle?.merged)||'EXTERNAL_RELEASE_LEDGER_REQUIRED',
   deployed:text(attestation?.lifecycle?.deployed)||'UNVERIFIED',
   live:text(attestation?.lifecycle?.live)||'UNVERIFIED',
   verified:text(attestation?.lifecycle?.verified)||'EXTERNAL_FIRST_HAND_PROBE_REQUIRED'
  },
  canonicalMutation:false,
  publicDeploymentProved:false,
  externalVerificationProved:false
 };
}

export async function captureRuntimeAttestationWorldScarR145(fetcher:typeof fetch=fetch){
 const response=await fetcher('/api/runtime-attestation',{cache:'no-store'});
 if(!response.ok)throw new Error(`runtime attestation HTTP ${response.status}`);
 const attestation=await response.json();
 const payload=compileRuntimeAttestationScarR145(attestation);
 if(!payload)throw new Error('R144 runtime attestation payload is not authority-bound');
 const event=await emitOperationR86({
  type:'PROOF_REFRESHED',surface:'System',status:'INFO',
  detail:'R144 runtime deployment attestation returned as read-only canonical-world scar/evidence',
  payload
 });
 return{schema:R145_SCHEMA,revision:R145_REVISION,event,attestationSha256:payload.attestationSha256,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R145 carries the returned R144 runtime attestation through the existing hashed R86 operation bus so R140 can append it into the existing R134/R136 world lineage. The attestation remains read-only evidence: its return does not prove public deployment, external verification, PC online state, solver validity or computed photoreal reality.'};
}

let installed=false;
export function installRuntimeAttestationWorldScarR145(){
 if(installed||typeof window==='undefined')return false;
 installed=true;
 void captureRuntimeAttestationWorldScarR145().then(receipt=>window.dispatchEvent(new CustomEvent('omega-r145-runtime-attestation-world-scar',{detail:receipt}))).catch(()=>{});
 return true;
}
