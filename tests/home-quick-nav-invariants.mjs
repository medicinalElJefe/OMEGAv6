import fs from 'node:fs';
const home=fs.readFileSync('src/OmegaHome.tsx','utf8');
for(const route of ['Visual Instrument','Atlas','Evidence & Proof','Development','System Atlas','Control Matrix','Forecast','SAI Lab']){if(!home.includes(route))throw new Error(`HOME_QUICK_NAV missing ${route}`)}
const quick=home.match(/const QUICK=\[(.*?)\] as const;/s)?.[1]||'';
if(quick.includes('Build Out'))throw new Error('HOME_QUICK_NAV must not advertise restoration-debt Build Out');
if(!home.includes('OPEN FULL WORKSTATION'))throw new Error('HOME_QUICK_NAV missing full-workstation handoff');
for(const route of ['Command Center','Matter Traversal','Relativity','Earth Now'])if(!home.includes(`panel:'${route}'`))throw new Error(`HOME_QUICK_NAV missing first-user journey ${route}`);
console.log('HOME_QUICK_NAV R25 PASS · only operational quick routes');
