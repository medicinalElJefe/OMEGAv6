#!/usr/bin/env python3
"""OMEGA R34 local Hybrid Link agent.
R132 execution successor: real governed Windows desktop/file execution on the proven R34.1 transport.
Stdlib-first, root-confined, allow-listed execution. It never exposes arbitrary shell access.
Pairing is explicit. Every claimed native action returns bounded proof to the canonical Worker.
"""
from __future__ import annotations
import argparse,ctypes,hashlib,json,os,platform,re,socket,subprocess,sys,time,urllib.error,urllib.request,uuid,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

VERSION='R34.1'
CAPABILITY_REVISION='R132'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
TEXT_EXT={'.txt','.md','.json','.jsonc','.js','.jsx','.ts','.tsx','.py','.pyw','.css','.html','.yml','.yaml','.toml','.ini','.cfg','.csv','.bat','.ps1','.cs','.csproj','.sln','.xml'}
SKIP_DIRS={'.git','node_modules','dist','build','.venv','venv','__pycache__','.wrangler','.omega_hybrid'}
MAX_FILES=25000;MAX_FILE_BYTES=8*1024*1024;MAX_PATCH_BYTES=512*1024;MAX_PATCH_REPLACEMENTS=24;MAX_WRITE_BYTES=512*1024;MAX_MACRO_EVENTS=5000
class AgentError(RuntimeError):pass

