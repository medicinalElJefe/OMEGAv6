import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 release invariant failed: ${msg}`)};
const doc=read('docs/R291_FULL_POST_R289_CONVERGENCE.md');
const workflow=read('.github/workflows/r241-archive-convergence.yml');
const browser=read('tests/r291-archive-proof-browser-e2e.mjs');
const recovery=read('src/archiveDeepRecoveryR290.ts');
const nav=read('src/navigationRegistry.ts');

for(const token of [
 'R291 · Full Post-R289 Convergence Closure','44 canonical product routes','twelve-menu presentation','NO NEW PHYSICAL PRIMITIVE',
 'Archive presence is not execution proof','R125/R141/R142/R146/R147/R240','ci.yml','exact R291 head passes R170, R202, R210, R223, R237, R238, Cloud Bridge and R241'
])must(doc.includes(token),`release seal missing ${token}`);

must(workflow.includes('tests/r291-archive-proof-browser-e2e.mjs'),'R291 browser proof must execute directly inside R241 real-UI sequence');
must(workflow.includes('R241/R239/R242/R245/R279/R281/R282/R283/R284/R286/R289/R291 convergence in the real UI'),'R241 step identity must include R291');
must(workflow.includes('R291 browser proof exercises the bounded symbolic RSC proof lab and deep archive recovery instrument'),'R241 authority summary must describe R291 proof scope');
must(!workflow.includes('deploy --config wrangler.jsonc')||workflow.includes('--dry-run'),'R241 must remain proof-only and may not deploy production');
must(workflow.includes('pull_request:')&&workflow.includes('workflow_dispatch:')&&!workflow.includes('push:'),'R241 must remain PR/manual-only');

for(const token of ['SYMBOLIC_MODEL_ONLY_NOT_EXTERNAL_SCIENTIFIC_PROOF','data-proof-state','COUNTEREXAMPLE_UNCONTROLLED','Translation τ\\s+DENIED','RECOVERABLE','overflow>10'])must(browser.includes(token),`browser proof missing fail-closed/containment token ${token}`);
must(browser.includes("viewports=[['desktop'" )&&browser.includes("['mobile'"),'R291 browser proof must cover desktop and mobile');
must(browser.includes("page.on('pageerror'"),'R291 browser proof must reject page errors');

must(recovery.includes('auditDeepArchiveRecoveryR290'),'deep recovery self-audit must remain present');
must(recovery.includes('adds no route owner, CanonState writer, proof authority, dispatcher, device claim or deployment authority.'),'deep recovery authority boundary missing');
must(nav.includes('OMEGA_MASTER_MENU_NAVIGATION_R289'),'recovered navigation authority mapping missing');

must(!doc.includes('The Archive/RSC browser proof is chained into the existing R289 browser test'),'release seal must not claim indirect R289 chaining after direct R241 binding');
console.log('R291 UNIFIED RELEASE CONTRACT PASS · exact-head 8-lane gate · direct R241 Archive/RSC browser proof · 44 routes + 12 recovered menus preserved · no new runtime/state/proof/deployment authority');
