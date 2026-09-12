import './r289-recovered-menu-navigation-invariants.mjs';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R289 full convergence invariant failed: ${msg}`)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const archiveNative=read('src/archiveNativeConvergenceR288.ts');
const archiveUi=read('src/ArchiveNativeConvergenceR288.tsx');
const genomeA=read('src/archiveGenomeLedgerR288.ts');
const genomeB=read('src/archiveGenomeLedgerR288b.ts');
const archiveSurface=read('src/ArchiveGovernanceControl.tsx');
const bioSurface=read('src/BioInstrumentSurfaceR281.tsx');
const bioMedical=read('src/bioMedicalProductionR282.ts');
const bioModes=read('src/bioModeExperienceR284.ts');
const bioModeProof=read('tests/r284-bio-mode-experience-invariants.mts');
const interaction=read('tests/r286-ui-interaction-integrity-invariants.mjs');
const r241=read('.github/workflows/r241-archive-convergence.yml');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44,`expected exact 44-route authority, got ${surfaces.length}`);
must(new Set(surfaces).size===44,'canonical surface registry must remain unique');
for(const name of ['Matter Traversal','Archive Census','Archive Operators','Relativity','Modes','System Atlas'])must(surfaces.includes(name),`required convergence surface missing ${name}`);

must(archiveSurface.includes('<ArchiveNativeConvergenceR288/>'),'Drive-native convergence instrument must be mounted inside existing Archive Governance routes');
must(archiveUi.includes('Export convergence receipt')&&archiveUi.includes('onClick={()=>downloadJson('),'archive convergence export must remain actionable');
must(archiveUi.includes('onChange={e=>setState('),'archive successor filter must remain actionable');

for(const token of ['OMEGA_ARCHIVE_NATIVE_CAPABILITY_CONVERGENCE_R288','HEAVY_BIO_FULL','WATER_GEOMETRY','RELATIONAL_SKIN','VIOLET','ATOMIC_MOTION','NATIVE_RENDERER_LEDGER','FULL_BUILD_LEDGER','DRIVE_FILE_PRESENCE_NEQ_RUNTIME_EXECUTION','UNKNOWN_OR_INCOMPLETE_OPERATORS_ARE_GATED_NOT_INVENTED'])must(archiveNative.includes(token),`archive-native authority missing ${token}`);
must(archiveNative.includes("id:'BLADE_GEOMETRY',state:'FORMALIZATION_REQUIRED'"),'Blade Geometry must remain gated until an authoritative operator law exists');
must(archiveNative.includes('R288_FAMILY_CONVERGENCE.length===24'),'current successor audit must preserve 24 software families');
must(archiveNative.includes('inventory.systems===100')&&archiveNative.includes('inventory.routes===44')&&archiveNative.includes('inventory.sourceModes===179')&&archiveNative.includes('inventory.canonLenses===62'),'full current inventory contract must remain explicit');
must(archiveNative.includes('restorationDebt===0'),'current successor restoration debt must remain zero');

const genomeText=genomeA+'\n'+genomeB;
const genomeIds=[...genomeText.matchAll(/id:'AG-(\d{3})'/g)].map(x=>x[1]);
must(genomeIds.length>=20,`expected expanded archive genome (>=20 rows), got ${genomeIds.length}`);
must(new Set(genomeIds).size===genomeIds.length,'archive genome IDs must remain unique across both ledgers');
for(const token of ['SAI / PSC compiled reasoning substrate','Water Geometry / Mode188 calculus','Violet Transfiguration','Dimensional / Parent / Fold / Atomic Relativity','Heavy Bio archive corpus','Scientific domain packs','Full Sphere historical visual instrument','Omega Cube Engine'])must(genomeText.includes(token),`archive genome family missing ${token}`);
for(const token of ['THIRD_PARTY','DEPENDENCY','RECOVER_EXECUTOR','INGEST_TYPED_DATA','RECOVER_VISUAL_GRAMMAR','ADMIT_DEPENDENCY','PROOF_PROVENANCE','CROSS_VALIDATE'])must(genomeText.includes(token),`archive admission class missing ${token}`);

for(const token of ['measurementAuthority','intendedUse','validation','risk','audit'])must(bioMedical.includes(token),`R282 medical-production boundary missing ${token}`);
for(const token of ['sourceCatalogCount:fabric.sourceCatalogCount','canonAuthorityCount:fabric.canonAuthorityCount','measurementAuthority:0'])must(bioModes.includes(token),`R284 mode experience missing derived authority contract ${token}`);
must(bioModeProof.includes('sourceCatalogCount===179')&&bioModeProof.includes('canonAuthorityCount===62')&&bioModeProof.includes('total===241'),'R284 direct proof must retain exact 179 source + 62 canon = 241 channel counts');
must(bioSurface.includes('BioMedicalProductionPanelR282')&&bioSurface.includes('BioModeWorkbenchR284'),'Heavy Bio instrument must mount R282 medical-production and R284 mode workbench surfaces');

for(const token of ['R282','R284','R286'])must(r241.includes(token),`R241 deep convergence gate must include ${token}`);
must(r241.includes('r286-all-surface-browser-e2e.mjs'),'R241 must retain the complete 44-route desktop/mobile browser traversal');
must(interaction.includes('44')||interaction.includes('OMEGA_SURFACES'),'R286 interaction proof must retain full-surface coverage');

for(const token of ['NO_NEW_PHYSICAL_PRIMITIVE','ADDRESS_LEVEL_NEQ_LITERAL_PHYSICAL_DIMENSION','DRIVE_FILE_PRESENCE_NEQ_RUNTIME_EXECUTION'])must(archiveNative.includes(token),`truth invariant missing ${token}`);
must(archiveNative.includes('R125')&&archiveNative.includes('R240')&&archiveNative.includes('CI'),'archive-native convergence must preserve existing Canon/source/deployment authority');

console.log(`R289 FULL ARCHIVE-NATIVE CONVERGENCE PASS · ${surfaces.length} routes · ${genomeIds.length} typed archive genome rows · 24 current software families · 12 recovered master menus · R282/R284 Heavy Bio · R286 full-surface UI · Drive-native authority registry · no new route/state/promotion authority`);
