export const R356_ATLAS360_SCHEMA='OMEGA_ATLAS360_WOVEN_HOLONOMIC_TRIANGULATION_R356';
export const R356_ATLAS360_LEVELS=Object.freeze([12,144,1728,20736]);
export const R356_ATLAS360_BEARINGS=360;
export const R356_ATLAS360_TRIANGLE_CLASSES=Object.freeze(['GEOMETRIC','TEMPORAL','RELATIONAL']);
export const R356_ATLAS360_ANCHOR_ROLES=Object.freeze(['A','B','C']);
export const R356_ATLAS360_SIGMA=Object.freeze([-1,0,1]);
export const R356_ATLAS360_COUNTS=Object.freeze({
 addressesByLevel:Object.freeze({L1:12,L2:144,L3:1728,L4:20736}),
 allLevelAddresses:22620,bearings:360,leafAddressBearingRows:7464960,upperAddressBearingRows:678240,
 allLevelAddressBearingRows:8143200,triangleClasses:3,anchorRoles:3,
 logicalEvaluationSlots:73288800,sigmaStates:3,logicalEvaluationSlotsWithSigma:219866400
});
export const R356_ATLAS360_SOURCE=Object.freeze({
 title:'Dewey Atlas360 20736D PUSH HARDER Full Canon',
 baseTensorSha256:'4ac412ef50ea581da0b198d34581deebbfd28783ca65e691b718422a6e110981',
 upperTensorSha256:'715262b650854f3282ed304be4664a67ea1473e32e32504695c1ca0653c8bca6',
 registrySha256:'abcdc32b21234e42582155c9a5e0871ca0d639669861a747f88159a2d5ac77cb',
 formulaCanonSha256:'1f26009f7aaeae9acff939810b5f39b146a3500293f44c38c828a6f77ff71e69',
 evaluationSchemaSha256:'e2aa054d8f62a3123b5581888c25d9cef426993b0f49d76b2bb7fd57ea1f554f'
});
export const R356_ATLAS360_BOUNDARY='Atlas360 is a derived relational/proof layer over the established 12→144→1,728→20,736 address fabric. It adds no physical primitive, CanonState authority, durable-history authority, dispatch authority or production writer. Geometry is deterministic and may be regenerated on demand; measurement-dependent continuity, plasticity, contradiction, burden, scar, evidence, uncertainty, closure and future values must come from real bound inputs and are never fabricated.';
export const R356_ATLAS360_LAWS=Object.freeze([
 'ATLAS_LEVELS_ARE_ADDRESS_RESOLUTION_NOT_PHYSICAL_DIMENSIONS',
 'NO_NEW_PHYSICAL_PRIMITIVE',
 'ROTATE_REFERENCE_FRAME_NOT_INVARIANT_STATE',
 'ANTIPODAL_PAIR_IS_THETA_PLUS_180_MOD_360',
 'TRIANGLE_NON_CLOSURE_IS_EVIDENCE_NOT_DISCARDED_ERROR',
 'SCAR_HISTORY_CARRY_IS_EXPLICIT',
 'REAL_ANCHORS_REQUIRED_FOR_MEASUREMENT_DEPENDENT_RESULTS',
 'ACTIVE_SLICE_COMPUTE_PRECEDES_FULL_TENSOR_MATERIALIZATION',
 'R125_R141_R146_R147_AND_CI_AUTHORITY_UNCHANGED'
]);

const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clampInt=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(finite(v,a))));
const mod=(n,m)=>((n%m)+m)%m;
const levelDepth=level=>{const n=Number(level);const i=R356_ATLAS360_LEVELS.indexOf(n);if(i<0)throw new Error('Atlas360 undeclared resolution');return i+1};
const maxIndex=depth=>12**depth-1;

