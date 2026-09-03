import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R94 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const provenance=read('src/surfaceProvenanceR94.ts');
const surface=read('src/SurfaceIntegrityR81.tsx');
const strip=read('src/SurfaceProvenanceR94.tsx');
const systemAtlas=read('src/SystemAtlasControl.tsx');
const cockpit=read('src/OmegaWorkspaceCockpitR18.tsx');
const earth=read('src/EarthObservatoryR8.tsx');
const r93=read('tests/r93-visual-truth-enforcement-invariants.mjs');
const visual=read('src/VisualCompositorR65.tsx');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const reality=read('src/AppliedRealityLab.tsx');
const infinity=read('src/OmegaInfinityPanel.tsx');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const routes=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const provenanceRows=[...provenance.matchAll(/P\('([^']+)'/g)].map(x=>x[1]);
must(routes.length===44&&new Set(routes).size===44,'canonical route universe must remain 44/44');
must(provenanceRows.length===44&&new Set(provenanceRows).size===44,'provenance authority must contain 44 unique surface contracts');
must(routes.every(x=>provenanceRows.includes(x))&&provenanceRows.every(x=>routes.includes(x)),'provenance contracts must match the canonical route set exactly');
must(provenance.includes("representationalPrimary=OMEGA_SURFACE_PROVENANCE_R94.filter(x=>x.primary==='REPRESENTATIONAL')"),'audit must explicitly reject representational primary truth');
must(provenance.includes('representationalPrimary.length===0'),'R94 audit must fail if any route makes representation primary');
must(provenance.includes('names.length===44&&new Set(names).size===44'),'R94 audit must require 44 unique routes');
for(const cls of ['RETURNED_EVIDENCE','IMPORTED_EVIDENCE','LOCAL_OBSERVATION','CANONICAL_PACKET','EXACT_EVALUATION','DERIVED_MODEL','FORECAST_MODEL','PROVIDER_SYNTHESIS','LOCAL_ARTIFACT','ARCHIVE_EVIDENCE','RUNTIME_PROOF','DEVICE_PROOF','REGISTRY_METADATA','GOVERNANCE_DECISION','REPRESENTATIONAL','UNAVAILABLE'])
 must(provenance.includes("'"+cls+"'"),'missing provenance class '+cls);

must(surface.includes('<SurfaceProvenanceR94 surface={panel}/>'),'every mounted surface must receive provenance authority');
must(surface.includes('data-provenance-primary={provenance.primary}'),'surface root must expose machine-readable primary provenance');
must(strip.includes('FORBIDDEN CLAIM')&&strip.includes('ACTION AUTHORITY')&&strip.includes('OPTIONAL REPRESENTATIONS'),'provenance strip must expose action/proof/forbidden/representation boundaries');

must(systemAtlas.includes("<CanonicalPacketTruthPlotR93 record={record} title={control?'System Control · canonical packet':'System Atlas · canonical packet'}/>"),'System Atlas / Control Matrix must use direct canonical packet truth');
must(!systemAtlas.includes("<CalculusFieldR37 address={activeAddress}"),'System Atlas may not restore generic calculus rendering as active packet truth');

must(cockpit.includes("data-provenance='REPRESENTATIONAL'")&&cockpit.includes('Capability topology · registry-derived representation'),'Cockpit constellation must be explicitly representational and disclosed');
must(!cockpit.includes("<SovereignRuntimeConstellationR62 record={record} onNavigate={route=>void navigate(route)}/></div>"),'Cockpit constellation may not return as an unlabeled always-primary block');

must(earth.includes('Representational calculus comparison'),'Earth derived calculus view must be explicitly named representational');
must(earth.includes("data-provenance='REPRESENTATIONAL'"),'Earth derived calculus comparison must be machine-labeled representational');
must(earth.includes('This is not a second Earth sensor or additional observation source.'),'Earth returned-evidence boundary must remain explicit');

must(r93.includes('CanonicalMembraneR95')&&r93.includes('ModeTruthTraceR93')&&r93.includes('TransitionTruthPlotR93'),'R93/R95 visual-truth gate must remain beneath R94');
must(visual.includes('<ModeTruthTraceR93 address={address} modeId={selectedModeId}/>'),'Visual Instrument actual mode trace must remain');
must(!visual.includes('<ModeExpressionCanvasR82'),'Visual Instrument must not remount seeded mode artwork');
must(modes.includes('<ModeTruthTraceR93 address={address} modeId={selectedModeId}/>'),'Modes must retain evaluated trace display');
must(!reality.includes('synthetic-demo.csv'),'Reality Lab synthetic default must remain removed');
must(infinity.includes('<InfinityTruthPlotR93 record={record} index={index}/>')&&!infinity.includes('<canvas ref={canvas}/>'),'Infinity torus canvas must remain unmounted from production');

const expectedPrimary={
 'Command Center':'PROVIDER_SYNTHESIS','Hybrid Link':'DEVICE_PROOF','Workspace':'LOCAL_ARTIFACT','Cockpit':'RUNTIME_PROOF',
 'Immersive Traversal':'CANONICAL_PACKET','Matter Traversal':'CANONICAL_PACKET','Extreme Traversal':'CANONICAL_PACKET','Visual Instrument':'CANONICAL_PACKET',
 'Relativity':'EXACT_EVALUATION','Earth Now':'RETURNED_EVIDENCE','Forecast':'FORECAST_MODEL','Atlas':'DERIVED_MODEL','Traversal':'CANONICAL_PACKET',
 'Reality Lab':'IMPORTED_EVIDENCE','Infinity':'ARCHIVE_EVIDENCE','Data Motion':'EXACT_EVALUATION','Modes':'EXACT_EVALUATION',
 'System':'RUNTIME_PROOF','System Atlas':'REGISTRY_METADATA','Scale Compiler':'DERIVED_MODEL','Control Matrix':'REGISTRY_METADATA'
};
for(const [name,primary] of Object.entries(expectedPrimary))
 must(provenance.includes("P('"+name+"','"+primary+"'"),name+' provenance must remain '+primary);

must(!provenance.includes("P('Earth Now','REPRESENTATIONAL'"),'Earth primary may not be representational');
must(!provenance.includes("P('Forecast','RETURNED_EVIDENCE'"),'Forecast may never be classified as returned evidence');
must(!provenance.includes("P('Development','RUNTIME_PROOF'"),'browser development planning may not be relabeled as deployed runtime proof');

console.log('R94 PROVENANCE AUTHORITY PASS · 44/44 surfaces classified · representational primary forbidden · R93 visual truth preserved · System Atlas/Cockpit/Earth corrected');
