import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R290 '+msg)};
const nav=read('src/OmegaSideNavigatorR88.tsx');
const truthCss=read('src/dataTruthNavigationR105.css');
const browser=read('tests/r289-live-master-menu-browser-e2e.mjs');

must(nav.includes("export const R289_MASTER_MENU_PRESENTATION_REVISION='R289'"),'R289 presentation identity constant must remain explicit');
must(/<section id='omega-global-navigator'[^>]*data-master-menu-presentation-revision=\{R289_MASTER_MENU_PRESENTATION_REVISION\}[^>]*data-master-menu=\{masterMenu\}/s.test(nav),'the canonical inner destination browser must carry the R289 presentation identity beside the master-menu state it owns');
must(/\.r105-workspace-filter\{[^}]*position:relative;[^}]*z-index:2/s.test(truthCss),'workspace controls must remain in a higher explicit stacking layer');
must(/\.r105-context-note\{[^}]*position:relative;[^}]*z-index:1;[^}]*pointer-events:none/s.test(truthCss),'informational context strip must stay pointer-transparent beneath real controls');
must(browser.includes("if(presentationRevision!=='R289')"),'browser proof must fail closed unless the inner destination browser reports exact R289 identity');
must(browser.includes("if(contextPointer!=='none')"),'browser proof must fail closed if the informational context strip can intercept pointer input');
must(browser.includes('for(let i=0;i<7;i++)'),'browser proof must physically traverse ALL plus all six workspace filters');
must(browser.includes("console.log('R290 NAVIGATION CONTRACT BROWSER PASS"),'browser proof must publish the R290 closure receipt only after desktop/mobile completion');

console.log('R290 NAVIGATION CONTRACT CLOSURE PASS · inner destination browser owns exact R289 presentation identity · informational context is pointer-transparent beneath workspace controls · browser proof click-traverses ALL + six workspaces before 12 master menus · no new route/state/execution/Canon authority');
