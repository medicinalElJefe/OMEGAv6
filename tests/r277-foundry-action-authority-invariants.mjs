import fs from 'node:fs';
import {Buffer} from 'node:buffer';
import ts from 'typescript';

const must=(value,message)=>{if(!value)throw new Error(message)};
const source=fs.readFileSync('src/systemFoundryR268.ts','utf8');
const runtime=fs.readFileSync('src/systemFoundryRuntimeR269.ts','utf8');
const ui=fs.readFileSync('src/SystemFoundryR268.tsx','utf8');
const live=fs.readFileSync('src/SystemFoundryLiveR270.tsx','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));

must(typeof mod.compileSystemGenomeR268==='function','R277 Foundry compiler must compile and export');
must(source.includes("evidence:['AUTH_REQUIRED'],sideEffect:true,authority:'R147_DISPATCH'"),'R277 action capability must bind AUTH_REQUIRED to existing R147 dispatch authority');
must(source.includes("if(c.sideEffect||c.evidence.includes('AUTH_REQUIRED'))blockers.push('AUTH_REQUIRED')"),'R277 compiler must fail closed for every side effect and AUTH_REQUIRED declaration');
must(source.includes("schema:'OMEGA_SYSTEM_GENOME_R277'")&&source.includes("fingerprint:`r277-"),'R277 genome fingerprint schema must advance with the action-authority contract');
for(const token of ['allowedExecutors:c.allowedExecutors','evidence:c.evidence','sideEffect:c.sideEffect','authority:c.authority||null','dependsOn:c.dependsOn||[]']){
 must(source.includes(token),'R277 fingerprint must bind capability semantics: '+token);
}

for(const genome of mod.SYSTEM_GENOMES_R268){
 for(const authenticatedDeviceHeartbeat of [false,true]){
  for(const externalBindings of [false,true]){
   const plan=mod.compileSystemGenomeR268(genome,{authenticatedDeviceHeartbeat,externalBindings});
   const sideEffects=plan.activeFrontier.filter(capability=>capability.sideEffect);
   for(const capability of sideEffects){
    must(capability.status==='BLOCKED',genome.id+' side effect '+capability.id+' must never become active inside planning-only Foundry');
    must(capability.executor===null,genome.id+' side effect '+capability.id+' must have no admitted executor');
    must(capability.blockers.includes('AUTH_REQUIRED'),genome.id+' side effect '+capability.id+' must expose AUTH_REQUIRED');
   }
  }
 }
}

const omega=mod.compileSystemGenomeR268(mod.genomeByIdR268('omega.self'),{authenticatedDeviceHeartbeat:true,externalBindings:true});
const action=omega.activeFrontier.find(capability=>capability.id==='action.dispatch');
must(omega.fingerprint.startsWith('r277-'),'R277 compiled plan must expose the advanced fingerprint schema');
must(action?.status==='BLOCKED'&&action?.executor===null&&action?.blockers.length===1&&action.blockers[0]==='AUTH_REQUIRED','R277 must keep action.dispatch held even when device and external evidence are otherwise present');
must(omega.activeFrontier.find(capability=>capability.id==='intelligence.reason')?.status==='ACTIVE','R277 must not block independent read/compute dependencies when their own evidence is satisfied');

for(const token of ["actionAuthority:'R179_AUTHORIZATION_REQUIRED_R147_DISPATCH'","R277 keeps AUTH_REQUIRED side effects blocked inside the planning-only Foundry","actionTruth:'R277 keeps side-effect placement AUTH_REQUIRED inside Foundry"]){
 must(runtime.includes(token),'R277 runtime boundary missing '+token);
}
must(ui.includes("data-action-truth='R277_AUTH_REQUIRED'")&&ui.includes('Active planning frontier')&&ui.includes('Foundry cannot self-authorize or dispatch'),'R277 visible action boundary missing');
must(live.includes("actionAuthority:'R277 keeps Foundry side effects AUTH_REQUIRED; R179 authorization and R147 dispatch remain outside this adapter'"),'R277 live adapter must declare that it owns no authorization or dispatch');
for(const forbidden of ['fetch(','api.','setInterval(','dispatchExecutionRunR147','authorizeLivingWorldMissionR179']){
 must(!source.includes(forbidden),'R277 compiler must remain pure and cannot invoke authority path: '+forbidden);
}

console.log('R277_FOUNDRY_ACTION_AUTHORITY PASS · all side effects stay AUTH_REQUIRED under every device/external truth permutation · no executor admitted · R179 authorization and R147 dispatch remain external · read/compute independence preserved');
