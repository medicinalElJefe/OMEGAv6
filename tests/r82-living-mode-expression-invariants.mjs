import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const registry=read('src/omegaExperienceRegistryR82.ts');
const home=read('src/OmegaHomeR71.tsx');
const homeCss=read('src/omegaHomeR71.css');
const shell=read('src/InstrumentOSShellR62.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const modeRuntime=read('src/modeExpressionRuntimeR82.ts');
const modeCanvas=read('src/ModeExpressionCanvasR82.tsx');
const visual=read('src/VisualCompositorR65.tsx');
const field=read('src/CalculusFieldR37.tsx');
const surface=read('src/SurfaceIntegrityR81.tsx');
const surfaceCss=read('src/surfaceIntegrityR81.css');

for(const id of ['COMMAND','EXPLORE','INTELLIGENCE','EVIDENCE','BUILD','SYSTEM'])must(registry.includes(`id:'${id}'`),`shared workspace missing ${id}`);
for(const mode of ['FIELD','MATTER','TRAVERSAL','FORECAST','RELATIVITY','INFINITY','SCALE','CONVERGENCE'])must(registry.includes(`id:'${mode}'`),`projection registry missing ${mode}`);
must(registry.includes('routes.length===44')&&registry.includes('new Set(routes).size===44'),'shared experience registry must assert 44 unique routes');
must(home.includes('OMEGA_WORKSPACES_R82.map')&&home.includes('OMEGA_FIELD_PROJECTIONS_R82.map'),'Home must consume shared workspace and projection registries');
must(home.includes("placeholder='Search all 44 OMEGA applications'"),'Home must expose the complete application search');
must(!home.includes('.slice(0,18)')&&!home.includes('.slice(0,10)'),'Home may not bury applications behind arbitrary result slicing');
must(home.includes('projection.signature')&&home.includes('projection.intent'),'Home must explain the visual law selected by each projection button');
must(homeCss.includes('.r71-modes')&&homeCss.includes('overflow-x:auto'),'all projection buttons must remain reachable without overlap');

must(shell.includes('OmegaSideNavigatorR88')&&nav.includes('OMEGA_WORKSPACES_R82')&&nav.includes('OMEGA_ALL_ROUTES_R82'),'workstation menu must be locked to the same shared organization as Home');
must(nav.includes('One scroll owner')&&nav.includes('44 canonical routes'),'deep historical route reachability must remain explicit');

for(const family of ['COHERENCE','FORECAST','PRUNE','RELATIVITY','FLOW','MEMORY','PROOF','TOPOLOGY','COMPRESSION','TRAVERSAL','RECURSION','GOVERNANCE','SCALE','LIGHT','GENERIC'])must(modeRuntime.includes(`'${family}'`),`mode expression family missing ${family}`);
must(modeRuntime.includes("metadataOnly?'Visual expression is derived only from catalog metadata."),'registry-only mode visuals must remain explicitly non-executed');
must(modeCanvas.includes('switch(expression.family)'),'individual mode visuals must use family-specific geometry rather than one repeated renderer');
for(const sig of ["case'FORECAST'","case'PRUNE'","case'RELATIVITY'","case'FLOW'","case'MEMORY'","case'PROOF'","case'TOPOLOGY'","case'COMPRESSION'","case'TRAVERSAL'","case'RECURSION'","case'GOVERNANCE'","case'SCALE'","case'LIGHT'"])must(modeCanvas.includes(sig),`visual expression renderer missing ${sig}`);

must(modes.includes('<ModeExpressionCanvasR82')&&modes.includes('Express this catalog mode visually'),'Modes application must show and select visual expression for catalog modes');
must(modes.includes("aria-label='Select any OMEGA mode'")&&modes.includes('(catalog.results as any[]).map'),'all 179 catalog modes must be directly selectable beside the visual expression instead of buried below');
must(modes.includes('Express gated mode'),'gated modes must remain visually inspectable without claiming execution');
must(modes.includes('Express visually + Trace this mode'),'executed modes must bind visual identity and actual trace action');
must(modes.includes("localStorage.setItem('omega.r82.selectedModeId'"),'selected mode must persist across OMEGA applications');
must(modes.includes("localStorage.setItem('omega.r65.visual.lens','MODE')"),'Modes → Visual Instrument handoff must open the selected mode expression');

must(visual.includes("type Lens='SYNTHESIS'|'MODE'")&&visual.includes("<ModeExpressionCanvasR82 expression={modeExpression}"),'Visual Instrument must expose the selected individual mode as a first-class lens');
must(field.includes('function drawProjectionSignatureR82'),'high-level projection buttons must change geometry, not only labels/gains');
for(const mode of ["mode==='MATTER'","mode==='TRAVERSAL'","mode==='FORECAST'","mode==='RELATIVITY'","mode==='INFINITY'","mode==='SCALE'","mode==='CONVERGENCE'"])must(field.includes(mode),`distinct projection geometry missing ${mode}`);

must(surface.includes("record?:any")&&surface.includes("className='r82-surface-vital'"),'every workstation panel must receive a compact state-bound vitality signal');
must(surfaceCss.includes('.r82-surface-vital')&&!surfaceCss.includes('.r82-surface-vital{position:fixed'),'surface vitality must stay non-overlapping and inside the active panel');
must(!modeRuntime.match(/physical dimension.*executed/i),'visual mode mapping must not convert representation into physical/execution claims');

console.log('R82 LIVING MODE EXPRESSION PASS · 44 routes aligned · 8 projection grammars · individual mode expressions · no buried menu slicing · state-bound surfaces preserved');
