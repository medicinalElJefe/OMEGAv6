export const DRIVE_CANON_SOURCE=Object.freeze({
  authority:'Google Drive LATEST_OMEGA_UPDATE.json -> B015 R1',
  donor:'OMEGA_FULL_CANON_VALIDATION_WORKSTATION_v21.zip',
  donorDriveFileId:'1yDFcTO9_f2sdmGC-INRpV-LMQb1n4E_v',
  runtimeWorkbook:'Mode188_Unified_Runtime_20736D_SYNCED.xlsx',
  runtimeWorkbookDriveFileId:'1Q9hKgW6R7jxzDFnGoaj0BokJAHixp5OU',
  states:20736,
  baseStates:1728,
  domains:12,
  phases:12,
  regulations:12,
  seedLevels:12,
  muDimensions:41,
  motionFrames:288,
  mathAnchors:200,
  rhAnchors:320,
  graphEdges:416,
  couplingEdges:10368,
  workbookCount:42,
  archiveFiles:134,
  sourceSheets:['Runtime_Control','Domains','Phases','Regulations','Seed_Expansion','Source_Catalog','Workbook_Catalog','Host_Profiles','Atlas_1728_Base','Atlas_20736_Runtime','Coverage_Summary','Runtime_Instructions','Runtime_DB_Snapshot','Runtime_Proof','Runtime_Basin','Runtime_Observations'],
  csvGeometrySources:['144D_spectral_table.csv','state_coordinates.csv','coupling_edges.csv','simplex_projection.csv'],
  canonSources:['Math_Atlas_20736D_FullCanon_GraphEdges.xlsx','Math_Atlas_20736D_RH_Dashboard.xlsx','Math_Atlas_20736D_MuPacket.xlsx','RH_Seeding_Anchors.xlsx','Math_Seeding_Anchors.xlsx','FULL_SPHERE_Overleaf_Zenodo.zip'],
  motionChannels:['continuity','construct','prune','scar','contradiction','plasticity','water','motion'],
  equations:{
    state:'S(D,P,R,L)',
    antipode:'A(S)=S(D⊕6,13-P,13-R,L⊕6)',
    assembly:'X(t)=X0+Construct-Prune+Flow+Scar+AntipodeMix',
    continuityGate:'CΩ/(1+Λ+q)',
    constructPrune:'ΔF=K-P',
    scarMemory:'Σ(t+1)=ρΣ(t)+(1-ρ)|Δstate|',
    motionDrive:'M=|dC/dt|+|dΦ/dt|+|dΣ/dt|',
    canonGate:'R<=5 => redistribute before optimize'
  },
  controls:{Gamma_LambdaQ:.35,Epsilon:.05,Stay_Threshold:1.05,Turn_Threshold:.9,Escalate_Threshold:.75,Adjacency_Weight:.12,Congruence_Weight:.18},
  proofSnapshot:{atlasRows:20736,avgContinuity:1.337719165900511,avgLedger:.1138127922913544,avgContradiction:.03701020541169425,avgRatio:9.57031183284858},
  boundary:'Drive-derived canon/runtime metadata is embedded as a source contract. The browser renderer is a representational instrument; physical claims remain measurement-gated.'
} as const);

export const DRIVE_DOMAINS=['Structure','Motion','Boundary','Coupling','Memory','Constraint','Translation','Scale','Evidence','Prediction','Agency','Closure'] as const;
export const DRIVE_PHASES=['Initiation','Acceleration','Expansion','Momentum','Saturation','Constraint Engagement','Deceleration','Release','Reorganization','Integration','Stabilization','Return'] as const;
export const DRIVE_REGULATIONS=['Observe','Measure','Stabilize','Amplify','Dampen','Redistribute','Prune','Translate','Test','Escalate','Integrate','Close'] as const;
export const DRIVE_SEEDS=['Seed','Bias','Coupling','Propagation','Branching','Load','Contradiction','Prune','Translation','Integration','Proof','Return'] as const;
