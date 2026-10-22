#!/usr/bin/env python3
"""OMEGA Sovereign RCWA transport agent R3.

Authenticated queue worker for OMEGA_FULLWAVE_QUEUE_v1 jobs. It uses the same
Hybrid pairing credential as the main OMEGA agent, but runs as a separate
specialized process so optical/full-wave work can evolve without destabilizing
general Hybrid Link automation.
"""
from __future__ import annotations
import argparse, hashlib, json, os, platform, re, socket, subprocess, sys, time, urllib.error, urllib.request, uuid
from pathlib import Path

VERSION='R3.0'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
WORKER_ENDPOINT='/api/federation/rcwa/worker-download'

class AgentError(RuntimeError): pass

def sha_bytes(data:bytes): return hashlib.sha256(data).hexdigest()
def parse_pair(value):
    if '.' not in value: raise AgentError('Pairing code must contain bridge ID and secret.')
    bid,secret=value.split('.',1)
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,160}',bid) or len(secret)<24: raise AgentError('Invalid pairing code.')
    return bid,secret

def request_json(server,path,payload,bridge_id,secret,timeout=30):
    data=json.dumps(payload).encode('utf-8')
    req=urllib.request.Request(server.rstrip('/')+path,data=data,method='POST',headers={'content-type':'application/json','x-omega-bridge-id':bridge_id,'x-omega-bridge-secret':secret,'user-agent':'OMEGA-RCWA-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r: return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8','replace')
        try: detail=json.loads(raw)
        except Exception: detail={'message':raw}
        raise AgentError(f"HTTP {e.code}: {detail.get('reply') or detail.get('message') or detail.get('code') or raw[:500]}")

def get_bytes(server,path,timeout=30):
    req=urllib.request.Request(server.rstrip('/')+path,method='GET',headers={'cache-control':'no-cache','user-agent':'OMEGA-RCWA-Agent/'+VERSION})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        data=r.read(); expected=r.headers.get('x-omega-rcwa-worker-sha256')
        if expected and sha_bytes(data)!=expected: raise AgentError('Downloaded RCWA worker hash mismatch.')
        return data

def install_worker(server,root:Path):
    data=get_bytes(server,WORKER_ENDPOINT,60)
    text=data.decode('utf-8','strict')
    if 'OMEGA Sovereign RCWA Worker R3' not in text or 'import grcwa' not in text: raise AgentError('Canonical RCWA worker failed marker validation.')
    d=root/'.omega_hybrid'/'solvers';d.mkdir(parents=True,exist_ok=True)
    out=d/'omega_rcwa_worker.py';tmp=d/(out.name+'.tmp');tmp.write_bytes(data);os.replace(tmp,out)
    return out,sha_bytes(data)

def execute(job,worker_script:Path,root:Path):
    if job.get('schema')!='OMEGA_FULLWAVE_QUEUE_v1' or str(job.get('solver')).lower()!='rcwa': raise AgentError('Rejected non-RCWA full-wave job.')
    jid=str(job.get('id') or job.get('job_id') or ('fw_'+uuid.uuid4().hex))
    if not re.fullmatch(r'[A-Za-z0-9._:-]{1,180}',jid): raise AgentError('Unsafe full-wave job id.')
    d=root/'.omega_hybrid'/'rcwa_jobs'/jid;d.mkdir(parents=True,exist_ok=True)
    inp=d/'input.json';out=d/'result.json';inp.write_text(json.dumps(job,indent=2),'utf-8')
    started=time.time()
    p=subprocess.run([sys.executable,str(worker_script),'--input',str(inp),'--output',str(out)],cwd=root,text=True,capture_output=True,timeout=3600,shell=False)
    runtime_ms=(time.time()-started)*1000
    if not out.exists(): raise AgentError('RCWA worker returned without result.json')
    result=json.loads(out.read_text('utf-8'))
    if result.get('schema')!='OMEGA_RESULT_v1': raise AgentError('RCWA worker returned invalid result schema.')
    return {'result':result,'exitCode':p.returncode,'runtimeMs':runtime_ms,'stdout':p.stdout[-10000:],'stderr':p.stderr[-10000:],'inputPath':inp.relative_to(root).as_posix(),'outputPath':out.relative_to(root).as_posix(),'resultFileSha256':sha_bytes(out.read_bytes())}

def main():
    ap=argparse.ArgumentParser(description='OMEGA Sovereign RCWA transport agent')
    ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True);ap.add_argument('--root',default='.');ap.add_argument('--once',action='store_true')
    args=ap.parse_args();server=args.server.rstrip('/');bridge_id,secret=parse_pair(args.pair);root=Path(args.root).expanduser().resolve();root.mkdir(parents=True,exist_ok=True)
    state=root/'.omega_hybrid';state.mkdir(exist_ok=True);idfile=state/'rcwa_worker_id.txt';worker_id=idfile.read_text().strip() if idfile.exists() else 'rcwa_'+uuid.uuid4().hex;idfile.write_text(worker_id)
    print('OMEGA Sovereign RCWA transport agent',VERSION)
    print('Approved root:',root)
    worker_script,worker_sha=install_worker(server,root)
    print('Canonical solver adapter:',worker_script)
    payload={'bridgeId':bridge_id,'workerId':worker_id,'name':socket.gethostname()+' RCWA','platform':platform.platform(),'version':VERSION,'solverBackend':'grcwa','workerSha256':worker_sha}
    request_json(server,'/api/federation/rcwa/register',payload,bridge_id,secret,30)
    print('Authenticated RCWA worker registered:',worker_id)
    failures=0
    while True:
        try:
            request_json(server,'/api/federation/rcwa/heartbeat',{'bridgeId':bridge_id,'workerId':worker_id,'version':VERSION},bridge_id,secret,20)
            polled=request_json(server,'/api/federation/rcwa/poll',{'bridgeId':bridge_id,'workerId':worker_id},bridge_id,secret,40)
            job=polled.get('job')
            if job:
                print('RCWA job claimed:',job.get('id'))
                try:
                    run=execute(job,worker_script,root);result=run['result'];log=json.dumps({k:v for k,v in run.items() if k!='result'},default=str)
                except Exception as exc:
                    result={'schema':'OMEGA_RESULT_v1','packet_id':'agent_failure_'+uuid.uuid4().hex[:16],'source_packet_id':job.get('source_packet_id'),'worker':'omega-sovereign','solver':'rcwa','solver_version':'transport:'+VERSION,'converged':False,'convergence_metrics':{},'observables':{},'runtime_ms':0,'lineage':list(job.get('lineage') or [])+[f'omega-sovereign:transport-failure:{VERSION}'],'completed_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'error':str(exc),'truth_boundary':'No RCWA success is claimed for this failed transport/solver invocation.'};log=str(exc)
                request_json(server,'/api/federation/rcwa/result',{'bridgeId':bridge_id,'workerId':worker_id,'jobId':job.get('id'),'result':result,'log':log},bridge_id,secret,60)
                print('Returned RCWA result:',result.get('result_sha256') or result.get('packet_id'),'converged=',result.get('converged'))
            failures=0
            if args.once:return
        except KeyboardInterrupt:
            print('RCWA transport stopped. Worker heartbeat will become stale.');return
        except Exception as exc:
            failures+=1;print(f'RCWA transport error {failures}: {exc}',file=sys.stderr)
        time.sleep(4)

if __name__=='__main__': main()
