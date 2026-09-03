export const ACCEPTED_PRODUCTION_CONTRACT_R95={
 id:'OMEGA_ACCEPTED_PRODUCTION_CONTRACT_R95',
 authority:'PERSISTENT_NON_REGRESSION',
 rules:[
  {id:'PRESERVE_ACCEPTED',text:'Accepted production behavior is preserved by default. Improvement means extension, refinement, repair, or verified supersession; not replacement-by-simplification.'},
  {id:'NO_REGRESSION_BY_OMISSION',text:'A change may not silently drop a route, capability, control, proof path, data channel, donor-backed function, mobile behavior, desktop behavior, or accepted visual interaction.'},
  {id:'NO_GENERIC_SUBSTITUTION',text:'OMEGA-native visual instruments may not be replaced by generic dashboard widgets, business bar charts, decorative placeholder graphics, or one repeated renderer used as every mode.'},
  {id:'TRACEABLE_VISUAL_GEOMETRY',text:'Primary OMEGA state geometry must map declared source/canonical/evaluated variables to declared geometry parameters. Every visible deformation must have a traceable variable mapping.'},
  {id:'DISTINCT_APPLICATION_IDENTITY',text:'Forecast, Relativity, Atlas, Infinity, Field, Motion, Convergence, Matter, Traversal, Scale, Earth, Modes and other specialist surfaces keep distinct interaction and visual semantics.'},
  {id:'TRUTH_WITHOUT_FLATTENING',text:'Truth enforcement must not flatten advanced visualization into generic charts. Measured/imported/evaluated/derived/forecast/representational status is separated while retaining the richest lawful visualization.'},
  {id:'KEEP_DONOR_UNTIL_VERIFIED',text:'When superseding an accepted renderer or subsystem, retain the prior implementation as recoverable donor/optional lineage until the replacement passes functional and visual acceptance.'},
  {id:'MOBILE_DESKTOP_PARITY',text:'Mobile and desktop must expose the same core capability and truth state through device-appropriate interaction, without overlays hiding the primary instrument.'},
  {id:'NO_FAKE_CONTROL',text:'Visible controls must either enact a real bounded state/action path or expose an explicit gated/unavailable state. Decorative or no-op controls are forbidden.'},
  {id:'STATE_INTELLIGENCE_MEMORY_RELATION_COMPUTATION_ACTION_OBSERVATION_PROOF',text:'OMEGA remains one machine: State + Intelligence + Memory + Relation + Computation + Action + Observation + Proof. UI work may not sever or substitute these layers.'},
  {id:'CANONICAL_STATE_ONE_MANY_VIEWS',text:'One canonical state may have multiple lawful views. A view never becomes independent truth ownership merely because it is visually expressive.'},
  {id:'ARCHIVE_LEDGER_AUTHORITY',text:'The software ledger, restore manifests, accepted main lineage, regression gates, and release receipts are required recovery context before major replacement or pruning.'},
  {id:'USER_ACCEPTANCE_PRIORITY',text:'Previously accepted interaction/visual behavior is treated as a product requirement until explicitly superseded; context rollover does not reset that requirement.'}
 ] as const,
 preservedLayers:[
  'R85 intent/workflow engine',
  'R86 operation proof bus',
  'R87 project continuity',
  'R89 flat 44-route navigator',
  'R90 integrity/truth boundaries',
  'R91 operational hierarchy',
  'R92 specialist surface hierarchy',
  'R93 visual-truth enforcement',
  'R94 44-surface provenance authority',
  'deep Matter/Visual/Traversal donor implementations',
  'Hybrid Link device-proof boundary',
  'Earth returned-evidence boundary',
  'route-before-generation',
  'canonical state / admitted transition authority'
 ] as const,
 visualRule:'Do not solve visual truth by reducing OMEGA to generic charts. Build source-driven OMEGA-native geometry with an explicit variable-to-geometry map.',
 replacementRule:'If a replacement is proposed, the prior accepted implementation stays available until the new version demonstrates functional parity, stronger truth, responsive parity, and a verified non-regression pass.',
 rolloverRule:'A new chat/session must recover this contract from repository state before making broad UI, renderer, navigation, capability, or architecture replacements.'
} as const;

export function acceptedProductionAuditR95(){
 const ids=ACCEPTED_PRODUCTION_CONTRACT_R95.rules.map(x=>x.id),unique=new Set(ids).size===ids.length;
 const required=['PRESERVE_ACCEPTED','NO_REGRESSION_BY_OMISSION','NO_GENERIC_SUBSTITUTION','TRACEABLE_VISUAL_GEOMETRY','KEEP_DONOR_UNTIL_VERIFIED','USER_ACCEPTANCE_PRIORITY'];
 return{
  total:ids.length,
  unique,
  requiredPresent:required.every(x=>ids.includes(x as any)),
  pass:unique&&required.every(x=>ids.includes(x as any)),
  authority:ACCEPTED_PRODUCTION_CONTRACT_R95.authority,
  boundary:'This contract prevents regression-by-omission and replacement-by-simplification. It does not by itself prove runtime execution; normal execution/proof gates still apply.'
 };
}
