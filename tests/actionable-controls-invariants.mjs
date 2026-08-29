import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../src/',import.meta.url);
const files=fs.readdirSync(root).filter(n=>n.endsWith('.tsx')).sort();
const failures=[];
let buttons=0,roleButtons=0;

function openingTags(text){
  const out=[];
  for(let i=0;i<text.length;i++){
    if(text[i]!=='<'||text[i+1]==='/'||text[i+1]==='!'||text[i+1]==='>')continue;
    const m=text.slice(i+1).match(/^([A-Za-z][\w.]*)\b/);if(!m)continue;
    const name=m[1];let j=i+1+m[0].length,brace=0,quote='',escape=false;
    for(;j<text.length;j++){
      const c=text[j];
      if(quote){if(escape){escape=false;continue}if(c==='\\'){escape=true;continue}if(c===quote)quote='';continue}
      if(c==='"'||c==="'"){quote=c;continue}
      if(c==='{'){brace++;continue}if(c==='}'){brace=Math.max(0,brace-1);continue}
      if(c==='>'&&brace===0){out.push({name,attrs:text.slice(i+1+m[0].length,j),index:i});i=j;break}
    }
  }
  return out;
}

for(const name of files){
  const text=fs.readFileSync(new URL(name,root),'utf8');
  for(const tag of openingTags(text)){
    const line=text.slice(0,tag.index).split('\n').length;
    if(tag.name==='button'){
      buttons++;
      const actionable=/onClick\s*=|onMouseDown\s*=|onPointerDown\s*=|type\s*=\s*['"]submit['"]|disabled(?:\s|=|$)/.test(tag.attrs);
      if(!actionable)failures.push(`${name}:${line} button has no action, submit contract, or explicit disabled state`);
    }
    if(/\brole\s*=\s*['"]button['"]/.test(tag.attrs)){
      roleButtons++;
      if(!/onClick\s*=/.test(tag.attrs))failures.push(`${name}:${line} role=button has no click action`);
      if(!/tabIndex\s*=/.test(tag.attrs))failures.push(`${name}:${line} role=button is not keyboard focusable`);
      if(!/onKeyDown\s*=/.test(tag.attrs))failures.push(`${name}:${line} role=button has no keyboard activation`);
    }
  }
}
assert.ok(buttons>0,'button audit unexpectedly found zero TSX buttons');
assert.equal(failures.length,0,`Actionable-control audit failed (${failures.length}):\n${failures.join('\n')}`);
console.log(`actionable controls PASS · ${buttons} button tags + ${roleButtons} role-button controls audited across ${files.length} TSX files`);
