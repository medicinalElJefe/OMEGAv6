import r3 from './sar-r3-worker.mjs';

const STATIC_FRESH_EXT=/\.(?:html?|mjs|js|css|json)$/i;

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/'))return r3.fetch(request,env,ctx);
    const response=await env.ASSETS.fetch(request);
    if(!response)return response;
    const headers=new Headers(response.headers);
    if(url.pathname==='/'||STATIC_FRESH_EXT.test(url.pathname)){
      headers.set('cache-control','no-store, max-age=0');
      headers.set('pragma','no-cache');
      headers.set('expires','0');
      headers.set('x-omega-sar-build','R4-SAR-SINGLE-CAMERA-4');
      if(url.pathname==='/'||/\.html?$/i.test(url.pathname))headers.set('clear-site-data','"cache"');
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
