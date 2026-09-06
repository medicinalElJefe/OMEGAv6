import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditUnifiedCapabilityRuntimeR139,R139_LAWS} from '../src/unifiedCapabilityEngineR139.ts';
import {OMEGA_ALL_ROUTES_R82,validateExperienceRegistryR82} from '../src/omegaExperienceRegistryR82.ts';

const audit=auditUnifiedCapabilityRuntimeR139();
assert.equal(audit.pass,true);
assert.equal(audit.unknownRoutes.length,0);
assert.equal(audit.registeredRoutes,OMEGA_ALL_ROUTES_R82.length);
const menu=validateExperienceRegistryR82();
assert.equal(menu.pass,true);
assert.equal(menu.routeCount,menu.uniqueRouteCount);
for(const law of ['ONE_ROUTE_REGISTRY_ONE_CAPABILITY_RUNTIME','ALL_MODES_MEANS_ALL_MODES_CONSIDERED_NOT_ALL_MODES_FABRICATED','GATED_OR_CATALOG_ONLY_MODES_NEVER_CLAIM_EXECUTION','R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R139_LAWS.includes(law),`missing R139 law ${law}`);

const engine=fs.readFileSync('src/unifiedCapabilityEngineR139.ts','utf8');
const field=fs.readFileSync('src/OmegaCapabilityFieldR138.tsx','utf8');
const registry=fs.readFileSync('src/omegaExperienceRegistryR82.ts','utf8');
const config=fs.readFileSync('wrangler.jsonc','utf8');
assert.ok(engine.includes('compileFullOverallModePlanR79'),'R139 must consume the Full Overall mode planner');
assert.ok(engine.includes("state==='GATED_MISSING_INPUTS'")&&engine.includes("state==='CATALOG_LENS'"),'R139 must separate non-executable mode states');
assert.ok(engine.includes("sai:'SAI Lab'")&&engine.includes("plugins:'Plugins'")&&engine.includes("hybrid:'Hybrid Link'")&&engine.includes("build:'Build Out'")&&engine.includes("proof:'Evidence & Proof'"),'AI/SAI/plugin/Hybrid/build/proof capability domains must remain explicit');
assert.ok(engine.includes('partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition'),'woven continuity operator missing');
assert.ok(field.includes("data-unified-runtime='R139'")&&field.includes('compileUnifiedCapabilityRuntimeR139'),'living capability field must be driven by R139 runtime');
assert.ok(!field.includes('ROUTE_BY_PANEL'),'R138 static route duplication must be removed from active capability field');
assert.ok(registry.includes('OMEGA_ALL_ROUTES_R82'),'one route registry must remain authoritative');

const stripped=config.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const wrangler=JSON.parse(stripped);
const bindings=wrangler.durable_objects?.bindings||[];
const exportsMap=wrangler.exports||{};
assert.equal(bindings.length,7,'all seven already-provisioned Durable Object bindings must remain');
assert.equal(Object.keys(exportsMap).length,7,'all seven Durable Objects need live declarative exports');
for(const b of bindings){assert.ok(exportsMap[b.class_name],`missing declarative export ${b.class_name}`);assert.equal(exportsMap[b.class_name].type,'durable-object');assert.equal(exportsMap[b.class_name].storage,'sqlite');}
assert.equal(wrangler.main,'src/workerR116.js','proven R116 Worker spine must remain canonical entrypoint');

console.log(`R139 UNIFIED CAPABILITY ENGINE PASS · ${audit.intentCount} intents → ${audit.registeredRoutes} registered routes · Full Overall modes truth-separated · 7/7 SQLite Durable Object lifecycle exports · capability-first visual field active`);
