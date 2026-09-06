#!/usr/bin/env python3
"""OMEGA R34 transport / R132 execution-plane Hybrid Link agent.

Stdlib-first, root-confined, allow-listed execution. It never exposes arbitrary shell access.
Pairing is explicit. Every claimed native action returns bounded proof to the canonical Worker.
R33 added atomic, preimage-hash-bound text patching with an automatic local backup.
R34 adds explicit canonical reachability, authentication/registration, heartbeat, and transport diagnostics.
R34.1 hardens Windows approved-root parsing for drive-root launcher execution.
R132 fills the previously-missing execution plane: real Windows window discovery/focus, screen proof capture,
mouse/keyboard/type/scroll operations, visible UI Automation text extraction, macro record/replay, hash-bound
file creation/replacement, workbook audit, and richer local retrieval indexing. Transport version remains R34.1
for compatibility; CAPABILITY_REVISION identifies the execution successor.
"""
from __future__ import annotations
import argparse, ctypes, hashlib, json, os, platform, re, socket, subprocess, sys, time, urllib.error, urllib.request, uuid, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

VERSION='R34.1'
CAPABILITY_REVISION='R132'
DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'
TEXT_EXT={'.txt','.md','.json','.jsonc','.js','.jsx','.ts','.tsx','.py','.pyw','.css','.html','.yml','.yaml','.toml','.ini','.cfg','.csv','.bat','.ps1','.cs','.csproj','.sln','.xml'}
SKIP_DIRS={'.git','node_modules','dist','build','.venv','venv','__pycache__','.wrangler','.omega_hybrid'}
MAX_FILES=25000
MAX_FILE_BYTES=8*1024*1024
MAX_PATCH_BYTES=512*1024
MAX_PATCH_REPLACEMENTS=24
MAX_WRITE_BYTES=512*1024
MAX_MACRO_EVENTS=5000

class AgentError(RuntimeError): pass

