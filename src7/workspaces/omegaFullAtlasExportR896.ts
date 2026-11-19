import type {Mandala20736Field} from '../../src/mandala20736Runtime';

/** R896: export every compiled address without sampling or inventing a physical dimension. */
export function exportFullAtlasCsvR896(field:Mandala20736Field):string{
 if(field.count!==20736)throw Error('Full Atlas requires exactly 20736 compiled addresses');
 const keys=['x','y','z','phase','C','Phi','q','Lambda','scar','evidence','rsc','geometry','motion','symmetry','forecast','route','continuityGate','motionDrive','velocity','acceleration','routeNext','domain'] as const;
 for(const key of keys)if(field[key].length!==field.count)throw Error('Incomplete Atlas field: '+key);
 const lines=['address,'+keys.join(',')];
 for(let i=0;i<field.count;i++){
  const values=keys.map(key=>{
   const value=field[key][i];
   if(!Number.isFinite(value))throw Error('Nonfinite Atlas field '+key+' at address '+i);
   if(key==='routeNext'&&(value<0||value>=field.count||!Number.isInteger(value)))throw Error('Invalid route target at '+i);
   return String(value);
  });
  lines.push(i+','+values.join(','));
 }
 return lines.join('\n')+'\n';
}