def sha_bytes(b:bytes):return hashlib.sha256(b).hexdigest()
def sha_json(o):return sha_bytes(json.dumps(o,sort_keys=True,separators=(',',':')).encode())
def request_json(server,path,payload,bridge_id,secret,timeout=30):
    req=urllib.request.Request(server.rstrip('/')+path,data=json.dumps(payload).encode(),method='POST',headers={'content-type':'application/json','x-omega-bridge-id':bridge_id,'x-omega-bridge-secret':secret,'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8','replace')
        try:d=json.loads(raw)
        except Exception:d={'message':raw}
        raise AgentError(f"HTTP {e.code}: {d.get('reply') or d.get('message') or d.get('code') or raw[:300]}")
def probe_server(server,timeout=15):
    req=urllib.request.Request(server.rstrip('/')+'/api/health',method='GET',headers={'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            if int(getattr(r,'status',200))!=200:raise AgentError('Canonical health failed')
            return True
    except Exception as e:raise AgentError(f'Canonical unreachable: {e}')
def parse_pair(v):
    if '.' not in v:raise AgentError('Pairing code must contain bridge ID and secret.')
    bid,secret=v.split('.',1)
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,128}',bid) or len(secret)<24:raise AgentError('Invalid pairing code.')
    return bid,secret
def normalize_root_arg(v):
    s=str(v or '.').strip().strip('"').rstrip('"').strip()
    if os.name=='nt' and re.fullmatch(r'[A-Za-z]:\\',s):return s+'.'
    return s or '.'
def secure_path(root:Path,rel='.'):
    rel=str(rel or '.').replace('\\','/').strip()
    if rel.startswith('/') or re.match(r'^[A-Za-z]:',rel) or '..' in Path(rel).parts:raise AgentError('Path escapes approved root.')
    out=(root/rel).resolve()
    try:out.relative_to(root.resolve())
    except ValueError:raise AgentError('Path escapes approved root.')
    return out
def iter_files(root:Path):
    n=0
    for base,dirs,files in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            p=Path(base)/name
            try:
                if p.is_symlink() or p.stat().st_size>MAX_FILE_BYTES:continue
            except OSError:continue
            yield p;n+=1
            if n>=MAX_FILES:return

def index_tree(path):
    rows=[{'path':p.relative_to(path).as_posix(),'bytes':p.stat().st_size,'ext':p.suffix.lower()} for p in iter_files(path)]
    return {'files':len(rows),'sample':rows[:120]}
def hash_tree(path):
    h=hashlib.sha256();rows=[]
    for p in sorted(iter_files(path),key=lambda x:x.as_posix().lower()):
        rel=p.relative_to(path).as_posix();d=sha_bytes(p.read_bytes());h.update(rel.encode());h.update(d.encode());rows.append({'path':rel,'sha256':d,'bytes':p.stat().st_size})
    return {'treeSha256':h.hexdigest(),'files':len(rows),'sample':rows[:120]}
def read_text(path):
    if not path.is_file():raise AgentError('READ_TEXT requires a file.')
    b=path.read_bytes()
    if len(b)>MAX_FILE_BYTES:raise AgentError('File exceeds bounded text-read size.')
    return {'path':path.name,'sha256':sha_bytes(b),'bytes':len(b),'text':b.decode('utf-8','replace')[:120000]}
def search_text(path,query,max_results=120):
    terms=[x.lower() for x in re.findall(r'[A-Za-z0-9_.-]{2,}',query or '')][:12]
    if not terms:raise AgentError('SEARCH_TEXT requires literal terms.')
    out=[]
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT:continue
        try:lines=p.read_text('utf-8','replace').splitlines()
        except Exception:continue
        for i,line in enumerate(lines,1):
            if any(t in line.lower() for t in terms):
                out.append({'path':p.relative_to(path).as_posix(),'line':i,'text':line[:500]})
                if len(out)>=int(max_results or 120):return {'query':query,'matches':out}
    return {'query':query,'matches':out}
def command_for(path,op,profile):
    profile=(profile or 'AUTO_BUILD').upper()
    if (path/'package.json').exists():
        scripts=json.loads((path/'package.json').read_text('utf-8')).get('scripts',{})
        if op=='BUILD' and 'build' in scripts:return ['npm','run','build']
        for s in ('check','test'):
            if op=='TEST' and s in scripts:return ['npm','run',s]
    if (path/'pyproject.toml').exists() or (path/'requirements.txt').exists():return [sys.executable,'-m','pytest','-q'] if op=='TEST' else None
    sln=next(path.glob('*.sln'),None);cs=next(path.glob('*.csproj'),None)
    if sln or cs:return ['dotnet','test' if op=='TEST' else 'build',str((sln or cs).name)]
    if profile=='NODE_BUILD':return ['npm','run','build' if op=='BUILD' else 'check']
    if profile=='PYTHON_TEST' and op=='TEST':return [sys.executable,'-m','pytest','-q']
    if profile=='DOTNET_BUILD':return ['dotnet','test' if op=='TEST' else 'build']
    return None
def run_declared(path,op,profile):
    cmd=command_for(path,op,profile)
    if not cmd:raise AgentError(f'No declared {op.lower()} command discovered for {profile}.')
    p=subprocess.run(cmd,cwd=path,text=True,capture_output=True,timeout=900,shell=False)
    r={'command':cmd,'exitCode':p.returncode,'stdout':p.stdout[-18000:],'stderr':p.stderr[-12000:]}
    if p.returncode:raise AgentError(json.dumps(r))
    return r
def package_path(path,root):
    d=root/'.omega_hybrid'/'packages';d.mkdir(parents=True,exist_ok=True);out=d/(path.name+'_'+time.strftime('%Y%m%d_%H%M%S')+'.zip')
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in iter_files(path):z.write(p,p.relative_to(path).as_posix())
    return {'path':out.relative_to(root).as_posix(),'sha256':sha_bytes(out.read_bytes()),'bytes':out.stat().st_size}
def backup(path,root):
    out=root/'.omega_hybrid'/'backups'/(time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:8])/path.relative_to(root);out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(path.read_bytes());return out
def apply_patch(path,root,step):
    if not path.is_file() or path.is_symlink():raise AgentError('APPLY_PATCH requires a regular text file inside the approved root.')
    raw=path.read_bytes();expected=str(step.get('expectedSha256','')).lower()
    if len(raw)>MAX_PATCH_BYTES or not re.fullmatch(r'[0-9a-f]{64}',expected):raise AgentError('APPLY_PATCH requires expectedSha256 from a prior READ_TEXT/HASH proof.')
    before=sha_bytes(raw)
    if before!=expected:raise AgentError('APPLY_PATCH preimage mismatch.')
    changed=raw.decode('utf-8');replacements=step.get('replacements')
    if not isinstance(replacements,list) or not 1<=len(replacements)<=MAX_PATCH_REPLACEMENTS:raise AgentError('APPLY_PATCH requires 1-24 exact replacements.')
    for r in replacements:
        f=r.get('find');rep=r.get('replace');occ=int(r.get('occurrences',1));observed=changed.count(f or '')
        if not f or not isinstance(rep,str) or observed!=occ:raise AgentError('APPLY_PATCH exact replacement proof failed.')
        changed=changed.replace(f,rep,occ)
    out=changed.encode();b=backup(path,root);tmp=path.with_name(path.name+'.omega_'+uuid.uuid4().hex+'.tmp');tmp.write_bytes(out);os.replace(tmp,path)
    return {'path':path.relative_to(root).as_posix(),'beforeSha256':before,'afterSha256':sha_bytes(out),'backupPath':b.relative_to(root).as_posix(),'atomic':True}
def write_text(path,root,step):
    data=str(step.get('content','')).encode()
    if not data or len(data)>MAX_WRITE_BYTES:raise AgentError('WRITE_TEXT requires bounded UTF-8 content.')
    before=None;b=None
    if path.exists():
        if step.get('createOnly'):raise AgentError('WRITE_TEXT createOnly target already exists.')
        before=sha_bytes(path.read_bytes());expected=str(step.get('expectedSha256','')).lower()
        if before!=expected:raise AgentError('WRITE_TEXT replacement requires expectedSha256 from prior host proof.')
        b=backup(path,root)
    elif not step.get('createOnly'):raise AgentError('WRITE_TEXT new-file creation requires createOnly=true.')
    path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_name(path.name+'.omega_'+uuid.uuid4().hex+'.tmp');tmp.write_bytes(data);os.replace(tmp,path)
    r={'path':path.relative_to(root).as_posix(),'beforeSha256':before,'afterSha256':sha_bytes(data),'atomic':True,'created':before is None}
    if b:r['backupPath']=b.relative_to(root).as_posix()
    return r
def workbook_audit(path,root):
    if not path.is_file() or path.suffix.lower() not in {'.xlsx','.xlsm'}:raise AgentError('WORKBOOK_AUDIT requires an .xlsx or .xlsm file.')
    with zipfile.ZipFile(path) as z:
        names=set(z.namelist());sheets=[]
        if 'xl/workbook.xml' in names:
            t=ET.fromstring(z.read('xl/workbook.xml'));ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};sheets=[x.attrib.get('name','') for x in t.findall('.//m:sheet',ns)][:200]
        formulas=sum(z.read(n).count(b'<f') for n in names if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'))
    return {'path':path.relative_to(root).as_posix(),'sha256':sha_bytes(path.read_bytes()),'sheets':sheets,'formulaCount':formulas,'hasVbaProject':'xl/vbaProject.bin' in names,'executedMacros':False}
def train_local(path,root):
    docs=[];chunks=[];freq={};dig={}
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT:continue
        try:txt=p.read_text('utf-8','replace')[:600000]
        except Exception:continue
        words=re.findall(r'[A-Za-z][A-Za-z0-9_-]{2,}',txt.lower())
        if not words:continue
        rel=p.relative_to(path).as_posix();d=sha_bytes(txt.encode());docs.append({'path':rel,'sha256':d,'tokens':len(words)});dig.setdefault(d,[]).append(rel)
        for w in set(words):freq[w]=freq.get(w,0)+1
        for n in range(0,len(txt.splitlines()),80):
            block='\n'.join(txt.splitlines()[n:n+80]).strip()
            if block:chunks.append({'path':rel,'startLine':n+1,'sha256':sha_bytes(block.encode()),'preview':block[:800]})
            if len(chunks)>=50000:break
    payload={'schema':'OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R132','documents':docs[:25000],'chunks':chunks,'termDocumentFrequency':sorted(freq.items(),key=lambda x:(-x[1],x[0]))[:6000],'duplicateGroups':[{'sha256':d,'paths':p} for d,p in dig.items() if len(p)>1][:1000],'foundationWeightsChanged':False,'learningType':'LOCAL_RETRIEVAL_AND_PROOF_PRIOR_INDEX','createdAt':time.time()};payload['indexSha256']=sha_json(payload)
    d=root/'.omega_hybrid';d.mkdir(parents=True,exist_ok=True);out=d/'sai_index_r132.json';out.write_text(json.dumps(payload,indent=2));status='PASS' if docs else 'HOLD_NO_DOCUMENTS'
    return {'indexPath':out.relative_to(root).as_posix(),'indexSha256':payload['indexSha256'],'documents':len(docs),'chunks':len(chunks),'evaluation':{'status':status},'promotion':{'status':'ACTIVE_LOCAL_RETRIEVAL_INDEX' if status=='PASS' else 'HELD'},'foundationWeightsChanged':False,'learningType':payload['learningType']}

# Real Windows desktop adapter; no optional-stub path remains.
def require_windows():
    if os.name!='nt':raise AgentError('This desktop automation operation requires Windows.')
def U():require_windows();return ctypes.windll.user32
def list_windows():
    u=U();rows=[];P=ctypes.WINFUNCTYPE(ctypes.c_bool,ctypes.c_void_p,ctypes.c_void_p)
    @P
    def cb(h,_):
        if u.IsWindowVisible(h):
            n=u.GetWindowTextLengthW(h);b=ctypes.create_unicode_buffer(n+1);u.GetWindowTextW(h,b,n+1)
            if b.value.strip():rows.append({'hwnd':int(h),'title':b.value[:240]})
        return len(rows)<160
    u.EnumWindows(cb,0);return {'windows':rows,'count':len(rows)}
def foreground_window():
    u=U();h=u.GetForegroundWindow();n=u.GetWindowTextLengthW(h);b=ctypes.create_unicode_buffer(n+1);u.GetWindowTextW(h,b,n+1);return {'hwnd':int(h),'title':b.value}
def assert_window(title):
    r=foreground_window();needle=str(title or '').lower()
    if not needle or needle not in r['title'].lower():raise AgentError(f'Foreground window mismatch: required {title!r}, observed {r["title"]!r}.')
    return {'matched':True,**r}
def find_window(title):
    needle=str(title or '').lower();m=[x for x in list_windows()['windows'] if needle in x['title'].lower()]
    if not m:raise AgentError('No visible window matched title lock.')
    return m[0]
def focus_window(title):
    r=find_window(title);u=U();u.ShowWindow(r['hwnd'],5);u.SetForegroundWindow(r['hwnd']);time.sleep(.2);return assert_window(title)
def screen_capture(root,title):
    r=assert_window(title);outd=root/'.omega_hybrid'/'screens';outd.mkdir(parents=True,exist_ok=True);out=outd/(time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:8]+'.png')
    script="$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Drawing;$h=[intptr]::new([int64]$args[0]);Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class R{[DllImport(\"user32.dll\")]public static extern bool GetWindowRect(IntPtr h,out RECT r);public struct RECT{public int L,T,R,B;}}';$q=New-Object R+RECT;[R]::GetWindowRect($h,[ref]$q)|Out-Null;$w=$q.R-$q.L;$hh=$q.B-$q.T;$b=New-Object Drawing.Bitmap $w,$hh;$g=[Drawing.Graphics]::FromImage($b);$g.CopyFromScreen($q.L,$q.T,0,0,$b.Size);$b.Save($args[1],[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$b.Dispose()"
    p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',script,str(r['hwnd']),str(out)],text=True,capture_output=True,timeout=30,shell=False)
    if p.returncode or not out.exists():raise AgentError('SCREEN_CAPTURE failed: '+p.stderr[-1000:])
    return {'path':out.relative_to(root).as_posix(),'sha256':sha_bytes(out.read_bytes()),'bytes':out.stat().st_size,'windowTitle':r['title'],'localOnly':True}
