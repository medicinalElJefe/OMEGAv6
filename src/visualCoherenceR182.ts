export const VISUAL_COHERENCE_REVISION='R182' as const;
export const VISUAL_MOTION_DEFAULT='PACKET_LOCKED' as const;

const cl=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));

export type R182MotionClock={
  mode:'PACKET_LOCKED'|'ROUTE_REPLAY';
  routePhase:number;
  progress:number;
  moving:boolean;
  source:'CANONICAL_PACKET'|'GOVERNED_ROUTE_PROGRESS';
  truthBoundary:string;
};

export function compileVisualMotionClockR182(playing:boolean,tick:number,progress:number):R182MotionClock{
  const p=cl(progress);
  return{
    mode:playing?'ROUTE_REPLAY':'PACKET_LOCKED',
    routePhase:Math.max(0,Number.isFinite(tick)?tick:0)+p,
    progress:p,
    moving:Boolean(playing),
    source:playing?'GOVERNED_ROUTE_PROGRESS':'CANONICAL_PACKET',
    truthBoundary:'R182 never uses wall-clock time to make canonical geometry swim. Motion advances only from explicit governed route/replay progress. Pausing freezes the exact route frame; manual yaw/pitch/zoom remain observer controls and never mutate canonical state.'
  };
}

export function observerYawR182(baseYaw:number,observer:string,hostPhase:number){
  const hostOffset=observer==='HOST_FOLLOW'&&Number.isFinite(hostPhase)?hostPhase*.12:0;
  return (Number.isFinite(baseYaw)?baseYaw:0)+hostOffset;
}

export function calibratedVisualFieldR182(record:any){
  const m=record?.metrics||{},math=record?.math||{},phi=record?.phi||{},predict=record?.predict||{};
  const continuity=cl(Number(m.continuity));
  const plasticity=cl(Number(m.plasticity));
  const contradiction=cl(Number(m.contradiction));
  const burden=cl(Number(m.burden));
  const scar=cl(Number(m.scar));
  const evidence=cl(Number(m.evidence));
  const motion=cl(Number(math.normalizedMotionRelativity));
  const phaseGradient=cl(Math.abs(Number(phi.dPhi)));
  const carry=cl(Math.abs(Number(predict.carry)));
  const transitionPressure=cl(.24*motion+.20*phaseGradient+.18*carry+.16*contradiction+.14*burden+.08*scar);
  const invariantSupport=cl(.32*continuity+.22*plasticity+.18*evidence+.16*(1-contradiction)+.12*(1-burden));
  const residualPressure=cl(.34*burden+.24*contradiction+.18*scar+.14*phaseGradient+.10*motion);
  return{
    continuity,plasticity,contradiction,burden,scar,evidence,motion,phaseGradient,carry,
    transitionPressure,invariantSupport,residualPressure,
    decision:String(m.decision||'TURN'),
    sourceStateId:Number(record?.stateId)||null,
    targetStateId:Number(record?.autoPing?.dataNext)+1||null,
    boundary:'R182 visual calibration is a derived display authority over the already-bound canonical packet. It changes emphasis, deformation and route animation only; it does not create evidence, physical motion, new dimensions or CanonState.'
  };
}

export const VISUAL_COHERENCE_BOUNDARY='Stable packet first. Explicit route motion second. Manual camera motion is observer-only. No ambient constellation drift, no wall-clock geometry animation, no shadow CΩ/Φ/q/Λ controls, and no generated visual may be presented as returned physical evidence.' as const;
