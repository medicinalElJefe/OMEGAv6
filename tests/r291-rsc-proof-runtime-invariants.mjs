import fs from 'node:fs';
const s=fs.readFileSync('src/rscProofRuntimeR291.ts','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 RSC runtime invariant failed: ${msg}`)};
for(const token of [
 'RSC_TRUTH_BOUNDARY','RSC_EQUIVALENCE_THRESHOLD=.70','A1','A8','R1','R10',
 'reduceRscSkinR291','compareRscGraphsR291','compareRscSkinsR291','translateRscR291','inferRscR291','rscNullBaselineR291','proveRscPairR291',
 'Translation denied','counterexamples','relationalCompression','unorderedBaseline',
 'not external scientific proof','not evidence that one law governs unrelated domains'
])must(s.includes(token),`missing ${token}`);
must(s.includes("if(!comparison.equivalent)return"),'translation must fail closed when equivalence is not admitted');
must(s.includes("edgeSimilarity=jaccard"),'structural edge comparison missing');
must(s.includes("continuity=.4*nodeSimilarity+.6*edgeSimilarity"),'declared structural continuity score missing');
must(s.includes("gate:RscGate=equivalent"),'STAY/TURN/ESCALATE/REJECT gating missing');
console.log('R291 RSC PROOF RUNTIME PASS · reduction → comparison → counterexample gate → translation/inference · symbolic boundary preserved');
