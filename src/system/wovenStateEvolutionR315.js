import {compileWovenDimensionalRelativityR265} from './wovenDimensionalRelativityR265.js';
import {projectAddressR266,R266_ADDRESS_LEVELS} from './adaptiveCoherenceCycleR266.js';
import {structuralHashR314} from './wovenNumericalComputeR314.js';

export const R315_SCHEMA='OMEGA_WOVEN_STATE_EVOLUTION_R315';
export const R315_REVISION='R315';
export const R315_OPERATOR=Object.freeze(['PARTITION','EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE']);
export const R315_AUTHORITY=Object.freeze({addressing:'R240',semantics:'R265',resolutionBridge:'R266',numerics:'R314',dispatch:'R147',history:'R146',returnProof:'R141',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',addsAuthority:false});
export const R315_BOUNDARY='R315 executes the established Woven Continuity software operator over an addressed computational field. It conserves declared scalar invariant through bounded transport/repartition, carries scar/history and provenance, separates structure from orientation, and measures software residuals. It does not claim literal physical dimensions, empirical truth, external execution, CanonState admission, or new dispatch/promotion authority.';

const finite=n=>{const x=Number(n);if(!Number.isFinite(x))throw new Error('R315 requires finite numeric values');return x};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,finite(n)));
const sigma=n=>{const x=finite(n);return x<0?-1:x>0?1:0};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const byAddress=(a,b)=>a.address-b.address||a.ref.localeCompare(b.ref);
const allowedResolution=n=>R266_ADDRESS_LEVELS.includes(Number(n));
const normalizeProvenance=p=>Array.isArray(p)?p.map(String).filter(Boolean):p?[String(p)]:[];

function normalizeField(operators=[]){
 if(!Array.isArray(operators))throw new Error('R315 operators must be an array');
 return operators.filter(row=>row&&row.active!==false).map((row,index)=>({
  ref:String(row.ref??`OP${index+1}`),
  family:String(row.family??'GENERIC'),
  organ:String(row.organ??'APPLIED_CALCULUS'),
  address:Math.floor(finite(row?.address?.address??row.address??index)),
  deepAddress:Math.floor(finite(row?.address?.deepAddress??row.deepAddress??((row?.address?.address??row.address??index)*12))),
  value:Math.max(0,finite(row.value??row.weight??0)),
  basis:String(row.basis??''),boundary:String(row.boundary??'')
 })).sort(byAddress);
}

function repartition(field,targetResolution){
 const buckets=new Map();
 for(const row of field){
  const targetAddress=projectAddressR266(row.address,20736,targetResolution);
  const key=`${targetAddress}`;
  const prev=buckets.get(key)||{address:targetAddress,value:0,refs:[],families:new Set(),organs:new Set()};
  prev.value+=row.value;prev.refs.push(row.ref);prev.families.add(row.family);prev.organs.add(row.organ);buckets.set(key,prev);
 }
 return [...buckets.values()].sort((a,b)=>a.address-b.address).map(row=>({address:row.address,value:row.value,refs:row.refs,families:[...row.families].sort(),organs:[...row.organs].sort()}));
}

function conservativeRingTransport(field,{orientation=0,transportRate=.125}={}){
 const s=sigma(orientation),rate=s===0?0:clamp(transportRate,0,.5),n=field.length;
 if(n<2||rate===0)return{field:field.map(x=>({...x})),edges:[],rate,orientation:s};
 const incoming=Array(n).fill(0),outgoing=Array(n).fill(0),edges=[];
 for(let i=0;i<n;i++){
  const j=s>0?(i+1)%n:(i-1+n)%n;
  const amount=field[i].value*rate;
  outgoing[i]+=amount;incoming[j]+=amount;
  edges.push({fromRef:field[i].ref,toRef:field[j].ref,fromAddress:field[i].address,toAddress:field[j].address,amount});
 }
 const next=field.map((row,i)=>({...row,value:row.value-outgoing[i]+incoming[i]}));
 return{field:next,edges,rate,orientation:s};
}

function roundTripProjectionResidual(source,target,targetResolution){
 if(targetResolution===20736)return 0;
 const sourceMass=new Map(source.map(row=>[row.address,(sourceMass=>sourceMass)(row.value)]));
 const returned=new Map();
 for(const bucket of target){
  const back=projectAddressR266(bucket.address,targetResolution,20736);
  returned.set(back,(returned.get(back)||0)+bucket.value);
 }
 const addresses=new Set([...sourceMass.keys(),...returned.keys()]);
 const denom=Math.max(1e-12,sum(source.map(x=>Math.abs(x.value))));
 let l1=0;for(const a of addresses)l1+=Math.abs((sourceMass.get(a)||0)-(returned.get(a)||0));
 return l1/denom;
}

