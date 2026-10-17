import assert from 'node:assert/strict';
import {wovenInitial,wovenAdvance,wovenMass,wovenObservables} from '../src7/workspaces/wovenMorphogenesisR598.ts';
for(const seed of [1,19,314159]){
 for(const anisotropy of [0,.5,1]){
  let s=wovenInitial({width:18,height:14,seed,diffusion:.14,exchange:.13,binding:.11,unbinding:.035,anisotropy});
  const initial=wovenMass(s),initialCopy=wovenInitial(s.params);
  for(let t=0;t<80;t++){
   s=wovenAdvance(s);
   const o=wovenObservables(s);
   assert.ok(Number.isFinite(o.mass)&&Number.isFinite(o.boundFraction)&&Number.isFinite(o.peak));
   assert.ok(Math.abs(o.residual)<1e-7,'scalar budget must be conserved');
   assert.ok(s.free.every(x=>Number.isFinite(x)&&x>=-1e-12));
   assert.ok(s.bound.every(x=>Number.isFinite(x)&&x>=-1e-12));
   assert.ok(s.scar.every(x=>Number.isFinite(x)&&x>=0));
  }
  assert.ok(Math.abs(wovenMass(s)-initial)<1e-7);
  let repeated=initialCopy;for(let t=0;t<80;t++)repeated=wovenAdvance(repeated);
  assert.deepEqual([...s.free],[...repeated.free],'fixed seed and parameters must reproduce the same trajectory');
  assert.deepEqual([...s.bound],[...repeated.bound]);
  assert.ok(wovenObservables(s).boundFraction>0);
 }
}
const a=wovenInitial({width:18,height:14,seed:9,diffusion:.1,exchange:.1,binding:.1,unbinding:.03,anisotropy:0});
const b=wovenInitial({...a.params,anisotropy:1});
let x=a,y=b;for(let t=0;t<30;t++){x=wovenAdvance(x);y=wovenAdvance(y)}
assert.notDeepEqual([...x.free],[...y.free],'exchange shaping must affect resulting pattern');
console.log('R598 WOVEN MORPHOGENESIS PASS · 7 coupled channels · conserved scalar budget · no negative reservoirs · deterministic 80-step evolution · shape sensitivity');
