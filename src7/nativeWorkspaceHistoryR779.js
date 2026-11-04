import {nativeWorkspaceHrefR778,readNativeWorkspaceRouteR778} from './nativeWorkspaceLinksR778.js';

export const R779_NATIVE_WORKSPACE_HISTORY_SCHEMA='OMEGA7_NATIVE_WORKSPACE_HISTORY_R779';
export function nativeHistoryHrefR779(route,registered){
 if(route===null)return '?omega7=1';
 return nativeWorkspaceHrefR778(route,registered);
}
export function nativeHistorySelectionR779(search,registered){
 const params=new URLSearchParams(search);
 const flags=params.getAll('omega7');
 if(flags.length!==1||flags[0]!=='1')return Object.freeze({managed:false,route:null});
 const routes=params.getAll('omega7route');
 if(routes.length===0)return Object.freeze({managed:true,route:null});
 return Object.freeze({managed:true,route:readNativeWorkspaceRouteR778(search,registered)});
}
