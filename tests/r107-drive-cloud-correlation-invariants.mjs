import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R107 SOURCE/CLOUD '+msg)};

const source=read('src/sourceCorpusCorrelationR107.ts');
const systemLedger=read('src/softwareMasterLedgerR83.ts');
const hostLedger=read('src/hostBuildLedgerR83.ts');
const calculus=read('src/unifiedCalculus.ts');
const modes=read('src/sourceBackedModeRuntimeR21.ts');
const inspector=read('src/FullCalculusFabricR107.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');
const federation=read('public/omega-federation.json');

// Connected Drive corpus is represented by stable titles/contracts, never private file locators or credentials.
must(systemLedger.includes("name:'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx'")&&source.includes('title:MASTER_SYSTEM_SOURCE_R83.name'),'one-system Drive source contract must flow through the recovered ledger authority');
must(hostLedger.includes("name:'OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx'")&&source.includes('title:HOST_BUILD_SOURCE_R83.name'),'J-drive source contract must flow through the recovered host-build authority');
for(const title of [
 'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',
 'Dewey_Calculus_20736D_ENTIRE_Full_Canon_Trig_Water_Scar_Mode188_Atlas.xlsx',
 'Dewey_248832D_MASTER_INDEX_CHARTS.xlsx',
 'dewey_science_bridge_validation_workbook.xlsx'
])must(source.includes(title),'Drive authority title missing: '+title);
for(const forbidden of ['drive.google.com','docs.google.com','usp=drivesdk','ouid=','1GTLf_QOo9ebDYXkpnrEcyjM-wKsUxH4O','1wGA2rK5BbNAhWcm8c7lb18ytvagTpc3W'])must(!source.includes(forbidden),'source correlation module must not publish private Drive locator: '+forbidden);

// Source-ledger dimensions/capabilities correlate with recovered runtime ledgers instead of becoming duplicate state.
must(systemLedger.includes('reviewedSystemRows:100')&&systemLedger.includes('reviewedMenuOptions:36')&&systemLedger.includes('reviewedCapabilities:18'),'one-system source counts missing');
must(hostLedger.includes('softwareRows:57')&&hostLedger.includes('autoPingCells:1728')&&hostLedger.includes('12 Domains × 12 Phases × 12 Regulation states'),'J-drive auto-ping lineage missing');
must(source.includes('FAMILIES.length*24*12*4')&&source.includes('20,736 packet reference lattice')&&source.includes('61,917,364,224 virtual/address design capacity'),'full software-universe correlation missing');
must(source.includes('248,832 = 12 × 20,736')&&source.includes('AutoPing is internal deterministic state routing, not a live network/API ping')&&source.includes('physicalDimensionClaim:false'),'248,832 master index must remain a representational source layer with explicit AutoPing/physics boundary');
must(source.includes("schema:'OMEGA_ULTIMATE_DEVELOPMENT_FABRIC_R107'")&&source.includes("correlationOrder:['SOURCE','STATE','CALCULUS','MODES','LAYERS','CAPABILITY','RUNTIME','OBSERVATION','ACTION','PROOF','ADMISSION']"),'single correlated development order missing');

// Full calculus remains exact where source-backed and empirically bounded where not validated.
must(modes.includes("exact('M001'")&&modes.includes("exact('M009'")&&modes.includes("gated('M020'"),'source-backed/gated calculus execution boundaries lost');
must(calculus.includes('fullAlignment:{formula:')&&calculus.includes('ready:false'),'expanded uncalibrated calculus must remain gated');
must(source.includes('external dataset required for host validation')&&source.includes('out-of-sample performance must beat simple baselines')&&source.includes('does not claim new physics'),'scientific validation boundary must be explicit');

// Cloud plugins/federation remain specialists under one canonical admission authority.
for(const role of ['Genesis = PROPOSE','Optical = SCREEN','Sovereign Compute = SOLVE','OMEGAv6 = ADMIT'])must(source.includes(role),'cloud role correlation missing '+role);
must(federation.includes('"canonicalAuthority":"OMEGAv6"')||federation.includes('"canonicalAuthority": "OMEGAv6"'),'federation manifest must retain OMEGAv6 canonical authority');
must(source.includes('current authenticated heartbeat')&&source.includes('Optical can be access-gated'),'cloud/native truth gates missing');

// The correlation is visible but progressive and does not become another renderer or truth owner.
must(inspector.includes("SOURCE_CORPUS_AUTHORITIES_R107")&&inspector.includes('Drive corpus + cloud correlation'),'global calculus inspector must expose source/cloud correlation');
must(inspector.includes("<details className='r107-calculus-fabric'"),'correlation must stay progressive disclosure');
must(accepted.includes("id:'SOURCE_CORPUS_CORRELATION'")&&accepted.includes("id:'EMPIRICAL_VALIDATION_REQUIRED'"),'persistent Drive/cloud/science correlation laws missing');

console.log('R107 DRIVE + CLOUD CORRELATION PASS · Drive design/calculus/248832/validation authorities correlated without private locators · cloud specialist roles preserved · all-mode/calculus execution remains evidence gated');
