import {OMEGA_CANONICAL_ORIGIN} from './platformAdapter';

export const R183_REVISION='R183';
export const R183_SCHEMA='OMEGA_CANONICAL_API_TRANSPORT_R183';
export const R183_MIRROR_HOSTS=Object.freeze([
  'omega-living-light-etching-private-woven2.vercel.app',
  'omega-optical-cloud-woven2.vercel.app'
]);

function mirrorHost(host:string){return R183_MIRROR_HOSTS.includes(String(host||'').toLowerCase())}
function sourceUrl(input:RequestInfo|URL){
  if(typeof input==='string')return input;
  if(input instanceof URL)return input.toString();
  return input.url;
}
function relativeApiPath(value:string){return /^\/api(?:\/|$)/.test(value)}
export function canonicalApiTargetR183(value:string,host:string){
  return mirrorHost(host)&&relativeApiPath(value)?`${OMEGA_CANONICAL_ORIGIN}${value}`:value;
}

export function installCanonicalApiTransportR183(){
  if(typeof window==='undefined'||typeof window.fetch!=='function')return{schema:R183_SCHEMA,state:'NON_BROWSER',installed:false,canonicalMutation:false};
  const marker='__omegaCanonicalApiTransportR183';
  const root=window as any;
  if(root[marker])return{schema:R183_SCHEMA,state:'ALREADY_INSTALLED',installed:true,canonicalMutation:false};
  const nativeFetch=window.fetch.bind(window),host=window.location.hostname.toLowerCase();
  if(!mirrorHost(host)){root[marker]=true;return{schema:R183_SCHEMA,state:'CANONICAL_OR_NON_MIRROR',installed:false,canonicalMutation:false}}
  window.fetch=((input:RequestInfo|URL,init?:RequestInit)=>{
    const raw=sourceUrl(input),target=canonicalApiTargetR183(raw,host);
    if(target===raw)return nativeFetch(input,init);
    if(typeof input==='string'||input instanceof URL)return nativeFetch(target,init);
    const forwarded=new Request(target,input);
    return nativeFetch(forwarded,init);
  }) as typeof window.fetch;
  root[marker]=true;
  return{schema:R183_SCHEMA,state:'INSTALLED',installed:true,host,canonicalOrigin:OMEGA_CANONICAL_ORIGIN,canonicalMutation:false,truthBoundary:'R183 changes transport destination for OMEGA /api routes on approved mirror surfaces only. It does not promote capability state, forge execution receipts, bypass Hybrid proof, alter R125 admission, or redirect local static artifacts.'};
}

export const R183_CANONICAL_API_TRANSPORT_MANIFEST=Object.freeze({
  schema:R183_SCHEMA,
  revision:R183_REVISION,
  canonicalOrigin:OMEGA_CANONICAL_ORIGIN,
  mirrorHosts:R183_MIRROR_HOSTS,
  routeClass:'/api/*',
  localArtifactsRemainLocal:true,
  hybridCredentialHeadersPreserved:true,
  canonicalAdmissionAuthority:'R125',
  truthBoundary:'One runtime API authority across approved distributed UI surfaces; one CanonState; proof-gated execution remains proof-gated.'
});
