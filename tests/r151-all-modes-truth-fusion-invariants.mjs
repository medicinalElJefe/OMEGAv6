import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R151 '+msg);
const fusion=read('src/allModesTruthFusionR151.ts');
const swarm=read('src/allModesSwarmPartitionR151.ts');
const operation=read('src/unifiedOperationFabricR140.ts');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const allModes=read('src/allModesAuthority.ts');
const sourceModes=read('src/sourceBackedModeRuntimeR21.ts');
const transition=read('src/transitionAuthorityR23.ts');

must(fusion.includes("R151_SCHEMA='OMEGA_ALL_MODES_TRUTH_FUSION_R151'"),'schema missing');
must(fusion.includes('R151_CHANNEL_COUNT=179+CANON_AUTHORITY_COUNT'),'179 + 62 channel composition missing');
for(const law of ['ONE_CANONICAL_PACKET_MANY_MODE_READINGS','SOURCE_EXECUTION_AND_CANON_LENSES_REMAIN_DISTINCT_PROVENANCE_CLASSES','GATED_MODES_CONTRIBUTE_GAP_PRESSURE_NOT_EXECUTED_TRUTH','CATALOG_LENSES_INFORM_DISAGREEMENT_BUT_CANNOT_OUTVOTE_SOURCE_EXECUTION','MODE_AGREEMENT_IS_NOT_INDEPENDENT_EMPIRICAL_REPLICATION','FUSION_RECOMMENDATION_NEVER_OVERRIDES_CANONICAL_DISPATCH','REPRESENTATION_DIMENSIONS_ARE_ATLAS_RESOLUTION_NOT_PHYSICAL_DIMENSIONS','R125_REMAINS_THE_CANONSTATE_ADMISSION_AUTHORITY'])must(fusion.includes(`'${law}'`),`law missing ${law}`);
for(const token of ['SOURCE_EXECUTED_EXACT','SOURCE_PACKET','DERIVED_RUNTIME','GATED_MISSING_INPUTS','CATALOG_LENS','CANON_AUTHORITY_LENS'])must(fusion.includes(token),`provenance class missing ${token}`);
must(fusion.includes("GATED_MISSING_INPUTS:0"),'gated modes must have zero executed-truth weight');
must(fusion.includes('CANON_AUTHORITY_LENS:.34')&&fusion.includes('CATALOG_LENS:.26'),'advisory lens weights must remain bounded below source execution');
must(fusion.includes('compileAllModesTruthFusionR151')&&fusion.includes('scanCanonicalModeAtlasR151'),'current-state fusion and full atlas scan both required');
must(fusion.includes('fullAtlasModeStateEvaluations:STATE_COUNT*R151_CHANNEL_COUNT'),'full 20,736 × 241 census accounting missing');
must(fusion.includes('advisoryOperator')&&fusion.includes('canonicalOperator')&&fusion.includes("authority:'ADVISORY_ONLY_CANONICAL_DISPATCH_UNCHANGED'"),'fusion may not replace canonical dispatch');
must(fusion.includes('Correlated mode agreement is internal coherence, not 241 independent empirical replications'),'independence truth boundary missing');

must(swarm.includes('seed:1,organs:12,branches:144,cells:1728,lanes:20736'),'swarm hierarchy must exactly preserve 1→12→144→1728→20736');
must(swarm.includes('statesPerCell:12')&&swarm.includes('readingsPerCell:12*R151_CHANNEL_COUNT'),'each logical cell must own exactly 12 layer states and 2,892 mode readings');
for(const law of ['ONE_CELL_EQUALS_ONE_DOMAIN_PHASE_REGULATION_WITH_ALL_12_LAYERS','ALL_20736_CANONICAL_STATES_OCCUR_EXACTLY_ONCE','CELL_RESULTS_RECONVERGE_1728_TO_144_TO_12_TO_1','SWARM_PARTITION_IS_EXECUTION_PLANNING_NOT_INVOCATION_PROOF','CELL_CONSENSUS_IS_NOT_INDEPENDENT_EMPIRICAL_REPLICATION'])must(swarm.includes(`'${law}'`),`swarm law missing ${law}`);
must(swarm.includes('compileAllModesSwarmCellPlanR151')&&swarm.includes('compileAllModesSwarmPlanR151')&&swarm.includes('evaluateAllModesSwarmCellR151')&&swarm.includes('foldAllModesSwarmR151'),'swarm plan/evaluate/reconverge functions missing');
must(swarm.includes('encodeAddress(c.domain,c.phase,c.regulation,layer)'),'cell shard must use exact canonical D/P/R/L addressing');
must(swarm.includes("authority:'EXECUTION_PLAN_ONLY'"),'swarm partition must not claim invocation');
must(swarm.includes('It does not prove 1,728 physical clouds, agents or executions are online.'),'logical-vs-physical swarm truth boundary missing');

must(operation.includes("import {compileAllModesTruthFusionR151}"),'R140 must consume R151 fusion');
must(operation.includes("'ALL_MODE_FUSION_INFORMS_PRIORITY_WITHOUT_TRUTH_PROMOTION'"),'R140 fusion law missing');
for(const legacy of ['.24*route','.16*continuity','.12*plasticity','.16*evidence','.12*contradictionBound','.08*burdenBound','.06*modeCoverage','.06*kind'])must(operation.includes(legacy),`legacy R140 bounded signal lost ${legacy}`);
must(operation.includes('.90*baseScore+.06*modeTruth+.04*modeAgreement'),'R151 must refine rather than replace the admitted R140 score');
must(operation.includes("canonicalAdmissionAuthority:'R125'"),'R125 admission authority regressed');

must(field.includes("data-all-modes-fusion='R151'")&&field.includes('data-all-modes-channel-count'),'operator surface must expose R151 fusion identity');
must(field.includes('allModesFusion:fusion?{truthConfidence:fusion.truthConfidence,agreement:fusion.agreement,truthClass:fusion.truthClass,fingerprint:fusion.fingerprint}:null'),'durable run context must carry compact fusion lineage');
must(field.includes('MODE CONSENSUS ≠ EMPIRICAL TRUTH · PROJECTION ≠ ADMISSION'),'operator-visible truth boundary missing');

must(allModes.includes('canonAuthorities:62')&&allModes.includes('They do not create missing observations or establish new physical law'),'62-lens authority boundary regressed');
must(sourceModes.includes('catalogCount:179')&&sourceModes.includes('Only operators whose required inputs are present in the canonical packet are executed'),'179 source-mode execution boundary regressed');
must(transition.includes("const ORDER=['CARRY','CONSTRUCT','PRUNE','TURN','ESCALATE']"),'canonical Dewey dispatch order must remain external to R151 advisory fusion');
must(transition.includes('SOURCE_TRANSITION_VERIFIED'),'source transition proof authority regressed');

console.log('R151 ALL-MODES TRUTH FUSION INVARIANTS PASS · 179 source + 62 canon channels · exact 1728-cell/20736-lane partition · R140 priority refined · canonical dispatch and R125 admission preserved');
