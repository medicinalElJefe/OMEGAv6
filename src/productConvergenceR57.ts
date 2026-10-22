export type R57WorkspaceId='COMMAND'|'WORK'|'HYBRID'|'REALITY'|'EARTH'|'VISUAL'|'INTELLIGENCE'|'EVIDENCE'|'BUILD'|'SYSTEM';

export type R57Workspace={
 id:R57WorkspaceId;
 label:string;
 panel:string;
 description:string;
 tools:readonly string[];
};

export const R57_WORKSPACES:readonly R57Workspace[]=[
 {id:'COMMAND',label:'Command',panel:'Command Center',description:'Ask, reason, route, act and continue from the active packet.',tools:['Command Center']},
 {id:'WORK',label:'Workspace',panel:'Workspace',description:'Persistent working context, cockpit state and active project continuity.',tools:['Workspace','Cockpit']},
 {id:'HYBRID',label:'Hybrid',panel:'Hybrid Link',description:'Authorized host pairing, execution handoff and returned device proof.',tools:['Hybrid Link']},
 {id:'REALITY',label:'Reality',panel:'Matter Traversal',description:'Matter, scale, traversal, relativity, atlas and applied-reality instruments.',tools:['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Relativity','Atlas','Atlas Calculator','Infinity','Scale Compiler','Reality Lab']},
 {id:'EARTH',label:'Earth + Forecast',panel:'Earth Now',description:'Evidence-gated Earth context and bounded forecasting.',tools:['Earth Now','Forecast']},
 {id:'VISUAL',label:'Visual Field',panel:'Visual Instrument',description:'State-bound rendering, field motion, data motion and convergence views.',tools:['Visual Instrument','Field','Data Motion','Convergence']},
 {id:'INTELLIGENCE',label:'Intelligence',panel:'SAI Lab',description:'Source-backed modes, kernel intelligence, memory and canon evolution.',tools:['SAI Lab','Modes','Kernel Intelligence','Memory','Canon Evolution']},
 {id:'EVIDENCE',label:'Evidence + Archive',panel:'Evidence & Proof',description:'Proof, quality, archive census, governance and validation.',tools:['Evidence & Proof','Quality Compiler','Archive Census','Archive Operators','Governance','Validation']},
 {id:'BUILD',label:'Create + Build',panel:'Development',description:'Creation, development, build-out, projects, assets and render work.',tools:['Development','Create','Build Out','Projects','Render Queue','Assets']},
 {id:'SYSTEM',label:'System',panel:'System Atlas',description:'System Atlas, control, settings, instructions, plugins and consolidation.',tools:['System Atlas','Control Matrix','System','Settings','Instructions','Plugins','Consolidation']}
] as const;

export const R57_REGISTERED_SURFACES=R57_WORKSPACES.flatMap(x=>x.tools);

const CANONICAL_BY_TOOL=new Map<string,string>();
for(const workspace of R57_WORKSPACES)for(const tool of workspace.tools)CANONICAL_BY_TOOL.set(tool,workspace.panel);

export function r57WorkspaceForSurface(surface:string){return R57_WORKSPACES.find(x=>x.tools.includes(surface))||R57_WORKSPACES[9]}
export function r57CanonicalSurface(surface:string){return CANONICAL_BY_TOOL.get(surface)||surface}
export function r57IsPrimarySurface(surface:string){return R57_WORKSPACES.some(x=>x.panel===surface)}

// Historical routes remain valid lineage addresses. The product shell no longer presents
// thin variants as peer applications. A workspace may still expose a specialist internally.
export const R57_CONSOLIDATION_TRUTH={
 registeredHistoricalSurfaces:44,
 canonicalWorkspaces:R57_WORKSPACES.length,
 rule:'Historical route names are preserved for compatibility; primary navigation exposes complete workspaces, not duplicate panel labels.',
 noCapabilityDeletion:true
} as const;
