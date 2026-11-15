import type {Mandala20736Field} from '../../src/mandala20736Runtime';

/** R858: a real, portable SVG artifact from computed source-model traversal, not an image-model or host receipt. */
export function renderTraversalSvgR858(field:Mandala20736Field,route:readonly number[]):string{
 if(!Array.isArray(route)||route.length<2||route.length>64)throw RangeError('A computed route of 2–64 states is required');
 if(!field||field.count!==20736||!field.x||!field.y||!field.routeNext||field.x.length!==20736||field.y.length!==20736||field.routeNext.length!==20736)throw Error('Complete model projection required');
 const points=route.map((n,k)=>{
  if(!Number.isInteger(n)||n<0||n>=20736)throw RangeError('Invalid model route address');
  if(k&&field.routeNext[route[k-1]]!==n)throw Error('Route is not a computed successor chain');
  const x=320+field.x[n]*235,y=150-field.y[n]*115;
  if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Nonfinite model projection');
  return {x,y,n};
 });
 const polyline=points.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join(' ');
 const markers=points.map((p,k)=>'<circle cx="'+p.x.toFixed(3)+'" cy="'+p.y.toFixed(3)+'" r="'+(k===0||k===points.length-1?4:1.8)+'" fill="'+(k===0?'#1d806f':k===points.length-1?'#b85d32':'#3b6685')+'"/>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="600" viewBox="0 0 640 300" role="img" aria-label="OMEGA computed model traversal"><rect width="640" height="300" fill="#f8fafc"/><path d="M20 150H620M320 20V280" stroke="#b6c2ce" stroke-width=".8"/><polyline points="'+polyline+'" fill="none" stroke="#164d78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+markers+'<text x="20" y="25" fill="#163c5a" font-family="sans-serif" font-size="13">OMEGA · computed model traversal · '+points.length+' states</text><text x="20" y="286" fill="#516779" font-family="sans-serif" font-size="10">MODEL_DERIVED · addresses '+(points[0].n+1)+' to '+(points[points.length-1].n+1)+' · not physical calibration or Canon proof</text></svg>';
}
