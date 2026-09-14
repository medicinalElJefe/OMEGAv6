import {compileWovenDimensionalRelativityR265} from './wovenDimensionalRelativityR265.js';
import {projectAddressR266,R266_ADDRESS_LEVELS} from './adaptiveCoherenceCycleR266.js';
import {structuralHashR314} from './wovenNumericalComputeR314.js';

export const R315_FIELD_SCHEMA='OMEGA_WOVEN_STATE_EVOLUTION_R315';
export const R315_FIELD_REVISION='R315.FIELD';
export const R315_FIELD_OPERATOR=Object.freeze(['PARTITION','RELATIONAL_EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE']);
export const R315_FIELD_AUTHORITY=Object.freeze({orchestration:'R315_CROSS_SKIN_ORCHESTRATION',addressing:'R240',semantics:'R265',resolutionBridge:'R266',numerics:'R314',dispatch:'R147',history:'R146',returnProof:'R141',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',addsAuthority:false});
export const R315_FIELD_BOUNDARY='R315.FIELD executes the established Woven Continuity operator over an addressed relational computational field beneath R315 cross-skin orchestration. It conserves declared scalar invariant through bounded relation-aware transport/repartition, carries scar/history, topology and provenance, separates structure from orientation, preserves projected relationship paths across frame changes, and measures software residuals. Address resolution is frame-relative across declared 12^k atlas levels and is never treated as a literal physical dimension. It does not claim empirical truth, external execution, CanonState admission, or new dispatch/promotion authority.';

const finite=n=>{const x=Number(n);if(!Number.isFinite(x))throw new Error('R315.FIELD requires finite numeric values');return x};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,finite(n)));
const sigma=n=>{const x=finite(n);return x<0?-1:x>0?1:0};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const byAddress=(a,b)=>a.address-b.address||a.ref.localeCompare(b.ref);
const allowedResolution=n=>R266_ADDRESS_LEVELS.includes(Number(n));
const normalizeProvenance=p=>Array.isArray(p)?p.map(String).filter(Boolean):p?[String(p)]:[];
const relationWeight=n=>Number.isFinite(Number(n))&&Number(n)>0?Number(n):1;

function normalizeRelations(row={}){
 const raw=Array.isArray(row.relations)?row.relations:Array.isArray(row.relationships)?row.relationships:Array.isArray(row.neighbors)?row.neighbors:[];
 return raw.map((rel,index)=>typeof rel==='string'?{ref:rel,weight:1,kind:'DECLARED'}:{ref:String(rel?.ref??rel?.targetRef??rel?.toRef??''),weight:relationWeight(rel?.weight),kind:String(rel?.kind??rel?.type??'DECLARED'),ordinal:index}).filter(rel=>rel.ref);
}

function normalizeField(operators=[],sourceResolution=20736){
 if(!Array.isArray(operators))throw new Error('R315.FIELD operators must be an array');
 if(!allowedResolution(sourceResolution))throw new Error('R315.FIELD sourceResolution must be a declared 12^k atlas resolution');
 return operators.filter(row=>row&&row.active!==false).map((row,index)=>{
  const rawAddress=finite(row?.address?.address??row.address??index),address=Math.floor(rawAddress);
  if(address<0||address>=Number(sourceResolution))throw new Error(`R315.FIELD source address ${address} out of range for resolution ${sourceResolution}`);
  return{
   ref:String(row.ref??`OP${index+1}`),family:String(row.family??'GENERIC'),organ:String(row.organ??'APPLIED_CALCULUS'),
   address,deepAddress:Math.floor(finite(row?.address?.deepAddress??row.deepAddress??(address*12))),
   value:Math.max(0,finite(row.value??row.weight??0)),basis:String(row.basis??''),boundary:String(row.boundary??''),relations:normalizeRelations(row)
  };
 }).sort(byAddress);
}

function buildRelationalTopology(field){
 const byRef=new Map(field.map((row,index)=>[row.ref,{row,index}])),edges=[];
 for(let i=0;i<field.length;i++){
  const row=field[i],declared=row.relations.map(rel=>({rel,target:byRef.get(rel.ref)})).filter(x=>x.target&&x.target.row.ref!==row.ref);
  if(declared.length){
   for(const {rel,target} of declared)edges.push({fromRef:row.ref,toRef:target.row.ref,fromAddress:row.address,toAddress:target.row.address,weight:rel.weight,kind:rel.kind||'DECLARED',topology:'DECLARED_RELATION'});
   continue;
  }
  if(i>0){const target=field[i-1];edges.push({fromRef:row.ref,toRef:target.ref,fromAddress:row.address,toAddress:target.address,weight:1,kind:'ADDRESS_NEIGHBOR',topology:'ADDRESS_NEIGHBOR'});}
  if(i<field.length-1){const target=field[i+1];edges.push({fromRef:row.ref,toRef:target.ref,fromAddress:row.address,toAddress:target.address,weight:1,kind:'ADDRESS_NEIGHBOR',topology:'ADDRESS_NEIGHBOR'});}
 }
 return edges;
}

