import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'vite';

const vite=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
 const sync=await vite.ssrLoadModule('/src/system/synchronousPacketR314.ts');
 const motion=await vite.ssrLoadModule('/src/system/motionRelativityR314.ts');
 const canon=await vite.ssrLoadModule('/src/system/implementationCanonCompilerR314.ts');

 const clocks=sync.clockVectorR314({eventTime:'2026-09-13T20:00:00.000Z',receiveTime:'2026-09-13T20:00:00.125Z',monotonicMs:100,logical:7,computeStartMs:101,computeEndMs:103,validFrom:'2026-09-13T20:00:00.000Z',validUntil:'2026-09-13T20:05:00.000Z'});
 const packet=sync.createSynchronousPacketR314({packetId:'pkt-1',stateVersion:'state-1',sequence:1,payload:{x:0,y:0,z:0},unit:sync.unitR314('m'),frame:sync.R314_CANONICAL_FRAME,clocks,provenance:{sourceId:'fixture',sourceKind:'RETURNED',sourceVersion:'1',retrievedAt:'2026-09-13T20:00:00.125Z',hash:'abc'},uncertainty:sync.emptyUncertaintyR314(),proof:{proofIds:['proof-1'],state:'EVIDENCE_BOUND',canonicalAdmission:false},scarIds:['scar-1']});
 assert.equal(sync.validateSynchronousPacketR314(packet).valid,true);
 assert.equal(sync.convertUnitR314(1,sync.unitR314('km'),sync.unitR314('m')),1000);
 assert.throws(()=>sync.convertUnitR314(1,sync.unitR314('m'),sync.unitR314('s')),/dimension mismatch/);
 assert.equal(sync.packetDigestR314(packet),sync.packetDigestR314({...packet,payload:{x:0,y:0,z:0}}));
 const reversed={...packet,clocks:{...clocks,receiveTime:'2026-09-13T19:59:59.000Z'}};
 assert.equal(sync.validateSynchronousPacketR314(reversed).valid,false);
 assert.ok(sync.validateSynchronousPacketR314(reversed).issues.some(x=>x.code==='CLOCK_RECEIVE_BEFORE_EVENT'));
 const leak={...packet,proof:{...packet.proof,canonicalAdmission:true}};
 assert.equal(sync.validateSynchronousPacketR314(leak).valid,false);
 assert.ok(sync.validateSynchronousPacketR314(leak).issues.some(x=>x.code==='CANON_ADMISSION_LEAK'));

 const local={id:'LOCAL-A',kind:'LOCAL',parentId:'OMEGA_CANONICAL',revision:'R314'};
 const observer={id:'OBSERVER-A',kind:'OBSERVER',parentId:'LOCAL-A',revision:'R314'};
 const canonicalToLocal={fromFrameId:'OMEGA_CANONICAL',toFrameId:'LOCAL-A',rotation:motion.R314_IDENTITY_ROTATION,translation:{x:10,y:-2,z:3},revision:'fixture',proofIds:['t1']};
 const localToObserver={fromFrameId:'LOCAL-A',toFrameId:'OBSERVER-A',rotation:[0,-1,0,1,0,0,0,0,1],translation:{x:0,y:5,z:0},revision:'fixture',proofIds:['t2']};
 const graph=new motion.R314FrameGraph().registerFrame(sync.R314_CANONICAL_FRAME).registerFrame(local).registerFrame(observer).registerTransform(canonicalToLocal).registerTransform(localToObserver);
 const point={x:4,y:7,z:-1};
 const projectedPoint=graph.transformPoint(point,'OMEGA_CANONICAL','OBSERVER-A');
 const round=graph.transformPoint(projectedPoint,'OBSERVER-A','OMEGA_CANONICAL');
 for(const axis of ['x','y','z'])assert.ok(Math.abs(round[axis]-point[axis])<1e-9,`frame round-trip ${axis}`);
 const base={stateVersion:'state-1',unit:sync.unitR314('m'),frame:sync.R314_CANONICAL_FRAME,provenance:{sourceId:'fixture',sourceKind:'RETURNED',sourceVersion:'1',retrievedAt:null,hash:null},uncertainty:sync.emptyUncertaintyR314(),proof:{proofIds:['proof'],state:'EVIDENCE_BOUND',canonicalAdmission:false},scarIds:[]};
 const a=sync.createSynchronousPacketR314({...base,packetId:'a',sequence:1,payload:{x:0,y:0,z:0},clocks:sync.clockVectorR314({eventTime:'2026-09-13T20:00:00.000Z',receiveTime:'2026-09-13T20:00:00.010Z',monotonicMs:1,logical:1})});
 const b=sync.createSynchronousPacketR314({...base,packetId:'b',sequence:2,payload:{x:10,y:0,z:0},clocks:sync.clockVectorR314({eventTime:'2026-09-13T20:00:02.000Z',receiveTime:'2026-09-13T20:00:02.010Z',monotonicMs:2001,logical:2})});
 const movement=motion.estimateMotionR314(a,b,graph);
 assert.equal(movement.dtSeconds,2);assert.deepEqual(movement.displacementMeters,{x:10,y:0,z:0});assert.equal(movement.speedMetersPerSecond,5);assert.equal(movement.canonicalAdmission,false);
 const projection=motion.observerProjectionR314(point,'OMEGA_CANONICAL','OBSERVER-A',graph);assert.equal(projection.canonicalStateChanged,false);assert.equal(projection.projectionOnly,true);
 assert.throws(()=>motion.estimateMotionR314(b,a,graph),/positive event-time separation/);

 const receipt=JSON.parse(fs.readFileSync('public/omega-r314-implementation-canon-source.json','utf8'));
 assert.equal(receipt.rowCount,675);assert.equal(receipt.sourceStatus.LOCKED,12);assert.equal(receipt.sourceStatus.PLANNED,663);assert.equal(Object.values(receipt.types).reduce((a,b)=>a+b,0),675);
 const rows=Array.from({length:675},(_,index)=>{const n=index+1,id=`CANON-${String(n).padStart(6,'0')}`;return{rowId:id,type:n<=12?'HARD_INVARIANT':'MODULE',phase:n<=12?'Governance':'Synthetic',component:`Component ${n}`,artifact:n===13?'src/schema/base.py':`planned/${n}.py`,symbol:n===13?'SchemaBase':`Symbol${n}`,purpose:`Purpose ${n}`,sourceStatus:n<=12?'LOCKED':'PLANNED',priority:'P0',sequence:n}});
 const compiled=canon.compileImplementationCanonR314(rows,{repositoryPaths:new Set(),successorByRowId:canon.R314_CANON_SUCCESSOR_MAP});
 assert.equal(compiled.rowCount,675);assert.equal(compiled.summary.locked,12);assert.equal(compiled.summary.current,7);assert.equal(compiled.canonicalAdmission,false);
 assert.equal(compiled.compiled.find(row=>row.rowId==='CANON-000013').compiledState,'CURRENT_SUCCESSOR');
 assert.equal(compiled.compiled.find(row=>row.rowId==='CANON-000050').compiledState,'PLANNED');
 assert.throws(()=>canon.compileImplementationCanonR314(rows.slice(0,-1),{repositoryPaths:new Set()}),/row-count mismatch/);

 console.log('R314 EXECUTABLE RUNTIME PASS · synchronous packet · units/frames/clocks · motion relativity · 675-row canon compiler · no Canon leakage');
}finally{
 await vite.close();
}
