import {compileWovenDimensionalRelativityR265} from './wovenDimensionalRelativityR265.js';
import {projectAddressR266,R266_ADDRESS_LEVELS} from './adaptiveCoherenceCycleR266.js';
import {structuralHashR314} from './wovenNumericalComputeR314.js';

export const R315_FIELD_SCHEMA='OMEGA_WOVEN_STATE_EVOLUTION_R315';
export const R315_FIELD_REVISION='R315.FIELD';
export const R315_FIELD_OPERATOR=Object.freeze(['PARTITION','EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE']);
export const R315_FIELD_AUTHORITY=Object.freeze({orchestration:'R315_CROSS_SKIN_ORCHESTRATION',addressing:'R240',semantics:'R265',resolutionBridge:'R266',numerics:'R314',dispatch:'R147',history:'R146',returnProof:'R141',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',addsAuthority:false});
export const R315_FIELD_BOUNDARY='R315.FIELD executes the established Woven Continuity operator over an addressed computational field beneath R315 cross-skin orchestration. It conserves declared scalar invariant through bounded transport/repartition, carries scar/history and provenance, separates structure from orientation, and measures software residuals. Address resolution is frame-relative across declared 12^k atlas levels and is never treated as a literal physical dimension. It does not claim empirical truth, external execution, CanonState admission, or new dispatch/promotion authority.';

const finite=n=>{const x=Number(n);if(!Number.isFinite(x))throw new Error('R315.FIELD requires finite numeric values');return x};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,finite(n)));
const sigma=n=>{const x=finite(n);return x<0?-1:x>0?1:0};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const byAddress=(a,b)=>a.address-b.address||a.ref.localeCompare(b.ref);
const allowedResolution=n=>R266_ADDRESS_LEVELS.includes(Number(n));
const normalizeProvenance=p=>Array.isArray(p)?p.map(String).filter(Boolean):p?[String(p)]:[];

function normalizeField(operators=[],sourceResolution=20736){
 if(!Array.isArray(operators))throw new Error('R315.FIELD operators must be an array');
 if(!allowedResolution(sourceResolution))throw new Error('R315.FIELD sourceResolution must be a declared 12^k atlas resolution');
 return operators.filter(row=>row&&row.active!==false).map((row,index)=>{
  const rawAddress=finite(row?.address?.address??row.address??index),address=Math.floor(rawAddress);
  if(address<0||address>=Number(sourceResolution))throw new Error(`R315.FIELD source address ${address} out of range for resolution ${sourceResolution}`);
  return{
   ref:String(row.ref??`OP${index+1}`),family:String(row.family??'GENERIC'),organ:String(row.organ??'APPLIED_CALCULUS'),
   address,deepAddress:Math.floor(finite(row?.address?.deepAddress??row.deepAddress??(address*12))),
   value:Math.max(0,finite(row.value??row.weight??0)),basis:String(row.basis??''),boundary:String(row.boundary??'')
  };
 }).sort(byAddress);
}

function repartition(field,sourceResolution,targetResolution){
 const buckets=new Map();
 for(const row of field){
  const targetAddress=projectAddressR266(row.address,sourceResolution,targetResolution),key=String(targetAddress);
  const prev=buckets.get(key)||{address:targetAddress,value:0,refs:[],families:new Set(),organs:new Set()};
  prev.value+=row.value;prev.refs.push(row.ref);prev.families.add(row.family);prev.organs.add(row.organ);buckets.set(key,prev);
 }
 return [...buckets.values()].sort((a,b)=>a.address-b.address).map(row=>({address:row.address,value:row.value,refs:[...row.refs].sort(),families:[...row.families].sort(),organs:[...row.organs].sort()}));
}

function recontextualizedOperators(targetField){
 return targetField.map((row,index)=>({
  ref:row.refs.length===1?row.refs[0]:`R315_BUCKET_${row.address}_${index+1}`,
  family:row.families.join('|')||'GENERIC',organ:row.organs.join('|')||'APPLIED_CALCULUS',
  address:row.address,deepAddress:row.address*12,value:row.value,basis:'R315_RECONTEXTUALIZED_BUCKET',boundary:R315_FIELD_BOUNDARY
 }));
}

function conservativeRingTransport(field,{orientation=0,transportRate=.125}={}){
 const s=sigma(orientation),rate=s===0?0:clamp(transportRate,0,.5),n=field.length;
 if(n<2||rate===0)return{field:field.map(x=>({...x})),edges:[],rate,orientation:s};
 const incoming=Array(n).fill(0),outgoing=Array(n).fill(0),edges=[];
 for(let i=0;i<n;i++){
  const j=s>0?(i+1)%n:(i-1+n)%n,amount=field[i].value*rate;
  outgoing[i]+=amount;incoming[j]+=amount;edges.push({fromRef:field[i].ref,toRef:field[j].ref,fromAddress:field[i].address,toAddress:field[j].address,amount});
 }
 return{field:field.map((row,i)=>({...row,value:row.value-outgoing[i]+incoming[i]})),edges,rate,orientation:s};
}

