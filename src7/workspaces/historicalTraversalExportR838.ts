import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {motionDecisionR666,nodeIdR666} from './historicalObserverR666';

/** Model-space export only. Never a Canon admission, R142 receipt or physical forecast. */
export const R838_TRAVERSAL_COLUMNS=['step','address_0_based','node_id','continuity','plasticity','contradiction','burden','scar','evidence','next_address_0_based','continuity_gate','forecast_score','motion_drive','motion_decision','decision_ratio','delta_continuity','delta_plasticity','delta_scar'] as const;
export function exportTraversalCsvR838(field:Mandala20736Field,route:readonly number[]):string{
 if(field.count!==20736)throw new Error('Expected 20736-state field');
 if(route.length===0||route.length>64)throw new Error('Expected a nonempty route of at most 64 states');
 const lines=[R838_TRAVERSAL_COLUMNS.join(',')];
 for(let k=0;k<route.length;k++){
  const n=route[k],next=field.routeNext[n];
  if(!Number.isSafeInteger(n)||n<0||n>=field.count||!Number.isSafeInteger(next)||next<0||next>=field.count)throw new Error('Invalid route state or successor');
  if(k>0&&field.routeNext[route[k-1]]!==n)throw new Error('Route violates source successor chain');
  const a={d:Math.floor(n/1728)+1,p:Math.floor(n/144)%12+1,r:Math.floor(n/12)%12+1,l:n%12+1};
  const decision=motionDecisionR666({continuity:field.C[n],future_plasticity:field.Phi[n],contradiction:field.q[n],burden:field.Lambda[n]});
  const values=[k+1,n,nodeIdR666(a.d,a.p,a.r,a.l),field.C[n],field.Phi[n],field.q[n],field.Lambda[n],field.scar[n],field.evidence[n],next,field.continuityGate[n],field.forecast[n],field.motionDrive[n],decision.decision,decision.ratio,field.C[next]-field.C[n],field.Phi[next]-field.Phi[n],field.scar[next]-field.scar[n]];
  if(values.some(x=>typeof x==='number'&&!Number.isFinite(x)))throw new Error('Non-finite source metric');
  lines.push(values.join(','));
 }
 return lines.join('\r\n')+'\r\n';
}
