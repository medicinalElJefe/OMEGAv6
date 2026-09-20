import {R332_B12_PROGRESS_RECEIPT} from './system/qtiControlR332.js';
import {R334_B06_PROGRESS_RECEIPT} from './system/proofGovernedRelationalRuntimeR334.js';
import {R335_PROPAGATION_RECEIPT} from './system/calibrationPropagationR335.js';
import {R340_PROPAGATION_RECEIPT} from './system/calibrationPropagationR340.js';
import {OMEGA_CAPABILITY_AUTHORITY,capabilityReality,type CapabilityReality} from './capabilityAuthority';
import {ARCHIVE_GENOME_ALL_ROWS_R288,archiveGenomeAllSummaryR288} from './archiveGenomeLedgerR288b';
import {R328_SOURCE_CANON_RECEIPT} from './system/sourceExactCanonR328';
import {R329_B05_PROMOTION_RECEIPT} from './system/authoritativeStateSpineR329';

export const R314_CONVERGENCE_SCHEMA='OMEGA_CONVERGENCE_MASTER_R314' as const;
export const R314_CONVERGENCE_REVISION='R314' as const;

export type R314BuildState='PROVED'|'ACTIVE'|'READY'|'BLOCKED'|'QUEUED'|'EVIDENCE_GATED'|'DEVICE_GATED'|'PROVIDER_GATED';
export type R314BuildStage={
 id:string;
 order:number;
 title:string;
 objective:string;
 dependsOn:string[];
 sourceFamilies:string[];
 deliverables:string[];
 proof:string[];
 automationClass:'INTEGRITY'|'CONTROL_PLANE'|'DETERMINISTIC_REPAIR'|'DATA_COMPILER'|'RUNTIME'|'RENDERER'|'AI_GOVERNANCE'|'PACKAGING'|'ACCEPTANCE';
 mutationClass:'NONE'|'BOUNDED_SOURCE'|'DATA_ONLY'|'DEVICE_GATED';
};

