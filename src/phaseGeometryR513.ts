/**
 * R513 exact discrete phase operators for the existing 12^4 OMEGA address space.
 *
 * This is a coordinate transformation contract, NOT a physical Lorentz boost,
 * an atomic quantum operation, or a reconstruction of missing source data.
 * Layout: address = 1728*d + 144*p + 12*r + l; all axes 0..11.
 * 011 and 01-1 are respectively +pi/2 and -pi/2 phase turns, i.e. +/-3
 * sectors when a complete circle has twelve evenly spaced phase sectors.
 */
export const R513_PHASE_SCHEMA = 'OMEGA_EXACT_PHASE_TURNS_R513' as const;
export const R513_ATLAS_SIZE = 20736;
export const R513_PHASE_SECTORS = 12;
export type R513Turn = '011' | '01-1';

function checkedAddress(address:number):number {
  if(!Number.isSafeInteger(address) || address<0 || address>=R513_ATLAS_SIZE)
    throw new RangeError('R513 requires an integer canonical address in [0,20735]');
  return address;
}
export function phaseOfAddressR513(address:number):number {
  return Math.floor(checkedAddress(address)/144)%R513_PHASE_SECTORS;
}
export function quarterTurnAddressR513(address:number,operator:R513Turn):number {
  const a=checkedAddress(address);
  if(operator!=='011'&&operator!=='01-1')
    throw new RangeError('R513 operator must be 011 or 01-1');
  const p=phaseOfAddressR513(a);
  const next=(p+(operator==='011'?3:9))%R513_PHASE_SECTORS;
  return a+144*(next-p);
}
export function inverseTurnR513(operator:R513Turn):R513Turn {
  if(operator==='011')return '01-1';
  if(operator==='01-1')return '011';
  throw new RangeError('Unknown R513 operator');
}
export function phaseOrbitR513(address:number):readonly [number,number,number,number] {
  const a=checkedAddress(address),b=quarterTurnAddressR513(a,'011');
  const c=quarterTurnAddressR513(b,'011'),d=quarterTurnAddressR513(c,'011');
  return [a,b,c,d];
}
export function phaseClassR513(address:number):number {
  return phaseOfAddressR513(address)%3;
}
export function verifyQuarterTurnR513(address:number) {
  const a=checkedAddress(address);
  const plus=quarterTurnAddressR513(a,'011');
  const minus=quarterTurnAddressR513(a,'01-1');
  const inverseRecovered=quarterTurnAddressR513(plus,'01-1')===a
    &&quarterTurnAddressR513(minus,'011')===a;
  const fourCycle=quarterTurnAddressR513(
    quarterTurnAddressR513(
      quarterTurnAddressR513(plus,'011'),'011'),'011')===a;
  const sameNonPhaseAxes=(x:number)=>Math.floor(x/1728)===Math.floor(a/1728)
    &&Math.floor(x/12)%12===Math.floor(a/12)%12&&x%12===a%12;
  return {
    schema:R513_PHASE_SCHEMA,address:a,phase:phaseOfAddressR513(a),
    constructAddress:plus,pruneAddress:minus,orbit:phaseOrbitR513(a),
    phaseClass:phaseClassR513(a),inverseRecovered,fourCycle,
    nonPhaseAxesPreserved:sameNonPhaseAxes(plus)&&sameNonPhaseAxes(minus),
    sourceBoundary:'Exact integer phase-address geometry only; no inferred atomic dynamics, retained memory, or future equivalence.'
  };
}
