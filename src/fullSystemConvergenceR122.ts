export type R122ModuleDecision='LEDGER'|'TURN'|'ESCALATE';
export type R122BuildLayer={id:string;name:string;invariant:string;role:string;decision:R122ModuleDecision};

/* Archive-locked module fabric from the 61,917,364,224-address engineering chart.
   These are software/model responsibilities, not literal physical dimensions. */
export const R122_BUILD_LAYERS:R122BuildLayer[]=[
 {id:'M00',name:'Reality Substrate Core',invariant:'ONE_FIELD_ONE_PACKET_TYPE',role:'continuous packet substrate',decision:'LEDGER'},
 {id:'M01',name:'Persistent Packet Model',invariant:'STATE_PACKET_MEMORY',role:'continuity · burden · contradiction · phase · scar · child seed',decision:'LEDGER'},
 {id:'M02',name:'Recursive Scale Compiler',invariant:'PACKET_TO_CHILD_FIELD',role:'whole/part unfolding without scene replacement',decision:'ESCALATE'},
 {id:'M03',name:'Observer Now Frame',invariant:'RELATIVE_ANCHOR',role:'moving local coordinate frame',decision:'TURN'},
 {id:'M04',name:'Traversal Kernel',invariant:'NO_SCENE_SWITCHING',role:'identity-preserving macro/micro traversal',decision:'ESCALATE'},
 {id:'M05',name:'LOD / Octree / Sparse Field',invariant:'MEMORY_FOLDING',role:'seed-chain reconstruction and sparse detail',decision:'ESCALATE'},
 {id:'M06',name:'GPU Runtime Target',invariant:'WEBGPU_VULKAN_COMPUTE',role:'compute buffers · accumulation · raymarch hooks',decision:'TURN'},
 {id:'M07',name:'Cinematic Field Renderer',invariant:'SNAPSHOT_OF_FIELD',role:'visual slice of the same traversal field',decision:'TURN'},
 {id:'M08',name:'Design / Style Modes',invariant:'STYLE_AS_VIEW_LENS',role:'lens changes without truth-core mutation',decision:'ESCALATE'},
 {id:'M09',name:'Earth Evidence Layer',invariant:'WGS84_GIS_GATE',role:'geodesy and source-bounded Earth evidence',decision:'TURN'},
 {id:'M10',name:'Biology Runtime',invariant:'BODY_TO_CELL_TO_ATOM',role:'scale-relative biological interpretation',decision:'TURN'},
 {id:'M11',name:'Cosmic Runtime',invariant:'SPACE_TO_GALAXY',role:'scale-relative cosmic interpretation',decision:'LEDGER'},
 {id:'M12',name:'Proof / Ledger / Mode188',invariant:'ADMISSIBILITY_GATE',role:'continuity · burden · contradiction · evidence · decision',decision:'TURN'},
 {id:'M13',name:'Packaging / Installer',invariant:'ONE_CLICK_RUNTIME',role:'repair · package · checksum · export',decision:'TURN'},
 {id:'M14',name:'Data Ingestion Adapters',invariant:'REAL_DATA_BOUNDARY',role:'GIS · DEM · OSM · LiDAR · microscopy · astronomy · sensors',decision:'LEDGER'},
 {id:'M15',name:'Testing / Forensics',invariant:'TRUTH_VERIFICATION',role:'smoke · hash · route · regression · evidence proof',decision:'LEDGER'}
];

export const R122_DEPENDENCY_SPINE=[
 'Genesis','Runtime Bootstrap','Authority Registry','Capability Registry',
 'Scheduler','Scene','Traversal','Renderer','Workspace','Desktop','Validation','Installer'
] as const;

export const R122_FEDERATION_CHAIN=['OMEGAv6 ADMIT','Genesis PROPOSE','Optical SCREEN','Sovereign SOLVE','proof receipt','OMEGAv6 REPLAY'] as const;
export const R122_CONTINUITY_LAW='ONE FIELD / ONE PACKET / ONE CONTINUITY LAW / ONE TRAVERSAL SYSTEM';

export function moduleSignalR122(metrics:{continuity?:number;plasticity?:number;contradiction?:number;burden?:number},index:number,time=0){
 const c=Math.max(0,Math.min(1,Number(metrics.continuity)||0));
 const p=Math.max(0,Math.min(1,Number(metrics.plasticity)||0));
 const q=Math.max(0,Math.min(1,Number(metrics.contradiction)||0));
 const b=Math.max(0,Math.min(1,Number(metrics.burden)||0));
 const layer=R122_BUILD_LAYERS[index%R122_BUILD_LAYERS.length];
 const decisionBias=layer.decision==='ESCALATE'?.12:layer.decision==='TURN'?.06:0;
 const phase=.5+.5*Math.sin(time*.22+index*Math.PI/8+p*Math.PI*2);
 return Math.max(.08,Math.min(1,.22+.46*c+.19*p+.11*phase+decisionBias-.24*q-.16*b));
}
