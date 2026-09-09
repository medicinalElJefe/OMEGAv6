import { extractNisarGcovAnchors } from './nisar-browser-anchors.mjs';

const state={files:new Map(),manifests:[],generation:0,last:null};
const basename=p=>String(p||'').split(/[\\/]/).pop();
const acquisitionKey=m=>String(m?.granule?.secondary_start_time||m?.granule?.start_time||m?.sources?.at?.(-1)?.granule?.start_time||'');
const supported=m=>m?.schema==='omega.sar.nisar.gcov.measurement.v1';

async function ingest(files){
  state.files.clear();state.manifests=[];
  for(const f of files)state.files.set(f.name,f);
  for(const f of files.filter(x=>x.name.toLowerCase().endsWith('.json'))){
    try{const m=JSON.parse(await f.text());if(supported(m)){m._sourceFile=f.name;state.manifests.push(m);}}catch{}
  }
  state.manifests.sort((a,b)=>acquisitionKey(a).localeCompare(acquisitionKey(b))||String(a._sourceFile).localeCompare(String(b._sourceFile)));
}

function currentManifest(){
  const slider=document.querySelector('#nisarTimeline');const index=Math.max(0,Math.min(state.manifests.length-1,Number(slider?.value)||0));
  return state.manifests[index]||null;
}

async function publish(){
  const my=++state.generation,m=currentManifest(),key=document.querySelector('#nisarProduct')?.value||'';
  if(!m||!key){window.dispatchEvent(new CustomEvent('omega-nisar-sar-anchors',{detail:{state:'NISAR_ANCHORS_EMPTY',anchors:[]}}));return;}
  const file=state.files.get(basename(m.products?.[key]||''));
  if(!file){window.dispatchEvent(new CustomEvent('omega-nisar-sar-anchors',{detail:{state:'NISAR_COMPANION_TIFF_NOT_LOADED',anchors:[],manifest:m,productKey:key}}));return;}
  try{
    const result=await extractNisarGcovAnchors(file,m,key,{cols:11,rows:11});if(my!==state.generation)return;
    state.last=result;window.dispatchEvent(new CustomEvent('omega-nisar-sar-anchors',{detail:{...result,manifest:m,productKey:key}}));
  }catch(error){if(my!==state.generation)return;window.dispatchEvent(new CustomEvent('omega-nisar-sar-anchors',{detail:{state:'NISAR_ANCHOR_EXTRACTION_FAILED',anchors:[],error:error.message,manifest:m,productKey:key}}));}
}

function attach(){
  const input=document.querySelector('#nisarFiles');if(!input||input.dataset.omegaBridge==='true')return false;input.dataset.omegaBridge='true';
  input.addEventListener('change',async e=>{await ingest([...e.target.files]);setTimeout(publish,0);});
  document.querySelector('#nisarProduct')?.addEventListener('change',()=>setTimeout(publish,0));
  document.querySelector('#nisarTimeline')?.addEventListener('input',()=>setTimeout(publish,0));
  document.querySelector('#nisarPrev')?.addEventListener('click',()=>setTimeout(publish,10));
  document.querySelector('#nisarNext')?.addEventListener('click',()=>setTimeout(publish,10));
  return true;
}

if(typeof document!=='undefined'){
  if(!attach()){
    const observer=new MutationObserver(()=>{if(attach())observer.disconnect();});observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),20000);
  }
}

globalThis.OMEGA_NISAR_BRIDGE={state,publish};
