const $=s=>document.querySelector(s);
const state={state:'INITIALIZING',restored:[]};
globalThis.OMEGA_SAR_EXPERIENCE_COMPAT=state;

function ensureHiddenStatus(id,text=''){
  if(document.getElementById(id))return;
  const host=$('.top-status');if(!host)return;
  const node=document.createElement('span');node.id=id;node.className='state-pill omega-compat-status';node.textContent=text;node.hidden=true;node.setAttribute('aria-hidden','true');host.append(node);state.restored.push(id);
}
function install(){
  // R252 visually replaces the top status pills with its mode switch, but established
  // runtime modules still own these IDs as write targets. Preserve those contracts in
  // hidden nodes so visual simplification never becomes a runtime null dereference.
  ensureHiddenStatus('liveTag','LIVE READY');
  state.state='READY';
}
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(()=>requestAnimationFrame(install)),{once:true});
  else requestAnimationFrame(()=>requestAnimationFrame(install));
}
state.ensure=install;
