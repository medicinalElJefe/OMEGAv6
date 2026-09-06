import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R139 '+m);
const field=read('src/OmegaCapabilityFieldR138.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const css=read('src/capabilityFirstR138.css');
const weave=read('src/TraversalModeStageR100.tsx');
const r136=read('src/world/livingWorldFrameR136.js');
const r137=read('src/familyOperationalProofR137.ts');

for(const token of ['PROJECTION_NOT_CANON_ADMISSION',"data-canonical-mutation='false'",'Ranked projected next','R125 canonical admission remains a separate proof-gated operation'])must(field.includes(token),'capability truth boundary missing '+token);
for(const kind of ['STATE','EXECUTE','PROVE','BUILD','EXPLORE'])must(field.includes(`${kind}:'${kind}'`),'action lane missing '+kind);
for(const signal of ['routeStrength','unifiedCoherence','?.C','?.Phi','evidence','contradictionPressure','Lambda','uncertainty','scar'])must(field.includes(signal),'candidate rank missing established signal '+signal);
must(field.includes('.24*')&&field.includes('.18*')&&field.includes('.14*')&&field.includes('.10*')&&field.includes('.12*')&&field.includes('.08*')&&field.includes('.06*')&&field.includes('.04*'),'candidate ranking must combine the full bounded signal fabric');
must(!field.includes("label:i===0?'Admitted next'"),'projected address must not masquerade as canonical admission');
must(!field.includes('commit the highest-ranked admitted candidate'),'capability selection must not claim CanonState mutation');

for(const token of ["role='group'","role='button'",'tabIndex={0}','onClick={()=>runAction(n)}','onKeyDown={e=>runKey(e,n)}','const runAction=','const runKey='])must(field.includes(token),'spatial topology must be a directly operable keyboard/click control fabric: '+token);
must(!field.includes("<button className='r138-live-stage'"),'whole topology must not collapse to one decorative catch-all button');
must(field.includes('Spatial nodes are live controls'),'operator must be told that spatial nodes are actionable');

must(living.includes("view==='LIVE'&&<><OmegaTraversalStudio"),'woven traversal studio must own primary LIVE traversal');
must(living.includes("view==='ROUTE'&&<><TransitionTruthPlotR93"),'exact transition evidence must remain in ROUTE + PROOF');
must(living.includes('Selecting an address does not itself admit CanonState'),'traversal footer must preserve admission separation');
must(css.includes(".r43-workspace-stage[data-view='ROUTE'] .r93-truth-plot.r93-transition{display:grid!important}"),'route/proof transition evidence must override global plot retirement only in the explicit evidence workspace');
for(const token of ['WOVEN_CONTINUITY_OPERATOR_R100','applyWovenContinuityR100','ATLAS_RESOLUTION_LEVELS_R101','CONTINUITY FLUX','INVARIANT CARRY','ORIENTATION σ'])must(weave.includes(token),'primary woven instrument missing '+token);

must(r136.includes("'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS'"),'R136 one-world/many-projection law must remain intact');
must(r136.includes("canonicalAdmissionAuthority:'R125'"),'R125 admission authority must remain intact');
must(r137.includes('CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE'),'R137 operational proof separation must remain intact');

console.log('R139 CAPABILITY TRUTH + LIVE TRAVERSAL PASS · full-metric projection ranking · directly operable spatial nodes · woven live instrument · route proof retained · projection/address selection separated from R125 CanonState admission');
