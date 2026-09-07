export const R153_REVISION='R153';
export const R153_SCHEMA='OMEGA_FULL_SYSTEM_COMPLETION_R153';

export const R153_FAMILY_SUCCESSOR=Object.freeze({
 S00:'WEB_ACTIVE',S01:'SOURCE_ACTIVE',S02:'SOURCE_ACTIVE',S03:'DEVICE_GATED',S04:'EVIDENCE_GATED',S05:'EVIDENCE_GATED',
 S06:'SOURCE_ACTIVE',S07:'SOURCE_ACTIVE',S08:'SOURCE_ACTIVE',S09:'EVIDENCE_GATED',S10:'SOURCE_ACTIVE',S11:'LOCAL_ACTIVE',
 S12:'LOCAL_ACTIVE',S13:'SOURCE_ACTIVE',S14:'SOURCE_ACTIVE',S15:'EVIDENCE_GATED',S16:'LOCAL_ACTIVE',S17:'LOCAL_ACTIVE',
 S18:'LOCAL_ACTIVE',S19:'SOURCE_ACTIVE',S20:'LOCAL_ACTIVE',S21:'LOCAL_ACTIVE',S22:'DEVICE_GATED',S23:'LOCAL_ACTIVE'
});

export const R153_COMPLETION_STAGES=Object.freeze([
 {order:1,id:'RUNTIME',menu:'01 Runtime Core',route:'System',goal:'Preserve exactly one HostState + CanonState owner and one public runtime entrypoint.',proof:'identity + health + no-shadow-state'},
 {order:2,id:'PROOF',menu:'02 Proof & Governance',route:'Evidence & Proof',goal:'Keep admission, replay, drift, scars, returned proof and rejection history on one proof spine.',proof:'R141/R142 receipts + replay + R125 admission boundary'},
 {order:3,id:'TRAVERSAL',menu:'03 Traversal',route:'Traversal',goal:'Run reversible stay/turn/escalate traversal through the canonical packet/address substrate.',proof:'route replay + return path + source-backed calculus'},
 {order:4,id:'RENDER',menu:'04 Render Field',route:'Visual Instrument',goal:'Use one state-bound renderer/scene authority for field, surface, skin, graph, assembly, material, evidence, canon and traversal views.',proof:'frame/state identity + no decorative substitution'},
 {order:5,id:'HOST',menu:'05 Host Inputs',route:'Hybrid Link',goal:'Bind text/file/system/camera/native observations as typed observed/derived/inferred inputs without source inflation.',proof:'current authenticated heartbeat + evidence class'},
 {order:6,id:'AI',menu:'06 AI Orchestration',route:'SAI Lab',goal:'Route AI/SAI/plugin/Hybrid work through capability contracts and explicit execution lifecycle receipts.',proof:'DISCOVERED→AUTHORIZED→AVAILABLE→INVOKED→RETURNED→VERIFIED'},
 {order:7,id:'DATA',menu:'07 Data / Excel Atlas',route:'System Atlas',goal:'Keep workbook/CSV/JSON/atlas controls on the same packet, checksum and round-trip data authority.',proof:'fingerprint + formula/source boundary + round-trip receipt'},
 {order:8,id:'SIGNAL',menu:'08 Audio / Signal',route:'System Atlas',goal:'Keep optional packet sonification synchronized to state without becoming physical-frequency truth.',proof:'explicit local start + packet identity'},
 {order:9,id:'WORLD',menu:'09 World / Bio / Forecast',route:'Forecast',goal:'Run Earth, biological-scale, relativity and forecast projections as bounded domain plugins over the same packet.',proof:'source/evidence boundary per domain'},
 {order:10,id:'PACKAGE',menu:'10 Recovery / Packaging',route:'Build Out',goal:'Build, test, package, repair and rollback from one approved non-system root using the current zero-drift connector.',proof:'hash tree + tests + package/support receipt'},
 {order:11,id:'ARCHIVE',menu:'11 Archive Merge',route:'Archive Operators',goal:'Fingerprint and classify KEEP/MERGE/DONOR/QUARANTINE before extraction; never let a stale donor seize authority.',proof:'diff + provenance + preimage-bound change'},
 {order:12,id:'COCKPIT',menu:'12 Operator Cockpit',route:'Cockpit',goal:'Expose every registered destination and action through one professional desktop/mobile control surface without covering the primary instrument.',proof:'44-route desktop/mobile operational pass + actionable-control audit'}
]);