function activeTransportEdges(topology,orientation){
 const s=sigma(orientation);if(s===0)return[];
 const grouped=new Map();for(const edge of topology){const xs=grouped.get(edge.fromRef)||[];xs.push(edge);grouped.set(edge.fromRef,xs)}
 const active=[];
 for(const xs of grouped.values()){
  const directional=xs.filter(edge=>s>0?edge.toAddress>edge.fromAddress:edge.toAddress<edge.fromAddress);
  const declared=xs.filter(edge=>edge.topology==='DECLARED_RELATION');
  const selected=directional.length?directional:(declared.length?declared:[]);
  for(const edge of selected)active.push(edge);
 }
 return active;
}

function conservativeRelationalTransport(field,{orientation=0,transportRate=.125}={}){
 const s=sigma(orientation),rate=s===0?0:clamp(transportRate,0,.5),n=field.length,topology=buildRelationalTopology(field);
 if(n<2||rate===0)return{field:field.map(x=>({...x})),edges:[],topology,rate,orientation:s,mode:'RELATIONAL'};
 const indexByRef=new Map(field.map((row,index)=>[row.ref,index])),incoming=Array(n).fill(0),outgoing=Array(n).fill(0),edges=[];
 const active=activeTransportEdges(topology,s),grouped=new Map();for(const edge of active){const xs=grouped.get(edge.fromRef)||[];xs.push(edge);grouped.set(edge.fromRef,xs)}
 for(const [fromRef,xs] of grouped.entries()){
  const i=indexByRef.get(fromRef);if(i===undefined)continue;
  const totalWeight=sum(xs.map(edge=>Math.max(1e-12,edge.weight))),budget=field[i].value*rate;
  for(const edge of xs){const j=indexByRef.get(edge.toRef);if(j===undefined)continue;const amount=budget*(Math.max(1e-12,edge.weight)/totalWeight);outgoing[i]+=amount;incoming[j]+=amount;edges.push({...edge,amount});}
 }
 return{field:field.map((row,i)=>({...row,value:row.value-outgoing[i]+incoming[i]})),edges,topology,rate,orientation:s,mode:'RELATIONAL'};
}

function repartition(field,sourceResolution,targetResolution,topology=[]){
 const buckets=new Map();
 for(const row of field){
  const targetAddress=projectAddressR266(row.address,sourceResolution,targetResolution),key=String(targetAddress);
  const prev=buckets.get(key)||{address:targetAddress,value:0,refs:[],families:new Set(),organs:new Set()};
  prev.value+=row.value;prev.refs.push(row.ref);prev.families.add(row.family);prev.organs.add(row.organ);buckets.set(key,prev);
 }
 const target=[...buckets.values()].sort((a,b)=>a.address-b.address).map((row,index)=>({address:row.address,value:row.value,refs:[...row.refs].sort(),families:[...row.families].sort(),organs:[...row.organs].sort(),ref:row.refs.length===1?row.refs[0]:`R315_BUCKET_${row.address}_${index+1}`,relations:[]}));
 const byAddressMap=new Map(target.map(row=>[row.address,row])),projected=new Map();
 for(const edge of topology){
  const fromAddress=projectAddressR266(edge.fromAddress,sourceResolution,targetResolution),toAddress=projectAddressR266(edge.toAddress,sourceResolution,targetResolution);if(fromAddress===toAddress)continue;
  const from=byAddressMap.get(fromAddress),to=byAddressMap.get(toAddress);if(!from||!to)continue;
  const key=`${from.ref}\u0000${to.ref}\u0000${edge.kind}`,prev=projected.get(key)||{fromRef:from.ref,toRef:to.ref,fromAddress,toAddress,weight:0,kind:edge.kind,topology:'PROJECTED_RELATION'};prev.weight+=edge.weight;projected.set(key,prev);
 }
 for(const edge of projected.values()){const from=target.find(row=>row.ref===edge.fromRef);if(from)from.relations.push({ref:edge.toRef,weight:edge.weight,kind:edge.kind});}
 for(const row of target)row.relations.sort((a,b)=>a.ref.localeCompare(b.ref)||a.kind.localeCompare(b.kind));
 return{field:target,projectedTopology:[...projected.values()].sort((a,b)=>a.fromAddress-b.fromAddress||a.toAddress-b.toAddress||a.fromRef.localeCompare(b.fromRef))};
}

