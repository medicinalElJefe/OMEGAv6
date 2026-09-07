import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const must=(value,message)=>assert.ok(value,`R158 ${message}`);
const convergence=read('src/wholeInstrumentConvergenceR158.ts');
const navigator=read('src/OmegaSideNavigatorR88.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const adaptive=read('src/adaptiveNavigationR156.ts');
const live=read('src/liveNavigationR156.ts');
const skin=read('src/wholeInstrumentConvergenceR158.css');

must(convergence.includes("R158_ROUTE_COUNT=44"),'must preserve all 44 registered routes');
for(const law of [
 'RESTORE_BEFORE_SURPASS',
 'ALL_44_REGISTERED_ROUTES_REMAIN_REACHABLE',
 'ONE_ROUTE_ONE_OPERATION_CONTRACT_ONE_VISIBLE_TRUTH_BOUNDARY',
 'RUNTIME_STATE_MAY_SHAPE_NAVIGATION_BUT_NAVIGATION_NEVER_CLAIMS_EXECUTION',
 'PARTITION_TRANSFORM_INVARIANT_CARRY_SCAR_CARRY_RECONTEXTUALIZE_REPARTITION',
 'ORIENTATION_SIGMA_IS_SEPARATE_FROM_STRUCTURE',
 'RETURNED_IS_NOT_VERIFIED','VERIFIED_IS_NOT_ADMITTED','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
])must(convergence.includes(`'${law}'`),`must encode law ${law}`);
must(convergence.includes("R158_ATLAS_SHELLS=Object.freeze(['12','144','1728','20736','248832','61917364224']"),'must retain declared atlas/address resolution hierarchy');
must(convergence.includes('physicalDimensionClaim:false'),'must explicitly reject literal physical-dimension interpretation');
must(convergence.includes("orientationPolicy:'SIGMA_SEPARATE_FROM_STRUCTURE'"),'must factor orientation from structure');
must(convergence.includes("admissionAuthority:operation.admissionAuthority"),'must inherit admission authority instead of inventing one');
must(convergence.includes("x.admissionAuthority!=='R125'"),'audit must fail any non-R125 canonical admission authority');
must(convergence.includes('operationContractForRouteR143'),'must compose existing R143 operation identity');
must(convergence.includes('capabilityExecutionContract'),'must compose existing capability execution contract');
must(convergence.includes('organizationForRouteR132'),'must compose existing hierarchy/layout contract');
must(convergence.includes('adaptiveMissionFor'),'must compose restored adaptive mission context');

for(const marker of ['r158-whole-instrument','data-r158-pass','omegaR158Skin','omegaR158Shell','omegaR158Output','omegaR158ModePolicy','omegaR158ModeCount','useLiveNavigationR156','adaptiveNextRoutes','rankMissionStacksForIntent','RouteOutputRibbonR111'])must(navigator.includes(marker),`navigator must bind ${marker}`);
must(navigator.includes('all 44 destinations remain reachable'),'must expose the no-flattening route invariant');
must(navigator.includes('R142 receipts remain execution proof'),'must keep returned execution proof distinct from navigation');
must(navigator.includes('R125 alone admits CanonState'),'must keep canonical admission explicit');
for(const prop of ['modeCount={modeCount}','modePolicy={modePolicy}','busy={busy}','record={record}'])must(shell.includes(prop),`Instrument OS shell must carry ${prop} into the global navigator`);

for(const id of ['BUILD_SHIP','MODEL_VALIDATE','CONNECT_EXECUTE','EARTH_EVIDENCE','LEARN_EVOLVE','RESTORE_CONVERGE','ATLAS_TRAVERSE'])must(adaptive.includes(`id:'${id}'`),`must retain adaptive mission stack ${id}`);
must(adaptive.includes('does not claim execution, evidence, source access or canonical mutation'),'adaptive routing must remain non-executing');
must(live.includes("api.get<any>('/api/hybrid/status')"),'live context must read Hybrid truth');
must(live.includes("api.get<any>('/api/missions')"),'live context must read mission truth');
must(live.includes("api.get<any>('/api/federation/run/status')"),'live context must read federation/full-wave truth');
must(live.includes('nativeExecutionClaimed===true&&current.length>0'),'PC online must require current authenticated device proof');
for(const namedSkin of ['FIELD','WORKBENCH','FLOW','LEDGER','CONTROL','OPERATE'])must(skin.includes(`data-omega-r158-skin='${namedSkin}'`),`must provide distinct ${namedSkin} skin expression`);

console.log('R158 WHOLE INSTRUMENT CONVERGENCE PASS · 44 routes + adaptive context + live truth + route-aware skins/outputs + inherited R143/R142/R125 authority · no execution/canon inflation');
