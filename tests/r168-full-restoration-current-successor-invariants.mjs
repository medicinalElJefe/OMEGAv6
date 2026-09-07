import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const panel=read('src/FullRestorationConvergenceR168.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const potential=read('src/buildPotentialRuntimeR133.ts');
const potentialUi=read('src/OmegaBuildPotentialR133.tsx');
const completion=read('src/completionRuntimeR48.ts');
const r166=read('src/world/developmentResidualWorldLensR166.js');
const r169=read('src/world/federationAttestationWorldLensR169.js');
const atlas=read('src/systemAtlasRuntime.ts');
const systemUi=read('src/SystemAtlasControl.tsx');
const must=(ok,msg)=>assert.ok(ok,`R168 restoration convergence: ${msg}`);

must(completion.includes("R48_COMPLETION_SUMMARY")&&completion.includes("restorationDebt")&&completion.includes("executable")&&completion.includes("gated"),'current successor completion summary missing');
must(completion.includes("S10:{successor:'SOURCE_ACTIVE'")&&completion.includes("S12:{successor:'LOCAL_ACTIVE'")&&completion.includes("S16:{successor:'LOCAL_ACTIVE'")&&completion.includes("S18:{successor:'LOCAL_ACTIVE'")&&completion.includes("S21:{successor:'LOCAL_ACTIVE'"),'bounded restored successor families missing from current completion ledger');
must(completion.includes("S22:{successor:'LOCAL_ACTIVE'")&&completion.includes('actual Windows installation/service execution')&&completion.includes('DEVICE_PROOF_REQUIRED'),'S22 local packaging successor must retain host execution proof boundary');

must(potential.includes("import {R48_COMPLETION_FAMILIES}")&&potential.includes('effectiveStatus=(current?.successor||family.status)'),'Build Potential must derive current execution from the same R48/R153 successor ledger');
must(potential.includes('historicalStatusCounts')&&potential.includes('effectiveStatusCounts'),'Build Potential must retain historical and current status axes separately');
must(potential.includes("const primaryRoute=(surface:string,fallback:string)=>String(surface||fallback||'System Atlas').split('/')[0].trim()"),'composite successor surfaces must normalize to a registered primary route');
must(potentialUi.includes('CURRENT SUCCESSOR EXECUTION · R48/R153/R168')&&potentialUi.includes('HISTORICAL V24 STATUS · PRESERVED LINEAGE'),'operator must see current execution separately from predecessor lineage');
must(potentialUi.includes('row.effectiveRoute'),'Build Potential must navigate through a normalized current successor route rather than a stale predecessor or composite display label');

must(suite.includes("import FullRestorationConvergenceR168 from './FullRestorationConvergenceR168'"),'Convergence must import the restoration surface');
must(suite.includes('<FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/>'),'Convergence must visibly mount the restoration surface');
must(panel.includes('R48_COMPLETION_FAMILIES')&&panel.includes('R48_COMPLETION_SUMMARY'),'restoration surface must use the current successor ledger');
must(panel.includes('assembleDevelopmentResidualWorldLensR166')&&panel.includes('/omega-r125-accuracy-state.json')&&panel.includes('/api/core-health')&&panel.includes('/api/release-evidence')&&panel.includes('/api/runtime-attestation')&&panel.includes('/api/hybrid/status'),'R166 residual world must be bound to current runtime evidence');
must(panel.includes("import {manifestR169} from './world/federationAttestationWorldLensR169.js'")&&panel.includes('/omega-genesis-attestation-r168.json'),'R169 federation world-scar lineage and attestation expectation must be visible in restoration convergence');
must(panel.includes('R169 FEDERATION ATTESTATION → R136/R134 WORLD SCAR')&&panel.includes('attestation evidence ≠ execution ≠ promotion'),'R169 operator truth boundary must remain explicit');
must(panel.includes('MASTER_MENUS.map')&&panel.includes('12 MASTER OPERATIONAL INTENTS'),'12 master operational intents must remain directly operable');
must(panel.includes('partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition'),'Woven Continuity operator must remain explicit');
must(panel.includes('12 → 144 → 1,728 → 20,736 → 248,832'),'atlas/scheduling resolution hierarchy must remain explicit');
for(const law of ['RESIDUAL_VISUALIZATION_IS_NOT_REPAIR_AUTHORIZATION','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])must(r166.includes(law),`R166 truth boundary missing ${law}`);
for(const law of ['FEDERATION_ATTESTATION_IS_EVIDENCE_NOT_EXECUTION','LIVE_VERIFIED_IS_NOT_CANONSTATE_PROMOTION','R136_REMAINS_VISUAL_WORLD_FRAME_AUTHORITY','R134_REMAINS_CANONICAL_WORLD_SCAR_CONTINUITY_AUTHORITY','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])must(r169.includes(law),`R169 truth boundary missing ${law}`);

must(systemUi.includes('No fake OPEN button'),'System Atlas compatibility/truth boundary must explicitly prohibit fake Open actions');
must(systemUi.includes("currentExecutable=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'])"),'System Atlas Open action must stay limited to current executable successor states');
const menuCount=[...atlas.matchAll(/\['\d\d','[^']+','[^']+','[^']+'\]/g)].length;
must(menuCount===12,`expected 12 master menus, found ${menuCount}`);
console.log('R168 FULL RESTORATION CURRENT-SUCCESSOR PASS · one R48/R153 execution ledger · Build Potential normalized routing · R166 residual world + R169 federation world scar operator-visible · 12 intents direct · no fake Open · R125/device/scientific boundaries preserved');
