import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src/omegaVisualIdentity.css','utf8');
const required=[
  "import './omegaVisualIdentity.css'",
  '.special-app{',
  '.omega-home{',
  '.family-orbit{',
  '.device-stage{',
  '@media(max-width:620px)',
  '@media(prefers-reduced-motion:no-preference)'
];
for(const token of required){const source=token.startsWith('import')?app:css;if(!source.includes(token))throw new Error(`visual identity invariant missing: ${token}`)}
if(css.includes('rainbow')||css.includes('linear-gradient(90deg,red,orange'))throw new Error('disallowed generic rainbow visual motif');
if((css.match(/border-radius:999px/g)||[]).length<3)throw new Error('instrument control language not established');
if(!css.includes('--omega-gold')||!css.includes('--omega-teal'))throw new Error('OMEGA visual token system missing');
console.log('visual identity invariants PASS');
