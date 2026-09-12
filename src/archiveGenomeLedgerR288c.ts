import {ARCHIVE_GENOME_ALL_ROWS_R288} from './archiveGenomeLedgerR288b';
import type {ArchiveGenomeRowR288} from './archiveGenomeLedgerR288';

export const ARCHIVE_GENOME_ROWS_R288C:ArchiveGenomeRowR288[]=[
 {
  id:'AG-023',family:'ADM bounded research/evolution workbook',
  artifacts:['ADM_Research_Engine.xlsx'],driveIds:['1L0kJB_1vJUIiIEnKBMLZOjQtBaVaCG4Z'],
  origin:'USER_AUTHORED',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'ABSENT',
  omegaV6Connection:'Archive workbook is explicitly research-only and implements a bounded multiplicative field, time-step state evolution, shock inputs, thresholds and Mode188 admissibility flags. Current OMEGAv6 has no matching ADM runtime.',
  missingDelta:['typed ADM research schema','bounded state-step simulator','parameter/threshold registry','shock/recovery scenario runner','calibration plots','research-only proof label'],
  promotionClass:'CROSS_VALIDATE',
  validation:['replay workbook formulas exactly','neutral-baseline regression','floor/overload/rigidity/desynchronization gate tests','sensitivity analysis for alpha/beta/delta/sync/PJC parameters','keep synthetic research observations separate from external empirical data'],
  boundary:'ADM is a research model and test harness. Its internal scores or example observations are not factual measurements, coaching authority, medical evidence or autonomous policy.',priority:3
 },
 {
  id:'AG-024',family:'Crash-tree / B053 R9 reconstruction scar lineage',
  artifacts:['SOFTWARE CRASH FOLDER/2Software','clean0808/RECONSTRUC_OMEGA_B053_R9_J_DRIVE_FULL_SYSTEM.py','OMEGA_B053_R9_J_DRIVE_FULL_SYSTEM_PART_01_OF_30.zip ... PART_30_OF_30.zip'],
  driveIds:['1jvhD_9qGho_3T_BUPYwZQgu45M3tjLCM','1UxBnjr7HGyBgeiJfmarpabnKdg3Bq6xh','1VZL_AQla22QXuuK0qb14cBtv0fAyX5XM','1NSXuBLWoE6BuI_wrJJhS6LjSKzgzqEJZ'],
  origin:'OMEGA_ARCHIVE',evidenceState:'SOURCE_REVIEWED',currentCoverage:'PARTIAL',
  omegaV6Connection:'The crash tree preserves historical V6/V18/V32/V55/V160, partition, OS-bin, loader, sprint, prototype and clean-build branches. The B053 R9 reconstruction script contains reusable package-integrity and safe-extraction mechanics relevant to current native recovery.',
  missingDelta:['failure-family census','failure signature registry','known-bad-pattern regression corpus','multi-part archive manifest adapter','safe extraction library','disk-space preflight','master-size/hash verification','reconstruction receipt','repair-vs-rollback policy'],
  promotionClass:'PROOF_PROVENANCE',
  validation:['never execute old crash builds as authority','fingerprint each branch before reading donor code','verify traversal/symlink/duplicate/collision defenses','corrupt/missing/reordered-part negative tests','disk-space failure test','exact master hash/size reconstruction test','turn every confirmed historical failure cause into a regression test'],
  boundary:'Crash-tree presence is failure/history evidence, not a donor-quality signal. Failed/stale builds remain quarantined unless a specific deterministic mechanism is independently recovered and proven.',priority:1
 },
 {
  id:'AG-025',family:'Historical Hybrid Link PowerShell bridge',
  artifacts:['OMEGA_HYBRID_LINK_BRIDGE.ps1','OMEGA_HYBRID_LINK_BRIDGE_V90_R4.ps1','hybridlinktestdumpsite'],
  driveIds:['1piZfTbmBZ3Fk7oqesIY3S1wJTpxhhjr0','15iTnaXAi8X6pbexWc9Rid-qG36fuxhf-','1iWZcIjeCINLotY5LjBaYEoGJm8NaEh0R'],
  origin:'OMEGA_ARCHIVE',evidenceState:'SOURCE_REVIEWED',currentCoverage:'ACTIVE',
  omegaV6Connection:'The archived bridge includes allowlisted file/build/test/package/patch/UI-automation operations, protected token storage, SHA-256 helpers, root/path confinement, bounded wait, visible-window assertions, password-field checks, patch restore, macro recording/replay and URL checks. Current OMEGAv6 Hybrid command runtime and Python agent already implement newer equivalents including patch preconditions, window locking and bounded macro execution.',
  missingDelta:['old→current operation crosswalk','security-control delta','rollback semantic comparison','token-storage comparison','URL/window/path confinement regression vectors','historical bridge compatibility/migration note'],
  promotionClass:'CROSS_VALIDATE',
  validation:['prefer current Python Hybrid agent whenever equivalent','diff allowlists and bounds','prove no old bridge broadens current authority','port only stricter controls or missing negative tests','never persist/reveal credentials in archive ledger'],
  boundary:'The historical PowerShell bridge is not the current execution authority. Existing authenticated heartbeat, current Hybrid agent, authorization and exact execution-receipt rules remain authoritative.',priority:2
 }
];