function roundTripProjectionResidual(source,target,sourceResolution,targetResolution){
 const sourceMass=new Map(),returned=new Map();
 for(const row of source)sourceMass.set(row.address,(sourceMass.get(row.address)||0)+row.value);
 for(const bucket of target){const back=projectAddressR266(bucket.address,targetResolution,sourceResolution);returned.set(back,(returned.get(back)||0)+bucket.value)}
 const addresses=new Set([...sourceMass.keys(),...returned.keys()]),denom=Math.max(1e-12,sum(source.map(x=>Math.abs(x.value))));
 let l1=0;for(const a of addresses)l1+=Math.abs((sourceMass.get(a)||0)-(returned.get(a)||0));return l1/denom;
}

export function executeWovenStateEvolutionR315({operators=[],orientation=0,transportRate=.125,sourceResolution=20736,targetResolution=20736,scarLedger=[],provenance=[],context={}}={}){
 if(!allowedResolution(sourceResolution))throw new Error('R315.FIELD sourceResolution must be a declared 12^k atlas resolution');
 if(!allowedResolution(targetResolution))throw new Error('R315.FIELD targetResolution must be a declared 12^k atlas resolution');
 const source=normalizeField(operators,sourceResolution),s=sigma(orientation),declaredProvenance=normalizeProvenance(provenance),invariantBefore=sum(source.map(x=>x.value));
 const transport=conservativeRingTransport(source,{orientation:s,transportRate}),invariantAfterTransport=sum(transport.field.map(x=>x.value)),transportedByRef=new Map(transport.field.map(x=>[x.ref,x.value]));
 const scarDelta=source.map(row=>({ref:row.ref,address:row.address,before:row.value,after:transportedByRef.get(row.ref)??row.value,delta:(transportedByRef.get(row.ref)??row.value)-row.value}));
 const carriedScar=[...(Array.isArray(scarLedger)?scarLedger:[]),{revision:R315_FIELD_REVISION,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),orientation:s,entries:scarDelta}];
 const targetField=repartition(transport.field,Number(sourceResolution),Number(targetResolution)),nextOperators=recontextualizedOperators(targetField),invariantAfterRepartition=sum(targetField.map(x=>x.value)),invariantResidual=Math.abs(invariantBefore-invariantAfterRepartition),roundTripResidual=roundTripProjectionResidual(source,targetField,Number(sourceResolution),Number(targetResolution));
 const path={sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),source:source.map(row=>({ref:row.ref,address:row.address,value:row.value})),edges:transport.edges,target:targetField.map(row=>({address:row.address,value:row.value,refs:row.refs})),recoverableFromLedger:true};
 const scarMagnitude=Math.min(1,sum(scarDelta.map(x=>Math.abs(x.delta)))/Math.max(1e-12,invariantBefore||1));
 const r265=compileWovenDimensionalRelativityR265({...context,orientation:s,sourceFrame:context.sourceFrame??'R240_ADDRESSED_FIELD',targetFrame:context.targetFrame??'R315_RECONTEXTUALIZED_FIELD',sourceSkin:context.sourceSkin??'COMPUTE',targetSkin:context.targetSkin??'COMPUTE',sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),scar:scarMagnitude,residual:Math.min(1,invariantResidual),roundTripResidual,provenance:[...declaredProvenance,'R315_FIELD_EVOLUTION']});
 const receiptBase={schema:R315_FIELD_SCHEMA,revision:R315_FIELD_REVISION,operator:R315_FIELD_OPERATOR,orientation:s,transportRate:transport.rate,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),invariantBefore,invariantAfterTransport,invariantAfterRepartition,invariantResidual,roundTripResidual,scarMagnitude,sourceCount:source.length,targetCount:targetField.length,provenance:[...declaredProvenance],authority:R315_FIELD_AUTHORITY};
 const receipt={...receiptBase,receiptHash:structuralHashR314(receiptBase),executionProofClaimed:false,externalScientificTruthClaimed:false,canonAdmissionClaimed:false,physicalDimensionsClaimed:false};
 return{...receiptBase,partition:{source},exchange:{edges:transport.edges,transported:transport.field},carry:{invariant:{before:invariantBefore,afterTransport:invariantAfterTransport,afterRepartition:invariantAfterRepartition,residual:invariantResidual},scarLedger:carriedScar,provenance:[...declaredProvenance]},reexpression:{orientation:s,structureOrientationFactored:true,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution)},recontextualized:{field:targetField,operators:nextOperators},path,proof:{invariantStatus:invariantResidual<=1e-10?'PASS':'FAIL',roundTripResidual,roundTripStatus:r265.proof.roundTripStatus,recoverableFromLedger:true,softwareResidualOnly:true},r265,receipt,boundary:R315_FIELD_BOUNDARY};
}

export function restoreWovenStateR315(evolution={}){
 if(evolution?.schema!==R315_FIELD_SCHEMA||!Array.isArray(evolution?.path?.source))throw new Error('R315.FIELD restore requires a valid evolution receipt');
 const restored=evolution.path.source.map(row=>({...row}));
 return{schema:'OMEGA_WOVEN_STATE_RESTORE_R315',revision:R315_FIELD_REVISION,sourceResolution:Number(evolution.path.sourceResolution??evolution.sourceResolution??20736),restored,restoredHash:structuralHashR314(restored),sourceReceiptHash:evolution?.receipt?.receiptHash??null,recoverablePathUsed:true,dispatchRequested:false,canonAdmissionClaimed:false,authority:R315_FIELD_AUTHORITY};
}
