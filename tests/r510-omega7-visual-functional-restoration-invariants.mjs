import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const home=fs.readFileSync('src/OmegaHomeR71.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');

for(const token of [
 "lazy,Suspense",
 "const OmegaHomeR71=lazy(()=>import('../src/OmegaHomeR71'))",
 "data-r510-visual-restoration='CURRENT_R71_CANONICAL_HOME'",
 "<OmegaHomeR71",
 "embedded",
 "onOpenAllTools",
 "onOpenSystemMap",
])assert.ok(root.includes(token),'R510 root missing '+token);

for(const legacy of [
 "className='o7-home-actions'",
 "What do you want to do?",
 "<b>Ask OMEGA</b>",
 "<b>Projects</b><span>Continue active work</span>",
])assert.equal(root.includes(legacy),false,'R510 old button-board HOME remains: '+legacy);

for(const token of [
 "type Props={onEnter:(panel:string)=>void;embedded?:boolean;onOpenAllTools?:()=>void;onOpenSystemMap?:()=>void}",
 "data-r510-embedded={embedded?'true':'false'}",
 "{!embedded&&<OmegaSideNavigatorR88 onNavigate={enter}/>}","if(embedded){onOpenAllTools?.();return}",
 "if(embedded){if(onOpenSystemMap)onOpenSystemMap();else enter('System Atlas');return}",
])assert.ok(home.includes(token),'R510 embeddable R71 contract missing '+token);

for(const token of [
 "R510 · VISUAL + FUNCTIONAL PRODUCTION CONVERGENCE",
 ".o7-home-established>.r71-home",
 ".o7-home-established .r96-workbench",
 ".o7-home-established .r71-field .r134-stage",
 ".o7-home-established .r121-home-membrane .r95-membrane-stage",
 ".o7-app[data-depth=standard] .o7-home-established~.o7-recovered",
 ".o7-app[data-depth=standard] .o7-home-established~.o7-capability-section",
])assert.ok(css.includes(token),'R510 visual hierarchy CSS missing '+token);

assert.ok(ci.includes('r510-omega7-visual-functional-browser-e2e.mjs'),'R510 browser proof must be wired into governed CI/deployment');

console.log('R510 VISUAL-FUNCTIONAL SOURCE PASS · current R71 visual workbench owns OMEGA7 HOME · old button board removed · duplicate navigator suppressed · deployed browser proof required');