def read_visible_text(title,max_results=400):
    r=assert_window(title);script="$ErrorActionPreference='Stop';Add-Type -AssemblyName UIAutomationClient;Add-Type -AssemblyName UIAutomationTypes;$x=[Windows.Automation.AutomationElement]::FromHandle([intptr]::new([int64]$args[0]));$a=$x.FindAll([Windows.Automation.TreeScope]::Descendants,[Windows.Automation.Condition]::TrueCondition);$o=@();for($i=0;$i -lt $a.Count -and $o.Count -lt [int]$args[1];$i++){try{$n=$a.Item($i).Current.Name;if($n){$o+=[pscustomobject]@{name=$n;control=$a.Item($i).Current.ControlType.ProgrammaticName}}}catch{}};$o|ConvertTo-Json -Compress"
    p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',script,str(r['hwnd']),str(max(1,min(1000,int(max_results or 400))))],text=True,capture_output=True,timeout=30,shell=False)
    if p.returncode:raise AgentError('READ_VISIBLE_TEXT UI Automation failed.')
    try:d=json.loads(p.stdout) if p.stdout.strip() else []
    except Exception:d=[]
    if isinstance(d,dict):d=[d]
    return {'windowTitle':r['title'],'items':d,'count':len(d),'method':'WINDOWS_UI_AUTOMATION'}
