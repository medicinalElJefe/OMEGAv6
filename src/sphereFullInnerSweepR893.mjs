// R893: deterministic bounded sweep over every one of the 20,736 logical inner-state addresses.
// This schedules actual local agent operations, not a render-only animation.
// No ambient network calls, model inference, or canonical state writes.
import {AGENTS,SIZE} from './sphereAgentFabricR887.mjs';
import {autonomousTickR891} from './sphereAutonomousR891.mjs';
export const R893_SCHEMA='OMEGA_SPHERE_ALL_INNER_SWEEP_R893';
export const R893_MAX_BATCH=64;
export function sweepCoordinateR893(members,stepCursor){
 if(!Array.isArray(members)||members.length<1||members.length>12||new Set(members).size!==members.length||members.some(n=>!Number.isSafeInteger(n)||n<0||n>=AGENTS))throw new RangeError('Require 1–12 distinct valid logical agent identifiers');
 if(!Number.isSafeInteger(stepCursor)||stepCursor<0)throw new RangeError('Sweep step cursor must be a nonnegative safe integer');
 const cycle=SIZE*members.length;
 return Object.freeze({inner:Math.floor(stepCursor/members.length)%SIZE,member:members[stepCursor%members.length],memberIndex:stepCursor%members.length,completedCycles:Math.floor(stepCursor/cycle),cycleProgress:stepCursor%cycle,cycleLength:cycle});
}
export function autonomousSweepR893(fabric,members,stepCursor=0,budget=12){
 if(!fabric||!Array.isArray(fabric.queue)||!Array.isArray(fabric.receipts)||!(fabric.active instanceof Map))throw new Error('Require a valid existing SPHERE fabric');
 sweepCoordinateR893(members,stepCursor);
 if(!Number.isSafeInteger(budget)||budget<1||budget>R893_MAX_BATCH)throw new RangeError('Sweep batch is limited to 1–64 tasks');
 if(stepCursor>Number.MAX_SAFE_INTEGER-budget)throw new RangeError('Sweep cursor requires explicit safe reset before overflow');
 const receipts=[],visits=[];let nextStepCursor=stepCursor,mode='LOCAL_DETERMINISTIC_FULL_INNER_SWEEP';
 for(let i=0;i<budget;i++){
  const coord=sweepCoordinateR893(members,nextStepCursor);
  const result=autonomousTickR891(fabric,members,coord.inner,coord.memberIndex,1,true);
  if(result.receipts.length)receipts.push(...result.receipts);
  if(result.mode==='HELD_CAPACITY'){mode=result.mode;break}
  if(result.mode==='OPERATOR_QUEUE_FIRST'){mode=result.mode;break}
  visits.push({agent:coord.member,inner:coord.inner,receiptTick:result.receipts[0]?.tick??null});
  nextStepCursor++;
 }
 return Object.freeze({schema:R893_SCHEMA,mode,receipts,visits,nextStepCursor,coordinate:sweepCoordinateR893(members,nextStepCursor),cloudCalls:0,canonicalWrites:0});
}
