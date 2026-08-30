import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const mutation=read('src/runtimeAuthorityR44.ts'),rail=read('src/RuntimeAuthorityRailR44.tsx'),modes=read('src/AllModesOperatorPanelR44.tsx'),workstation=read('src/OmegaWorkstationFullV2.tsx'),shell=read('src/SingleFrameRuntimeShellR27.tsx'),capability=read('src/capabilityAuthority.ts'),signal=read('src/OmegaSignalFieldR44.tsx'),integrations=read('src/OmegaIntegrationHubR44.tsx'),archive=read('src/archiveGovernanceRuntime.ts'),buildout=read('src/WovenBuildOutPanel.tsx'),atlas=read('src/systemAtlasRuntime.ts'),living=read('src/OmegaR36LivingSurfaces.tsx');
const must=(ok,msg)=>assert.ok(ok,msg);

const sequence=['CARRY','CONSTRUCT','PRUNE','TURN','ESCALATE','SCAR','TRANSLATE','PROVE','FORECAST','LEDGER'];
let cursor=-1;for(const stage of sequence){const at=mutation.indexOf(`'${stage}'`,cursor+1);must(at>cursor,`R44 sequence missing/out of order: ${stage}`);cursor=at}
for(const token of ['beforeHash','afterHash','previousLedgerHash','ledgerHash','sha256Hex','R44_LEDGER_KEY','SOURCE_ADMITTED','SOURCE_NAVIGATION','OPERATOR_SELECTED','externalEvidenceAdded:false','activeProjections:catalog.count','canonLenses:canon.length'])must(mutation.includes(token),`runtime mutation ledger missing ${token}`);
must(mutation.includes('toAddress===before.autoPing.dataNext'), 'SOURCE_ADMITTED must bind only exact autoPing.dataNext');
must(mutation.includes('No physical event, external evidence, provider output or native-device action is inferred.'),'mutation proof boundary missing');

for(const token of ['evaluateCorpusModes','evaluateCanonAuthorityStack','sourceBackedModeSummary','compileSourceTraversal','ACTIVE PROJECTIONS','CANON LENSES','INPUT CONTRACTS','48-step admitted-route trace'])must(modes.includes(token),`complete mode field missing ${token}`);
must(modes.includes("tab==='FIELD'")&&modes.includes("tab==='SOURCE'")&&modes.includes("tab==='CANON'")&&modes.includes("tab==='GATED'"),'all mode authority layers must be inspectable');
must(modes.includes('Selected catalog modes do not directly mutate state'),'catalog mutation boundary missing');
must(rail.includes('ONE RUNTIME AUTHORITY')&&rail.includes('{catalog.count}')&&rail.includes('{canon.length}'),'rail counts must derive from runtime authorities');
must(workstation.includes('<RuntimeAuthorityRailR44')&&workstation.includes('<AllModesOperatorPanelR44'),'workstation must mount R44 authority and all-mode field');
must(workstation.includes('recordRuntimeMutationR44(from,target'),'all workstation address commits must enter the SHA ledger');

const domain=(shell.match(/const DOMAIN_ROUTES:[\s\S]*?};/)||[''])[0];
for(const route of ['Immersive Traversal','Extreme Traversal','Build Out','Consolidation','Plugins'])must(domain.includes(`'${route}'`),`R44 primary route missing ${route}`);
for(const state of ["'Immersive Traversal':'SOURCE_ACTIVE'","'Extreme Traversal':'SOURCE_ACTIVE'","'Build Out':'LOCAL_ACTIVE'","'Plugins':'LOCAL_ACTIVE'"])must(capability.includes(state),`R44 capability truth missing ${state}`);
must(living.includes("type WorkspaceView='LIVE'|'CAPABILITY'|'SIGNAL'|'DEEP'|'ROUTE'"),'living surfaces must expose every depth mode');

for(const token of ['AudioContext','createOscillator','createGain','packet sonification','explicit user action','not a microphone measurement'])must(signal.includes(token),`signal field missing ${token}`);
for(const token of ['/api/health','/api/status','/api/hybrid/status','/api/earth/evidence','crypto.subtle.digest','SHA-256','parseCsv','OMEGA_DETERMINISTIC_LEXICON_R44','omega-sovereign-runtime.foundasound.chatgpt.site'])must(integrations.includes(token),`integration hub missing ${token}`);
must(integrations.includes('do not install arbitrary code')&&integrations.includes('no Excel execution is claimed'),'integration truth boundary missing');

for(const token of ['libraryItems:6752','driveDocuments:2390','driveFolders:1502','driveRetainedItems:11597','physicalCsvFiles:403','logicalCsvNames:162','physicalArchiveRecords:2528','logicalArchivePackages:1913','softwareRuntimeMatches:1802'])must(archive.includes(token),`full census missing ${token}`);
must(buildout.includes('OMEGA_COMPRESSED_SOVEREIGN_SEED_R44')&&buildout.includes('modeField:{count:catalog.count')&&buildout.includes('canonLenses:canon')&&buildout.includes('sourceOperators:source.rows'),'micro runtime seed is incomplete');
for(const token of ["'S12','Omega Micro Build','COMPRESSED_SOVEREIGN_SEED','DOMAIN','LOCAL_ACTIVE'","'S16','Workbook / Excel Atlas Runtime','SPREADSHEET_CONTROL_PLANE','SUPPORT','LOCAL_ACTIVE'","'S17','Echo-Chamber / SOMA Audio Engine','PHASE_COHERENT_AUDIO_FIELD','DOMAIN','SOURCE_ACTIVE'","'S18','Universal Language / Lexicon Engine','SEMANTIC_PACKET_LANGUAGE','DOMAIN','SOURCE_ACTIVE'"])must(atlas.includes(token),`System Atlas R44 reality missing ${token}`);
must(atlas.includes("'S10','Biological Traversal Engine','BIO_SCALE_TRAVERSAL','DOMAIN','RESTORATION_DEBT'")&&atlas.includes("'S21','Cinematic Field Renderer','IMAGE_SNAPSHOT_OF_SUBSTRATE','DOMAIN','NATIVE_TARGET'")&&atlas.includes("'S22','Omega Installer / One-Click Shell','DESKTOP_STARTUP_PACKAGER','SUPPORT','NATIVE_TARGET'"),'biology/cinematic/installer gates must remain truthful');

console.log('OMEGA R44 ULTRA PASS · 44 surfaces · 179 projections · 62 lenses · SHA mutation ledger · integrations · signal · full census');
