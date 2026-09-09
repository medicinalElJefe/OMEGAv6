import './sentinel-console.mjs';

const TIFF_CACHE = new Map();
let geotiffModulePromise = null;

async function geotiffModule() {
  if (!geotiffModulePromise) geotiffModulePromise = import('../vendor/geotiff.bundle.mjs');
  return geotiffModulePromise;
}

export function rasterTransportUrl(url, origin = globalThis.location?.origin || null) {
  if (!url) return null;
  if (!origin) return url;
  return `${origin.replace(/\/$/,'')}/api/raster?url=${encodeURIComponent(url)}`;
}

async function openTiff(url) {
  if (!url) throw new Error('No GeoTIFF URL supplied');
  const transport = rasterTransportUrl(url);
  const cacheKey = `${url}|${transport}`;
  if (!TIFF_CACHE.has(cacheKey)) {
    TIFF_CACHE.set(cacheKey, (async () => {
      const mod = await geotiffModule();
      const tiff = await mod.fromUrl(transport, { cacheSize: 32 * 1024 * 1024, blockSize: 65536 });
      const image = await tiff.getImage(0);
      return { tiff, image };
    })());
  }
  return TIFF_CACHE.get(cacheKey);
}

export function percentile(sorted, p) {
  if (!sorted.length) return null;
  const i = Math.max(0, Math.min(sorted.length - 1, (sorted.length - 1) * p));
  const lo = Math.floor(i), hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export function rasterStats(values, nodata = 0) {
  const sample = [];
  let sum = 0, min = Infinity, max = -Infinity, count = 0;
  const stride = Math.max(1, Math.floor(values.length / 250000));
  for (let i = 0; i < values.length; i += stride) {
    const v = Number(values[i]);
    if (!Number.isFinite(v) || v === nodata) continue;
    count++; sum += v; min = Math.min(min, v); max = Math.max(max, v); sample.push(v);
  }
  sample.sort((a,b) => a-b);
  return { sampledCount: count, min: count ? min : null, max: count ? max : null, mean: count ? sum / count : null, p02: percentile(sample, .02), p50: percentile(sample, .50), p98: percentile(sample, .98) };
}

export function stretchByte(v, low, high, gamma = 0.72) {
  if (!Number.isFinite(v) || !Number.isFinite(low) || !Number.isFinite(high) || high <= low) return 0;
  const t = Math.max(0, Math.min(1, (v - low) / (high - low)));
  return Math.round(255 * Math.pow(t, gamma));
}

function optionalGeoMetadata(image) {
  let bbox = null, resolution = null, geoKeys = {}, affine = false;
  try { bbox = image.getBoundingBox?.() || null; affine = Array.isArray(bbox) && bbox.length === 4; } catch {}
  try { resolution = image.getResolution?.() || null; } catch {}
  try { geoKeys = image.getGeoKeys?.() || {}; } catch {}
  return {
    bbox,
    resolution,
    geoKeys,
    affine,
    spatialInterpretation: affine
      ? 'GeoTIFF affine transform available.'
      : 'Raster decoded successfully, but this product does not expose a simple affine GeoTIFF transform. The displayed tile contains actual source pixels; coordinate-to-pixel sampling remains unproved until product geolocation/GCP mapping is bound.'
  };
}

export function boundedNativeWindow(sourceWidth, sourceHeight, maxSide = 1024) {
  const side = Math.max(256, Math.min(2048, Math.round(maxSide)));
  if (sourceWidth <= side && sourceHeight <= side) return [0, 0, sourceWidth, sourceHeight];
  const windowWidth = Math.min(sourceWidth, side);
  const windowHeight = Math.min(sourceHeight, side);
  const x0 = Math.max(0, Math.floor((sourceWidth - windowWidth) / 2));
  const y0 = Math.max(0, Math.floor((sourceHeight - windowHeight) / 2));
  return [x0, y0, x0 + windowWidth, y0 + windowHeight];
}

function drawRaster(canvas, raster, width, height, nodata, low, high, gamma) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < raster.length; i++) {
    const v = Number(raster[i]);
    const missing = !Number.isFinite(v) || v === nodata;
    const byte = missing ? 0 : stretchByte(v, low, high, gamma);
    const j = i * 4;
    imageData.data[j] = byte;
    imageData.data[j + 1] = Math.min(255, Math.round(byte * 1.03));
    imageData.data[j + 2] = Math.min(255, Math.round(byte * 1.08));
    imageData.data[j + 3] = missing ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function renderCog(url, canvas, { maxSide = 1024, gamma = 0.72, onStage } = {}) {
  onStage?.('OPEN_TIFF');
  const { image } = await openTiff(url);
  const sourceWidth = image.getWidth();
  const sourceHeight = image.getHeight();
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth < 1 || sourceHeight < 1) throw new Error('GeoTIFF reports invalid raster dimensions.');

  const previewWindow = boundedNativeWindow(sourceWidth, sourceHeight, maxSide);
  const width = previewWindow[2] - previewWindow[0];
  const height = previewWindow[3] - previewWindow[1];
  onStage?.('READ_NATIVE_WINDOW');
  const raster = await image.readRasters({ window: previewWindow, samples: [0], interleave: true });
  const nodataText = image.getGDALNoData?.();
  const nodata = nodataText == null ? 0 : Number(nodataText);
  onStage?.('COMPUTE_DISPLAY_STATS');
  const stats = rasterStats(raster, Number.isFinite(nodata) ? nodata : 0);
  const low = stats.p02 ?? stats.min ?? 0;
  const high = stats.p98 ?? stats.max ?? 1;
  onStage?.('PAINT_NATIVE_PIXELS');
  drawRaster(canvas, raster, width, height, Number.isFinite(nodata) ? nodata : 0, low, high, gamma);

  const geo = optionalGeoMetadata(image);
  const fullScene = previewWindow[0] === 0 && previewWindow[1] === 0 && previewWindow[2] === sourceWidth && previewWindow[3] === sourceHeight;
  onStage?.('READY');
  return {
    baseWidth: sourceWidth,
    baseHeight: sourceHeight,
    sourceWidth,
    sourceHeight,
    renderedWidth: width,
    renderedHeight: height,
    imageIndex: 0,
    overview: false,
    previewWindow,
    renderCoverage: fullScene ? 'FULL_SCENE_BASE_IMAGE' : 'BOUNDED_NATIVE_CENTER_TILE',
    bbox: geo.bbox,
    resolution: geo.resolution,
    geoKeys: geo.geoKeys,
    affine: geo.affine,
    spatialInterpretation: geo.spatialInterpretation,
    nodata: Number.isFinite(nodata) ? nodata : 0,
    stats,
    sourceUrl: url,
    transportUrl: rasterTransportUrl(url),
    displayTransform: { type: 'percentile-linear-plus-gamma', low, high, gamma, scientificCalibrationClaimed: false },
    pixelSemantics: 'Actual source measurement pixels from the selected GeoTIFF window. No synthesized SAR observation is introduced.'
  };
}

