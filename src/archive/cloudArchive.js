// Private byte archive. CanonState and donor execution are deliberately uninvolved.
const PREFIX='/api/archive';
export const CHUNK_BYTES=8*1024*1024;
const hex=/^[a-f0-9]{64}$/;
const common={'cache-control':'private, no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow','referrer-policy':'no-referrer'};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{...common,'content-type':'application/json',...headers}});
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',value))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function credential(request){const auth=request.headers.get('authorization');if(auth)return auth.replace(/^Bearer /i,'');return (request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-omega_archive='))?.slice(21)||''}
async function authorized(request,env){const value=credential(request);return value.length>=32&&hex.test(env.OMEGA_ARCHIVE_TOKEN_SHA256||'')&&(await digest(new TextEncoder().encode(value)))===env.OMEGA_ARCHIVE_TOKEN_SHA256}
const cookie=(token,age)=>`__Host-omega_archive=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const recordKey=id=>`records/${id}.json`;
const chunkKey=id=>`chunks/${id}`;
async function readRecord(bucket,id){const obj=await bucket.get(recordKey(id));return obj?obj.json():null}
function safeRecord(value,id){
 if(!value||value.schema!=='OMEGA_PRIVATE_ARCHIVE_V1'||value.id!==id||!hex.test(value.sha256)||typeof value.name!=='string'||!value.name||value.name.length>255||/[\x00-\x1f]/.test(value.name)||typeof value.path!=='string'||value.path.length>1024||!Number.isSafeInteger(value.size)||value.size<0||!Array.isArray(value.chunks)||value.chunks.length>10000)throw Error('Invalid archive record');
 let size=0;for(const c of value.chunks){if(!c||!hex.test(c.sha256)||!Number.isSafeInteger(c.size)||c.size<1||c.size>CHUNK_BYTES)throw Error('Invalid chunk');size+=c.size}if(size!==value.size)throw Error('Chunk sizes do not match original file');
 return {schema:value.schema,id,name:value.name,path:value.path,size:value.size,sha256:value.sha256,mime:String(value.mime||'application/octet-stream').slice(0,200),source:{provider:String(value.source?.provider||'user-import').slice(0,100),libraryFileId:String(value.source?.libraryFileId||'').slice(0,200),fileId:String(value.source?.fileId||'').slice(0,200),versionId:String(value.source?.versionId||'').slice(0,200)},chunks:value.chunks.map(c=>({sha256:c.sha256,size:c.size})),archivedAt:new Date().toISOString(),integrity:'CHUNK_SHA256_VERIFIED',fullReadback:'REQUIRES_CLIENT_ROUNDTRIP_PROOF'};
}
function rangeFor(header,size){if(!header)return {start:0,end:size-1,partial:false};const match=/^bytes=(\d*)-(\d*)$/.exec(header);if(!match||(!match[1]&&!match[2])||!size)return null;let start,end;if(!match[1]){const n=Number(match[2]);if(!n)return null;start=Math.max(0,size-n);end=size-1}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1}return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start<=end&&start<size?{start,end,partial:true}:null}
export async function cloudArchive(request,env){
 const url=new URL(request.url),path=url.pathname;if(path!==PREFIX&&!path.startsWith(PREFIX+'/'))return null;
 const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({ok:false,code:'ARCHIVE_ORIGIN_DENIED'},403);
 if(path===PREFIX+'/login'&&request.method==='POST'){
  if(Number(request.headers.get('content-length')||0)>1024)return json({ok:false},413);
  const b=await request.json().catch(()=>({}));const token=String(b.token||'');const authRequest=new Request(request.url,{headers:{authorization:`Bearer ${token}`}});
  if(!/^[A-Za-z0-9_-]{32,128}$/.test(token)||!await authorized(authRequest,env))return json({ok:false,code:'ARCHIVE_AUTH_REQUIRED'},401);
  return json({ok:true},200,{'set-cookie':cookie(token,3600*12)});
 }
 if(!await authorized(request,env))return json({ok:false,code:'ARCHIVE_AUTH_REQUIRED'},401);
 if(path===PREFIX+'/logout'&&request.method==='POST')return json({ok:true},200,{'set-cookie':cookie('',0)});
 const primary=env.OMEGA_ARCHIVE,backup=env.OMEGA_ARCHIVE_BACKUP;const bucket=url.searchParams.get('replica')==='backup'?backup:primary;if(!primary?.put||!backup?.put)return json({ok:false,code:env.OMEGA_ARCHIVE_STATE==='ACCOUNT_ACTIVATION_REQUIRED'?'ARCHIVE_ACCOUNT_ACTIVATION_REQUIRED':'ARCHIVE_STORAGE_NOT_BOUND'},503);
 try{
 if(path===PREFIX+'/status'&&request.method==='GET')return json({ok:true,schema:'OMEGA_PRIVATE_ARCHIVE_V1',storage:'R2',replicas:2,private:true,chunkBytes:CHUNK_BYTES,canonicalMutation:false});
 if(path===PREFIX+'/records'&&request.method==='GET'){
  const page=await bucket.list({prefix:'records/',limit:100,cursor:url.searchParams.get('cursor')||undefined,include:['customMetadata']});return json({ok:true,records:page.objects.map(x=>({id:x.key.slice(8,-5),...x.customMetadata})),cursor:page.truncated?page.cursor:null});
 }
 const chunk=path.match(/^\/api\/archive\/chunks\/([a-f0-9]{64})$/);
 if(chunk){const key=chunkKey(chunk[1]);
  if(request.method==='HEAD'){const obj=await bucket.head(key);return new Response(null,{status:obj?200:404,headers:{...common,...(obj?{'content-length':String(obj.size),'x-archive-sha256':chunk[1]}:{})}})}
  if(request.method==='PUT'){
   const len=Number(request.headers.get('content-length'));if(!Number.isSafeInteger(len)||len<1||len>CHUNK_BYTES)return json({ok:false,code:'CHUNK_SIZE_INVALID'},413);
   // Bound memory even when a caller lies about Content-Length.
   const reader=request.body?.getReader();if(!reader)return json({ok:false},400);let size=0;const buffers=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>CHUNK_BYTES){await reader.cancel();return json({ok:false,code:'CHUNK_TOO_LARGE'},413)}buffers.push(value)}
   if(size!==len)return json({ok:false,code:'CHUNK_LENGTH_MISMATCH'},400);const bytes=new Uint8Array(size);let offset=0;for(const b of buffers){bytes.set(b,offset);offset+=b.length}if(await digest(bytes)!==chunk[1])return json({ok:false,code:'CHUNK_CHECKSUM_MISMATCH'},422);
   for(const target of [backup,primary])await target.put(key,bytes,{sha256:chunk[1],onlyIf:{etagDoesNotMatch:'*'}});return json({ok:true,sha256:chunk[1],size});
  }
  if(request.method==='GET'){const obj=await bucket.get(key);return obj?new Response(obj.body,{headers:{...common,'content-type':'application/octet-stream','content-length':String(obj.size),'x-archive-sha256':chunk[1]}}):json({ok:false},404)}
 }
 const record=path.match(/^\/api\/archive\/records\/([a-f0-9]{64})(\/content)?$/);
 if(record){const id=record[1];
  if(!record[2]&&request.method==='PUT'){
   if(Number(request.headers.get('content-length')||0)>2*1024*1024)return json({ok:false},413);
   const raw=await request.text();if(raw.length>2*1024*1024)return json({ok:false},413);const value=safeRecord(JSON.parse(raw),id);
   // One head per distinct chunk; no success receipt until every original byte is present.
   for(const c of new Map(value.chunks.map(c=>[c.sha256,c])).values()){const heads=await Promise.all([primary.head(chunkKey(c.sha256)),backup.head(chunkKey(c.sha256))]);if(heads.some(head=>!head||head.size!==c.size))return json({ok:false,code:'ARCHIVE_CHUNK_MISSING',sha256:c.sha256},409)}
   const old=await readRecord(primary,id);if(old){const expected={...value,archivedAt:old.archivedAt};if(JSON.stringify(old)!==JSON.stringify(expected))return json({ok:false,code:'IMMUTABLE_RECORD_CONFLICT'},409);await backup.put(recordKey(id),JSON.stringify(old),{onlyIf:{etagDoesNotMatch:'*'}});return json({ok:true,record:old,reused:true})}
   await backup.put(recordKey(id),JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'}});const result=await primary.put(recordKey(id),JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{name:value.name,path:value.path,size:String(value.size),sha256:value.sha256,mime:value.mime,archivedAt:value.archivedAt}});if(!result)return json({ok:false,code:'RECORD_COMMIT_RACE_RETRY'},409);return json({ok:true,record:value},201);
  }
  if(request.method==='GET'||request.method==='HEAD'){
   const value=await readRecord(bucket,id);if(!value)return json({ok:false,code:'ARCHIVE_RECORD_NOT_FOUND'},404);if(!record[2])return json({ok:true,record:value});
   const range=rangeFor(request.headers.get('range'),value.size);if(!range)return new Response(null,{status:416,headers:{...common,'content-range':`bytes */${value.size}`}});
   const length=Math.max(0,range.end-range.start+1),safePreview=/^(image\/(png|jpeg|gif|webp)|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|application\/pdf)$/.test(value.mime);
   const headers={...common,'content-type':safePreview?value.mime:'application/octet-stream','content-disposition':`${url.searchParams.get('preview')==='1'&&safePreview?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(value.name).replace(/'/g,'%27')}`,'content-length':String(length),'accept-ranges':'bytes','x-archive-sha256':value.sha256,'content-security-policy':"sandbox; default-src 'none'",...(range.partial?{'content-range':`bytes ${range.start}-${range.end}/${value.size}`}:{})};
   if(request.method==='HEAD')return new Response(null,{status:range.partial?206:200,headers});
   let index=0,position=0,active=null;const stream=new ReadableStream({async pull(controller){try{while(true){if(active){const out=await active.read();if(!out.done){controller.enqueue(out.value);return}active=null}if(index>=value.chunks.length){controller.close();return}const c=value.chunks[index++],start=position;position+=c.size;if(position<=range.start||start>range.end)continue;const from=Math.max(0,range.start-start),to=Math.min(c.size-1,range.end-start);const obj=await bucket.get(chunkKey(c.sha256),{range:{offset:from,length:to-from+1}});if(!obj)throw Error('Archive chunk unavailable');active=obj.body.getReader()}}catch(e){controller.error(e)}},async cancel(){if(active)await active.cancel()}});
   return new Response(stream,{status:range.partial?206:200,headers});
  }
 }
 return json({ok:false,code:'ARCHIVE_METHOD_OR_ROUTE_NOT_ALLOWED'},405);
 }catch(error){return json({ok:false,code:'ARCHIVE_REQUEST_FAILED',detail:error instanceof Error?error.message:'Archive error'},400)}
}
