import fs from 'node:fs';
import {deriveSpecialistPrefetchPolicyR110,selectWorkingSetPanelsR110,WORKING_SET_POLICY_TRUTH_R110} from '../src/specialistWorkingSetPolicyR110.js';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R110 '+msg)};
const loader=read('src/specialistLoaderR109.tsx');
const policySource=read('src/specialistWorkingSetPolicyR110.js');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');
const r109=read('tests/r109-route-deferred-specialist-fabric-invariants.mjs');
const pkg=JSON.parse(read('package.json'));

const standard=deriveSpecialistPrefetchPolicyR110({effectiveType:'4g'});
must(standard.mode==='STANDARD'&&standard.budget===2&&standard.reason==='RUNTIME_READY','visible ordinary runtime must use a bounded two-panel speculative budget');
const hidden=deriveSpecialistPrefetchPolicyR110({hidden:true,effectiveType:'4g'});
must(hidden.mode==='SUPPRESSED'&&hidden.budget===0&&hidden.reason==='DOCUMENT_HIDDEN','hidden document must suppress speculative loading');
const save=deriveSpecialistPrefetchPolicyR110({saveData:true,effectiveType:'4g'});
must(save.mode==='SUPPRESSED'&&save.budget===0&&save.reason==='SAVE_DATA','Save-Data must suppress speculative loading');
for(const type of ['2g','slow-2g']){const p=deriveSpecialistPrefetchPolicyR110({effectiveType:type});must(p.mode==='SUPPRESSED'&&p.budget===0&&p.reason==='CONSTRAINED_NETWORK',`${type} must suppress speculative loading`)}
const low=deriveSpecialistPrefetchPolicyR110({lowPower:true,effectiveType:'4g'});
must(low.mode==='LIMITED'&&low.budget===1&&low.reason==='LOW_POWER','low-power runtime must reduce speculative working set to one panel');
const limited=deriveSpecialistPrefetchPolicyR110({effectiveType:'3g'});
must(limited.mode==='LIMITED'&&limited.budget===1&&limited.reason==='LIMITED_NETWORK','3g runtime must reduce speculative working set to one panel');
must(JSON.stringify(selectWorkingSetPanelsR110(['Earth Now','Forecast','Earth Now','Modes'],2))===JSON.stringify(['Earth Now','Forecast']),'working-set selection must preserve order, deduplicate and honor budget');
must(selectWorkingSetPanelsR110(['Earth Now','Forecast','Modes','Plugins'],99).length===3,'policy core must retain a hard upper bound even if called with an invalid large budget');
must(WORKING_SET_POLICY_TRUTH_R110.maxSpeculativePanels===2&&WORKING_SET_POLICY_TRUTH_R110.deterministic===true,'policy truth contract missing deterministic bounded authority');

must(loader.includes("from './specialistWorkingSetPolicyR110.js'"),'R109 loader registry must consume the deterministic R110 policy core');
must(loader.includes('navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}'),'runtime adapter must inspect browser connection hints without inventing network state');
must(loader.includes("document.visibilityState==='hidden'")&&loader.includes('input.lowPower'),'visibility and low-power runtime conditions must be represented');
must(loader.includes("requestIdleCallback")&&loader.includes('timeout:900')&&loader.includes('setTimeout(resolve,48)'),'speculative loading must yield to active interaction with a deterministic fallback');
must(loader.includes("prefetchSpecialistPanelR109(panel:string,reason='ROUTE_DEMAND')"),'direct route demand must remain a separate unsuppressed load path');
must(loader.includes('prefetchSpecialistPanelsR110')&&loader.includes("reason:'R109_WORKFLOW_COMPAT'"),'existing R109 workflow prefetch must inherit R110 policy without changing workstation routing');
must(loader.includes("authority:'CURRENT_SESSION_MODULE_BYTE_TELEMETRY_ONLY'")&&loader.includes('REQUESTED/LOADED/PARTIAL/FAILED/SUPPRESSED'),'working-set telemetry states and authority boundary missing');
must(loader.includes('They are not capability execution, evidence, solver status, cloud health, native-device proof, or CanonState.'),'working-set telemetry must not overclaim execution or proof');
must(loader.includes('adds no route owner, CanonState, execution bus, proof ledger, or federation authority'),'R110 may not become a second architecture authority');
must(loader.includes("state:'SUPPRESSED'")&&loader.includes('specialistWorkingSetSnapshotR110'),'suppressed and current-session working-set state must remain inspectable');
must(!policySource.includes('fetch(')&&!policySource.includes('/api/')&&!policySource.includes('WebSocket')&&!policySource.includes('localStorage'),'pure working-set policy may not contact backends or persist shadow state');
must(!loader.includes('Math.random')&&!policySource.includes('Math.random'),'working-set policy/loading must remain deterministic');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length>0&&new Set(surfaces).size===surfaces.length,'R110 must preserve the complete non-empty unique registered destination inventory');
must(workstation.includes('function normalizePanel(v:any):Panel')&&workstation.includes('const go=(name:string)=>'),'R110 must preserve one workstation route authority');
must(workstation.includes('prefetchSpecialistPanelsR109([next,...capabilityRoutes])'),'existing workflow/capability continuity hook must remain the R110 integration point');
const r109TopologyReceipt=['R109 ROUTE-DEFERRED SPECIALIST FABRIC PASS','R109/R111 ROUTE-DEFERRED SPECIALIST FABRIC PASS','R109/R112 ROUTE-DEFERRED SPECIALIST FABRIC PASS'].some(token=>r109.includes(token));
must(r109TopologyReceipt,'R109 deferred topology gate must remain intact beneath R110 and any verified additive successor');
for(const rule of ['ROUTE_DEFERRED_SPECIALIST_LOADING','PREFETCH_IS_NOT_EXECUTION','CORE_AUTHORITY_EAGER','ADAPTIVE_WORKING_SET_BUDGET'])must(accepted.includes("id:'"+rule+"'"),'accepted production contract missing '+rule);
must(accepted.includes('R110 runtime-aware working-set budget + current-session module telemetry authority'),'R110 preservation lineage missing');
must(pkg.scripts['test:r110']==='node tests/r110-runtime-aware-working-set-invariants.mjs','R110 release script missing');
must(pkg.scripts['check:static'].includes('npm run test:r109')&&pkg.scripts['check:static'].includes('npm run test:r110'),'full release gate must run R109 then R110');

console.log(`R110/R112 RUNTIME-AWARE WORKING SET PASS · ${surfaces.length} registered destinations preserved dynamically · hidden/Save-Data/2G suppression · low-power/3G budget reduction · direct route demand preserved · current-session module telemetry only · R109 deferred topology retained · one route/state/proof authority retained`);
