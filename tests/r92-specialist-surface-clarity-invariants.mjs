import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R92 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const css=read('src/specialistSurfaceClarityR92.css');
const reality=read('src/AppliedRealityLab.tsx');
const forecast=read('src/ForecastSovereignPanel.tsx');
const relativity=read('src/RelativityLab.tsx');
const infinity=read('src/OmegaInfinityPanel.tsx');
const atlas=read('src/AtlasViewport.tsx');
const scale=read('src/RecursiveScalePanel.tsx');
const field=read('src/OmegaFieldMotionConvergenceR28.tsx');
const archive=read('src/ArchiveGovernanceControl.tsx');
const restore=read('src/ExtremeRestorationR46.tsx');
const r90=read('src/surfaceHierarchyR90.css');
const r91=read('src/operationalSurfaceRefinementR91.css');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical surface universe must remain 44/44');
must(workstation.includes("import './specialistSurfaceClarityR92.css';"),'R92 stylesheet must be mounted');
must(workstation.indexOf('specialistSurfaceClarityR92.css')>workstation.indexOf('operationalSurfaceRefinementR91.css'),'R92 must load after R91');
must(workstation.includes("'Reality Lab','Field','Data Motion','Convergence'"),'Reality Lab must join explicit visual-first authority');

for(const panel of ['Forecast','Relativity','Infinity','Atlas','Scale Compiler','Reality Lab','Field','Data Motion','Convergence','Archive Census','Archive Operators'])
 must(css.includes("data-panel='"+panel+"'"),'missing specialist clarity coverage for '+panel);

must(infinity.includes('<InfinityTruthPlotR93 record={record} index={index}/>')&&!infinity.includes('<canvas ref={canvas}/>'),'Infinity must use recovered-source truth plot instead of mounted torus canvas');
must(css.includes(".atlas-r36-stage canvas{\n  height:72dvh!important"),'Atlas mobile canvas must own the visual viewport');
must(forecast.indexOf('<ForecastMap plan={plan}')>=0&&forecast.indexOf('<ForecastMap plan={plan}')<forecast.indexOf("<CalculusFieldR37 address={address} mode='FORECAST'"),'Forecast computed corridor map must be primary');
must(css.includes(".rel-tabs{\n  position:sticky!important")&&css.includes(".rel36-observer{\n  display:flex!important")&&relativity.indexOf('<DimensionalRelativityPanelR24 record={record}/>')<relativity.indexOf("<CalculusFieldR37 address={record.address} mode='RELATIVITY'"),'Relativity exact formula instrument must lead optional renderer');
must(scale.indexOf('<ScaleTruthPlotR93 nodes={audit.compiler.nodes}/>')>=0&&scale.indexOf('<ScaleTruthPlotR93 nodes={audit.compiler.nodes}/>')<scale.indexOf("<CalculusFieldR37 address={address}"),'Scale Compiler evaluated node outputs must be primary');
must(reality.includes("data-analysis={analysis?'ready':'empty'}"),'Reality Lab must expose analysis readiness');
must(css.includes(".rl36[data-analysis='empty'] .rl36-input{order:0!important}")&&css.includes(".rl36[data-analysis='ready'] .rl36-stage{order:0!important"),'Reality Lab must switch mobile priority only after analysis exists');
must(css.includes(".r28-field-readout,")&&css.includes(".r28-convergence-summary{\n  display:flex!important"),'Field/Motion/Convergence telemetry must remain reachable without a card wall');
must(css.includes(".archive-summary{\n  display:flex!important")&&css.includes(".forensic-donor-grid{\n  grid-template-columns:1fr!important"),'Archive mobile census must be scan-first');
must(css.includes(".r46-family-status{\n  display:flex!important")&&css.includes(".r46-tabs{\n  position:sticky!important"),'Embedded restoration executor controls must stay reachable');

must(!css.includes('.boundary{display:none')&&!css.includes('.special-boundary{display:none')&&!css.includes('.r46-overlay-boundary{display:none'),'R92 may not hide truth boundaries');
must(css.includes(".boundary,.special-boundary,.earth-proof,.sai-footer,.sbm21-expression-boundary,.r46-overlay-boundary")&&css.includes('visibility:visible!important'),'R92 must explicitly preserve boundary visibility');
must(forecast.includes('Competing legal futures without pretending to observe the future'),'Forecast future-observation boundary must remain');
must(relativity.includes('observer changes projection, not canonical existence')&&relativity.includes('do not rewrite the canonical packet'),'Relativity projection/canonical separation must remain');
must(infinity.includes('derived live-packet projection · NOT WORKBOOK OBSERVATION'),'Infinity source/projection separation must remain');
must(scale.includes('measured scale binding')&&scale.includes('audit.compiler.boundary'),'Scale Compiler measured-binding gate must remain');
must(reality.includes('Derived channels are labeled and missing observations are not invented.'),'Reality Lab missing-observation boundary must remain');
must(field.includes('not claims of physical velocity or acceleration')&&field.includes('not a claim of physical destiny or external causation'),'Motion/Convergence physical-claim boundaries must remain');
must(archive.includes('This is not a live enumeration of every Drive file.'),'Archive census scope boundary must remain');
must(restore.includes('None of these promote device/native execution without proof.'),'Restoration native-execution boundary must remain');
must(r90.includes('presentation-only hierarchy')&&r91.includes('operational surface refinement'),'R90/R91 integrity layers must remain beneath R92');
must(!css.includes('@appdeploy/client'),'R92 must remain provider portable');
console.log('R92 SPECIALIST SURFACE CLARITY PASS · 44 routes · distinct specialist surfaces clarified · visual obstruction reduced · truth boundaries preserved');
