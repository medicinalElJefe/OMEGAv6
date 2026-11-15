/** R851: only optional, source-honest Earth imagery/catalog rate limits
 * may degrade the interaction sweep; all first-party application requests
 * and other resource failures remain blocking. Never fabricates success.
 */
export function classifyR313RateLimitR851({status,url,method,resourceType},previewOrigin){
 if(status!==429||method!=='GET')return 'BLOCKING';
 let target,preview;
 try{target=new URL(url);preview=new URL(previewOrigin)}catch{return 'BLOCKING'}
 if(target.origin===preview.origin&&resourceType==='image'&&target.pathname==='/api/earth/noaa/image'&&target.searchParams.has('coverage')&&target.searchParams.get('coverage')!==''&&[...target.searchParams.keys()].every(k=>k==='coverage'))return 'NOAA_SOURCE_IMAGE_DEGRADED';
 if(target.protocol==='https:'&&target.origin==='https://tile.openstreetmap.org'&&resourceType==='image'&&!target.search&&/^\/\d+\/\d+\/\d+\.png$/.test(target.pathname))return 'OSM_BASEMAP_TILE_DEGRADED';
 if(target.protocol==='https:'&&!target.port&&!target.username&&!target.password&&(target.hostname==='rainviewer.com'||target.hostname.endsWith('.rainviewer.com'))&&resourceType==='image'&&!target.search&&/^\/v2\/radar\/\d+\/256\/\d+\/\d+\/\d+\/2\/1_1\.png$/.test(target.pathname))return 'RAINVIEWER_RADAR_TILE_DEGRADED';
 // R861: the optional R278 global weather sampling grid can be rate-limited by its
 // public upstream. Admit only its exact read-only 96-coordinate request shape.
 // This is degraded source evidence, never a successful observation or UI proof.
 if(target.origin==='https://api.open-meteo.com'&&resourceType==='fetch'&&target.pathname==='/v1/forecast'){
  const q=target.searchParams;
  const keys=[...q.keys()];
  const lats=q.get('latitude')?.split(','),lons=q.get('longitude')?.split(',');
  if(keys.length===5&&keys.every(k=>['latitude','longitude','current','timezone','forecast_days'].includes(k))&&
   q.get('current')==='temperature_2m,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m'&&
   q.get('timezone')==='UTC'&&q.get('forecast_days')==='1'&&
   lats?.length===96&&lons?.length===96&&
   lats.every((v,i)=>v===String([-75,-55,-35,-15,5,25,45,65][Math.floor(i/12)]))&&
   lons.every((v,i)=>v===String([-165,-135,-105,-75,-45,-15,15,45,75,105,135,165][i%12])))
   return 'OPEN_METEO_GLOBAL_GRID_DEGRADED';
 }
 if(target.origin==='https://api.rainviewer.com'&&resourceType==='fetch'&&target.pathname==='/public/weather-maps.json'&&!target.search)return 'RAINVIEWER_CATALOG_DEGRADED';
 return 'BLOCKING';
}
