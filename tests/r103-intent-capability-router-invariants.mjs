import fs from 'node:fs';
import {planIntentR103,classifyIntentR103} from '../src/federation/federationIntentRouterR103.js';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R103 '+msg)};
const worker=read('src/workerR102.js'),worker111=fs.existsSync('src/workerR111.js')?read('src/workerR111.js'):'',ui=read('src/FederationRunR97.tsx'),css=read('src/federationRunR97.css'),vite=read('vite.config.ts'),wrangler=read('wrangler.jsonc'),router=read('src/federation/federationIntentRouterR103.js');
const healthy={nodes:{genesis:{state:'LIVE'},optical:{state:'LIVE'},sovereign:{state:'PC_ONLINE'},omegaV6:{state:'LIVE'}}};
const gated={nodes:{genesis:{state:'LIVE'},optical:{state:'ACCESS_GATED'},sovereign:{state:'PAIRING_REQUIRED'},omegaV6:{state:'LIVE'}}};

const proof=planIntentR103('inspect the current proof lineage and receipts',healthy);
must(JSON.stringify(proof.requiredNodes)===JSON.stringify(['omega-v6']),'proof inspection must not invoke unrelated infrastructure');
const optical=planIntentR103('screen this etched optical metasurface at the target wavelength',healthy);
must(JSON.stringify(optical.requiredNodes)===JSON.stringify(['omega-optical','omega-v6']),'optical screening should use Optical + admission only');
must(optical.optionalNodes.includes('omega-genesis')&&optical.optionalNodes.includes('omega-sovereign'),'non-required proposal/full-wave stages should remain optional');
const full=planIntentR103('generate alternative etched-light candidates and validate the strongest design with RCWA',healthy);
must(JSON.stringify(full.requiredNodes)===JSON.stringify(['omega-genesis','omega-optical','omega-sovereign','omega-v6']),'full optical discovery/validation must preserve the complete four-role handoff');
must(full.path==='PROPOSE → SCREEN → SOLVE → ADMIT','full federation path ordering changed');
const machine=planIntentR103('repair the software on my PC, build it and test it locally',healthy);
must(JSON.stringify(machine.requiredNodes)===JSON.stringify(['omega-sovereign','omega-v6']),'native software execution should route directly to Sovereign + OMEGAv6');
const forecast=planIntentR103('forecast the next state from the admitted evidence',healthy);
must(JSON.stringify(forecast.requiredNodes)===JSON.stringify(['omega-v6']),'canonical forecast should not force Genesis/Optical/Sovereign federation work');
const blocked=planIntentR103('generate etched-light candidates and validate with full-wave RCWA',gated);
must(blocked.gate==='omega-optical','first unavailable required stage must be the visible gate');
must(blocked.nextAction.includes('authorized machine access to Optical'),'Optical access-gate recovery guidance missing');
must(classifyIntentR103('FDTD electromagnetic validation').fullWave===true,'full-wave classifier missing FDTD');
must(!router.includes('Math.random'),'intent routing may not depend on random/fake state');

must(worker.includes("path==='/api/federation/route-intent'")&&worker.includes('planIntentR103')&&worker.includes("'x-omega-intent-router-revision':'R103'"),'stable production worker must expose the R103 task-first API with a revision receipt');
must(worker.includes("schema:'OMEGA_FEDERATION_RUN_STATUS_R97'")&&worker.includes("federationRevision:'R102'"),'R103 routing must remain additive and preserve the stable federation status contract');
const r102Direct=wrangler.includes('"main": "src/workerR102.js"');
const r111PreservesR103=wrangler.includes('"main": "src/workerR111.js"')&&worker111.includes("from './workerR102.js'");
must(r102Direct||r111PreservesR103,'R103 task-first routing must remain active directly through R102 or through an additive R111 successor');
must(ui.includes('/api/federation/route-intent')&&ui.includes('WHAT DO YOU WANT OMEGA TO DO?')&&ui.includes('MINIMAL USEFUL PATH'),'Federation Instrument must expose outcome-first routing');
must(ui.includes('Optional nodes remain optional')&&ui.includes('does not force unused stages into every task'),'UI must explicitly preserve minimal routing instead of infrastructure-first behavior');
must(css.includes('.r103-intent-router')&&css.includes('.r103-route-steps')&&css.includes('@media(max-width:760px)'),'task router must retain responsive containment');
must(vite.includes('manualChunks:vendorChunkR109')&&vite.includes("partition:'R109_ROUTE_DEFERRED_SPECIALISTS'"),'R109 must supersede cache-only application grouping with route-deferred specialist packaging while retaining vendor partitions');
must(vite.includes('dynamic imports to defer heavy specialist UI modules')&&vite.includes('Prefetch means module bytes are prepared'),'performance truth boundary must distinguish module-byte prefetch from capability execution');

console.log('R103/R111 TASK-FIRST ROUTER PASS · minimal capability graph · optional-stage preservation · truthful live gate · stable R102 contract preserved through additive R111 mesh · responsive intent surface · route-deferred specialist successor');
