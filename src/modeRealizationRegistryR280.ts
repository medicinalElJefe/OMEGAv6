import {CANON_AUTHORITY_STACK,evaluateCanonAuthorityStack} from './allModesAuthority';
import {sourceBackedModeSummary,type SourceBackedModeResult} from './sourceBackedModeRuntimeR21';

export const R280_MODE_REALIZATION_SCHEMA='OMEGA_MODE_REALIZATION_REGISTRY_R280' as const;
export const R280_MODE_REALIZATION_LAWS=Object.freeze([
  'NAMED_IS_NOT_REALIZED',
  'DERIVED_LENS_EXECUTION_IS_NOT_DOMAIN_EXECUTION',
  'SOURCE_PACKET_IS_NOT_INDEPENDENT_EMPIRICAL_PROOF',
  'GATED_INPUTS_MUST_REMAIN_GATED',
  'PROMOTED_REQUIRES_EXECUTABLE_STATE_OBSERVABLE_OUTPUT_TEST_AND_BOUNDARY',
  'MODE_AGREEMENT_IS_INTERNAL_COHERENCE_NOT_INDEPENDENT_REPLICATION',
  'REPRESENTATION_LEVELS_ARE_ADDRESS_RESOLUTION_NOT_LITERAL_PHYSICAL_DIMENSIONS',
  'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

export type ModeRealizationStageR280='CHARTED'|'IMPLEMENTED'|'TESTED'|'PROMOTED'|'GATED';
export type ModeExecutionClassR280='DERIVED_LENS'|'SOURCE_EXECUTED'|'SOURCE_PACKET'|'DOMAIN_RUNTIME'|'EVIDENCE_GATED_DOMAIN_RUNTIME';
export type ModeBindingR280={
  artifacts:string[];
  tests?:string[];
  executionClass:ModeExecutionClassR280;
  inputContract:string;
  outputContract:string;
  boundary:string;
};

const BINDINGS:Record<string,ModeBindingR280>=Object.freeze({
  'OVERALL CANON MODE':{
    artifacts:['src/allModesTruthFusionR151.ts','src/universalTruthEnvelopeR152.ts'],
    tests:['tests/r151-all-modes-truth-fusion.mts','tests/r152-universal-truth-envelope.mts'],
    executionClass:'DOMAIN_RUNTIME',inputContract:'canonical packet + evidence',outputContract:'truth fusion + universal truth envelope',
    boundary:'Internal mode coherence cannot overrule empirical evidence, execution proof, or R125 admission.'
  },
  'Unified Coherence Mode':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts','src/allModesTruthFusionR151.ts'],
    tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'SOURCE_EXECUTED',inputContract:'CΩ Φ q Λ',outputContract:'bounded Dewey/coherence score',
    boundary:'Coordination score is model output, not an empirical observation.'
  },
  'Mode 188':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts','src/GlobalInterferenceWorkbenchR188.tsx'],
    tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'SOURCE_EXECUTED',inputContract:'CΩ Scar q + source categorical gate',outputContract:'M188 score + source gate',
    boundary:'Mode 188 evaluates packet state; it does not manufacture source evidence.'
  },
  'Prune / Heavy Prune Mode':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts'],tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'SOURCE_EXECUTED',inputContract:'q Λ CΩ',outputContract:'prune pressure',
    boundary:'Prune pressure is advisory unless separately bound to canonical dispatch.'
  },
  'Guidance Field Mode':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts'],tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'SOURCE_PACKET',inputContract:'source decision channel',outputContract:'STAY/TURN/ESCALATE source decision',
    boundary:'The source decision is carried; missing candidate score vectors are not reconstructed.'
  },
  'FULL SPHERE Mode':{
    artifacts:['src/allModesTruthFusionR151.ts','src/fullSystemConvergenceR122.ts','src/FullSystemConvergencePanelR95.tsx'],
    tests:['tests/r155-whole-system-convergence-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'provenance-separated mode channels',outputContract:'cross-mode synthesis + residuals',
    boundary:'Cross-domain synthesis preserves contradictions and cannot turn agreement into independent proof.'
  },
  '1728D×12D Knowledge Grid':{
    artifacts:['src/corpusRuntime.ts'],tests:['tests/admissibility-248832-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'atlas coordinates',outputContract:'hierarchical address projection',
    boundary:'1728 and 20736 are representation/address resolutions, not literal physical dimensions.'
  },
  '20736D Atlas Mode':{
    artifacts:['src/corpusRuntime.ts','src/allModesTruthFusionR151.ts'],tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'12×12×12×12 address',outputContract:'20,736 canonical packet states',
    boundary:'The lattice is a finite state/address space.'
  },
  'Dimensional Relativity Mode':{
    artifacts:['src/weaveStateR100.ts','src/physicsRelativityRuntimeR132.ts'],tests:['tests/dimensional-relativity-r24-invariants.mjs','tests/r77-woven-continuity-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'declared frame + transform + state',outputContract:'frame-relative representation with invariant/scar carry',
    boundary:'Frame-relative representation does not assert additional physical dimensions.'
  },
  'Phase Elasticity Field':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'phase + normalized continuity vector + nonzero stiffness + load history + evidence',outputContract:'elastic debt + snap gate + recovery gradient',
    boundary:'PEF is a bounded archived-model implementation, not an externally validated universal material/biological law.'
  },
  'CTDE':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'DOMAIN_RUNTIME',inputContract:'normalized continuity/constraint state + declared thresholds',outputContract:'144/1728/20736 representational resolution selection',
    boundary:'CTDE escalates address resolution only; it does not create physical dimensions.'
  },
  'Continuance Shell':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'phase + explicit continuity/plasticity/burden/contradiction requirements + evidence',outputContract:'phase-specific continuance admission state',
    boundary:'Failed continuance requirements are retained as boundary state, never erased.'
  },
  'Turn–Atlas Formalism':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'state + phase + declared/candidate invariants + evidence',outputContract:'STAY/TURN/ESCALATE/HOLD + closure state',
    boundary:'A turn cannot be admitted if declared invariants fail or evidence is absent.'
  },
  'Ledgered Phase Metrology':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'phase-indexed measurement + instrument + unit + source + state',outputContract:'hashable measurement/contradiction/scar ledger record',
    boundary:'Invalid measurements remain HOLD; contradiction is stored rather than destroyed.'
  },
  'Executable Atlas Generator':{
    artifacts:['src/corpusRuntime.ts'],tests:['tests/system-atlas-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'atlas coordinate/state definitions',outputContract:'deterministic packet/address generation',
    boundary:'Generated atlas rows are computational state, not measured physical observations.'
  },
  'Non-Flat Prediction Engine':{
    artifacts:['src/continuityModesR280.ts'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'state + prior memory + alpha/beta recurrence + evidence',outputContract:'history-adjusted forecast/control score + memory carry',
    boundary:'The memory recurrence is a bounded model forecast, not prophecy or independent evidence.'
  },
  'HEAVY SCIENCE REVIEW':{
    artifacts:['src/universalTruthEnvelopeR152.ts'],tests:['tests/r152-universal-truth-envelope.mts'],executionClass:'DOMAIN_RUNTIME',inputContract:'claim + typed evidence packets',outputContract:'evidence status + uncertainty + next action',
    boundary:'Verified evidence outranks model/canon coherence.'
  },
  'No-Nothing Truth Mode':{
    artifacts:['src/universalTruthEnvelopeR152.ts'],tests:['tests/r152-universal-truth-envelope.mts'],executionClass:'DOMAIN_RUNTIME',inputContract:'claim/evidence/execution proof',outputContract:'truth boundary + contradiction preservation',
    boundary:'Missing evidence returns unknown/measure/fetch rather than synthetic completion.'
  },
  'Dewey Calculus Mode':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts','src/AppliedCalculusR168.tsx'],tests:['tests/r107-full-calculus-capability-fabric-invariants.mjs'],executionClass:'DOMAIN_RUNTIME',inputContract:'CΩ Φ q Λ Scar + declared operators',outputContract:'bounded derived calculus/control variables',
    boundary:'Physics-themed notation remains model-space unless independently measured.'
  },
  'HEAVY BIO MODE REVIEW':{
    artifacts:['src/heavyBioRuntimeR280.ts','src/BiologicalTraversalR46.tsx'],tests:['tests/r280-mode-realization.mts'],executionClass:'EVIDENCE_GATED_DOMAIN_RUNTIME',inputContract:'explicit normalized bio-state + typed evidence + 12×12×12×12 coordinates',outputContract:'evidence-gated coordination state + continuity/scar record',
    boundary:'No diagnosis, treatment, disease inference, or clinical claim is created from atlas state.'
  },
  'Gamma Reality Admission Science':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts'],tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'DERIVED_LENS',inputContract:'Novelty Fit Proof',outputContract:'admission signal',
    boundary:'The exact donor operator remains gated until Novelty/Fit/Proof are source-bound.'
  },
  'Γ Reality Admission Science':{
    artifacts:['src/sourceBackedModeRuntimeR21.ts'],tests:['tests/source-backed-runtime-r21-invariants.mjs'],executionClass:'DERIVED_LENS',inputContract:'Novelty Fit Proof',outputContract:'admission signal',
    boundary:'The exact donor operator remains gated until Novelty/Fit/Proof are source-bound.'
  }
});

