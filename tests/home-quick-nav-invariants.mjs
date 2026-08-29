import fs from 'node:fs';
const home=fs.readFileSync('src/OmegaHome.tsx','utf8');
for(const route of ['Visual Instrument','Atlas','Evidence & Proof','Build Out','System Atlas','Control Matrix']){if(!home.includes(route))throw new Error(`HOME_QUICK_NAV missing ${route}`)}
if(!home.includes('ALL 44 IN WORKSTATION'))throw new Error('HOME_QUICK_NAV missing full-workstation handoff');
console.log('HOME_QUICK_NAV PASS');
