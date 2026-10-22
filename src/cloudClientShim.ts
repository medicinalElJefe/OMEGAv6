import { api as platformApi, OmegaApiError } from './platformAdapter';

export const api = platformApi;

export type AuthUser = { userId:string; email?:string; name?:string; scope?:string };
const sovereignUser:AuthUser = { userId:'sovereign-local-session', name:'Sovereign Local Session', scope:'local' };
export const auth = {
  isSignedIn: () => true,
  async getUser(){ return sovereignUser; },
  async signIn(){ return { user: sovereignUser, accessToken:'local-session', expiresIn:86400 }; },
  async getAccessToken(){ return 'local-session'; },
  async signOut(){ return; }
};

type Handler=(message:any)=>void;
class CloudflareWsConnection {
  connectionId:string|null = 'cloudflare-local-session';
  ready:Promise<void> = Promise.resolve();
  private handlers = new Set<Handler>();
  onMessage(fn:Handler){ this.handlers.add(fn); }
  onOpen(_fn:()=>void){ }
  onClose(_fn:()=>void){ }
  onError(_fn:(err:any)=>void){ }
  disconnect(){ this.handlers.clear(); }
}
export const ws = { connect(){ return new CloudflareWsConnection(); } };

export { OmegaApiError };
