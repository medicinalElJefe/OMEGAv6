import assert from 'node:assert/strict';
import {R314_CANONICAL_FRAME,clockVectorR314,createSynchronousPacketR314,emptyUncertaintyR314,unitR314} from '../src/system/synchronousPacketR314';
import {R314FrameGraph,R314_IDENTITY_ROTATION,applyRigidTransformR314,estimateMotionR314,inverseRigidTransformR314,observerProjectionR314,type R314RigidTransform} from '../src/system/motionRelativityR314';

const local={id:'LOCAL-A',kind:'LOCAL' as const,parentId:'OMEGA_CANONICAL',revision:'R314'};
const observer={id:'OBSERVER-A',kind:'OBSERVER' as const,parentId:'LOCAL-A',revision:'R314'};
const canonicalToLocal:R314RigidTransform={fromFrameId:'OMEGA_CANONICAL',toFrameId:'LOCAL-A',rotation:R314_IDENTITY_ROTATION,translation:{x:10,y:-2,z:3},revision:'fixture',proofIds:['t1']};
const localToObserver:R314RigidTransform={fromFrameId:'LOCAL-A',toFrameId:'OBSERVER-A',rotation:[0,-1,0,1,0,0,0,0,1],translation:{x:0,y:5,z:0},revision:'fixture',proofIds:['t2']};
const graph=new R314FrameGraph().registerFrame(R314_CANONICAL_FRAME).registerFrame(local).registerFrame(observer).registerTransform(canonicalToLocal).registerTransform(localToObserver);

const p={x:4,y:7,z:-1};
const q=graph.transformPoint(p,'OMEGA_CANONICAL','OBSERVER-A');
const round=graph.transformPoint(q,'OBSERVER-A','OMEGA_CANONICAL');
for(const axis of ['x','y','z'] as const)assert.ok(Math.abs(round[axis]-p[axis])<1e-9,`roundtrip ${axis}`);

const inv=inverseRigidTransformR314(canonicalToLocal);
const directRound=applyRigidTransformR314(inv,applyRigidTransformR314(canonicalToLocal,p));
assert.deepEqual(directRound,p);

const base={stateVersion:'state-1',unit:unitR314('m'),frame:R314_CANONICAL_FRAME,provenance:{sourceId:'fixture',sourceKind:'RETURNED' as const,sourceVersion:'1',retrievedAt:null,hash:null},uncertainty:emptyUncertaintyR314(),proof:{proofIds:['proof'],state:'EVIDENCE_BOUND' as const,canonicalAdmission:false as const},scarIds:[]};
const a=createSynchronousPacketR314({...base,packetId:'a',sequence:1,payload:{x:0,y:0,z:0},clocks:clockVectorR314({eventTime:'2026-09-13T20:00:00.000Z',receiveTime:'2026-09-13T20:00:00.010Z',monotonicMs:1,logical:1})});
const b=createSynchronousPacketR314({...base,packetId:'b',sequence:2,payload:{x:10,y:0,z:0},clocks:clockVectorR314({eventTime:'2026-09-13T20:00:02.000Z',receiveTime:'2026-09-13T20:00:02.010Z',monotonicMs:2001,logical:2})});
const motion=estimateMotionR314(a,b,graph);
assert.equal(motion.dtSeconds,2);
assert.deepEqual(motion.displacementMeters,{x:10,y:0,z:0});
assert.deepEqual(motion.velocityMetersPerSecond,{x:5,y:0,z:0});
assert.equal(motion.speedMetersPerSecond,5);
assert.equal(motion.canonicalAdmission,false);

const projected=observerProjectionR314(p,'OMEGA_CANONICAL','OBSERVER-A',graph);
assert.deepEqual(projected.canonicalPoint,p);
assert.equal(projected.canonicalStateChanged,false);
assert.equal(projected.projectionOnly,true);
assert.throws(()=>estimateMotionR314(b,a,graph),/positive event-time separation/);

console.log('R314 MOTION RELATIVITY PASS · frame graph · inverse/roundtrip · observer projection · finite-difference motion · no physical-dimension inflation');
