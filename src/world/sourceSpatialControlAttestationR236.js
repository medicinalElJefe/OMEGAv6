export const R236_REVISION='R236';
export const R236_SCHEMA='OMEGA_SOURCE_SPATIAL_CONTROL_ATTESTATION_R236';
export const R236_PAYLOAD_SCHEMA='OMEGA_SOURCE_SPATIAL_CONTROL_ATTESTED_PAYLOAD_R236';
export const R236_SNAPSHOT_KEY='omega.r236.sourceSpatialControlAttestation';
export const R236_EVENT='omega-r236-source-spatial-control-attestation';
export const R236_BOUNDARY='R236 binds the exact passing R232 independent-control receipt and exact passing R234 calibration-sufficiency receipt to a detached ECDSA P-256/SHA-256 source signature. Signature verification proves possession of the supplied private key only. sourceAuthenticationProved becomes true only when that key fingerprint is independently pinned in the governed code registry for the exact source identity, acquisition method and reference-frame scope. A self-supplied key, provenance string, digest, Hybrid heartbeat, low reprojection residual, or R234 sufficiency pass cannot create source trust. R236 does not solve or alter calibration, prove spatial calibration by itself, prove global physical registration, validate a scientific solver, invoke native/remote execution, prove PC online state, close federation, mutate CanonState, or prove computed photoreal reality.';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const canonical=v=>JSON.stringify(stable(v));
const bytes=v=>new TextEncoder().encode(typeof v==='string'?v:canonical(v));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha256=async v=>hex(await crypto.subtle.digest('SHA-256',bytes(v)));
const hash64=v=>/^[a-f0-9]{64}$/.test(String(v||''));
const text=v=>String(v??'').trim();
const validTime=v=>Boolean(text(v)&&Number.isFinite(Date.parse(text(v))));
const b64bytes=v=>{try{const s=text(v).replace(/-/g,'+').replace(/_/g,'/'),p=s+'='.repeat((4-s.length%4)%4),raw=globalThis.atob(p);return Uint8Array.from(raw,c=>c.charCodeAt(0))}catch{return null}};

// Production trust is deliberately code-pinned. Do not accept request/body/localStorage supplied trust roots.
// Enroll a real source key only through the governed release path with independently verified ownership/provenance.
export const R236_TRUST_REGISTRY=Object.freeze({
 schema:'OMEGA_SOURCE_SPATIAL_TRUST_REGISTRY_R236',
 revision:R236_REVISION,
 trustModel:'CODE_PINNED_FINGERPRINTS_ONLY',
 anchors:Object.freeze([]),
 laws:Object.freeze([
  'SELF_SUPPLIED_PUBLIC_KEY_IS_NOT_A_TRUST_ANCHOR',
  'VALID_SIGNATURE_IS_NOT_SOURCE_AUTHENTICATION_WITHOUT_PINNED_TRUST',
  'PROVENANCE_TEXT_IS_NOT_CRYPTOGRAPHIC_AUTHENTICATION',
  'DIGEST_INTEGRITY_IS_NOT_SOURCE_IDENTITY',
  'HYBRID_DEVICE_AUTHENTICATION_IS_NOT_EXTERNAL_CONTROL_SOURCE_AUTHENTICATION',
  'R232_RESIDUAL_PASS_AND_R234_SUFFICIENCY_DO_NOT_CREATE_SOURCE_TRUST',
  'TRUST_ANCHOR_ENROLLMENT_REQUIRES_GOVERNED_SOURCE_CHANGE'
 ])
});

function normalizedValidationEvidence(ev={}){
 return{sourceIdentity:text(ev.sourceIdentity),provenance:text(ev.provenance),acquisitionMethod:text(ev.acquisitionMethod).toUpperCase(),referenceFrame:text(ev.referenceFrame),capturedOrAuthoritativeTime:text(ev.capturedOrAuthoritativeTime),uncertainty:ev.uncertainty??null,correspondences:Array.isArray(ev.correspondences)?ev.correspondences:[]};
}

