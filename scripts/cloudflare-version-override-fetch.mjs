const candidateVersion=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const workerName=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
const canonicalBase=String(process.env.OMEGA_PUBLIC_URL||'').trim().replace(/\/$/,'');

if(candidateVersion&&canonicalBase){
  const nativeFetch=globalThis.fetch.bind(globalThis);
  const canonicalOrigin=new URL(canonicalBase).origin;
  globalThis.fetch=(input,init={})=>{
    const rawUrl=typeof input==='string'||input instanceof URL?String(input):String(input?.url||'');
    let targetOrigin='';
    try{targetOrigin=new URL(rawUrl,canonicalBase).origin}catch{}
    if(targetOrigin!==canonicalOrigin)return nativeFetch(input,init);
    const headers=new Headers(init?.headers||(typeof input==='object'&&input?.headers?input.headers:undefined));
    headers.set('Cloudflare-Workers-Version-Overrides',`${workerName}="${candidateVersion}"`);
    return nativeFetch(input,{...init,headers});
  };
}
