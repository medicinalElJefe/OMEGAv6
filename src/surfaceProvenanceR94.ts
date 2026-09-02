export type ProvenanceClassR94=
 'RETURNED_EVIDENCE'|'IMPORTED_EVIDENCE'|'LOCAL_OBSERVATION'|'CANONICAL_PACKET'|'EXACT_EVALUATION'|
 'DERIVED_MODEL'|'FORECAST_MODEL'|'PROVIDER_SYNTHESIS'|'LOCAL_ARTIFACT'|'ARCHIVE_EVIDENCE'|
 'RUNTIME_PROOF'|'DEVICE_PROOF'|'REGISTRY_METADATA'|'GOVERNANCE_DECISION'|'REPRESENTATIONAL'|'UNAVAILABLE';

export type SurfaceProvenanceR94={
 surface:string;
 primary:ProvenanceClassR94;
 inputs:readonly ProvenanceClassR94[];
 display:string;
 actionAuthority:string;
 proof:string;
 forbidden:string;
 optionalRepresentations?:readonly string[];
};

const P=(surface:string,primary:ProvenanceClassR94,inputs:readonly ProvenanceClassR94[],display:string,actionAuthority:string,proof:string,forbidden:string,optionalRepresentations:readonly string[]=[]):SurfaceProvenanceR94=>({surface,primary,inputs,display,actionAuthority,proof,forbidden,optionalRepresentations});

