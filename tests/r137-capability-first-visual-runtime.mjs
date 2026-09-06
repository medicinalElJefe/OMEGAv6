import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R137 '+msg);
const app=read('src/App.tsx');
const css=read('src/capabilityFirstR137.css');
const field=read('src/OmegaCapabilityFieldR137.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const home=read('src/OmegaHomeR71.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const r136=read('src/world/livingWorldFrameR136.js');

must(app.includes("import './capabilityFirstR137.css'"),'capability-first retirement policy must load globally');
for(const klass of ['r93-mode-trace','r93-infinity-source','r93-transition','r93-scale'])must(css.includes(`.r93-truth-plot.${klass}`),'stale plot class must be retired from active visual hierarchy: '+klass);
must(css.includes('.r93-packet,.r95-canonical-manifold,.r95-state-mandala{display:block}'),'canonical state manifold must remain visible');
must(!css.includes('.r95-canonical-manifold{display:none'),'canonical manifold must never be retired as a stale chart');

for(const token of ['corpusState','calculusVisualLaw','sourceBackedModeSummary','onAddress','onNavigate','Ranked projected next','Hybrid Link','Build Out','Evidence & Proof','CAPABILITY_FIRST_NO_STALE_CHART_PRIMARY','PROJECTION_NOT_CANON_ADMISSION',"data-canonical-mutation='false'"])must(field.includes(token),'active capability field missing '+token);
must(field.includes('<svg')&&field.includes('r137-node')&&field.includes('r137-shell'),'capability field must be an advanced interactive topology visual, not a business chart');
for(const kind of ['STATE','EXECUTE','PROVE','BUILD','EXPLORE'])must(field.includes(`${kind}:'${kind}'`),'capability field missing action semantic '+kind);
must(field.includes('onClick={()=>action.route?onNavigate(action.route):action.address!==undefined?onAddress(action.address):undefined}'),'capability cards must execute navigation/state actions');
must(field.includes('scoreCandidate')&&field.includes('routeStrength')&&field.includes('unifiedCoherence')&&field.includes('evidence')&&field.includes('contradictionPressure')&&field.includes('Lambda')&&field.includes('uncertainty')&&field.includes('scar'),'candidate ranking must use the established continuity/evidence/contradiction/burden/uncertainty/scar fabric rather than a decorative rank');
must(!field.includes("label:i===0?'Admitted next'"),'projected candidate must not be mislabeled as canonically admitted');
must(!field.includes('commit the highest-ranked admitted candidate'),'local projection selection must not be described as canonical admission');

must(living.includes("view==='LIVE'&&<><OmegaTraversalStudio"),'primary live Traversal must render the source-driven woven studio');
must(living.includes("view==='ROUTE'&&<><TransitionTruthPlotR93"),'exact transition chart must remain reachable as route/proof evidence');
must(living.includes('Selecting an address does not itself admit CanonState'),'Traversal truth boundary must separate address selection from admission');

must(suite.includes("import OmegaCapabilityFieldR137 from './OmegaCapabilityFieldR137'"),'specialist suite must mount R137 capability field');
must(suite.includes("const wrap=(content:any)=><div className='r137-capability-first'>{capability}{content}</div>"),'suite routes must be capability-first rather than chart-first');
for(const route of ['Convergence','Field','Data Motion','Evidence & Proof','Memory','Canon Evolution','Governance','Projects','Assets','Render Queue','Instructions','Settings','System','Consolidation'])must(suite.includes(route),'suite route lost during capability conversion: '+route);

must(home.includes('CanonicalMembraneR95'),'visual-first home must preserve the living 20,736-cell membrane');
must(home.includes('Open specialist'),'home must preserve direct specialist activation');
must(registry.includes('historicalR82Baseline:44'),'R137 must not fake progress by deleting the historical route inventory');
must(r136.includes("'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS'"),'R136 one-world/many-projection law must remain present');
must(r136.includes("canonicalAdmissionAuthority:'R125'"),'R125 canonical admission authority must remain unchanged');

console.log('R137 CAPABILITY-FIRST VISUAL RUNTIME PASS · stale plot-first primaries retired · canonical manifold retained · live woven traversal promoted · projected state selection separated from R125 admission · capability execution semantics preserved');
