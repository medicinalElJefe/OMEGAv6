export const R509_CAPABILITY_CONTRACT_SCHEMA='OMEGA_FALSIFIABLE_CAPABILITY_CONTRACT_R509';

export const R509_ADMISSION_LANES=Object.freeze([
 'BOUNDED_SOURCE',
 'CURRENT_SOURCE_PROOF',
 'LIVE_BROWSER_PROOF',
 'LIVE_EXTERNAL_EVIDENCE',
 'HYBRID_HOST_EVIDENCE',
]);

const CONTRACTS=Object.freeze({
 'D-02':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-02',
  objectiveExact:'Native complex SAR acquisition binding and real source rasters where provider/data access permits.',
  qualification:'QUALIFIED',
  admissionLane:'LIVE_EXTERNAL_EVIDENCE',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/SARLiveTruthR285.tsx','src/sarNativeRasterR326.js','src/workerR8.js']),
  requiredProofs:Object.freeze(['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence']),
  sourcePredicates:Object.freeze([
   Object.freeze({path:'src/SARLiveTruthR285.tsx',allOf:Object.freeze(["mode==='SLC'","complexDataBound","nativeDataBound","No acquisition is fabricated.","allowDemonstration={false}"])}),
   Object.freeze({path:'src/sarNativeRasterR326.js',allOf:Object.freeze(['complexDataBound','nativeDataBound','sourceEvidenceBound'])}),
   Object.freeze({path:'src/workerR8.js',allOf:Object.freeze(['/api/earth/sar/native-raster'])}),
  ]),
  evidencePredicates:Object.freeze([
   'A returned Sentinel-1 SLC catalogue item identifies the exact product and acquisition time.',
   'The selected native asset returns bytes and an exact content hash/receipt.',
   'The native decoder returns non-zero real samples from that exact asset.',
   'complexDataBound=true is established from decoded I/Q samples, not catalogue metadata or preview imagery.',
   'The displayed SAR field is bound to the returned measurement raster; generated/demo pixels remain disabled.',
  ]),
  falsifiers:Object.freeze([
   'Catalogue discovery or asset URL alone is treated as measurement proof.',
   'A preview image or deterministic demonstration is substituted for native SAR samples.',
   'complexDataBound is true without decoded I/Q arrays tied to returned bytes.',
   'No exact returned source/hash can be associated with the rendered raster.',
  ]),
  truthBoundary:'This contract proves live native/complex SAR acquisition only when returned provider bytes, decoded samples and source identity are all bound. Provider unavailability is a held external-evidence state, not permission to fabricate or to mutate unrelated source.',
 }),
 'D-03':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-03',
  objectiveExact:'Calibrated backscatter / coherence / interferometry / unwrapping / LOS products with explicit processing receipts.',
  qualification:'QUALIFIED',
  admissionLane:'HYBRID_HOST_EVIDENCE',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/SARLiveTruthR285.tsx','src/sarHostClosureR344.ts','src/SarHybridClosureR345.tsx','scripts/sar_r344_host_closure.py']),
  requiredProofs:Object.freeze(['R202 Operational Source Authority','OMEGA R237 Hybrid Command Authority Proof','R241 Archive Convergence Visual Intelligence']),
  sourcePredicates:Object.freeze([
   Object.freeze({path:'src/sarHostClosureR344.ts',allOf:Object.freeze(['RECEIPT_SCHEMA','INTERFEROMETRIC_PHASE','UNWRAP_CLOSURE','METRIC_LOS','CORRECTION_LEDGER'])}),
   Object.freeze({path:'src/SarHybridClosureR345.tsx',allOf:Object.freeze(['SAR_R344_CLOSURE','authenticated heartbeat current','exact R344 receipt'])}),
   Object.freeze({path:'scripts/sar_r344_host_closure.py',allOf:Object.freeze(['full-resolution Sentinel-1 host closure driver'])}),
  ]),
  evidencePredicates:Object.freeze([
   'Calibration/backscatter artifacts carry exact product-linked hashes and calibration/noise annotation lineage.',
   'Coherence/interferogram outputs identify the exact source pair and coregistration residuals.',
   'Unwrapped phase is admitted only with unwrap closure evidence.',
   'Metric LOS carries wavelength, sign convention, units and artifact hash.',
   'Every promoted field is represented in the R344 receipt with its numerical/provenance gate established.',
  ]),
  falsifiers:Object.freeze([
   'A process exit or UI display alone establishes a physical SAR layer.',
   'Coherence/interferometry is claimed without a compatible returned pair.',
   'Unwrapped phase or metric LOS is promoted without closure/sign/unit evidence.',
   'Calibration is inferred from catalogue metadata without product-linked annotation evidence.',
  ]),
  truthBoundary:'R344/R345 may bind host-produced physical evidence but cannot manufacture missing calibration, pair, unwrapping or LOS proof. The contract remains held until the required returned artifacts and numerical gates exist.',
 }),
 'D-04':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-04',
  objectiveExact:'Corrected deformation products only after orbit/topography/atmosphere/noise obligations are satisfied.',
  qualification:'QUALIFIED',
  admissionLane:'HYBRID_HOST_EVIDENCE',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/sarEstablishmentR342.ts','src/sarHostClosureR344.ts','src/SARLiveTruthR285.tsx']),
  requiredProofs:Object.freeze(['R202 Operational Source Authority','OMEGA R237 Hybrid Command Authority Proof']),
  sourcePredicates:Object.freeze([
   Object.freeze({path:'src/sarEstablishmentR342.ts',allOf:Object.freeze(['CORRECTED_LOS','ATMOSPHERIC_ETAD_CORRECTION_REQUIRED','orbit/topography','correction provenance'])}),
   Object.freeze({path:'src/sarHostClosureR344.ts',allOf:Object.freeze(['CORRECTION_LEDGER','corrected LOS artifact','atmosphere and/or ETAD/system correction artifact hashes'])}),
   Object.freeze({path:'src/SARLiveTruthR285.tsx',allOf:Object.freeze(['atmosphereEtadCorrectionBound','orbitHandled','topographyHandled','noiseCharacterized'])}),
  ]),
  evidencePredicates:Object.freeze([
   'Orbit evidence is bound and hash-linked to the processed pair.',
   'Topographic/DEM handling is explicitly established.',
   'Atmospheric/ETAD or other declared correction artifacts are hash-linked.',
   'Noise characterization remains visible in the residual ledger.',
   'Corrected LOS/deformation is not admitted until all required upstream gates are established.',
  ]),
  falsifiers:Object.freeze([
   'Corrected deformation is displayed while orbit or topography is unproved.',
   'Atmospheric/system correction is assumed without returned correction artifacts.',
   'Noise/residual obligations are discarded after correction.',
  ]),
  truthBoundary:'Corrected deformation is a gated derived product. Missing correction evidence leaves the result held; it cannot be upgraded by rendering, model confidence or successful command execution.',
 }),
 'D-05':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-05',
  objectiveExact:'Multi-geometry 3-D inference only with independently sufficient geometries; no 3-D claim from one LOS.',
  qualification:'QUALIFIED',
  admissionLane:'CURRENT_SOURCE_PROOF',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/sarEstablishmentR342.ts','src/sarHostClosureR344.ts','src/sarClosureFrontierR346.ts']),
  requiredProofs:Object.freeze(['R170 Current Convergence','R202 Operational Source Authority']),
  currentSourceProof:Object.freeze({
   revision:'R509',
   requiredPathTokens:Object.freeze([
    Object.freeze({path:'src/sarEstablishmentR342.ts',tokens:Object.freeze(['FULL_3D_DEFORMATION','ADDITIONAL_VIEWING_GEOMETRY_REQUIRED','independent>=3','NOT_DERIVABLE_SINGLE_LOS','FULL_3D_REQUIRES_INDEPENDENT_GEOMETRY'])}),
    Object.freeze({path:'src/sarHostClosureR344.ts',tokens:Object.freeze(['rank=matrixRank3(independent)','rank>=3','ADDITIONAL_VIEWING_GEOMETRY_REQUIRED','rank-independent look vectors','Full 3-D remains held unless the look-geometry matrix has rank 3'])}),
    Object.freeze({path:'src/sarClosureFrontierR346.ts',tokens:Object.freeze(["R346_FULL_3D_VETO='ADDITIONAL_VIEWING_GEOMETRY_REQUIRED'","Ordering cannot manufacture Sentinel-1 measurements",'independent viewing geometry'])}),
   ]),
   truthBoundary:'This source proof establishes the software veto and rank-conditioned admission law. It does not claim that a real 3-D deformation product currently exists.'
  }),
  evidencePredicates:Object.freeze([
   'One LOS never satisfies FULL_3D_DEFORMATION.',
   'At least three rank-independent look vectors or equivalent constraints are required.',
   'The inversion carries rank/conditioning/residual proof and identified artifacts.',
  ]),
  falsifiers:Object.freeze([
   'A single LOS can set full3dDeformationBound=true.',
   'Rank < 3 can establish FULL_3D_DEFORMATION.',
   'A 3-D display can bypass independent geometry and artifact proof.',
  ]),
  truthBoundary:'The capability claim is the enforced 3-D admission/veto law, not the existence of a current 3-D observation.',
 }),
 'D-06':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-06',
  objectiveExact:'Field-first unobstructed visual composition live-proven after promotion.',
  qualification:'QUALIFIED',
  admissionLane:'CURRENT_SOURCE_PROOF',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/SARTruthInstrumentR280.tsx','src/SARLiveTruthR285.tsx','tests/r370-live-earth-sar-closure-browser-e2e.mjs']),
  requiredProofs:Object.freeze(['R241 Archive Convergence Visual Intelligence','R202 Operational Source Authority']),
  currentSourceProof:Object.freeze({
   revision:'R509',
   requiredPathTokens:Object.freeze([
    Object.freeze({path:'src/SARTruthInstrumentR280.tsx',tokens:Object.freeze(['focusDisplay','cleanView','FOCUS FIELD','CLEAN VIEW','r280-center','allowDemonstration={false}'])}),
    Object.freeze({path:'tests/r370-live-earth-sar-closure-browser-e2e.mjs',tokens:Object.freeze(['waitAnalytical(page)','all 12 analytical lenses actuated','viewport.width*.60'])}),
   ]),
   truthBoundary:'Exact source proves the field-first controls and browser acceptance contract exist. The required R241/R202 exact-head workflows must still pass after promotion before the item can be reconciled.'
  }),
  evidencePredicates:Object.freeze([
   'The analytical field remains the dominant visual surface at desktop and mobile widths.',
   'Focus/clean-view controls remove obstructing inspector detail without replacing the field.',
   'The exact promoted build passes the SAR browser interaction proof.',
  ]),
  falsifiers:Object.freeze([
   'A panel/failure wall obscures or replaces the analytical field.',
   'The field composition passes only locally but fails exact-head promoted browser proof.',
   'Mobile geometry collapses or hides the analytical field.',
  ]),
  truthBoundary:'Source structure alone is insufficient; completion requires exact-head browser proof on the promoted lineage.',
 }),
 'D-07':Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  revision:'R509',
  itemKey:'D-07',
  objectiveExact:'Each lens visually and semantically distinguishable without relying on panel text.',
  qualification:'QUALIFIED',
  admissionLane:'LIVE_BROWSER_PROOF',
  mutationAdmission:false,
  sourcePaths:Object.freeze(['src/SARTruthInstrumentR280.tsx','tests/r370-live-earth-sar-closure-browser-e2e.mjs']),
  requiredProofs:Object.freeze(['R241 Archive Convergence Visual Intelligence']),
  sourcePredicates:Object.freeze([
   Object.freeze({path:'src/SARTruthInstrumentR280.tsx',allOf:Object.freeze(["type View='SOURCE'|'AMPLITUDE'|'PHASE'|'COHERENCE'|'INTERFEROGRAM'|'DEFORMATION'|'ELEVATION'|'POLARIMETRY'|'MULTI_BAND'|'TIME_STACK'|'SCAR_UNCERTAINTY'|'PROOF'","const VIEW_GUIDE","if(view==='INTERFEROGRAM')","if(view==='COHERENCE')","if(view==='DEFORMATION')"])}),
  ]),
  evidencePredicates:Object.freeze([
   'A live browser proof computes visual signatures from rendered lens pixels rather than labels.',
   'All twelve lens cards are actuated against the same settled source state.',
   'The proof demonstrates materially distinct rendered signatures for the semantic lens classes and fails if lenses collapse to one visual mapping.',
   'Semantic identity is independently bound to the known lens order/contract; visible panel text is not used as the distinction criterion.',
  ]),
  falsifiers:Object.freeze([
   'The test decides distinction by reading lens labels or panel prose.',
   'All lens previews can render the same pixel signature and still pass.',
   'Only a subset of the twelve lenses is checked.',
   'The proof runs only on an unpromoted local build.',
  ]),
  truthBoundary:'D-07 is contract-qualified but not complete until a non-text live visual-signature proof exists and passes on the exact promoted lineage. No product mutation is authorized merely to make the test easier.',
 }),
});

