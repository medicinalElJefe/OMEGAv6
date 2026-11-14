/** Browser-local model address interoperability. Not CanonState admission or an R142 receipt. */
export const OMEGA_ADDRESS_KEY_R841='omega.v6.address';
export const OMEGA_ADDRESS_EVENT_R841='omega7-address-changed';
export function parseModelAddressR841(raw:string|null):number|null{
 if(raw===null||!/^(0|[1-9][0-9]*)$/.test(raw))return null;
 const n=Number(raw);
 return Number.isSafeInteger(n)&&n>=0&&n<20736?n:null;
}
export function coordinatesToAddressR841(d:number,p:number,r:number,l:number):number{
 if(![d,p,r,l].every(n=>Number.isInteger(n)&&n>=1&&n<=12))throw new RangeError('Invalid 12-fold coordinate');
 return (((d-1)*12+p-1)*12+r-1)*12+l-1;
}
export function addressToCoordinatesR841(n:number){
 if(!Number.isInteger(n)||n<0||n>=20736)throw new RangeError('Invalid model address');
 return {d:Math.floor(n/1728)+1,p:Math.floor(n/144)%12+1,r:Math.floor(n/12)%12+1,l:n%12+1};
}
