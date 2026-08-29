export const OMEGA_VIEW_LENSES=['FIELD','SURFACE','SKIN','GRAPH','ASSEMBLY','MATERIAL','EVIDENCE','CANON','TRAVERSAL'] as const;
export type OmegaViewLens=typeof OMEGA_VIEW_LENSES[number];
export type CapabilityImplementation='INLINE'|'SPECIALIST'|'SHARED_SUITE';
export type CapabilityBoundary='SOURCE_PACKET'|'EVIDENCE_BOUND'|'DEVICE_PROOF'|'PROVIDER_BOUND'|'LOCAL_ARTIFACT';
export type CapabilityContract={name:string;family:string;implementation:CapabilityImplementation;views:readonly OmegaViewLens[];boundary:CapabilityBoundary;purpose:string};
const V=(...x:OmegaViewLens[])=>x;
export const OMEGA_CAPABILITY_AUTHORITY:readonly CapabilityContract[]=[
{name:'Command Center',family:'AI Cockpit',implementation:'INLINE',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'orient, route, converse and dispatch from the current packet'},
{name:'Hybrid Link',family:'Hybrid Link',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE'),boundary:'DEVICE_PROOF',purpose:'proof-gated host and device operations'},
{name:'Workspace',family:'Atlas OS',implementation:'SHARED_SUITE',views:V('ASSEMBLY','GRAPH'),boundary:'LOCAL_ARTIFACT',purpose:'persistent working state and project context'},
{name:'Cockpit',family:'AI Cockpit',implementation:'SHARED_SUITE',views:V('FIELD','GRAPH','EVIDENCE'),boundary:'SOURCE_PACKET',purpose:'operator overview over state, routes and runtime health'},
{name:'Immersive Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','SURFACE','SKIN','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'observer movement through admitted state geometry'},
{name:'Matter Traversal',family:'Reality Compiler',implementation:'SPECIALIST',views:V('SURFACE','SKIN','MATERIAL','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'packet-derived matter representations across scale'},
{name:'Extreme Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'high-depth traversal through one state manifold'},
{name:'Visual Instrument',family:'Field Renderer',implementation:'SPECIALIST',views:V('FIELD','SURFACE','SKIN','GRAPH','MATERIAL','EVIDENCE','CANON','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'render continuity, scar, burden, contradiction, evidence and motion'},
{name:'Relativity',family:'Observer / Now',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'observer-frame and representation transforms'},
{name:'Earth Now',family:'Earth',implementation:'SPECIALIST',views:V('SURFACE','GRAPH','EVIDENCE','TRAVERSAL'),boundary:'EVIDENCE_BOUND',purpose:'evidence-gated WGS84 Earth traversal'},
{name:'Forecast',family:'Dewey',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'admissible future motion with uncertainty'},
{name:'Atlas',family:'Atlas Generator',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'address and traverse the canonical atlas'},
{name:'Traversal',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'general state-manifold traversal'},
{name:'Create',family:'Reality Compiler',implementation:'INLINE',views:V('ASSEMBLY','MATERIAL','CANON'),boundary:'LOCAL_ARTIFACT',purpose:'seed, translate, build and prove outputs'},
{name:'Field',family:'Living Membrane',implementation:'SHARED_SUITE',views:V('FIELD','SKIN','GRAPH'),boundary:'SOURCE_PACKET',purpose:'continuity and pressure field inspection'},
{name:'Data Motion',family:'Persistent Packet',implementation:'SHARED_SUITE',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'derivatives, routes and motion channels'},
{name:'Reality Lab',family:'Reality Compiler',implementation:'SPECIALIST',views:V('FIELD','GRAPH','ASSEMBLY','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'map imported evidence into packet channels'},
{name:'Atlas Calculator',family:'Atlas Generator',implementation:'SPECIALIST',views:V('GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'address and relation transforms'},
{name:'Infinity',family:'Persistent Packet',implementation:'SPECIALIST',views:V('FIELD','GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'recursive lawful scale relationships'},
{name:'Convergence',family:'Living Membrane',implementation:'SHARED_SUITE',views:V('FIELD','GRAPH','EVIDENCE'),boundary:'SOURCE_PACKET',purpose:'compare routes toward coherent closure'},
{name:'Quality Compiler',family:'Proof / Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'compile invariant and quality evidence'},
{name:'Build Out',family:'Recovery / Packaging',implementation:'SPECIALIST',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'restore, integrate, test and package'},
{name:'Projects',family:'Atlas OS',implementation:'SHARED_SUITE',views:V('ASSEMBLY','GRAPH'),boundary:'LOCAL_ARTIFACT',purpose:'persist and organize project work'},
{name:'Render Queue',family:'Rendering / Media',implementation:'SHARED_SUITE',views:V('ASSEMBLY','MATERIAL','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'queue deterministic render artifacts'},
{name:'Assets',family:'Control Planes',implementation:'SHARED_SUITE',views:V('ASSEMBLY','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'ingest donor metadata before admission'},
{name:'Modes',family:'Dewey / Mode188',implementation:'INLINE',views:V('GRAPH','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'inspect all registered mode evaluations'},
{name:'Kernel Intelligence',family:'AI Cockpit',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'inspect sovereign intelligence routing'},
{name:'Evidence & Proof',family:'Proof Ledger',implementation:'SHARED_SUITE',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'inspect provenance, hashes and proof'},
{name:'Memory',family:'Persistent Packet',implementation:'SHARED_SUITE',views:V('GRAPH','SKIN','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'retain packet/project memory and scar continuity'},
{name:'Archive Census',family:'Artifact Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'inventory and classify donor lineage'},
{name:'Archive Operators',family:'Artifact Governance',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'operate restoration admission decisions'},
{name:'Development',family:'Recovery / Packaging',implementation:'INLINE',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'restore and surpass through tested builds'},
{name:'Canon Evolution',family:'CanonForge',implementation:'SHARED_SUITE',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'propose and gate constitutional refinements'},
{name:'SAI Lab',family:'AI Cockpit',implementation:'SPECIALIST',views:V('FIELD','GRAPH','EVIDENCE','CANON'),boundary:'PROVIDER_BOUND',purpose:'develop intelligence behavior against packet authority'},
{name:'Governance',family:'CanonForge',implementation:'SHARED_SUITE',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'admit or hold runtime transitions'},
{name:'Consolidation',family:'Recovery / Packaging',implementation:'SHARED_SUITE',views:V('ASSEMBLY','GRAPH','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'merge compatible capabilities without omission'},
{name:'Instructions',family:'Universal Language',implementation:'SHARED_SUITE',views:V('GRAPH','CANON'),boundary:'SOURCE_PACKET',purpose:'inspect semantic and operator paths'},
{name:'Plugins',family:'Atlas OS',implementation:'SHARED_SUITE',views:V('ASSEMBLY','EVIDENCE'),boundary:'LOCAL_ARTIFACT',purpose:'inspect available integration surfaces'},
{name:'Settings',family:'Atlas OS',implementation:'SHARED_SUITE',views:V('ASSEMBLY'),boundary:'LOCAL_ARTIFACT',purpose:'configure local presentation/runtime preferences'},
{name:'System',family:'Atlas OS',implementation:'SHARED_SUITE',views:V('GRAPH','EVIDENCE'),boundary:'EVIDENCE_BOUND',purpose:'inspect bounded runtime state'},
{name:'Validation',family:'Proof / Governance',implementation:'SPECIALIST',views:V('GRAPH','EVIDENCE','CANON'),boundary:'EVIDENCE_BOUND',purpose:'run and expose validation gates'},
{name:'System Atlas',family:'Control Planes',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','CANON'),boundary:'SOURCE_PACKET',purpose:'map families, routes and expression capability'},
{name:'Scale Compiler',family:'Traversal / Domain',implementation:'SPECIALIST',views:V('FIELD','GRAPH','TRAVERSAL'),boundary:'SOURCE_PACKET',purpose:'compile lawful recursive scale relationships'},
{name:'Control Matrix',family:'Control Planes',implementation:'SPECIALIST',views:V('GRAPH','ASSEMBLY','EVIDENCE','CANON'),boundary:'SOURCE_PACKET',purpose:'inspect capability/control topology'}
] as const;
export const CAPABILITY_BY_NAME=new Map(OMEGA_CAPABILITY_AUTHORITY.map(x=>[x.name,x]));
export const SHARED_SUITE_DEBT=OMEGA_CAPABILITY_AUTHORITY.filter(x=>x.implementation==='SHARED_SUITE');
export const CAPABILITY_BOUNDARY='View lenses are alternate presentations/inspections of the same authoritative packet. A lens does not create new evidence, a new physical dimension, or an independent state authority.';
