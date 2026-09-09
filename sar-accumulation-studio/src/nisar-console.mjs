import { renderCog } from './raster.mjs';

const state={manifests:[],files:new Map(),index:0,timer:null,product:'gamma0_db'};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const basename=p=>String(p||'').split(/[\\/]/).pop();

function inject(){
 if($('nisarNativeConsole'))return;
 const style=document.createElement('style');style.textContent=`
 .nisar-native{border:1px solid #40595f;background:#081619;padding:14px;border-radius:12px;margin-top:14px}.nisar-native h2{margin:.1rem 0 .4rem}.nisar-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.nisar-controls input[type=file]{max-width:320px}.nisar-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px;margin:10px 0}.nisar-cell{background:#0c2024;border:1px solid #204149;border-radius:8px;padding:8px}.nisar-cell span{display:block;font-size:.7rem;color:#86a6ac}.nisar-cell b{font-size:.84rem;word-break:break-word}.nisar-stage{min-height:260px;display:grid;place-items:center;background:#03090b;border:1px solid #183239;border-radius:8px;overflow:auto}.nisar-stage canvas{max-width:100%;height:auto}.nisar-warn{font-size:.72rem;line-height:1.4;color:#d7bd82}.nisar-proof{font-size:.7rem;color:#9bb1b7;word-break:break-word}
 `;document.head.append(style);
 const section=document.createElement('section');section.id='nisarNativeConsole';section.className='nisar-native';
 section.innerHTML=`<div class="section-head"><div><h2>NISAR native accumulation</h2><div class="micro">Processed HDF5 GCOV evidence · exact grid registration · measured/derived separation</div></div></div>
 <div class="nisar-controls"><label>Load manifests + TIFFs <input id="nisarFiles" type="file" multiple accept=".json,.tif,.tiff,application/json,image/tiff"></label><label>Layer <select id="nisarProduct"><option value="gamma0_db">γ⁰ dB</option><option value="sigma0_db">σ⁰ dB</option><option value="gamma0_power">γ⁰ power</option><option value="sigma0_power">σ⁰ power</option><option value="observation_count">Observation count</option><option value="temporal_mean">Temporal mean</option><option value="temporal_std">Temporal std</option><option value="first_to_last_change">First→last change</option><option value="latest_zscore">Latest z-score</option></select></label><button id="nisarPrev">◀</button><button id="nisarPlay">Play</button><button id="nisarNext">▶</button><input id="nisarTimeline" type="range" min="0" max="0" value="0"><span id="nisarFrame">0 / 0</span></div>
 <div id="nisarStatus" class="canon-status">Load one or more processor manifests and their referenced TIFF products.</div><div id="nisarMeta" class="nisar-grid"></div><div class="nisar-stage"><canvas id="nisarCanvas"></canvas></div><div id="nisarWarnings" class="nisar-warn"></div><div id="nisarProof" class="nisar-proof"></div>`;
 const lower=document.querySelector('.lower')||document.querySelector('.workbench')||document.body;lower.prepend(section);
 $('nisarFiles').addEventListener('change',loadFiles);$('nisarProduct').addEventListener('change',()=>{state.product=$('nisarProduct').value;render();});$('nisarPrev').addEventListener('click',()=>step(-1));$('nisarNext').addEventListener('click',()=>step(1));$('nisarPlay').addEventListener('click',togglePlay);$('nisarTimeline').addEventListener('input',()=>{state.index=Number($('nisarTimeline').value)||0;render();});renderMeta(null);
}

function isManifest(m){return m?.schema==='omega.sar.nisar.gcov.measurement.v1'||m?.schema==='omega.sar.nisar.registered-stack.v1'}
function acquisitionKey(m){return String(m?.granule?.start_time||m?.sources?.[0]?.granule?.start_time||'')}
async function loadFiles(event){
 stop();state.manifests=[];state.files.clear();
 const files=[...event.target.files];for(const f of files)state.files.set(f.name,f);
 for(const f of files.filter(x=>x.name.toLowerCase().endsWith('.json'))){try{const m=JSON.parse(await f.text());if(isManifest(m)){m._sourceFile=f.name;state.manifests.push(m)}}catch{}}
 state.manifests.sort((a,b)=>acquisitionKey(a).localeCompare(acquisitionKey(b)));state.index=0;$('nisarTimeline').max=Math.max(0,state.manifests.length-1);$('nisarTimeline').value='0';
 $('nisarStatus').textContent=state.manifests.length?`Loaded ${state.manifests.length} verified-schema NISAR manifest(s); ${state.files.size-state.manifests.length} companion file(s) available.`:'No supported NISAR processor manifests found.';await render();
}

