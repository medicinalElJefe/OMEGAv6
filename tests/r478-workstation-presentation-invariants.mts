import assert from 'node:assert/strict';import fs from 'node:fs';
const ui=fs.readFileSync('src/CapabilitySurfaceR478.tsx','utf8'),ws=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8'),css=fs.readFileSync('src/workstationV2.css','utf8');
for(const token of ["PRESENTATION_CONSERVATION_R478","data-r478-capability-surface","Search conserved capabilities","data-r478-operation","omega.r478.operation","omega:r478-operation-selected","onNavigate(x.route)"])assert.ok(ui.includes(token),'R478 capability surface missing '+token);
assert.ok(ws.includes("import CapabilitySurfaceR478"),'workstation missing R478 surface import');assert.ok(ws.includes("<CapabilitySurfaceR478 currentRoute={panel} onNavigate={go}/>"),'workstation missing mounted R478 operation surface');
assert.ok(css.includes('.r478-capability-surface')&&css.includes('@media(max-width:560px)'),'R478 surface missing responsive presentation');
console.log('R478 WORKSTATION PRESENTATION PASS');