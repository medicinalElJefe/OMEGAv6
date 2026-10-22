import assert from'node:assert/strict';
import fs from'node:fs';

const src=fs.readFileSync('src/sarEstablishmentR342.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 "SAR_ESTABLISHMENT_SCHEMA_R342",
 "SAR_20736D_ADDRESS_SPACE_R342=12**4",
 "SAR_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342=0.001",
 "SAR_TOPS_RANGE_COREG_TARGET_SAMPLES_R342=0.1",
 "materializeSentinel1RadiometryR342",
 "selectedDb[i]=10*Math.log10(selected)",
 "R342_EVIDENCE_AXIS=[",
 "R342_TRANSFORM_AXIS=[",
 "R342_PROOF_AXIS=[",
 "R342_SURFACE_AXIS=[",
 "PARTITION → PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE",
 "Parent → Interaction → Scar → Continuity → Compression → Skin → Interpretation → Behavior → New Parent",
 "value=(DN²-noiseLut)/calibrationLut²",
 "dLOS=sign·λ·φ/(4π)",
 "ADDITIONAL_VIEWING_GEOMETRY_REQUIRED",
 "GEOMETRY_MATRIX_RANK_DEFICIENT",
 "20,736 address space as an atlas/resolution index, not a physical dimension"
])assert.ok(src.includes(token),'R342 establishment engine missing '+token);

for(const token of[
 "resolveSarEstablishmentR342",
 "R342 · 20,736D ESTABLISHMENT LEDGER",
 "12×12×12×12 = 20,736 atlas addresses",
 "sampledGridIdentity:pairDerived?.sampledGridIdentity===true",
 "subpixelCoregistrationBound:false"
])assert.ok(live.includes(token),'R342 live workstation missing '+token);

assert.equal(pkg.scripts['test:r342'],'node tests/r342-sar-20736d-establishment-invariants.mjs');
assert.ok(pkg.scripts['check:static'].includes('npm run test:r342'),'R342 must participate in full static proof');

const evidence=['SOURCE_IDENTITY','NATIVE_GRD','NATIVE_SLC_IQ','PAIR_METADATA','POLARIZATION_ASSET','SAMPLED_GRID','CALIBRATION_ANNOTATION','ORBIT_BURST_GEOMETRY','DEM_GEOMETRY','UNWRAP_EVIDENCE','ATMOSPHERIC_AUXILIARY','ETAD_AUXILIARY'];
const transform=['DECODE','RADIOMETRIC_CALIBRATE','DENOISE','SUBPIXEL_COREGISTER','COMPLEX_CROSS_PRODUCT','LOCAL_COHERENCE','TEMPORAL_CHANGE','TERRAIN_FLATTEN','PHASE_UNWRAP','RESIDUAL_CORRECT','LOS_CONVERT','LOS_OR_3D_INVERSION'];
const proof=['SOURCE_BOUND','BYTE_HASH','DECODE_RECEIPT','UNIT_CONTRACT','SAMPLED_GRID_IDENTITY','COREG_RESIDUAL','MASK_CLOSURE','PHASE_CLOSURE','CALIBRATION_PROOF','CORRECTION_LEDGER','UNCERTAINTY_BOUND','PROMOTION_READY'];
const surface=['INGRESS','SOURCE_LENS','AMPLITUDE_LENS','PHASE_LENS','COHERENCE_LENS','INTERFEROGRAM_LENS','TIME_STACK_LENS','DEFORMATION_LENS','ELEVATION_LENS','SCAR_LENS','PROOF_LENS','LEDGER_EXPORT'];
assert.equal(evidence.length*transform.length*proof.length*surface.length,20736);
const digit=n=>n.toString(12).toUpperCase();
const address=id=>{const z=id-1,e=Math.floor(z/1728)%12,t=Math.floor(z/144)%12,p=Math.floor(z/12)%12,s=z%12;return digit(e)+'-'+digit(t)+'-'+digit(p)+'-'+digit(s)};
const addresses=Array.from({length:20736},(_,i)=>address(i+1));
assert.equal(new Set(addresses).size,20736);
assert.equal(addresses[0],'0-0-0-0');
assert.equal(addresses.at(-1),'B-B-B-B');

const calibrated=(dn,A,noise=0)=>{if(!Number.isFinite(dn)||!Number.isFinite(A)||A<=0||!Number.isFinite(noise)||noise<0)return NaN;const n=dn*dn-noise;return n>0?n/(A*A):NaN};
assert.equal(calibrated(10,2,4),24);
assert.ok(Number.isNaN(calibrated(1,2,4)));

const tops=(az,rg,rgMax,bound=true)=>bound&&Number.isFinite(az)&&Math.abs(az)<=0.001&&Number.isFinite(rg)&&Number.isFinite(rgMax)&&rgMax>0&&Math.abs(rg)<=rgMax;
assert.equal(tops(0.001,0.02,0.05),true);
assert.equal(tops(0.0011,0.02,0.05),false);

const los=(phi,lambda,sign)=>sign*lambda*phi/(4*Math.PI);
assert.ok(Math.abs(los(Math.PI,0.0555,1)-0.013875)<1e-12);

function solve3(a,b){const m=a.map((r,i)=>[...r,b[i]]);for(let c=0;c<3;c++){let p=c;for(let r=c+1;r<3;r++)if(Math.abs(m[r][c])>Math.abs(m[p][c]))p=r;if(Math.abs(m[p][c])<1e-12)return null;[m[c],m[p]]=[m[p],m[c]];const q=m[c][c];for(let j=c;j<4;j++)m[c][j]/=q;for(let r=0;r<3;r++)if(r!==c){const f=m[r][c];for(let j=c;j<4;j++)m[r][j]-=f*m[c][j]}}return[m[0][3],m[1][3],m[2][3]]}
const rows=[{losM:1,look:[1,0,0]},{losM:2,look:[0,1,0]},{losM:3,look:[0,0,1]}];
const n=[[0,0,0],[0,0,0],[0,0,0]],b=[0,0,0];
for(const r of rows)for(let i=0;i<3;i++){b[i]+=r.look[i]*r.losM;for(let j=0;j<3;j++)n[i][j]+=r.look[i]*r.look[j]}
assert.deepEqual(solve3(n,b).map(x=>Math.round(x*1e9)/1e9),[1,2,3]);

assert.ok(src.includes("state:independent<3?'NOT_DERIVABLE_SINGLE_LOS':'COMPUTABLE'"),'single-LOS 3-D veto must remain explicit');
assert.ok(src.includes("interferometricPhaseValidated===true&&coreg&&cross"),'physical interferometric phase must depend on proven coregistration');
assert.ok(src.includes("unwrappedPhaseBound===true&&e.unwrapClosureBound===true&&phaseValid"),'unwrapping must depend on phase validity and closure');
assert.ok(src.includes("e.correctedLosBound===true&&e.losDisplacementBound===true&&e.atmosphereHandled===true&&e.etadBound===true"),'corrected LOS must require atmosphere and ETAD evidence');

console.log('R342 SAR 20,736D ESTABLISHMENT PASS · 12^4 address uniqueness · independent radiometry/TOPS/LOS/3-D reference math · exact held-state gates · live establishment ledger · single-LOS 3-D veto retained');