def mouse_move(x,y,title):assert_window(title);return {'moved':bool(U().SetCursorPos(int(x),int(y))),'x':int(x),'y':int(y)}
def click_mouse(x,y,button,title):
    assert_window(title);u=U();u.SetCursorPos(int(x),int(y));right=str(button).upper()=='RIGHT';u.mouse_event(8 if right else 2,0,0,0,0);u.mouse_event(16 if right else 4,0,0,0,0);return {'clicked':True,'x':int(x),'y':int(y),'button':'RIGHT' if right else 'LEFT'}
VK={'ENTER':13,'TAB':9,'ESC':27,'ESCAPE':27,'BACKSPACE':8,'DELETE':46,'HOME':36,'END':35,'PAGEUP':33,'PAGEDOWN':34,'UP':38,'DOWN':40,'LEFT':37,'RIGHT':39,'SPACE':32,'CTRL':17,'ALT':18,'SHIFT':16}
for i in range(1,13):VK['F'+str(i)]=111+i
for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789':VK[c]=ord(c)
def ke(v,d=True):U().keybd_event(int(v),0,0 if d else 2,0)
def send_key(name,title):
    assert_window(title);parts=str(name).upper().split('+');mods=[]
    for p in parts[:-1]:mods.append(VK[p]);ke(VK[p])
    ke(VK[parts[-1]]);ke(VK[parts[-1]],False)
    for v in reversed(mods):ke(v,False)
    return {'key':name,'sent':True}
