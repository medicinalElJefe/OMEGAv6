import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R95 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const membrane=read('src/CanonicalMembraneR95.tsx');
const membraneCss=read('src/canonicalMembraneR95.css');
const visual=read('src/VisualCompositorR65.tsx');
const home=read('src/OmegaHomeR71.tsx');
const field=read('src/OmegaFieldMotionConvergenceR28.tsx');
const truth=read('src/TruthVisualsR93.tsx');
const systemAtlas=read('src/SystemAtlasControl.tsx');
const convergence=read('src/fullSystemConvergenceR95.ts');
const convergencePanel=read('src/FullSystemConvergencePanelR95.tsx');
const ledger=read('src/softwareMasterLedgerR83.ts');
const atlas=read('src/systemAtlasRuntime.ts');
const accepted=read('src/acceptedProductionContractR95.ts');
const autoUpdate=read('AUTO_UPDATE_CONTRACT.md');
const forecast=read('src/ForecastSovereignPanel.tsx');
const relativity=read('src/RelativityLab.tsx');
const infinity=read('src/OmegaInfinityPanel.tsx');
const earth=read('src/EarthObservatoryR8.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'44 application routes must remain reachable');

must(ledger.includes('reviewedSystemRows:100'),'100-system source ledger must remain authoritative');
must(ledger.includes('reviewedMenuOptions:36'),'36 menu-option authority must remain');
must(ledger.includes('reviewedCapabilities:18'),'18 capability authority must remain');
must((atlas.match(/\nF\('S\d\d'/g)||[]).length===24,'exact 24-family registry must remain');
must(atlas.includes("export const MASTER_MENUS=")&&atlas.includes("['12','Operator Cockpit'"),'12-master-menu system must remain');

for(const token of [
 'Live field membrane, not decorative graphics',
 'Operator Cockpit + Menu Matrix',
 'Single HostState + CanonState authority',
 'Replayable proof + no shadow state',
 'One-click EXE + repair + patch'
])must(convergence.includes(token),'one-system ledger authority missing '+token);
must(convergence.includes('totals:{systems:100,families:24,menuOptions:36,capabilities:18,masterMenus:12,keep:63,merge:26,donor:11}'),'accumulated ledger totals must remain exact');
must(convergence.includes('44 application routes are operator entry points only'),'44 routes may not become the product-completion definition');
must(convergencePanel.includes('ONE-SYSTEM CONVERGENCE AUTHORITY')&&systemAtlas.includes('<FullSystemConvergencePanelR95'),'System Atlas must expose the accumulated completion authority');

for(const rule of ['PRESERVE_ACCEPTED','NO_REGRESSION_BY_OMISSION','NO_GENERIC_SUBSTITUTION','TRACEABLE_VISUAL_GEOMETRY','DISTINCT_APPLICATION_IDENTITY','KEEP_DONOR_UNTIL_VERIFIED','USER_ACCEPTANCE_PRIORITY'])
 must(accepted.includes("id:'"+rule+"'"),'persistent non-regression rule missing '+rule);
must(autoUpdate.includes('Context rollover does not reset accepted product requirements'),'auto-update contract must survive chat/context rollover');
must(autoUpdate.includes('generic dashboard, business bar chart'),'auto-update contract must forbid generic visual substitution');

for(const token of ['STATE_COUNT','projectionPoint','sourceRGB','PROJECTIONS','VIEW_MODES','Array.from({length:STATE_COUNT}'])
 must(membrane.includes(token),'canonical membrane must bind '+token);
must(membrane.includes("label='20,736-CELL CANONICAL MEMBRANE'"),'membrane must identify the 20,736-cell substrate');
must(!membrane.includes('Math.random'),'canonical membrane may not use random geometry');
must(membrane.includes("if(projection==='LATTICE')")&&membrane.includes('row*144+col'),'lattice mode must preserve exact 144x144 address selection');
must(membrane.includes('compileSourceTraversal(address,routeDepth)'),'membrane route overlay must come from canonical traversal');
must(membrane.includes('record.autoPing.previous')&&membrane.includes('record.autoPing.dataNext'),'membrane must distinguish previous/current/admitted-next');
must(membraneCss.includes('.r95-membrane-stage canvas')&&membraneCss.includes('@media(max-width:900px)'),'membrane must have desktop/mobile containment');

must(home.includes('<CanonicalMembraneR95 address={address} onAddress={setAddress}'),'Home must expose the canonical membrane, not a generic plot');
must(visual.includes('<CanonicalMembraneR95 address={address} onAddress={onAddress}'),'Visual Instrument default must be the canonical membrane');
must(visual.includes("initialView='CONTINUITY'"),'Visual Instrument Field lens must be a state-bound continuity skin');
must(field.includes('<CanonicalMembraneR95 address={address} onAddress={onAddress}'),'Field route must be the canonical membrane substrate');
must(!home.includes('<CanonicalPacketTruthPlotR93'),'Home must not regress to the R93 generic packet plot');
must(!truth.includes('<rect'),'truth instruments must not reintroduce bar-graph rectangles');
must(!truth.includes('style={{width:'),'truth instruments must not use generic proportional bar tracks');
must(!truth.toLowerCase().includes('bar = compiler node weight'),'Scale truth must not describe bar encoding');
must(!field.includes('Math.min(100,Math.abs(Number(v))*500)'),'Data Motion derivative display must not retain mini bar indicators');

must(forecast.indexOf('<ForecastMap plan={plan}')>=0&&forecast.indexOf('<ForecastMap plan={plan}')<forecast.indexOf("<CalculusFieldR37 address={address} mode='FORECAST'"),'Forecast must keep its own computed corridor visual identity');
must(relativity.indexOf('<DimensionalRelativityPanelR24 record={record}/>')>=0&&relativity.indexOf('<DimensionalRelativityPanelR24 record={record}/>')<relativity.indexOf("<CalculusFieldR37 address={record.address} mode='RELATIVITY'"),'Relativity must keep its own exact evaluator identity');
must(infinity.includes('<InfinityTruthPlotR93 record={record} index={index}/>')&&!infinity.includes('<canvas ref={canvas}/>'),'Infinity must keep recovered-source identity and not restore torus as truth');
must(earth.includes("'/api/earth/noaa/catalog'")&&earth.includes('/api/earth/evidence?lat=')&&earth.includes('RETURNED EVIDENCE BOUND')&&earth.includes('evidenceHash'),'Earth must remain grounded in returned provider evidence and evidence hashes');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])
 must(living.includes(token),'deep historical donor must remain reachable: '+token);

must(![membrane,visual,home,field,convergencePanel].join('\n').includes('@appdeploy/client'),'R95 recovery must remain provider portable');
console.log('R95 FULL SYSTEM RECOVERY PASS · 100-system ledger + 24 families + 12 menus preserved · canonical 20,736-cell membrane restored · generic bar substitution forbidden · 44 routes remain entry points only');