const clean=v=>String(v??'').trim();

export function capabilityContractR509(itemKey){
 return CONTRACTS[clean(itemKey)]||null;
}

export function validateCapabilityContractR509(contract,item){
 const reasons=[];
 if(!contract||contract.schema!==R509_CAPABILITY_CONTRACT_SCHEMA)reasons.push('R509_SCHEMA_INVALID');
 if(contract?.qualification!=='QUALIFIED')reasons.push('R509_NOT_QUALIFIED');
 if(!R509_ADMISSION_LANES.includes(contract?.admissionLane))reasons.push('R509_ADMISSION_LANE_INVALID');
 if(clean(contract?.itemKey)!==clean(String(item?.id||'').replace(/^R388-/,'')))reasons.push('R509_ITEM_ID_MISMATCH');
 if(clean(contract?.objectiveExact)!==clean(item?.objective))reasons.push('R509_OBJECTIVE_DRIFT');
 if(!Array.isArray(contract?.sourcePaths)||contract.sourcePaths.length<1)reasons.push('R509_SOURCE_PATHS_REQUIRED');
 if(!Array.isArray(contract?.requiredProofs)||contract.requiredProofs.length<1)reasons.push('R509_PROOFS_REQUIRED');
 if(!Array.isArray(contract?.evidencePredicates)||contract.evidencePredicates.length<2)reasons.push('R509_EVIDENCE_PREDICATES_REQUIRED');
 if(!Array.isArray(contract?.falsifiers)||contract.falsifiers.length<2)reasons.push('R509_FALSIFIERS_REQUIRED');
 if(clean(contract?.truthBoundary).length<80)reasons.push('R509_TRUTH_BOUNDARY_TOO_THIN');
 if(contract?.mutationAdmission===true&&contract?.admissionLane!=='BOUNDED_SOURCE')reasons.push('R509_MUTATION_LANE_MISMATCH');
 if(contract?.admissionLane==='BOUNDED_SOURCE'&&contract?.mutationAdmission!==true)reasons.push('R509_BOUNDED_SOURCE_REQUIRES_MUTATION_ADMISSION');
 if(contract?.admissionLane==='CURRENT_SOURCE_PROOF'&&!contract?.currentSourceProof)reasons.push('R509_CURRENT_SOURCE_PROOF_MISSING');
 return Object.freeze({
  schema:R509_CAPABILITY_CONTRACT_SCHEMA,
  valid:reasons.length===0,
  reasons:Object.freeze(reasons),
  itemKey:contract?.itemKey||null,
  admissionLane:contract?.admissionLane||null,
  mutationReady:reasons.length===0&&contract?.mutationAdmission===true&&contract?.admissionLane==='BOUNDED_SOURCE',
  currentSourceProofReady:reasons.length===0&&contract?.admissionLane==='CURRENT_SOURCE_PROOF'&&Boolean(contract?.currentSourceProof),
  externalEvidenceReady:reasons.length===0&&['LIVE_EXTERNAL_EVIDENCE','HYBRID_HOST_EVIDENCE'].includes(contract?.admissionLane),
  liveBrowserProofReady:reasons.length===0&&contract?.admissionLane==='LIVE_BROWSER_PROOF',
 });
}

export function contractLaneR509(item){
 const contract=item?.acceptanceContract||null;
 if(!contract)return Object.freeze({state:'ACCEPTANCE_CONTRACT_REQUIRED',mutationReady:false,currentSourceProofReady:false,liveBrowserProofReady:false,externalEvidenceReady:false});
 if(contract.schema!==R509_CAPABILITY_CONTRACT_SCHEMA){
  return Object.freeze({state:'LEGACY_QUALIFIED_MUTATION',mutationReady:true,currentSourceProofReady:Boolean(contract.currentSourceProof),liveBrowserProofReady:false,externalEvidenceReady:false});
 }
 const checked=validateCapabilityContractR509(contract,item);
 return Object.freeze({
  state:checked.valid?'QUALIFIED_'+checked.admissionLane:'INVALID_CAPABILITY_CONTRACT',
  ...checked,
 });
}

export function r509ContractKeys(){
 return Object.freeze(Object.keys(CONTRACTS));
}
