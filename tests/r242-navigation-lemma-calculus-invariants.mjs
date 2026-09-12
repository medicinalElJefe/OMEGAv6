import fs from 'node:fs';
import {compileNavigationLemmaR242,normalizeRouteIdentityR242,resolveExactRouteR242,R242_CONTINUITY_OPERATOR,R242_NAVIGATION_LAWS} from '../src/navigationLemmaCalculusR242.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R242 ${msg}`)};
const registry=read('src/omegaExperienceRegistryR82.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const workflow=read('.github/workflows/r241-archive-convergence.yml');

const workspaceBlocks=[...registry.matchAll(/\{id:'([^']+)',label:'([^']+)',copy:'([^']+)',role:'[^']+',routes:\[(.*?)\]\}/gs)];
const routeRecords=[];
for(const [,workspaceId,workspaceLabel,workspaceCopy,body] of workspaceBlocks){
 const names=[...body.matchAll(/'([^']+)'/g)].map(match=>match[1]);
 for(const name of names)routeRecords.push({name,workspaceId,workspaceLabel,workspaceCopy,tier:'SUPPORT',index:routeRecords.length,searchable:`${workspaceLabel} ${workspaceCopy}`});
}
const historicalBaseline=Number(registry.match(/historicalR82Baseline:(\d+)/)?.[1]||0);
must(routeRecords.length===historicalBaseline&&historicalBaseline>0,`registry parse must conserve current historical non-regression baseline; parsed=${routeRecords.length} baseline=${historicalBaseline}`);
must(new Set(routeRecords.map(route=>route.name)).size===routeRecords.length,'source route names must remain unique');
must(new Set(routeRecords.map(route=>normalizeRouteIdentityR242(route.name))).size===routeRecords.length,'normalized route identities must remain unique');

const full=compileNavigationLemmaR242({routes:routeRecords,query:'',workspaceFilter:'ALL',currentRoute:'Governance'});
must(full.structuralPass,'full route partition must satisfy structural lemma invariants');
must(full.invariantCarry.sourceCount===routeRecords.length&&full.invariantCarry.partitionCount===routeRecords.length,'workspace partition must conserve every source route exactly once');
must(full.invariantCarry.currentRouteCarried,'current exact route identity must survive partition/recontextualization');
must(full.routes.length===routeRecords.length,'empty query may reorder presentation but may not remove routes');
must(full.operator===R242_CONTINUITY_OPERATOR&&R242_NAVIGATION_LAWS.includes('AMBIGUITY_IS_CARRIED_AS_RESIDUAL_INSTEAD_OF_SILENTLY_RESOLVED'),'established continuity/lemma operator and ambiguity law must be active');

const governance=compileNavigationLemmaR242({routes:routeRecords,query:'Governance',workspaceFilter:'ALL',currentRoute:'Governance'});
must(governance.routes[0]?.name==='Governance','exact Governance identity must outrank Evidence-workspace governance metadata matches');
must(governance.exactRoute?.name==='Governance','exact query identity must resolve to Governance only');
must(resolveExactRouteR242(routeRecords,'Governance')?.name==='Governance','exact route resolver must not collapse Governance into substring-related routes');
const system=compileNavigationLemmaR242({routes:routeRecords,query:'System',workspaceFilter:'ALL',currentRoute:'System'});
must(system.routes[0]?.name==='System'&&system.exactRoute?.name==='System','exact System route must outrank System Atlas and metadata matches');
const proof=compileNavigationLemmaR242({routes:routeRecords,query:'proof',workspaceFilter:'ALL'});
must(proof.routes.some(route=>route.name==='Evidence & Proof'),'semantic proof query must preserve Evidence & Proof reachability');

const buildExpected=routeRecords.filter(route=>route.workspaceId==='BUILD').length;
const build=compileNavigationLemmaR242({routes:routeRecords,query:'',workspaceFilter:'BUILD'});
must(build.routes.length===buildExpected&&buildExpected>0,'BUILD repartition must equal source BUILD partition exactly');
const missing=compileNavigationLemmaR242({routes:routeRecords,query:'definitely-not-a-real-route',workspaceFilter:'ALL'});
must(missing.routes.length===0&&missing.runtimeResiduals.some(x=>x.kind==='NO_QUERY_MATCH'),'empty query result must become an explicit residual rather than a fabricated destination');
const duplicate=compileNavigationLemmaR242({routes:[...routeRecords,{...routeRecords[0]}],query:'',workspaceFilter:'ALL'});
must(!duplicate.structuralPass&&duplicate.structuralResiduals.some(x=>x.kind==='AMBIGUOUS_ROUTE_IDENTITY'),'duplicate identity must fail closed as structural residual');
must(resolveExactRouteR242([...routeRecords,{...routeRecords[0]}],routeRecords[0].name)===null,'ambiguous exact identity must not be silently selected');

for(const token of [
 "from './navigationLemmaCalculusR242.js'",
 'compileNavigationLemmaR242({routes:routeRecords,query,workspaceFilter,currentRoute:currentPanel})',
 'resolveExactRouteR242(routeRecords,panel)',
 'UNRESOLVED_ROUTE_IDENTITY:',
 'data-navigation-lemma-revision={R242_NAVIGATION_LEMMA_REVISION}',
 'data-lemma-pass={navigationLemma.structuralPass',
 'data-lemma-residual-count={residualCount}',
 'data-route-name={route}',
 'firstOfTier=!navigationLemma.searching',
 'no destination is fabricated'
])must(nav.includes(token),`navigator integration missing ${token}`);
must(!nav.includes('organizedRoutesR132(filtered)'),'legacy ad-hoc route filtering must not bypass R242 lemma transform');
must(workflow.includes('node tests/r242-navigation-lemma-calculus-invariants.mjs'),'R241 bounded proof workflow must execute R242 navigation lemma invariants');
const directR239Browser=workflow.includes('node tests/r239-user-navigation-browser-e2e.mjs');
const boundedR239Browser=workflow.includes('run_browser tests/r239-user-navigation-browser-e2e.mjs');
must(directR239Browser||boundedR239Browser,'R241 bounded proof workflow must execute the R239 browser proof directly or through the fail-closed bounded runner');
if(boundedR239Browser){
 must(workflow.includes('run_browser(){')&&workflow.includes('timeout -k 15s 300s'),'R303 bounded R239 browser invocation must retain the fail-closed timeout runner');
 must(!workflow.includes('continue-on-error: true'),'R303 bounded browser runner must not convert failure into success');
}
must(!workflow.includes('schedule:')&&!workflow.includes('push:'),'R241/R242 proof workflow must remain PR/manual read-only proof authority');

console.log(`R242 NAVIGATION LEMMA CALCULUS PASS · ${routeRecords.length} source routes conserved · exact identity > prefix/token/metadata · Governance/System ambiguity closed · workspace partition conserved · unresolved/duplicate identities carried as residuals · query presentation cannot rename/duplicate routes · R239 browser proof remains mandatory direct-or-bounded · navigation remains read-only and non-Canon`);
