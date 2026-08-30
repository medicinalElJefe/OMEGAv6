import fs from 'node:fs';

const shell=fs.readFileSync(new URL('../src/SingleFrameRuntimeShellR27.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/shellR31.css',import.meta.url),'utf8');
const css32=fs.readFileSync(new URL('../src/shellR32.css',import.meta.url),'utf8');
const workstation=fs.readFileSync(new URL('../src/OmegaWorkstationFullV2.tsx',import.meta.url),'utf8');

const must=(ok,msg)=>{if(!ok)throw new Error(`R31/R32 shell invariant failed: ${msg}`)};

for(const label of ['Home','Ask','Connect','Earth','More']) must(shell.includes(`<span>${label}</span>`),`R32 mobile primary navigation must include ${label}`);
for(const domain of ["label:'Work'","label:'Explore'","label:'Intelligence'","label:'Evidence'","label:'System'"]) must(shell.includes(domain),`human domain missing ${domain}`);
for(const shortcut of ['Ask / Act','Continue work','Connect PC','Earth now','Evidence']) must(shell.includes(shortcut),`R32 direct shortcut missing ${shortcut}`);
for(const preserved of ['Matter Traversal','Visual Instrument','Relativity','Atlas','SAI Lab','Governance','Consolidation','System Atlas']) must(shell.includes(`'${preserved}'`),`accepted specialist route omitted: ${preserved}`);

must(!shell.includes('STATE {record?.state?.state}'),'mobile shell must not headline raw state telemetry');
must(css.includes('.command-experience-r4>.command-phase-context{display:none!important}'),'duplicate outer phase diagnostic must be removed from Command Center presentation');
must(css.includes('.command-mandala-stage{order:2!important;display:none!important}'),'mobile Command Center must not lead with the giant phase wheel');
must(css.includes('.command-composer{order:1!important'), 'mobile Command Center composer must be primary');
must(css32.includes('.r27-route>code{display:none!important}'),'R32 route numbers must be removed from visible menu hierarchy');
must(css32.includes('.r32-action-shortcuts'),'R32 action shortcut styling missing');
must(workstation.includes("panel==='Command Center'"),'Command Center route must remain implemented');
must(workstation.includes('<OmegaCommandDeck'),'Command Center must retain the real assistant deck');

console.log('R31/R32 shell invariants PASS · action-first navigation supersedes R31 labels without specialist regression');
