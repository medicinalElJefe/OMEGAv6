import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R93/R140 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const home=read('src/OmegaHomeR71.tsx');
const command=read('src/OmegaCommandDeck.tsx');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const visual=read('src/VisualCompositorR65.tsx');
const reality=read('src/AppliedRealityLab.tsx');
const forecast=read('src/ForecastSovereignPanel.tsx');
const relativity=read('src/RelativityLab.tsx');
const infinity=read('src/OmegaInfinityPanel.tsx');
const scale=read('src/RecursiveScalePanel.tsx');
const field=read('src/OmegaFieldMotionConvergenceR28.tsx');
const truth=read('src/TruthVisualsR93.tsx');
const legacyMode=read('src/ModeExpressionCanvasR82.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const livingCss=read('src/livingSurfaceR36.css');
const capabilityCss=read('src/capabilityFirstR138.css');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'44/44 canonical routes must remain');

for(const name of ['CanonicalPacketTruthPlotR93','ModeTruthTraceR93','InfinityTruthPlotR93','TransitionTruthPlotR93','ScaleTruthPlotR93'])
 must(truth.includes('function '+name)||truth.includes('export function '+name),'missing truth visual '+name);

must(home.includes('<CanonicalMembraneR95')&&!home.includes('<CalculusFieldR37'),'Home primary display must be the canonical 20,736-cell membrane, not procedural field art');
must(home.includes('primary Home display remains the canonical 20,736-cell membrane'),'Home projection selector must not imply the projection lens owns truth');

must(command.includes("<CanonicalPacketTruthPlotR93 record={record} title='Command Center canonical packet'"),'Command Center must show canonical packet truth plot');
must(command.includes('No runtime visualization before sign-in'),'public launch must not fabricate runtime imagery');
must(!command.includes("<SourceField record={record}/>")&&!command.includes("<SourceField preview/>"),'Command Center/public launch must not mount procedural SourceField');

must(modes.includes('<ModeTruthTraceR93 address={address} modeId={selectedModeId}/>'),'Modes must plot actual evaluated route trace');
must(!modes.includes('<ModeExpressionCanvasR82'),'Modes must not mount name/id-seeded semantic geometry');
must(visual.includes('<ModeTruthTraceR93 address={address} modeId={selectedModeId}/>'),'Visual Instrument MODE lens must be actual trace');
must(!visual.includes('<ModeExpressionCanvasR82'),'Visual Instrument must not mount procedural mode artwork');
must(visual.includes("return x&&['SYNTHESIS','MODE','MOTION'].includes(x)?x:'SYNTHESIS'"),'persisted Visual Instrument must reset derived renderers to truth synthesis');
must(visual.includes('<CanonicalMembraneR95 address={address} onAddress={onAddress}'),'Visual Instrument synthesis must lead with the canonical 20,736-cell membrane');

must(!reality.includes('synthetic-demo.csv')&&reality.includes("No dataset loaded · choose a CSV/TSV"),'Reality Lab must not preload synthetic observations');
must(reality.includes('OMEGA does not preload synthetic observations'),'Reality Lab no-demo policy must be explicit');

must(forecast.indexOf('<ForecastMap plan={plan}')>=0&&forecast.indexOf('<ForecastMap plan={plan}')<forecast.indexOf("<CalculusFieldR37 address={address} mode='FORECAST'"),'Forecast actual corridor plot must precede optional renderer');
must(forecast.includes("className='r93-legacy-renderer'"),'Forecast renderer must be optional/legacy');

must(relativity.indexOf('<DimensionalRelativityPanelR24 record={record}/>')>=0&&relativity.indexOf('<DimensionalRelativityPanelR24 record={record}/>')<relativity.indexOf("<CalculusFieldR37 address={record.address} mode='RELATIVITY'"),'Relativity exact workbook instrument must precede optional renderer');
must(relativity.includes('<TransitionTruthPlotR93 record={record} nextRecord={next}'),'Relativity motion must show packet transition data');

must(infinity.includes('<InfinityTruthPlotR93 record={record} index={index}/>'),'Infinity primary display must be recovered-source trace');
must(!infinity.includes('<canvas ref={canvas}/>'),'Infinity production return must not mount torus canvas');
must(infinity.includes('toroidal particle renderer is retained in source lineage but is no longer mounted'),'Infinity legacy renderer status must be explicit');

must(scale.indexOf('<ScaleTruthPlotR93 nodes={audit.compiler.nodes}/>')>=0&&scale.indexOf('<ScaleTruthPlotR93 nodes={audit.compiler.nodes}/>')<scale.indexOf("<CalculusFieldR37 address={address}"),'Scale Compiler node outputs must precede optional renderer');

must(field.includes('<CanonicalMembraneR95 address={address} onAddress={onAddress}'),'Field must use the canonical 20,736-cell membrane as primary');
must((field.match(/<TransitionTruthPlotR93/g)||[]).length>=2,'Data Motion and Convergence must use direct transition plots');
must(!field.includes("<div className='r28-field-stage r77-field-host'><WovenContinuityFieldR77"),'Field must not mount woven renderer as primary');
must(living.includes('LIVE DATA')&&living.includes("title='Matter Traversal canonical packet'"),'Matter Traversal LIVE view must be direct canonical data');
must(living.includes("view==='LIVE'&&<><OmegaTraversalStudio"),'Traversal LIVE must use the source-driven woven instrument rather than a hidden plot as the primary stage');
must(living.includes("className='r140-live-truth-bridge'")&&living.includes('title={`${variant} · admitted transition`}'),'Traversal must preserve exact admitted-transition truth behind an explicit proof bridge');
must(living.includes("view==='ROUTE'&&<><TransitionTruthPlotR93"),'Traversal ROUTE + PROOF must expose exact transition data directly');
must(livingCss.includes(".r140-live-truth-bridge[open]>.r93-truth-plot.r93-transition{display:grid!important"),'explicitly opened LIVE proof bridge must reveal exact transition geometry');
must(livingCss.includes(".r140-live-truth-bridge:not([open])>.r93-truth-plot{display:none!important"),'closed LIVE proof bridge must not restore chart-first hierarchy');
must(capabilityCss.includes(".r43-workspace-stage[data-view='ROUTE'] .r93-truth-plot.r93-transition{display:grid!important}"),'ROUTE + PROOF must override global plot retirement');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),'deep donor must remain optional and reachable: '+token);

must(legacyMode.includes('switch(expression.family)'),'legacy R82 renderer may remain as preserved donor source');
must(truth.includes('Ring sectors are exact D/P/R/L coordinates · contour radii are exact normalized packet channels'),'packet truth geometry must declare its exact variable mapping');
must(!truth.includes('<rect')&&!truth.includes('Math.random'),'packet truth geometry must not regress to bars or random filler');
must(truth.includes('The application will not fabricate a visual pattern'),'gated/nonnumeric modes must render no fake series');

for(const boundary of [
 'Competing legal futures without pretending to observe the future',
 'observer changes projection, not canonical existence',
 'Derived channels are labeled and missing observations are not invented',
 'not claims of physical velocity or acceleration',
 'not a claim of physical destiny or external causation'
])must([forecast,relativity,reality,field].join('\n').includes(boundary),'truth boundary lost: '+boundary);

console.log('R93/R95/R140 VISUAL TRUTH PASS · canonical manifold + evaluated data preserved · woven traversal promoted without hiding exact proof · no synthetic default data');
