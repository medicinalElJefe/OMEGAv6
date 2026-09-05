import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R107 '+msg)};

const registry=read('src/omegaExperienceRegistryR82.ts');
const layers=read('src/surfaceLayerContractR104.ts');
const fabric=read('src/modeExecutionFabricR107.ts');
const visual=read('src/calculusVisualLawR37.ts');
const surface=read('src/SurfaceIntegrityR81.tsx');
const fabricUi=read('src/FullCalculusFabricR107.tsx');
const fabricCss=read('src/fullCalculusFabricR107.css');
const sourceCorrelation=read('src/sourceCorpusCorrelationR107.ts');
const sourceRuntime=read('src/sourceBackedModeRuntimeR21.ts');
const canon=read('src/allModesAuthority.ts');
const modes=read('src/modeExpressionRuntimeR82.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');

// Route inventory remains complete but its number is no longer architecture.
must(registry.includes("authority:'INVENTORY_TELEMETRY_NOT_ARCHITECTURE'")&&registry.includes('historicalR82Baseline:44'),'historical route baseline must be retained only as telemetry');
must(!registry.includes('routes.length===44')&&!registry.includes('unique.size===44'),'experience-registry pass must not freeze current route count');
must(registry.includes('routes.length>0')&&registry.includes('unique.size===routes.length')&&registry.includes('emptyWorkspaces.length===0'),'dynamic route reachability/uniqueness audit missing');
must(layers.includes("import {OMEGA_ALL_ROUTES_R82} from './omegaExperienceRegistryR82'")&&layers.includes('missingBindings')&&layers.includes('orphanBindings'),'layer coverage must follow dynamic registered destination inventory');
must(!layers.includes('pass:names.length===44'),'layer correctness may not depend on a frozen destination count');
must(nav.includes('OMEGA_ROUTE_INVENTORY_R107')&&nav.includes('routeCount=OMEGA_ROUTE_INVENTORY_R107.currentCount'),'navigator must display dynamic inventory count');
must(!nav.includes('<b>44</b>')&&!nav.includes('Search all 44 OMEGA applications'),'navigator may not present historical count as current architecture copy');

// Complete mode/canon authority remains globally available without false execution.
must(sourceRuntime.includes('catalogCount:179'),'179-source-mode authority must remain declared');
for(const id of ['M001','M002','M004','M005','M006','M007','M008','M009'])must(sourceRuntime.includes(`'${id}'`),'source-backed executable mode lost '+id);
for(const id of ['M015','M016','M017','M018','M019','M020'])must(sourceRuntime.includes(`gated('${id}'`),'missing-input gate lost '+id);
must(canon.includes('CANON_AUTHORITY_STACK')&&canon.includes('CANON_AUTHORITY_COUNT')&&canon.includes('canonAuthorities:62'),'62 canon/calculus lenses must remain separate from source-mode rows');
for(const family of ['COHERENCE','FORECAST','PRUNE','RELATIVITY','FLOW','MEMORY','PROOF','TOPOLOGY','COMPRESSION','TRAVERSAL','RECURSION','GOVERNANCE','SCALE','LIGHT','GENERIC'])must(modes.includes(`'${family}'`),'mode-expression family lost '+family);

// R107 composition: all available, contextually applicable, executable truth only.
must(fabric.includes('evaluateCorpusModes(record)')&&fabric.includes('sourceBackedModeSummary(record)')&&fabric.includes('evaluateCanonAuthorityStack(record)'),'full mode fabric must bind catalog + executable runtime + canon lenses');
must(fabric.includes("if(!row||row.state==='GATED_MISSING_INPUTS')return 0")&&fabric.includes("if(!row)return'CATALOG_ONLY'"),'gated/catalog-only source modes must contribute zero');
must(fabric.includes("weight=applicable?cl(row.activation*.35):0"),'derived canon lenses must remain bounded secondary influence');
must(fabric.includes('FAMILY_LAYERS')&&fabric.includes('surfaceLayerBindingR104(surface)'),'mode applicability must correlate with the eight functional layers');
must(fabric.includes("schema:'OMEGA_FULL_MODE_CAPABILITY_FABRIC_R107'")&&fabric.includes('topContributors:contributing.slice(0,12)'),'surface contribution trace missing');
must(!fabric.includes('Math.random'),'mode fabric must be deterministic');