const SOURCE_BINDINGS:Record<string,string[]>=Object.freeze({
  'Unified Coherence Mode':['M001'],
  'Mode 188':['M002','M003'],
  'Deep Mother Mode':['M015'],
  'High Father Mode':['M016'],
  'Prune / Heavy Prune Mode':['M005'],
  'Guidance Field Mode':['M012'],
  'RAFT-188':['M017'],
  'Gamma Reality Admission Science':['M018'],
  'Γ Reality Admission Science':['M018'],
  'Higher-Shell Rendering':['M019']
});

function stageFor(sourceRows:SourceBackedModeResult[],binding:ModeBindingR280|undefined):ModeRealizationStageR280{
  if(sourceRows.some(x=>x.state==='GATED_MISSING_INPUTS'))return'GATED';
  if(sourceRows.some(x=>x.state==='EXECUTED_EXACT')&&binding?.tests?.length)return'PROMOTED';
  if(sourceRows.some(x=>x.state==='EXECUTED_EXACT'))return'IMPLEMENTED';
  if(sourceRows.some(x=>x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME')&&binding?.tests?.length)return'TESTED';
  if(binding?.tests?.length)return'TESTED';
  if(binding)return'IMPLEMENTED';
  return'CHARTED';
}

function executionClassFor(sourceRows:SourceBackedModeResult[],binding:ModeBindingR280|undefined):ModeExecutionClassR280{
  if(sourceRows.some(x=>x.state==='EXECUTED_EXACT'))return'SOURCE_EXECUTED';
  if(sourceRows.some(x=>x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME'))return'SOURCE_PACKET';
  return binding?.executionClass||'DERIVED_LENS';
}

export function compileModeRealizationRegistryR280(record:any){
  const source=sourceBackedModeSummary(record),sourceById=new Map(source.rows.map(x=>[x.id,x]));
  const lensById=new Map(evaluateCanonAuthorityStack(record).map(x=>[x.id,x]));
  const rows=CANON_AUTHORITY_STACK.map(spec=>{
    const sourceRows=(SOURCE_BINDINGS[spec.name]||[]).map(id=>sourceById.get(id)).filter(Boolean) as SourceBackedModeResult[];
    const binding=BINDINGS[spec.name],stage=stageFor(sourceRows,binding),lens=lensById.get(spec.id)!;
    const missing=[...new Set(sourceRows.flatMap(x=>x.missing||[]))];
    const gaps:string[]=[];
    if(stage==='CHARTED')gaps.push('DOMAIN_EXECUTOR_NOT_YET_BOUND');
    if(stage==='GATED')gaps.push(...missing.map(x=>`MISSING_INPUT:${x}`));
    if(!binding?.tests?.length)gaps.push('INDEPENDENT_RUNTIME_TEST_NOT_BOUND');
    return{
      id:spec.id,name:spec.name,group:spec.group,stage,
      lensExecutable:true,lensActivation:lens.activation,lensState:lens.state,lensBasis:lens.basis,
      executionClass:executionClassFor(sourceRows,binding),
      sourceRows:sourceRows.map(x=>({id:x.id,name:x.name,state:x.state,value:x.value,formula:x.formula,source:x.source,missing:x.missing})),
      binding:binding||null,gaps,
      canonicalMutation:false
    };
  });
  const count=(s:ModeRealizationStageR280)=>rows.filter(x=>x.stage===s).length;
  const promoted=count('PROMOTED'),tested=count('TESTED'),implemented=count('IMPLEMENTED'),gated=count('GATED'),charted=count('CHARTED');
  const domainExecutable=rows.filter(x=>x.executionClass!=='DERIVED_LENS'&&x.stage!=='CHARTED').length;
  const fullyBound=rows.filter(x=>x.gaps.length===0).length;
  const criticalGaps=rows.filter(x=>x.stage==='GATED'||x.stage==='CHARTED').map(x=>({id:x.id,name:x.name,stage:x.stage,gaps:x.gaps}));
  return{
    schema:R280_MODE_REALIZATION_SCHEMA,laws:R280_MODE_REALIZATION_LAWS,
    authorityCount:rows.length,sourceCatalogCount:source.catalogCount,sourceBackedRuntimeRows:source.rows.length,
    summary:{promoted,tested,implemented,gated,charted,domainExecutable,fullyBound,lensExecutable:rows.length},
    rows,criticalGaps,
    canonicalMutation:false,canonicalAdmissionAuthority:'R125',
    truthBoundary:'R280 distinguishes a named/charted mode, a derived lens, a source-executed operator, and a domain runtime. All 62 canon authorities have executable read-only lenses through the inherited R12 evaluator, but lens execution is not equivalent to realizing every historical domain executor. Gated inputs remain explicit. Promotion status requires bound runtime/test evidence and never overrides empirical evidence, physical validation, execution receipts, or R125 CanonState admission.'
  };
}

export const R280_MODE_BINDINGS=BINDINGS;
