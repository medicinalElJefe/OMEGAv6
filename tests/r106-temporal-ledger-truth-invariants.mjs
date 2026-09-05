import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R106 '+msg)};

const freshness=read('src/dataFreshnessR105.ts');
const spine=read('src/LiveStateSpineR50.tsx');
const chain=read('src/ProofChainSupervisorR54.tsx');
const performance=read('src/ProofPerformanceProviderR55.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');

// One temporal vocabulary must distinguish current runtime/session from persistent evidence history.
for(const authority of ['LIVE_RUNTIME','CANONICAL_DERIVED','CURRENT_SESSION_HISTORY','RETAINED_EVIDENCE_HISTORY','RECOVERED_SOURCE_SNAPSHOT','FORECAST','GATED'])must(freshness.includes(`'${authority}'`),'temporal authority missing '+authority);
must(freshness.includes('retainedRowsR106')&&freshness.includes('temporalAuthorityR106')&&freshness.includes('R106_LEDGER_TRUTH_BOUNDARY'),'retained-ledger temporal helpers missing');

// Live State Spine must keep persistent journals but separate their current-session presentation.
for(const key of ['omega.r50.spine.deltas','omega.r53.delta.mesh.journal','slice(-120)','slice(-188)'])must(spine.includes(key),'bounded continuity journal capability lost: '+key);
must(spine.includes('const sessionDeltas=useMemo(()=>currentSessionRowsR105(deltas)')&&spine.includes('const sessionMesh=useMemo(()=>currentSessionRowsR105(meshJournal)'),'current-session ledger derivation missing');
must(spine.includes('retainedRowsR106(deltas)')&&spine.includes('retainedRowsR106(meshJournal)'),'retained evidence split missing');
must(spine.includes('Self-monitor delta ledger · CURRENT SESSION')&&spine.includes('Self-monitor delta ledger · RETAINED EVIDENCE HISTORY'),'delta current/history labels missing');
must(spine.includes('Checkpoint chain · CURRENT SESSION')&&spine.includes('Checkpoint chain · RETAINED EVIDENCE HISTORY'),'mesh current/history labels missing');
must(spine.includes('No reality-boundary changes observed during this browser session.')&&spine.includes('sessionDeltas.length?'),'empty-session truth must use current-session rows, not retained rows');
must(spine.includes('new Date(d.at).toLocaleString()} · retained evidence')&&spine.includes('new Date(m.at).toLocaleString()} · retained evidence'),'retained rows need full date plus evidence label');
must(spine.includes("schema:'OMEGA_R56_B015_TEMPORAL_PROOF_LEDGER_RECEIPT'")&&spine.includes('retainedEvidence:{meshJournal,deltas'),'download receipt must preserve full retained evidence lineage');

// R54 current verification may span retained evidence, but must not relabel old receipts as current.
must(chain.includes("localState.read<any[]>('omega.r53.delta.mesh.journal',[])")&&chain.includes("api.post<ChainProof>('/api/proof/chain',{segment})"),'R54 full chain verification capability lost');
must(chain.includes('currentSessionRowsR105(segment)')&&chain.includes('retainedRowsR106(segment)'),'R54 chain input classification missing');
must(chain.includes('CHAIN HEALTH · CURRENT CHECK')&&chain.includes('CHAIN INPUT AUTHORITY'),'R54 current-result versus retained-input semantics missing');
must(chain.includes('Verification result is current; the submitted chain may contain retained evidence.'),'R54 retained-evidence truth text missing');

// R55 current-session performance separation from R105 must remain intact.
must(performance.includes('sessionSamples.slice(-30)')&&performance.includes('retained observed history, not current provider state'),'R55 current performance truth regressed');

// Navigation/submenu work remains untouched; current route count is inventory telemetry, not architecture.
must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes("className='r105-workspace-filter'")&&!nav.includes('rows.slice('),'R105 submenu/registered-route authority regressed');

// Persist R106 without losing the earlier accepted architecture.
must(accepted.includes("id:'CURRENT_VS_RETAINED_LEDGER'")&&accepted.includes("'R106 temporal proof-ledger separation + retained evidence continuity authority'"),'R106 production contract missing');
for(const prior of ['R100 woven continuity geometry/time','R101 weave-derived effective resolution','R102 four-node capability fabric','R103 task-first capability router','R104 eight-layer functional correlation','R105 live-data freshness'])must(accepted.includes(prior),'prior accepted layer lost: '+prior);

console.log('R106 TEMPORAL PROOF-LEDGER TRUTH PASS · current runtime/session separated from retained evidence · R50/R53/R54/R55 continuity preserved · contextual registered-destination navigation preserved');
await import('./r107-full-calculus-capability-fabric-invariants.mjs');
