// R257 deep exact-detail registration for the STAC-affine fallback.
// A declared EPSG:4326 affine is linear, so subdivision does not estimate new Earth
// positions: every inserted node is an exact evaluation of the already-admitted
// source affine implied by the four registered corners. This only increases render
// tessellation for the 257x257 measured source patch; it never creates SAR values.

const state={state:'READY',release:'R257',promotions:0,last:null,boundary:'Affine mesh densification changes render tessellation only. Source Sentinel-1 DN/calibrated arrays are untouched and no missing measurement or coordinate support is invented.'};
globalThis.OMEGA_SAR_R257_AFFINE_DETAIL=state;

function finiteNode(q){return q&&Number.isFinite(q.pixel)&&Number.isFinite(q.line)&&Number.isFinite(q.lon)&&Number.isFinite(q.lat);}
function densify(patch){
  const mesh=patch?.geoMesh;
  if(patch?.state!=='CALIBRATED_SENTINEL1_TARGET_PATCH'||patch?.evidence?.measured!==true)return patch;
  if(mesh?.state!=='PATCH_GEOREGISTERED_STAC_AFFINE'||!Array.isArray(mesh.nodes)||!Array.isArray(mesh.sourceWindow))return patch;
  const span=Math.max(Number(patch.width)||0,Number(patch.height)||0),oldN=Number(mesh.segments)||0,targetN=span>=240?12:span>=180?10:oldN;
  if(targetN<=oldN||targetN<2)return patch;
  const q00=mesh.nodes[0]?.[0],q10=mesh.nodes[0]?.[oldN],q01=mesh.nodes[oldN]?.[0],q11=mesh.nodes[oldN]?.[oldN];
  if(![q00,q10,q01,q11].every(finiteNode))return patch;
  // Affine-consistency gate. A non-affine mesh must never be relabelled or filled by
  // this path; nonlinear SAFE product GCP support stays with the product mesh code.
  const predicted={lon:q00.lon+(q10.lon-q00.lon)+(q01.lon-q00.lon),lat:q00.lat+(q10.lat-q00.lat)+(q01.lat-q00.lat)};
  const residual=Math.hypot(predicted.lon-q11.lon,predicted.lat-q11.lat);
  if(!Number.isFinite(residual)||residual>1e-8)return patch;
  const [x0,y0,x1,y1]=mesh.sourceWindow.map(Number),nodes=[];
  for(let gy=0;gy<=targetN;gy++){
    const ty=gy/targetN,row=[];
    for(let gx=0;gx<=targetN;gx++){
      const tx=gx/targetN;
      row.push({
        pixel:x0+(x1-x0)*tx,
        line:y0+(y1-y0)*ty,
        lon:q00.lon+(q10.lon-q00.lon)*tx+(q01.lon-q00.lon)*ty,
        lat:q00.lat+(q10.lat-q00.lat)*tx+(q01.lat-q00.lat)*ty,
        method:'STAC_AFFINE_EPSG4326'
      });
    }
    nodes.push(row);
  }
  patch.geoMesh={...mesh,segments:targetN,nodes,validNodeCount:(targetN+1)*(targetN+1),totalNodeCount:(targetN+1)*(targetN+1),detailPolicy:'R257_DEEP_AFFINE_EXACT_TESSELLATION',affineConsistencyResidualDeg:residual};
  patch.registrationDetail={...(patch.registrationDetail||{}),segments:targetN,policy:'R257_DEEP_AFFINE_EXACT_TESSELLATION',source:'DECLARED_STAC_AFFINE'};
  state.promotions++;state.last={at:new Date().toISOString(),id:patch.id,width:patch.width,height:patch.height,fromSegments:oldN,toSegments:targetN,residualDeg:residual};
  return patch;
}

function onPatch(event){const patch=event?.detail?.patch;if(patch)densify(patch);}
if(typeof window!=='undefined')window.addEventListener('omega-calibrated-sar-patch',onPatch,true);
state.densify=densify;
