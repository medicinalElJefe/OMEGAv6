import fs from 'node:fs';
import path from 'node:path';
const must=(ok,msg)=>{if(!ok)throw new Error('R107 CONTROL '+msg)};
const root='src';
const registry=fs.readFileSync(path.join(root,'omegaExperienceRegistryR82.ts'),'utf8');
const routeBlocks=[...registry.matchAll(/routes:\[([^\]]*)\]/g)].map(x=>x[1]);
const routes=new Set(routeBlocks.flatMap(block=>[...block.matchAll(/'([^']+)'/g)].map(x=>x[1])));
must(routes.size>0,'registered route inventory unexpectedly empty');

const files=fs.readdirSync(root).filter(n=>n.endsWith('.tsx')).sort();
const failures=[];let buttons=0,literalRoutes=0;
const noops=[
 /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g,
 /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*(?:null|undefined|false)\s*\}/g,
 /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*console\.(?:log|debug|info)\s*\(/g,
 /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*Promise\.resolve\(\)\s*\}/g
];
for(const name of files){
 const text=fs.readFileSync(path.join(root,name),'utf8');
 buttons+=(text.match(/<button\b/g)||[]).length;
 for(const pattern of noops){pattern.lastIndex=0;let m;while((m=pattern.exec(text)))failures.push(`${name}: no-op/decorative onClick near offset ${m.index}`)}
 for(const m of text.matchAll(/onNavigate\(\s*['"]([^'"]+)['"]\s*\)/g)){
  literalRoutes++;const target=m[1];if(!routes.has(target))failures.push(`${name}: literal onNavigate target is not registered: ${target}`);
 }
 // Direct browser-open buttons must identify a destination or have a real click handler; anchors own URL navigation separately.
 for(const m of text.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){
  const attrs=m[1],body=m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  if(!/onClick\s*=|onMouseDown\s*=|onPointerDown\s*=|type\s*=\s*['"]submit['"]|disabled(?:\s|=|$)/.test(attrs))failures.push(`${name}: button '${body.slice(0,70)}' has no bounded action/submit/gated state`);
 }
}
must(buttons>0,'no buttons discovered');
must(literalRoutes>0,'no literal onNavigate controls discovered');
must(failures.length===0,`control truth audit failed (${failures.length})\n${failures.slice(0,80).join('\n')}`);

const accepted=fs.readFileSync(path.join(root,'acceptedProductionContractR95.ts'),'utf8');
must(accepted.includes("id:'CONTROL_ACTION_TRUTH'")&&accepted.includes('Empty callbacks, decorative buttons, mislabeled route targets'),'persistent control-action truth law missing');
console.log(`R107 CONTROL ACTION TRUTH PASS · ${buttons} button tags scanned · ${literalRoutes} literal application navigation targets resolve to registered destinations · no obvious no-op callbacks`);
