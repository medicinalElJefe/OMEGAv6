const $=s=>document.querySelector(s);
const state={state:'INITIALIZING',profile:'BALANCED_VIEWPORT',version:'R253.1'};
globalThis.OMEGA_SAR_BALANCED_VIEWPORT=state;

function install(){
  if($('#omegaBalancedViewportStyle')){state.state='READY';return;}
  const style=document.createElement('style');
  style.id='omegaBalancedViewportStyle';
  style.textContent=`
  :root{--omega-top:42px;--omega-edge:8px}
  body.omega-experience .topbar{height:42px!important;min-height:42px!important;padding:5px 9px!important;grid-template-columns:auto 1fr auto!important;gap:8px!important}
  body.omega-experience .omega-mark{width:28px!important;height:28px!important;border-radius:9px!important}
  body.omega-experience .identity b{font-size:10px!important;line-height:1.05!important}
  body.omega-experience .identity span{font-size:6.5px!important;max-width:340px!important}
  body.omega-experience .telemetry-strip{display:none!important}
  body.omega-experience .omega-mode-switch{gap:2px!important;padding:2px!important;border-radius:9px!important}
  body.omega-experience .omega-mode-switch button{min-width:62px!important;height:24px!important;padding:3px 7px!important;border-radius:7px!important;font-size:7px!important;letter-spacing:.06em!important}

  body.omega-experience .station{padding-top:42px!important}
  body.omega-experience .workbench{height:calc(100vh - 42px)!important;padding:4px!important}
  body.omega-experience .earth-stage{position:relative!important}
  body.omega-experience .map-wrap{height:100%!important;border-radius:11px!important}

  /* Location search is a floating tool, never a full-width layout row. */
  body.omega-experience .place-dock{position:absolute!important;z-index:55!important;top:8px!important;left:50%!important;right:auto!important;width:min(286px,28vw)!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;transform:translateX(-50%)!important;pointer-events:none!important}
  body.omega-experience .place-dock-head,body.omega-experience .place-dock-grid{display:none!important}
  body.omega-experience .place-dock .place-search{position:relative!important;top:auto!important;left:auto!important;right:auto!important;transform:none!important;width:100%!important;z-index:56!important;pointer-events:auto!important;filter:none!important}
  body.omega-experience .place-dock .place-search input{height:30px!important;font-size:9px!important;padding:5px 9px!important;background:rgba(7,10,11,.78)!important;border-color:rgba(255,255,255,.12)!important;box-shadow:0 8px 24px rgba(0,0,0,.22)!important}
  body.omega-experience .place-dock .place-search button{height:30px!important;min-width:48px!important;padding:0 9px!important;font-size:8px!important}
  body.omega-experience .place-dock .place-search-results{top:34px!important;max-height:min(320px,46vh)!important;border-radius:10px!important}

  /* Everything visible in Explore must earn its pixels. */
  body.omega-experience .omega-experience-status{left:9px!important;top:9px!important;max-width:min(470px,40vw)!important;gap:3px!important}
  body.omega-experience .omega-experience-chip{height:22px!important;padding:0 7px!important;border-radius:8px!important;gap:4px!important}
  body.omega-experience .omega-experience-chip span{font-size:5.8px!important;letter-spacing:.06em!important}
  body.omega-experience .omega-experience-chip b{font-size:7.5px!important;max-width:150px!important}
  body.omega-experience .omega-experience-chip:nth-child(n+4){display:none!important}

  body.omega-experience .omega-quickrail{left:8px!important;top:auto!important;bottom:49px!important;transform:none!important;gap:3px!important;padding:3px!important;border-radius:10px!important}
  body.omega-experience .omega-quickrail button{width:31px!important;height:31px!important;border-radius:8px!important}
  body.omega-experience .omega-quickrail button b{font-size:10px!important}
  body.omega-experience .omega-quickrail button span{display:none!important}

  body.omega-experience .transport-deck{bottom:7px!important;width:min(650px,calc(100% - 140px))!important;padding:4px 5px!important;border-radius:10px!important}
  body.omega-experience .transport-main{grid-template-columns:25px 42px 25px minmax(120px,1fr) auto!important;gap:3px!important}
  body.omega-experience .transport{height:24px!important;min-height:24px!important;padding:2px!important;font-size:8px!important}
  body.omega-experience .transport-main input{height:20px!important}
  body.omega-experience .transport-options{display:none!important}
  body.omega-experience[data-mode=analyze] .transport-options,body.omega-experience[data-mode=proof] .transport-options{display:flex!important;margin-top:3px!important;padding-top:3px!important;gap:3px!important}
  body.omega-experience[data-mode=analyze] .transport-deck,body.omega-experience[data-mode=proof] .transport-deck{width:min(780px,calc(100% - 140px))!important}

  body.omega-experience .scale-readout{right:10px!important;bottom:46px!important;font-size:7px!important;opacity:.55!important}
  body.omega-experience .earth-attribution{right:10px!important;bottom:60px!important;font-size:6.5px!important;opacity:.45!important}

  /* Drawers stay useful but never become the whole screen. */
  body.omega-experience .mission-rail{left:8px!important;top:50px!important;bottom:8px!important;width:min(286px,calc(100vw - 24px))!important;padding:9px!important;border-radius:12px!important}
  body.omega-experience .evidence-dock{right:8px!important;top:50px!important;bottom:8px!important;width:min(332px,calc(100vw - 24px))!important}
  body.omega-experience .analysis-deck{bottom:8px!important;width:min(960px,calc(100vw - 24px))!important;max-height:min(44vh,440px)!important;padding:7px!important;gap:6px!important;border-radius:12px!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}
  body.omega-experience .analysis-deck>.canon-console,body.omega-experience .analysis-deck>.query-drawer{grid-column:1/-1!important}
  body.omega-experience .omega-drawer-scrim{inset:42px 0 0!important;background:rgba(0,0,0,.10)!important;backdrop-filter:none!important}
  body.omega-experience .evidence-dock>.panel{margin-bottom:6px!important;border-radius:11px!important}
  body.omega-experience .pixel-stage{height:min(31vh,270px)!important}
  body.omega-experience .browse-stage{height:min(22vh,210px)!important}
  body.omega-experience .panel-head{padding:8px 9px!important}
  body.omega-experience .panel-head h2{font-size:12px!important}
  body.omega-experience .raster-stats,body.omega-experience .micro{font-size:8px!important;line-height:1.35!important}

  body.omega-experience[data-mode=proof] #omegaFieldHud,body.omega-experience[data-mode=proof] #omegaEarthAwarenessHud,body.omega-experience[data-mode=proof] #omegaTemporalSyncHud{transform:scale(.68)!important;max-height:34vh!important;overflow:auto!important;opacity:.76!important}

  @media(max-height:820px){
    :root{--omega-top:38px}
    body.omega-experience .topbar{height:38px!important;min-height:38px!important;padding:4px 8px!important}
    body.omega-experience .station{padding-top:38px!important}
    body.omega-experience .workbench{height:calc(100vh - 38px)!important}
    body.omega-experience .identity span{display:none!important}
    body.omega-experience .mission-rail,body.omega-experience .evidence-dock{top:44px!important}
    body.omega-experience .omega-drawer-scrim{inset:38px 0 0!important}
    body.omega-experience .pixel-stage{height:min(28vh,220px)!important}
  }
  @media(max-width:1050px){
    body.omega-experience .place-dock{width:min(250px,32vw)!important}
    body.omega-experience .omega-experience-status{max-width:36vw!important}
    body.omega-experience .omega-experience-chip:nth-child(n+3){display:none!important}
    body.omega-experience .analysis-deck{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
  @media(max-width:760px){
    body.omega-experience .topbar{height:40px!important;min-height:40px!important}
    body.omega-experience .station{padding-top:40px!important}
    body.omega-experience .workbench{height:calc(100vh - 40px)!important;padding:2px!important}
    body.omega-experience .place-dock{top:5px!important;width:min(230px,58vw)!important}
    body.omega-experience .omega-experience-status{display:none!important}
    body.omega-experience .omega-quickrail{left:5px!important;bottom:42px!important;flex-direction:row!important}
    body.omega-experience .transport-deck{left:5px!important;right:5px!important;bottom:5px!important;width:auto!important;transform:none!important}
    body.omega-experience .mission-rail,body.omega-experience .evidence-dock{top:45px!important;bottom:5px!important;width:min(300px,calc(100vw - 14px))!important}
    body.omega-experience .analysis-deck{width:calc(100vw - 10px)!important;max-height:46vh!important;grid-template-columns:1fr!important}
  }
  `;
  document.head.append(style);
  state.state='READY';
  state.viewport={width:innerWidth,height:innerHeight};
  state.searchLayout='FLOATING_OVER_EARTH_NO_FLOW_ROW';
  window.dispatchEvent(new CustomEvent('omega-balanced-viewport-ready',{detail:{...state}}));
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});
  else requestAnimationFrame(install);
}