def type_text(value,title):
    assert_window(title);u=U();n=0
    for ch in str(value):
        c=u.VkKeyScanW(ord(ch));vk=c&255;shift=(c>>8)&255
        if c==-1:raise AgentError('TYPE_TEXT cannot map character.')
        if shift&1:ke(16)
        ke(vk);ke(vk,False)
        if shift&1:ke(16,False)
        n+=1
    return {'typedCharacters':n,'textSha256':sha_bytes(str(value).encode()),'plaintextReturned':False}
def scroll_mouse(delta,title):assert_window(title);U().mouse_event(0x0800,0,0,int(delta),0);return {'scrolled':int(delta)}
def macro_path(root,name):
    n=re.sub(r'[^A-Za-z0-9._-]','_',str(name or ''))[:64];d=root/'.omega_hybrid'/'macros';d.mkdir(parents=True,exist_ok=True);return d/(n+'.json')
def record_macro(root,name,title,duration):
    require_windows();assert_window(title);u=U();start=time.time();events=[];last=(None,None);buttons={1:False,2:False};keys={k:False for k in range(8,256)}
    class P(ctypes.Structure):_fields_=[('x',ctypes.c_long),('y',ctypes.c_long)]
    while time.time()-start<max(5,min(300,int(duration or 30))) and len(events)<MAX_MACRO_EVENTS:
        assert_window(title);pt=P();u.GetCursorPos(ctypes.byref(pt));pos=(pt.x,pt.y);t=round(time.time()-start,3)
        if last==(None,None) or abs(pos[0]-last[0])+abs(pos[1]-last[1])>=4:events.append({'t':t,'type':'MOVE','x':pos[0],'y':pos[1]});last=pos
        for vk,b in ((1,'LEFT'),(2,'RIGHT')):
            d=bool(u.GetAsyncKeyState(vk)&0x8000)
            if buttons[vk] and not d:events.append({'t':t,'type':'CLICK','x':pos[0],'y':pos[1],'button':b})
            buttons[vk]=d
        for vk in range(8,256):
            if vk in (1,2):continue
            d=bool(u.GetAsyncKeyState(vk)&0x8000)
            if d and not keys[vk]:events.append({'t':t,'type':'KEY_RAW','vk':vk})
            keys[vk]=d
        time.sleep(.025)
    payload={'schema':'OMEGA_LOCAL_MACRO_R132','windowTitleLock':title,'events':events,'eventCount':len(events),'recordedAt':time.time()};payload['macroSha256']=sha_json(payload);p=macro_path(root,name);p.write_text(json.dumps(payload,indent=2));return {'path':p.relative_to(root).as_posix(),'sha256':sha_bytes(p.read_bytes()),'events':len(events),'contentsReturned':False}