export const R153_FULL_SYSTEM_CONTRACT=Object.freeze({
 schema:R153_SCHEMA,
 revision:R153_REVISION,
 authority:'R48 successor reality + R95 one-system ledger + R143 route operation contracts + R142 execution receipts + R141 exact Hybrid closure + R125 CanonState admission',
 sources:Object.freeze([
  'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx',
  'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',
  'OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx',
  'current OMEGAv6 main source + admitted regression receipts'
 ]),
 invariant:'ONE FIELD / ONE PACKET / ONE CONTINUITY LAW',
 inventory:Object.freeze({systems:100,families:24,masterMenus:12,menuOptions:36,capabilities:18,routes:44,sourceModes:179,canonLenses:62,packetStates:20736,logicalCells:1728,logicalLanes:20736,addressCapacity:61917364224}),
 successor:Object.freeze({implemented:19,truthGated:5,restorationDebt:0,states:R153_FAMILY_SUCCESSOR}),
 nativeRootPolicy:'Use only the user-approved non-system root. J:\\ is the preferred established root. Never silently fall back to C:\\ for OMEGA runtime state.',
 rendererPolicy:'One scene/state authority; renderer consumes state-bound packets and never creates truth. Backend fallback must preserve the same scene rather than substitute unrelated visuals.',
 mutationPolicy:'Inventory and hash before mutation. Preserve working capability layers. Repair only proven defects. Use preimage-bound changes. No silent delete/move/rename/flattening. Every material change must return proof.',
 completionDefinition:'All 24 software families have a current successor implementation or an explicit evidence/device gate; all 44 routes remain reachable; every executable action is capability-mapped; native work is admitted only with current device proof; returned work is not VERIFIED until R141/R142 proof closes; CanonState mutation remains R125-only.',
 stages:R153_COMPLETION_STAGES,
 truthBoundary:'R153 removes stale restoration labels where stronger successor implementations already exist. It does not convert evidence gates, device gates, external provider availability, native execution, solver freshness, empirical validation or CanonState admission into fictional success.'
});

export function buildFullSystemMissionObjectiveR153(root='.'){
 const broad=String(root||'.').trim()==='.';
 return [
  'Complete the current OMEGA one-system build from the existing source instead of redesigning or flattening it.',
  broad?'First inventory the approved root, locate the current OMEGAv6 project boundary from returned filesystem evidence, and hash candidate trees before any mutation.':'Treat the selected project path as the candidate boundary, inventory it and hash it before any mutation.',
  'Preserve the existing 100-system / 24-family / 12-master-menu / 36-control / 18-capability / 44-route architecture and the current 179 source-mode + 62 canon-lens fabric.',
  'Use R48 successor reality as current implementation truth: 19 families are web/source/local active, 5 remain evidence/device gated, and zero current successor families are restoration debt. Do not regress a successor to an older donor status.',
  'Converge exactly one HostState/CanonState authority, one route/capability registry path, one proof/ledger spine, one scene/render authority, one project continuity path, one update/release path and one current Hybrid connector. Remove only proven duplicate/shadow execution paths after their stronger successor is verified.',
  'Verify every registered route and every user-facing button/menu/action. No no-op controls, buried unreachable features, overlapping mobile/desktop navigation, decorative replacement visuals, fake online states or synthetic receipts are allowed.',
  'For native work use only the approved non-system root; J:\\ is preferred. Never use C:\\ as silent OMEGA runtime fallback. Never install global dependencies silently.',
  'For PC/RCWA, use the current R127 zero-drift connector and R34.1/R132 execution plane. RCWA is online only after NumPy + grcwa import and a current solver heartbeat/proof. Browser pairing alone is not PC proof.',
  'For AI/SAI/plugins/Hybrid, preserve the R142 lifecycle: DISCOVERED, AUTHORIZED, AVAILABLE, INVOKED, RETURNED, VERIFIED; RETURNED is not VERIFIED. R141 exact payload closure remains Hybrid proof authority and R125 alone admits CanonState mutation.',
  'For archive/Drive donors, fingerprint and compare before extraction. KEEP/MERGE/DONOR/QUARANTINE classification must remain visible. Never overwrite current authority merely because an older artifact contains more files.',
  'Run the declared static regression, production build, route/mobile browser tests when available, worker dry-run, package/support generation and deterministic replay checks. If proof exposes a defect, repair the smallest proven cause and rerun the affected plus inherited gates.',
  'Return an exact machine-readable proof packet listing inspected roots, pre/post hashes, changed files, tests, build/package outputs, failures/holds, current family successor states, remaining evidence/device gates and the final execution fingerprint. Never claim completion from intent or generated text alone.'
 ].join(' ');
}

export function fullSystemStateContextR153(){
 return {schema:R153_SCHEMA,revision:R153_REVISION,invariant:R153_FULL_SYSTEM_CONTRACT.invariant,inventory:R153_FULL_SYSTEM_CONTRACT.inventory,successor:R153_FULL_SYSTEM_CONTRACT.successor,stages:R153_COMPLETION_STAGES.map(x=>({order:x.order,id:x.id,menu:x.menu,route:x.route,proof:x.proof})),rootPolicy:R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy,mutationPolicy:R153_FULL_SYSTEM_CONTRACT.mutationPolicy,completionDefinition:R153_FULL_SYSTEM_CONTRACT.completionDefinition,canonicalAdmission:'R125',executionReceiptAuthority:'R142',hybridClosureAuthority:'R141'};
}
