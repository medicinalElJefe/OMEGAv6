import { renderCog } from './raster.mjs';

const SUPPORTED_SCHEMAS = new Set([
  'omega.sar.nisar.gcov.measurement.v1',
  'omega.sar.nisar.registered-stack.v1',
  'omega.sar.nisar.gunw.measurement.v1'
]);

const LABELS = {
  gamma0_db:'γ⁰ backscatter · dB', sigma0_db:'σ⁰ backscatter · dB',
  gamma0_power:'γ⁰ backscatter · power', sigma0_power:'σ⁰ backscatter · power',
  number_of_looks:'Number of looks', mask:'Source mask', qa_valid:'QA-valid mask',
  observation_count:'Observation count', temporal_mean:'Temporal mean',
  temporal_std:'Temporal standard deviation', first_to_last_change:'First → last change',
  latest_zscore:'Latest z-score', unwrapped_phase_rad:'GUNW unwrapped phase · rad',
  coherence:'Interferometric coherence · 0–1', connected_components:'Connected components',
  ionosphere_phase_rad:'Ionospheric phase screen · rad',
  ionosphere_uncertainty_rad:'Ionospheric uncertainty · rad',
  signed_range_change_m:'Signed slant-range change · m'
};

const state={manifests:[],files:new Map(),index:0,timer:null,product:null};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const basename=p=>String(p||'').split(/[\\/]/).pop();

function schemaKind(m){
  if(m?.schema==='omega.sar.nisar.gunw.measurement.v1')return 'GUNW';
  if(m?.schema==='omega.sar.nisar.registered-stack.v1')return 'STACK';
  if(m?.schema==='omega.sar.nisar.gcov.measurement.v1')return 'GCOV';
  return 'UNKNOWN';
}

function evidenceClass(m){
  const kind=schemaKind(m);
  if(kind==='GUNW')return 'SOURCE-PRODUCT DERIVED INTERFEROMETRY';
  if(kind==='STACK')return 'DERIVED REGISTERED TEMPORAL STACK';
  if(kind==='GCOV')return 'SOURCE-PRODUCT CALIBRATED RTC BACKSCATTER';
  return 'UNRESOLVED';
}

function inject(){
 if($('nisarNativeConsole'))return;
 const style=document.createElement('style');style.textContent=`
 .nisar-native{border:1px solid #40595f;background:linear-gradient(180deg,#09191d,#071216);padding:14px;border-radius:12px;margin-top:14px;box-shadow:0 18px 55px #0006}.nisar-native h2{margin:.1rem 0 .4rem}.nisar-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.nisar-controls input[type=file]{max-width:340px}.nisar-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px;margin:10px 0}.nisar-cell{background:#0c2024;border:1px solid #204149;border-radius:8px;padding:8px;min-width:0}.nisar-cell span{display:block;font-size:.68rem;color:#86a6ac;text-transform:uppercase;letter-spacing:.05em}.nisar-cell b{display:block;font-size:.84rem;word-break:break-word;margin-top:3px}.nisar-stage{min-height:300px;display:grid;place-items:center;background:#03090b;border:1px solid #183239;border-radius:8px;overflow:auto}.nisar-stage canvas{max-width:100%;height:auto}.nisar-warn{font-size:.72rem;line-height:1.5;color:#d7bd82;margin-top:9px}.nisar-proof{font-size:.7rem;color:#9bb1b7;word-break:break-word;margin-top:9px;padding:8px;border:1px solid #17343b;border-radius:7px;background:#061015}.nisar-chip{display:inline-block;padding:3px 7px;border:1px solid #346471;border-radius:999px;font:700 9px ui-monospace,monospace;color:#b9e9f2}.nisar-source-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:10px}.nisar-source-links a{color:#9ad8e8;text-decoration:none}.nisar-source-links a:hover{text-decoration:underline}@media(max-width:650px){.nisar-controls>*{width:100%}.nisar-controls button{width:auto}.nisar-stage{min-height:240px}}
 `;document.head.append(style);
 const section=document.createElement('section');section.id='nisarNativeConsole';section.className='nisar-native';
 section.innerHTML=`<div class="section-head"><div><h2>NISAR native evidence + accumulation</h2><div class="micro">GCOV calibrated backscatter · strict registered stacks · GUNW phase/coherence · source/derived boundaries preserved</div></div><span class="nisar-chip">HDF5 → PROOF MANIFEST → TIFF</span></div>
 <div class="nisar-controls"><label>Load processor manifests + TIFFs <input id="nisarFiles" type="file" multiple accept=".json,.tif,.tiff,application/json,image/tiff"></label><label>Available layer <select id="nisarProduct"></select></label><button id="nisarPrev">◀</button><button id="nisarPlay">Play</button><button id="nisarNext">▶</button><input id="nisarTimeline" aria-label="NISAR evidence timeline" type="range" min="0" max="0" value="0"><span id="nisarFrame">0 / 0</span><button id="nisarManifest" class="quiet" disabled>Export current manifest</button></div>
 <div id="nisarStatus" class="canon-status">Load one or more OMEGA processor manifests and their referenced TIFF products. Native HDF5 processing occurs in the Python processor; the browser never fabricates HDF5 measurements.</div><div id="nisarMeta" class="nisar-grid"></div><div class="nisar-stage"><canvas id="nisarCanvas"></canvas></div><div id="nisarWarnings" class="nisar-warn"></div><div id="nisarProof" class="nisar-proof"></div><div class="nisar-source-links"><a href="https://nisar-docs.asf.alaska.edu/gcov/" target="_blank" rel="noreferrer">Official NISAR GCOV guide ↗</a><a href="https://nisar-docs.asf.alaska.edu/gunw/" target="_blank" rel="noreferrer">Official NISAR GUNW guide ↗</a></div>`;
 const lower=document.querySelector('.lower')||document.querySelector('.workbench')||document.body;lower.prepend(section);
 $('nisarFiles').addEventListener('change',loadFiles);
 $('nisarProduct').addEventListener('change',()=>{state.product=$('nisarProduct').value;renderRaster();});
 $('nisarPrev').addEventListener('click',()=>step(-1));$('nisarNext').addEventListener('click',()=>step(1));$('nisarPlay').addEventListener('click',togglePlay);
 $('nisarTimeline').addEventListener('input',()=>{state.index=Number($('nisarTimeline').value)||0;render();});
 $('nisarManifest').addEventListener('click',exportCurrentManifest);renderMeta(null);populateProducts(null);
}

