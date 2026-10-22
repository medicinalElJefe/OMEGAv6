import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R119 '+msg)};
const resolution=read('src/renderResolutionR119.ts');
const membrane=read('src/CanonicalMembraneR95.tsx');
const woven=read('src/WovenContinuityFieldR77.tsx');
const carry=read('src/ContinuousFieldOverlayR13.tsx');
const traversal=read('src/TraversalModeStageR99.tsx');
const calculus=read('src/CalculusFieldR37.tsx');
const ultra=read('src/UltraSystemFabricR119.tsx');
const ultraCss=read('src/ultraSystemFabricR119.css');
const surfaceFabric=read('src/FederationSurfaceFabricR119.tsx');
const mount=read('src/FullSystemConvergencePanelR95.tsx');
const source=read('src/sourceCorpusCorrelationR107.ts');
const federation=read('src/federation/federationExperienceR102.ts');
const manifest=JSON.parse(read('public/omega-ultra-convergence-r119.json'));

for(const token of ['FULL_LOGICAL_ANCHORS_R119=20736','FULL_VIRTUAL_ADDRESSES_R119=61917364224','MOBILE','BALANCED','FULL','16_000_000','fullLogicalFidelity:true','physical dimensions'])must(resolution.includes(token),'resolution authority missing '+token);
must(!resolution.includes('61917364224*61917364224'),'virtual address space must never allocate literal virtual pixels');

for(const [name,src] of [['canonical membrane',membrane],['woven field',woven],['vector carry',carry],['traversal modes',traversal],['calculus field',calculus]])must(src.includes('renderResolutionR119')||src.includes('applyCanvasResolutionR119'),'primary renderer not bound to R119 resolution: '+name);
must(!calculus.includes('Math.min(1.65,window.devicePixelRatio'),'calculus field retained stale 1.65 DPR ceiling');
must(woven.includes('for(let a=0;a<WOVEN_CANONICAL_COUNT;a++)'),'Woven full-fidelity path must visit all 20,736 canonical anchors');
must(!woven.includes('a+=step'),'Woven fallback must not logically subsample canonical anchors');

for(const token of ['SOURCE_CORPUS_AUTHORITIES_R107','ULTIMATE_DEVELOPMENT_FABRIC_R107','MASTER_SYSTEMS_R83','MASTER_MENU_OPTIONS_R83','MASTER_CAPABILITIES_R83','ALL_MODES_BOUNDARY','FEDERATION_NODE_ORDER_R102','R119_RENDER_RESOLUTION_AUTHORITY'])must(ultra.includes(token),'ultra convergence fabric missing '+token);
for(const token of ['{MASTER_SYSTEMS_R83.length}','{FAMILIES.length}','{MASTER_MENU_OPTIONS_R83.length}','{MASTER_CAPABILITIES_R83.length}','{ALL_MODES_BOUNDARY.sourceModeEvaluations}','{ALL_MODES_BOUNDARY.canonAuthorities}','Four-role federation','Truth class travels with every output','SCALE_LEVELS'])must(ultra.includes(token),'ultra convergence UI missing live corpus binding '+token);
must(mount.includes("import UltraSystemFabricR119 from './UltraSystemFabricR119'")&&mount.includes('<UltraSystemFabricR119 onNavigate={onNavigate}/>'),'System Atlas convergence authority must mount R119 ultra fabric');
must(!ultraCss.includes('position:fixed')&&!ultraCss.includes('position:absolute'),'ultra fabric must remain in document flow and never cover the instrument');

for(const token of ['HISTORICAL_SOVEREIGN_SURFACE','not a current pairing endpoint','authenticated OMEGAv6 Hybrid/Sovereign transport','Inspect historical surface'])must(surfaceFabric.includes(token),'Sovereign historical-surface boundary missing '+token);
must(!surfaceFabric.includes("className:'HOST_CONTROL_SURFACE'"),'retired Foundasound surface must not be relabeled as current host control');
must(!surfaceFabric.includes('Human-facing Sovereign bootstrap/control surface for pairing'),'retired Foundasound surface must not advertise current pairing/bootstrap authority');

for(const token of ['DEWEY_248832_SCALE_ATLAS','FOUR_NODE_CLOUD_FABRIC','sourceModeCatalog:R21_MODE_AUTHORITY.catalogCount','canonLensCount:ALL_MODES_BOUNDARY.canonAuthorities','physicalDimensionClaim:false'])must(source.includes(token),'existing corpus correlation authority missing '+token);
for(const token of ["['genesis','optical','sovereign','omegaV6']",'PROPOSE','SCREEN','SOLVE','ADMIT','historical pairing never substitutes for live proof'])must(federation.includes(token),'federation authority missing '+token);

must(manifest.schema==='OMEGA_ULTRA_CONVERGENCE_R119','public convergence schema mismatch');
must(manifest.canonicalAuthority==='OMEGAv6'&&manifest.authorityNodeCount===4,'manifest must preserve exactly four authority roles and OMEGAv6 admission authority');
must(manifest.corpus.reviewedSystems===100&&manifest.corpus.softwareFamilies===24&&manifest.corpus.menuOptions===36&&manifest.corpus.masterCapabilities===18,'manifest corpus counts regressed');
must(manifest.corpus.sourceModeEvaluations===179&&manifest.corpus.canonCalculusLenses===62,'mode/lens counts regressed');
must(manifest.resolution.residentCanonicalAnchors===20736&&manifest.resolution.expandedRepresentationalRows===248832&&manifest.resolution.virtualAddressCapacity===61917364224,'resolution hierarchy mismatch');
must(manifest.resolution.truthBoundary.includes('None of these values is a claim of literal physical dimensions'),'resolution truth boundary must reject literal physical-dimension interpretation');
must(manifest.governance.oneGlobalCanonState===true&&manifest.governance.hybridIsBridgeNotAuthority===true&&manifest.governance.physicalDimensionClaim===false,'governance boundary regressed');
const sov=manifest.sites.find(x=>x.id==='omega-sovereign');
must(sov&&sov.historicalSurfacePolicy.includes('retired as a machine origin')&&sov.humanSurface===null,'historical Sovereign site must never be promoted back to machine authority');
const optical=manifest.sites.find(x=>x.id==='omega-optical');
must(optical&&String(optical.truthBoundary).includes('not full-wave'),'Optical Tier-1 truth boundary missing');
must(String(manifest.modeLaw).includes('not be implemented as a theme/color-only switch'),'mode semantics must not collapse into color themes');

console.log('R119 FULL RESOLUTION + ULTRA CONVERGENCE PASS · 20,736 resident fidelity · 248,832 representation · 61.917B virtual addressing · 100 systems / 24 families / 36 controls / 18 capabilities · 179 source modes + 62 lenses · four-role federation · retired Sovereign preview bounded · no shadow authority');
