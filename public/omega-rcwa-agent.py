#!/usr/bin/env python3
"""OMEGA Sovereign RCWA transport agent R146.

Authenticated OMEGA_FULLWAVE_QUEUE_v1 executor. Single-wavelength jobs retain
the canonical R3 grcwa worker path. Jobs carrying execution_mode
DISPERSION_SPECTRAL_R146 execute that same real worker independently at every
requested wavelength with explicit R35-compatible material dispersion models.
No reduced-order or scalar fallback is used for RCWA success.
"""
from __future__ import annotations
import argparse, copy, hashlib, json, math, os, platform, re, socket, subprocess, sys, time, urllib.error, urllib.request, uuid
from pathlib import Path

VERSION='R146.0'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
WORKER_ENDPOINT='/api/federation/rcwa/worker-download'
MATERIAL_LIBRARY_VERSION='R35.0+R146_TRANSPORT'

SELLMEIER={
 'sio2_fused':{'B':(0.6961663,0.4079426,0.8974794),'C':(0.0684043**2,0.1162414**2,9.896161**2),'range_nm':(210.0,3700.0),'source':'Malitson fused-silica Sellmeier coefficients'}
}
TABLES={
 'air':{'points':[(400,1.0,0.0),(700,1.0,0.0)],'source':'ideal dry-air approximation'},
 'tio2_design':{'points':[(430,2.55,0.0),(470,2.50,0.0),(532,2.43,0.0),(590,2.38,0.0),(650,2.34,0.0),(680,2.32,0.0)],'source':'OMEGA conservative TiO2 visible design table; process-specific measurement required'},
 'sin_design':{'points':[(430,2.08,0.0),(470,2.06,0.0),(532,2.03,0.0),(590,2.01,0.0),(650,1.99,0.0),(680,1.98,0.0)],'source':'OMEGA conservative SiN visible design table; process-specific measurement required'}
}

class AgentError(RuntimeError): pass

def sha_bytes(data:bytes): return hashlib.sha256(data).hexdigest()
def sha_json(value): return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),default=str).encode('utf-8')).hexdigest()
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
    data=get_bytes(server,WORKER_ENDPOINT,60);text=data.decode('utf-8','strict')
    if 'OMEGA Sovereign RCWA Worker R3' not in text or 'import grcwa' not in text: raise AgentError('Canonical RCWA worker failed marker validation.')
    d=root/'.omega_hybrid'/'solvers';d.mkdir(parents=True,exist_ok=True)
    out=d/'omega_rcwa_worker.py';tmp=d/(out.name+'.tmp');tmp.write_bytes(data);os.replace(tmp,out)
    return out,sha_bytes(data)

def _interp(points,wl):
    if wl<points[0][0] or wl>points[-1][0]: raise AgentError(f'wavelength {wl} nm outside material table [{points[0][0]}, {points[-1][0]}] nm')
    for a,b in zip(points,points[1:]):
        if a[0]<=wl<=b[0]:
            t=(wl-a[0])/(b[0]-a[0]) if b[0]!=a[0] else 0.0
            return complex(a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2]))
    return complex(points[-1][1],points[-1][2])

def resolve_material(name,wavelength_nm):
    key=str(name).lower().strip();wl=float(wavelength_nm)
    if key in SELLMEIER:
        d=SELLMEIER[key];lo,hi=d['range_nm']
        if not lo<=wl<=hi: raise AgentError(f'{key} model outside declared range')
        l=wl/1000.0;l2=l*l;n2=1.0+sum(B*l2/(l2-C) for B,C in zip(d['B'],d['C']))
        return {'name':key,'n':complex(math.sqrt(n2),0.0),'wavelength_nm':wl,'model':'sellmeier','source':d['source'],'library_version':MATERIAL_LIBRARY_VERSION}
    if key in TABLES:
        d=TABLES[key]
        return {'name':key,'n':_interp(d['points'],wl),'wavelength_nm':wl,'model':'linear_table','source':d['source'],'library_version':MATERIAL_LIBRARY_VERSION}
    raise AgentError(f"unknown material '{name}'")

