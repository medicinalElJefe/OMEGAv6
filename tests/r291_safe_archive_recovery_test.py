from __future__ import annotations
import hashlib,importlib.util,pathlib,stat,tempfile,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1];PATH=ROOT/'native'/'r291_recovery'/'safe_archive.py'
spec=importlib.util.spec_from_file_location('safe_archive_r291',PATH);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def must_fail(fn,contains):
    try:fn()
    except Exception as exc:
        assert contains.lower() in str(exc).lower(),(contains,str(exc));return
    raise AssertionError('expected failure: '+contains)

with tempfile.TemporaryDirectory() as td:
    td=pathlib.Path(td)
    # exact multipart reconstruction
    payload=b'OMEGA-R291-SAFE-RECOVERY-'*4096; names=[]
    for i,chunk in enumerate((payload[:30000],payload[30000:]),1):
        name=f'part{i:02d}.bin';(td/name).write_bytes(chunk);names.append(name)
    expected=hashlib.sha256(payload).hexdigest();master=m.reconstruct_parts(td,names,td/'master.zip',len(payload),expected)
    assert master.read_bytes()==payload
    assert m.recovery_receipt(master,expected)['hashMatch'] is True
    must_fail(lambda:m.reconstruct_parts(td,['part01.bin','missing.bin'],td/'bad.bin',1,'0'*64),'missing partition')
    # safe archive success
    good=td/'good.zip'
    with zipfile.ZipFile(good,'w') as z:z.writestr('package/readme.txt','ok');z.writestr('package/data/a.txt','a')
    root=m.safe_extract(good,td/'good_out');assert (root/'readme.txt').read_text()=='ok'
    # traversal
    traversal=td/'traversal.zip'
    with zipfile.ZipFile(traversal,'w') as z:z.writestr('../escape.txt','bad')
    must_fail(lambda:m.safe_extract(traversal,td/'traversal_out'),'traversal')
    # absolute path
    absolute=td/'absolute.zip'
    with zipfile.ZipFile(absolute,'w') as z:z.writestr('/escape.txt','bad')
    must_fail(lambda:m.safe_extract(absolute,td/'absolute_out'),'absolute')
    # duplicate normalized case-insensitive member
    dup=td/'dup.zip'
    with zipfile.ZipFile(dup,'w') as z:z.writestr('root/A.txt','1');z.writestr('root/a.txt','2')
    must_fail(lambda:m.safe_extract(dup,td/'dup_out'),'duplicate normalized')
    # file/directory collision
    collision=td/'collision.zip'
    with zipfile.ZipFile(collision,'w') as z:z.writestr('root/node','file');z.writestr('root/node/child.txt','child')
    must_fail(lambda:m.safe_extract(collision,td/'collision_out'),'collision')
    # symlink rejection
    symlink=td/'symlink.zip'
    info=zipfile.ZipInfo('root/link');info.create_system=3;info.external_attr=(stat.S_IFLNK|0o777)<<16
    with zipfile.ZipFile(symlink,'w') as z:z.writestr(info,'target')
    must_fail(lambda:m.safe_extract(symlink,td/'symlink_out'),'symlink')

print('R291 SAFE ARCHIVE PASS · exact multipart hash/size reconstruction · traversal/absolute/symlink/duplicate/collision rejection · recovery receipt')
