import fs from 'node:fs';
const s=fs.readFileSync('src/archiveGenomeLedgerR288d.ts','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R289 RSC archive invariant failed: ${msg}`)};
for(const token of [
 "id:'AG-026'",'master_relational_skin_calculus_research_environment.xlsx','parent_scar_carry_cross_domain_operator_matrix.xlsx',
 'axiom registry A1-A8','inference engine R1-R10','graph reduction ρ(S)','translation τa→b','structural-equivalence comparator','proof-ledger/counterexample store','cross-domain compression benchmark runner',
 'symbolic/conceptual research framework rather than external scientific proof','Visual or semantic resemblance alone is not structural equivalence'
])must(s.includes(token),`missing ${token}`);
must(s.includes('translation cannot run when equivalence gate fails'),'translation gating missing');
must(s.includes('separate symbolic/model-derived scores from external empirical measurements'),'model-vs-empirical boundary missing');
must(s.includes('not evidence that one physical law governs culture, biology, computation or other domains'),'cross-domain physical overclaim boundary missing');
console.log('R289 RSC ARCHIVE STRATUM PASS · proof VM candidate stays symbolic/model-bounded and counterexample-aware');
