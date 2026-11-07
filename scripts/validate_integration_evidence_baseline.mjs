#!/usr/bin/env node
/** Read-only, deterministic integration evidence inventory validation.
 * This validator proves manifest structure and path existence only.
 * It does NOT prove tests passed, live runtime, native host or physics.
 */
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'audit/integration-evidence-baseline.v1.json');
const ledger=JSON.parse(fs.readFileSync(file,'utf8'));
const errors=[];
function assert(ok,msg){if(!ok)errors.push(msg)}
assert(ledger.schema==='OMEGA_INTEGRATION_EVIDENCE_BASELINE_V1','schema mismatch');
assert(ledger.snapshot?.coverage==='TARGETED_INITIAL_INVENTORY_NOT_COMPLETE_REPOSITORY_SCAN','scan scope misrepresented');
assert(ledger.snapshot?.inspectedMain?.length===40,'missing inspected SHA');
assert(ledger.modeDisclosure?.sourceImplementedContracts<=ledger.modeDisclosure?.catalog,'mode implementation cannot exceed catalog');
assert(ledger.modeDisclosure?.catalog===ledger.modeDisclosure?.sourceImplementedContracts+ledger.modeDisclosure?.remainingCatalogOnly,'mode counts inconsistent');
const seen=new Set();
for(const item of ledger.instruments||[]){
 assert(item.id&&!seen.has(item.id),'missing or duplicate family id '+item.id);
 seen.add(item.id);
 assert(item.production!=='VERIFIED' && item.nativeDevice!=='VERIFIED','unsupported unconditional proof claim '+item.id);
 for(const field of ['ui','engine','state']){
  const rel=item.source?.[field];
  assert(typeof rel==='string'&&rel.length>0,'missing '+field+' for '+item.id);
  if(typeof rel==='string')assert(fs.existsSync(path.join(root,rel)),'source path absent: '+item.id+' '+field+' '+rel);
 }
 const test=item.test?.path;
 assert(typeof test==='string'&&fs.existsSync(path.join(root,test)),'test path absent: '+item.id+' '+test);
 assert(item.test?.status==='REGISTERED_NOT_RUN','unearned test-pass claim '+item.id);
 assert(item.missingEvidence&&item.modelAuthority,'missing evidence/authority: '+item.id);
}
for(const rel of [ledger.familyContract,ledger.modeContract])assert(typeof rel==='string'&&fs.existsSync(path.join(root,rel)),'contract path absent '+rel);

const routePath=path.join(root,'audit/omega7-route-evidence.v1.json');
const routeLedger=JSON.parse(fs.readFileSync(routePath,'utf8'));
const nativeSource=fs.readFileSync(path.join(root,'src7/nativeCapabilityRegistry.tsx'),'utf8');
const familySource=fs.readFileSync(path.join(root,'src7/familyParityR452.ts'),'utf8');
const nativeDeclaration=nativeSource.match(/OMEGA7_NATIVE_ROUTES=Object\\.freeze\\(\\[([\\s\\S]*?)\\] as const/);
assert(Boolean(nativeDeclaration),'native route declaration missing');
const nativeRoutes=nativeDeclaration?[...nativeDeclaration[1].matchAll(/'([^']+)'/g)].map(x=>x[1]):[];
const familyContracts=[...familySource.matchAll(/\\{id:'([^']+)',representativeRoute:'([^']+)',routes:\\[([^\\]]+)\\]/g)].map(m=>({
 id:m[1], representativeRoute:m[2],routes:[...m[3].matchAll(/'([^']+)'/g)].map(x=>x[1])
}));
const expected=new Map();
for(const family of familyContracts)for(const route of family.routes){
 assert(!expected.has(route),'duplicate family-owned route '+route);
 expected.set(route,family.id);
}
const seenRoutes=new Set();
assert(routeLedger.schema==='OMEGA7_ROUTE_EVIDENCE_V1','route evidence schema changed');
assert(routeLedger.routeCount===nativeRoutes.length,'declared route count incorrect');
assert(routeLedger.routes?.length===nativeRoutes.length,'route ledger count differs from registry');
assert(nativeRoutes.length===44,'route count changed; update audited baseline and review');
assert(familyContracts.length===8,'family contract count changed; update audited baseline and review');
for(const route of routeLedger.routes||[]){
 assert(!seenRoutes.has(route.route),'duplicate audited route '+route.route);
 seenRoutes.add(route.route);
 assert(nativeRoutes.includes(route.route),'audited route absent from native registry '+route.route);
 assert(expected.get(route.route)===route.family,'route owner differs from family contract '+route.route);
 assert(typeof route.workspace==='string'&&fs.existsSync(path.join(root,route.workspace)),'workspace module absent '+route.route);
 assert(route.routing==='REGISTERED_SOURCE_NOT_LIVE_EXECUTION_PROOF','unearned route-level live proof '+route.route);
 assert(route.production==='EXACT_ROUTE_LIVE_PROOF_NOT_ESTABLISHED_IN_THIS_AUDIT','unearned production proof '+route.route);
 assert(route.backend==='ROUTE_SPECIFIC_DEPENDENCIES_NOT_FULLY_TRACED','backend dependencies silently marked resolved '+route.route);
}
for(const route of nativeRoutes)assert(seenRoutes.has(route),'native registry route missing from audit '+route);
for(const route of expected.keys())assert(nativeRoutes.includes(route),'family route absent from native registry '+route);
const workspaceImportNames=[...nativeSource.matchAll(/const (\\w+)=lazy\\(\\(\\)=>import\\('([^']+)'\\)\\)/g)]
  .map(m=>path.normalize(path.join(root,'src7',m[2])+'.tsx'));
for(const audited of routeLedger.routes||[]){
 assert(workspaceImportNames.includes(path.join(root,audited.workspace)),'workspace has no lazy import in native registry '+audited.route);
}

if(errors.length){for(const error of errors)console.error('INTEGRATION AUDIT FAIL: '+error);process.exit(1)}
console.log('INTEGRATION AUDIT STRUCTURAL PASS: '+seen.size+' mapped instruments and '+seenRoutes.size+' native routes; path existence and conservative labels only. No runtime or deployment proof claimed.');
