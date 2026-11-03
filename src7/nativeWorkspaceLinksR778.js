export const R778_NATIVE_WORKSPACE_LINK_SCHEMA='OMEGA7_NATIVE_WORKSPACE_LINK_R778';
const allowed=(route,registered)=>typeof route==='string'&&Array.isArray(registered)&&registered.includes(route);
export function nativeWorkspaceHrefR778(route,registered){
 if(!allowed(route,registered))throw Error('R778 unregistered native workspace');
 return '?omega7=1&omega7route='+encodeURIComponent(route);
}
export function readNativeWorkspaceRouteR778(search,registered){
 const params=new URLSearchParams(search);
 const flags=params.getAll('omega7'),routes=params.getAll('omega7route');
 if(flags.length!==1||flags[0]!=='1'||routes.length!==1)return null;
 return allowed(routes[0],registered)?routes[0]:null;
}