function candidateFile(m,key){const p=m?.products?.[key];if(!p)return null;return state.files.get(basename(p))||null;}
function step(d){if(!state.manifests.length)return;state.index=(state.index+d+state.manifests.length)%state.manifests.length;$('nisarTimeline').value=String(state.index);render();}
function stop(){if(state.timer){clearInterval(state.timer);state.timer=null}$('nisarPlay')&&($('nisarPlay').textContent='Play')}
function togglePlay(){if(state.timer){stop();return}if(state.manifests.length<2)return;state.timer=setInterval(()=>step(1),800);$('nisarPlay').textContent='Pause'}
function cell(k,v){return `<div class="nisar-cell"><span>${esc(k)}</span><b>${esc(v)}</b></div>`}
function renderMeta(m){
 if(!m){$('nisarMeta')&&($('nisarMeta').innerHTML=cell('State','NO NISAR EVIDENCE')+cell('Observation class','—'));return}
 const isStack=m.schema.includes('registered-stack');const g=m.granule||{};
 $('nisarMeta').innerHTML=[cell('Schema',m.schema),cell('Class',isStack?'DERIVED REGISTERED STACK':'MEASURED SOURCE-DERIVED GCOV'),cell('Acquisition',g.start_time||'stack'),cell('CRID',g.crid||'—'),cell('Maturity',g.maturity||'—'),cell('Frequency',m.frequency||'—'),cell('Term',m.term||m.product_key||'—'),cell('EPSG',m.epsg||m.grid_signature?.crs||'—'),cell('Source count',m.source_count||1),cell('Resampling',isStack?(m.semantics?.resampling_performed?'YES':'NO'):'none in browser')].join('');
}

async function render(){
 const n=state.manifests.length;$('nisarFrame').textContent=n?`${state.index+1} / ${n}`:'0 / 0';if(!n){renderMeta(null);return}
 const m=state.manifests[Math.min(state.index,n-1)];renderMeta(m);const file=candidateFile(m,state.product);
 const warnings=[...(m.warnings||[])];if(m.frequency==='B')warnings.push('Frequency B remains lower-confidence radiometrically than main-band Frequency A in current PROVISIONAL products.');if(m.granule?.maturity&&m.granule.maturity!=='PROVISIONAL')warnings.push('This frame is not confirmed PROVISIONAL. Do not interpret BETA/PROVISIONAL processing differences as landscape change.');
 $('nisarWarnings').innerHTML=warnings.map(w=>`<div>⚠ ${esc(w)}</div>`).join('');
 $('nisarProof').textContent=`Manifest ${m._sourceFile||'—'} · source SHA-256 ${m.source_sha256||'stack-bound in manifest'} · ${m.semantics?.inferred===false?'NOT INFERRED':'derived stack, see manifest semantics'}`;
 const canvas=$('nisarCanvas');if(!file){const ctx=canvas.getContext('2d');canvas.width=900;canvas.height=260;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font='16px sans-serif';ctx.fillText(`Companion TIFF not loaded for ${state.product}: ${basename(m.products?.[state.product]||'not present')}`,30,80);return}
 const url=URL.createObjectURL(file);try{const info=await renderCog(url,canvas,{maxWidth:1100,maxHeight:720,gamma:.85});$('nisarStatus').textContent=`Rendered ${state.product} from ${file.name} · ${info.renderedWidth}×${info.renderedHeight}. Display stretch only; scientific values remain in the source raster.`}catch(err){$('nisarStatus').textContent=`NISAR render failed: ${err.message}`}finally{URL.revokeObjectURL(url)}
}

inject();
