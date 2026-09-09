export const R242_NAVIGATION_LEMMA_SCHEMA='OMEGA_NAVIGATION_LEMMA_CALCULUS_R242';
export const R242_NAVIGATION_LEMMA_REVISION='R242';
export const R242_CONTINUITY_OPERATOR='PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION';
export const R242_NAVIGATION_LAWS=Object.freeze([
 'ROUTE_IDENTITY_BEFORE_PRESENTATION_MATCH',
 'WORKSPACE_PARTITION_MUST_CONSERVE_THE_COMPLETE_ROUTE_SET',
 'QUERY_TRANSFORM_MAY_REORDER_PRESENTATION_BUT_MAY_NOT_RENAME_OR_DUPLICATE_ROUTES',
 'EXACT_IDENTITY_OUTRANKS_PREFIX_TOKEN_AND_METADATA_MATCHES',
 'CURRENT_ROUTE_IDENTITY_MUST_SURVIVE_VIEW_AND_SEARCH_TRANSFORMS',
 'AMBIGUITY_IS_CARRIED_AS_RESIDUAL_INSTEAD_OF_SILENTLY_RESOLVED',
 'EMPTY_SEARCH_RESULT_IS_OBSERVED_NOT_FABRICATED',
 'NAVIGATION_TRANSFORM_HAS_NO_EXECUTION_OR_CANONSTATE_AUTHORITY'
]);

const TIER_RANK=Object.freeze({PRIMARY:0,SUPPORT:1,EXPERT:2});
const fold=value=>String(value??'').normalize('NFKD').replace(/&/g,' and ').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const tokens=value=>fold(value).split(' ').filter(Boolean);
const safeIndex=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;

export function normalizeRouteIdentityR242(value){return fold(value)}

export function resolveExactRouteR242(routes,name){
 const key=fold(name);
 if(!key)return null;
 const matches=(routes||[]).filter(route=>fold(route?.name)===key);
 return matches.length===1?matches[0]:null;
}

function relevance(route,queryKey,queryTokens){
 if(!queryKey)return 0;
 if(route.identityKey===queryKey)return 1000;
 if(route.identityKey.startsWith(`${queryKey} `))return 900;
 const nameTokens=tokens(route.name);
 if(queryTokens.length===1&&nameTokens.includes(queryTokens[0]))return 850;
 if(queryTokens.length>1&&queryTokens.every(token=>nameTokens.includes(token)))return 825;
 if(route.identityKey.includes(queryKey))return 750;
 if(queryTokens.every(token=>route.searchKey.includes(token)))return 500;
 return -1;
}

