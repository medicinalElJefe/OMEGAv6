import fs from 'node:fs';
import {Buffer} from 'node:buffer';
import ts from 'typescript';

const must=(value,message)=>{if(!value)throw new Error(message)};
const source=fs.readFileSync('src/systemFoundryDependencyGateR276.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const propagate=mod.propagateDependencyBlocksR276;
must(typeof propagate==='function','R276 propagation function must compile and export');

const cap=(id,status='ACTIVE',dependsOn=[],blockers=[],executor='CLOUD')=>({
 id,label:id,layer:'COMPUTATION',inputs:[],outputs:[],operators:[],allowedExecutors:['CLOUD'],evidence:['NONE'],sideEffect:false,cost:1,latency:1,
 dependsOn,status,executor:status==='BLOCKED'?null:executor,blockers:[...blockers]
});
const frontier=[
 cap('root','BLOCKED',[],['DIRECT_EVIDENCE']),
 cap('child','ACTIVE',['root']),
 cap('leaf','ACTIVE',['child']),
 cap('independent'),
 cap('cycle-a','BLOCKED',['cycle-b'],['DIRECT_CYCLE']),
 cap('cycle-b','ACTIVE',['cycle-a'])
];
const before=JSON.stringify(frontier);
const out=propagate(frontier);
const byId=new Map(out.map(row=>[row.id,row]));

must(JSON.stringify(frontier)===before,'R276 must not mutate the input frontier');
must(byId.get('root').blockers.includes('DIRECT_EVIDENCE'),'direct blockers must be preserved');
must(byId.get('child').status==='BLOCKED'&&byId.get('child').executor===null,'direct dependent must fail closed and lose executor placement');
must(byId.get('child').blockers.includes('DEPENDENCY_BLOCKED:root'),'direct dependency blocker token missing');
must(byId.get('leaf').status==='BLOCKED'&&byId.get('leaf').blockers.includes('DEPENDENCY_BLOCKED:child'),'transitive dependency block must propagate to fixed point');
must(byId.get('independent').status==='ACTIVE'&&byId.get('independent').executor==='CLOUD'&&byId.get('independent').blockers.length===0,'independent capability must remain active');
must(byId.get('cycle-a').blockers.includes('DIRECT_CYCLE')&&byId.get('cycle-a').blockers.includes('DEPENDENCY_BLOCKED:cycle-b'),'cycle member must retain its direct blocker and converge with propagated blocker');
must(byId.get('cycle-b').status==='BLOCKED'&&byId.get('cycle-b').blockers.includes('DEPENDENCY_BLOCKED:cycle-a'),'blocked cycle must converge fail closed');
const twice=propagate(out);
must(JSON.stringify(twice)===JSON.stringify(out),'R276 propagation must be idempotent after fixed-point convergence');

for(const forbidden of ['fetch(','setInterval(','api.post','api.get','dispatch(','update_file','create_file','CanonState'])must(!source.includes(forbidden),`R276 gate must remain classification-only: ${forbidden}`);
for(const required of ["timing:'after direct evidence/executor gates and after R239 device-resource overlay'","rule:'a capability with any declared dependency currently BLOCKED is also BLOCKED'","directBlockers:'preserved; propagation is additive and never clears evidence/resource blockers'","authority:'classification only; no polling, dispatch, execution, evidence acquisition, source mutation, CanonState admission or deployment authority'"])must(source.includes(required),`R276 boundary missing ${required}`);

console.log('R276_FOUNDRY_DEPENDENCY_GATE PASS · direct + transitive + cyclic dependency blocks converge fail-closed · independent work remains active · direct blockers preserved · input immutable · classification-only authority');
