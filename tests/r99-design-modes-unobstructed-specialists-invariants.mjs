import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R99 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const studio=read('src/OmegaTraversalStudio.tsx');
const stage=read('src/TraversalModeStageR99.tsx');
const modes=read('src/traversalModeDesignR99.ts');
const css=read('src/designModesR99.css');
const accepted=read('src/acceptedProductionContractR95.ts');
const extreme=read('src/ExtremeTraversalUnionR60.tsx');
const hybrid=read('src/HybridMissionControlR8.tsx');
const earth=read('src/EarthObservatoryR8.tsx');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical 44-route universe must remain intact');

for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF']){
 must(modes.includes(`${mode}:{id:'${mode}'`),`missing design grammar for ${mode}`);
 must(stage.includes(`'${mode}'`),`stage must expose selectable ${mode} mode`);
}
must(modes.includes('sourceMap:')&&modes.includes('geometryMap:'),'every active design mode must expose source/geometry correlation');
must(modes.includes("mode==='WATER'")&&modes.includes("mode==='LIGHT'")&&modes.includes("mode==='SCAR'")&&modes.includes("mode==='RELATIVITY'")&&modes.includes("mode==='FORECAST'")&&modes.includes("mode==='PROOF'")&&modes.includes("mode==='SHELL'"),'mode warp must implement distinct geometry behavior instead of renaming one renderer');
must(stage.includes('visualFieldPoint(')&&stage.includes('warpTraversalPointR99('),'high-detail particles must be derived from unified canonical calculus plus declared mode warp');
must(stage.includes("projectionPoint(step.address,'MANDALA',1000)")&&stage.includes('compileSourceTraversal(address,routeDepth)'),'admitted route must be plotted from canonical traversal data');
must(!stage.includes('Math.random'),'R99 primary traversal stage may not use random/fake geometry');
must(stage.includes("Representational geometry is derived from the canonical packet and admitted route"),'representational truth boundary must remain explicit');

must(studio.includes('<TraversalModeStageR99 variant={variant} address={address} onAddress={onAddress}/>'),'new source-driven mode stage must own the Deep Traversal primary view');
must(!studio.includes("<aside className='traversal-hud'>"),'blocking traversal HUD must be removed from stage');
must(studio.includes("<details className='r99-support-layer'><summary>MOTION SKIN")&&studio.includes("<details className='r99-support-layer'><summary>PROOF"),'motion/proof layers must remain reachable without default stage obstruction');
must(studio.includes("r99-donor-layer")&&studio.includes('<CalculusTraversal '),'historical calculus renderer must remain preserved as optional donor/advanced comparison');
must(css.includes('.r99-stage{')&&css.includes('height:clamp(620px,72dvh,900px)'),'desktop traversal stage must own a large high-detail viewport');
must(css.includes(".traversal-stage .traversal-hud")&&css.includes(".calculus-stage .calculus-hud")&&css.includes(".mt-stage .mt-hud")&&css.includes(".visual-stage .visual-equation")&&css.includes('display:none!important'),'known default visual-stage overlay panels must be suppressed across visual-first routes');
must(css.includes('.r43-workspace-tabs')&&css.includes('.r43-workspace-tabs button span{display:none!important}'),'specialist depth navigation must become a slim shared toolbar rather than card compartments');

must(accepted.includes("id:'MODE_VISUAL_FUNCTION_CORRELATION'"),'persistent production contract must require functional/visual mode correlation');
must(accepted.includes("'R98 unobstructed visual-stage authority'")&&accepted.includes("'R99 source-driven design-mode correlation authority'"),'R99 must extend rather than replace accepted R98 authority');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])
 must(living.includes(token),'deep donor must remain reachable: '+token);
must(extreme.includes("View='CANONICAL'|'RESTORED'")&&extreme.includes('<ExtremeRestorationR46'),'Extreme Traversal restored-function layer must remain intact');
must(hybrid.includes('PC ONLINE is never claimed')||hybrid.includes('authenticated heartbeat'),'Hybrid native execution/heartbeat truth must remain represented');
must(earth.includes('RETURNED EVIDENCE BOUND')&&earth.includes('evidenceHash'),'Earth returned-evidence authority must remain intact');
must(![stage,modes,studio,css].join('\n').includes('@appdeploy/client'),'R99 must remain provider portable');

console.log('R99 DESIGN MODES PASS · 8 source-driven traversal depictions · unobstructed high-detail stage · proof/motion/donor layers preserved outside canvas · 44 routes intact');
await import('./r100-weave-instrument-invariants.mjs');
