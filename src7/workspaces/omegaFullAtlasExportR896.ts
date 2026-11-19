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

/** R899: execute the compiled route graph, stopping at the first repeated address. */
export function traceAtlasRouteR899(field:Mandala20736Field,start:number,maxSteps:number):{addresses:number[];cycleAt:number|null;truncated:boolean}{
 if(!Number.isInteger(maxSteps)||maxSteps<1||maxSteps>256)throw Error('Route steps must be 1–256');
 if(!Number.isInteger(start)||start<0||start>=20736)throw Error('Atlas address must be 0–20735');
 const visited=new Map<number,number>(),addresses:number[]=[];
 let current=start;
 for(let step=0;step<maxSteps;step++){
  const cycle=visited.get(current);
  if(cycle!==undefined)return {addresses,cycleAt:cycle,truncated:false};
  visited.set(current,addresses.length);
  const values=inspectAtlasAddressR897(field,current);
  addresses.push(current);
  current=values.find(item=>item.name==='routeNext')!.value;
 }
 return {addresses,cycleAt:visited.get(current)??null,truncated:!visited.has(current)};
}

/** R900: export exactly the executed route with full computed fields and cycle evidence. */
export function exportAtlasRouteCsvR900(field:Mandala20736Field,trace:{addresses:number[];cycleAt:number|null;truncated:boolean}):string{
 if(!Array.isArray(trace.addresses)||trace.addresses.length<1||trace.addresses.length>256)throw Error('Invalid route trace length');
 if(trace.cycleAt!==null&&(!Number.isInteger(trace.cycleAt)||trace.cycleAt<0||trace.cycleAt>=trace.addresses.length))throw Error('Invalid cycle index');
 const names=inspectAtlasAddressR897(field,trace.addresses[0]).map(item=>item.name);
 const lines=['step,address,'+names.join(',')+',cycle_return_step,truncated'];
 const seen=new Set<number>();
 for(let index=0;index<trace.addresses.length;index++){
  const address=trace.addresses[index];
  if(seen.has(address))throw Error('Route repeats before cycle boundary');
  seen.add(address);
  const values=inspectAtlasAddressR897(field,address);
  if(index>0&&values.length!==names.length)throw Error('Route field mismatch');
  lines.push([index+1,address,...values.map(item=>item.value),trace.cycleAt===null?'':trace.cycleAt+1,trace.truncated?'true':'false'].join(','));
  if(index+1<trace.addresses.length&&values.find(item=>item.name==='routeNext')?.value!==trace.addresses[index+1])throw Error('Discontinuous route trace');
 }
 const last=inspectAtlasAddressR897(field,trace.addresses[trace.addresses.length-1]);
 const next=last.find(item=>item.name==='routeNext')!.value;
 if(trace.cycleAt!==null&&next!==trace.addresses[trace.cycleAt])throw Error('Cycle return does not match compiled route');
 if(trace.cycleAt===null&&seen.has(next))throw Error('Unreported route cycle');
 if(trace.truncated!==(trace.cycleAt===null))throw Error('Inconsistent route termination');
 return lines.join('\\n')+'\\n';
}
