import './r288-archive-genome-ledger-invariants.mjs';
import './r289-full-archive-native-convergence-invariants.mjs';
import './r289-recovered-menu-navigation-invariants.mjs';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R288 archive-native convergence invariant failed: ${msg}`)};
const registry=read('src/archiveNativeConvergenceR288.ts');
const ui=read('src/ArchiveNativeConvergenceR288.tsx');
const archive=read('src/ArchiveGovernanceControl.tsx');

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
must(registry.includes("[12,144,1728,20736,248832]"),'canonical representational address ladder missing');
must(registry.includes('physical dimensions')||registry.includes('physical-dimension'),'truth boundary must reject literal physical-dimension inflation');
must(registry.includes("R288_FAMILY_CONVERGENCE.length===24"),'audit must require all 24 families');
must(registry.includes("inventory.systems===100")&&registry.includes("inventory.routes===44")&&registry.includes("inventory.sourceModes===179")&&registry.includes("inventory.canonLenses===62"),'audit must preserve the full current system inventory');
must(registry.includes("restorationDebt===0"),'audit must require zero successor restoration debt');

for(const token of ['R288 · ARCHIVE-NATIVE CAPABILITY CONVERGENCE','Drive corpus → current successor reality','Export convergence receipt','CURRENT SUCCESSOR REALITY','179 source modes · 62 canon lenses · zero restoration debt'])must(ui.includes(token),`UI missing ${token}`);
must(ui.includes("onClick={()=>downloadJson("),'receipt export control must be genuinely actionable');
must(ui.includes('onChange={e=>setState('),'successor-state filter must be genuinely actionable');
must(archive.includes("import ArchiveNativeConvergenceR288 from './ArchiveNativeConvergenceR288'"),'Archive Governance must import the R288 instrument');
must(archive.includes('<ArchiveNativeConvergenceR288/>'),'Archive Governance must mount the R288 instrument on the existing archive routes');
console.log('R288/R289 archive-native capability convergence invariants PASS');
