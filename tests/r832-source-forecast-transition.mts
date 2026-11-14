import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getMandala20736Field} from '../src/mandala20736Runtime.ts';
import {initCorpusPack,isCorpusReady} from '../src/corpusRuntime.ts';
import {motionDecisionR666,nodeIdR666} from '../src7/workspaces/historicalObserverR666.ts';

test('R832 source field integrates all 20736 addresses with bounded transitions and finite developmental derivatives',async()=>{
 await initCorpusPack();
 assert.equal(isCorpusReady(),true,'embedded source corpus must be initialized before field compilation');
 const field=await getMandala20736Field();
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
 assert.equal(nodeIdR666(12,12,12,12),'node_020736');
});