export async function buildSourceSpatialAttestationPayloadR236({sufficiency,validation,validationEvidence}={}){
 const missing=[];
 if(sufficiency?.state!=='CALIBRATION_SUFFICIENCY_ENVELOPE_PASSED'||sufficiency?.calibrationSufficiencyEnvelopePassed!==true||!hash64(sufficiency?.receiptSha256))missing.push('R234_PASS_RECEIPT');
 if(validation?.state!=='INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_PASSED'||validation?.independentCorrespondenceValidationPassed!==true||!hash64(validation?.receiptSha256))missing.push('R232_PASS_RECEIPT');
 if(text(sufficiency?.r232ReceiptSha256)!==text(validation?.receiptSha256))missing.push('R234_R232_RECEIPT_LINEAGE');
 if(text(sufficiency?.validationEvidenceSha256)!==text(validation?.validationEvidenceSha256))missing.push('R234_R232_VALIDATION_EVIDENCE_LINEAGE');
 if(text(sufficiency?.cameraEvidenceSha256)!==text(validation?.cameraEvidenceSha256))missing.push('R234_R232_CAMERA_LINEAGE');
 const normalized=normalizedValidationEvidence(validationEvidence||{}),validationEvidenceSha256=await sha256(normalized);
 if(validationEvidenceSha256!==text(validation?.validationEvidenceSha256))missing.push('R232_VALIDATION_EVIDENCE_HASH');
 if(text(normalized.sourceIdentity)!==text(validation?.validationSourceIdentity))missing.push('R232_SOURCE_IDENTITY');
 if(text(normalized.acquisitionMethod)!==text(validation?.validationAcquisitionMethod))missing.push('R232_ACQUISITION_METHOD');
 if(text(normalized.referenceFrame)!==text(validation?.referenceFrame))missing.push('R232_REFERENCE_FRAME');
 if(!validTime(normalized.capturedOrAuthoritativeTime))missing.push('SOURCE_AUTHORITATIVE_TIME');
 if(missing.length)return{ok:false,revision:R236_REVISION,state:'HELD_FOR_SOURCE_ATTESTATION_LINEAGE',missing:[...new Set(missing)],sourceAuthenticationProved:false,spatialCalibrationProved:false,globalPhysicalRegistrationProved:false,canonicalMutation:false,truthBoundary:R236_BOUNDARY};
 const payload={schema:R236_PAYLOAD_SCHEMA,revision:R236_REVISION,sourceIdentity:normalized.sourceIdentity,acquisitionMethod:normalized.acquisitionMethod,referenceFrame:normalized.referenceFrame,capturedOrAuthoritativeTime:normalized.capturedOrAuthoritativeTime,validationEvidenceSha256,r232ReceiptSha256:validation.receiptSha256,r234ReceiptSha256:sufficiency.receiptSha256,r230FrameSha256:validation.r230FrameSha256,r228GeometrySha256:validation.r228GeometrySha256,cameraEvidenceSha256:validation.cameraEvidenceSha256};
 return{ok:true,payload,payloadCanonical:canonical(payload),payloadSha256:await sha256(payload)};
}

async function publicKeyFingerprint(jwk){
 if(!jwk||jwk.kty!=='EC'||jwk.crv!=='P-256'||!text(jwk.x)||!text(jwk.y))return null;
 return sha256({kty:'EC',crv:'P-256',x:text(jwk.x),y:text(jwk.y)});
}

async function verifySignature(jwk,signatureBase64,payload){
 try{
  if(!jwk||jwk.kty!=='EC'||jwk.crv!=='P-256'||!text(jwk.x)||!text(jwk.y))return false;
  const sig=b64bytes(signatureBase64);if(!sig||sig.length!==64)return false;
  const key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:text(jwk.x),y:text(jwk.y),ext:true}, {name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,sig,bytes(payload));
 }catch{return false}
}

function trustedAnchorFor({fingerprint,sourceIdentity,acquisitionMethod,referenceFrame}){
 const rows=Array.isArray(R236_TRUST_REGISTRY.anchors)?R236_TRUST_REGISTRY.anchors:[];
 return rows.find(a=>a?.trustState==='PRODUCTION_TRUSTED'&&text(a.keyFingerprintSha256)===fingerprint&&text(a.sourceIdentity)===sourceIdentity&&(!Array.isArray(a.allowedAcquisitionMethods)||a.allowedAcquisitionMethods.includes(acquisitionMethod))&&(!Array.isArray(a.allowedReferenceFrames)||a.allowedReferenceFrames.includes(referenceFrame)))||null;
}

function falseClaims(){return{spatialCalibrationProved:false,globalPhysicalRegistrationProved:false,calibrationSolvedOrAltered:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false}}

