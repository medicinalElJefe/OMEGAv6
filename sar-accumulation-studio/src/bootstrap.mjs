import './app.mjs';
import { CHARTED_CALIBRATION_CONTRACT, leaveOneOutAtlasCalibration, calibrationProofPacket, empiricalTurnDecision } from './calibration.mjs';
import { sarHostVariableAdapter, currentSarHostState } from './sar-host.mjs';

const $ = s => document.querySelector(s);
let latest = { samples: [], adapter: null, calibration: null, point: null, assetKey: null };

function injectStyles(){
  const style=document.createElement('style');
  style.textContent=`
  .canon-hud{border:1px solid #284754;background:#07141b;padding:14px;border-radius:12px}
  .canon-hud h2{margin:0 0 10px}.canon-grid{display:grid;grid-template-columns:repeat(6,minmax(110px,1fr));gap:8px}
  .canon-grid>div{background:#0a1c25;border:1px solid #173844;border-radius:8px;padding:9px}.canon-grid span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#87a9b5}.canon-grid b{display:block;margin-top:4px;font:600 13px ui-monospace,monospace}
  .canon-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.canon-tabs button{font-size:11px}.canon-note{font-size:11px;line-height:1.5;color:#9bb6c0}.canon-table{width:100%;border-collapse:collapse;font-size:11px}.canon-table th,.canon-table td{padding:5px;border-bottom:1px solid #17333d;text-align:left}.canon-proof{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}.canon-state{padding:3px 7px;border:1px solid #355968;border-radius:999px;font:700 11px ui-monospace,monospace}
  @media(max-width:900px){.canon-grid{grid-template-columns:repeat(2,minmax(120px,1fr))}}
  `;
  document.head.append(style);
}

function hudMarkup(){
  return `<section class="canon-hud" id="canonHud">
    <div class="section-head"><h2>Charted Canon · SAR host calibration</h2><span class="canon-state" id="canonGate">NO MEASURED STACK</span></div>
    <div class="canon-note">Fixed prior equations and empirical reference profiles are loaded from the charted OMEGA workbooks. The current SAR host earns its own validation only from measured COG samples. Prior atlas/workbook rows never count as SAR observations.</div>
    <div class="canon-grid" style="margin-top:10px">
      <div><span>Measured samples</span><b id="canonN">0</b></div><div><span>E · continuity</span><b id="canonE">—</b></div><div><span>M · scar</span><b id="canonM">—</b></div><div><span>Λ · burden</span><b id="canonLambda">—</b></div><div><span>q · contradiction</span><b id="canonQ">—</b></div><div><span>Φ · phase</span><b id="canonPhi">—</b></div>
      <div><span>Ω viability</span><b id="canonOmega">—</b></div><div><span>Prior Ω TURN ref</span><b id="canonOmegaRef">—</b></div><div><span>Model MAE</span><b id="canonMae">—</b></div><div><span>Best baseline</span><b id="canonBaseline">—</b></div><div><span>Gain vs baseline</span><b id="canonGain">—</b></div><div><span>R²</span><b id="canonR2">—</b></div>
    </div>
    <div class="canon-tabs">
      <button class="quiet" data-canon-tab="profiles">Empirical TURN profiles</button><button class="quiet" data-canon-tab="earth">Earth chart</button><button class="quiet" data-canon-tab="equations">Formal operators</button><button class="quiet" data-canon-tab="proof">Proof boundary</button>
    </div>
    <div id="canonDetail" class="canon-note"></div>
    <div class="canon-proof"><button id="exportCanonProof">Export Canon calibration proof</button><span id="canonPoint">No pixel probe bound.</span></div>
  </section>`;
}

function mount(){
  injectStyles();
  const lower=$('.lower'); if(!lower)return;
  lower.insertAdjacentHTML('afterbegin',hudMarkup());
  renderDetail('profiles');
  document.querySelectorAll('[data-canon-tab]').forEach(b=>b.addEventListener('click',()=>renderDetail(b.dataset.canonTab)));
  $('#exportCanonProof')?.addEventListener('click',exportProof);
  window.addEventListener('omega:sar-probe-stack',event=>bindProbe(event.detail));
}

function fmt(v,d=4){return Number.isFinite(Number(v))?Number(v).toFixed(d):'—'}
function pct(v){return Number.isFinite(Number(v))?`${Number(v).toFixed(2)}%`:'—'}

