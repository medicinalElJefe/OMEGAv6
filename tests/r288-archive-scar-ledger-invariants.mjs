import fs from 'node:fs';
const s=fs.readFileSync('src/archiveGenomeLedgerR288c.ts','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R288C invariant failed: ${msg}`)};
for(const token of [
 "id:'AG-023'","id:'AG-024'","id:'AG-025'",
 'ADM_Research_Engine.xlsx','research model and test harness',
 'RECONSTRUC_OMEGA_B053_R9_J_DRIVE_FULL_SYSTEM.py','multi-part archive manifest adapter','safe extraction library','master-size/hash verification',
 'OMEGA_HYBRID_LINK_BRIDGE.ps1','protected token storage','visible-window assertions','password-field checks','macro recording/replay',
 'SCAR-R288-001','SCAR-R288-002','SCAR-R288-003','SCAR-R288-004','SCAR-R288-005',
 'Built/tested/accepted/deployed/superseded/current are distinct states'
])must(s.includes(token),`missing ${token}`);
must(s.includes('Failed/stale builds remain quarantined'),'crash lineage quarantine boundary missing');
must(s.includes('historical PowerShell bridge is not the current execution authority'),'Hybrid historical authority boundary missing');
must(s.includes('malicious ZIP corpus must be rejected'),'safe extraction adversarial regression missing');
must(s.includes('historical acceptance receipt cannot satisfy current exact-head/live-device proof gate'),'historical receipt regression missing');
const ids=[...s.matchAll(/id:'AG-(\d{3})'/g)].map(x=>x[1]);
must(ids.length===3,'R288C must contribute exactly AG-023..AG-025');
const scars=[...s.matchAll(/id:'SCAR-R288-(\d{3})'/g)].map(x=>x[1]);
must(scars.length>=5,'expected at least five archive scars');
console.log(`R288C ARCHIVE SCAR LEDGER PASS · ${ids.length} new upgrade rows · ${scars.length} failure-derived regression scars`);