export type OmegaNavGroup='STUDIO'|'OPERATIONS'|'WORK'|'INTELLIGENCE'|'GOVERNANCE'|'SYSTEM';
export type OmegaNavItem={id:string;group:OmegaNavGroup;name:string;hint:string;effect:'READ'|'COMPUTE'|'GOVERN'|'BUILD'|'EXTERNAL_GATE';authority:'CANONICAL'|'DERIVED'|'EVIDENCE_GATED'|'HOST_GATED'|'GOVERNANCE'};

export const OMEGA_NAVIGATION:OmegaNavItem[]=[
{id:'01',group:'STUDIO',name:'Command Center',hint:'Ask OMEGA, route intent, inspect the current packet and continue governed work.',effect:'COMPUTE',authority:'CANONICAL'},
{id:'02',group:'STUDIO',name:'Hybrid Link',hint:'Prepare and inspect proof-gated PC/device missions without faking native execution.',effect:'EXTERNAL_GATE',authority:'HOST_GATED'},
{id:'03',group:'STUDIO',name:'Workspace',hint:'General sovereign workspace for active OMEGA work and source-bound context.',effect:'READ',authority:'CANONICAL'},
{id:'04',group:'STUDIO',name:'Cockpit',hint:'Operational overview of runtime state, continuity, readiness and active authority.',effect:'READ',authority:'CANONICAL'},
{id:'05',group:'STUDIO',name:'Immersive Traversal',hint:'Continuous embodied traversal of admitted state-space motion.',effect:'COMPUTE',authority:'DERIVED'},
{id:'06',group:'STUDIO',name:'Matter Traversal',hint:'Matter, Water conductance, scar carry, motion and scale-context traversal.',effect:'COMPUTE',authority:'DERIVED'},
{id:'07',group:'STUDIO',name:'Extreme Traversal',hint:'Deep microstructure traversal with motion, proof and relational topology.',effect:'COMPUTE',authority:'DERIVED'},
{id:'08',group:'STUDIO',name:'Visual Instrument',hint:'Source-bound renderer for phase, continuity, burden, contradiction, proof and route.',effect:'COMPUTE',authority:'DERIVED'},
{id:'09',group:'STUDIO',name:'Relativity',hint:'Observer frame, motion relativity, phase, carry and reference-context analysis.',effect:'COMPUTE',authority:'DERIVED'},
{id:'10',group:'STUDIO',name:'Earth Now',hint:'Real returned-source Earth evidence kept separate from canonical OMEGA state.',effect:'EXTERNAL_GATE',authority:'EVIDENCE_GATED'},
{id:'11',group:'STUDIO',name:'Forecast',hint:'Frozen-prior, bounded future-state corridors with uncertainty and no future leakage.',effect:'COMPUTE',authority:'DERIVED'},
{id:'12',group:'STUDIO',name:'Atlas',hint:'Executable 20,736-state atlas and address-space inspection.',effect:'READ',authority:'CANONICAL'},
{id:'13',group:'STUDIO',name:'Traversal',hint:'General state-space traversal across the same canonical packet authority.',effect:'COMPUTE',authority:'DERIVED'},
{id:'14',group:'STUDIO',name:'Create',hint:'Seed → translate → build → render → forecast → prove from one governed entry.',effect:'BUILD',authority:'GOVERNANCE'},
{id:'15',group:'OPERATIONS',name:'Field',hint:'Read-only canonical packet inspection: CΩ, Φ, q, Λ, scar, evidence and calculus.',effect:'READ',authority:'CANONICAL'},
{id:'16',group:'OPERATIONS',name:'Data Motion',hint:'Transport, transition and motion-state operations over admitted source edges.',effect:'COMPUTE',authority:'DERIVED'},
{id:'17',group:'OPERATIONS',name:'Reality Lab',hint:'Observation-to-model computation, validation, back-test and guarded commit.',effect:'COMPUTE',authority:'EVIDENCE_GATED'},
{id:'18',group:'OPERATIONS',name:'Atlas Calculator',hint:'Canonical address, scale, state and atlas calculations.',effect:'COMPUTE',authority:'CANONICAL'},
{id:'19',group:'OPERATIONS',name:'Infinity',hint:'Recursive bounded exploration without silently inventing new physical dimensions.',effect:'COMPUTE',authority:'DERIVED'},
{id:'20',group:'OPERATIONS',name:'Convergence',hint:'Basin, contradiction, continuity and convergence analysis.',effect:'COMPUTE',authority:'DERIVED'},
{id:'21',group:'OPERATIONS',name:'Quality Compiler',hint:'B020 semantic quality gates, repair checks and regression truth tests.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'22',group:'OPERATIONS',name:'Build Out',hint:'Restore, inherit, reconcile, build and surpass while preserving rollback evidence.',effect:'BUILD',authority:'GOVERNANCE'},
{id:'23',group:'WORK',name:'Projects',hint:'Organize active projects against the same OMEGA runtime authority.',effect:'READ',authority:'CANONICAL'},
{id:'24',group:'WORK',name:'Render Queue',hint:'Manage declared render work and evidence-linked output tasks.',effect:'BUILD',authority:'GOVERNANCE'},
{id:'25',group:'WORK',name:'Assets',hint:'Inspect runtime assets, donor material and bounded available resources.',effect:'READ',authority:'CANONICAL'},
{id:'26',group:'INTELLIGENCE',name:'Modes',hint:'Inspect Mode188 and the full executed mode registry without disabling computation.',effect:'COMPUTE',authority:'CANONICAL'},
{id:'27',group:'INTELLIGENCE',name:'Kernel Intelligence',hint:'Sovereign SAI kernel authority, orchestration and evidence-linked reasoning controls.',effect:'COMPUTE',authority:'GOVERNANCE'},
{id:'28',group:'INTELLIGENCE',name:'Evidence & Proof',hint:'Proof ledger, evidence state, admissibility and truth-boundary inspection.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'29',group:'INTELLIGENCE',name:'Memory',hint:'Continuity, retained working context and bounded runtime memory.',effect:'READ',authority:'CANONICAL'},
{id:'30',group:'INTELLIGENCE',name:'Archive Census',hint:'Forensic donor census across historical software and restoration evidence.',effect:'READ',authority:'GOVERNANCE'},
{id:'31',group:'INTELLIGENCE',name:'Archive Operators',hint:'Classify donor material as keep, donor, quarantine, merge or expand.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'32',group:'INTELLIGENCE',name:'Development',hint:'Restore-and-surpass software development with continuity and proof.',effect:'BUILD',authority:'GOVERNANCE'},
{id:'33',group:'INTELLIGENCE',name:'Canon Evolution',hint:'Review canonical revision, inheritance and controlled evolution.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'34',group:'INTELLIGENCE',name:'SAI Lab',hint:'Sovereign intelligence laboratory with SAI control plus contributor fabric.',effect:'COMPUTE',authority:'GOVERNANCE'},
{id:'35',group:'GOVERNANCE',name:'Governance',hint:'Canonical admission, authority, release and proof policy.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'36',group:'GOVERNANCE',name:'Consolidation',hint:'Enforce one-system invariants and eliminate overlapping shadow authorities.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'37',group:'GOVERNANCE',name:'Instructions',hint:'Executable operating map and truth-bound usage guidance.',effect:'READ',authority:'GOVERNANCE'},
{id:'38',group:'SYSTEM',name:'Plugins',hint:'Bounded integration registry and adapter-facing capabilities.',effect:'EXTERNAL_GATE',authority:'HOST_GATED'},
{id:'39',group:'SYSTEM',name:'Settings',hint:'Runtime presentation and bounded configuration without rewriting canonical evidence.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'40',group:'SYSTEM',name:'System',hint:'Hosted runtime state, checks, diagnostics, provider and restoration status.',effect:'READ',authority:'GOVERNANCE'},
{id:'41',group:'SYSTEM',name:'Validation',hint:'Universal validation, semantic gates and release-readiness evidence.',effect:'GOVERN',authority:'GOVERNANCE'},
{id:'42',group:'SYSTEM',name:'System Atlas',hint:'24-family software atlas and subsystem relationship map.',effect:'READ',authority:'GOVERNANCE'},
{id:'43',group:'SYSTEM',name:'Scale Compiler',hint:'Recursive-scale compiler and representational hierarchy inspection.',effect:'COMPUTE',authority:'DERIVED'},
{id:'44',group:'SYSTEM',name:'Control Matrix',hint:'System Atlas control matrix for routing, family relationships and system control.',effect:'GOVERN',authority:'GOVERNANCE'}
];

export const OMEGA_NAV_GROUPS:OmegaNavGroup[]=['STUDIO','OPERATIONS','WORK','INTELLIGENCE','GOVERNANCE','SYSTEM'];
export const OMEGA_NAV_NAMES=OMEGA_NAVIGATION.map(x=>x.name);
export function omegaNavItem(name:string){return OMEGA_NAVIGATION.find(x=>x.name===name)||null}
