import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getMandala20736Field} from '../src/mandala20736Runtime.ts';
import {isCorpusReady} from '../src/corpusRuntime.ts';
import {motionDecisionR666,nodeIdR666} from '../src7/workspaces/historicalObserverR666.ts';

test('R832 source field integrates all 20736 addresses with bounded transitions and finite developmental derivatives',async()=>{
 // The shared field compiler must initialize its own source dependency; callers cannot rely on app bootstrap order.
 const field=await getMandala20736Field();
 assert.equal(isCorpusReady(),true,'shared field compilation must initialize the embedded corpus');
 assert.equal(field.count,20736);
 for(let i=0;i<field.count;i++){
  const n=field.routeNext[i];
  assert.ok(Number.isInteger(n)&&n>=0&&n<field.count,'invalid route successor at '+i);
  for(const [label,value] of Object.entries({
   C:field.C[i],Phi:field.Phi[i],q:field.q[i],Lambda:field.Lambda[i],
   forecast:field.forecast[i],continuityGate:field.continuityGate[i],
   motionDrive:field.motionDrive[i],velocity:field.velocity[i],acceleration:field.acceleration[i]
  }))assert.ok(Number.isFinite(value),'nonfinite '+label+' at '+i);
  assert.ok(field.continuityGate[i]>=0&&field.continuityGate[i]<=1);
  const gate=field.C[i]/(1+field.Lambda[i]+field.q[i]);
  assert.ok(Math.abs(field.continuityGate[i]-gate)<1e-6);
  const velocity=.45*(field.C[n]-field.C[i])+.35*(field.Phi[n]-field.Phi[i])-.20*(field.scar[n]-field.scar[i]);
  assert.ok(Math.abs(field.acceleration[i]-(field.velocity[n]-field.velocity[i]))<1e-6,'acceleration successor mismatch at '+i);
  const drive=Math.min(1,Math.abs(field.C[n]-field.C[i])+Math.abs(field.Phi[n]-field.Phi[i])+Math.abs(field.scar[n]-field.scar[i]));
  assert.ok(Math.abs(field.motionDrive[i]-drive)<1e-6,'motion drive mismatch at '+i);
  assert.ok(Math.abs(field.velocity[i]-velocity)<1e-6);
  const decision=motionDecisionR666({continuity:field.C[i],future_plasticity:field.Phi[i],burden:field.Lambda[i],contradiction:field.q[i]});
  assert.ok(['STAY','TURN','ESCALATE'].includes(decision.decision));
  assert.ok(Number.isFinite(decision.ratio));
 }
 // R833: exercise the same bounded successor walk used by the visual trajectory.
 // A repeated node ends the walk; every edge must originate in the compiled field.
 for(const start of [0,1,1727,1728,10367,20735]){
  const seen=new Set<number>(),route:number[]=[];
  let at=start;
  for(let k=0;k<64&&!seen.has(at);k++){
   assert.ok(Number.isInteger(at)&&at>=0&&at<field.count);
   seen.add(at);route.push(at);at=field.routeNext[at];
  }
  assert.ok(route.length>=1&&route.length<=64);
  assert.equal(route[0],start);
  assert.equal(new Set(route).size,route.length);
  for(let k=1;k<route.length;k++)assert.equal(field.routeNext[route[k-1]],route[k]);
  for(const n of route)assert.ok(Number.isFinite(field.x[n])&&Number.isFinite(field.y[n]),'trajectory projection must have finite XY coordinates');
  // R835: verify telescoping cumulative derivatives against endpoint values.
  let deltaC=0,deltaPhi=0,deltaScar=0,gateSum=0,driveSum=0,forecastSum=0;
  for(let k=0;k<route.length;k++){
   const n=route[k];gateSum+=field.continuityGate[n];driveSum+=field.motionDrive[n];forecastSum+=field.forecast[n];
   if(k>0){const prev=route[k-1];deltaC+=field.C[n]-field.C[prev];deltaPhi+=field.Phi[n]-field.Phi[prev];deltaScar+=field.scar[n]-field.scar[prev]}
  }
  const last=route[route.length-1];
  assert.ok(Math.abs(deltaC-(field.C[last]-field.C[start]))<1e-6);
  assert.ok(Math.abs(deltaPhi-(field.Phi[last]-field.Phi[start]))<1e-6);
  assert.ok(Math.abs(deltaScar-(field.scar[last]-field.scar[start]))<1e-6);
  for(const mean of [gateSum/route.length,driveSum/route.length,forecastSum/route.length])assert.ok(Number.isFinite(mean),'route aggregate must remain finite');
 }
 assert.equal(nodeIdR666(12,12,12,12),'node_020736');
});