export const ARCHIVE_GENOME_COMPLETE_R288=[...ARCHIVE_GENOME_ALL_ROWS_R288,...ARCHIVE_GENOME_ROWS_R288C] as const;

export type ArchiveScarR288={id:string;sourceFamily:string;failureClass:string;lesson:string;regressionTest:string;status:'KNOWN_HISTORY'|'TEST_REQUIRED'|'COVERED_CURRENT'};
export const ARCHIVE_SCARS_R288:ArchiveScarR288[]=[
 {id:'SCAR-R288-001',sourceFamily:'Crash-tree multi-part builds',failureClass:'corrupt/missing/reordered package part',lesson:'A multi-part release needs exact part inventory plus final master size/hash before extraction or launch.',regressionTest:'remove/corrupt/reorder one part; reconstruction must fail before admission',status:'TEST_REQUIRED'},
 {id:'SCAR-R288-002',sourceFamily:'Crash-tree extraction',failureClass:'unsafe archive member/path collision',lesson:'Recovery must reject absolute/traversal paths, symlinks, duplicate normalized members and file/directory collisions.',regressionTest:'malicious ZIP corpus must be rejected with no write outside staging root',status:'TEST_REQUIRED'},
 {id:'SCAR-R288-003',sourceFamily:'Historical Hybrid bridge',failureClass:'automation against wrong/secret UI target',lesson:'UI automation needs visible-window/title lock and password-field refusal before input injection.',regressionTest:'wrong-title and password-field scenarios must deny input',status:'COVERED_CURRENT'},
 {id:'SCAR-R288-004',sourceFamily:'Historical Hybrid bridge',failureClass:'unbounded patch/macro action',lesson:'Patches require expected-hash preconditions/restore path; macros require bounded event/runtime limits and target locking.',regressionTest:'stale hash, excessive runtime/event count and target drift must deny/revoke',status:'COVERED_CURRENT'},
 {id:'SCAR-R288-005',sourceFamily:'Archive governance',failureClass:'historical artifact mistaken for current authority',lesson:'Built/tested/accepted/deployed/superseded/current are distinct states and must never collapse.',regressionTest:'historical acceptance receipt cannot satisfy current exact-head/live-device proof gate',status:'COVERED_CURRENT'}
];

export function archiveGenomeCompleteSummaryR288(){
 const rows=[...ARCHIVE_GENOME_COMPLETE_R288];
 return{rows:rows.length,scars:ARCHIVE_SCARS_R288.length,priority1:rows.filter(x=>x.priority===1).length,active:rows.filter(x=>x.currentCoverage==='ACTIVE').length,partial:rows.filter(x=>x.currentCoverage==='PARTIAL').length,absent:rows.filter(x=>x.currentCoverage==='ABSENT').length,gated:rows.filter(x=>x.currentCoverage==='GATED').length};
}
