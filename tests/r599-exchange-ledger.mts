import assert from 'node:assert/strict';
import {wovenInitial,wovenAdvance,wovenChannelLedger} from '../src7/workspaces/wovenMorphogenesisR598.ts';
let s=wovenInitial({width:16,height:16,seed:177,diffusion:.12,exchange:.15,binding:.16,unbinding:.05,anisotropy:.8});
const before=wovenChannelLedger(s);
assert.equal(before.channels.length,7);
assert.ok(before.channels.every(c=>c.incoming===0&&c.outgoing===0));
for(let t=0;t<50;t++){
 s=wovenAdvance(s);const l=wovenChannelLedger(s);
 assert.equal(l.channels.length,7);
 assert.ok(Math.abs(l.conservationResidual)<1e-7);
 const ingress=l.channels.reduce((sum,c)=>sum+c.incoming,0),egress=l.channels.reduce((sum,c)=>sum+c.outgoing,0);
 assert.ok(Math.abs(ingress-egress)<1e-9,'inter-system directed exchange must balance');
 for(const c of l.channels){
  assert.ok([c.free,c.bound,c.incoming,c.outgoing,c.binding,c.unbinding].every(x=>Number.isFinite(x)&&x>=0));
 }
 assert.ok(l.exchange.every(x=>x>=0&&Number.isFinite(x)));
 for(let from=0;from<7;from++)for(let to=0;to<7;to++){
  if(to!==(from+1)%7)assert.equal(l.exchange[from*7+to],0,'only admitted directed ring exchanges are active');
 }
}
assert.ok(wovenChannelLedger(s).channels.some(c=>c.bound>0));
console.log('R599 EXCHANGE LEDGER PASS · seven channel inventories · typed directed receipts · balanced ingress/egress · conserved scalar budget');
