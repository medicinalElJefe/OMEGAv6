import assert from 'node:assert/strict';
import {validateSourceSpatialCalibrationR232} from '../src/world/sourceSpatialCalibrationValidationR232.js';
import {evaluateSourceSpatialCalibrationSufficiencyR234} from '../src/world/sourceSpatialCalibrationSufficiencyR234.js';
import {R236_SCHEMA,R236_TRUST_REGISTRY,buildSourceSpatialAttestationPayloadR236,verifySourceSpatialControlAttestationR236} from '../src/world/sourceSpatialControlAttestationR236.js';

const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha256=async v=>{const b=new TextEncoder().encode(typeof v==='string'?v:JSON.stringify(stable(v))),h=await crypto.subtle.digest('SHA-256',b);return[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const h=c=>String(c).repeat(64).slice(0,64);
const b64=b=>Buffer.from(b).toString('base64');

const camera={sourceIdentity:'camera-source',imageWidthPx:1920,imageHeightPx:1080,intrinsics:{fx:1200,fy:1200,cx:960,cy:540},pose:{referenceFrame:'WGS84-ENU:R218',position:{x:0,y:0,z:0},orientation:{x:0,y:0,z:0,w:1}}};
const cameraEvidenceSha256=await sha256(camera);
const reconstruction={state:'SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED',geometrySha256:h('a'),receiptSha256:h('b'),cameraEvidenceSha256,referenceFrame:'WGS84-ENU:R218',r227BundleSha256:h('c')};
const frame={state:'SOURCE_SPATIAL_COMPUTED_FRAME_RENDERED',frameSha256:h('d'),receiptSha256:h('e'),r228GeometrySha256:reconstruction.geometrySha256,r228ReceiptSha256:reconstruction.receiptSha256};
const evidence={sourceIdentity:'independent-survey',referenceFrame:'WGS84-ENU:R218',capturedOrAuthoritativeTime:'2026-09-08T19:00:00Z',provenance:'independent surveyed controls',acquisitionMethod:'SURVEY_CONTROL',uncertainty:{pixel:.25,worldM:.01},correspondences:[{u:960,v:540,world:{x:0,y:0,z:10}},{u:1080,v:540,world:{x:1,y:0,z:10}},{u:960,v:660,world:{x:0,y:1,z:10}},{u:840,v:540,world:{x:-1,y:0,z:10}},{u:960,v:420,world:{x:0,y:-1,z:10}},{u:1080,v:660,world:{x:1,y:1,z:10}}]};
const r232=await validateSourceSpatialCalibrationR232({frame,reconstruction,camera,validationEvidence:evidence});
assert.equal(r232.state,'INDEPENDENT_SPATIAL_CALIBRATION_VALIDATION_PASSED');
const r234=await evaluateSourceSpatialCalibrationSufficiencyR234({validation:r232,camera,validationEvidence:evidence});
assert.equal(r234.state,'CALIBRATION_SUFFICIENCY_ENVELOPE_PASSED');

const built=await buildSourceSpatialAttestationPayloadR236({sufficiency:r234,validation:r232,validationEvidence:evidence});
assert.equal(built.ok,true);assert.match(built.payloadSha256,/^[a-f0-9]{64}$/);assert.equal(built.payload.r232ReceiptSha256,r232.receiptSha256);assert.equal(built.payload.r234ReceiptSha256,r234.receiptSha256);assert.equal(built.payload.validationEvidenceSha256,r232.validationEvidenceSha256);

const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',keys.publicKey);
const keyFingerprintSha256=await sha256({kty:'EC',crv:'P-256',x:jwk.x,y:jwk.y});
const signature=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},keys.privateKey,new TextEncoder().encode(built.payloadCanonical)));
assert.equal(signature.length,64,'R236 requires WebCrypto P-256 raw r||s signature bytes');
const attestation={schema:R236_SCHEMA,revision:'R236',algorithm:'ECDSA_P256_SHA256',sourceIdentity:evidence.sourceIdentity,payloadSha256:built.payloadSha256,publicKeyJwk:{kty:'EC',crv:'P-256',x:jwk.x,y:jwk.y},keyFingerprintSha256,signatureBase64:b64(signature),signedAt:'2026-09-08T20:00:00Z',keyId:'test-untrusted-survey-key'};