export function decodeAtlasAddressR356(index,level=20736){
 const depth=levelDepth(level),n=clampInt(index,0,maxIndex(depth)),digits=new Array(depth).fill(0);let x=n;
 for(let i=depth-1;i>=0;i--){digits[i]=x%12;x=Math.floor(x/12)}
 return{level:Number(level),depth,index:n,digits,address:digits.map(d=>String(d).padStart(2,'0')).join('.')};
}
export function encodeAtlasAddressR356(digits=[]){
 if(!Array.isArray(digits)||digits.length<1||digits.length>4)throw new Error('Atlas360 address requires 1..4 base-12 digits');
 let n=0;for(const raw of digits){const d=Math.floor(Number(raw));if(!Number.isFinite(d)||d<0||d>11)throw new Error('Atlas360 address digit outside 0..11');n=n*12+d}
 return{level:12**digits.length,depth:digits.length,index:n,address:digits.map(d=>String(d).padStart(2,'0')).join('.')};
}
export function projectLeafHierarchyR356(leafIndex){
 const leaf=decodeAtlasAddressR356(leafIndex,20736),[d0,d1,d2,d3]=leaf.digits;
 return{leafIndex:leaf.index,address:leaf.address,digits:leaf.digits,
  L1:{index:d0,address:String(d0).padStart(2,'0')},
  L2:{index:d0*12+d1,address:[d0,d1].map(d=>String(d).padStart(2,'0')).join('.')},
  L3:{index:(d0*12+d1)*12+d2,address:[d0,d1,d2].map(d=>String(d).padStart(2,'0')).join('.')},
  L4:{index:leaf.index,address:leaf.address,local12:d3}};
}
export function bearingGeometryR356(theta){
 const t=mod(Math.floor(finite(theta)),360),sector=Math.floor(t/30),phase=(t-sector*30)/30,anti=(t+180)%360,r=t*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
 return{theta:t,sector,sectorStartDeg:sector*30,phase,antipode:anti,axisPair:Math.min(t,anti),radial:[c,s],tangent:[-s,c],antipodeVector:[-c,-s],rotation:[[c,-s],[s,c]],sectorPair:[sector,(sector+6)%12]};
}
export function addressBearingSampleR356(leafIndex,theta){return{schema:R356_ATLAS360_SCHEMA,hierarchy:projectLeafHierarchyR356(leafIndex),bearing:bearingGeometryR356(theta),boundary:R356_ATLAS360_BOUNDARY}}

export function compileAddressSweepR356(leafIndex,{bearingStep=1}={}){
 const step=clampInt(bearingStep,1,180),h=projectLeafHierarchyR356(leafIndex),count=Math.ceil(360/step),stride=8,values=new Float32Array(count*stride);let row=0;
 for(let theta=0;theta<360;theta+=step){const b=bearingGeometryR356(theta),o=row*stride;values[o]=b.theta;values[o+1]=b.sector;values[o+2]=b.phase;values[o+3]=b.antipode;values[o+4]=b.radial[0];values[o+5]=b.radial[1];values[o+6]=b.tangent[0];values[o+7]=b.tangent[1];row++}
 return{schema:'OMEGA_ATLAS360_ADDRESS_SWEEP_R356',leafIndex:h.leafIndex,address:h.address,bearingStep:step,count:row,stride,columns:['theta','sector','phase','antipode','radialX','radialY','tangentX','tangentY'],values,fullTensorMaterialized:false};
}
export function createAtlas360SliceCacheR356(maxEntries=24){
 const limit=clampInt(maxEntries,1,256),cache=new Map();
 return{get(leafIndex,options={}){const step=clampInt(options.bearingStep??1,1,180),idx=clampInt(leafIndex,0,20735),key=idx+':'+step;if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v}const v=compileAddressSweepR356(idx,{bearingStep:step});cache.set(key,v);while(cache.size>limit)cache.delete(cache.keys().next().value);return v},clear(){cache.clear()},get size(){return cache.size},limit};
}
export function compileAtlas360ExecutionPlanR356({activeAddresses=[0],bearingStep=1,logicalCores=1,deviceMemoryGB=null,workerAvailable=false,cacheEntries=24}={}){
 const step=clampInt(bearingStep,1,180),unique=[...new Set((activeAddresses||[]).map(v=>clampInt(v,0,20735)))],addresses=unique.length?unique:[0],bearingCount=Math.ceil(360/step),pairCount=addresses.length*bearingCount;
 const cores=clampInt(logicalCores,1,256),mem=Number.isFinite(Number(deviceMemoryGB))&&Number(deviceMemoryGB)>0?Math.min(256,Number(deviceMemoryGB)):null,coreBound=Math.max(1,Math.min(12,cores>1?cores-1:1)),memoryBound=mem==null?8:Math.max(1,Math.min(12,Math.floor(mem*2))),workerCount=workerAvailable===true?Math.min(coreBound,memoryBound,addresses.length||1):1;
 const geometryBytes=pairCount*8*4;
 return{schema:'OMEGA_ATLAS360_EXECUTION_PLAN_R356',mode:'ACTIVE_SLICE_ON_DEMAND',activeAddresses:addresses,bearingStep:step,bearingCount,pairCount,geometryBytes,workerAvailable:workerAvailable===true,workerCount,cacheEntries:clampInt(cacheEntries,1,256),fullLeafTensorRows:R356_ATLAS360_COUNTS.leafAddressBearingRows,allLevelRows:R356_ATLAS360_COUNTS.allLevelAddressBearingRows,logicalEvaluationSlots:R356_ATLAS360_COUNTS.logicalEvaluationSlots,logicalEvaluationSlotsWithSigma:R356_ATLAS360_COUNTS.logicalEvaluationSlotsWithSigma,fullTensorMaterialized:false,performanceLaw:'REGENERATE_DETERMINISTIC_GEOMETRY_AND_CACHE_ACTIVE_SLICES'};
}