function bindProbe(detail={}){
  const point=detail.point||null;
  const samples=(detail.samples||[]).filter(s=>Number.isFinite(Number(s.value))).map((s,i)=>({
    ...s,
    id:s.id||String(i),
    time:s.time||s.startTime,
    lon:Number.isFinite(Number(s.lon))?Number(s.lon):Number(point?.lon),
    lat:Number.isFinite(Number(s.lat))?Number(s.lat):Number(point?.lat),
    measured:true
  })).filter(s=>s.time&&Number.isFinite(s.lon)&&Number.isFinite(s.lat));
  const adapter=sarHostVariableAdapter(samples);
  const calibration=leaveOneOutAtlasCalibration(samples);
  latest={samples,adapter,calibration,point,assetKey:detail.assetKey||null};
  const current=currentSarHostState(adapter);
  $('#canonN').textContent=String(samples.length);
  $('#canonE').textContent=fmt(current?.E_continuity_capacity);
  $('#canonM').textContent=fmt(current?.M_scar_memory);
  $('#canonLambda').textContent=fmt(current?.Lambda_burden);
  $('#canonQ').textContent=fmt(current?.q_contradiction);
  $('#canonPhi').textContent=fmt(current?.Phi_phase);
  $('#canonOmega').textContent=fmt(current?.Omega);
  $('#canonOmegaRef').textContent=current?.empiricalOmegaTurnReference||'—';
  $('#canonMae').textContent=fmt(calibration?.model?.mae);
  $('#canonBaseline').textContent=calibration?.bestBaselineName?`${calibration.bestBaselineName} · ${fmt(calibration.bestBaseline?.mae)}`:'—';
  $('#canonGain').textContent=pct(calibration?.improvementVsBestBaselinePct);
  $('#canonR2').textContent=fmt(calibration?.model?.r2);
  $('#canonGate').textContent=calibration?.state||adapter?.state||'UNRESOLVED';
  $('#canonPoint').textContent=point?`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · ${detail.assetKey||'selected raster asset'}`:'Measured stack bound';
}

function renderDetail(tab){
  const el=$('#canonDetail'); if(!el)return;
  const c=CHARTED_CALIBRATION_CONTRACT;
  if(tab==='profiles'){
    const rows=Object.entries(c.empiricalTurnProfiles).map(([id,p])=>`<tr><td>${p.label}</td><td>${p.threshold}</td><td>${p.orientation}</td><td>${p.auc}</td><td>${p.balancedAccuracy}</td><td>${p.sensitivity}</td><td>${p.specificity}</td></tr>`).join('');
    el.innerHTML=`<table class="canon-table"><thead><tr><th>Profile</th><th>Threshold</th><th>Orientation</th><th>AUC</th><th>Balanced acc.</th><th>Sensitivity</th><th>Specificity</th></tr></thead><tbody>${rows}</tbody></table><p>These are prior empirical references. They do not become SAR calibration labels until independently validated against SAR outcomes.</p>`;
  } else if(tab==='earth'){
    const e=c.earthProxyChart;
    el.innerHTML=`<b>${e.cells.toLocaleString()} charted Earth proxy cells</b> · ${e.summary.strongCells} strong · ${e.summary.usefulPlusCells} useful+ · mean thread ${e.summary.avgThreadScore} · mean relief alignment ${e.summary.avgAlignment}.<br>Depth-motion↔elevation ${e.correlations.depthMotionVsElevation}; water-bathy↔elevation ${e.correlations.waterBathyVsElevation}; orogenic-scar↔elevation ${e.correlations.orogenicScarVsElevation}.<br><b>Boundary:</b> ${e.warning}`;
  } else if(tab==='equations'){
    const eq=c.foldScale.equations;
    el.innerHTML=`<code>${c.foldScale.coreEquation}</code><br><code>${eq.memory}</code><br><code>${eq.burden}</code><br><code>${eq.omega}</code><br><code>${eq.simplex}</code><br><code>${eq.truthRank}</code><p>Formal Ω dispatch intentionally remains unresolved until the SAR host has a calibrated τ.</p>`;
  } else {
    el.innerHTML=`<b>${c.proofBoundary.rule}</b><br>${c.proofBoundary.externalProof}<br>${c.proofBoundary.sarRule}<br><b>Current host rule:</b> ≥30 measured observations, complete prediction coverage, and MAE strictly better than the best explicit baseline before a SAR host benchmark pass is emitted.`;
  }
}

function exportProof(){
  const packet=calibrationProofPacket(latest.calibration);
  packet.generatedAt=new Date().toISOString();
  packet.point=latest.point;
  packet.assetKey=latest.assetKey;
  packet.measuredSampleCount=latest.samples.length;
  packet.hostAdapter=latest.adapter;
  const blob=new Blob([JSON.stringify(packet,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`omega-sar-charted-calibration-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

mount();