const verified=await verifySourceSpatialControlAttestationR236({sufficiency:r234,validation:r232,validationEvidence:evidence,attestation});
assert.equal(verified.state,'SOURCE_SIGNATURE_VERIFIED_UNTRUSTED_KEY');
assert.equal(verified.sourceSignatureVerified,true);
assert.equal(verified.trustedSourceKeyMatched,false);
assert.equal(verified.sourceAuthenticationProved,false);
assert.match(verified.receiptSha256,/^[a-f0-9]{64}$/);
assert.equal(R236_TRUST_REGISTRY.trustModel,'CODE_PINNED_FINGERPRINTS_ONLY');
assert.equal(R236_TRUST_REGISTRY.anchors.length,0,'R236 must not fabricate a production trust root');

const again=await verifySourceSpatialControlAttestationR236({sufficiency:r234,validation:r232,validationEvidence:evidence,attestation});
assert.equal(again.receiptSha256,verified.receiptSha256,'R236 receipt must be deterministic for exact inputs');

const tamperedEvidence={...evidence,provenance:'tampered after R232'};
const tampered=await verifySourceSpatialControlAttestationR236({sufficiency:r234,validation:r232,validationEvidence:tamperedEvidence,attestation});
assert.equal(tampered.state,'HELD_FOR_SOURCE_ATTESTATION_LINEAGE');
assert.ok(tampered.missing.includes('R232_VALIDATION_EVIDENCE_HASH'));
assert.equal(tampered.sourceAuthenticationProved,false);

const payloadTampered={...attestation,payloadSha256:h('f')};
const held=await verifySourceSpatialControlAttestationR236({sufficiency:r234,validation:r232,validationEvidence:evidence,attestation:payloadTampered});
assert.equal(held.state,'HELD_FOR_SOURCE_ATTESTATION');
assert.ok(held.missing.includes('ATTESTATION_PAYLOAD_HASH'));
assert.equal(held.sourceSignatureVerified,false);

const badSigBytes=Uint8Array.from(signature);badSigBytes[0]^=1;
const rejected=await verifySourceSpatialControlAttestationR236({sufficiency:r234,validation:r232,validationEvidence:evidence,attestation:{...attestation,signatureBase64:b64(badSigBytes)}});
assert.equal(rejected.state,'SOURCE_ATTESTATION_REJECTED');
assert.equal(rejected.sourceSignatureVerified,false);
assert.equal(rejected.sourceAuthenticationProved,false);

for(const k of ['spatialCalibrationProved','globalPhysicalRegistrationProved','computedPhotorealRealityProved','solverValidityProved','nativeExecutionClaimed','pcOnlineClaimed','federationClosureProved','canonicalMutation'])assert.equal(verified[k],false,k);
for(const law of ['SELF_SUPPLIED_PUBLIC_KEY_IS_NOT_A_TRUST_ANCHOR','VALID_SIGNATURE_IS_NOT_SOURCE_AUTHENTICATION_WITHOUT_PINNED_TRUST','HYBRID_DEVICE_AUTHENTICATION_IS_NOT_EXTERNAL_CONTROL_SOURCE_AUTHENTICATION','TRUST_ANCHOR_ENROLLMENT_REQUIRES_GOVERNED_SOURCE_CHANGE'])assert.ok(R236_TRUST_REGISTRY.laws.includes(law));

console.log('R236 SOURCE SPATIAL CONTROL ATTESTATION PASS · exact R232/R234 lineage bound · P-256 signature verified · self-supplied key remains untrusted · evidence/payload/signature tamper fails closed · no fabricated trust root · calibration/global/photoreal/solver/PC/federation/Canon claims remain false');