function validFieldR349(field){return field&&Number(field.resolution)===20736&&field.continuity?.length===20736&&field.plasticity?.length===20736&&field.burden?.length===20736&&field.contradiction?.length===20736&&field.scar?.length===20736&&field.evidence?.length===20736&&field.invariant?.length===20736&&field.motion?.length===20736&&field.support?.length===20736&&field.orientation?.length===20736}
export function sampleR349FieldAtBearingR356(field,leafIndex,theta){
 if(!validFieldR349(field))throw new Error('Atlas360 requires an established R349-compatible 20,736-address typed field');
 const i=clampInt(leafIndex,0,20735),b=bearingGeometryR356(theta),sigma=Math.sign(Number(field.orientation[i]))||0,motion=finite(field.motion[i]),signedMotion=motion*sigma;
 return{schema:'OMEGA_ATLAS360_R349_STATE_SAMPLE_R356',leafIndex:i,address:projectLeafHierarchyR356(i).address,theta:b.theta,antipode:b.antipode,
  state:{continuity:finite(field.continuity[i]),futurePlasticity:finite(field.plasticity[i]),burden:finite(field.burden[i]),contradiction:finite(field.contradiction[i]),scar:finite(field.scar[i]),evidence:finite(field.evidence[i]),invariant:finite(field.invariant[i]),motion,support:finite(field.support[i]),sigma},
  relativeMotionVector:[signedMotion*b.radial[0],signedMotion*b.radial[1]],measurementSource:'BOUND_R349_TYPED_FIELD',physicalVectorClaimed:false,canonicalMutation:false};
}
export function compareAntipodalFieldR356(field,leafIndex,theta){
 const a=sampleR349FieldAtBearingR356(field,leafIndex,theta),b=sampleR349FieldAtBearingR356(field,leafIndex,a.antipode),keys=['continuity','futurePlasticity','burden','contradiction','scar','evidence','invariant','motion','support','sigma'];
 const invariantDelta=Object.fromEntries(keys.map(k=>[k,a.state[k]-b.state[k]]));
 return{schema:'OMEGA_ATLAS360_ANTIPODAL_COMPARISON_R356',leafIndex:a.leafIndex,theta:a.theta,antipode:a.antipode,invariantDelta,relativeMotionDelta:[a.relativeMotionVector[0]-b.relativeMotionVector[0],a.relativeMotionVector[1]-b.relativeMotionVector[1]],expectedFrameOnlyInvariantPreservation:keys.every(k=>Math.abs(invariantDelta[k])<=1e-12),canonicalMutation:false};
}