export const OMEGA_SURFACE_PROVENANCE_R94:readonly SurfaceProvenanceR94[]=[
 P('Command Center','PROVIDER_SYNTHESIS',['CANONICAL_PACKET','EXACT_EVALUATION','PROVIDER_SYNTHESIS'],'Canonical packet + routed model response','route-preview before provider synthesis; provider does not own canonical state','provider response path + packet context + operation receipt','provider prose is not external evidence'),
 P('Hybrid Link','DEVICE_PROOF',['RUNTIME_PROOF','DEVICE_PROOF'],'Authenticated browser↔host/device proof state','native execution only after authenticated current heartbeat','heartbeat/authentication envelope','browser pairing or a button is not native execution'),
 P('Workspace','LOCAL_ARTIFACT',['CANONICAL_PACKET','LOCAL_ARTIFACT'],'Browser-local packet snapshots, notes and hashes','local capture/reopen only','SHA-256 packet identity + local transaction ledger','local persistence is not native filesystem or cloud persistence'),
 P('Cockpit','RUNTIME_PROOF',['CANONICAL_PACKET','RUNTIME_PROOF','DEVICE_PROOF'],'Hosted status, restoration and proof gates around current packet','actions remain separately governed','returned runtime envelopes + transaction hashes','capability topology is not proof of execution',['Capability constellation is registry-derived topology only']),
 P('Immersive Traversal','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION'],'Current → admitted-next canonical state traversal','only admitted packet transitions change canonical address','canonical packet + autoPing route','rendered geometry is not observation',['Deep traversal renderer/studio']),
 P('Matter Traversal','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION'],'Canonical packet and admitted transition data','only canonical address commit mutates state','packet values + admitted route','matter/biology renderings are not measured matter',['Deep Matter renderer','Biological traversal']),
 P('Extreme Traversal','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION','ARCHIVE_EVIDENCE'],'Canonical admitted traversal with restored functions separated','canonical route commit only','packet route + restored-function boundaries','restored renderers are not measurements or native proof',['Restored runtime visual functions']),
 P('Visual Instrument','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION','DERIVED_MODEL'],'Canonical packet, evaluated mode trace and admitted transition','state changes only by canonical address selection','packet + evaluator trace + route','derived/cinematic lenses do not create observations',['Derived field','Derived forecast','Derived relativity','Cinematic renderer']),
 P('Relativity','EXACT_EVALUATION',['CANONICAL_PACKET','EXACT_EVALUATION','DERIVED_MODEL'],'Workbook/source-backed relations and packet transition values','observer controls alter projection only','exact evaluator state + source relation ledger','observer rendering is not new physical evidence',['Observer-field rendering']),
 P('Earth Now','RETURNED_EVIDENCE',['RETURNED_EVIDENCE','DERIVED_MODEL'],'WGS84 context + returned weather/seismic/event/space evidence','queries change returned-source target only','evidence hash/timestamp + provider state','calculus comparison is not a second sensor',['Calculus-conditioned comparison']),
 P('Forecast','FORECAST_MODEL',['CANONICAL_PACKET','EXACT_EVALUATION','FORECAST_MODEL'],'Computed competing admissible future corridors','selection does not observe or cause the future','forecast plan inputs + route audit','forecast is never future observation',['Derived calculus forecast rendering']),
 P('Atlas','DERIVED_MODEL',['CANONICAL_PACKET','DERIVED_MODEL'],'Interactive projection of canonical atlas addresses','selected canonical address is the only state commit','canonical address mapping + projection math','atlas geometry is not physical space'),
 P('Traversal','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION'],'Current → admitted-next state evolution','admitted route only','packet + autoPing route','motion graphics are not physical motion',['Deep traversal studio']),
 P('Create','LOCAL_ARTIFACT',['CANONICAL_PACKET','LOCAL_ARTIFACT','PROVIDER_SYNTHESIS'],'Local creation workflow routed to bounded tools','artifact creation does not mutate canon without governance','artifact bytes/receipt where produced','draft/output is not admitted canon'),
 P('Field','CANONICAL_PACKET',['CANONICAL_PACKET','EXACT_EVALUATION'],'Direct canonical packet metrics and admitted-next comparison','canonical address owns state','current + next packet values','field render lineage is not observation',['Historical woven/calculus field']),
 P('Data Motion','EXACT_EVALUATION',['CANONICAL_PACKET','EXACT_EVALUATION'],'Exact current→next packet deltas and derivatives','no physical-motion claim','two packet values + deterministic delta calculation','address-space derivatives are not physical velocity'),
 P('Reality Lab','IMPORTED_EVIDENCE',['IMPORTED_EVIDENCE','EXACT_EVALUATION','DERIVED_MODEL'],'User-imported CSV/TSV mapped into analysis points','no dataset means no analysis','selected bytes + parse/analysis receipt','missing observations are never synthesized',['Derived calculus map after real import']),
 P('Atlas Calculator','EXACT_EVALUATION',['CANONICAL_PACKET','EXACT_EVALUATION'],'Deterministic address/relation transforms','commit only writes exact calculated canonical address','formula inputs + outputs','calculation is not measurement'),
 P('Infinity','ARCHIVE_EVIDENCE',['ARCHIVE_EVIDENCE','CANONICAL_PACKET','DERIVED_MODEL'],'Recovered source rows with current packet values separated','selection changes row/packet context only','recovered source table + live packet labels','recovered source channels are not external observations'),
 P('Convergence','DERIVED_MODEL',['CANONICAL_PACKET','EXACT_EVALUATION','DERIVED_MODEL'],'Ranked route candidates and proof stages','only explicit selected candidate commit changes state','candidate inputs + score + proof stages','ranking is not destiny or external causation'),
 P('Quality Compiler','RUNTIME_PROOF',['RUNTIME_PROOF','REGISTRY_METADATA'],'Explicit test/probe evidence and HOLD states','quality checks do not promote production','probe results + fixed semantic suite','unverified checks may not be shown as PASS'),
 P('Build Out','ARCHIVE_EVIDENCE',['ARCHIVE_EVIDENCE','LOCAL_ARTIFACT'],'Restoration/build-plan evidence and local planning artifacts','Worker does not mutate repo or deploy from this surface','archive/build lineage + local plan','planned restoration is not executed deployment'),
 P('Projects','LOCAL_ARTIFACT',['CANONICAL_PACKET','LOCAL_ARTIFACT'],'Browser-local project/workflow continuity','project links do not change canon by themselves','local project IDs/hashes + operation linkage','local project state is not external storage proof'),
 P('Render Queue','LOCAL_ARTIFACT',['CANONICAL_PACKET','LOCAL_ARTIFACT','DERIVED_MODEL'],'Browser-generated source-bound render artifacts','rendering creates artifact only','artifact bytes/hash/metadata','render output is representational, not observation',['SVG/PNG rendering']),
 P('Assets','LOCAL_ARTIFACT',['LOCAL_OBSERVATION','LOCAL_ARTIFACT'],'User-selected local bytes and hashes','asset admission remains separate','byte hash + browser manifest','file name or preview is not semantic evidence'),
 P('Modes','EXACT_EVALUATION',['CANONICAL_PACKET','EXACT_EVALUATION','REGISTRY_METADATA'],'Evaluated hosted mode traces; gated/registry rows stay non-executed','mode selection changes inspection only','source evaluator state + formula/source','catalog membership is not execution'),
 P('Kernel Intelligence','PROVIDER_SYNTHESIS',['CANONICAL_PACKET','RUNTIME_PROOF','PROVIDER_SYNTHESIS'],'Intelligence routing/provider state against packet authority','provider cannot silently own canon or production','provider/runtime routing receipts','model availability is not proof of external fact'),
 P('Evidence & Proof','RUNTIME_PROOF',['CANONICAL_PACKET','RUNTIME_PROOF','ARCHIVE_EVIDENCE'],'Hashes, provenance records, proof receipts and explicit HOLDs','proof surface cannot manufacture missing authority','receipt/hash/source state','absence of evidence may not be promoted to PASS'),
 P('Memory','LOCAL_ARTIFACT',['CANONICAL_PACKET','LOCAL_ARTIFACT'],'Browser-local snapshots and scar/project continuity','memory is local unless separately proven','stored snapshot/hash','memory is not cloud/native persistence'),
 P('Archive Census','ARCHIVE_EVIDENCE',['ARCHIVE_EVIDENCE','REGISTRY_METADATA'],'Classified donor inventory and historical review evidence','classification does not execute donor code','archive registry + donor evidence','not a live enumeration of every Drive file'),
 P('Archive Operators','ARCHIVE_EVIDENCE',['ARCHIVE_EVIDENCE','GOVERNANCE_DECISION'],'Donor classification and local disposition decisions','KEEP/DONOR/etc. are admission decisions only','donor evidence + local override receipt','disposition is not runtime execution'),
 P('Development','PROVIDER_SYNTHESIS',['ARCHIVE_EVIDENCE','LOCAL_ARTIFACT','PROVIDER_SYNTHESIS'],'Provider-assisted development planning over restoration context','repository mutation/promotion stays in governed external build path','build plan + governed deployment receipts when external path runs','browser plan is not deployed code'),
 P('Canon Evolution','GOVERNANCE_DECISION',['CANONICAL_PACKET','GOVERNANCE_DECISION','LOCAL_ARTIFACT'],'Hashed canon proposals awaiting admission','proposal cannot become canon without governance gate','proposal hash + governance status','proposal is not canonical state'),
 P('SAI Lab','PROVIDER_SYNTHESIS',['CANONICAL_PACKET','RUNTIME_PROOF','PROVIDER_SYNTHESIS'],'Provider/source-backed intelligence behavior and routing','browser cannot silently edit GitHub or promote production','provider state + bounded execution contract','model output is not external evidence'),
 P('Governance','GOVERNANCE_DECISION',['CANONICAL_PACKET','EXACT_EVALUATION','GOVERNANCE_DECISION'],'Admissibility gates, decisions and legal candidate commits','only passing governed commit changes canonical address','gate ledger + candidate receipt','governance UI is not proof without gate result'),
 P('Consolidation','LOCAL_ARTIFACT',['REGISTRY_METADATA','LOCAL_ARTIFACT'],'Non-mutating comparison and consolidation plan','does not alter canon/provider/native state','inventory diff + exported plan','consolidation plan is not applied mutation'),
 P('Instructions','REGISTRY_METADATA',['REGISTRY_METADATA'],'Executable route/effect/authority map','launches bounded route only','registered instruction mapping','instruction text is not capability proof'),
 P('Plugins','REGISTRY_METADATA',['REGISTRY_METADATA','LOCAL_ARTIFACT'],'Integration registry and local configuration only','external connector execution requires separate integration','registry state','registered plugin is not connected/executing service'),
 P('Settings','LOCAL_ARTIFACT',['LOCAL_ARTIFACT'],'Browser-local presentation/layout preferences','presentation settings cannot mutate canon/evidence','local preference state','UI settings are not runtime configuration proof'),
 P('System','RUNTIME_PROOF',['RUNTIME_PROOF','LOCAL_ARTIFACT'],'Returned hosted status, release evidence and browser storage diagnostics','inspection does not promote/deploy','live status/release receipt + local storage state','registered capability is not executing capability'),
 P('Validation','RUNTIME_PROOF',['RUNTIME_PROOF','REGISTRY_METADATA'],'Validation gates and explicit evidence state','validation never fills missing proof by inference','test/probe results','UNVERIFIED may not be displayed as PASS'),
 P('System Atlas','REGISTRY_METADATA',['REGISTRY_METADATA','CANONICAL_PACKET','RUNTIME_PROOF'],'System/family/capability registry plus direct packet truth','route opening follows execution contract','registry status + packet + operational audit','registration is not execution'),
 P('Scale Compiler','DERIVED_MODEL',['CANONICAL_PACKET','EXACT_EVALUATION','DERIVED_MODEL'],'Evaluated recursive compiler-node hierarchy','derived nodes do not create measured scale','compiler inputs/outputs + measured-binding gate','recursive scale representation is not physical measurement',['Optional nested-field renderer']),
 P('Control Matrix','REGISTRY_METADATA',['REGISTRY_METADATA','CANONICAL_PACKET','RUNTIME_PROOF'],'Capability/control registry with direct packet context','control availability follows execution contract','registry + operational audit + packet','control topology is not execution proof')
] as const;