def replay_macro(root,name,title,loops,max_runtime):
    require_windows();p=macro_path(root,name)
    if not p.is_file():raise AgentError('Macro file not found.')
    events=json.loads(p.read_text()).get('events',[]);start=time.time();count=0
    for _ in range(max(1,min(20,int(loops or 1)))):
        prior=0
        for e in events:
            if time.time()-start>max(30,min(1800,int(max_runtime or 300))):raise AgentError('Macro replay exceeded approved runtime budget.')
            assert_window(title);t=float(e.get('t',0));time.sleep(min(2,max(0,t-prior)));prior=t
            if e.get('type')=='MOVE':U().SetCursorPos(int(e['x']),int(e['y']))
            elif e.get('type')=='CLICK':click_mouse(e['x'],e['y'],e.get('button','LEFT'),title)
            elif e.get('type')=='KEY_RAW':ke(e['vk']);ke(e['vk'],False)
            count+=1
    return {'macroPath':p.relative_to(root).as_posix(),'macroSha256':sha_bytes(p.read_bytes()),'eventsExecuted':count,'runtimeSeconds':round(time.time()-start,3)}

def execute_step(step,root):
    op=str(step.get('op','')).upper();path=secure_path(root,step.get('path','.'))
    if op=='INDEX':return index_tree(path)
    if op=='HASH_TREE':return hash_tree(path)
    if op=='READ_TEXT':return read_text(path)
    if op=='SEARCH_TEXT':return search_text(path,str(step.get('query','')),step.get('maxResults',120))
    if op=='APPLY_PATCH':return apply_patch(path,root,step)
    if op=='WRITE_TEXT':return write_text(path,root,step)
    if op in {'BUILD','TEST'}:return run_declared(path,op,step.get('profile','AUTO_BUILD'))
    if op=='PACKAGE':return package_path(path,root)
    if op=='TRAIN_LOCAL':return train_local(path,root)
    if op=='SAFE_IMPORT':return {'classification':'DONOR_QUARANTINED','fingerprint':hash_tree(path),'executed':False}
    if op=='WORKBOOK_AUDIT':return workbook_audit(path,root)
    if op=='SUPPORT_BUNDLE':return package_path(path,root)
    if op=='WAIT':time.sleep(max(.1,min(30,float(step.get('milliseconds',1000))/1000)));return {'waitedMs':step.get('milliseconds',1000)}
    if op=='OPEN_URL':
        import webbrowser
        url=str(step.get('url',''))
        if not url.startswith('https://'):raise AgentError('Only HTTPS URLs are allowed.')
        return {'opened':bool(webbrowser.open(url)),'url':url}
    if op=='LIST_WINDOWS':return list_windows()
    if op=='FOCUS_WINDOW':return focus_window(step.get('windowTitle'))
    if op=='SCREEN_CAPTURE':return screen_capture(root,step.get('windowTitle'))
    if op=='MOUSE_MOVE':return mouse_move(step.get('x',0),step.get('y',0),step.get('windowTitle'))
    if op=='CLICK':return click_mouse(step.get('x',0),step.get('y',0),step.get('button','LEFT'),step.get('windowTitle'))
    if op=='KEY':return send_key(step.get('key'),step.get('windowTitle'))
    if op=='TYPE_TEXT':return type_text(step.get('text',''),step.get('windowTitle'))
    if op=='SCROLL':return scroll_mouse(step.get('delta',-480),step.get('windowTitle'))
    if op=='ASSERT_WINDOW':return assert_window(step.get('windowTitle'))
    if op=='READ_VISIBLE_TEXT':return read_visible_text(step.get('windowTitle'),step.get('maxResults',400))
    if op=='RECORD_MACRO':return record_macro(root,step.get('macroName'),step.get('windowTitle'),step.get('durationSeconds',30))
    if op=='REPLAY_MACRO':return replay_macro(root,step.get('macroName'),step.get('windowTitle'),step.get('loopCount',1),step.get('maxRuntimeSeconds',300))
    raise AgentError('Unsupported operation '+op)
