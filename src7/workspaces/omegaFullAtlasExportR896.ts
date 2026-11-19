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

/** R897: inspect one real compiled Atlas address without exporting a 20,736-row file. */
export function inspectAtlasAddressR897(field:Mandala20736Field,address:number):Array<{name:string;value:number}>{
 if(field.count!==20736||!Number.isInteger(address)||address<0||address>=field.count)throw Error('Atlas address must be 0–20735');
 const keys=['x','y','z','phase','C','Phi','q','Lambda','scar','evidence','rsc','geometry','motion','symmetry','forecast','route','continuityGate','motionDrive','velocity','acceleration','routeNext','domain'] as const;
 return keys.map(name=>{
  if(field[name].length!==field.count)throw Error('Incomplete Atlas field: '+name);
  const value=field[name][address];
  if(!Number.isFinite(value))throw Error('Nonfinite Atlas field '+name+' at address '+address);
  if(name==='routeNext'&&(!Number.isInteger(value)||value<0||value>=field.count))throw Error('Invalid route target at '+address);
  return {name,value};
 });
}
