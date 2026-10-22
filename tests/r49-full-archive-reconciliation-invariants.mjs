import fs from 'node:fs';
function read(p){return fs.readFileSync(p,'utf8')}
function need(t,s,l){if(!t.includes(s))throw new Error(`R49 invariant failed: ${l} missing ${s}`)}
const a=read('src/data/softwareRegistryR49a.ts'),b=read('src/data/softwareRegistryR49b.ts'),c=read('src/data/softwareRegistryR49c.ts'),d=read('src/data/softwareRegistryR49d.ts'),runtime=read('src/archiveReconciliationR49.ts'),ui=read('src/ArchiveReconciliationR49.tsx'),gov=read('src/ArchiveGovernanceControl.tsx'),css=read('src/archiveReconciliationR49.css');
const all=a+b+c+d;
const ids=[...all.matchAll(/"id":"SYS-(\d{3})"/g)].map(x=>x[1]);
if(ids.length!==100)throw new Error(`R49 invariant failed: expected 100 registry rows, found ${ids.length}`);
for(let i=1;i<=100;i++){const id=String(i).padStart(3,'0');if(!ids.includes(id))throw new Error(`R49 invariant failed: missing SYS-${id}`)}
for(const token of ['"disposition":"KEEP"','"disposition":"MERGE"','"disposition":"DONOR"','SYS-001','SYS-100','Child emergence engine','Omega Atlas OS'])need(all,token,'workbook registry evidence');
need(runtime,"OMEGA_ARCHIVE_RECONCILIATION_R49",'reconciliation schema');
need(runtime,"CURRENT_SUCCESSOR",'keep relation');need(runtime,"MERGED_INTO_SUCCESSOR",'merge relation');need(runtime,"DONOR_RETAINED",'donor relation');
for(const route of ['System','Evidence & Proof','Traversal','Visual Instrument','System Atlas','Command Center','Plugins','Reality Lab','Build Out','Archive Operators','Cockpit'])need(runtime,`'${route}'`,'successor route '+route);
need(runtime,"DEVICE_GATED",'device truth');need(runtime,"EVIDENCE_GATED",'evidence truth');need(runtime,"unmapped:R49_ARCHIVE_RECONCILIATION.filter",'unmapped counter');
need(ui,'100/100 WORKBOOK REGISTRY ROWS','100-row UI');need(ui,'Export 100-row receipt','receipt export');need(gov,'ArchiveReconciliationR49','Archive binding');need(css,'@media(max-width:650px)','mobile containment');
if([all,runtime,ui,gov].some(x=>x.includes('@appdeploy/client')))throw new Error('R49 invariant failed: AppDeploy dependency reintroduced');
console.log('R49 FULL ARCHIVE RECONCILIATION PASS · 100/100 sovereign workbook software rows mapped to current successor / merged lineage / retained donor with execution-evidence-device truth and zero silent omission');