def execute_job(job,root):
    proofs=[];outputs=[];logs=[];ok=True;evaluation=None;promotion=None
    for step in job.get('steps',[])[:24]:
        pr={'id':step.get('id'),'op':step.get('op'),'startedAt':time.time()}
        try:
            r=execute_step(step,root);pr.update({'ok':True,'result':r,'completedAt':time.time()})
            for k in ('path','backupPath','macroPath'):
                if isinstance(r,dict) and r.get(k):outputs.append(r[k])
            if step.get('op')=='TRAIN_LOCAL':evaluation=r.get('evaluation');promotion=r.get('promotion');outputs.append(r.get('indexPath'))
        except Exception as e:ok=False;pr.update({'ok':False,'error':str(e)[:12000],'completedAt':time.time()});logs.append(str(e));proofs.append(pr);break
        proofs.append(pr)
    packet={'jobId':job.get('id'),'ok':ok,'stepProofs':proofs,'outputPaths':[x for x in outputs if x],'log':'\n'.join(logs)[-12000:],'evaluation':evaluation,'promotion':promotion,'capabilityRevision':CAPABILITY_REVISION};packet['resultFingerprint']=sha_json(packet);return packet
def capabilities():
    c=['TRAIN_LOCAL','INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','SAFE_IMPORT','WORKBOOK_AUDIT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT','OPEN_URL','WAIT']
    if os.name=='nt':c+=['LIST_WINDOWS','FOCUS_WINDOW','SCREEN_CAPTURE','MOUSE_MOVE','CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO']
    return c
def main():
    ap=argparse.ArgumentParser(description='OMEGA R34 Hybrid Link local agent');ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True);ap.add_argument('--root',default='.');ap.add_argument('--once',action='store_true');a=ap.parse_args();server=a.server.rstrip('/');bridge_id,secret=parse_pair(a.pair);root=Path(normalize_root_arg(a.root)).expanduser().resolve();root.mkdir(parents=True,exist_ok=True);d=root/'.omega_hybrid';d.mkdir(exist_ok=True);f=d/'device_id.txt';device_id=f.read_text().strip() if f.exists() else 'device_'+uuid.uuid4().hex;f.write_text(device_id);caps=capabilities();payload={'bridgeId':bridge_id,'deviceId':device_id,'name':socket.gethostname(),'platform':platform.platform(),'version':VERSION,'capabilityRevision':CAPABILITY_REVISION,'capabilities':caps,'rootLabel':root.name or root.anchor}
    print('OMEGA Hybrid Link agent',VERSION,'execution',CAPABILITY_REVISION);print('Approved root:',root);print('[1/4] CANONICAL REACHABILITY:',server)
    try:probe_server(server);print('      PASS — /api/health reachable')
    except Exception as e:print('      FAIL —',e,file=sys.stderr);raise SystemExit(21)
    print('[2/4] AUTHENTICATING / REGISTERING DEVICE')
    try:request_json(server,'/api/hybrid/agent/register',payload,bridge_id,secret);print('      PASS — browser credential accepted and device registered')
    except Exception as e:print('      FAIL —',e,file=sys.stderr);raise SystemExit(22)
    print('[3/4] ESTABLISHING AUTHENTICATED HEARTBEAT');failures=0;announced=False
    while True:
        try:
            request_json(server,'/api/hybrid/agent/heartbeat',{'bridgeId':bridge_id,'deviceId':device_id,'version':VERSION,'capabilityRevision':CAPABILITY_REVISION},bridge_id,secret,15)
            if not announced:print('      PASS — authenticated heartbeat returned. Browser may now truthfully show PC ONLINE.');print('[4/4] GOVERNED JOB POLL ACTIVE — keep this window open');announced=True
            failures=0;job=request_json(server,'/api/hybrid/agent/poll',{'bridgeId':bridge_id,'deviceId':device_id},bridge_id,secret,30).get('job')
            if job:
                print('Running approved job',job.get('id'));packet=execute_job(job,root);packet.update({'bridgeId':bridge_id,'deviceId':device_id});request_json(server,'/api/hybrid/agent/result',packet,bridge_id,secret,60);print('Returned proof:',packet['resultFingerprint'])
            if a.once:return
        except KeyboardInterrupt:print('Hybrid Link stopped by user. PC ONLINE will age to HEARTBEAT STALE.');return
        except Exception as e:failures+=1;print(f'[AUTH/HTTP/TRANSPORT ERROR] attempt {failures}: {e}',file=sys.stderr)
        time.sleep(4)
if __name__=='__main__':main()
