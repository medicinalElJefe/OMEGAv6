export type SarVisualScaleR280='LINEAR'|'LOG_DB'|'PHASE_CYCLIC'|'COHERENCE'|'SIGNED_DEFORMATION'|'UNCERTAINTY';
export function clamp01R280(x:number){return Math.max(0,Math.min(1,x))}
export function normalizeLinearR280(x:number,min:number,max:number){return max===min ? .5 : clamp01R280((x-min)/(max-min))}
export function normalizeDbR280(db:number,minDb=-30,maxDb=5){return normalizeLinearR280(db,minDb,maxDb)}
export function normalizePhaseR280(rad:number){const t=((rad+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);return t/(2*Math.PI)}
export function normalizeSignedR280(x:number,limit:number){return .5+.5*Math.max(-1,Math.min(1,x/Math.max(1e-12,limit)))}
export function displayScaleBoundaryR280(){return'Visual normalization is a display transform only. It must retain source units/range and may not be written back as measurement truth.'}