// Shared visual law must consume the full fabric while preserving direct exact source influence.
must(visual.includes("import {globalModeInfluenceR107} from './modeExecutionFabricR107'")&&visual.includes('full=globalModeInfluenceR107(record)'),'shared visual law must consume global mode fabric');
for(const direct of ['M001','M002','M004','M005','M006','M007','M008','M009'])must(visual.includes(`executableModeValue(record,'${direct}')`),'direct source-backed visual authority lost '+direct);
for(const channel of ['fm.COHERENCE','fm.RECURSION','fm.FORECAST','fm.PRUNE','fm.SCALE','fm.COMPRESSION','fm.MEMORY','fm.PROOF','fm.GOVERNANCE','fm.TRAVERSAL','fm.FLOW','fm.LIGHT','fm.TOPOLOGY','fm.RELATIVITY'])must(visual.includes(channel),'full-mode visual channel missing '+channel);
must(visual.includes('catalog-only affinity')&&visual.includes('gated formulas contribute zero'),'visual truth boundary must reject metadata/gated execution');

// Every routed surface exposes the same calculus truth fabric without overlaying its primary stage.
must(surface.includes("import FullCalculusFabricR107 from './FullCalculusFabricR107'")&&surface.includes('<FullCalculusFabricR107 surface={panel} record={record}/>'),'full calculus fabric must be mounted by global surface integrity wrapper');
must(surface.includes("data-calculus-fabric='R107'")&&surface.includes("data-layer-contract='R104/R107'"),'surface DOM must expose combined layer/calculus contract');
must(fabricUi.includes("<details className='r107-calculus-fabric'")&&fabricUi.includes('FULL CALCULUS FABRIC'),'fabric inspector must use progressive disclosure');
must(fabricUi.includes('Highest lawful contributors for this surface')&&fabricUi.includes('applicable formulas remain gated'),'operator must be able to inspect contributors and gates');
must(fabricUi.includes('Drive corpus + cloud correlation')&&fabricUi.includes('SOURCE_CORPUS_AUTHORITIES_R107'),'source/corpus/cloud correlation must be visible inside the global calculus inspector');
must(fabricCss.includes('.r107-calculus-fabric')&&!fabricCss.includes('position:fixed')&&!fabricCss.includes('position:absolute'),'calculus fabric must remain in document flow and not cover visual stages');

// Ultimate source/capability correlation includes 20,736 resident, 248,832 scale expansion and 61,917,364,224 virtual address capacity without physical-dimension overclaim.
must(sourceCorrelation.includes("schema:'OMEGA_ULTIMATE_DEVELOPMENT_FABRIC_R107'")&&sourceCorrelation.includes("id:'DEWEY_248832_SCALE_ATLAS'"),'source/capability correlation authority missing');
must(sourceCorrelation.includes('resident:20736')&&sourceCorrelation.includes('expanded:248832')&&sourceCorrelation.includes('virtualAddressCapacity:61917364224')&&sourceCorrelation.includes('physicalDimensionClaim:false'),'scale-address hierarchy must remain computational/representational');
must(sourceCorrelation.includes("correlationOrder:['SOURCE','STATE','CALCULUS','MODES','LAYERS','CAPABILITY','RUNTIME','OBSERVATION','ACTION','PROOF','ADMISSION']"),'ultimate development correlation order missing');

// Persist architecture correction as product law.
for(const rule of ['FULL_CALCULUS_MODE_FABRIC','SOURCE_CORPUS_CORRELATION','EMPIRICAL_VALIDATION_REQUIRED','ROUTE_COUNT_TELEMETRY_ONLY','CONTROL_ACTION_TRUTH'])must(accepted.includes("id:'"+rule+"'"),'accepted production contract missing '+rule);
must(accepted.includes("'R107 full calculus/mode execution fabric + dynamic capability inventory authority'")&&accepted.includes("'R107 Drive corpus + cloud/validation correlation authority'"),'R107 preservation lineage missing');
for(const prior of ['R100 woven continuity geometry/time','R101 weave-derived effective resolution','R102 four-node capability fabric','R103 task-first capability router','R104 eight-layer functional correlation','R105 live-data freshness','R106 temporal proof-ledger separation'])must(accepted.includes(prior),'prior accepted layer lost: '+prior);

console.log('R107 FULL CALCULUS CAPABILITY FABRIC PASS · route count demoted to telemetry · 179 catalog + source-backed runtime + 62 lenses globally composed · 8-layer applicability · Drive/cloud/248832 correlation · global visual law wired · per-surface contribution trace');
await import('./r107-control-action-truth-invariants.mjs');
