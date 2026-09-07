import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assembleReflexWorldTransitionR157} from '../src/world/reflexWorldTransitionR157.js';

const transition=await assembleReflexWorldTransitionR157({
 source_family:'OPTICAL_OPERATION',canonical_address:1698,packet_id:'r160-return-1',returned_state:'RETURNED',
 residuals:[{id:'domain',kind:'DOMAIN_MISMATCH',severity:'HIGH',summary:'reduced order requires stronger full-wave domain',evidence_id:'evidence-1'}]
},{performance:{load:.8,latencyPressure:.7}});
assert.equal(transition.ok,true);
assert.equal(transition.reflex.action,'TURN');
assert.deepEqual(transition.mission.targetFamilies.slice(0,2),['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE']);
assert.equal(transition.mission.state,'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF');
assert.equal(transition.canonicalMutation,false);
assert.equal(transition.canonicalAdmissionAuthority,'R125');

const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const r86=fs.readFileSync(new URL('../src/omegaOperationBusR86.ts',import.meta.url),'utf8');
const ingress=fs.readFileSync(new URL('../src/world/reflexOperationIngressR160.ts',import.meta.url),'utf8');
const must=(re,msg)=>assert.match(ingress,re,msg);
assert.match(r86,/REFLEX_MISSION_ASSEMBLED/,'R86 must register only the additive reflex mission event type');
assert.match(app,/installLivingWorldOperationBridgeR140\(\);installRuntimeAttestationWorldScarR145\(\);installDurableWorldHeadContinuityR149\(\);installReflexOperationIngressR160\(\)/,'existing R140/R145/R149 install order must remain intact before R160');
must(/RETURN_STATES=new Set\(\['RETURNED','VERIFIED','RECONTEXTUALIZED','ADMISSION_CANDIDATE'\]\)/,'explicit lifecycle gate');
must(/sourceFamily&&RETURN_STATES\.has\(returnedState\)&&Array\.isArray\(payload\.residuals\)/,'source family + lifecycle + residuals must all be explicit');
must(/r160ReflexDerived!==true/,'derived missions must not recurse');
must(/assembleReflexWorldTransitionR157/,'must use admitted R157 reflex/world transition');
must(/compileOperationWorldInputR140/,'must reuse R140 truth extraction rather than infer domain proof');
must(/type:'REFLEX_MISSION_ASSEMBLED'/,'must emit the additive R86 mission event');
must(/status:'INFO'/,'derived reflex mission is information, not execution proof');
must(/requiresExecutionReceipts:true/,'target execution still needs receipts');
must(/requiresReturnVerification:true/,'return verification remains required');
must(/omega-r86-operation/,'must listen to real operation ingress');
must(/omega-r140-world-frame/,'must sequence after the source event world frame');
must(/R159_SOVEREIGN_EXECUTION_AUTHORITY_REMAINS_STRONGER_AND_UNCHANGED/,'newly promoted R159 execution authority must be preserved');
must(/R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY/,'R125 must remain sole CanonState admission authority');
must(/never upgrades RETURNED to VERIFIED/,'truth boundary must remain explicit');
console.log('R160 REFLEX OPERATION INGRESS PASS · actual R157 behavior + explicit R86 ingress structure · R159 execution authority preserved · R140/R149 continuity preserved');
