import {MASTER_CAPABILITIES_R83,MASTER_MENU_OPTIONS_R83,MASTER_SYSTEMS_R83,routeForCapabilityR83,type MasterCapabilityR83,type MasterMenuOptionR83,type MasterSystemR83} from './softwareMasterLedgerR83';
import {surfaceModeFabricR107} from './modeExecutionFabricR107';
import {SOURCE_CORPUS_AUTHORITIES_R107,ULTIMATE_DEVELOPMENT_FABRIC_R107} from './sourceCorpusCorrelationR107';
import {planIntentR103} from './federation/federationIntentRouterR103.js';
import type {WorkflowIntentR85} from './omegaWorkflowRuntimeR85';

export type CapabilityStateR108='REQUIRED'|'SUPPORTING'|'AVAILABLE';
export type SourceStateR108='ACTIVE'|'SUPPORTING'|'AVAILABLE';
export type CapabilitySelectionR108={id:string;name:string;state:CapabilityStateR108;route:string;menu:string;proofGate:string;roles:string;reason:string};
export type SourceSelectionR108={id:string;title:string;state:SourceStateR108;authority:string;truthBoundary:string};

const BASE_BY_INTENT:Record<WorkflowIntentR85,readonly string[]>={
 EXPLORE:['CAP-001','CAP-003','CAP-004','CAP-005','CAP-015'],
 ANALYZE:['CAP-001','CAP-005','CAP-007','CAP-015','CAP-017'],
 FORECAST:['CAP-001','CAP-003','CAP-004','CAP-009','CAP-015','CAP-017'],
 BUILD:['CAP-001','CAP-002','CAP-012','CAP-013','CAP-015','CAP-016'],
 REPAIR:['CAP-001','CAP-002','CAP-012','CAP-013','CAP-014','CAP-015','CAP-016'],
 PROVE:['CAP-001','CAP-002','CAP-004','CAP-015','CAP-017'],
 CREATE:['CAP-001','CAP-005','CAP-008','CAP-015','CAP-018'],
 CONNECT:['CAP-001','CAP-006','CAP-015','CAP-017']
};

const KEYWORD_CAPS:readonly [RegExp,readonly string[],string][]=[
 [/\b(camera|video frame|visual feed|sensor|image feed)\b/i,['CAP-006','CAP-017'],'camera/host observation'],
 [/\b(excel|xlsx|workbook|csv|spreadsheet|atlas|data table|ledger)\b/i,['CAP-007','CAP-004'],'workbook/atlas data'],
 [/\b(gpu|3d|render|renderer|volumetric|display|visual|membrane|pixel)\b/i,['CAP-005','CAP-008'],'advanced rendering'],
 [/\b(forecast|predict|prediction|future|scenario|topology)\b/i,['CAP-009','CAP-003','CAP-017'],'forecast topology'],
 [/\b(bio|biological|hrv|symptom|ecological)\b/i,['CAP-010','CAP-017'],'bio/reality mapping'],
 [/\b(audio|music|sound|sonif|signal)\b/i,['CAP-011'],'audio/signal mapping'],
 [/\b(package|installer|install|one.?click|portable|launcher)\b/i,['CAP-012'],'packaging/deployment'],
 [/\b(patch|repair|rollback|fix|recover)\b/i,['CAP-013','CAP-014'],'repair/recovery'],
 [/\b(archive|donor|merge|reconcile|restore)\b/i,['CAP-014'],'archive/donor merge'],
 [/\b(ai|assistant|plan|planning|orchestrat|agent)\b/i,['CAP-016'],'AI-assisted routing'],
 [/\b(reality|measure|measurement|observation|evidence|source class|empirical)\b/i,['CAP-017'],'reality/evidence classification'],
 [/\b(media|image|video|clip|create|artifact|generate)\b/i,['CAP-018'],'media/artifact creation'],
 [/\b(proof|prove|verify|verification|validate|validation|admit|admission|canon)\b/i,['CAP-002','CAP-004','CAP-017'],'proof/admission'],
 [/\b(travers|route|address|path|stay|turn|escalate|motion)\b/i,['CAP-003','CAP-004'],'traversal/addressing'],
 [/\b(optic|optical|light|etch|metasurface|wavelength|spectral|rcwa|fdtd|fem|full.?wave|photon)\b/i,['CAP-005','CAP-008','CAP-017'],'optical/full-wave evidence'],
 [/\b(pc|computer|machine|native|local compute|sovereign|hybrid)\b/i,['CAP-001','CAP-012','CAP-013','CAP-015'],'native/sovereign execution'],
 [/\b(scale|248832|20736|61917364224|recursive|shell|matter)\b/i,['CAP-004','CAP-005','CAP-007','CAP-008'],'scale/address representation']
] as const;