const isMatrix=m=>Array.isArray(m)&&m.length===2&&m.every(r=>Array.isArray(r)&&r.length===2&&r.every(v=>Number.isFinite(Number(v))));
const mul=(a,b)=>[[a[0][0]*b[0][0]+a[0][1]*b[1][0],a[0][0]*b[0][1]+a[0][1]*b[1][1]],[a[1][0]*b[0][0]+a[1][1]*b[1][0],a[1][0]*b[0][1]+a[1][1]*b[1][1]]];
export function triangleClosureR356({T_AB,T_BC,T_CA}={}){
 if(!isMatrix(T_AB)||!isMatrix(T_BC)||!isMatrix(T_CA))throw new Error('Atlas360 closure requires three explicit 2x2 transforms');
 const loop=mul(T_CA,mul(T_BC,T_AB)),H=[[loop[0][0]-1,loop[0][1]],[loop[1][0],loop[1][1]-1]],norm=Math.sqrt(H.flat().reduce((s,v)=>s+v*v,0));
 return{loop,H,norm,recoverability:Math.exp(-Math.max(0,norm)),forcedClosure:false};
}
export function carryScarR356({transportedScar,residual,gamma=1}={}){
 if(!Array.isArray(transportedScar)||!Array.isArray(residual)||transportedScar.length!==residual.length)throw new Error('Atlas360 scar carry requires aligned transportedScar and residual vectors');
 const g=Math.max(0,finite(gamma,1));return transportedScar.map((v,i)=>finite(v)+g*finite(residual[i]));
}
export function evaluateTriangleR356({triangleClass='TEMPORAL',anchors=[],transforms=null,threshold=1e-6,hardVetoes=[],holds=[]}={}){
 const cls=String(triangleClass).toUpperCase(),reasons=[];
 if(!R356_ATLAS360_TRIANGLE_CLASSES.includes(cls))reasons.push('UNKNOWN_TRIANGLE_CLASS');
 const ids=(anchors||[]).map(a=>String(a?.id||'')).filter(Boolean);if(ids.length!==3)reasons.push('THREE_REAL_ANCHORS_REQUIRED');else if(new Set(ids).size!==3)reasons.push('ANCHOR_INDEPENDENCE_FAILED');
 let closure=null;if(transforms){try{closure=triangleClosureR356(transforms)}catch{reasons.push('INVALID_EXPLICIT_TRANSFORMS')}}else reasons.push('EXPLICIT_TRANSFORMS_REQUIRED');
 const veto=(hardVetoes||[]).some(Boolean);if(veto)reasons.push('HARD_VETO');
 const hold=(holds||[]).some(Boolean);if(hold)reasons.push('EXTERNAL_HOLD');
 const tol=Math.max(0,finite(threshold,1e-6));if(closure&&closure.norm>tol)reasons.push('CLOSURE_RESIDUAL_EXCEEDS_THRESHOLD');
 const gateState=veto?'REJECT':reasons.length?'HOLD':'PASS';
 return{schema:'OMEGA_ATLAS360_TRIANGLE_EVALUATION_R356',triangleClass:cls,anchorIds:ids,closure,threshold:tol,gateState,reasons:[...new Set(reasons)].sort(),measurementDependent:true,measurementFabricated:false,canonicalMutation:false};
}
export function compileAtlas360ConvergenceR356(input={}){
 const plan=compileAtlas360ExecutionPlanR356(input.execution||{}),selection=addressBearingSampleR356(input.leafIndex??0,input.theta??0),triangle=input.triangle?evaluateTriangleR356(input.triangle):{schema:'OMEGA_ATLAS360_TRIANGLE_EVALUATION_R356',gateState:'HOLD',reasons:['REAL_ANCHOR_TRIANGLE_NOT_SUPPLIED'],measurementDependent:true,measurementFabricated:false,canonicalMutation:false};
 return{schema:R356_ATLAS360_SCHEMA,source:R356_ATLAS360_SOURCE,counts:R356_ATLAS360_COUNTS,levels:R356_ATLAS360_LEVELS,laws:R356_ATLAS360_LAWS,selection,executionPlan:plan,triangle,advisoryOnly:true,canonicalMutation:false,productionAuthorityChanged:false,boundary:R356_ATLAS360_BOUNDARY};
}
