import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=new URL('../src/',import.meta.url);
const files=fs.readdirSync(root).filter(n=>n.endsWith('.tsx')).sort();
const failures=[];
let buttons=0,roleButtons=0;
for(const name of files){
  const text=fs.readFileSync(new URL(name,root),'utf8');
  for(const match of text.matchAll(/<button\b([\s\S]*?)>/g)){
    buttons++;
    const attrs=match[1];
    const actionable=/onClick\s*=|onMouseDown\s*=|onPointerDown\s*=|type\s*=\s*['"]submit['"]|disabled(?:\s|=|$)/.test(attrs);
    if(!actionable){
      const before=text.slice(0,match.index);const line=before.split('\n').length;
      failures.push(`${name}:${line} button has no action, submit contract, or explicit disabled state`);
    }
  }
  for(const match of text.matchAll(/<([A-Za-z][\w.]*)\b([^>]*\brole\s*=\s*['"]button['"][^>]*)>/g)){
    roleButtons++;
    const attrs=match[2];
    const before=text.slice(0,match.index);const line=before.split('\n').length;
    if(!/onClick\s*=/.test(attrs))failures.push(`${name}:${line} role=button has no click action`);
    if(!/tabIndex\s*=/.test(attrs))failures.push(`${name}:${line} role=button is not keyboard focusable`);
    if(!/onKeyDown\s*=/.test(attrs))failures.push(`${name}:${line} role=button has no keyboard activation`);
  }
}
assert.ok(buttons>0,'button audit unexpectedly found zero TSX buttons');
assert.equal(failures.length,0,`Actionable-control audit failed (${failures.length}):\n${failures.join('\n')}`);
console.log(`actionable controls PASS · ${buttons} button tags + ${roleButtons} role-button controls audited across ${files.length} TSX files`);