export function executeWovenStateEvolutionR315({operators=[],orientation=0,transportRate=.125,targetResolution=20736,scarLedger=[],provenance=[],context={}}={}){
 if(!allowedResolution(targetResolution))throw new Error('R315 targetResolution must be a declared 12^k atlas resolution');
 const source=normalizeField(operators),s=sigma(orientation),declaredProvenance=normalizeProvenance(provenance);
 const invariantBefore=sum(source.map(x=>x.value));
 const transport=conservativeRingTransport(source,{orientation:s,transportRate});
 const invariantAfterTransport=sum(transport.field.map(x=>x.value));
 const transportedByRef=new Map(transport.field.map(x=>[x.ref,x.value]));
 const scarDelta=source.map(row=>({ref:row.ref,address:row.address,before:row.value,after:transportedByRef.get(row.ref)??row.value,delta:(transportedByRef.get(row.ref)??row.value)-row.value}));
 const carriedScar=[...(Array.isArray(scarLedger)?scarLedger:[]),{revision:R315_REVISION,orientation:s,entries:scarDelta}];
 const targetField=repartition(transport.field,targetResolution),invariantAfterRepartition=sum(targetField.map(x=>x.value));
 const invariantResidual=Math.abs(invariantBefore-invariantAfterRepartition);
 const roundTripResidual=roundTripProjectionResidual(source,targetField,targetResolution);
 const path={source:source.map(row=>({ref:row.ref,address:row.address,value:row.value})),edges:transport.edges,target:targetField.map(row=>({address:row.address,value:row.value,refs:row.refs})),recoverableFromLedger:true};
 const r265=compileWovenDimensionalRelativityR265({...context,orientation:s,sourceFrame:context.sourceFrame??'R240_ADDRESSED_FIELD',targetFrame:context.targetFrame??'R315_RECONTEXTUALIZED_FIELD',sourceSkin:context.sourceSkin??'COMPUTE',targetSkin:context.targetSkin??'COMPUTE',sourceResolution:20736,targetResolution,scar:Math.min(1,sum(scarDelta.map(x=>Math.abs(x.delta)))/Math.max(1e-12,invariantBefore||1)),residual:Math.min(1,invariantResidual),roundTripResidual,provenance:[...declaredProvenance,'R315_WOVEN_STATE_EVOLUTION']});
 const receiptBase={schema:R315_SCHEMA,revision:R315_REVISION,operator:R315_OPERATOR,orientation:s,transportRate:transport.rate,sourceResolution:20736,targetResolution,invariantBefore,invariantAfterTransport,invariantAfterRepartition,invariantResidual,roundTripResidual,sourceCount:source.length,targetCount:targetField.length,provenance:[...declaredProvenance],authority:R315_AUTHORITY};
 const receipt={...receiptBase,receiptHash:structuralHashR314(receiptBase),executionProofClaimed:false,externalScientificTruthClaimed:false,canonAdmissionClaimed:false,physicalDimensionsClaimed:false};
 return{...receiptBase,partition:{source},exchange:{edges:transport.edges,transported:transport.field},carry:{invariant:{before:invariantBefore,afterTransport:invariantAfterTransport,afterRepartition:invariantAfterRepartition,residual:invariantResidual},scarLedger:carriedScar,provenance:[...declaredProvenance]},reexpression:{orientation:s,structureOrientationFactored:true,targetResolution},recontextualized:{field:targetField},path,proof:{invariantStatus:invariantResidual<=1e-10?'PASS':'FAIL',roundTripResidual,roundTripStatus:r265.proof.roundTripStatus,recoverableFromLedger:true,softwareResidualOnly:true},r265,receipt,boundary:R315_BOUNDARY};
}

export function restoreWovenStateR315(evolution={}){
 if(evolution?.schema!==R315_SCHEMA||!Array.isArray(evolution?.path?.source))throw new Error('R315 restore requires a valid evolution receipt');
 const restored=evolution.path.source.map(row=>({...row}));
 return{schema:'OMEGA_WOVEN_STATE_RESTORE_R315',revision:R315_REVISION,restored,restoredHash:structuralHashR314(restored),sourceReceiptHash:evolution?.receipt?.receiptHash??null,recoverablePathUsed:true,dispatchRequested:false,canonAdmissionClaimed:false,authority:R315_AUTHORITY};
}