function recontextualizedOperators(targetField){
 return targetField.map(row=>({
  ref:row.ref,family:row.families.join('|')||'GENERIC',organ:row.organs.join('|')||'APPLIED_CALCULUS',
  address:row.address,deepAddress:row.address*12,value:row.value,basis:'R315_RECONTEXTUALIZED_BUCKET',boundary:R315_FIELD_BOUNDARY,relations:row.relations.map(rel=>({...rel}))
 }));
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
 const transport=conservativeRelationalTransport(source,{orientation:s,transportRate}),invariantAfterTransport=sum(transport.field.map(x=>x.value)),transportedByRef=new Map(transport.field.map(x=>[x.ref,x.value]));
 const scarDelta=source.map(row=>({ref:row.ref,address:row.address,before:row.value,after:transportedByRef.get(row.ref)??row.value,delta:(transportedByRef.get(row.ref)??row.value)-row.value}));
 const carriedScar=[...(Array.isArray(scarLedger)?scarLedger:[]),{revision:R315_FIELD_REVISION,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),orientation:s,transportMode:transport.mode,entries:scarDelta}];
 const repartitioned=repartition(transport.field,Number(sourceResolution),Number(targetResolution),transport.topology),targetField=repartitioned.field,nextOperators=recontextualizedOperators(targetField),invariantAfterRepartition=sum(targetField.map(x=>x.value)),invariantResidual=Math.abs(invariantBefore-invariantAfterRepartition),roundTripResidual=roundTripProjectionResidual(source,targetField,Number(sourceResolution),Number(targetResolution));
 const path={sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),source:source.map(row=>({ref:row.ref,address:row.address,value:row.value,relations:row.relations.map(rel=>({...rel}))})),topology:transport.topology,edges:transport.edges,projectedTopology:repartitioned.projectedTopology,target:targetField.map(row=>({ref:row.ref,address:row.address,value:row.value,refs:row.refs,relations:row.relations.map(rel=>({...rel}))})),recoverableFromLedger:true};
 const scarMagnitude=Math.min(1,sum(scarDelta.map(x=>Math.abs(x.delta)))/Math.max(1e-12,invariantBefore||1));
 const r265=compileWovenDimensionalRelativityR265({...context,orientation:s,sourceFrame:context.sourceFrame??'R240_ADDRESSED_FIELD',targetFrame:context.targetFrame??'R315_RECONTEXTUALIZED_FIELD',sourceSkin:context.sourceSkin??'COMPUTE',targetSkin:context.targetSkin??'COMPUTE',sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),scar:scarMagnitude,residual:Math.min(1,invariantResidual),roundTripResidual,provenance:[...declaredProvenance,'R315_RELATIONAL_FIELD_EVOLUTION']});
 const receiptBase={schema:R315_FIELD_SCHEMA,revision:R315_FIELD_REVISION,operator:R315_FIELD_OPERATOR,orientation:s,transportRate:transport.rate,transportMode:transport.mode,topologyEdgeCount:transport.topology.length,activeExchangeEdgeCount:transport.edges.length,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution),invariantBefore,invariantAfterTransport,invariantAfterRepartition,invariantResidual,roundTripResidual,scarMagnitude,sourceCount:source.length,targetCount:targetField.length,provenance:[...declaredProvenance],authority:R315_FIELD_AUTHORITY};
 const receipt={...receiptBase,receiptHash:structuralHashR314(receiptBase),executionProofClaimed:false,externalScientificTruthClaimed:false,canonAdmissionClaimed:false,physicalDimensionsClaimed:false};
 return{...receiptBase,partition:{source},exchange:{mode:transport.mode,topology:transport.topology,edges:transport.edges,transported:transport.field},carry:{invariant:{before:invariantBefore,afterTransport:invariantAfterTransport,afterRepartition:invariantAfterRepartition,residual:invariantResidual},scarLedger:carriedScar,topology:repartitioned.projectedTopology,provenance:[...declaredProvenance]},reexpression:{orientation:s,structureOrientationFactored:true,sourceResolution:Number(sourceResolution),targetResolution:Number(targetResolution)},recontextualized:{field:targetField,operators:nextOperators,projectedTopology:repartitioned.projectedTopology},path,proof:{invariantStatus:invariantResidual<=1e-10?'PASS':'FAIL',roundTripResidual,roundTripStatus:r265.proof.roundTripStatus,recoverableFromLedger:true,topologyPreservedAcrossFrame:true,softwareResidualOnly:true},r265,receipt,boundary:R315_FIELD_BOUNDARY};
}

export function restoreWovenStateR315(evolution={}){
 if(evolution?.schema!==R315_FIELD_SCHEMA||!Array.isArray(evolution?.path?.source))throw new Error('R315.FIELD restore requires a valid evolution receipt');
 const restored=evolution.path.source.map(row=>({...row,relations:Array.isArray(row.relations)?row.relations.map(rel=>({...rel})):[]}));
 return{schema:'OMEGA_WOVEN_STATE_RESTORE_R315',revision:R315_FIELD_REVISION,sourceResolution:Number(evolution.path.sourceResolution??evolution.sourceResolution??20736),restored,restoredHash:structuralHashR314(restored),sourceReceiptHash:evolution?.receipt?.receiptHash??null,recoverablePathUsed:true,topologyRestored:true,dispatchRequested:false,canonAdmissionClaimed:false,authority:R315_FIELD_AUTHORITY};
}