def resolve_stack(names,wavelength_nm):
    aliases={'n_incident':'incident','n_feature':'feature','n_background':'background','n_substrate':'substrate'};resolved={k:resolve_material(names[v],wavelength_nm) for k,v in aliases.items()}
    model={k:float(v['n'].real) if abs(v['n'].imag)<1e-15 else str(v['n']) for k,v in resolved.items()}
    provenance={k:{**v,'n':str(v['n'])} for k,v in resolved.items()}
    return model,provenance

def spectral_wavelengths(job):
    spectral=job.get('spectral') or {};vals=spectral.get('wavelengths_nm')
    if not isinstance(vals,list) or not vals: raise AgentError('R146 spectral job requires spectral.wavelengths_nm')
    out=[]
    for raw in vals:
        wl=float(raw)
        if not math.isfinite(wl) or wl<=0: raise AgentError('spectral wavelength must be positive and finite')
        if wl not in out: out.append(wl)
    if not 1<=len(out)<=33: raise AgentError('R146 spectral execution supports 1..33 unique wavelengths per promoted job')
    return out

def invoke_worker(job,worker_script:Path,root:Path,jid:str,suffix=''):
    d=root/'.omega_hybrid'/'rcwa_jobs'/jid;d.mkdir(parents=True,exist_ok=True)
    stem='result'+suffix;inp=d/('input'+suffix+'.json');out=d/(stem+'.json');inp.write_text(json.dumps(job,indent=2),'utf-8')
    started=time.time();p=subprocess.run([sys.executable,str(worker_script),'--input',str(inp),'--output',str(out)],cwd=root,text=True,capture_output=True,timeout=3600,shell=False);runtime_ms=(time.time()-started)*1000
    if not out.exists(): raise AgentError('RCWA worker returned without result.json')
    result=json.loads(out.read_text('utf-8'))
    if result.get('schema')!='OMEGA_RESULT_v1' or result.get('solver')!='rcwa': raise AgentError('RCWA worker returned invalid result schema/solver')
    return {'result':result,'exitCode':p.returncode,'runtimeMs':runtime_ms,'stdout':p.stdout[-10000:],'stderr':p.stderr[-10000:],'inputPath':inp.relative_to(root).as_posix(),'outputPath':out.relative_to(root).as_posix(),'resultFileSha256':sha_bytes(out.read_bytes())}

