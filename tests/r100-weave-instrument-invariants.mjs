import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R100 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR100.css');
const studio=read('src/OmegaTraversalStudio.tsx');
const stage=read('src/TraversalModeStageR100.tsx');
const weave=read('src/weaveStateR100.ts');
const weaveCss=read('src/weaveGeometryR100.css');
const accepted=read('src/acceptedProductionContractR95.ts');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical 44-route universe must remain intact');

must(weave.includes('ATLAS_RESOLUTION_LEVELS_R100=[12,144,1728,20736]'),'nested atlas resolution registry missing');
must(weave.includes('partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition'),'woven continuity operator order missing');
must(weave.includes('not literal physical dimensions'),'atlas dimensional truth boundary missing');
must(weave.includes('orientation:(-1|0|1)')&&weave.includes('u.orientation'),'signed orientation must remain factored from magnitude');
must(weave.includes('timeSeconds')&&weave.includes('phase=wrap('),'time must drive phase without rewriting canonical address');
must(weave.includes('continuityFlux')&&weave.includes('invariantCarry')&&weave.includes('residualCarry')&&weave.includes('threadTension'),'weave state channels incomplete');
must(weave.includes('applyWovenContinuityR100')&&weave.includes('weaveChannelR100'),'deterministic weave transform/color channel missing');
must(!weave.includes('Math.random'),'weave runtime may not invent random state geometry');

for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF'])must(stage.includes(`'${mode}'`),'R100 must preserve mode '+mode);
must(stage.includes('visualFieldPoint(')&&stage.includes('warpTraversalPointR99(')&&stage.includes('applyWovenContinuityR100('),'R100 must extend rather than replace the R99 source/mode geometry path');
must(stage.includes("projectionPoint(step.address,'MANDALA',1000)")&&stage.includes('compileSourceTraversal(address,routeDepth)'),'canonical admitted route binding must remain intact');
must(stage.includes("className='r100-weave-output'")&&stage.includes('WEAVE STATE')&&stage.includes('ATLAS RESOLUTION')&&stage.includes('ORIENTATION σ'),'weave state must be visible as dimensional/address output outside the stage');
must(stage.includes("<label>TIME<input type='range'")&&stage.includes('timeScale'),'time synchronization control missing');
must(stage.includes('Representational geometry is derived from the canonical packet and admitted route. It is not an external physical observation.'),'representational truth boundary must remain explicit');
must(!stage.includes('Math.random'),'R100 primary stage may not use random/fake geometry');
must(studio.includes("import TraversalModeStageR99 from './TraversalModeStageR100'"),'R100 woven stage must be promoted through the accepted traversal studio binding');
must(studio.includes('<TraversalModeStageR99 variant={variant} address={address} onAddress={onAddress}/>'),'accepted traversal component contract must remain stable');

must(nav.includes("import './omegaSideNavigatorR100.css'"),'professional rail skin must be active');
must(nav.includes('r100-professional-nav')&&nav.includes('r100-omega-mark'),'professional instrument rail identity missing');
for(const token of ["go('Command Center')","go('Extreme Traversal')","go('Matter Traversal')","go('Evidence & Proof')"])must(nav.includes(token),'useful rail quick action missing '+token);
must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes('rows.map(route=>'),'all 44 destinations must remain searchable/reachable');
must(nav.includes("dataset.omegaNavExpanded=expanded?'true':'false'"),'layout reservation state must remain intact');
must(!nav.includes('r88-navigator-backdrop'),'professional rail may not regress to modal overlay navigation');
must(navCss.includes('@media(min-width:901px)')&&navCss.includes('--r94-nav-rail:62px')&&navCss.includes('.r100-active-route'),'desktop rail/panel hierarchy missing');
must(navCss.includes('@media(max-width:900px)')&&navCss.includes('--r94-nav-rail:44px'),'mobile rail refinement missing');

must(weaveCss.includes('.r100-weave-canvas')&&weaveCss.includes('height:clamp(650px,76dvh,980px)'),'visual stage must remain large and primary');
must(weaveCss.includes('.r100-weave-output')&&weaveCss.includes('overflow-x:auto'),'weave output must remain outside/under the stage and responsive');
must(accepted.includes("id:'WOVEN_CONTINUITY_GEOMETRY'"),'persistent production contract must bind woven continuity geometry');
must(accepted.includes("'R100 woven continuity geometry/time + professional instrument rail authority'"),'R100 authority must be recorded without replacing R98/R99');
must(accepted.includes("'R98 unobstructed visual-stage authority'")&&accepted.includes("'R99 source-driven design-mode correlation authority'"),'R100 must extend accepted R98/R99 authority');
must(![nav,navCss,stage,weave,weaveCss].join('\n').includes('@appdeploy/client'),'R100 must remain provider portable');

console.log('R100 WEAVE INSTRUMENT PASS · professional non-covering rail · deterministic time-synchronized woven continuity geometry · explicit 12/144/1728/20,736 atlas output · R99 modes and 44 routes preserved');
