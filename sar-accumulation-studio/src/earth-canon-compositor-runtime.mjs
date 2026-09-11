import { englishCubeSummary } from './earth-canon-cube.mjs';
import './earth-canon-analysis-runtime.mjs';

const $=s=>document.querySelector(s);
const state={state:'INITIALIZING',release:'R259',authority:null,primarySurface:null,mode188:null,summary:null,boundary:'Compositor changes presentation authority/opacity only. It never changes calibrated measurement arrays or upgrades context/reconstruction to observation.'};
globalThis.OMEGA_EARTH_CANON_COMPOSITOR=state;

function setOpacity(selector,value){for(const node of document.querySelectorAll(selector)){if(value==null)node.style.removeProperty('opacity');else node.style.setProperty('opacity',String(value),'important');}}
function installReadout(){
  const host=$('#omegaSarPrimaryControls');if(!host||$('#omegaR259CanonReadout'))return;const el=document.createElement('div');el.id='omegaR259CanonReadout';el.className='omega-r259-canon-readout';el.innerHTML='<b>CANON</b><span>WAITING FOR EVIDENCE</span>';host.append(el);
}
function updateReadout(cube){const el=$('#omegaR259CanonReadout');if(!el)return;const span=el.querySelector('span'),gate=cube?.summary?.mode188,authority=cube?.renderPlan?.authority||'UNRESOLVED';span.textContent=`${authority.replaceAll('_',' ')} · ${gate?.decision||'—'}`;el.title=englishCubeSummary(cube);}
function apply(cube){
  if(!cube?.renderPlan)return;const p=cube.renderPlan,measured=p.authority.includes('MEASURED'),exact=p.authority.startsWith('EXACT');state.authority=p.authority;state.primarySurface=p.primarySurface;state.mode188=cube.summary?.mode188||null;state.summary=englishCubeSummary(cube);state.state='READY';
  document.body.dataset.canonAuthority=p.authority.toLowerCase();document.body.dataset.canonDecision=String(cube.summary?.mode188?.decision||'unknown').toLowerCase();
  // Context is allowed to explain the image but not wash out calibrated SAR.
  setOpacity('.omega-global-sar-fabric canvas',measured?Math.min(.012,p.contextCeiling*.08):Math.min(.14,p.contextCeiling*.20));
  setOpacity('.omega-woven-motion canvas',measured?Math.min(.014,p.reconstructionWeight):Math.min(.12,p.reconstructionWeight));
  setOpacity('.omega-jrc-water-layer canvas',measured?Math.min(.10,p.waterWeight):Math.min(.28,p.waterWeight+.08));
  setOpacity('.omega-earth-awareness-layer canvas',measured?0:Math.min(.18,p.contextCeiling*.25));
  if(exact)setOpacity('#map',.001);
  updateReadout(cube);
}
function installStyle(){if($('#omegaR259CanonStyle'))return;const style=document.createElement('style');style.id='omegaR259CanonStyle';style.textContent=`
.omega-r259-canon-readout{height:28px;min-width:150px;max-width:250px;display:flex;align-items:center;gap:6px;padding:0 7px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(2,6,8,.34);overflow:hidden}.omega-r259-canon-readout b{font:800 6px Inter,Segoe UI,sans-serif;letter-spacing:.12em;color:#9bb1b8}.omega-r259-canon-readout span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:650 7px Inter,Segoe UI,sans-serif;color:#d7e2e5}body[data-canon-authority^=exact] .omega-r259-canon-readout,body[data-canon-authority^=regional] .omega-r259-canon-readout{border-color:rgba(190,228,236,.18)}body[data-canon-decision=escalate] .omega-r259-canon-readout{border-color:rgba(255,215,170,.20)}@media(max-width:930px){.omega-r259-canon-readout{min-width:92px;max-width:130px}.omega-r259-canon-readout b{display:none}}
`;document.head.append(style);}
function install(){installStyle();installReadout();window.addEventListener('omega-earth-canon-update',()=>{const cube=globalThis.OMEGA_EARTH_CANON_CUBE;if(cube)apply(cube);});const cube=globalThis.OMEGA_EARTH_CANON_CUBE;if(cube)apply(cube);state.apply=apply;}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
