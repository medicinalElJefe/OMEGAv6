import fs from 'node:fs';
import assert from 'node:assert/strict';

const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
const css=fs.readFileSync('src/navigationExperienceR155.css','utf8');
const registry=fs.readFileSync('src/navigationRegistry.ts','utf8');

const routes=[...registry.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(routes.length,44,'R155 must preserve all 44 canonical destinations');
for(const name of routes)assert(shell.includes(`'${name}'`),`R155 active shell must retain ${name}`);

for(const token of [
 "import {omegaNavItem} from './navigationRegistry'",
 "label:'Work',displayLabel:'Do & Build'",
 "label:'Explore',displayLabel:'Explore & Model'",
 "label:'Intelligence',displayLabel:'Think & Learn'",
 "label:'Evidence',displayLabel:'Prove & Validate'",
 "label:'System',displayLabel:'System & Control'",
 'routeSearchText',
 "item?.hint",
 "effectLabel(item?.effect)",
 "authorityLabel(item?.authority)",
 "className='r155-current-route'",
 "className='r155-context-details'",
 "className='r155-route-list'",
 "Search by goal: build, proof, motion, PC…",
 "Browse all instruments",
 "44 reachable instruments",
 "Advanced / restored",
 "What should OMEGA do now?",
 "className='r33-all-tools'",
 "data-r155-all-tools",
 "direct('Earth Now')",
 'Continue work',
 'Connect PC'
])assert(shell.includes(token),`R155 shell missing ${token}`);

assert.match(shell,/routeSearchText=\(name:string\)=>\{const item=omegaNavItem\(name\);return `\$\{name\} \$\{item\?\.hint\|\|''\} \$\{item\?\.group\|\|''\} \$\{item\?\.effect\|\|''\} \$\{item\?\.authority\|\|''\}`\.toLowerCase\(\)\}/,'R155 search must discover routes by purpose and truth metadata, not only route names');
assert.match(shell,/onClick=\{\(\)=>\{onNavigate\(name\);close\?\.\(\)\}\}/,'R155 route controls must retain direct navigation');
assert.match(shell,/r155-context-details[^>]*><summary>/,'R155 diagnostic packet must be progressively disclosed');

for(const token of [
 '.r155-navigation .r38-route-flyout',
 'width:min(430px,calc(100vw - 104px))',
 '.r155-route-copy>small',
 '-webkit-line-clamp:2',
 '.r155-route-copy>em>i',
 '.r155-current-route',
 '.r155-context-details',
 '.r155-mobile-drawer',
 '[data-r155-all-tools]',
 '.r27-mobile-domains button>span>small',
 '@media(max-width:520px)',
 '@media(prefers-reduced-motion:reduce)'
])assert(css.includes(token),`R155 navigation CSS missing ${token}`);

assert(!css.includes('width:100vw!important'),'R155 desktop flyout must not become a permanent full-screen obstruction');
console.log('PASS R155 navigation information architecture · purpose-first routes + progressive proof context + responsive menu hierarchy');