export const PROVENANCE_BY_SURFACE_R94=new Map(OMEGA_SURFACE_PROVENANCE_R94.map(x=>[x.surface,x]));

export const PROVENANCE_LABEL_R94:Record<ProvenanceClassR94,string>={
 RETURNED_EVIDENCE:'RETURNED EVIDENCE',IMPORTED_EVIDENCE:'IMPORTED EVIDENCE',LOCAL_OBSERVATION:'LOCAL OBSERVATION',
 CANONICAL_PACKET:'CANONICAL PACKET',EXACT_EVALUATION:'EXACT EVALUATION',DERIVED_MODEL:'DERIVED MODEL',
 FORECAST_MODEL:'FORECAST MODEL',PROVIDER_SYNTHESIS:'PROVIDER SYNTHESIS',LOCAL_ARTIFACT:'LOCAL ARTIFACT',
 ARCHIVE_EVIDENCE:'ARCHIVE EVIDENCE',RUNTIME_PROOF:'RUNTIME PROOF',DEVICE_PROOF:'DEVICE PROOF',
 REGISTRY_METADATA:'REGISTRY METADATA',GOVERNANCE_DECISION:'GOVERNANCE DECISION',REPRESENTATIONAL:'REPRESENTATIONAL',
 UNAVAILABLE:'UNAVAILABLE'
};

export function provenanceForSurfaceR94(surface:string){
 return PROVENANCE_BY_SURFACE_R94.get(surface)||P(surface,'UNAVAILABLE',[],'No provenance contract is registered.','No action authority.','No proof registered.','Do not infer any capability or truth.');
}

export function provenanceAuditR94(){
 const names=OMEGA_SURFACE_PROVENANCE_R94.map(x=>x.surface),duplicates=names.filter((x,i)=>names.indexOf(x)!==i);
 const representationalPrimary=OMEGA_SURFACE_PROVENANCE_R94.filter(x=>x.primary==='REPRESENTATIONAL').map(x=>x.surface);
 const missingProof=OMEGA_SURFACE_PROVENANCE_R94.filter(x=>!x.proof||!x.forbidden).map(x=>x.surface);
 return{total:names.length,unique:new Set(names).size,duplicates,representationalPrimary,missingProof,pass:names.length===44&&new Set(names).size===44&&duplicates.length===0&&representationalPrimary.length===0&&missingProof.length===0,boundary:'R94 provenance is presentation/runtime truth authority. It classifies what a surface may claim; it does not convert derived, forecast, provider, archive or representational output into observation.'};
}
