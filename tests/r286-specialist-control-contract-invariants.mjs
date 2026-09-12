import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC=path.resolve('src');
const files=[];
const walk=dir=>{
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full);
    else if(/\.(tsx|jsx)$/.test(entry.name))files.push(full);
  }
};
walk(SRC);

const violations=[];
let nativeButtons=0;
let roleButtons=0;
let delegatedBySpread=0;
let honestlyDisabled=0;

const attrName=a=>ts.isIdentifier(a.name)?a.name.text:a.name.getText();
const attributes=node=>node.attributes.properties;
const getAttr=(node,name)=>attributes(node).find(a=>ts.isJsxAttribute(a)&&attrName(a)===name);
const hasSpread=node=>attributes(node).some(ts.isJsxSpreadAttribute);
const literalValue=a=>{
  if(!a||!ts.isJsxAttribute(a))return undefined;
  if(!a.initializer)return true;
  if(ts.isStringLiteral(a.initializer))return a.initializer.text;
  if(ts.isJsxExpression(a.initializer)){
    const e=a.initializer.expression;
    if(!e)return undefined;
    if(e.kind===ts.SyntaxKind.TrueKeyword)return true;
    if(e.kind===ts.SyntaxKind.FalseKeyword)return false;
    if(ts.isStringLiteral(e)||ts.isNoSubstitutionTemplateLiteral(e))return e.text;
  }
  return undefined;
};
const meaningfulHandler=a=>{
  if(!a||!ts.isJsxAttribute(a)||!a.initializer)return false;
  if(ts.isStringLiteral(a.initializer))return a.initializer.text.trim().length>0;
  if(!ts.isJsxExpression(a.initializer)||!a.initializer.expression)return false;
  const e=a.initializer.expression;
  if(e.kind===ts.SyntaxKind.NullKeyword||e.kind===ts.SyntaxKind.UndefinedKeyword||e.kind===ts.SyntaxKind.FalseKeyword)return false;
  if(ts.isArrowFunction(e)||ts.isFunctionExpression(e)){
    if(ts.isBlock(e.body))return e.body.statements.length>0;
    if(e.body.kind===ts.SyntaxKind.NullKeyword||e.body.kind===ts.SyntaxKind.UndefinedKeyword||e.body.kind===ts.SyntaxKind.FalseKeyword)return false;
  }
  return true;
};
const handlerNames=['onClick','onPointerUp','onPointerDown','onMouseUp','onMouseDown'];
const keyboardNames=['onKeyDown','onKeyUp','onKeyPress'];
const hasAction=node=>handlerNames.some(n=>meaningfulHandler(getAttr(node,n)));
const hasKeyboard=node=>keyboardNames.some(n=>meaningfulHandler(getAttr(node,n)));
const isHonestDisabled=node=>literalValue(getAttr(node,'disabled'))===true||String(literalValue(getAttr(node,'aria-disabled'))).toLowerCase()==='true';
const isSubmitOrReset=node=>['submit','reset'].includes(String(literalValue(getAttr(node,'type'))||'').toLowerCase());
const hasFormAction=node=>Boolean(getAttr(node,'formAction'));

for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.JSX);
  const stack=[];
  const visit=node=>{
    const opening=ts.isJsxElement(node)?node.openingElement:(ts.isJsxSelfClosingElement(node)?node:null);
    if(opening){
      const tag=opening.tagName.getText(sf);
      const role=String(literalValue(getAttr(opening,'role'))||'').toLowerCase();
      const isNative=tag==='button';
      const isRoleButton=!isNative&&role==='button';
      if(isNative||isRoleButton){
        if(isNative)nativeButtons++; else roleButtons++;
        const line=sf.getLineAndCharacterOfPosition(opening.getStart(sf)).line+1;
        const where=`${path.relative(process.cwd(),file)}:${line}`;
        const disabled=isHonestDisabled(opening);
        if(disabled)honestlyDisabled++;
        const spread=hasSpread(opening);
        if(spread)delegatedBySpread++;
        const actionable=hasAction(opening)||hasFormAction(opening)||(isNative&&isSubmitOrReset(opening))||spread;
        if(!disabled&&!actionable)violations.push(`${where} renders an enabled ${isNative?'button':'role=button'} without an action binding, submit/reset contract, formAction, or delegated props`);
        if(isRoleButton&&!disabled&&!spread){
          const tagIsAnchor=tag==='a'&&Boolean(getAttr(opening,'href'));
          if(!tagIsAnchor&&!hasKeyboard(opening))violations.push(`${where} role=button is missing keyboard activation`);
        }
        if(isNative&&stack.includes('button'))violations.push(`${where} nests a button inside another button`);
      }
    }
    if(ts.isJsxElement(node)){
      const tag=node.openingElement.tagName.getText(sf);
      stack.push(tag);
      ts.forEachChild(node,visit);
      stack.pop();
      return;
    }
    ts.forEachChild(node,visit);
  };
  visit(sf);
}

assert.ok(nativeButtons>0,'R286 expected rendered native buttons in src');
assert.equal(violations.length,0,`R286 no-dead-control static contract failed:\n${violations.join('\n')}`);
console.log(`R286 STATIC NO-DEAD-CONTROL PASS · ${files.length} JSX/TSX files · ${nativeButtons} native buttons · ${roleButtons} role buttons · ${delegatedBySpread} delegated/spread controls · ${honestlyDisabled} explicitly disabled controls · zero unbound enabled controls · zero nested-button regressions.`);