function isManifest(m){return SUPPORTED_SCHEMAS.has(m?.schema)}
function acquisitionKey(m){
 const g=m?.granule||{};
 return String(g.secondary_start_time||g.start_time||m?.sources?.at?.(-1)?.granule?.start_time||'');
}

async function loadFiles(event){
 stop();state.manifests=[];state.files.clear();
 const files=[...event.target.files];for(const f of files)state.files.set(f.name,f);
 for(const f of files.filter(x=>x.name.toLowerCase().endsWith('.json'))){
   try{const m=JSON.parse(await f.text());if(isManifest(m)){m._sourceFile=f.name;state.manifests.push(m)}}catch{}
 }
 state.manifests.sort((a,b)=>acquisitionKey(a).localeCompare(acquisitionKey(b))||String(a._sourceFile).localeCompare(String(b._sourceFile)));
 state.index=0;$('nisarTimeline').max=Math.max(0,state.manifests.length-1);$('nisarTimeline').value='0';$('nisarManifest').disabled=!state.manifests.length;
 $('nisarStatus').textContent=state.manifests.length?`Loaded ${state.manifests.length} supported NISAR proof manifest(s) and ${Math.max(0,state.files.size-state.manifests.length)} companion file(s).`:'No supported NISAR proof manifests found.';
 await render();
}

function candidateFile(m,key){const p=m?.products?.[key];if(!p)return null;return state.files.get(basename(p))||null;}
function step(d){if(!state.manifests.length)return;state.index=(state.index+d+state.manifests.length)%state.manifests.length;$('nisarTimeline').value=String(state.index);render();}
function stop(){if(state.timer){clearInterval(state.timer);state.timer=null}$('nisarPlay')&&($('nisarPlay').textContent='Play')}
function togglePlay(){if(state.timer){stop();return}if(state.manifests.length<2)return;state.timer=setInterval(()=>step(1),900);$('nisarPlay').textContent='Pause'}
function cell(k,v){return `<div class="nisar-cell"><span>${esc(k)}</span><b>${esc(v)}</b></div>`}

function populateProducts(m){
 const select=$('nisarProduct');if(!select)return;
 const keys=Object.keys(m?.products||{});
 select.innerHTML=keys.length?keys.map(k=>`<option value="${esc(k)}">${esc(LABELS[k]||k)}</option>`).join(''):'<option value="">No raster products loaded</option>';
 if(keys.length){state.product=keys.includes(state.product)?state.product:keys[0];select.value=state.product}else state.product=null;
}

