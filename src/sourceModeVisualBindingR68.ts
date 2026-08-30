import {evaluateSourceBackedModes,type SourceBackedModeResult} from './sourceBackedModeRuntimeR21';

export type VisualProjectionMode='FIELD'|'MATTER'|'TRAVERSAL'|'FORECAST'|'RELATIVITY'|'INFINITY'|'SCALE'|'CONVERGENCE';
export type VisualGainSet={radial:number;depth:number;fold:number;spread:number;recurrence:number};
export type ModeVisualBinding={mode:VisualProjectionMode;modeIds:string[];executedModeIds:string[];gatedModeIds:string[];gains:VisualGainSet;detail:string;boundary:string};
const sat=(v:number)=>{const a=Math.abs(Number(v)||0);return a/(1+a)};
const signed=(v:number)=>Math.tanh(Number(v)||0);
const numeric=(rows:SourceBackedModeResult[],id:string)=>{const r=rows.find(x=>x.id===id);return typeof r?.value==='number'&&Number.isFinite(r.value)?r.value:0};
const status=(rows:SourceBackedModeResult[],ids:string[])=>({executed:ids.filter(id=>rows.some(x=>x.id===id&&x.state!=='GATED_MISSING_INPUTS')),gated:ids.filter(id=>rows.some(x=>x.id===id&&x.state==='GATED_MISSING_INPUTS'))});
const clampGain=(v:number)=>Math.max(.55,Math.min(1.65,v));
export function sourceModeVisualBinding(record:any,mode:VisualProjectionMode,base:VisualGainSet):ModeVisualBinding{
 const rows=evaluateSourceBackedModes(record),C=sat(numeric(rows,'M001')),m188=sat(numeric(rows,'M002')),forecast=signed(numeric(rows,'M004')),prune=signed(numeric(rows,'M005')),host=sat(numeric(rows,'M006')),turb=sat(numeric(rows,'M007')),compression=sat(numeric(rows,'M008')),scar=sat(numeric(rows,'M009')),phi=sat(numeric(rows,'M013'));
 let ids:string[]=['M001'],radial=base.radial,depth=base.depth,fold=base.fold,spread=base.spread,recurrence=base.recurrence,detail='Unified coherence modulates projection emphasis.';
 switch(mode){
  case'FIELD':ids=['M001','M002','M005','M007','M008','M009'];radial*=.94+.16*C;depth*=.94+.14*turb;fold*=.92+.18*sat(prune);spread*=.94+.12*(1-compression);recurrence*=.94+.16*(m188+scar)/2;detail='Field lens maps executable coherence, Mode188, prune, turbulence, compression and scar-carry outputs into bounded renderer gains.';break;
  case'MATTER':ids=['M001','M005','M008','M009'];radial*=.9+.16*(1-compression);depth*=.96+.2*compression;fold*=.92+.2*(sat(prune)+scar)/2;spread*=.92+.12*C;recurrence*=.94+.14*scar;detail='Matter lens emphasizes burden compression, prune pressure and scar carry without changing canonical state.';break;
  case'TRAVERSAL':ids=['M001','M007','M009','M011','M012'];radial*=.95+.12*C;depth*=.94+.14*turb;fold*=.96+.1*scar;spread*=.94+.18*C;recurrence*=.94+.14*scar;detail='Traversal lens binds route/guidance packet modes plus exact coherence, turbulence and scar outputs to path presentation.';break;
  case'FORECAST':ids=['M001','M004','M013'];radial*=.95+.1*C;depth*=.96+.1*phi;fold*=.92+.08*(1-phi);spread*=clampGain(1+.26*forecast+.18*phi);recurrence*=.9+.1*C;detail='Forecast lens uses exact Forecast Mode and source future-plasticity to change corridor spread and depth; it remains a model projection, not future observation.';break;
  case'RELATIVITY':ids=['M001','M007'];radial*=.96+.1*C;depth*=.94+.18*turb;fold*=.96+.12*turb;spread*=.96+.08*C;recurrence*=.96+.08*C;detail='Relativity lens keeps observer β/γ as projection controls while executable coherence and turbulence shape the source-bound field beneath that observer transform.';break;
  case'INFINITY':ids=['M001','M002','M009'];radial*=.96+.08*C;depth*=.96+.08*scar;fold*=.94+.16*m188;spread*=.94+.1*C;recurrence*=.94+.3*(m188+scar)/2;detail='Recurrence lens uses executable Mode188 and scar-carry outputs to modulate recursive persistence.';break;
  case'SCALE':ids=['M001','M006','M008'];radial*=.96+.08*C;depth*=.92+.22*host;fold*=.94+.18*compression;spread*=.9+.12*(1-compression);recurrence*=.94+.12*host;detail='Scale lens uses host-centered continuity and burden compression to modulate nested depth and fold.';break;
  case'CONVERGENCE':ids=['M001','M005','M008'];radial*=.94+.14*C;depth*=.96+.08*C;fold*=.94+.18*sat(prune);spread*=.88+.16*(1-compression);recurrence*=.94+.1*C;detail='Convergence lens maps coherence, prune pressure and burden compression into bounded closure emphasis.';break;
 }
 const s=status(rows,ids);return{mode,modeIds:ids,executedModeIds:s.executed,gatedModeIds:s.gated,gains:{radial:clampGain(radial),depth:clampGain(depth),fold:clampGain(fold),spread:clampGain(spread),recurrence:clampGain(recurrence)},detail,boundary:'This is a representational renderer mapping of already executed/source-packet mode outputs. It does not invent missing mode formulas, physical dimensions, or empirical observations.'};
}
