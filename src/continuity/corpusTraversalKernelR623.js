// R623: portable deterministic address traversal for OMEGA7.
// Read-only representation of the historical 12^10 lattice, NOT private workbook or native execution.
export const ADDRESS_CAPACITY_R623=12**10;
export const BAND_WIDTH_R623=12**8;
export const AXES_R623=Object.freeze(['Domain','Phase','Regulation','Layer','Lens','Host','Operator','TimeBand','Evidence','Render']);
export function decodeAddressR623(address){
 if(!Number.isSafeInteger(address)||address<0||address>=ADDRESS_CAPACITY_R623)throw Error('address outside 12^10');
 const digits=new Array(10);
 for(let i=9;i>=0;i--){digits[i]=address%12;address=Math.floor(address/12)}
 return digits;
}
export function traverseAddressR623({address,offset,wrap=false}={}){
 if(!Number.isSafeInteger(address)||address<0||address>=ADDRESS_CAPACITY_R623)throw Error('address outside 12^10');
 if(!Number.isSafeInteger(offset))throw Error('offset must be a safe integer');
 if(typeof wrap!=='boolean')throw Error('wrap must be boolean');
 const raw=BigInt(address)+BigInt(offset),capacity=BigInt(ADDRESS_CAPACITY_R623);
 const crossedBoundary=raw<0n||raw>=capacity;
 if(crossedBoundary&&!wrap)throw Error('traversal outside 12^10 without wrap authority');
 const target=Number(((raw%capacity)+capacity)%capacity);
 const fromBand=Math.floor(address/BAND_WIDTH_R623),toBand=Math.floor(target/BAND_WIDTH_R623);
 return Object.freeze({
  fromAddress:address,toAddress:target,offset,wrapAuthorized:wrap,wrapped:crossedBoundary,
  fromBand,toBand,crossedBand:raw<BigInt(fromBand*BAND_WIDTH_R623)||raw>=BigInt((fromBand+1)*BAND_WIDTH_R623),
  endpointBandChanged:fromBand!==toBand,
  fromDigits:Object.freeze(decodeAddressR623(address)),toDigits:Object.freeze(decodeAddressR623(target)),
  truthClass:'READ_ONLY_REPRESENTATIONAL_ADDRESS_EXECUTION_NOT_HISTORICAL_EXECUTOR',
  sourceBytesVerified:false,canonicalMutation:false
 });
}
