import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R133/R168 '+msg)};
const runtime=read('src/buildPotentialRuntimeR133.ts');
const surface=read('src/OmegaBuildPotentialR133.tsx');
const proof=read('src/familyOperationalProofR137.ts');
const inventory=read('src/OmegaSystemInventoryR83.tsx');
const css=read('src/buildPotentialR133.css');
const families=read('src/systemAtlasRuntime.ts');
const completion=read('src/completionRuntimeR48.ts');

for(const lane of ["'OPERATING'","'PROVE_NEXT'","'RESTORE_NEXT'","'PRODUCTIZE_NEXT'"])must(runtime.includes(lane),'missing development lane '+lane);
for(const status of ['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','DEVICE_GATED','EVIDENCE_GATED','RESTORATION_DEBT','DONOR_ONLY','NATIVE_TARGET'])must(runtime.includes(status),'status classification missing '+status);
must(runtime.includes('FAMILIES.map')&&runtime.includes('expressionPlanesForFamily')&&runtime.includes('FAMILIES.length===24'),'potential map must derive every row from the authoritative 24-family registry and expression mapping');
must(runtime.includes('R48_COMPLETION_FAMILIES')&&runtime.includes('effectiveStatus=(current?.successor||family.status)'),'current lane assignment must consume the R48/R153 successor ledger');
must(runtime.includes('historicalStatusCounts')&&runtime.includes('effectiveStatusCounts'),'historical and current execution counts must remain separate');
must(runtime.includes('Family registration is not execution.')&&runtime.includes('Build priority cannot promote CanonState'),'truth/admission boundary missing');
must(!runtime.includes('Math.random'),'build-potential organization must be deterministic');

const familyRows=[...families.matchAll(/F\('(S\d{2})'.*?'(WEB_ACTIVE|SOURCE_ACTIVE|LOCAL_ACTIVE|EVIDENCE_GATED|DEVICE_GATED|DONOR_ONLY|NATIVE_TARGET|RESTORATION_DEBT)'/g)].map(m=>({id:m[1],status:m[2]}));
must(familyRows.length===24&&new Set(familyRows.map(x=>x.id)).size===24,'authoritative V24 family registry must remain 24 unique rows');
const historicalOperating=familyRows.filter(x=>['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(x.status)).length;
const historicalProve=familyRows.filter(x=>['DEVICE_GATED','EVIDENCE_GATED'].includes(x.status)).length;
const historicalRestore=familyRows.filter(x=>x.status==='RESTORATION_DEBT').length;
const historicalProductize=familyRows.filter(x=>['DONOR_ONLY','NATIVE_TARGET'].includes(x.status)).length;
must(historicalOperating===12&&historicalProve===6&&historicalRestore===2&&historicalProductize===4,'historical V24 registry must remain 12 operating / 6 prove / 2 restore / 4 productize as lineage evidence');

const override=(completion.match(/const OVERRIDE:[\s\S]*?=\{([\s\S]*?)\n\};\n\nexport const R48_COMPLETION_FAMILIES/)||[])[1]||'';
const successorRows=[...override.matchAll(/S\d{2}:\{successor:'(WEB_ACTIVE|SOURCE_ACTIVE|LOCAL_ACTIVE|EVIDENCE_GATED|DEVICE_GATED)'/g)].map(m=>m[1]);
must(successorRows.length===24,'R48/R153 current successor ledger must classify 24 families');
const currentOperating=successorRows.filter(x=>['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(x)).length;
const currentProve=successorRows.filter(x=>['DEVICE_GATED','EVIDENCE_GATED'].includes(x)).length;
must(currentOperating===19&&currentProve===5,'current successor truth must classify as 19 bounded operating / 5 proof-gated / 0 current restoration debt');

must(surface.includes('R168 CURRENT SUCCESSOR EXECUTION')&&surface.includes('What works now, what is proof-gated, and what should be built next'),'operator surface must state current-successor role clearly');
must(surface.includes('CURRENT SUCCESSOR EXECUTION · R48/R153/R168')&&surface.includes('HISTORICAL V24 STATUS · PRESERVED LINEAGE')&&surface.includes('CURRENT NEXT DEVELOPMENT ACTION'),'each family must distinguish current successor truth, predecessor lineage, and development intent');
must(surface.includes('row.effectiveProof')&&surface.includes('row.planeLabels.map'),'family cards must surface current successor evidence and expression-plane coverage');
must(surface.includes('historical registration ≠ current successor execution ≠ external proof')&&surface.includes('Priority and route access are organization signals'),'surface must not imply visibility, priority, or routing equals execution');
must(surface.includes("localStorage.setItem('omega.r133.buildPotentialFamily'")&&surface.includes('onNavigate(target'),'potential rows must route into existing specialist surfaces rather than create duplicate products');
must(surface.includes('familyOperationalProofR137(row.family,operational,hybrid,row.effectiveStatus)')&&proof.includes('currentStatus?:SystemFamilyStatus'),'R137 proof must classify the current successor boundary rather than historical status only');
must(surface.includes("PROVE_NEXT:'REVIEW'")&&surface.includes('button opens the operator route only'),'proof-gated rows must expose review navigation without fake execution');

must(inventory.includes("type Tab='FABRIC'|'POTENTIAL'")&&inventory.includes("id:'POTENTIAL'")&&inventory.includes('<OmegaBuildPotentialR133'),'complete software map must mount the R133 potential layer without removing existing inventory tabs');
for(const id of ['FABRIC','SYSTEMS','FAMILIES','HOST_BUILD','MENUS','CAPABILITIES','ARCHIVES','V77'])must(inventory.includes(`id:'${id}'`),'R133 may not remove inherited inventory layer '+id);
must(css.includes('@media(max-width:920px)')&&css.includes('@media(max-width:620px)'),'potential map must explicitly support tablet/mobile');
must(!css.includes('position:fixed'),'potential map must not create covering fixed UI');
console.log(`R133/R168 BUILD POTENTIAL PASS · historical ${historicalOperating}/${historicalProve}/${historicalRestore}/${historicalProductize} preserved · current ${currentOperating} operating / ${currentProve} proof-gated · all 24 families retained · R137 successor-aware`);
