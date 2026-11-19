import {createServer} from 'node:http';
import {readFile,realpath,stat,mkdir,writeFile,rename,readdir} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {resolve,sep,extname,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.wasm':'application/wasm','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.glb':'model/gltf-binary','.bin':'application/octet-stream'};
function decodePath(input){
 if(typeof input!=='string'||input.length>8192)return null;
 try{const path=decodeURIComponent(new URL(input,'http://localhost').pathname);if(path.includes('\\')||path.includes('\0')||path.split('/').includes('..'))return null;return path;}catch{return null;}
}
const within=(root,path)=>path===root||path.startsWith(root+sep);
export async function startDesktopServer({root,port=0,host='127.0.0.1',stateRoot}={}){
 if(host!=='127.0.0.1')throw new Error('R881 requires loopback-only bind');
 if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid port');
 const dist=await realpath(resolve(root||join(fileURLToPath(new URL('.',import.meta.url)),'..','dist')));
 if(!(await stat(join(dist,'index.html'))).isFile())throw new Error('OMEGA7 build missing: '+dist+'/index.html. Run npm run build first.');
 let manifest={schema:'OMEGA_DESKTOP_PORTABLE_R881',sourceSha:'UNVERIFIED_LOCAL_BUILD',kind:'LOCAL_WEB_SHELL_NOT_NATIVE_HOST'};
 try{const data=JSON.parse(await readFile(join(dist,'omega-desktop-package.json'),'utf8'));if(data.schema==='OMEGA_DESKTOP_PORTABLE_R881')manifest=data;}catch{}
 const localState=resolve(stateRoot||join(dirname(dist),'omega-local-state'));
 const artifactRoot=join(localState,'artifacts');
 const sendJson=(res,status,payload)=>{const body=Buffer.from(JSON.stringify(payload));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':body.length});res.end(body);};
 const server=createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
  if(!['GET','HEAD'].includes(req.method)&&!(req.method==='POST'&&req.url==='/__omega_local/artifacts')){res.writeHead(405,{'Allow':'GET, HEAD, POST'}).end();return;}
  // Loopback binding alone does not prevent DNS-rebinding browser requests.
  // Admit only the exact loopback authority assigned to this listener.
  const expectedHost='127.0.0.1:'+server.address().port;
  if(req.headers.host!==expectedHost){res.writeHead(403).end('Invalid local authority');return;}
  const origin=req.headers.origin;
  if(origin&&origin!=='http://'+expectedHost){res.writeHead(403).end('Invalid local origin');return;}
  const pathname=decodePath(req.url);if(!pathname){res.writeHead(400).end('Invalid path');return;}
  // R887: persistent, bounded, local-only artifact bytes. Not AI or Canon execution.
  if(pathname==='/__omega_local/artifacts'&&req.method==='POST'){
   if(req.headers['content-type']?.split(';')[0].trim()!=='application/json'){sendJson(res,415,{error:'JSON_REQUIRED'});return;}
   if(Number(req.headers['content-length'])>65536){sendJson(res,413,{error:'ARTIFACT_TOO_LARGE'});return;}
   let bytes=0;const chunks=[];let oversized=false;
   for await(const chunk of req){bytes+=chunk.length;if(bytes>65536){oversized=true;break;}chunks.push(chunk);}
   if(oversized){sendJson(res,413,{error:'ARTIFACT_TOO_LARGE'});return;}
   let payload;try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{sendJson(res,400,{error:'INVALID_JSON'});return;}
   if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.content!=='string'||payload.content.length>32768||typeof payload.kind!=='string'||!/^[a-z][a-z0-9_-]{0,31}$/.test(payload.kind)){sendJson(res,422,{error:'INVALID_ARTIFACT'});return;}
   const id=randomUUID(),contentSha256=createHash('sha256').update(payload.content).digest('hex');
   const record={schema:'OMEGA_LOCAL_ARTIFACT_R887_V1',id,kind:payload.kind,content:payload.content,contentSha256,createdAt:new Date().toISOString(),canonicalMutation:false};
   try{await mkdir(artifactRoot,{recursive:true});const path=join(artifactRoot,id+'.json'),tmp=join(artifactRoot,'.'+id+'.tmp');await writeFile(tmp,JSON.stringify(record),{flag:'wx',mode:0o600});await rename(tmp,path);sendJson(res,201,{id,kind:record.kind,contentSha256,createdAt:record.createdAt});}
   catch{sendJson(res,507,{error:'LOCAL_PERSISTENCE_UNAVAILABLE'});}return;
  }
  // R891: bounded local artifact discovery, with no content disclosure in the index.
  if(pathname==='/__omega_local/artifacts'&&['GET','HEAD'].includes(req.method)){
   let names=[];try{names=await readdir(artifactRoot);}catch(e){if(e?.code!=='ENOENT'){sendJson(res,507,{error:'LOCAL_INDEX_UNAVAILABLE'});return;}}
   const ids=names.filter(name=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.json$/.test(name)).sort().reverse();
   const records=[];
   for(const name of ids.slice(0,256)){
    try{
     const item=JSON.parse(await readFile(join(artifactRoot,name),'utf8'));
     if(item.id+'.json'!==name||typeof item.content!=='string'||typeof item.contentSha256!=='string'||createHash('sha256').update(item.content).digest('hex')!==item.contentSha256)continue;
     records.push({id:item.id,kind:item.kind,contentSha256:item.contentSha256,createdAt:item.createdAt});
     if(records.length===50)break;
    }catch{}
   }
   const payload={schema:'OMEGA_LOCAL_ARTIFACT_INDEX_R891',items:records,limited:ids.length>256||records.length===50};
   if(req.method==='HEAD'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'}).end();}else sendJson(res,200,payload);
   return;
  }
  if(pathname.startsWith('/__omega_local/artifacts/')&&['GET','HEAD'].includes(req.method)){
   const id=pathname.slice('/__omega_local/artifacts/'.length);
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)){sendJson(res,400,{error:'INVALID_ARTIFACT_ID'});return;}
   try{const record=JSON.parse(await readFile(join(artifactRoot,id+'.json'),'utf8'));if(record.id!==id||createHash('sha256').update(record.content).digest('hex')!==record.contentSha256){sendJson(res,409,{error:'ARTIFACT_INTEGRITY_FAILED'});return;}if(req.method==='HEAD'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'}).end();}else sendJson(res,200,record);}
   catch{sendJson(res,404,{error:'ARTIFACT_NOT_FOUND'});}return;
  }
  if(pathname==='/__omega_local_health'){const body=Buffer.from(JSON.stringify({state:'LOCAL_HTTP_READY',host:'127.0.0.1',...manifest,remoteDeviceProven:false,cloudBackendProven:false}));res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Content-Length':body.length});if(req.method==='HEAD')res.end();else res.end(body);return;}
  if(pathname==='/api'||pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify({state:'REMOTE_BACKEND_UNAVAILABLE',detail:'Offline local shell: no native or cloud execution authority'}));return;}
  if(pathname.split('/').some(x=>x.startsWith('.')&&x!=='')||pathname.endsWith('.map')){res.writeHead(404).end();return;}
  const rel=pathname.replace(/^\/+/, '')||'index.html';let target=resolve(dist,rel);
  if(!within(dist,target)){res.writeHead(403).end();return;}
  try{const info=await stat(target);if(info.isDirectory())target=resolve(target,'index.html');target=await realpath(target);if(!within(dist,target)){res.writeHead(403).end();return;}}
  catch{if(extname(rel)||pathname.startsWith('/assets/')){res.writeHead(404).end();return;}target=join(dist,'index.html');}
  try{const body=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','Content-Length':body.length});if(req.method==='HEAD')res.end();else res.end(body);}catch{res.writeHead(404).end();}
 });
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(port,host,ok);});
 return {server,port:server.address().port,url:'http://'+host+':'+server.address().port+'/',manifest};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);const option=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
 startDesktopServer({root:option('--root',join(fileURLToPath(new URL('.',import.meta.url)),'..','dist')),port:Number(option('--port','43737'))}).then(({url})=>{process.stdout.write('OMEGA_LOCAL_READY '+url+'\n');}).catch(e=>{console.error('OMEGA_LOCAL_START_FAILED: '+e.message);process.exitCode=1;});
}
