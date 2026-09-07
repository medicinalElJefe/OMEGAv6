import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const sar=read('src/earthSarR181.js');
const panel=read('src/EarthSarPanelR181.tsx');
const earth=read('src/EarthObservatoryR8.tsx');
const r8=read('src/workerR8.js');
const r116=read('src/workerR116.js');
const wrangler=read('wrangler.jsonc');
const governor=JSON.parse(read('public/omega-r170-self-build-governor.json'));
const convergence=read('.github/workflows/r170-current-convergence.yml');
const selfbuild=read('.github/workflows/r170-governed-selfbuild.yml');

// New sensor surface must be additive and source-bound.
for(const token of [
 "REVISION='R181'","/api/earth/sar/providers","/api/earth/sar/search","stac.dataspace.copernicus.eu/v1/search",
 "api.daac.asf.alaska.edu/services/search/param","queryAsf('NISAR'","queryAsf('SENTINEL-1'","OBSERVED_METADATA",
 'DERIVED_RELATIVE_FRAME_SCORE_ONLY','UNOBSERVED_RETURNED_SEARCH','evidenceHash','sourceAgreement','continuity'
])must(sar.includes(token),`R181 SAR engine missing ${token}`);
for(const token of ['CDSE_SENTINEL1','ASF_SENTINEL1','ASF_NISAR','UMBRA_OPEN','CAPELLA_OPEN','ICEYE_OPEN'])must(sar.includes(token),`R181 provider registry missing ${token}`);
must(sar.includes('never invents backscatter, phase, deformation, moisture, elevation or missing SAR pixels'),'SAR truth boundary must explicitly forbid fabricated physical observations');
must(sar.includes('Pixel-level radiometry and InSAR require the underlying calibrated products'),'SAR metadata fusion must not masquerade as pixel-level InSAR');

// UI must expose returned geometry and keep observed/derived semantics separate.
for(const token of ['RADAR STRUCTURAL EARTH','Sentinel-1 · C-band','NISAR · L-band','Returned scene footprints','Acquisition ledger','Provider evidence plane','R181 SAR evidence hash'])must(panel.includes(token),`R181 SAR panel missing ${token}`);
must(panel.includes('This is not interferometric coherence or a physical deformation measurement.'),'Derived frame score disclosure missing');
must(panel.includes('target coverage not claimed'),'Commercial open-data registry must not imply AOI coverage');
must(earth.includes("import EarthSarPanelR181 from './EarthSarPanelR181'"),'Earth Observatory must import R181 SAR panel');
must(earth.includes('<EarthSarPanelR181 lat={lat} lon={lon}/>'),'Earth Observatory must mount R181 SAR panel at the current WGS84 target');

// Previously accepted Earth + Hybrid capability may not be removed by this upgrade.
for(const token of ['EarthNowInstrument','EarthLivingFieldR36','EarthGroundTraversalR9','/api/earth/evidence','/api/earth/noaa/catalog','NOAA STAR · GEOCOLOR','Ground / street evidence','Representational calculus comparison'])must(earth.includes(token)||r8.includes(token),`R181 regression: preserved Earth capability missing ${token}`);
for(const token of ['/api/earth/evidence','/api/earth/noaa/catalog','/api/earth/noaa/image','USGS','EONET','swpc','open-meteo','evidenceHash','/api/hybrid/capabilities','/api/hybrid/plan','/api/hybrid/validate','DRAFT_ONLY_NOT_QUEUED','DEVICE_PROOF_REQUIRED'])must(r8.toLowerCase().includes(token.toLowerCase()),`R181 regression: inherited R8 contract missing ${token}`);
must(r8.includes("import {earthSarApiR181} from './earthSarR181.js'"),'R181 SAR gateway import missing');
must(r8.includes('const sar=await earthSarApiR181(request,url);if(sar)return sar;'),'R181 SAR gateway must route additively before inherited R8 Earth/Hybrid fallback');

// Current production authority must remain exactly on the proven R116 spine.
must(wrangler.includes('"main": "src/workerR116.js"'),'R181 must not replace the proven Cloudflare production entrypoint');
must(r116.includes("import r115,{OmegaRuntime as OmegaRuntimeR115} from './workerR115.js'"),'R181 must preserve R116 inherited authority lineage');
must(r116.includes('export class OmegaRuntime extends OmegaRuntimeR115'),'R181 must preserve durable OmegaRuntime lineage');
for(const token of ['R125','R141','R146','R147','R152','R163'])must(r116.includes(token),`R181 must preserve current authority/proof layer ${token}`);

// R181 is the current capability floor, not a promotion of execution or Canon authority.
must(governor.currentCapabilityFloor==='R181','Governed current capability floor must advance to R181');
must(governor.preservedRuntime?.livingWorldExecutionAuthorization==='R179_AUTHORIZED_NOT_DISPATCHED','R181 must not promote the durable execution boundary past R179');
must(governor.preservedRuntime?.earthSarAuthority==='OBSERVATION_AND_DERIVATION_ONLY_NOT_CANON_ADMISSION','R181 SAR must remain observation/derivation-only authority');
must(governor.selfBuild?.canonicalAdmissionAuthority==='R125','R125 must remain sole Canon admission authority');
must(convergence.includes('node tests/r181-real-sar-earth-invariants.mjs'),'Current convergence must explicitly prove R181');
must(convergence.includes('R179 stops AUTHORIZED_NOT_DISPATCHED'),'Current convergence must preserve R179 execution stop');
must(selfbuild.includes('node tests/r181-real-sar-earth-invariants.mjs'),'Governed self-build must re-prove R181 before/after candidate generation');

console.log('OMEGA R181 REAL SAR EARTH PASS · additive Sentinel-1/NISAR source discovery + relative-frame metadata calculus + footprint/continuity view · R8 Earth/Hybrid preserved · R181 capability floor + R179 execution stop + R125 Canon admission preserved');