export async function verifySourceSpatialControlAttestationR236({sufficiency,validation,validationEvidence,attestation}={}){
 const built=await buildSourceSpatialAttestationPayloadR236({sufficiency,validation,validationEvidence});
 if(!built.ok)return{schema:R236_SCHEMA,revision:R236_REVISION,...built,sourceSignatureVerified:false,trustedSourceKeyMatched:false,sourceAuthenticationProved:false,...falseClaims()};
 const a=attestation||{},missing=[];
 if(a?.schema!==R236_SCHEMA)missing.push('ATTESTATION_SCHEMA');
 if(text(a?.revision)!==R236_REVISION)missing.push('ATTESTATION_REVISION');
 if(text(a?.algorithm)!=='ECDSA_P256_SHA256')missing.push('ATTESTATION_ALGORITHM');
 if(text(a?.sourceIdentity)!==text(built.payload.sourceIdentity))missing.push('ATTESTATION_SOURCE_IDENTITY');
 if(text(a?.payloadSha256)!==built.payloadSha256)missing.push('ATTESTATION_PAYLOAD_HASH');
 if(!validTime(a?.signedAt))missing.push('ATTESTATION_SIGNED_AT');
 if(!text(a?.signatureBase64))missing.push('ATTESTATION_SIGNATURE');
 const fingerprint=await publicKeyFingerprint(a?.publicKeyJwk);if(!fingerprint)missing.push('ATTESTATION_PUBLIC_KEY');
 if(text(a?.keyFingerprintSha256)!==text(fingerprint))missing.push('ATTESTATION_KEY_FINGERPRINT');
 if(missing.length)return{schema:R236_SCHEMA,revision:R236_REVISION,state:'HELD_FOR_SOURCE_ATTESTATION',missing:[...new Set(missing)],payloadSha256:built.payloadSha256,keyFingerprintSha256:fingerprint,sourceSignatureVerified:false,trustedSourceKeyMatched:false,sourceAuthenticationProved:false,...falseClaims(),truthBoundary:R236_BOUNDARY};
 const sourceSignatureVerified=await verifySignature(a.publicKeyJwk,a.signatureBase64,built.payload);
 const anchor=sourceSignatureVerified?trustedAnchorFor({fingerprint,sourceIdentity:built.payload.sourceIdentity,acquisitionMethod:built.payload.acquisitionMethod,referenceFrame:built.payload.referenceFrame}):null;
 const trustedSourceKeyMatched=Boolean(anchor),sourceAuthenticationProved=sourceSignatureVerified&&trustedSourceKeyMatched;
 const attestationSha256=await sha256({schema:a.schema,revision:a.revision,algorithm:a.algorithm,sourceIdentity:a.sourceIdentity,payloadSha256:a.payloadSha256,publicKeyJwk:{kty:a.publicKeyJwk.kty,crv:a.publicKeyJwk.crv,x:a.publicKeyJwk.x,y:a.publicKeyJwk.y},keyFingerprintSha256:a.keyFingerprintSha256,signatureBase64:a.signatureBase64,signedAt:a.signedAt,keyId:text(a.keyId)});
 const core={r234ReceiptSha256:sufficiency.receiptSha256,r232ReceiptSha256:validation.receiptSha256,validationEvidenceSha256:built.payload.validationEvidenceSha256,payloadSha256:built.payloadSha256,attestationSha256,keyFingerprintSha256:fingerprint,sourceIdentity:built.payload.sourceIdentity,acquisitionMethod:built.payload.acquisitionMethod,referenceFrame:built.payload.referenceFrame,sourceSignatureVerified,trustedSourceKeyMatched,sourceAuthenticationProved,trustRegistrySchema:R236_TRUST_REGISTRY.schema,trustModel:R236_TRUST_REGISTRY.trustModel,trustAnchorId:anchor?.id||null};
 const receiptSha256=await sha256(core);
 return{schema:R236_SCHEMA,revision:R236_REVISION,state:!sourceSignatureVerified?'SOURCE_ATTESTATION_REJECTED':sourceAuthenticationProved?'SOURCE_ATTESTATION_AUTHENTICATED':'SOURCE_SIGNATURE_VERIFIED_UNTRUSTED_KEY',...core,receiptSha256,...falseClaims(),sourceAuthenticationProved,renderedComputedRealityFrame:true,computedRepresentationOnly:true,computedRealityAuthority:'R122_EXISTING_AUTHORITY_UNCHANGED',adaptivePerformanceAuthority:'R185_EXISTING_AUTHORITY_UNCHANGED',canonicalAdmissionAuthority:'R125',operationLedger:'R86',projectContinuity:'R87',authenticatedContinuity:'R97_WHEN_PAIRED',truthBoundary:R236_BOUNDARY};
}

export function persistSourceSpatialControlAttestationR236(r){
 if(!['SOURCE_ATTESTATION_REJECTED','SOURCE_SIGNATURE_VERIFIED_UNTRUSTED_KEY','SOURCE_ATTESTATION_AUTHENTICATED'].includes(r?.state)||!hash64(r?.receiptSha256))return false;
 try{localStorage.setItem(R236_SNAPSHOT_KEY,JSON.stringify(r));window.dispatchEvent(new CustomEvent(R236_EVENT,{detail:r}));return true}catch{return false}
}
export function readSourceSpatialControlAttestationR236(){try{const v=JSON.parse(localStorage.getItem(R236_SNAPSHOT_KEY)||'null');return v?.schema===R236_SCHEMA?v:null}catch{return null}}
export function manifestR236(){return{schema:'OMEGA_SOURCE_SPATIAL_CONTROL_ATTESTATION_MANIFEST_R236',revision:R236_REVISION,chain:['exact passing R232 receipt','exact passing R234 sufficiency receipt','exact normalized validation-evidence SHA-256','deterministic attested payload','ECDSA P-256/SHA-256 detached signature','public-key fingerprint','code-pinned governed trust registry','bounded authentication receipt'],trust:R236_TRUST_REGISTRY,authority:{computedReality:'R122 unchanged',adaptivePerformance:'R185 unchanged',canonicalAdmission:'R125',continuity:'R86/R87/R97 when paired'},truthBoundary:R236_BOUNDARY}}
