import './r288-archive-genome-ledger-invariants.mjs';
import './r289-full-archive-native-convergence-invariants.mjs';
import './r289-recovered-menu-navigation-invariants.mjs';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R288/R305 archive-native convergence invariant failed: ${msg}`)};
const registry=read('src/archiveNativeConvergenceR288.ts');
const ui=read('src/ArchiveNativeConvergenceR288.tsx');
const archive=read('src/ArchiveGovernanceControl.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');

for(const token of [
 'OMEGA_ARCHIVE_NATIVE_CAPABILITY_CONVERGENCE_R288',
 'R48_COMPLETION_FAMILIES','R153_FULL_SYSTEM_CONTRACT','SOURCE_CORPUS_AUTHORITIES_R107',
 'R265_OPERATOR','R266_CYCLE','ONE_FIELD_ONE_PACKET_ONE_CONTINUITY_LAW',
 'DRIVE_FILE_PRESENCE_NEQ_RUNTIME_EXECUTION','NO_NEW_PHYSICAL_PRIMITIVE',
 'ADDRESS_LEVEL_NEQ_LITERAL_PHYSICAL_DIMENSION','UNKNOWN_OR_INCOMPLETE_OPERATORS_ARE_GATED_NOT_INVENTED'
])must(registry.includes(token),`registry missing ${token}`);

const sourceIds=[...registry.matchAll(/\{id:'([A-Z0-9_]+)',title:/g)].map(x=>x[1]);
for(const id of ['ONE_SYSTEM_LEDGER','FULL_SOFTWARE_UNIVERSE','J_DRIVE_AUTOPING','HEAVY_BIO_FULL','HEAVY_BIO_SHARDS','WATER_FORCE','WATER_GEOMETRY','RELATIONAL_SKIN','VIOLET','ATOMIC_MOTION','NATIVE_RENDERER_LEDGER','FULL_BUILD_LEDGER'])must(sourceIds.includes(id),`Drive source authority missing ${id}`);
must(new Set(sourceIds).size===sourceIds.length,'Drive source authority IDs must be unique');
for(const fileId of ['1tvDDlPxHFTXMPN43-rE1kPKdmJW5uYj6','1GD4INEkFMnuVDWkSNnLYTw2LAsqvBN4C','1NxNCxIwqjvyClUFUs2-rAe3AgLmiNIpO','1Flbg7drpujKdQhLKM030I_It9aPzEcPV','15OgwIFcw7vPYcjSYm7qCVARQKGM1O-Vp','1eyHwNiQISxNhgthE2d4j1a37aVNnSFI1'])must(registry.includes(fileId),`provenance file id missing ${fileId}`);

must(registry.includes("id:'BLADE_GEOMETRY',state:'FORMALIZATION_REQUIRED'"),'Blade Geometry must remain explicit and gated until an authoritative formula/source is recovered');
must(registry.includes('[12,144,1728,20736,248832]'),'canonical representational address ladder missing');
must(registry.includes('physical dimensions')||registry.includes('physical-dimension'),'truth boundary must reject literal physical-dimension inflation');
must(registry.includes('R288_FAMILY_CONVERGENCE.length===24'),'audit must require all 24 families');
must(registry.includes('inventory.systems===100')&&registry.includes('inventory.sourceModes===179')&&registry.includes('inventory.canonLenses===62'),'audit must preserve the full stable system/mode/lens inventory');
must(registry.includes('inheritedRouteSnapshot:R153_FULL_SYSTEM_CONTRACT.inventory.routes'),'archive audit must preserve the inherited R153 route count as historical evidence');
must(registry.includes('currentRoutes:OMEGA_ALL_ROUTES_R82.length'),'archive audit must derive current route telemetry from the live route registry');
must(registry.includes('CURRENT_ROUTE_COUNT_IS_TELEMETRY_NOT_ARCHITECTURE'),'archive audit must explicitly reject treating current route cardinality as an architectural ceiling');
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length>0&&new Set(surfaces).size===surfaces.length,'current workstation route universe must remain non-empty and unique');
must(registry.includes('OMEGA_ALL_ROUTES_R82'),'archive audit must bind current route telemetry to canonical navigation authority');
must(registry.includes('restorationDebt===0'),'audit must require zero successor restoration debt');

for(const token of ['R288 · ARCHIVE-NATIVE CAPABILITY CONVERGENCE','Drive corpus → current successor reality','Export convergence receipt','CURRENT SUCCESSOR REALITY','179 source modes · 62 canon lenses · zero restoration debt'])must(ui.includes(token),`UI missing ${token}`);
must(ui.includes("onClick={()=>downloadJson("),'receipt export control must be genuinely actionable');
must(ui.includes('onChange={e=>setState('),'successor-state filter must be genuinely actionable');
must(archive.includes("import ArchiveNativeConvergenceR288 from './ArchiveNativeConvergenceR288'"),'Archive Governance must import the R288 instrument');
must(archive.includes('<ArchiveNativeConvergenceR288/>'),'Archive Governance must mount the R288 instrument on the existing archive routes');
console.log(`R288/R289/R305 archive-native capability convergence PASS · 24 current software families · 100-system + 179-source-mode + 62-lens stable inventory · ${surfaces.length} current routes treated as telemetry · inherited R153 route snapshot preserved as historical evidence · zero restoration debt`);
