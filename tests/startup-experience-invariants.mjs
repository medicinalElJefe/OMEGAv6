import fs from 'node:fs';

const home=fs.readFileSync('src/OmegaHome.tsx','utf8');
const daily=fs.readFileSync('src/dailyBrief.ts','utf8');
const shell=fs.readFileSync('src/ResponsiveRuntimeShell.tsx','utf8');
const menu=fs.readFileSync('src/menuUniverse.css','utf8');
const fail=(m)=>{throw new Error(m)};

for(const token of ['dailyBrief()','OMEGA curated operating lesson','EXPLORE THIS IDEA','44 routed surfaces','/api/route-preview','/api/chat']){
  if(!(home+daily).includes(token))fail(`startup experience missing ${token}`);
}
for(const destination of ['Field','Evidence & Proof','Relativity','Matter Traversal','Memory','Scale Compiler','Forecast','Extreme Traversal']){
  if(!shell.includes(`'${destination}'`)&&!home.includes(`'${destination}'`))fail(`daily destination not routed: ${destination}`);
}
const surfaceMatches=[...shell.matchAll(/\['(?:STUDIO|OPERATIONS|WORK|INTELLIGENCE|GOVERNANCE|SYSTEM)','\d+','([^']+)'\]/g)];
if(surfaceMatches.length!==44)fail(`expected 44 workstation menu surfaces, found ${surfaceMatches.length}`);
if(new Set(surfaceMatches.map(x=>x[1])).size!==44)fail('workstation menu contains duplicate surface names');
for(const token of ['rr-menu-universe','mrc-menu-group','grid-template-columns','border-radius'])if(!menu.includes(token))fail(`professional menu styling missing ${token}`);
if(home.includes('@appdeploy/client')||daily.includes('@appdeploy/client')||shell.includes('@appdeploy/client'))fail('AppDeploy runtime dependency is forbidden');
console.log('startup experience invariants: PASS');