export function compileNavigationLemmaR242(input={}){
 const source=(input.routes||[]).map((route,index)=>{
  const name=String(route?.name??'').trim();
  const workspaceId=String(route?.workspaceId??'UNASSIGNED').trim()||'UNASSIGNED';
  const tier=Object.hasOwn(TIER_RANK,route?.tier)?route.tier:'EXPERT';
  const identityKey=fold(name);
  const searchKey=fold([name,workspaceId,route?.workspaceLabel,route?.workspaceCopy,route?.tier,route?.surfaceClass,route?.layout,route?.searchable].filter(Boolean).join(' '));
  return Object.freeze({...route,name,workspaceId,tier,index:safeIndex(route?.index,index),identityKey,searchKey});
 });
 const structuralResiduals=[];
 const runtimeResiduals=[];
 const identityGroups=new Map();
 for(const route of source){
  if(!route.identityKey)structuralResiduals.push({kind:'EMPTY_ROUTE_IDENTITY',route:route.name,index:route.index});
  const group=identityGroups.get(route.identityKey)||[];group.push(route);identityGroups.set(route.identityKey,group);
 }
 for(const [identityKey,group] of identityGroups)if(identityKey&&group.length!==1)structuralResiduals.push({kind:'AMBIGUOUS_ROUTE_IDENTITY',identityKey,routes:group.map(route=>route.name)});
 const workspaceCounts={};for(const route of source)workspaceCounts[route.workspaceId]=(workspaceCounts[route.workspaceId]||0)+1;
 const partitionCount=Object.values(workspaceCounts).reduce((sum,count)=>sum+count,0);
 if(partitionCount!==source.length)structuralResiduals.push({kind:'WORKSPACE_PARTITION_NOT_CONSERVED',sourceCount:source.length,partitionCount});

 const requestedWorkspace=String(input.workspaceFilter??'ALL');
 const partitioned=requestedWorkspace==='ALL'?source:source.filter(route=>route.workspaceId===requestedWorkspace);
 if(requestedWorkspace!=='ALL'&&partitioned.length===0)runtimeResiduals.push({kind:'EMPTY_WORKSPACE_PARTITION',workspaceId:requestedWorkspace});
 const queryKey=fold(input.query),queryTokens=tokens(input.query);
 let projected=partitioned.map(route=>({route,score:relevance(route,queryKey,queryTokens)}));
 if(queryKey)projected=projected.filter(item=>item.score>=0);
 if(queryKey&&projected.length===0)runtimeResiduals.push({kind:'NO_QUERY_MATCH',query:String(input.query??'')});
 projected.sort((a,b)=>queryKey
  ? b.score-a.score||(TIER_RANK[a.route.tier]??9)-(TIER_RANK[b.route.tier]??9)||a.route.index-b.route.index||a.route.name.localeCompare(b.route.name)
  : (TIER_RANK[a.route.tier]??9)-(TIER_RANK[b.route.tier]??9)||a.route.index-b.route.index||a.route.name.localeCompare(b.route.name));
 if(queryKey&&projected.length>1&&projected[0].score===projected[1].score)runtimeResiduals.push({kind:'TOP_MATCH_TIE',query:String(input.query??''),score:projected[0].score,routes:projected.filter(item=>item.score===projected[0].score).map(item=>item.route.name)});
 const currentName=String(input.currentRoute??'').trim();
 const currentResolved=currentName?resolveExactRouteR242(source,currentName):null;
 if(currentName&&!currentResolved)runtimeResiduals.push({kind:'CURRENT_ROUTE_NOT_EXACTLY_RESOLVABLE',route:currentName});
 const routes=projected.map(item=>Object.freeze({...item.route,lemmaScore:item.score}));
 const invariantCarry={
  sourceCount:source.length,
  uniqueIdentityCount:[...identityGroups.entries()].filter(([key])=>key).length,
  partitionCount,
  workspaceCounts:Object.freeze({...workspaceCounts}),
  currentRoute:currentName||null,
  currentRouteCarried:currentName?Boolean(currentResolved):true
 };
 return Object.freeze({
  schema:R242_NAVIGATION_LEMMA_SCHEMA,
  revision:R242_NAVIGATION_LEMMA_REVISION,
  operator:R242_CONTINUITY_OPERATOR,
  laws:R242_NAVIGATION_LAWS,
  phase:Object.freeze({partition:'WORKSPACE_AND_ROUTE_IDENTITY',exchangeTransform:queryKey?'QUERY_RELEVANCE_TRANSFORM':'PRESENTATION_ORDER_TRANSFORM',invariantCarry:'ROUTE_NAME_WORKSPACE_TIER_INDEX_CURRENT_ROUTE',scarResidualCarry:'EXPLICIT_STRUCTURAL_AND_RUNTIME_RESIDUALS',recontextualizeRepartition:queryKey?'RELEVANCE_THEN_TIER_THEN_SOURCE_INDEX':'TIER_THEN_SOURCE_INDEX'}),
  query:String(input.query??''),queryKey,workspaceFilter:requestedWorkspace,
  searching:Boolean(queryKey),
  routes:Object.freeze(routes),
  exactRoute:queryKey?resolveExactRouteR242(source,input.query):null,
  invariantCarry:Object.freeze(invariantCarry),
  structuralResiduals:Object.freeze(structuralResiduals),
  runtimeResiduals:Object.freeze(runtimeResiduals),
  residualCount:structuralResiduals.length+runtimeResiduals.length,
  structuralPass:structuralResiduals.length===0,
  authority:'READ_ONLY_NAVIGATION_PROJECTION_NO_EXECUTION_NO_CANONSTATE_ADMISSION',
  boundary:'R242 applies the established continuity/lemma operator to route selection and navigation state. It preserves exact route identity, workspace partition conservation, current-route carry and ambiguity residuals. Search relevance and presentation order are software projections only; they do not alter capability, execution, evidence, or CanonState authority.'
 });
}
