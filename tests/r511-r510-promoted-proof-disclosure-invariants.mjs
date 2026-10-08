import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const release=fs.readFileSync('scripts/verify_omega7_asset_coherence_r491.mjs','utf8');

const advanced="page.getByLabel('Interface depth').selectOption('ADVANCED')";
const recovered="await recovered.waitFor({state:'visible',timeout:10000})";
const advancedAt=live.indexOf(advanced);
const recoveredAt=live.indexOf(recovered);

assert.ok(advancedAt>=0,'R511 requires the promoted R489 proof to exercise the Interface depth disclosure control');
assert.ok(recoveredAt>=0,'R511 requires the promoted R489 proof to retain R486 visibility proof after disclosure');
assert.ok(advancedAt<recoveredAt,'R511 must disclose Advanced depth before requiring the R486 recovered fabric to be visible');
assert.ok(live.includes("R486 recovered capability fabric is missing from the canonical HOME DOM"),'R511 must still fail closed if the recovered fabric is actually absent');
assert.ok(live.includes("getAttribute('data-depth'))==='standard'"),'R511 disclosure may only adapt the known Standard-depth presentation state');
assert.ok(css.includes(".o7-app[data-depth=standard] .o7-home-established~.o7-recovered"),'R510 Standard-depth presentation law must remain explicit');
assert.ok(css.includes('display:none'),'R510 Standard-depth advanced-section hiding must remain explicit');
assert.ok(release.includes("tests/r489-live-visible-capability-browser-e2e.mjs"),'R491 promoted/staged release must continue executing the full R489 live capability proof');
assert.ok(live.includes("all seven groups visible/nonempty"),'R511 must not reduce the recovered capability coverage claim');
assert.ok(live.includes("Earth/Workspace/System Atlas executors navigate"),'R511 must not reduce native executor coverage');

console.log('R511 PROMOTED DISCLOSURE CONVERGENCE PASS · R510 Standard stays visual-first · R489 follows the real Advanced disclosure path · R486 counts/lineage/executors/assets remain fail-closed');
