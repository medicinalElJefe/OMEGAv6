/** R851: only optional, source-honest Earth imagery/catalog rate limits
 * may degrade the interaction sweep; all first-party application requests
 * and other resource failures remain blocking. Never fabricates success.
 */
export function classifyR313RateLimitR851({status,url,method,resourceType},previewOrigin){
 if(status!==429||method!=='GET')return 'BLOCKING';
 let target,preview;
 try{target=new URL(url);preview=new URL(previewOrigin)}catch{return 'BLOCKING'}
 if(target.origin===preview.origin&&resourceType==='image'&&target.pathname==='/api/earth/noaa/image'&&target.searchParams.has('coverage'))return 'NOAA_SOURCE_IMAGE_DEGRADED';
 if(target.hostname==='tile.openstreetmap.org'&&resourceType==='image'&&/^\/\d+\/\d+\/\d+\.png$/.test(target.pathname))return 'OSM_BASEMAP_TILE_DEGRADED';
 if((target.hostname==='rainviewer.com'||target.hostname.endsWith('.rainviewer.com'))&&resourceType==='image'&&/^\/v2\/radar\//.test(target.pathname))return 'RAINVIEWER_RADAR_TILE_DEGRADED';
 if(target.hostname==='api.rainviewer.com'&&resourceType==='fetch'&&target.pathname==='/public/weather-maps.json')return 'RAINVIEWER_CATALOG_DEGRADED';
 return 'BLOCKING';
}
