import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R83 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const home=read('src/OmegaHomeR71.tsx');
const shell=read('src/InstrumentOSShellR62.tsx');
const atlas=read('src/SystemAtlasControl.tsx');
const inventory=read('src/OmegaSystemInventoryR83.tsx');
const inventoryCss=read('src/systemInventoryR83.css');
const master=read('src/softwareMasterLedgerR83.ts');
const archive=read('src/archiveDonorIndexR83.ts');
const bins=read('src/v77BinLedgerR83.ts');
const families=read('src/systemAtlasRuntime.ts');
const authorities=read('src/allModesAuthority.ts');
const modes=read('src/SourceBackedModesPanelR21.tsx');
const modeRuntime=read('src/modeExpressionRuntimeR82.ts');
const modeCanvas=read('src/ModeExpressionCanvasR82.tsx');
const visual=read('src/VisualCompositorR65.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');
const extreme=read('src/ExtremeTraversalUnionR60.tsx');
const restoration=read('src/ExtremeRestorationR46.tsx');

const systemIds=[...master.matchAll(/"id":\s*"(SYS-\d{3})"/g)].map(x=>x[1]);
must(systemIds.length===100&&new Set(systemIds).size===100&&systemIds[0]==='SYS-001'&&systemIds.at(-1)==='SYS-100','master ledger must retain 100 unique system rows');
const menuOptionIds=[...master.matchAll(/"optionId":\s*"(M\d{2}-O\d{2})"/g)].map(x=>x[1]);
must(menuOptionIds.length===36&&new Set(menuOptionIds).size===36,'master ledger must retain 36 unique menu options');
const capIds=[...master.matchAll(/"id":\s*"(CAP-\d{3})"/g)].map(x=>x[1]);
must(capIds.length===18&&new Set(capIds).size===18,'master ledger must retain 18 unique capability rows');
must(master.includes('KEEP/MERGE/DONOR describes archive disposition, not current hosted execution'),'master ledger must preserve archive/execution truth separation');

const v77=[...bins.matchAll(/"id":\s*"(BIN-\d{2})"/g)].map(x=>x[1]);
must(v77.length===24&&new Set(v77).size===24&&v77[0]==='BIN-01'&&v77.at(-1)==='BIN-24','V77 must retain 24 unique bin identities');
must(!bins.includes('driveId')&&!bins.includes('drive.google.com'),'V77 registry must not publish private Drive identifiers');
must(bins.includes('archive bin presence is donor evidence, not hosted execution'),'V77 donor boundary missing');

const familyIds=[...families.matchAll(/F\('(S\d{2})'/g)].map(x=>x[1]);
must(familyIds.length===24&&new Set(familyIds).size===24,'24-family runtime inventory must remain intact');
const surfBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical application route layer must remain exactly 44 unique routes');

const names=(authorities.match(/const NAMES=\[(.*?)\] as const/s)||[])[1]||'';
const canonNames=[...names.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(canonNames.length===62,'62 canon/calculus authorities must remain intact');
must(authorities.includes('sourceModeEvaluations:179')&&authorities.includes('canonAuthorities:62'),'179 source modes and 62 canon lenses must remain separate counting layers');

must(home.includes('<OmegaSystemInventoryR83 compact')&&home.includes('44 application routes · 100 system rows · 24 runtime families · 179 source modes'),'Home must expose the complete software system map instead of presenting 44 routes as the whole product');
must(shell.includes("browserLayer==='SOFTWARE'")&&shell.includes('<OmegaSystemInventoryR83 compact'),'workstation browser must expose applications and software-system layers together');
must(atlas.includes('<OmegaSystemInventoryR83 onNavigate={onNavigate}/>'),'System Atlas must expose the complete software inventory directly');
must(inventory.includes("id:'SYSTEMS'")&&inventory.includes("id:'FAMILIES'")&&inventory.includes("id:'MENUS'")&&inventory.includes("id:'CAPABILITIES'")&&inventory.includes("id:'ARCHIVES'")&&inventory.includes("id:'V77'"),'software navigator must expose all inventory layers');
must(!inventoryCss.includes('.r83-inventory{position:fixed')&&!inventoryCss.includes('.r83-home-system-map{position:fixed'),'inventory may not create a global fixed overlay');

must(archive.includes('software2VisibleItems:100')&&archive.includes('software2ListingComplete:false'),'2Software visible donor index must be exposed without falsely claiming a complete folder crawl');
must((archive.match(/OMEGA_B043_FULL_SYSTEM_PART_/g)||[]).length===29&&archive.includes('OMEGA_B043_RECONSTRUCTION_KIT.zip'),'B043 29-part full-system archive and reconstruction kit must remain visible');
must(archive.includes('presence ≠ execution')||archive.includes('do not mean those binaries are mounted, executing, promoted'),'archive-build presence must not be reported as runtime execution');

must(workstation.includes("case 'Extreme Traversal':return <ExtremeTraversalUnionR60"),'Extreme Traversal route must restore canonical + restored-function union');
must(extreme.includes('Canonical traversal')&&extreme.includes('Restored functions')&&extreme.includes('<ExtremeRestorationR46'),'Extreme Traversal union must keep both canonical and restored executor views');
for(const x of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(x),`deep donor view lost: ${x}`);
for(const x of ["id:'S10'","id:'S12'","id:'S16'","id:'S18'","id:'S21'"])must(restoration.includes(x),`R46 restored family lost: ${x}`);

must(modes.includes('CANON_AUTHORITY_STACK')&&modes.includes('evaluateCanonAuthorityStack')&&modes.includes('SOURCE MODE CATALOG')&&modes.includes('CANON / CALCULUS AUTHORITY LENSES'),'Modes must surface both 179 source modes and 62 canon/calculus lenses');
must(modes.includes("selectedAuthority?'UNDERLYING SOURCE TRAVERSAL':'ACTUAL ADMITTED TRAVERSAL'"),'canon lens selection must not relabel the fallback source route as the selected authority execution');
must(modeRuntime.includes('authorityLens')&&modeRuntime.includes('not an additional corpus executor'),'canon lens expression runtime must remain distinct from execution');
must(modeCanvas.includes('CANON / CALCULUS GOVERNANCE LENS')&&modeCanvas.includes('CANON / CALCULUS LENS'),'canon lens visual labels must not say source-backed execution');
must(visual.includes("omega.r83.selectedModeRef")&&visual.includes('canon authority lens'),'Visual Instrument must carry selected source-mode/canon-lens identity across applications');

console.log('R83 FULL SYSTEM INVENTORY RESTORATION PASS · 44 routes + 100 systems + 24 families + 36 options + 18 capabilities + 179 source modes + 62 canon lenses + 24 V77 bins + reviewed archive builds preserved');
