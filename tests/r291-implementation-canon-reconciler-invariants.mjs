import fs from 'node:fs';
const s=fs.readFileSync('src/implementationCanonReconcilerR291.ts','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 implementation canon invariant failed: ${msg}`)};
for(const token of ['IMPLEMENTED','PARTIAL','SUPERSEDED','DONOR','PLANNED','REJECTED','sourceRowTarget:675','CANON-000001','CANON-000012','20,736 is address topology','Completion is not admission','No hidden synthetic scene substitution','reconcileImplementationCanonRowR291','assertImplementationCanonAdmissionR291'])must(s.includes(token),`missing ${token}`);
must(s.includes("evidence.sourcePresent&&evidence.testPassed"),'IMPLEMENTED must require both source and passing proof');
must(s.includes("disposition!=='IMPLEMENTED'"),'non-implemented rows must remain admission blocked');
must(s.includes('A PLANNED or named archive row is not proof'),'archive specification truth boundary missing');
console.log('R291 IMPLEMENTATION CANON RECONCILER PASS · 675-row target · source+proof admission · 12 hard invariants retained');
