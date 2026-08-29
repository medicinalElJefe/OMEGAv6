import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src/uxSurpassR3.css','utf8');
const required=[
  "import './uxSurpassR3.css';",
  'safe-area-inset-top',
  'safe-area-inset-bottom',
  '@media(max-width:620px)',
  '.responsive-shell-rail{display:none!important}',
  '.mrc-menu-grid,.rr-menu-universe{grid-template-columns:1fr!important}',
  'padding-bottom:calc(96px + var(--omega-safe-bottom))',
  '.omega-nexus{width:100%!important;max-width:100%!important;max-height:100%!important',
  'touch-action:manipulation'
];
for(const needle of required){
  const hay=needle.startsWith('import ')?app:css;
  if(!hay.includes(needle)) throw new Error(`UX_SURPASS_R3 missing invariant: ${needle}`);
}
if(css.includes('position:fixed!important;z-index:70!important;right:14px!important;top:82px!important;bottom:14px!important;width:296px!important') && !css.includes('@media(max-width:980px)')) throw new Error('UX_SURPASS_R3 mobile rail suppression missing');
console.log('UX_SURPASS_R3_INVARIANTS PASS · safe-area + mobile containment locked');
