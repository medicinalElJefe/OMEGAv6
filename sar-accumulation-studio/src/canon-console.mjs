import { fetchSentinel1Cog } from './stac.mjs';
import { calibratedTemporalStack } from './sentinel1-calibration.mjs';
import { calibratedSpatialShell } from './calibrated-shell.mjs';
import { sarHostVariableAdapter } from './sar-host.mjs';
import {
  CHARTED_CALIBRATION_CONTRACT,
  leaveOneOutAtlasCalibration,
  calibrationProofPacket,
  empiricalTurnDecision
} from './calibration.mjs';
import { loadEarthGrid, nearestEarthProxyCell, earthProxyProof } from './earth-grid.mjs';
import { canonicalJson, sha256Hex, downloadJson } from './export.mjs';

const $=id=>document.getElementById(id);
const state={records:[],calibratedSamples:[],host:null,benchmark:null,shell:null,earth:null,proof:null};

function esc(value){return String(value??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(value,digits=4){const n=Number(value);return Number.isFinite(n)?n.toLocaleString(undefined,{maximumFractionDigits:digits}):'—';}
function pct(value,digits=1){const n=Number(value);return Number.isFinite(n)?`${n.toFixed(digits)}%`:'—';}
function yes(value){return value?'YES':'NO';}

function inject(){
  if($('canonConsole'))return;
  const style=document.createElement('style');
  style.textContent=`
  .canon-console{border:1px solid #304968;background:#09111d;padding:14px;border-radius:12px;margin-top:14px}.canon-console h2{margin:.1rem 0 .45rem}.canon-console h3{margin:.3rem 0;font-size:.82rem;color:#9fc7f5;text-transform:uppercase;letter-spacing:.08em}.canon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;margin:8px 0 12px}.canon-cell{background:#0d1928;border:1px solid #243a56;border-radius:8px;padding:8px}.canon-cell span{display:block;color:#8194aa;font-size:.7rem}.canon-cell b{display:block;font-size:.86rem;margin-top:2px;word-break:break-word}.canon-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.canon-status{margin:.6rem 0;padding:8px 10px;border-left:3px solid #5788c7;background:#0d1928;font-size:.78rem}.canon-boundary{font-size:.72rem;color:#a9b6c5;line-height:1.45}.canon-table{width:100%;border-collapse:collapse;font-size:.72rem}.canon-table th,.canon-table td{padding:5px;border-bottom:1px solid #203149;text-align:left}.canon-table th{color:#8fa8c3}.canon-pass{color:#8ae8b3}.canon-warn{color:#f4ce83}.canon-stop{color:#ff9b9b}.canon-source{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.68rem;word-break:break-all;color:#839bb5}
  `;
  document.head.append(style);
  const section=document.createElement('section');
  section.className='canon-console';section.id='canonConsole';
  section.innerHTML=`
    <div class="section-head"><div><h2>Charted Canon · calibrated SAR host</h2><div class="micro">Existing Dewey/Fold-Scale equations + actual Sentinel-1 calibration LUT + measured 1+6 shell + 2,664-cell Earth proxy context</div></div><div class="canon-actions"><select id="canonQuantity"><option value="sigmaNought">σ⁰</option><option value="betaNought">β⁰</option><option value="gamma">γ⁰</option></select><button id="runCanonCalibration">Run full calibration</button><button id="exportCanonProof" disabled>Export Canon proof</button></div></div>
    <div id="canonStatus" class="canon-status">Ready. Choose/load a location, then run the measured host pipeline.</div>
    <h3>Measured host state</h3><div id="canonHost" class="canon-grid"></div>
    <h3>Host benchmark</h3><div id="canonBenchmark" class="canon-grid"></div>
    <h3>Measured 1+6 shell</h3><div id="canonShell" class="canon-grid"></div>
    <h3>Existing Earth chart at this location</h3><div id="canonEarth" class="canon-grid"></div>
    <h3>Prior empirical TURN references</h3><div id="canonProfiles"></div>
    <div id="canonBoundary" class="canon-boundary"></div>
  `;
  const lower=document.querySelector('.lower')||document.querySelector('.workbench')||document.body;
  lower.prepend(section);
  $('runCanonCalibration').addEventListener('click',run);
  $('exportCanonProof').addEventListener('click',exportProof);
  renderProfiles();renderEmpty();
}

function currentPoint(){
  const lat=Number($('jumpLat')?.value),lon=Number($('jumpLon')?.value);
  if(Number.isFinite(lat)&&Number.isFinite(lon))return {lat,lon};
  const text=$('point')?.textContent||'';
  const nums=text.match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
  if(nums.length>=2&&nums.every(Number.isFinite))return {lat:nums[0],lon:nums[1]};
  const wkt=$('aoi')?.value||'';
  const m=wkt.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
  if(m)return {lon:Number(m[1]),lat:Number(m[2])};
  return null;
}

function dateStart(value){return value?`${value}T00:00:00.000Z`:null;}
function dateEnd(value){return value?`${value}T23:59:59.999Z`:null;}

function choosePolarization(records){
  const counts=new Map();
  for(const record of records)for(const key of Object.keys(record.dataAssets||{}))counts.set(key.toLowerCase(),(counts.get(key.toLowerCase())||0)+1);
  const requested=String($('polarization')?.value||'').toLowerCase().split(/[,+ ]+/).filter(Boolean);
  for(const p of requested)if(counts.has(p))return p;
  for(const p of ['vv','hh','vh','hv'])if(counts.has(p))return p;
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'vv';
}

function status(text,kind=''){const node=$('canonStatus');node.textContent=text;node.className=`canon-status ${kind}`;}
function cell(label,value,small=''){return `<div class="canon-cell"><span>${esc(label)}</span><b>${esc(value)}</b>${small?`<small>${esc(small)}</small>`:''}</div>`;}

function renderProfiles(){
  const profiles=CHARTED_CALIBRATION_CONTRACT.empiricalTurnProfiles;
  $('canonProfiles').innerHTML=`<div class="table-wrap"><table class="canon-table"><thead><tr><th>Stored model</th><th>TURN threshold</th><th>Direction</th><th>AUC</th><th>Balanced acc.</th><th>Role here</th></tr></thead><tbody>${Object.entries(profiles).map(([key,p])=>`<tr><td>${esc(p.label)}</td><td>${fmt(p.threshold,6)}</td><td>${esc(p.orientation)}</td><td>${fmt(p.auc,4)}</td><td>${fmt(p.balancedAccuracy,4)}</td><td>prior empirical reference</td></tr>`).join('')}</tbody></table></div>`;
}

function renderEmpty(){
  $('canonHost').innerHTML=cell('State','UNRESOLVED')+cell('Calibrated observations','0')+cell('Formal dispatch','UNRESOLVED τ');
  $('canonBenchmark').innerHTML=cell('State','NO HOST RUN')+cell('Minimum pass n','30')+cell('Baseline challenge','required');
  $('canonShell').innerHTML=cell('State','UNRESOLVED')+cell('Measured samples','0 / 7');
  $('canonEarth').innerHTML=cell('State','NOT LOADED')+cell('Grid','2,664 stored proxy cells');
  $('canonBoundary').innerHTML=`<b>Proof boundary.</b> Prior Canon charts define the operators and reference thresholds; they do not count as SAR observations. Formal Ω dispatch remains unresolved until a SAR-host outcome threshold τ is independently calibrated. Earth proxy cells remain contextual evidence, not DEM/SAR pixels.`;
}

function renderHost(){
  const h=state.host,latest=h?.rows?.at(-1),samples=state.calibratedSamples.filter(s=>s.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE');
  if(!latest){$('canonHost').innerHTML=cell('State',h?.state||'UNRESOLVED');return;}
  const prior=empiricalTurnDecision('omega',latest.Omega);
  $('canonHost').innerHTML=[
    cell('State',h.state),cell('Calibrated observations',samples.length),cell('Host input',`${samples[0]?.quantity||'σ⁰'} dB`),
    cell('E · continuity capacity',fmt(latest.E_continuity_capacity,5)),cell('M · scar memory',fmt(latest.M_scar_memory,5)),cell('Λ · burden',fmt(latest.Lambda_burden,5)),
    cell('q · contradiction',fmt(latest.q_contradiction,5)),cell('g · integration',fmt(latest.g_integration,5)),cell('Φ · phase',fmt(latest.Phi_phase,5)),
    cell('C · scale',fmt(latest.C_scale,3)),cell('Ω · exact viability',fmt(latest.Omega,6)),cell('Formal dispatch',latest.formalDispatch,'τ intentionally unresolved'),
    cell('Prior Ω reference',prior.state,`stored threshold ${fmt(prior.profile.threshold,6)}`),cell('Measured retention λ',fmt(h.summary?.measuredMemoryRetention,5)),cell('Median revisit',`${fmt(h.summary?.medianGapHours,2)} h`)
  ].join('');
}

function renderBenchmark(){
  const b=state.benchmark;if(!b){$('canonBenchmark').innerHTML=cell('State','UNRESOLVED');return;}
  const g=b.gate||{};
  $('canonBenchmark').innerHTML=[
    cell('State',b.state),cell('Measured n',b.n),cell('Prediction coverage',pct((b.coverage||0)*100)),
    cell('Model MAE',fmt(b.model?.mae,6)),cell('Model RMSE',fmt(b.model?.rmse,6)),cell('Model R²',fmt(b.model?.r2,6)),
    cell('Best baseline',b.bestBaselineName||'—'),cell('Baseline MAE',fmt(b.bestBaseline?.mae,6)),cell('MAE improvement',pct(b.improvementVsBestBaselinePct,2)),
    cell('n ≥ 30',yes(g.meetsChartedSampleGate)),cell('Beats baseline',yes(g.beatsBaseline)),cell('Benchmark pass',yes(g.benchmarkPass))
  ].join('');
}

function renderShell(){
  const s=state.shell;if(!s){$('canonShell').innerHTML=cell('State','UNRESOLVED');return;}
  $('canonShell').innerHTML=[
    cell('State',s.state),cell('Measured samples',`${s.actualCalibratedSamples||0} / 7`),cell('Radius',`${fmt(s.requestedRadiusMeters,1)} m`),
    cell('u₁',fmt(s.contrasts?.[0],7)),cell('u₂',fmt(s.contrasts?.[1],7)),cell('u₃',fmt(s.contrasts?.[2],7)),
    cell('λ₁',fmt(s.lambda?.[0],6)),cell('λ₂',fmt(s.lambda?.[1],6)),cell('λ₃',fmt(s.lambda?.[2],6)),cell('Dominant axis',s.dominantAxis||'—')
  ].join('');
}

function renderEarth(){
  const e=state.earth;if(!e){$('canonEarth').innerHTML=cell('State','UNRESOLVED');return;}
  $('canonEarth').innerHTML=[
    cell('Stored grid cell',`${fmt(e.latitude_deg,0)}°, ${fmt(e.longitude_deg,0)}°`),cell('Distance to grid cell',`${fmt(e.nearestGridDistanceKm,1)} km`),cell('Tier',e.thread_tier),
    cell('Topology',e.topology_zone),cell('Surface',e.real_surface_class),cell('Thread',e.relativity_thread),cell('Lens',e.new_lens_type),
    cell('Relief alignment',fmt(e.relief_alignment_score,4)),cell('Elevation proxy',`${fmt(e.real_elev_proxy_m,0)} m`),cell('Motion score',fmt(e.motion_rel_score,4)),
    cell('Water triangle',fmt(e.water_triangle_ratio,4)),cell('Scar carry',fmt(e.scar_carry_index,4)),cell('Thread score',fmt(e.thread_score,4)),
    cell('Depth-motion tension',fmt(e.depth_motion_tension,4)),cell('Water-bathy tension',fmt(e.water_bathy_tension,4)),cell('Orogenic-scar tension',fmt(e.orogenic_scar_tension,4))
  ].join('');
}

async function run(){
  const point=currentPoint();
  if(!point){status('A valid latitude/longitude is required. Click the map or enter the location first.','canon-stop');return;}
  const start=dateStart($('start')?.value),end=dateEnd($('end')?.value);
  if(!start||!end){status('Start and end dates are required for measured temporal calibration.','canon-stop');return;}
  $('runCanonCalibration').disabled=true;$('exportCanonProof').disabled=true;
  try{
    status('1/6 · Querying Sentinel-1 GRD acquisition records for the selected point…');
    const result=await fetchSentinel1Cog({start,end,intersectsWith:`POINT(${point.lon} ${point.lat})`,maxResults:Math.min(256,Number($('maxResults')?.value)||256),flightDirection:$('direction')?.value||undefined,polarization:$('polarization')?.value||undefined});
    state.records=result.records||[];
    if(!state.records.length)throw new Error('No Sentinel-1 GRD scenes matched this point/time/filter set.');
    const pol=choosePolarization(state.records),quantity=$('canonQuantity').value;
    status(`2/6 · Radiometrically calibrating ${state.records.length} candidate scenes to ${quantity} using ${pol.toUpperCase()} product LUTs…`);
    const stack=await calibratedTemporalStack(state.records,point.lon,point.lat,{polarization:pol,quantity,maxScenes:Math.min(128,state.records.length),onProgress:(i,n)=>status(`2/6 · Calibrating actual GRD samples ${i}/${n} · DN²/LUT² · ${pol.toUpperCase()} ${quantity}…`)});
    state.calibratedSamples=stack;
    const measured=stack.filter(s=>s.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE'&&Number.isFinite(s.db)).map(s=>({id:s.id,time:s.startTime,lon:point.lon,lat:point.lat,value:s.db,measured:true,quantity:`${quantity}_dB`,source:s.provenance}));
    if(!measured.length)throw new Error(`No calibrated samples resolved. First errors: ${stack.filter(s=>s.error).slice(0,3).map(s=>s.error).join(' | ')||'geolocation/calibration unresolved'}`);
    status(`3/6 · Applying the existing Fold-Scale host adapter to ${measured.length} calibrated observations…`);
    state.host=sarHostVariableAdapter(measured,{scaleRatio:1});
    state.benchmark=leaveOneOutAtlasCalibration(measured);
    const latestRecord=state.records.slice().reverse().find(r=>stack.some(s=>s.id===r.id&&s.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE'))||state.records.at(-1);
    status('4/6 · Building measured 1+6 shell from seven calibrated spatial samples…');
    state.shell=await calibratedSpatialShell(latestRecord,point.lon,point.lat,{polarization:pol,quantity,radiusMeters:60});
    status('5/6 · Resolving the exact previously charted Earth proxy cell…');
    const grid=await loadEarthGrid();state.earth=nearestEarthProxyCell(grid,point.lon,point.lat);
    status('6/6 · Sealing deterministic Canon proof packet…');
    const calibratedSummary=stack.map(s=>({id:s.id,startTime:s.startTime,state:s.state,value:s.value??null,db:s.db??null,dn:s.dn??null,lut:s.lut??null,pixel:s.pixel??null,geolocation:s.geolocation??null,processing:s.processing??null,evidence:s.evidence??null,provenance:s.provenance??null,boundary:s.boundary??null,error:s.error??null}));
    const packet={
      schema:'omega.sar.full-charted-canon.proof.v1',generatedAt:new Date().toISOString(),point,query:{start,end,polarization:pol,quantity,records:state.records.length},
      calibration:calibrationProofPacket(state.benchmark),
      hostAdapter:state.host,
      spatialShell:state.shell,
      earthProxy:earthProxyProof(state.earth),
      calibratedMeasurements:calibratedSummary,
      authority:{sourceSarMeasurements:measured.length,priorCanonRowsInjectedAsSar:0,earthProxyRowsInjectedAsSar:0,inferredRowsInjectedAsSar:0,formalTauCalibrated:false},
      boundaries:[
        'Formal Fold-Scale/Dewey equations are reused unchanged from the charted Canon.',
        'Sentinel-1 values are product-LUT radiometrically calibrated Level-1 GRD backscatter; terrain flattening/local-incidence correction is not claimed.',
        'Formal STAY/TURN/ESCALATE remains unresolved until SAR outcome labels calibrate tau.',
        'Prior TURN thresholds are comparison references only.',
        'Earth 5-degree proxy chart is contextual evidence only; it is not raw DEM/GEBCO and not SAR measurement.',
        'No footprint, browse pixel, inferred Atlas value, or animation interpolation is counted as a measured SAR observation.'
      ]
    };
    packet.deterministicDigest=await sha256Hex(canonicalJson({...packet,generatedAt:null,deterministicDigest:null}));state.proof=packet;
    renderHost();renderBenchmark();renderShell();renderEarth();$('exportCanonProof').disabled=false;
    const errors=stack.filter(s=>s.state!=='CALIBRATED_SENTINEL1_GRD_SAMPLE').length;
    status(`Complete · ${measured.length} calibrated SAR observations · ${errors} unresolved scenes · benchmark ${state.benchmark.state} · shell ${state.shell.state} · proof ${packet.deterministicDigest.slice(0,16)}…`,state.benchmark?.gate?.benchmarkPass?'canon-pass':'canon-warn');
    $('canonBoundary').innerHTML=`<b>Proof digest:</b> <span class="canon-source">${esc(packet.deterministicDigest)}</span><br><b>Earth source SHA-256:</b> <span class="canon-source">${esc(state.earth.sourceSha256)}</span><br>${esc(state.earth.boundary)}<br>σ⁰/β⁰/γ⁰ calibration is ellipsoid-referenced Level-1 calibration. Terrain flattening, local-incidence normalization, coherent SLC phase and InSAR displacement require their own evidence/processing stages.`;
  }catch(error){console.error(error);status(`Calibration stopped: ${error.message}`,'canon-stop');}
  finally{$('runCanonCalibration').disabled=false;}
}

function exportProof(){if(state.proof)downloadJson(`omega-sar-charted-canon-proof-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,state.proof);}

inject();
