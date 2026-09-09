const map=document.querySelector('#map');
let targetKey=null;
let focusedKey=null;

function keyOf(point){return point&&Number.isFinite(point.lon)&&Number.isFinite(point.lat)?`${Number(point.lon).toFixed(6)},${Number(point.lat).toFixed(6)}`:null;}
function meshBounds(mesh){
  const pts=[];for(const row of mesh?.nodes||[])for(const n of row||[])if(Number.isFinite(n?.lon)&&Number.isFinite(n?.lat))pts.push(n);
  if(pts.length<4)return null;
  const lons=pts.map(p=>p.lon),lats=pts.map(p=>p.lat);return [Math.min(...lons),Math.min(...lats),Math.max(...lons),Math.max(...lats)];
}
function focusPatch(patch){
  const r=globalThis.OMEGA_SAR_RENDERER,bbox=meshBounds(patch?.geoMesh);if(!r||!bbox)return false;
  const k=keyOf(patch.target);if(!k||focusedKey===k)return false;
  // Fill the primary instrument with the actual georegistered SAR patch. The
  // target remains unchanged; only the authoritative camera is fitted.
  if(!r.fitBounds(bbox,{padding:1.18,minScale:900,maxScale:8192}))return false;
  if(patch.target)r.setPoint(patch.target.lon,patch.target.lat,{emit:false,redraw:true});
  focusedKey=k;globalThis.OMEGA_SAR_LOCAL_FOCUS={state:'CALIBRATED_PATCH_FIT',targetKey:k,bbox,scale:r.view.scale};
  return true;
}

map?.addEventListener('omega-map-select',event=>{const k=keyOf(event.detail);if(k&&k!==targetKey){targetKey=k;focusedKey=null;}});
window.addEventListener('omega-calibrated-sar-patch',event=>{const patch=event.detail?.patch;if(patch?.evidence?.measured===true&&patch?.inferred!==true)queueMicrotask(()=>focusPatch(patch));});

globalThis.OMEGA_SAR_PATCH_FOCUS={focusPatch,meshBounds};