function renderMeta(m){
 if(!m){$('nisarMeta')&&($('nisarMeta').innerHTML=cell('State','NO NISAR EVIDENCE')+cell('Evidence class','—'));return}
 const kind=schemaKind(m),g=m.granule||{},pair=kind==='GUNW';
 const cells=[cell('Schema',m.schema),cell('Evidence class',evidenceClass(m)),cell('Product',kind),cell('Maturity',g.maturity||'—'),cell('Frequency',m.frequency||'—'),cell('Polarization / term',m.polarization||m.term||m.product_key||'—'),cell('EPSG',m.epsg||m.grid_signature?.crs||'—')];
 if(pair){cells.push(cell('Reference acquisition',g.reference_start_time||'—'),cell('Secondary acquisition',g.secondary_start_time||g.start_time||'—'),cell('QA-valid fraction',Number.isFinite(Number(m.qa_valid_fraction))?`${(Number(m.qa_valid_fraction)*100).toFixed(2)}%`:'—'),cell('Wavelength',Number.isFinite(Number(m.wavelength_m))?`${Number(m.wavelength_m).toPrecision(7)} m`:'unresolved'),cell('Signed range emitted',m.semantics?.signed_displacement_emitted?'YES':'NO'));}
 else {cells.push(cell('Acquisition',g.start_time||'stack'),cell('Source count',m.source_count||1),cell('Resampling',kind==='STACK'?(m.semantics?.resampling_performed?'YES':'NO'):'not performed in browser'));}
 $('nisarMeta').innerHTML=cells.join('');
}

function warningsFor(m){
 const out=[...(m.warnings||[])],kind=schemaKind(m);
 if(kind==='GCOV'&&m.frequency==='B')out.push('Frequency B carries a separate radiometric confidence caveat; do not blend it invisibly with Frequency A.');
 if(kind==='GCOV'&&m.granule?.maturity&&m.granule.maturity!=='PROVISIONAL')out.push('This frame is not confirmed PROVISIONAL. Processing-generation differences must not be interpreted as landscape change.');
 if(kind==='GUNW'){
   if(m.semantics?.ionosphere_applied===false)out.push('Ionospheric phase is displayed as a separate source correction layer and is not subtracted from unwrapped phase.');
   if(m.semantics?.external_corrections_applied===false)out.push('Solid-Earth/tropospheric/external corrections are not silently removed.');
   if(m.semantics?.signed_displacement_emitted)out.push('Signed output is slant-range change under the recorded phase sign convention; it is not automatically vertical or 3-D displacement.');
 }
 return [...new Set(out)];
}

async function render(){
 const n=state.manifests.length;$('nisarFrame').textContent=n?`${state.index+1} / ${n}`:'0 / 0';if(!n){renderMeta(null);populateProducts(null);return}
 const m=state.manifests[Math.min(state.index,n-1)];populateProducts(m);renderMeta(m);await renderRaster();
}

async function renderRaster(){
 const n=state.manifests.length;if(!n)return;
 const m=state.manifests[Math.min(state.index,n-1)],file=candidateFile(m,state.product),kind=schemaKind(m);
 $('nisarWarnings').innerHTML=warningsFor(m).map(w=>`<div>⚠ ${esc(w)}</div>`).join('');
 const proofParts=[`manifest ${m._sourceFile||'—'}`,`class ${evidenceClass(m)}`,`source SHA-256 ${m.source_sha256||'stack bound by source manifests'}`];
 if(m.output_sha256?.[state.product])proofParts.push(`layer SHA-256 ${m.output_sha256[state.product]}`);
 proofParts.push(m.semantics?.inferred===false?'not inferred':'derived; inspect manifest semantics');
 $('nisarProof').textContent=proofParts.join(' · ');
 const canvas=$('nisarCanvas');if(!file){const ctx=canvas.getContext('2d');canvas.width=1000;canvas.height=300;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font='16px sans-serif';ctx.fillStyle='#8aa7b0';ctx.fillText(`Companion TIFF not loaded for ${LABELS[state.product]||state.product}: ${basename(m.products?.[state.product]||'not present')}`,30,85);ctx.font='12px sans-serif';ctx.fillText('Load the TIFF referenced by this proof manifest. The public browser does not substitute browse imagery for a scientific layer.',30,115);return}
 const url=URL.createObjectURL(file);try{const info=await renderCog(url,canvas,{maxWidth:1200,maxHeight:760,gamma:.85});$('nisarStatus').textContent=`Rendered ${LABELS[state.product]||state.product} from ${file.name} · ${info.renderedWidth}×${info.renderedHeight} · ${kind}. Display stretch only; source raster values remain unchanged.`}catch(err){$('nisarStatus').textContent=`NISAR render failed: ${err.message}`}finally{URL.revokeObjectURL(url)}
}

function exportCurrentManifest(){
 const m=state.manifests[state.index];if(!m)return;
 const clean={...m};delete clean._sourceFile;
 const blob=new Blob([JSON.stringify(clean,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`omega-nisar-${schemaKind(m).toLowerCase()}-proof.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

inject();
