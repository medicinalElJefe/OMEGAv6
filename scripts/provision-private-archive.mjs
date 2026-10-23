// Invoked only by the existing exact-main production release authority.
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw Error('Private archive provisioning requires existing production Cloudflare credentials; no credential fallback.');
const url=`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets`;
async function call(path,init={}){const r=await fetch(path,{...init,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'}});const b=await r.json();if(!r.ok||!b.success){const e=new Error(`Private archive provisioning failed: HTTP ${r.status}; provider code ${b.errors?.[0]?.code||'unknown'}`);e.status=r.status;throw e}return b.result}
for(const name of ['omegav6-private-archive','omegav6-private-archive-backup']){try{await call(url+'/'+name);console.log('Existing private archive bucket found.')}catch(e){if(e.status!==404)throw e;await call(url,{method:'POST',body:JSON.stringify({name})});console.log('Private archive bucket created. No public bucket domain or deletion lifecycle configured.')}

}
