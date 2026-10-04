export const R388_CONVERGENCE_BACKLOG_SCHEMA='OMEGA_CONVERGENCE_BACKLOG_R388';

const TARGETS=Object.freeze({
 A:['src/OmegaWorkstationFullV2.tsx','src/systemAtlasRuntime.ts'],
 B:['src/navigationRegistry.ts','src/OmegaWorkstationFullV2.tsx'],
 C:['src/EarthObservatoryR8.tsx','src/EarthGroundTraversalR9.tsx'],
 D:['src/SARTruthInstrumentR280.tsx','src/SARLiveTruthR285.tsx'],
 E:['src/SAISovereignControl.tsx','src/PromptOrchestrator.tsx'],
 F:['src/PromptOrchestrator.tsx','src/HybridRuntimeSnapshotR238.tsx'],
 G:[],
 H:['src/htmlSvgCapabilityRecoveryR301.ts','src/archiveNativeConvergenceR288.ts'],
 I:['src/system/proofGovernedRelationalRuntimeR334.js','src/unifiedCalculus.ts'],
 J:['src/BiologicalTraversalR46.tsx','src/SomaAudioEngine.tsx'],
 K:['src/OmegaWorkstationFullV2.tsx','src/SurfaceIntegrityR81.tsx'],
 L:['src/CalculusTraversal.tsx','src/OmegaInfinityPanel.tsx'],
 M:['src/FederationRunR97.tsx','src/systemAtlasRuntime.ts'],
 N:['src/federation/omegaFederation.ts','src/FederationRunR97.tsx'],
 O:['src/AppliedRealityLab.tsx','src/system/proofGovernedRelationalRuntimeR334.js'],
 P:['src/convergenceMasterR314.ts','src/unifiedCalculus.ts'],
 Q:['src/OmegaTemporalCheckpointR350.tsx','src/system/proofBoundTemporalTraversalR355.ts'],
 R:['src/xlsxLiteR153.ts','src/OmegaDataLexiconR46.tsx'],
 S:['src/sovereignLauncherR117.ts','src/ExtremeRestorationR46.tsx'],
 T:['src/saiB059Runtime.ts','src/PromptOrchestrator.tsx'],
 U:[],
 V:['src/OmegaWorkstationFullV2.tsx','src/htmlSvgCapabilityRuntimeR301.ts'],
 W:['src/sarTruthIndexR283.ts','src/BiologicalTraversalR46.tsx'],
 X:['src/systemAtlasRuntime.ts','src/OmegaHomeR59.tsx'],
 Y:['src/hostBuildLedgerR83.ts','src/softwareMasterLedgerR83.ts'],
});

const ITEM_TARGETS=Object.freeze({
 'A-01':['src/runtimeIdentity.ts','src/operationalCapabilityRuntimeR45.ts'],
 'A-02':['src/capabilityAuthority.ts','src/OmegaViewAuthorityBar.tsx'],
 'A-03':['src/capabilityAuthority.ts','src/operationalCapabilityRuntimeR45.ts'],
 'A-04':[],
 'A-05':['src/buildGovernance.ts','src/OmegaSystemConsolidationR30.tsx'],
});

const PROOFS=Object.freeze({
 A:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 B:['R241 Archive Convergence Visual Intelligence','OMEGA R237 Hybrid Command Authority Proof'],
 C:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
 D:['R202 Operational Source Authority','R241 Archive Convergence Visual Intelligence'],
 E:['R241 Archive Convergence Visual Intelligence','OMEGA R238 Woven Hybrid Continuity Convergence'],
 F:['OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence'],
 H:['R241 Archive Convergence Visual Intelligence','R170 Current Convergence'],
 I:['R170 Current Convergence','R241 Archive Convergence Visual Intelligence'],
 J:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 K:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 L:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 M:['R170 Current Convergence','R241 Archive Convergence Visual Intelligence'],
 N:['R170 Current Convergence','OMEGA Cloud Bridge CI'],
 O:['R170 Current Convergence','R241 Archive Convergence Visual Intelligence'],
 P:['R170 Current Convergence','R241 Archive Convergence Visual Intelligence'],
 Q:['R170 Current Convergence','R202 Operational Source Authority'],
 R:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 S:['OMEGA R237 Hybrid Command Authority Proof','OMEGA Cloud Bridge CI'],
 T:['OMEGA R238 Woven Hybrid Continuity Convergence','R241 Archive Convergence Visual Intelligence'],
 V:['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'],
 W:['R241 Archive Convergence Visual Intelligence','R202 Operational Source Authority'],
 X:['R210 Release Controller','OMEGA Cloud Bridge CI'],
 Y:['R241 Archive Convergence Visual Intelligence','R170 Current Convergence'],
});

