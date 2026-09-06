import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R138/R139 '+msg);
const app=read('src/App.tsx');
const css=read('src/capabilityFirstR138.css');
const field=read('src/OmegaCapabilityFieldR138.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const home=read('src/OmegaHomeR71.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const r136=read('src/world/livingWorldFrameR136.js');
const r137=read('src/familyOperationalProofR137.ts');

must(app.includes("import './capabilityFirstR138.css'"),'capability-first visual policy must load globally');
for(const klass of ['r93-mode-trace','r93-infinity-source','r93-transition','r93-scale'])must(css.includes(`.r93-truth-plot.${klass}`),'stale plot class must remain retired from primary visual hierarchy: '+klass);
must(css.includes('.r93-packet,.r95-canonical-manifold,.r95-state-mandala{display:block}'),'canonical state manifold must remain visible');
must(css.includes(".r43-workspace-stage[data-view='ROUTE'] .r93-truth-plot.r93-transition{display:grid!important}"),'exact transition evidence must remain reachable in explicit ROUTE + PROOF');
must(!css.includes('.r95-canonical-manifold{display:none'),'canonical manifold must never be retired as a stale chart');

for(const token of ['corpusState','calculusVisualLaw','sourceBackedModeSummary','onAddress','onNavigate','Ranked projected next','Hybrid Link','Build Out','Evidence & Proof','CAPABILITY_FIRST_NO_STALE_CHART_PRIMARY','PROJECTION_NOT_CANON_ADMISSION',"data-canonical-mutation='false'"])must(field.includes(token),'active capability field missing '+token);
must(field.includes('<svg')&&field.includes('r138-node')&&field.includes('r138-shell'),'capability field must remain an advanced interactive topology visual, not a generic business chart');
for(const kind of ['STATE','EXECUTE','PROVE','BUILD','EXPLORE'])must(field.includes(`${kind}:'${kind}'`),'capability field missing action semantic '+kind);
must(field.includes('const runAction=')&&field.includes('onClick={()=>runAction(action)}'),'capability cards must execute through the shared navigation/state dispatcher');
must(field.includes("role='button'")&&field.includes('onClick={()=>runAction(n)}'),'spatial topology nodes must execute the same capability actions directly');
must(!field.includes("label:i===0?'Admitted next'"),'projected candidate must not be mislabeled as canonically admitted');

must(living.includes("view==='LIVE'&&<><OmegaTraversalStudio"),'primary live traversal must use the source-driven woven studio');
must(living.includes("view==='ROUTE'&&<><TransitionTruthPlotR93"),'transition evidence must remain in route/proof workspace');
must(living.includes('Selecting an address does not itself admit CanonState'),'address-space traversal must remain separate from canonical admission');

must(suite.includes("import OmegaCapabilityFieldR138 from './OmegaCapabilityFieldR138'"),'specialist suite must mount R138 capability field');
must(suite.includes("const wrap=(content:any)=><div className='r138-capability-first'>{capability}{content}</div>"),'suite routes must remain capability-first rather than chart-first');
for(const route of ['Convergence','Field','Data Motion','Evidence & Proof','Memory','Canon Evolution','Governance','Projects','Assets','Render Queue','Instructions','Settings','System','Consolidation'])must(suite.includes(route),'suite route lost during capability evolution: '+route);

must(home.includes('CanonicalMembraneR95'),'visual-first home must preserve the living 20,736-cell membrane');
must(home.includes('Open specialist'),'home must preserve direct specialist activation');
must(registry.includes('historicalR82Baseline:44'),'R139 must not fake progress by deleting the historical route inventory');
must(r136.includes("'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS'"),'R136 one-world/many-projection law must remain present');
must(r136.includes("canonicalAdmissionAuthority:'R125'"),'R125 canonical admission authority must remain unchanged');
must(r137.includes('CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE'),'R137 live proof separation must remain intact');

console.log('R138/R139 CAPABILITY-FIRST VISUAL RUNTIME PASS · live woven traversal promoted · directly operable topology retained · projected state selection separated from CanonState admission · exact route proof retained · R137/R136/R125 authorities unchanged');
