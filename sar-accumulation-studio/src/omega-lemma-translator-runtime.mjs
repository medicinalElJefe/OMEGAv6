import { translateLemmaState } from './lemma-state-calculus.mjs';

const state={state:'INITIALIZING',field:null,fieldRevision:0,annotated:0,counts:{},lastAt:null,previous:new Map(),timer:null,boundary:'Lemma translation classifies and carries evidence state inside the OMEGA field. It does not change measured values, create missing SAR pixels, or promote contextual/derived state into observation.'};
globalThis.OMEGA_SAR_LEMMA_TRANSLATOR=state;

function key(c){return `${c?.ix}:${c?.iy}`;}
function sourceCoverage(cell){const p=cell?.provenance||{};return Math.max(0,Number(p.directSar)||0)>0?1:0;}
function frameGap(cell){const h=cell?.evolution?.hours;return Number.isFinite(Number(h))?Math.abs(Number(h)):0;}
function revision(){return Math.max(0,Number(globalThis.OMEGA_SAR_FIELD_RUNTIME?.revision)||0);}
function annotate(force=false){
  const field=globalThis.OMEGA_SAR_CONTINUOUS_FIELD,fieldRevision=revision();
  if(!field?.cells?.length)return false;
  if(!force&&field===state.field&&fieldRevision===state.fieldRevision&&state.annotated===field.cells.length)return false;
  const nextPrevious=new Map(),counts={};let annotated=0;
  for(const cell of field.cells){
    const prior=state.previous.get(key(cell))||cell.lemmaState||null,lemma=translateLemmaState({
      exactMeasured:cell.measured===true,
      regionalMeasured:false,
      sourceCoverage:sourceCoverage(cell),
      fieldConfidence:cell.confidence,
      gammaAdmission:cell.gammaAdmission,
      contradictions:cell.contradictions?.length||0,
      contextAvailable:cell.state==='CONTEXT_PRIOR'||Number(cell.provenance?.atlas)>0||Number(cell.provenance?.realtimeSatellite)>0,
      frameGapHours:frameGap(cell),
      spatialOverlap:Math.max(0,Math.min(1,Number(cell.confidence)||0)),
      historyCarry:prior?.kernel?.scarCarry||prior?.confidence||0,
      orientation:1
    },prior);
    cell.lemmaState=lemma;nextPrevious.set(key(cell),lemma);counts[lemma.state]=(counts[lemma.state]||0)+1;annotated++;
  }
  state.previous=nextPrevious;state.field=field;state.fieldRevision=fieldRevision;state.annotated=annotated;state.counts=counts;state.lastAt=new Date().toISOString();state.state='READY';
  window.dispatchEvent(new CustomEvent('omega-lemma-field-update',{detail:snapshot()}));return true;
}
function snapshot(){return {state:state.state,fieldRevision:state.fieldRevision,annotated:state.annotated,counts:{...state.counts},lastAt:state.lastAt,boundary:state.boundary};}
function install(){state.state='WATCHING';window.addEventListener('omega-continuous-field-update',()=>queueMicrotask(()=>annotate(true)));state.timer=setInterval(()=>annotate(false),500);queueMicrotask(()=>annotate(true));}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
state.annotate=annotate;state.snapshot=snapshot;