const NON_SELF_EDITABLE=new Set(['G','U']);
const EXTERNAL=/\b(live[- ]?verified|physical|provider|external|satellite|cloudflare|worker identity|heartbeat|device|native(?:[- ]?host| execution)?|opengl|gpu|cpu fallback|street imagery|source adapter|deployment receipt|hourly cron|github mutation credential)\b/i;
const clean=v=>String(v??'').trim();

export function parseConvergenceBacklogR388(markdown=''){
 const rows=[];let section=null,index=0;
 for(const raw of String(markdown||'').split(/\r?\n/)){
  const heading=raw.match(/^##\s+([A-Y])\.\s+(.+)$/);
  if(heading){section=heading[1];index=0;continue}
  const item=raw.match(/^- \[ \]\s+(.+)$/);
  if(!item||!section)continue;
  index++;
  const objective=clean(item[1]);
  const itemKey=`${section}-${String(index).padStart(2,'0')}`;
  const affected=[...(Object.prototype.hasOwnProperty.call(ITEM_TARGETS,itemKey)?ITEM_TARGETS[itemKey]:(TARGETS[section]||[]))];
  rows.push(Object.freeze({
   id:`R388-${itemKey}`,
   section,
   index,
   objective,
   affected,
   expectedProofs:[...(PROOFS[section]||['OMEGA Cloud Bridge CI'])],
   selfEditable:!NON_SELF_EDITABLE.has(section)&&affected.length>0,
   externalProofRequired:EXTERNAL.test(objective),
   canonicalAdmission:false,
  }));
 }
 return Object.freeze(rows);
}

export const R388_BACKLOG_CANDIDATE_LIMIT=3;

export function selectNextConvergenceItemR388({markdown='',advancedItemIds=[],heldItemIds=[],candidateLimit=R388_BACKLOG_CANDIDATE_LIMIT}={}){
 const advanced=new Set(Array.isArray(advancedItemIds)?advancedItemIds:[]);
 const recentHeld=new Set(Array.isArray(heldItemIds)?heldItemIds:[]);
 const items=parseConvergenceBacklogR388(markdown);
 const selfEditable=items.filter(x=>x.selfEditable&&!advanced.has(x.id));
 const eligible=selfEditable.filter(x=>!recentHeld.has(x.id));
 const pool=eligible.length?eligible:selfEditable;
 const limit=Math.max(1,Math.min(R388_BACKLOG_CANDIDATE_LIMIT,Number(candidateLimit)||R388_BACKLOG_CANDIDATE_LIMIT));
 const candidates=pool.slice(0,limit);
 const selected=candidates[0]||null;
 const heldGovernance=items.filter(x=>!x.selfEditable&&!advanced.has(x.id)).map(x=>x.id);
 const heldRecentDeclines=selfEditable.filter(x=>recentHeld.has(x.id)).map(x=>x.id);
 return Object.freeze({
  schema:R388_CONVERGENCE_BACKLOG_SCHEMA,
  total:items.length,
  advanced:items.filter(x=>advanced.has(x.id)).length,
  remaining:items.filter(x=>!advanced.has(x.id)).length,
  heldGovernance,
  heldRecentDeclines,
  candidates:Object.freeze(candidates.slice()),
  selected,
  canonicalAdmission:false,
  targetingRevision:'R448',
  boundary:'R448 preserves the R388 convergence authority while binding known backlog items to semantic subsystem owners instead of coarse section-wide files. It may advance allowlisted product source only; governance/self-build/device-only items remain non-self-editable where no honest product-source target exists, recent model-declined items may be temporarily bypassed without being marked advanced, and external/device claims remain pending first-hand proof.',
 });
}
