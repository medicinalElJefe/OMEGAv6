import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const navCss=read('src/omegaSideNavigatorR210.css');
const responsive=read('src/responsivePolishR88.css');
const navBase=read('src/omegaSideNavigatorR88.css');
const must=(ok,msg)=>assert.ok(ok,`R300 ${msg}`);

for(const token of ['scrollbar-gutter:stable',"[tabindex]:not([tabindex='-1'])",'touch-action:manipulation','@media(any-pointer:coarse)','min-width:44px!important','min-height:44px!important','@media(prefers-reduced-motion:reduce)','animation:none!important','scroll-behavior:auto!important'])must(navCss.includes(token),`navigation polish missing ${token}`);
for(const token of ['-webkit-text-size-adjust:100%','text-size-adjust:100%','touch-action:manipulation','env(safe-area-inset-right,0px)','env(safe-area-inset-left,0px)','env(safe-area-inset-bottom,0px)','scrollbar-gutter:stable','@media(any-pointer:coarse)','min-height:44px','@media(prefers-reduced-motion:reduce)'])must(responsive.includes(token),`responsive polish missing ${token}`);
must(responsive.includes('padding:10px max(8px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px))!important'),'mobile workstation must honor left/right/bottom safe-area insets simultaneously');
must(navCss.includes(':where(.r88-head-actions button,.r89-nav-mode button,.r94-rail-action)'),'coarse-pointer touch-target rule must cover the undersized navigator head, mode and rail controls');
must(navBase.includes('.r88-head-actions button{width:36px;height:36px')&&navBase.includes('.r89-nav-mode button{')&&navBase.includes('min-height:32px'),'R300 touch-target repair must remain anchored to real sub-44px inherited controls');
must(navBase.includes('env(safe-area-inset-top,0px)')&&navBase.includes('env(safe-area-inset-bottom,0px)'),'existing navigator top/bottom safe-area handling must remain intact');
must(!navCss.includes('fetch(')&&!responsive.includes('fetch('),'visual polish may not introduce backend access');
must(!navCss.includes('/api/')&&!responsive.includes('/api/'),'visual polish may not introduce execution/API authority');
console.log('R300 VISUAL + INTERACTION POLISH PASS · 44px coarse-pointer controls · complete mobile safe-area padding · broader keyboard focus · stable scroll gutters · direct touch manipulation · reduced-motion containment · no new runtime/Canon/deploy authority');