def sha_bytes(data:bytes): return hashlib.sha256(data).hexdigest()
def sha_json(obj): return sha_bytes(json.dumps(obj,sort_keys=True,separators=(',',':')).encode())
def request_json(server,path,payload,bridge_id,secret,timeout=30):
    data=json.dumps(payload).encode(); req=urllib.request.Request(server.rstrip('/')+path,data=data,method='POST',headers={'content-type':'application/json','x-omega-bridge-id':bridge_id,'x-omega-bridge-secret':secret,'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r: return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw=e.read().decode('utf-8','replace')
        try: detail=json.loads(raw)
        except Exception: detail={'message':raw}
        raise AgentError(f"HTTP {e.code}: {detail.get('reply') or detail.get('message') or detail.get('code') or raw[:300]}")

def probe_server(server,timeout=15):
    req=urllib.request.Request(server.rstrip('/')+'/api/health',method='GET',headers={'user-agent':'OMEGA-Hybrid-Agent/'+VERSION})
    try:
        with urllib.request.urlopen(req,timeout=timeout) as r:
            body=r.read().decode('utf-8','replace')
            if int(getattr(r,'status',200))!=200: raise AgentError(f'Canonical health returned HTTP {getattr(r,"status","unknown")}')
            try: return json.loads(body)
            except Exception: return {'ok':True,'raw':body[:300]}
    except urllib.error.HTTPError as e: raise AgentError(f'Canonical health HTTP {e.code}')
    except urllib.error.URLError as e: raise AgentError(f'Canonical unreachable: {getattr(e,"reason",e)}')
    except TimeoutError: raise AgentError('Canonical health timed out')

def parse_pair(value):
    if '.' not in value: raise AgentError('Pairing code must contain bridge ID and secret.')
    bid,secret=value.split('.',1)
    if not re.fullmatch(r'[A-Za-z0-9._:-]{8,128}',bid) or len(secret)<24: raise AgentError('Invalid pairing code.')
    return bid,secret

def normalize_root_arg(value):
    raw=str(value or '.').strip().strip('"').strip()
    if not raw: return '.'
    raw=raw.rstrip('"').strip()
    if os.name=='nt' and re.fullmatch(r'[A-Za-z]:\\',raw): return raw+'.'
    return raw

def secure_path(root:Path,rel='.'):
    rel=str(rel or '.').replace('\\','/').strip()
    if rel.startswith('/') or re.match(r'^[A-Za-z]:',rel) or '..' in Path(rel).parts: raise AgentError('Path escapes approved root.')
    out=(root/rel).resolve(); rr=root.resolve()
    try: out.relative_to(rr)
    except ValueError: raise AgentError('Path escapes approved root.')
    return out

def iter_files(root:Path):
    count=0
    for base,dirs,files in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            p=Path(base)/name
            try:
                if p.is_symlink() or p.stat().st_size>MAX_FILE_BYTES: continue
            except OSError: continue
            yield p; count+=1
            if count>=MAX_FILES: return

def index_tree(path:Path):
    rows=[]
    for p in iter_files(path):
        rel=p.relative_to(path).as_posix(); rows.append({'path':rel,'bytes':p.stat().st_size,'ext':p.suffix.lower()})
    manifests=[x for x in rows if Path(x['path']).name.lower() in {'package.json','pyproject.toml','requirements.txt','setup.py','pom.xml','build.gradle','cargo.toml'} or x['path'].endswith(('.sln','.csproj'))]
    return {'files':len(rows),'manifests':manifests[:80],'sample':rows[:120]}

def hash_tree(path:Path):
    h=hashlib.sha256(); rows=[]
    for p in sorted(iter_files(path),key=lambda x:x.as_posix().lower()):
        rel=p.relative_to(path).as_posix(); digest=sha_bytes(p.read_bytes()); h.update(rel.encode());h.update(digest.encode());rows.append({'path':rel,'sha256':digest,'bytes':p.stat().st_size})
    return {'treeSha256':h.hexdigest(),'files':len(rows),'sample':rows[:120]}

def read_text(path:Path):
    if not path.is_file(): raise AgentError('READ_TEXT requires a file.')
    if path.stat().st_size>MAX_FILE_BYTES: raise AgentError('File exceeds bounded text-read size.')
    data=path.read_bytes(); return {'path':path.name,'sha256':sha_bytes(data),'bytes':len(data),'text':data.decode('utf-8','replace')[:120000]}

def search_text(path:Path,query:str,max_results=120):
    terms=[x.lower() for x in re.findall(r'[A-Za-z0-9_.-]{2,}',query or '')][:12]
    if not terms: raise AgentError('SEARCH_TEXT requires literal terms.')
    out=[]
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT: continue
        try: content=p.read_text('utf-8','replace')
        except Exception: continue
        low=content.lower()
        if not any(t in low for t in terms): continue
        for i,line in enumerate(content.splitlines(),1):
            if any(t in line.lower() for t in terms):
                out.append({'path':p.relative_to(path).as_posix(),'line':i,'text':line[:500]})
                if len(out)>=int(max_results or 120): return {'query':query,'matches':out}
    return {'query':query,'matches':out}

def command_for(path:Path,op:str,profile:str):
    profile=(profile or 'AUTO_BUILD').upper()
    if profile=='AUTO_BUILD':
        if (path/'package.json').exists():
            pkg=json.loads((path/'package.json').read_text('utf-8')); scripts=pkg.get('scripts',{})
            if op=='BUILD': return ['npm','run','build'] if 'build' in scripts else None
            for s in ('check','test'):
                if s in scripts:return ['npm','run',s]
        if (path/'pyproject.toml').exists() or (path/'requirements.txt').exists(): return [sys.executable,'-m','pytest','-q'] if op=='TEST' else None
        sln=next(path.glob('*.sln'),None); csproj=next(path.glob('*.csproj'),None)
        if sln or csproj:return ['dotnet','test' if op=='TEST' else 'build',str((sln or csproj).name)]
        return None
    if profile=='NODE_BUILD': return ['npm','run','build' if op=='BUILD' else 'check']
    if profile=='PYTHON_TEST': return [sys.executable,'-m','pytest','-q'] if op=='TEST' else None
    if profile=='DOTNET_BUILD': return ['dotnet','test' if op=='TEST' else 'build']
    return None

def run_declared(path:Path,op:str,profile:str):
    cmd=command_for(path,op,profile)
    if not cmd: raise AgentError(f'No declared {op.lower()} command discovered for {profile}.')
    p=subprocess.run(cmd,cwd=path,text=True,capture_output=True,timeout=900,shell=False)
    result={'command':cmd,'exitCode':p.returncode,'stdout':p.stdout[-18000:],'stderr':p.stderr[-12000:]}
    if p.returncode: raise AgentError(json.dumps(result))
    return result

def package_path(path:Path,root:Path):
    outdir=root/'.omega_hybrid'/'packages';outdir.mkdir(parents=True,exist_ok=True)
    out=outdir/(path.name+'_'+time.strftime('%Y%m%d_%H%M%S')+'.zip')
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in iter_files(path): z.write(p,p.relative_to(path).as_posix())
    return {'path':out.relative_to(root).as_posix(),'sha256':sha_bytes(out.read_bytes()),'bytes':out.stat().st_size}

def _backup_existing(path:Path,root:Path):
    rel=path.relative_to(root); backup=root/'.omega_hybrid'/'backups'/(time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:8])/rel
    backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(path.read_bytes());return backup

def apply_patch(path:Path,root:Path,step:dict):
    if not path.is_file() or path.is_symlink(): raise AgentError('APPLY_PATCH requires a regular text file inside the approved root.')
    if path.suffix.lower() not in TEXT_EXT: raise AgentError('APPLY_PATCH is limited to allow-listed text/source extensions.')
    raw=path.read_bytes()
    if len(raw)>MAX_PATCH_BYTES: raise AgentError('APPLY_PATCH file exceeds the 512 KiB bounded patch limit.')
    expected=str(step.get('expectedSha256','')).lower()
    if not re.fullmatch(r'[0-9a-f]{64}',expected): raise AgentError('APPLY_PATCH requires expectedSha256 from a prior READ_TEXT/HASH proof.')
    before=sha_bytes(raw)
    if before!=expected: raise AgentError(f'APPLY_PATCH preimage mismatch: expected {expected}, observed {before}.')
    try: source=raw.decode('utf-8')
    except UnicodeDecodeError: raise AgentError('APPLY_PATCH requires valid UTF-8 source.')
    replacements=step.get('replacements')
    if not isinstance(replacements,list) or not 1<=len(replacements)<=MAX_PATCH_REPLACEMENTS: raise AgentError('APPLY_PATCH requires 1-24 exact replacements.')
    changed=source; applied=[]
    for idx,row in enumerate(replacements,1):
        if not isinstance(row,dict): raise AgentError(f'APPLY_PATCH replacement {idx} is invalid.')
        find=row.get('find'); replace=row.get('replace'); occurrences=int(row.get('occurrences',1))
        if not isinstance(find,str) or not find: raise AgentError(f'APPLY_PATCH replacement {idx} requires non-empty find text.')
        if not isinstance(replace,str): raise AgentError(f'APPLY_PATCH replacement {idx} requires replacement text.')
        if len(find.encode())+len(replace.encode())>128*1024: raise AgentError(f'APPLY_PATCH replacement {idx} exceeds bounded size.')
        observed=changed.count(find)
        if observed!=occurrences: raise AgentError(f'APPLY_PATCH replacement {idx} expected {occurrences} exact match(es), observed {observed}.')
        changed=changed.replace(find,replace,occurrences); applied.append({'index':idx,'occurrences':occurrences})
    after_bytes=changed.encode('utf-8')
    if after_bytes==raw: raise AgentError('APPLY_PATCH produced no change.')
    backup=_backup_existing(path,root);tmp=path.with_name(path.name+'.omega_patch_'+uuid.uuid4().hex+'.tmp')
    try: tmp.write_bytes(after_bytes);os.replace(tmp,path)
    finally:
        try:
            if tmp.exists(): tmp.unlink()
        except OSError: pass
    return {'path':path.relative_to(root).as_posix(),'beforeSha256':before,'afterSha256':sha_bytes(after_bytes),'backupPath':backup.relative_to(root).as_posix(),'replacementsApplied':applied,'atomic':True}

def write_text(path:Path,root:Path,step:dict):
    if path.suffix.lower() not in TEXT_EXT: raise AgentError('WRITE_TEXT is limited to allow-listed text/source extensions.')
    content=step.get('content')
    if not isinstance(content,str): raise AgentError('WRITE_TEXT requires UTF-8 text content.')
    data=content.encode('utf-8')
    if len(data)>MAX_WRITE_BYTES: raise AgentError('WRITE_TEXT exceeds the 512 KiB bounded write limit.')
    create_only=bool(step.get('createOnly'))
    before=None;backup=None
    if path.exists():
        if create_only: raise AgentError('WRITE_TEXT createOnly target already exists.')
        if not path.is_file() or path.is_symlink(): raise AgentError('WRITE_TEXT replacement requires a regular file.')
        raw=path.read_bytes();before=sha_bytes(raw);expected=str(step.get('expectedSha256','')).lower()
        if not re.fullmatch(r'[0-9a-f]{64}',expected): raise AgentError('WRITE_TEXT replacement requires expectedSha256 from prior host proof.')
        if before!=expected: raise AgentError(f'WRITE_TEXT preimage mismatch: expected {expected}, observed {before}.')
        backup=_backup_existing(path,root)
    elif not create_only:
        raise AgentError('WRITE_TEXT new-file creation requires createOnly=true.')
    path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_name(path.name+'.omega_write_'+uuid.uuid4().hex+'.tmp')
    try: tmp.write_bytes(data);os.replace(tmp,path)
    finally:
        try:
            if tmp.exists():tmp.unlink()
        except OSError:pass
    result={'path':path.relative_to(root).as_posix(),'beforeSha256':before,'afterSha256':sha_bytes(data),'bytes':len(data),'atomic':True,'created':before is None}
    if backup:result['backupPath']=backup.relative_to(root).as_posix()
    return result

def workbook_audit(path:Path,root:Path):
    if not path.is_file() or path.suffix.lower() not in {'.xlsx','.xlsm'}: raise AgentError('WORKBOOK_AUDIT requires an .xlsx or .xlsm file.')
    if path.stat().st_size>64*1024*1024: raise AgentError('Workbook exceeds bounded audit size.')
    with zipfile.ZipFile(path,'r') as z:
        names=set(z.namelist());sheets=[];defined=[]
        if 'xl/workbook.xml' in names:
            tree=ET.fromstring(z.read('xl/workbook.xml'));ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            sheets=[x.attrib.get('name','') for x in tree.findall('.//m:sheets/m:sheet',ns)][:200]
            defined=[(x.attrib.get('name',''),(x.text or '')[:500]) for x in tree.findall('.//m:definedNames/m:definedName',ns)][:200]
        formula_count=0;cell_count=0
        for name in sorted(n for n in names if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'))[:200]:
            raw=z.read(name);formula_count+=raw.count(b'<f');cell_count+=raw.count(b'<c')
        macros='xl/vbaProject.bin' in names
    data=path.read_bytes()
    return {'path':path.relative_to(root).as_posix(),'sha256':sha_bytes(data),'bytes':len(data),'sheets':sheets,'sheetCount':len(sheets),'definedNames':defined,'formulaCount':formula_count,'cellCountApprox':cell_count,'hasVbaProject':macros,'executedMacros':False}

def train_local(path:Path,root:Path):
    docs=[];freq={};chunks=[];digest_paths={};manifests=[]
    for p in iter_files(path):
        if p.suffix.lower() not in TEXT_EXT: continue
        try: txt=p.read_text('utf-8','replace')[:600000]
        except Exception: continue
        words=re.findall(r'[A-Za-z][A-Za-z0-9_-]{2,}',txt.lower())
        if not words: continue
        digest=sha_bytes(txt.encode());rel=p.relative_to(path).as_posix();docs.append({'path':rel,'sha256':digest,'tokens':len(words)});digest_paths.setdefault(digest,[]).append(rel)
        if p.name.lower() in {'package.json','pyproject.toml','requirements.txt','setup.py','pom.xml','build.gradle','cargo.toml'} or p.suffix.lower() in {'.sln','.csproj'}:manifests.append(rel)
        for w in set(words):freq[w]=freq.get(w,0)+1
        lines=txt.splitlines()
        for start in range(0,len(lines),80):
            block='\n'.join(lines[start:start+80]).strip()
            if block:chunks.append({'path':rel,'startLine':start+1,'endLine':min(len(lines),start+80),'sha256':sha_bytes(block.encode()),'preview':block[:800]})
            if len(chunks)>=50000:break
        if len(chunks)>=50000:break
    terms=sorted(freq.items(),key=lambda x:(-x[1],x[0]))[:6000];duplicates=[{'sha256':d,'paths':ps} for d,ps in digest_paths.items() if len(ps)>1][:1000]
    payload={'schema':'OMEGA_SAI_LOCAL_RETRIEVAL_INDEX_R132','createdAt':time.time(),'root':path.relative_to(root).as_posix() if path!=root else '.','documents':docs[:25000],'documentCount':len(docs),'chunks':chunks,'chunkCount':len(chunks),'termDocumentFrequency':terms,'duplicateGroups':duplicates,'manifestPaths':manifests[:500],'foundationWeightsChanged':False,'learningType':'LOCAL_RETRIEVAL_AND_PROOF_PRIOR_INDEX'}
    payload['indexSha256']=sha_json(payload);d=root/'.omega_hybrid';d.mkdir(parents=True,exist_ok=True);out=d/'sai_index_r132.json';out.write_text(json.dumps(payload,indent=2),'utf-8')
    eval_status='PASS' if len(docs)>0 and len(chunks)>0 else 'HOLD_NO_DOCUMENTS'
    return {'indexPath':out.relative_to(root).as_posix(),'indexSha256':payload['indexSha256'],'documents':len(docs),'chunks':len(chunks),'duplicates':len(duplicates),'manifests':len(manifests),'evaluation':{'status':eval_status},'promotion':{'status':'ACTIVE_LOCAL_RETRIEVAL_INDEX' if eval_status=='PASS' else 'HELD'},'foundationWeightsChanged':False,'learningType':payload['learningType']}

# --------------------------- Windows desktop adapter ---------------------------
def require_windows():
    if os.name!='nt': raise AgentError('This desktop automation operation requires Windows.')

def _user32(): require_windows();return ctypes.windll.user32

def list_windows():
    require_windows();u=_user32();rows=[];EnumProc=ctypes.WINFUNCTYPE(ctypes.c_bool,ctypes.c_void_p,ctypes.c_void_p)
    @EnumProc
    def cb(hwnd,lparam):
        if not u.IsWindowVisible(hwnd):return True
        n=u.GetWindowTextLengthW(hwnd)
        if n<=0:return True
        buf=ctypes.create_unicode_buffer(n+1);u.GetWindowTextW(hwnd,buf,n+1);title=buf.value.strip()
        if title:rows.append({'hwnd':int(hwnd),'title':title[:240]})
        return len(rows)<160
    u.EnumWindows(cb,0);return {'windows':rows[:160],'count':len(rows)}

def find_window(title):
    needle=str(title or '').strip().lower()
    if not needle:raise AgentError('Window-title lock is required.')
    rows=list_windows()['windows'];matches=[r for r in rows if needle in r['title'].lower()]
    if not matches:raise AgentError(f'No visible window matched title lock: {title}')
    return matches[0]

def foreground_window():
    require_windows();u=_user32();hwnd=u.GetForegroundWindow();n=u.GetWindowTextLengthW(hwnd);buf=ctypes.create_unicode_buffer(max(1,n+1));u.GetWindowTextW(hwnd,buf,max(1,n+1));return {'hwnd':int(hwnd),'title':buf.value}

def assert_window(title):
    row=foreground_window();needle=str(title or '').strip().lower()
    if not needle or needle not in row['title'].lower():raise AgentError(f'Foreground window mismatch: required {title!r}, observed {row["title"]!r}.')
    return {'matched':True,**row}

def focus_window(title):
    row=find_window(title);u=_user32();u.ShowWindow(row['hwnd'],5);ok=bool(u.SetForegroundWindow(row['hwnd']));time.sleep(.2);verified=assert_window(title);return {'focused':ok,**verified}

def window_rect(hwnd):
    require_windows()
    class RECT(ctypes.Structure):_fields_=[('left',ctypes.c_long),('top',ctypes.c_long),('right',ctypes.c_long),('bottom',ctypes.c_long)]
    r=RECT()
    if not _user32().GetWindowRect(hwnd,ctypes.byref(r)):raise AgentError('Could not read window bounds.')
    return {'left':r.left,'top':r.top,'width':max(1,r.right-r.left),'height':max(1,r.bottom-r.top)}

def screen_capture(root:Path,title):
    row=assert_window(title);rect=window_rect(row['hwnd']);outdir=root/'.omega_hybrid'/'screens';outdir.mkdir(parents=True,exist_ok=True);out=outdir/(time.strftime('%Y%m%d_%H%M%S')+'_'+uuid.uuid4().hex[:8]+'.png')
    script="$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Drawing;$x=[int]$args[0];$y=[int]$args[1];$w=[int]$args[2];$h=[int]$args[3];$p=$args[4];$bmp=New-Object System.Drawing.Bitmap $w,$h;$g=[System.Drawing.Graphics]::FromImage($bmp);$g.CopyFromScreen($x,$y,0,0,$bmp.Size);$bmp.Save($p,[System.Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$bmp.Dispose()"
    p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',script,str(rect['left']),str(rect['top']),str(rect['width']),str(rect['height']),str(out)],text=True,capture_output=True,timeout=30,shell=False)
    if p.returncode or not out.exists():raise AgentError('SCREEN_CAPTURE failed: '+(p.stderr or p.stdout)[-1500:])
    data=out.read_bytes();return {'path':out.relative_to(root).as_posix(),'sha256':sha_bytes(data),'bytes':len(data),'windowTitle':row['title'],'bounds':rect,'localOnly':True}

def read_visible_text(title,max_results=400):
    row=assert_window(title);limit=max(1,min(1000,int(max_results or 400)))
    script="$ErrorActionPreference='Stop';Add-Type -AssemblyName UIAutomationClient;Add-Type -AssemblyName UIAutomationTypes;$h=[intptr]::new([int64]$args[0]);$limit=[int]$args[1];$root=[System.Windows.Automation.AutomationElement]::FromHandle($h);$cond=[System.Windows.Automation.Condition]::TrueCondition;$items=$root.FindAll([System.Windows.Automation.TreeScope]::Descendants,$cond);$out=@();for($i=0;$i -lt $items.Count -and $out.Count -lt $limit;$i++){try{$n=$items.Item($i).Current.Name;if($n){$out += [pscustomobject]@{name=$n;control=$items.Item($i).Current.ControlType.ProgrammaticName}}}catch{}};$out|ConvertTo-Json -Compress"
    p=subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',script,str(row['hwnd']),str(limit)],text=True,capture_output=True,timeout=30,shell=False)
    if p.returncode:raise AgentError('READ_VISIBLE_TEXT UI Automation failed: '+p.stderr[-1500:])
    raw=p.stdout.strip()
    if not raw:return {'windowTitle':row['title'],'items':[],'count':0,'method':'WINDOWS_UI_AUTOMATION'}
    try:data=json.loads(raw)
    except Exception:raise AgentError('READ_VISIBLE_TEXT returned invalid UI Automation JSON.')
    if isinstance(data,dict):data=[data]
    return {'windowTitle':row['title'],'items':data[:limit],'count':len(data[:limit]),'method':'WINDOWS_UI_AUTOMATION'}

def mouse_move(x,y,title):
    assert_window(title);ok=bool(_user32().SetCursorPos(int(x),int(y)));return {'moved':ok,'x':int(x),'y':int(y)}

def click_mouse(x,y,button,title):
    assert_window(title);u=_user32();u.SetCursorPos(int(x),int(y));right=str(button).upper()=='RIGHT';down=0x0008 if right else 0x0002;up=0x0010 if right else 0x0004;u.mouse_event(down,0,0,0,0);u.mouse_event(up,0,0,0,0);return {'clicked':True,'x':int(x),'y':int(y),'button':'RIGHT' if right else 'LEFT'}

VK={'ENTER':0x0D,'TAB':0x09,'ESC':0x1B,'ESCAPE':0x1B,'BACKSPACE':0x08,'DELETE':0x2E,'HOME':0x24,'END':0x23,'PAGEUP':0x21,'PAGEDOWN':0x22,'UP':0x26,'DOWN':0x28,'LEFT':0x25,'RIGHT':0x27,'SPACE':0x20,'CTRL':0x11,'ALT':0x12,'SHIFT':0x10,'LWIN':0x5B}
for i in range(1,13):VK['F'+str(i)]=0x6F+i
for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':VK[c]=ord(c)
for d in '0123456789':VK[d]=ord(d)

def _key_event(vk,down=True):_user32().keybd_event(int(vk),0,0 if down else 0x0002,0)
def send_key(name,title):
    assert_window(title);parts=str(name or '').upper().split('+');mods=[]
    for p in parts[:-1]:
        if p not in VK:raise AgentError('Unsupported modifier '+p)
        mods.append(VK[p]);_key_event(VK[p],True)
    key=parts[-1]
    if key not in VK:raise AgentError('Unsupported key '+key)
    _key_event(VK[key],True);_key_event(VK[key],False)
    for vk in reversed(mods):_key_event(vk,False)
    return {'key':name,'sent':True}

def type_text(value,title):
    assert_window(title);u=_user32();sent=0
    for ch in str(value):
        code=u.VkKeyScanW(ord(ch))
        if code==-1:raise AgentError(f'TYPE_TEXT cannot safely map character U+{ord(ch):04X} with the active keyboard layout.')
        vk=code&0xff;shift=(code>>8)&0xff
        if shift&1:_key_event(VK['SHIFT'],True)
        if shift&2:_key_event(VK['CTRL'],True)
        if shift&4:_key_event(VK['ALT'],True)
        _key_event(vk,True);_key_event(vk,False)
        if shift&4:_key_event(VK['ALT'],False)
        if shift&2:_key_event(VK['CTRL'],False)
        if shift&1:_key_event(VK['SHIFT'],False)
        sent+=1
    return {'typedCharacters':sent,'textSha256':sha_bytes(str(value).encode()),'plaintextReturned':False}

def scroll_mouse(delta,title):
    assert_window(title);_user32().mouse_event(0x0800,0,0,int(delta),0);return {'scrolled':int(delta)}

def _macro_path(root,name):
    safe=re.sub(r'[^A-Za-z0-9._-]','_',str(name or ''))[:64]
    if not safe:raise AgentError('Macro name is required.')
    d=root/'.omega_hybrid'/'macros';d.mkdir(parents=True,exist_ok=True);return d/(safe+'.json')

def record_macro(root,name,title,duration):
    require_windows();assert_window(title);u=_user32();duration=max(5,min(300,int(duration or 30)));start=time.time();events=[];last_pos=None;last_buttons={1:False,2:False};key_state={vk:False for vk in range(8,256)}
    class POINT(ctypes.Structure):_fields_=[('x',ctypes.c_long),('y',ctypes.c_long)]
    while time.time()-start<duration and len(events)<MAX_MACRO_EVENTS:
        assert_window(title);t=round(time.time()-start,4);pt=POINT();u.GetCursorPos(ctypes.byref(pt));pos=(int(pt.x),int(pt.y))
        if last_pos is None or abs(pos[0]-last_pos[0])+abs(pos[1]-last_pos[1])>=4:events.append({'t':t,'type':'MOVE','x':pos[0],'y':pos[1]});last_pos=pos
        for vk,button in [(1,'LEFT'),(2,'RIGHT')]:
            down=bool(u.GetAsyncKeyState(vk)&0x8000)
            if last_buttons[vk] and not down:events.append({'t':t,'type':'CLICK','x':pos[0],'y':pos[1],'button':button})
            last_buttons[vk]=down
        for vk in range(8,256):
            if vk in (1,2):continue
            down=bool(u.GetAsyncKeyState(vk)&0x8000)
            if down and not key_state[vk]:events.append({'t':t,'type':'KEY_RAW','vk':vk})
            key_state[vk]=down
        time.sleep(.025)
    payload={'schema':'OMEGA_LOCAL_MACRO_R132','recordedAt':time.time(),'windowTitleLock':title,'durationSeconds':round(time.time()-start,3),'events':events,'eventCount':len(events),'sensitiveCaptureWarning':'Macro recording captures local keyboard/mouse events while the locked window is foreground. Macro contents remain inside the approved root.'}
    payload['macroSha256']=sha_json(payload);path=_macro_path(root,name);path.write_text(json.dumps(payload,indent=2),'utf-8');return {'path':path.relative_to(root).as_posix(),'sha256':sha_bytes(path.read_bytes()),'macroSha256':payload['macroSha256'],'events':len(events),'durationSeconds':payload['durationSeconds'],'contentsReturned':False}

def replay_macro(root,name,title,loops,max_runtime):
    require_windows();path=_macro_path(root,name)
    if not path.is_file():raise AgentError('Macro file not found.')
    payload=json.loads(path.read_text('utf-8'));events=payload.get('events',[])
    if not isinstance(events,list) or len(events)>MAX_MACRO_EVENTS:raise AgentError('Macro is invalid or exceeds event budget.')
    loops=max(1,min(20,int(loops or 1)));max_runtime=max(30,min(1800,int(max_runtime or 300)));started=time.time();executed=0
    for _ in range(loops):
        prior=0.0
        for e in events:
            if time.time()-started>max_runtime:raise AgentError('Macro replay exceeded approved runtime budget.')
            assert_window(title);t=max(0,float(e.get('t',0)));time.sleep(min(2,max(0,t-prior)));prior=t;typ=e.get('type')
            if typ=='MOVE':_user32().SetCursorPos(int(e.get('x',0)),int(e.get('y',0)))
            elif typ=='CLICK':click_mouse(int(e.get('x',0)),int(e.get('y',0)),e.get('button','LEFT'),title)
            elif typ=='KEY_RAW':vk=int(e.get('vk',0));_key_event(vk,True);_key_event(vk,False)
            else:raise AgentError('Unsupported macro event type '+str(typ))
            executed+=1
    return {'macroPath':path.relative_to(root).as_posix(),'macroSha256':sha_bytes(path.read_bytes()),'loops':loops,'eventsExecuted':executed,'runtimeSeconds':round(time.time()-started,3)}

def execute_step(step,root:Path):
    op=str(step.get('op','')).upper(); path=secure_path(root,step.get('path','.'))
    if op=='INDEX': return index_tree(path)
    if op=='HASH_TREE': return hash_tree(path)
    if op=='READ_TEXT': return read_text(path)
    if op=='SEARCH_TEXT': return search_text(path,str(step.get('query','')),int(step.get('maxResults',120)))
    if op=='APPLY_PATCH': return apply_patch(path,root,step)
    if op=='WRITE_TEXT': return write_text(path,root,step)
    if op in {'BUILD','TEST'}: return run_declared(path,op,str(step.get('profile','AUTO_BUILD')))
    if op=='PACKAGE': return package_path(path,root)
    if op=='TRAIN_LOCAL': return train_local(path,root)
    if op=='SAFE_IMPORT': return {'classification':'DONOR_QUARANTINED','fingerprint':hash_tree(path),'executed':False}
    if op=='WORKBOOK_AUDIT': return workbook_audit(path,root)
    if op=='SUPPORT_BUNDLE': return package_path(path,root)
    if op=='WAIT': time.sleep(max(.1,min(30,float(step.get('milliseconds',1000))/1000)));return {'waitedMs':step.get('milliseconds',1000)}
    if op=='OPEN_URL':
        import webbrowser
        url=str(step.get('url',''))
        if not url.startswith('https://'): raise AgentError('Only HTTPS URLs are allowed.')
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

def execute_job(job,root:Path):
    proofs=[];outputs=[];logs=[];ok=True;evaluation=None;promotion=None
    for step in job.get('steps',[])[:24]:
        started=time.time();proof={'id':step.get('id'),'op':step.get('op'),'startedAt':started}
        try:
            result=execute_step(step,root);proof.update({'ok':True,'result':result,'completedAt':time.time()})
            if isinstance(result,dict) and result.get('path'):outputs.append(result['path'])
            if isinstance(result,dict) and result.get('backupPath'):outputs.append(result['backupPath'])
            if isinstance(result,dict) and result.get('macroPath'):outputs.append(result['macroPath'])
            if step.get('op')=='TRAIN_LOCAL':evaluation=result.get('evaluation');promotion=result.get('promotion');outputs.append(result.get('indexPath'))
        except Exception as e:
            ok=False;proof.update({'ok':False,'error':str(e)[:12000],'completedAt':time.time()});logs.append(str(e));proofs.append(proof);break
        proofs.append(proof)
    packet={'jobId':job.get('id'),'ok':ok,'stepProofs':proofs,'outputPaths':[x for x in outputs if x],'log':'\n'.join(logs)[-12000:],'evaluation':evaluation,'promotion':promotion,'capabilityRevision':CAPABILITY_REVISION}
    packet['resultFingerprint']=sha_json(packet)
    return packet

def capabilities():
    base=['TRAIN_LOCAL','INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','SAFE_IMPORT','WORKBOOK_AUDIT','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT','OPEN_URL','WAIT']
    if os.name=='nt':base+=['LIST_WINDOWS','FOCUS_WINDOW','SCREEN_CAPTURE','MOUSE_MOVE','CLICK','KEY','TYPE_TEXT','SCROLL','ASSERT_WINDOW','READ_VISIBLE_TEXT','RECORD_MACRO','REPLAY_MACRO']
    return base

def main():
    ap=argparse.ArgumentParser(description='OMEGA R34 Hybrid Link local agent with R132 execution plane')
    ap.add_argument('--server',default=DEFAULT_SERVER);ap.add_argument('--pair',required=True,help='pairing code from OMEGA Hybrid Link')
    ap.add_argument('--root',default='.',help='approved local root; all file/process work stays inside it')
    ap.add_argument('--once',action='store_true',help='poll once, then exit')
    args=ap.parse_args();server=args.server.rstrip('/');bridge_id,secret=parse_pair(args.pair);root=Path(normalize_root_arg(args.root)).expanduser().resolve();root.mkdir(parents=True,exist_ok=True)
    state_dir=root/'.omega_hybrid';state_dir.mkdir(exist_ok=True);id_file=state_dir/'device_id.txt'
    device_id=id_file.read_text().strip() if id_file.exists() else 'device_'+uuid.uuid4().hex
    id_file.write_text(device_id)
    caps=capabilities()
    payload={'bridgeId':bridge_id,'deviceId':device_id,'name':socket.gethostname(),'platform':platform.platform(),'version':VERSION,'capabilityRevision':CAPABILITY_REVISION,'capabilities':caps,'rootLabel':root.name or root.anchor}
    print('OMEGA Hybrid Link agent',VERSION,'execution',CAPABILITY_REVISION)
    print('Approved root:',root)
    print('Native capabilities:',', '.join(caps))
    print('[1/4] CANONICAL REACHABILITY:',server)
    try:
        probe_server(server);print('      PASS — /api/health reachable')
    except Exception as e:
        print('      FAIL —',e,file=sys.stderr);print('      Check internet, DNS, firewall, or canonical runtime availability. No PC ONLINE claim was made.',file=sys.stderr);raise SystemExit(21)
    print('[2/4] AUTHENTICATING / REGISTERING DEVICE')
    try:
        request_json(server,'/api/hybrid/agent/register',payload,bridge_id,secret);print('      PASS — browser credential accepted and device registered')
    except Exception as e:
        print('      FAIL —',e,file=sys.stderr);print('      Pairing may be expired/rotated, or the Worker rejected authentication. Rotate pairing and retry.',file=sys.stderr);raise SystemExit(22)
    print('[3/4] ESTABLISHING AUTHENTICATED HEARTBEAT')
    failures=0;announced_online=False
    while True:
        try:
            request_json(server,'/api/hybrid/agent/heartbeat',{'bridgeId':bridge_id,'deviceId':device_id,'version':VERSION,'capabilityRevision':CAPABILITY_REVISION},bridge_id,secret,15)
            if not announced_online:
                print('      PASS — authenticated heartbeat returned. Browser may now truthfully show PC ONLINE.');print('[4/4] GOVERNED JOB POLL ACTIVE — keep this window open');announced_online=True
            failures=0
            polled=request_json(server,'/api/hybrid/agent/poll',{'bridgeId':bridge_id,'deviceId':device_id},bridge_id,secret,30);job=polled.get('job')
            if job:
                print('Running approved job',job.get('id'));packet=execute_job(job,root);packet.update({'bridgeId':bridge_id,'deviceId':device_id});request_json(server,'/api/hybrid/agent/result',packet,bridge_id,secret,60);print('Returned proof:',packet['resultFingerprint'])
            if args.once:return
        except KeyboardInterrupt:
            print('Hybrid Link stopped by user. PC ONLINE will age to HEARTBEAT STALE.');return
        except Exception as e:
            failures+=1;label='AUTH/HTTP/TRANSPORT ERROR' if failures<3 else 'HEARTBEAT STALE RISK';print(f'[{label}] attempt {failures}: {e}',file=sys.stderr)
            if failures==3: print('Three consecutive authenticated cycles failed. The browser must not treat this host as currently online.',file=sys.stderr)
        time.sleep(4)

if __name__=='__main__': main()