const SOURCE_RULES:Record<string,RegExp>={
 ONE_SYSTEM_MENU_LEDGER:/./,
 J_DRIVE_AUTOPING_LEDGER:/\b(build|repair|connect|pc|computer|machine|native|local|hybrid|package|installer|patch|runtime)\b/i,
 FULL_SOFTWARE_UNIVERSE:/\b(build|repair|system|software|archive|donor|merge|capability|runtime|full|ultimate)\b/i,
 DEWEY_20736_CALCULUS:/./,
 DEWEY_248832_SCALE_ATLAS:/\b(scale|248832|matter|atlas|shell|recursive|travers|nuclear|atomic|chemical|biological|planetary|stellar|galactic|ecological|social|cognitive|technological)\b/i,
 SCIENTIFIC_VALIDATION_BRIDGE:/\b(science|scientific|physics|physical|empirical|measure|measurement|validate|validation|proof|forecast|predict|optic|optical|light|rcwa|fdtd|fem|full.?wave)\b/i,
 FOUR_NODE_CLOUD_FABRIC:/\b(cloud|genesis|optical|sovereign|rcwa|fdtd|fem|full.?wave|distributed|federat|pc|native|compute)\b/i
};

const uniq=<T,>(xs:T[])=>[...new Set(xs)];
const words=(x:any)=>String(x||'').trim();
const roleTokens=(x:string)=>x.split(/[\s,;/]+/).map(v=>v.trim()).filter(Boolean);