function affineBoundingBox(image) {
  try {
    const bbox = image.getBoundingBox();
    if (Array.isArray(bbox) && bbox.length === 4 && bbox.every(Number.isFinite)) return bbox;
  } catch {}
  throw new Error('Coordinate-to-pixel sampling requires a proven affine transform or product GCP/geolocation-grid mapping; this COG exposes neither through the current reader.');
}

export async function sampleCogAtPoint(url, lon, lat, { epsg = 4326 } = {}) {
  if (Number(epsg) !== 4326) throw new Error(`Point sampling currently requires EPSG:4326 COGs; source declares EPSG:${epsg}`);
  const { image } = await openTiff(url);
  const bbox = affineBoundingBox(image);
  const [minX,minY,maxX,maxY] = bbox;
  if (lon < minX || lon > maxX || lat < minY || lat > maxY) return { inside: false, value: null, bbox };
  const width = image.getWidth(), height = image.getHeight();
  const x = Math.max(0, Math.min(width - 1, Math.floor((lon - minX) / (maxX - minX) * width)));
  const y = Math.max(0, Math.min(height - 1, Math.floor((maxY - lat) / (maxY - minY) * height)));
  const values = await image.readRasters({ window: [x,y,x+1,y+1], samples: [0], interleave: true });
  const value = Number(values[0]);
  const nodataText = image.getGDALNoData?.();
  const nodata = nodataText == null ? 0 : Number(nodataText);
  return { inside: true, value: Number.isFinite(value) && value !== nodata ? value : null, x, y, bbox, nodata };
}

export async function sampleCogNeighborhood(url, lon, lat, { epsg = 4326, radiusPixels = 2 } = {}) {
  if (Number(epsg) !== 4326) throw new Error(`Neighborhood sampling currently requires EPSG:4326 COGs; source declares EPSG:${epsg}`);
  const { image } = await openTiff(url);
  const [minX,minY,maxX,maxY] = affineBoundingBox(image);
  if (lon < minX || lon > maxX || lat < minY || lat > maxY) return [];
  const width=image.getWidth(), height=image.getHeight();
  const cx=Math.max(0,Math.min(width-1,Math.floor((lon-minX)/(maxX-minX)*width)));
  const cy=Math.max(0,Math.min(height-1,Math.floor((maxY-lat)/(maxY-minY)*height)));
  const r=Math.max(1,Math.min(8,Math.round(radiusPixels)));
  const x0=Math.max(0,cx-r),y0=Math.max(0,cy-r),x1=Math.min(width,cx+r+1),y1=Math.min(height,cy+r+1);
  const values=await image.readRasters({window:[x0,y0,x1,y1],samples:[0],interleave:true});
  const nodataText=image.getGDALNoData?.(),nodata=nodataText==null?0:Number(nodataText);
  const out=[];let k=0;
  for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++,k++){
    const value=Number(values[k]);if(!Number.isFinite(value)||value===nodata)continue;
    const sampleLon=minX+((px+.5)/width)*(maxX-minX);
    const sampleLat=maxY-((py+.5)/height)*(maxY-minY);
    out.push({lon:sampleLon,lat:sampleLat,value,pixel:[px,py],measured:true});
  }
  return out;
}

export function dataAssetChoices(record) {
  return Object.values(record?.dataAssets || {}).filter(a => a?.href);
}

export async function probeStack(records, lon, lat, assetKey, { maxScenes = 96, onProgress } = {}) {
  const candidates = records.filter(r => r.dataAssets && (r.dataAssets[assetKey] || Object.values(r.dataAssets)[0])).slice(-maxScenes);
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const r = candidates[i], asset = r.dataAssets[assetKey] || Object.values(r.dataAssets)[0];
    try {
      const sample = await sampleCogAtPoint(asset.href, lon, lat, { epsg: r.projection?.epsg || 4326 });
      if (sample.inside) out.push({ id:r.id, startTime:r.startTime, platform:r.platform, assetKey:asset.key, value:sample.value, pixel:[sample.x,sample.y] });
    } catch (error) { out.push({ id:r.id, startTime:r.startTime, platform:r.platform, assetKey:asset.key, value:null, error:error.message }); }
    onProgress?.(i + 1, candidates.length);
  }
  return out;
}

export function clearRasterCache() { TIFF_CACHE.clear(); }
