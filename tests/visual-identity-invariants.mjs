import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src/omegaVisualIdentity.css','utf8');
const aura=fs.readFileSync('src/ArchiveContinuityAura.tsx','utf8');
const auraCss=fs.readFileSync('src/ArchiveContinuityAura.css','utf8');
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
const lineage=['ArchiveContinuityAura','atlas_runtime_test_bundle','Mode188_Atlas_Camera_Shell_v11','CanonConsoleOmega v24/v31r1','Dewey_Full_PC_Runtime_188','Drive B015 R1 authority','20736 Geometry'];
for(const token of lineage){const source=token==='ArchiveContinuityAura'?app:aura;if(!source.includes(token))throw new Error(`archive visual lineage missing: ${token}`)}
for(const token of ['archive-continuity-aura','.aca-thread','.aca-node','@media(prefers-reduced-motion:reduce)'])if(!auraCss.includes(token))throw new Error(`archive continuity style missing: ${token}`);
if(css.includes('rainbow')||css.includes('linear-gradient(90deg,red,orange')||auraCss.includes('rainbow'))throw new Error('disallowed generic rainbow visual motif');
if((css.match(/border-radius:999px/g)||[]).length<3)throw new Error('instrument control language not established');
if(!css.includes('--omega-gold')||!css.includes('--omega-teal'))throw new Error('OMEGA visual token system missing');
console.log('visual identity invariants PASS');
