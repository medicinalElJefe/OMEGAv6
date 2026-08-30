export const OMEGA_VIEW_LENSES=['FIELD','SURFACE','SKIN','GRAPH','ASSEMBLY','MATERIAL','EVIDENCE','CANON','TRAVERSAL'] as const;
export type OmegaViewLens=typeof OMEGA_VIEW_LENSES[number];
export type CapabilityImplementation='INLINE'|'SPECIALIST'|'SHARED_SUITE';
export type CapabilityBoundary='SOURCE_PACKET'|'EVIDENCE_BOUND'|'DEVICE_PROOF'|'PROVIDER_BOUND'|'LOCAL_ARTIFACT';
export type CapabilityReality='RUNTIME_ACTIVE'|'SOURCE_ACTIVE'|'LOCAL_ACTIVE'|'EVIDENCE_GATED'|'DEVICE_GATED'|'PROVIDER_GATED'|'RESTORATION_DEBT'|'DONOR_ONLY';
export type CapabilityContract={name:string;family:string;implementation:CapabilityImplementation;views:readonly OmegaViewLens[];boundary:CapabilityBoundary;purpose:string};
const V=(...x:OmegaViewLens[])=>x;
export const OMEGA_CAPABILITY_AUTHORITY:readonly CapabilityContract[]=[
{name:'Command Center',family:'AI Cockpit',implementation:'INLINE',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'orient, route, converse and dispatch from the current packet'},
{name:'Hybrid Link',family:'Hybrid Link',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE'),boundary:'DEVICE_PROOF',purpose:'proof-gated host and device operations'},
{name:'Workspace',family:'Atlas OS',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'persistent packet snapshots, replay points and project continuity'},
{name:'Cockpit',family:'AI Cockpit',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'operator state, runtime proof, capability debt and transaction control'},
{name:'Immersive Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','SURFACE','SKIN','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'continuous field embodiment with living calculus, signal, deep studio and admitted route controls'},
{name:'Matter Traversal',family:'Reality Compiler',implementation:'SPECIALIST',views:V('SURFACE','SKIN','MATERIAL','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'packet-derived matter representations across scale'},
{name:'Extreme Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'high-rate route enactment with source-bound field, signal, proof and restored studio controls'},
{name:'Visual Instrument',family:'Field Renderer',implementation:'SPECIALIST',views:V('FIELD','SURFACE','SKIN','GRAPH','MATERIAL','EVIDENCE','CANON','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'render continuity, scar, burden, contradiction, evidence and motion'},
{name:'Relativity',family:'Observer / Now',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'observer-frame and representation transforms'},
{name:'Earth Now',family:'Earth',implementation:'SPECIALIST',views:V('SURFACE','GRAPH','EVIDENCE','TRAVERSAL'),boundary:'EVIDENCE_BOUND',purpose:'evidence-gated WGS84 Earth traversal'},
{name:'Forecast',family:'Dewey',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'admissible future motion with uncertainty'},
{name:'Atlas',family:'Atlas Generator',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'address and traverse the canonical atlas'},
{name:'Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'canonical state-manifold traversal with source and explicitly derived route operators'},
{name:'Create',family:'Reality Compiler',implementation:'INLINE',views:V('ASSEMBLY','MATERIAL','CANON'),boundary:'LOCAL_ARTIFACT',purpose:'seed, translate, build and prove outputs'},
{name:'Field',family:'Living Membrane',implementation:'SPECIALIST',views:V('FIELD','SKIN','GRAPH'),boundary:'SOURCE_PACKET',purpose:'continuity and pressure field inspection'},
{name:'Data Motion',family:'Persistent Packet',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'derivatives, routes and motion channels'},
{name:'Reality Lab',family:'Reality Compiler',implementation:'SPECIALIST',views:V('FIELD','GRAPH','ASSEMBLY','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'map imported evidence into packet channels'},
{name:'Atlas Calculator',family:'Atlas Generator',implementation:'SPECIALIST',views:V('GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'address and relation transforms'},
{name:'Infinity',family:'Persistent Packet',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'recursive lawful scale relationships'},
{name:'Convergence',family:'Living Membrane',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE'),boundary:'SOURCE_PACKET',purpose:'compare routes toward coherent closure'},
{name:'Quality Compiler',family:'Proof / Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'compile invariant and quality evidence'},
{name:'Build Out',family:'Recovery / Packaging',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'export a compressed sovereign runtime seed, inspect governed build receipts and coordinate external source/test/package authority'},
{name:'Projects',family:'Atlas OS',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH'),boundary:'LOCAL_ARTIFACT',purpose:'persist and organize state-bound project work with replay/export continuity'},
{name:'Render Queue',family:'Rendering / Media',implementation:'SPECIALIST',views:V('ASSEMBLY','MATERIAL','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'generate source-packet SVG/PNG/JSON artifacts in-browser; GPU image/video production is not claimed'},
{name:'Assets',family:'Control Planes',implementation:'SPECIALIST',views:V('ASSEMBLY','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'hash actual browser-selected asset bytes and retain local manifests without automatic admission'},
{name:'Modes',family:'Dewey / Mode188',implementation:'INLINE',views:V('GRAPH','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'inspect source-backed executable formulas, packet channels and gated catalog entries'},
{name:'Kernel Intelligence',family:'AI Cockpit',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'inspect sovereign intelligence routing'},
{name:'Evidence & Proof',family:'Proof Ledger',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'inspect provenance, hashes and proof'},
{name:'Memory',family:'Persistent Packet',implementation:'SPECIALIST',views:V('GRAPH','SKIN','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'retain browser-local packet/project memory and scar continuity'},
{name:'Archive Census',family:'Artifact Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'inventory and classify donor lineage'},
{name:'Archive Operators',family:'Artifact Governance',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'operate restoration admission decisions'},
{name:'Development',family:'Recovery / Packaging',implementation:'INLINE',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'PROVIDER_BOUND',purpose:'provider-assisted development planning and continuity; repository mutation and promotion occur only through the governed external build path'},
{name:'Canon Evolution',family:'CanonForge',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'create immutable hashed canon proposals that require separate governance admission'},
{name:'SAI Lab',family:'AI Cockpit',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'develop intelligence behavior against packet authority'},
{name:'Governance',family:'CanonForge',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'evaluate admitted-route gates, record decisions and commit only legal canonical candidates'},
{name:'Consolidation',family:'Recovery / Packaging',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'compare navigation/capability authority, expose remaining debt and export non-mutating consolidation plans'},
{name:'Instructions',family:'Universal Language',implementation:'SPECIALIST',views:V('GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'search the shared executable route/effect/authority map and launch operational capabilities'},
{name:'Plugins',family:'Atlas OS',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH','EVIDENCE','CANON'),boundary:'LOCAL_ARTIFACT',purpose:'test hosted adapters, fingerprint local data, compile deterministic lexicon routes and inspect donor bridges'},
{name:'Settings',family:'Atlas OS',implementation:'SPECIALIST',views:V('ASSEMBLY'),boundary:'LOCAL_ARTIFACT',purpose:'configure consumed browser-local layout, density, motion, contrast and text scale'},
{name:'System',family:'Atlas OS',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'inspect live hosted status, release evidence, package receipt, capability debt and browser storage'},
{name:'Validation',family:'Proof / Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'run and expose validation gates'},
{name:'System Atlas',family:'Control Planes',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','CANON'),boundary:'SOURCE_PACKET',purpose:'map families, routes and expression capability'},
{name:'Scale Compiler',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'compile lawful recursive scale relationships'},
{name:'Control Matrix',family:'Control Planes',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'inspect capability/control topology'}
] as const;
export const CAPABILITY_BY_NAME=new Map(OMEGA_CAPABILITY_AUTHORITY.map(x=>[x.name,x]));
export const SHARED_SUITE_DEBT=OMEGA_CAPABILITY_AUTHORITY.filter(x=>x.implementation==='SHARED_SUITE');
const REALITY_OVERRIDES:Record<string,CapabilityReality>={
 'Command Center':'PROVIDER_GATED','Hybrid Link':'DEVICE_GATED','Workspace':'LOCAL_ACTIVE','Cockpit':'EVIDENCE_GATED','Immersive Traversal':'SOURCE_ACTIVE','Extreme Traversal':'SOURCE_ACTIVE','Earth Now':'EVIDENCE_GATED','Reality Lab':'EVIDENCE_GATED','Quality Compiler':'EVIDENCE_GATED','Evidence & Proof':'EVIDENCE_GATED','Archive Census':'EVIDENCE_GATED','Archive Operators':'EVIDENCE_GATED','Canon Evolution':'EVIDENCE_GATED','Governance':'EVIDENCE_GATED','Validation':'EVIDENCE_GATED','Kernel Intelligence':'PROVIDER_GATED','SAI Lab':'PROVIDER_GATED',
 'Create':'LOCAL_ACTIVE','Build Out':'LOCAL_ACTIVE','Projects':'LOCAL_ACTIVE','Render Queue':'LOCAL_ACTIVE','Assets':'LOCAL_ACTIVE','Memory':'LOCAL_ACTIVE','Development':'PROVIDER_GATED','Settings':'LOCAL_ACTIVE','System':'EVIDENCE_GATED','Consolidation':'LOCAL_ACTIVE',
 'Plugins':'LOCAL_ACTIVE'
};
export function capabilityReality(name:string):CapabilityReality{const c=CAPABILITY_BY_NAME.get(name);if(!c)return 'RESTORATION_DEBT';if(REALITY_OVERRIDES[name])return REALITY_OVERRIDES[name];return c.boundary==='SOURCE_PACKET'?'SOURCE_ACTIVE':c.boundary==='DEVICE_PROOF'?'DEVICE_GATED':c.boundary==='PROVIDER_BOUND'?'PROVIDER_GATED':c.boundary==='EVIDENCE_BOUND'?'EVIDENCE_GATED':'LOCAL_ACTIVE'}
export function isPrimaryOperationalCapability(name:string){const r=capabilityReality(name);return r!=='DONOR_ONLY'&&r!=='RESTORATION_DEBT'}
export const CAPABILITY_REALITY_LABEL:Record<CapabilityReality,string>={RUNTIME_ACTIVE:'LIVE',SOURCE_ACTIVE:'SOURCE',LOCAL_ACTIVE:'LOCAL',EVIDENCE_GATED:'EVIDENCE',DEVICE_GATED:'DEVICE',PROVIDER_GATED:'PROVIDER',RESTORATION_DEBT:'RESTORE',DONOR_ONLY:'DONOR'};
export const CAPABILITY_BOUNDARY='View lenses are alternate presentations/inspections of the same authoritative packet. A lens does not create new evidence, a new physical dimension, or an independent state authority. All 44 workstation surfaces are routable, while source, local, evidence, device and provider boundaries remain explicit; native targets and unresolved System Atlas families are never promoted by a menu label.';