function capabilityReason(cap:MasterCapabilityR83,intent:WorkflowIntentR85,text:string,matched:Map<string,string[]>){
 const why=matched.get(cap.id)||[];
 if(BASE_BY_INTENT[intent].includes(cap.id))why.unshift(`${intent.toLowerCase()} workflow base`);
 return uniq(why).join(' + ')||'available from recovered master capability ledger';
}
function relevantSystems(required:MasterCapabilityR83[],supporting:MasterCapabilityR83[]){
 const caps=[...required,...supporting],menus=new Set(caps.map(x=>x.menu)),roles=new Set(caps.flatMap(x=>roleTokens(x.roles)));
 const scored=MASTER_SYSTEMS_R83.map((row:MasterSystemR83)=>{
  const rowRoles=roleTokens(row.role),menuHit=menus.has(row.menu),roleHits=rowRoles.filter(x=>roles.has(x)).length;
  return{row,score:(menuHit?2:0)+roleHits};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.row.id.localeCompare(b.row.id));
 return scored.slice(0,16).map(x=>x.row);
}
function relevantMenuOptions(required:MasterCapabilityR83[],supporting:MasterCapabilityR83[]){
 const caps=[...required,...supporting],menus=new Set(caps.map(x=>x.menu)),roles=new Set(caps.flatMap(x=>roleTokens(x.roles)));
 const scored=MASTER_MENU_OPTIONS_R83.map((row:MasterMenuOptionR83)=>{
  const menuHit=menus.has(row.topMenu),roleHits=roleTokens(row.roles).filter(x=>roles.has(x)).length;
  return{row,score:(menuHit?2:0)+roleHits};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.row.optionId.localeCompare(b.row.optionId));
 return scored.slice(0,16).map(x=>x.row);
}

export function compileUltimateCapabilityPlanR108(args:{intent:WorkflowIntentR85;goal:string;surface:string;record:any;federationStatus?:any}){
 const intent=args.intent,text=`${args.intent} ${words(args.goal)} ${words(args.surface)}`.trim();
 const matched=new Map<string,string[]>(),requiredIds=new Set<string>(BASE_BY_INTENT[intent]),supportingIds=new Set<string>();
 for(const[re,ids,reason]of KEYWORD_CAPS){if(!re.test(text))continue;for(const id of ids){if(requiredIds.has(id))matched.set(id,[...(matched.get(id)||[]),reason]);else supportingIds.add(id),matched.set(id,[...(matched.get(id)||[]),reason])}}
 // A mutation/admission workflow always keeps the admission gate explicit; reading-only workflows do not force mutation.
 if(/\b(commit|mutate|change|apply|promote|admit|deploy|build|repair|patch)\b/i.test(text))requiredIds.add('CAP-002');
 for(const id of requiredIds)supportingIds.delete(id);
 const required=MASTER_CAPABILITIES_R83.filter(x=>requiredIds.has(x.id));
 const supporting=MASTER_CAPABILITIES_R83.filter(x=>supportingIds.has(x.id));
 const selections:CapabilitySelectionR108[]=MASTER_CAPABILITIES_R83.map(cap=>({id:cap.id,name:cap.name,state:requiredIds.has(cap.id)?'REQUIRED':supportingIds.has(cap.id)?'SUPPORTING':'AVAILABLE',route:routeForCapabilityR83(cap),menu:cap.menu,proofGate:cap.proofGate,roles:cap.roles,reason:capabilityReason(cap,intent,text,matched)}));
 const systems=relevantSystems(required,supporting),menuOptions=relevantMenuOptions(required,supporting);
 const mode=surfaceModeFabricR107(args.surface,args.record),activeModeFamilies=Object.entries(mode.channels).sort((a,b)=>Number(b[1])-Number(a[1])).filter(([,v])=>Number(v)>0).map(([family,value])=>({family,value:Number(value)}));
 const federation=planIntentR103(words(args.goal)||`${args.intent} ${args.surface}`,args.federationStatus||{});
 const federationRequired=new Set<string>(federation?.requiredNodes||[]);
 const sources:SourceSelectionR108[]=SOURCE_CORPUS_AUTHORITIES_R107.map(source=>{
  const active=source.id==='ONE_SYSTEM_MENU_LEDGER'||source.id==='DEWEY_20736_CALCULUS'||Boolean(SOURCE_RULES[source.id]?.test(text))||(source.id==='FOUR_NODE_CLOUD_FABRIC'&&federationRequired.size>1);
  const state:SourceStateR108=active?'ACTIVE':source.productionBinding.some(binding=>systems.some(x=>(x.artifact+' '+x.capability+' '+x.wiring).toLowerCase().includes(binding.toLowerCase())))?'SUPPORTING':'AVAILABLE';
  return{id:source.id,title:source.title,state,authority:source.authority,truthBoundary:source.truthBoundary};
 });
 const scaleExpanded=SOURCE_RULES.DEWEY_248832_SCALE_ATLAS.test(text),empirical=SOURCE_RULES.SCIENTIFIC_VALIDATION_BRIDGE.test(text);
 const routes=uniq([...required,...supporting].map(routeForCapabilityR83));
 const proofGates=uniq(required.map(x=>x.proofGate).filter(Boolean));
 const sourceGates=mode.gated.map((x:any)=>({ref:x.ref,name:x.name,basis:x.basis}));
 const capabilityCounts={total:MASTER_CAPABILITIES_R83.length,required:required.length,supporting:supporting.length,available:MASTER_CAPABILITIES_R83.length-required.length-supporting.length};
 return{
  schema:'OMEGA_ULTIMATE_CAPABILITY_MEMBRANE_R108',intent,goal:words(args.goal),surface:args.surface,
  correlationOrder:ULTIMATE_DEVELOPMENT_FABRIC_R107.correlationOrder,
  scale:{resident:20736,effective:scaleExpanded?248832:20736,virtualAddressCapacity:61917364224,expanded:scaleExpanded,physicalDimensionClaim:false},
  sources,capabilities:selections,capabilityCounts,requiredCapabilities:selections.filter(x=>x.state==='REQUIRED'),supportingCapabilities:selections.filter(x=>x.state==='SUPPORTING'),
  systems,menuOptions,routes,mode:{catalog:mode.availability.sourceCatalog,canonLenses:mode.availability.canonLenses,applicable:mode.applicableCount,contributing:mode.contributingCount,gated:mode.gatedCount,layers:mode.layer.layers,primaryLayer:mode.layer.primary,activeFamilies:activeModeFamilies.slice(0,10),topContributors:mode.topContributors.slice(0,8)},
  federation,proof:{proofGates,sourceGates,empiricalValidationRequired:empirical,empiricalAuthority:empirical?'SCIENTIFIC_VALIDATION_BRIDGE':'AVAILABLE_IF_CLAIM_REQUIRES_IT'},
  next:{routes,federationGate:String(federation?.gate||'UNKNOWN'),firstRoute:routes[0]||args.surface},
  boundary:'R108 compiles one intent into the already accepted source → state → calculus → modes → layers → capability → runtime → observation → action → proof → admission chain. It selects the minimum required capability graph while keeping all recovered capabilities/modes/source authorities available. Selection never turns catalog metadata into execution, a Drive design row into live runtime proof, a cloud registration into ONLINE state, or a representational scale into a physical dimension.'
 };
}
