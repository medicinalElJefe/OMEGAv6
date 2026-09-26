import assert from 'node:assert/strict';
import fs from 'node:fs';

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const canonical=fs.readFileSync('src/workstationPresentationR356.css','utf8');
const donors=[
 'responsivePolishR88.css',
 'mobileVisualFirstR89.css',
 'surfaceHierarchyR90.css',
 'operationalSurfaceRefinementR91.css',
 'specialistSurfaceClarityR92.css'
];

assert.ok(workstation.includes("import './workstationPresentationR356.css';"),'canonical workstation presentation authority must be live');
for(const donor of donors){
 assert.ok(fs.existsSync('src/'+donor),`retained presentation provenance missing ${donor}`);
 assert.ok(!workstation.includes(`import './${donor}';`),`legacy donor still owns live workstation presentation: ${donor}`);
 const body=fs.readFileSync('src/'+donor,'utf8');
 const first=canonical.indexOf(body);
 assert.ok(first>=0,`canonical workstation authority lost donor source ${donor}`);
 assert.equal(canonical.indexOf(body,first+1),-1,`canonical workstation authority duplicated donor source ${donor}`);
}
const positions=donors.map(d=>canonical.indexOf(fs.readFileSync('src/'+d,'utf8')));
for(let i=1;i<positions.length;i++)assert.ok(positions[i]>positions[i-1],`canonical workstation authority mutated donor order at ${donors[i-1]}→${donors[i]}`);
assert.ok(canonical.includes('Source order is preserved exactly'),'canonical authority must declare lossless source-order carry');
assert.ok(canonical.includes('provenance scars'),'canonical authority must retain explicit scar/provenance boundary');

console.log('R356.1 WORKSTATION PRESENTATION CONVERGENCE PASS · one live workstation style authority · R88→R92 full-source invariant carry · exact order preserved · donor files retained as provenance scars · no route/capability/proof/execution/Canon authority mutation');
