import {operationContractForRouteR143} from './authoritativeOperationChainR143';
import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import {YEAR_CORPUS_EXECUTION_R473,type CorpusBindingR473,type CorpusExecutionStateR473} from './yearCorpusExecutionR473';

export const R512_SOFTWARE_LAUNCH_SCHEMA='OMEGA_WORKING_SOFTWARE_LIBRARY_R512';

export type SoftwareLaunchClassR512='WORKS_NOW'|'SUCCESSOR_ADAPTER'|'EVIDENCE_GATED';
export type SoftwareLaunchRowR512={
 schema:typeof R512_SOFTWARE_LAUNCH_SCHEMA;
 id:string;
 name:string;
 domain:string;
 state:CorpusExecutionStateR473;
 launchClass:SoftwareLaunchClassR512;
 launchable:boolean;
 route:string;
 workspace:string;
 operation:string;
 capabilityId:string;
 executionDomain:string;
 executorState:string;
 aliases:readonly string[];
 contribution:string;
 truth:string;
 actionLabel:string;
 canonicalMutation:false;
};

const klass=(state:CorpusExecutionStateR473):SoftwareLaunchClassR512=>
 state==='EXECUTES_NOW'?'WORKS_NOW':state==='EXECUTES_AS_ADAPTER'?'SUCCESSOR_ADAPTER':'EVIDENCE_GATED';

const action=(state:CorpusExecutionStateR473)=>
 state==='EXECUTES_NOW'?'Launch':state==='EXECUTES_AS_ADAPTER'?'Launch successor':'Open gated executor';

function compile(binding:CorpusBindingR473):SoftwareLaunchRowR512{
 const chain=operationContractForRouteR143(binding.route);
 const launchable=OMEGA_ALL_ROUTES_R82.includes(binding.route as any)&&Boolean(chain?.routeId&&chain?.capabilityId&&chain?.executionDomain);
 return Object.freeze({
  schema:R512_SOFTWARE_LAUNCH_SCHEMA,
  id:binding.id,
  name:binding.name,
  domain:binding.domain,
  state:binding.state,
  launchClass:klass(binding.state),
  launchable,
  route:binding.route,
  workspace:workspaceForRouteR82(binding.route).label,
  operation:binding.operation,
  capabilityId:String(chain?.capabilityId||'UNBOUND'),
  executionDomain:String(chain?.executionDomain||'UNBOUND'),
  executorState:String(chain?.state||'UNBOUND'),
  aliases:Object.freeze([...binding.aliases]),
  contribution:binding.contribution,
  truth:binding.truth,
  actionLabel:action(binding.state),
  canonicalMutation:false,
 });
}

export const SOFTWARE_LAUNCH_ROWS_R512:readonly SoftwareLaunchRowR512[]=Object.freeze(YEAR_CORPUS_EXECUTION_R473.map(compile));

export const SOFTWARE_LAUNCH_SUMMARY_R512=Object.freeze({
 schema:R512_SOFTWARE_LAUNCH_SCHEMA,
 total:SOFTWARE_LAUNCH_ROWS_R512.length,
 worksNow:SOFTWARE_LAUNCH_ROWS_R512.filter(x=>x.launchClass==='WORKS_NOW'&&x.launchable).length,
 adapters:SOFTWARE_LAUNCH_ROWS_R512.filter(x=>x.launchClass==='SUCCESSOR_ADAPTER'&&x.launchable).length,
 gated:SOFTWARE_LAUNCH_ROWS_R512.filter(x=>x.launchClass==='EVIDENCE_GATED'&&x.launchable).length,
 unbound:SOFTWARE_LAUNCH_ROWS_R512.filter(x=>!x.launchable).length,
 boundary:'Historical software names are searchable aliases for current executor bindings. Launching a lineage opens the current route that carries its functions. Adapter and evidence-gated states remain explicit; archive/donor presence alone never becomes a runnable software claim.',
});

export function softwareLaunchRowR512(idOrAlias:string){
 const q=String(idOrAlias||'').trim().toLowerCase();
 return SOFTWARE_LAUNCH_ROWS_R512.find(row=>row.id.toLowerCase()===q||row.name.toLowerCase()===q||row.aliases.some(alias=>alias.toLowerCase()===q))||null;
}

export function validateSoftwareLaunchRegistryR512(){
 const duplicateIds=SOFTWARE_LAUNCH_ROWS_R512.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
 const badRoutes=SOFTWARE_LAUNCH_ROWS_R512.filter(x=>x.launchable&&!OMEGA_ALL_ROUTES_R82.includes(x.route as any)).map(x=>x.id);
 const fakeLaunch=SOFTWARE_LAUNCH_ROWS_R512.filter(x=>x.launchable&&(x.capabilityId==='UNBOUND'||x.executionDomain==='UNBOUND')).map(x=>x.id);
 return Object.freeze({
  ...SOFTWARE_LAUNCH_SUMMARY_R512,
  duplicateIds:Object.freeze(duplicateIds),
  badRoutes:Object.freeze(badRoutes),
  fakeLaunch:Object.freeze(fakeLaunch),
  pass:duplicateIds.length===0&&badRoutes.length===0&&fakeLaunch.length===0&&SOFTWARE_LAUNCH_ROWS_R512.length===YEAR_CORPUS_EXECUTION_R473.length,
 });
}
