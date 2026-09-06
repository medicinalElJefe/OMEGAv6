import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R133 '+msg)};
const runtime=read('src/buildPotentialRuntimeR133.ts');
const surface=read('src/OmegaBuildPotentialR133.tsx');
const inventory=read('src/OmegaSystemInventoryR83.tsx');
const css=read('src/buildPotentialR133.css');
const families=read('src/systemAtlasRuntime.ts');

for(const lane of ["'OPERATING'","'PROVE_NEXT'","'RESTORE_NEXT'","'PRODUCTIZE_NEXT'"])must(runtime.includes(lane),'missing development lane '+lane);
for(const status of ['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','DEVICE_GATED','EVIDENCE_GATED','RESTORATION_DEBT','DONOR_ONLY','NATIVE_TARGET'])must(runtime.includes(status),'status classification missing '+status);
must(runtime.includes('FAMILIES.map')&&runtime.includes('expressionPlanesForFamily')&&runtime.includes('FAMILIES.length===24'),'potential map must derive every row from the authoritative 24-family registry and expression mapping');
must(runtime.includes('Family registration is not execution.')&&runtime.includes('Build priority cannot promote CanonState'),'truth/admission boundary missing');
must(!runtime.includes('Math.random'),'build-potential organization must be deterministic');

const familyRows=[...families.matchAll(/F\('(S\d{2})'.*?'(WEB_ACTIVE|SOURCE_ACTIVE|LOCAL_ACTIVE|EVIDENCE_GATED|DEVICE_GATED|DONOR_ONLY|NATIVE_TARGET|RESTORATION_DEBT)'/g)].map(m=>({id:m[1],status:m[2]}));
must(familyRows.length===24&&new Set(familyRows.map(x=>x.id)).size===24,'authoritative family registry must remain 24 unique rows');
const operating=familyRows.filter(x=>['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(x.status)).length;
const prove=familyRows.filter(x=>['DEVICE_GATED','EVIDENCE_GATED'].includes(x.status)).length;
const restore=familyRows.filter(x=>x.status==='RESTORATION_DEBT').length;
const productize=familyRows.filter(x=>['DONOR_ONLY','NATIVE_TARGET'].includes(x.status)).length;
must(operating===12&&prove===6&&restore===2&&productize===4,'current family status truth must classify as 12 operating / 6 prove / 2 restore / 4 productize');

must(surface.includes('BUILD POTENTIAL / RESTORATION MAP')&&surface.includes('What works, what is gated, and what should be built next'),'operator surface must state its role clearly');
must(surface.includes('CURRENT TRUTH')&&surface.includes('NEXT DEVELOPMENT ACTION'),'each family must distinguish current execution truth from development intent');
must(surface.includes('row.family.statusNote')&&surface.includes('row.planeLabels.map'),'family cards must surface source status evidence and expression-plane coverage');
must(surface.includes('family registration ≠ execution')&&surface.includes('Priority is an organization signal'),'surface must not imply visibility or priority equals execution');
must(surface.includes("localStorage.setItem('omega.r133.buildPotentialFamily'")&&surface.includes('onNavigate(target'),'potential rows must route into existing specialist surfaces rather than create duplicate products');

must(inventory.includes("type Tab='FABRIC'|'POTENTIAL'")&&inventory.includes("id:'POTENTIAL'")&&inventory.includes('<OmegaBuildPotentialR133'),'complete software map must mount the R133 potential layer without removing existing inventory tabs');
for(const id of ['FABRIC','SYSTEMS','FAMILIES','HOST_BUILD','MENUS','CAPABILITIES','ARCHIVES','V77'])must(inventory.includes(`id:'${id}'`),'R133 may not remove inherited inventory layer '+id);
must(css.includes('@media(max-width:920px)')&&css.includes('@media(max-width:620px)'),'potential map must explicitly support tablet/mobile');
must(!css.includes('position:fixed'),'potential map must not create covering fixed UI');
console.log(`R133 BUILD POTENTIAL PASS · ${operating} operating · ${prove} prove next · ${restore} restore next · ${productize} productize next · all 24 authoritative families retained`);
