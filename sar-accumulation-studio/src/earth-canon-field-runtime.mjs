import { synthesizeCanonicalVisualField, visualFieldInvariant } from './earth-canon-field-synthesis.mjs';
import { R260_DOMAIN_REGISTRY, R260_ENGLISH_TRANSLATION } from './earth-canon-domain-registry.mjs';

let timer=null,generation=0;
const state={state:'INITIALIZING',release:'R260',field:null,updatedAt:null,error:null,domains:R260_DOMAIN_REGISTRY,english:R260_ENGLISH_TRANSLATION,boundary:'R260 applies Full Overall Canon, Unified Coherence and Mode 188 to presentation authority and detail allocation. It does not modify source measurement arrays or activate pending data adapters.'};
globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD=state;

function inputs(){
  const cube=globalThis.OMEGA_EARTH_CANON_CUBE,t=globalThis.OMEGA_DATA_NATIVE_TERRAIN,detail=globalThis.OMEGA_EARTH_CANON_R260_DETAIL,temporal=globalThis.OMEGA_SAR_R258_CALCULUS?.temporal;
  const terrainFallback=t?.state==='READY'?0.85:0;
  const terrainCoverage=Number(detail?.terrainCoverage??globalThis.OMEGA_EARTH_CANON_DETAIL?.stats?.terrainCoverage??terrainFallback)||0;
  return {cube,terrainCoverage,temporalReady:temporal?.state==='MEASURED_TEMPORAL_CALCULUS_READY',structureReady:(Number(detail?.stats?.structureSamples)||0)>0};
}
function rebuild(){const my=++generation;try{const current=inputs(),field=synthesizeCanonicalVisualField(current.cube,current);if(my!==generation)return;const invariant=field.state==='READY'?visualFieldInvariant(field):{ok:true};if(!invariant.ok)throw new Error(`R260 visual field invariant failed: ${JSON.stringify(invariant)}`);state.field=field;state.state=field.state;state.updatedAt=new Date().toISOString();state.error=null;globalThis.OMEGA_EARTH_CANON_VISUAL_FIELD_STATE=field;window.dispatchEvent(new CustomEvent('omega-earth-canon-visual-field',{detail:{state:field.state,renderState:field.renderState,channels:field.channels,gate:field.gate,detailPriority:field.detailPriority,updatedAt:state.updatedAt}}));}catch(error){if(my!==generation)return;state.state='ERROR';state.error=error.message;window.dispatchEvent(new CustomEvent('omega-earth-canon-visual-field-error',{detail:{error:error.message}}));}}
function schedule(delay=25){clearTimeout(timer);timer=setTimeout(rebuild,delay);}
function install(){for(const name of ['omega-earth-canon-update','omega-data-native-terrain','omega-r258-temporal-calculus','omega-regional-sar-measurement','omega-calibrated-sar-patch','omega-r260-detail-update'])window.addEventListener(name,()=>schedule(name.includes('terrain')?70:20));schedule(80);state.rebuild=rebuild;state.schedule=schedule;}
if(typeof window!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