def execute_spectral(job,worker_script:Path,root:Path,jid:str):
    names=job.get('material_names') or {};required=('incident','feature','background','substrate')
    if any(not str(names.get(k,'')).strip() for k in required): raise AgentError('R146 spectral execution requires explicit incident/feature/background/substrate material names')
    t0=time.time();points=[];logs=[]
    for index,wl in enumerate(spectral_wavelengths(job)):
        model,provenance=resolve_stack(names,wl);child=copy.deepcopy(job);child['wavelength_nm']=wl;child['material_model']=model;child.pop('spectral',None);child['execution_mode']='RCWA_CHILD_R146';child['lineage']=list(job.get('lineage') or [])+[f'omega-materials:{MATERIAL_LIBRARY_VERSION}:{wl}nm',f'omega-sovereign:r146:spectral-child:{index}']
        run=invoke_worker(child,worker_script,root,jid,f'_{index:03d}');points.append({'wavelength_nm':wl,'materials':provenance,'result':run['result']});logs.append({k:v for k,v in run.items() if k!='result'})
    converged=all(bool(p['result'].get('converged')) for p in points);out={'schema':'OMEGA_SPECTRAL_RESULT_v1','version':'R146.0','worker':'omega-sovereign','solver':'rcwa','source_packet_id':str(job.get('source_packet_id')),'job_id':str(job.get('job_id') or jid),'material_library_version':MATERIAL_LIBRARY_VERSION,'converged_all':converged,'points':points,'runtime_ms':(time.time()-t0)*1000,'lineage':list(job.get('lineage') or [])+['omega-sovereign:r146:dispersion-spectral-return'],'completed_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'truth_boundary':'Authenticated Sovereign grcwa spectral execution with explicit design-model dispersion. Numerical convergence is not fabrication validation; measured process-specific optical constants remain required for fabrication claims.'};out['result_sha256']=sha_json(out)
    return {'result':out,'exitCode':0 if converged else 3,'runtimeMs':out['runtime_ms'],'stdout':json.dumps({'points':len(points),'converged_all':converged}),'stderr':'','inputPath':None,'outputPath':None,'resultFileSha256':out['result_sha256'],'children':logs}

def execute(job,worker_script:Path,root:Path):
    if job.get('schema')!='OMEGA_FULLWAVE_QUEUE_v1' or str(job.get('solver')).lower()!='rcwa': raise AgentError('Rejected non-RCWA full-wave job.')
    jid=str(job.get('id') or job.get('job_id') or ('fw_'+uuid.uuid4().hex))
    if not re.fullmatch(r'[A-Za-z0-9._:-]{1,180}',jid): raise AgentError('Unsafe full-wave job id.')
    if job.get('execution_mode')=='DISPERSION_SPECTRAL_R146' or job.get('spectral'): return execute_spectral(job,worker_script,root,jid)
    return invoke_worker(job,worker_script,root,jid)

def main():
    ap=argparse.ArgumentParser(description='OMEGA Sovereign RCWA transport agent R146')
    ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True);ap.add_argument('--root',default='.');ap.add_argument('--once',action='store_true')
    args=ap.parse_args();server=args.server.rstrip('/');bridge_id,secret=parse_pair(args.pair);root=Path(args.root).expanduser().resolve();root.mkdir(parents=True,exist_ok=True)
    state=root/'.omega_hybrid';state.mkdir(exist_ok=True);idfile=state/'rcwa_worker_id.txt';worker_id=idfile.read_text().strip() if idfile.exists() else 'rcwa_'+uuid.uuid4().hex;idfile.write_text(worker_id)
    print('OMEGA Sovereign RCWA transport agent',VERSION);print('Approved root:',root)
    worker_script,worker_sha=install_worker(server,root);print('Canonical solver adapter:',worker_script)
    payload={'bridgeId':bridge_id,'workerId':worker_id,'name':socket.gethostname()+' RCWA','platform':platform.platform(),'version':VERSION,'solverBackend':'grcwa+dispersion-r146','workerSha256':worker_sha,'capabilities':['rcwa','spectral_rcwa','dispersion_materials_r35']}
    request_json(server,'/api/federation/rcwa/register',payload,bridge_id,secret,30);print('Authenticated RCWA worker registered:',worker_id)
    failures=0
    while True:
        try:
            request_json(server,'/api/federation/rcwa/heartbeat',{'bridgeId':bridge_id,'workerId':worker_id,'version':VERSION},bridge_id,secret,20)
            polled=request_json(server,'/api/federation/rcwa/poll',{'bridgeId':bridge_id,'workerId':worker_id},bridge_id,secret,40);job=polled.get('job')
            if job:
                print('RCWA job claimed:',job.get('id'))
                try:
                    run=execute(job,worker_script,root);result=run['result'];log=json.dumps({k:v for k,v in run.items() if k!='result'},default=str)
                except Exception as exc:
                    result={'schema':'OMEGA_RESULT_v1','packet_id':'agent_failure_'+uuid.uuid4().hex[:16],'source_packet_id':job.get('source_packet_id'),'worker':'omega-sovereign','solver':'rcwa','solver_version':'transport:'+VERSION,'converged':False,'convergence_metrics':{},'observables':{},'runtime_ms':0,'lineage':list(job.get('lineage') or [])+[f'omega-sovereign:transport-failure:{VERSION}'],'completed_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'error':str(exc),'truth_boundary':'No RCWA success is claimed for this failed transport/solver invocation.'};log=str(exc)
                request_json(server,'/api/federation/rcwa/result',{'bridgeId':bridge_id,'workerId':worker_id,'jobId':job.get('id'),'result':result,'log':log},bridge_id,secret,60)
                print('Returned RCWA result:',result.get('result_sha256') or result.get('packet_id'),'converged=',result.get('converged_all',result.get('converged')))
            failures=0
            if args.once:return
        except KeyboardInterrupt:
            print('RCWA transport stopped. Worker heartbeat will become stale.');return
        except Exception as exc:
            failures+=1;print(f'RCWA transport error {failures}: {exc}',file=sys.stderr)
        time.sleep(4)

if __name__=='__main__': main()