// This graph is intentionally finite, dependency-explicit and evidence-bound. It is
// the convergence order for one OMEGAv6 system, not a second state/runtime authority.
export const R314_BUILD_STAGES:readonly R314BuildStage[]=[
 {id:'R314-B01',order:1,title:'All-surface interface integrity',objective:'Prove every canonical route, menu, submenu, panel, disclosure, control and responsive layout before adding product depth.',dependsOn:[],sourceFamilies:['R313','R286','R289'],deliverables:['44-route reachability','no-dead-control proof','panel disclosure proof','safe-control interaction proof','desktop/mobile navigation integrity'],proof:['exact-head browser matrix green','production build green'],automationClass:'INTEGRITY',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B02',order:2,title:'Convergence master control plane',objective:'Derive one current-capability chart, one incomplete/debt chart and one exact dependency build graph from canonical source authorities.',dependsOn:['R314-B01'],sourceFamilies:['R168','R288','R288B','Implementation Canon V2'],deliverables:['current capability projection','archive residual projection','dependency graph','operator-facing convergence surface','machine-readable snapshot'],proof:['44 capabilities represented exactly once','all archive genome rows represented exactly once','no orphan dependencies'],automationClass:'CONTROL_PLANE',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B03',order:3,title:'Autonomous loop scope repair',objective:'Replace low-value revision cycling with residual-driven work selection that can make bounded real-source repairs, proves measurable gain and refuses repeated no-op generations.',dependsOn:['R314-B02'],sourceFamilies:['R164','R170','R223','R240','R243','R245','R266'],deliverables:['typed work queue','residual fingerprint ledger','bounded path allowlists','candidate gain gate','failed-attempt scar carry','no-op suppression','one-open-candidate fence'],proof:['same residual cannot loop indefinitely','candidate must reduce evidenced debt','all source mutation isolated to candidate branch','no direct Canon admission'],automationClass:'DETERMINISTIC_REPAIR',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B04',order:4,title:'675-row Implementation Canon reconciliation + R328 source-exact semantic crosswalk',objective:'Keep the 675-row Implementation Canon and the 3,743-row R328 semantic/provenance canon separate, then crosswalk both to current artifacts, gates and proof without silently promoting source intent into implementation.',dependsOn:['R314-B02'],sourceFamilies:['AG-021','R328 SOURCE-EXACT CANON'],deliverables:['675-row implementation compiler','3,743-row semantic registry','module/symbol/shader/API/DB/test/build-gate crosswalk','record-level semantic crosswalk','conflict-variant ledger','single-writer reconciliation','machine-readable completion ledger'],proof:['675 implementation rows classified','3,743 semantic rows preserved and classified','ACTIVE requires exact source evidence','conflict variants remain intact','no PLANNED/source row promoted by naming alone'],automationClass:'DATA_COMPILER',mutationClass:'DATA_ONLY'},
 {id:'R314-B05',order:5,title:'Typed state, units, frames and multi-clock spine',objective:'Make synchronous data explicit: immutable packets bind units, coordinate frames, event/receive/monotonic/logical/compute/validity time and proof provenance before interpretation.',dependsOn:['R314-B04'],sourceFamilies:['Implementation Canon V2','Woven Continuity'],deliverables:['typed packet base','unit registry','frame graph','temporal packet','proof record','single authoritative state writer'],proof:['round-trip serialization/hash','unit/frame rejection tests','causal ordering tests','single-writer invariant'],automationClass:'RUNTIME',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B06',order:6,title:'Motion, relativity and continuity engine',objective:'Unify observer/frame transforms, motion derivatives, uncertainty, scar/history carry and resolution-relative addressing without converting atlas resolutions into physical dimensions.',dependsOn:['R314-B05'],sourceFamilies:['AG-003','AG-004','AG-005','R265','R266'],deliverables:['frame transform operators','motion hypothesis','parent/fold relativity adapter','Water transport registry','Woven carry engine','Violet re-expression adapter','calibration receipts'],proof:['transform round trips','orientation reversal invariants','time-step validity','golden-row replay','no literal-dimension claims'],automationClass:'RUNTIME',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B07',order:7,title:'Full calculus and visual grammar recovery',objective:'Recover archived Water/Violet/Woven/Mode188 equations and visual grammars as typed selectable state-bound instruments rather than decorative replicas.',dependsOn:['R314-B06'],sourceFamilies:['AG-003','AG-004','AG-008','AG-009','AG-017'],deliverables:['formula registry','operator provenance','SVG semantic parser','visual grammar registry','Full Sphere timeline/lens/fold/antipode/dodecahedral controls','Cube lineage crosswalk'],proof:['formula provenance','state-bound visual primitives','legacy semantics marked','visual regression corpus'],automationClass:'RUNTIME',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B08',order:8,title:'Source ingest, calibration and world reconstruction',objective:'Compile source identity, frame assembly, calibration, rays, correspondence, depth, topology, motion, material, identity and fusion into one evidence-bound world-state pipeline.',dependsOn:['R314-B05','R314-B06'],sourceFamilies:['AG-007','Implementation Canon V2'],deliverables:['source registry','frame assembler','radiometric/geometric calibration','ray builder','correspondence engine','depth/topology/motion solvers','material/identity fusion','residual analyzer'],proof:['recorded-input deterministic replay','uncertainty retained','no hidden synthetic fallback','source/state IDs on output geometry'],automationClass:'RUNTIME',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B09',order:9,title:'GPU hierarchical renderer and host runtime',objective:'Recover the archived native GPU hierarchy and host spine selectively behind current state/proof authorities.',dependsOn:['R314-B05','R314-B08'],sourceFamilies:['AG-019','AG-020','AG-014'],deliverables:['GPU capability probe','20,736 packet mirror','20,735 transition-edge buffer','ancestry buffers','scale projection laws','state uploader','HDR/offscreen path','renderer supervision','frame receipts'],proof:['CPU↔GPU state hash correspondence','deterministic frame receipt','GPU/VRAM benchmark','renderer restart without state loss'],automationClass:'RENDERER',mutationClass:'DEVICE_GATED'},
 {id:'R314-B10',order:10,title:'Earth, Full Sphere and traversal convergence',objective:'Join source-backed WGS84 Earth evidence, traversal, forecast and Full Sphere presentation over the same canonical packet and clock/frame spine.',dependsOn:['R314-B06','R314-B08','R314-B09'],sourceFamilies:['AG-008','Earth Now','Traversal','Forecast'],deliverables:['Earth source adapters','WGS84 geometry','history/NOW/forecast timeline','precession/orbital layers','continuous scale traversal','observer-relative projection'],proof:['source timestamp/provenance','no generated scenery substitution','frame/coordinate round trips','forecast uncertainty visible'],automationClass:'RUNTIME',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B11',order:11,title:'Heavy Bio typed corpus and instrument',objective:'Compile the full 36-shard Heavy Bio archive into a typed provenance-preserving query/visual corpus without promoting model data into clinical truth.',dependsOn:['R314-B04','R314-B05'],sourceFamilies:['AG-006'],deliverables:['36-shard index','schema reconciliation','typed provenance','cross-shard checksums','query engine','visual layer mapping'],proof:['all shards indexed','duplicate/version audit','range/type validation','clinical-claim boundary preserved'],automationClass:'DATA_COMPILER',mutationClass:'DATA_ONLY'},
 {id:'R314-B12',order:12,title:'SAI / PSC / AGI-QTI governed intelligence',objective:'Recover reasoning, PSC, memory and QTI mechanics while preserving independent authorization and current state/return-proof boundaries.',dependsOn:['R314-B03','R314-B05'],sourceFamilies:['AG-001','AG-002','AG-018'],deliverables:['working/episodic/semantic/procedural memory services','typed memory object','append-only event ledger','PSC adapters','QTI G1-G10 gates','independent safety controller','watchdog vector','transactional action flow'],proof:['memory poisoning tests','stale authorization rejection','state-version binding','proposal cannot self-authorize','append-only replay'],automationClass:'AI_GOVERNANCE',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B13',order:13,title:'Hybrid native execution, transactions and recovery',objective:'Converge host/device execution, DB transactions, transport, watchdog, action receipts and rollback behind current Hybrid authorization.',dependsOn:['R314-B05','R314-B12'],sourceFamilies:['AG-010','AG-020','Hybrid Link'],deliverables:['host action executor','commit envelope','DB transaction/rollback','WebSocket transport','watchdog','repair/reconstruct adapter','support bundle'],proof:['current authenticated device heartbeat','exact returned action receipt','rollback replay','network isolation','no competing state writer'],automationClass:'RUNTIME',mutationClass:'DEVICE_GATED'},
 {id:'R314-B14',order:14,title:'Scientific and dependency pack admission',objective:'Admit scientific workbooks and selected third-party dependencies only with schema, provenance, license, version and fidelity boundaries.',dependsOn:['R314-B04','R314-B05'],sourceFamilies:['AG-007','AG-013','AG-014','AG-015','AG-016'],deliverables:['domain schemas/loaders','equation registries','analytic optics adapter','Qt dependency manifest','spatial-audio adapter','bounded optional model registry'],proof:['license/version checks','known-vector tests','unit consistency','feature exercised before support claim'],automationClass:'DATA_COMPILER',mutationClass:'DATA_ONLY'},
 {id:'R314-B15',order:15,title:'One-click sovereign packaging and repair',objective:'Produce a reproducible Windows/local package with manifest/hash verification, dependency preflight, repair, rollback and current Hybrid authorization boundaries.',dependsOn:['R314-B09','R314-B13'],sourceFamilies:['AG-010'],deliverables:['one-click installer/launcher','manifest/hash ledger','dependency preflight','repair mode','rollback receipt','diagnostic support bundle'],proof:['clean-machine install','upgrade test','rollback test','hash verification','offline/local boot'],automationClass:'PACKAGING',mutationClass:'DEVICE_GATED'},
 {id:'R314-B16',order:16,title:'Release lineage and provenance scars',objective:'Normalize historical build receipts and decisions into queryable lineage without treating historical acceptance as current live proof.',dependsOn:['R314-B02'],sourceFamilies:['AG-011','AG-012'],deliverables:['receipt schema normalization','release lineage graph','supersession map','decision parser','authority-change timeline','scar carry'],proof:['hash/manifest consistency','exact release binding','superseded paths marked','no stale live-state carry'],automationClass:'DATA_COMPILER',mutationClass:'DATA_ONLY'},
 {id:'R314-B17',order:17,title:'Product simplification and expert navigation',objective:'Present the full system through a simple task-first shell while retaining deep specialist routes, evidence states and accessibility on desktop/mobile.',dependsOn:['R314-B02','R314-B07','R314-B10','R314-B11','R314-B12','R314-B13'],sourceFamilies:['R289','R313','Consolidation'],deliverables:['task-first home','searchable command/navigation layer','progressive disclosure','consistent panel anatomy','proof/state badges','keyboard/touch parity'],proof:['44 routes reachable','all enabled controls actionable','no overlap/clipping at supported viewports','operator task regression suite'],automationClass:'INTEGRITY',mutationClass:'BOUNDED_SOURCE'},
 {id:'R314-B18',order:18,title:'Full-system acceptance and continuous advancement',objective:'Require the complete dependency graph, exact-head test matrix, production deployment receipt and residual reduction before a release or autonomous next cycle is accepted.',dependsOn:['R314-B03','R314-B04','R314-B06','R314-B07','R314-B08','R314-B09','R314-B10','R314-B11','R314-B12','R314-B13','R314-B14','R314-B15','R314-B16','R314-B17'],sourceFamilies:['R125','R141','R146','R147','R170','R210','R223','R241'],deliverables:['exact-head acceptance matrix','production receipt','residual delta receipt','rollback target','next-cycle work queue'],proof:['all required workflows green on exact head','production source/version/assets match','live verification returned','measurable residual reduction','no unproven Canon admission'],automationClass:'ACCEPTANCE',mutationClass:'NONE'}
] as const;

const ACTIVE_REALITIES=new Set<CapabilityReality>(['RUNTIME_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const GATED_REALITIES=new Set<CapabilityReality>(['EVIDENCE_GATED','DEVICE_GATED','PROVIDER_GATED']);
const COVERAGE_PRESSURE:Record<string,number>={ACTIVE:0,PARTIAL:3,GATED:4,LEDGER_ONLY:5,ABSENT:6};
const PRIORITY_PRESSURE:Record<number,number>={1:5,2:3,3:2,4:1,5:1};

export function currentCapabilityChartR314(){
 return OMEGA_CAPABILITY_AUTHORITY.map((capability,index)=>{
  const reality=capabilityReality(capability.name);
  return {
   index:index+1,
   name:capability.name,
   family:capability.family,
   implementation:capability.implementation,
   boundary:capability.boundary,
   reality,
   state:ACTIVE_REALITIES.has(reality)?'ACTIVE':GATED_REALITIES.has(reality)?'GATED':'DEBT',
   views:[...capability.views],
   purpose:capability.purpose,
  };
 });
}

export function incompleteArchiveChartR314(){
 return ARCHIVE_GENOME_ALL_ROWS_R288.map(row=>({
  id:row.id,
  family:row.family,
  origin:row.origin,
  evidenceState:row.evidenceState,
  coverage:row.currentCoverage,
  priority:row.priority,
  promotionClass:row.promotionClass,
  connection:row.omegaV6Connection,
  missing:[...row.missingDelta],
  validation:[...row.validation],
  boundary:row.boundary,
  residualPressure:(COVERAGE_PRESSURE[row.currentCoverage]??6)*(PRIORITY_PRESSURE[row.priority]??1)+row.missingDelta.length,
 }));
}

export function exactBuildChartR314(){
 const known=new Set(R314_BUILD_STAGES.map(x=>x.id));
 return R314_BUILD_STAGES.map(stage=>({
  ...stage,
  dependenciesValid:stage.dependsOn.every(id=>known.has(id)),
  terminal:stage.id==='R314-B18',
 }));
}

export function convergenceResidualR314(){
 const capabilities=currentCapabilityChartR314();
 const archive=incompleteArchiveChartR314();
 const build=exactBuildChartR314();
 return {
  capability:{total:capabilities.length,active:capabilities.filter(x=>x.state==='ACTIVE').length,gated:capabilities.filter(x=>x.state==='GATED').length,debt:capabilities.filter(x=>x.state==='DEBT').length},
  archive:{total:archive.length,active:archive.filter(x=>x.coverage==='ACTIVE').length,incomplete:archive.filter(x=>x.coverage!=='ACTIVE').length,priority1:archive.filter(x=>x.priority===1&&x.coverage!=='ACTIVE').length,residualPressure:archive.reduce((sum,x)=>sum+x.residualPressure,0)},
  build:{total:build.length,invalidDependencies:build.filter(x=>!x.dependenciesValid).map(x=>x.id)},
 };
}

export function buildConvergenceMasterR314(){
 const current=currentCapabilityChartR314();
 const incomplete=incompleteArchiveChartR314();
 const build=exactBuildChartR314();
 return {
  schema:R314_CONVERGENCE_SCHEMA,
  revision:R314_CONVERGENCE_REVISION,
  truthBoundary:'Derived from current source authorities. A chart row is not execution, scientific validation, device proof, deployment proof or CanonState admission.',
  laws:[
   'ONE_SYSTEM_ONE_AUTHORITATIVE_STATE_WRITER',
   'BUILD_PROGRESS_REQUIRES_EVIDENCED_RESIDUAL_REDUCTION',
   'NO_REVISION_ONLY_PROGRESS',
   'NO_REPEAT_WITHOUT_NEW_EVIDENCE_OR_A_CHANGED_REPAIR_HYPOTHESIS',
   'AUTONOMOUS_SOURCE_MUTATION_IS_BRANCH_ISOLATED_ALLOWLISTED_AND_PROOF_GATED',
   'GENERATED_DOES_NOT_EQUAL_PROVED_DOES_NOT_EQUAL_DEPLOYED_DOES_NOT_EQUAL_CANON_ADMITTED',
   'OBSERVER_OR_VIEW_TRANSFORMS_DO_NOT_CREATE_A_SECOND_CANONICAL_STATE',
   'ATLAS_RESOLUTION_LEVELS_ARE_ADDRESSES_NOT_LITERAL_PHYSICAL_DIMENSIONS',
   'SYNCHRONOUS_DATA_REQUIRES_EXPLICIT_CLOCK_FRAME_UNIT_AND_PROVENANCE_BINDING',
   'SCAR_HISTORY_SURVIVES_REPAIR_ROLLBACK_AND_REPLAY',
   'SOURCE_EXACT_SEMANTIC_CANON_REMAINS_SEPARATE_FROM_IMPLEMENTATION_CANON',
   'CONFLICT_VARIANTS_ARE_PRESERVED_UNTIL_EXPLICIT_PROOF_RESOLVES_THEM',
   'RELATIONAL_TRANSITIONS_REQUIRE_PROVENANCE_SCAR_AND_QTI_PROOF_BEFORE_FORECAST_OR_NEXT_PARENT',
   'FORECAST_IS_A_PROSPECTIVE_STATE_PROPOSAL_NOT_EXECUTION_OR_CANON_ADMISSION',
  ],
  archiveSummary:archiveGenomeAllSummaryR288(),
  sourceExactCanon:{revision:'R328',...R328_SOURCE_CANON_RECEIPT,semanticSource:true,implementationCanonSeparate:true,canonicalAdmission:false},
  promotionReceipts:[R340_PROPAGATION_RECEIPT,R335_PROPAGATION_RECEIPT,R334_B06_PROGRESS_RECEIPT,R332_B12_PROGRESS_RECEIPT,R329_B05_PROMOTION_RECEIPT],
  residual:convergenceResidualR314(),
  charts:{current,incomplete,build},
 };
}
