#!/usr/bin/env python3
"""Resume a private OMEGA archive transfer; verify both replicas by full byte readback.
Never executes or extracts source files. Never deletes source files.
"""
import argparse, hashlib, json, os, time, urllib.request, urllib.error
from pathlib import Path
CHUNK=8*1024*1024

def sha(value): return hashlib.sha256(value).hexdigest()

class Archive:
    def __init__(self,base,token):
        if not base.startswith('https://') and not base.startswith('http://127.0.0.1:'): raise ValueError('HTTPS archive endpoint required')
        self.base=base.rstrip('/')+'/api/archive/'; self.token=token.strip()
    def request(self,path,method='GET',body=None):
        for attempt in range(5):
            req=urllib.request.Request(self.base+path,data=body,method=method,headers={'Authorization':'Bearer '+self.token,**({'Content-Length':str(len(body)),'Content-Type':'application/octet-stream'} if body is not None else {})})
            try: return urllib.request.urlopen(req,timeout=120)
            except urllib.error.HTTPError as e:
                if e.code not in (429,500,502,503,504) or attempt==4: raise
            except (urllib.error.URLError,TimeoutError):
                if attempt==4: raise
            time.sleep(min(2**attempt,16))
    def exists(self,path,size):
        try:
            with self.request(path,'HEAD') as r: return int(r.headers.get('content-length',-1))==size
        except urllib.error.HTTPError as e:
            if e.code==404:return False
            raise
    def ingest(self,path,source):
        actual=path.stat().st_size;expected=source.get('size_bytes')
        if expected is not None and actual!=expected:raise ValueError('Source size differs from inventory: '+source['path'])
        chunks=[]; full=hashlib.sha256()
        with path.open('rb') as f:
            while True:
                b=f.read(CHUNK)
                if not b:break
                digest=sha(b);full.update(b);chunks.append({'sha256':digest,'size':len(b)})
                if not all(self.exists('chunks/'+digest+suffix,len(b)) for suffix in ('','?replica=backup')):
                    with self.request('chunks/'+digest,'PUT',b) as r:
                        out=json.load(r)
                        if out.get('sha256')!=digest or out.get('size')!=len(b):raise ValueError('Chunk receipt mismatch')
        digest=full.hexdigest();identity=source.get('library_file_id') or source.get('file_id') or source['path'];id=sha((identity+'\0'+str(source.get('file_id',''))+'\0'+digest).encode())
        record={'schema':'OMEGA_PRIVATE_ARCHIVE_V1','id':id,'name':source['name'],'path':source['path'],'mime':source.get('mime_type') or 'application/octet-stream','size':actual,'sha256':digest,'source':{'provider':'ChatGPT Library' if source.get('library_file_id') else 'local import','libraryFileId':source.get('library_file_id',''),'fileId':source.get('file_id',''),'versionId':source.get('version_id') or ''},'chunks':chunks}
        with self.request('records/'+id,'PUT',json.dumps(record).encode()) as r:
            saved=json.load(r)
            if saved.get('record',{}).get('sha256')!=digest:raise ValueError('Record receipt mismatch')
        replicas=[]
        for suffix in ('','?replica=backup'):
            received=hashlib.sha256();size=0
            with self.request('records/'+id+'/content'+suffix) as r:
                while True:
                    b=r.read(1024*1024)
                    if not b:break
                    size+=len(b);received.update(b)
            if size!=actual or received.hexdigest()!=digest:raise ValueError('Full-file cloud readback mismatch')
            replicas.append({'replica':'backup' if suffix else 'primary','bytes':size,'sha256':received.hexdigest()})
        return {'schema':'OMEGA_ARCHIVE_ROUNDTRIP_PROOF_V1','status':'BOTH_REPLICAS_READBACK_VERIFIED','id':id,'source':source,'sha256':digest,'bytes':actual,'replicas':replicas,'verifiedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--token-file',type=Path,required=True);p.add_argument('--inventory',type=Path,required=True);p.add_argument('--root',type=Path,required=True);p.add_argument('--receipts',type=Path,required=True);a=p.parse_args()
    api=Archive(a.base,a.token_file.read_text());raw=json.loads(a.inventory.read_text());items=raw.get('items',[])
    a.receipts.parent.mkdir(parents=True,exist_ok=True);failed=0
    for source in items:
        if source.get('kind')!='file':continue
        relative=Path(source['path'].lstrip('/'));path=(a.root/relative).resolve()
        if not path.is_relative_to(a.root.resolve()):raise ValueError('Unsafe source path')
        try:
            proof=api.ingest(path,source)
            with a.receipts.open('a') as out:out.write(json.dumps(proof)+'\n');out.flush();os.fsync(out.fileno())
            print(json.dumps({'id':proof['id'],'status':proof['status'],'bytes':proof['bytes']}),flush=True)
        except Exception as e:
            failed+=1;print(json.dumps({'source':source.get('library_file_id'),'status':'FAILED','reason':str(e)}),flush=True)
    if failed:raise SystemExit(1)
if __name__=='__main__':main()
