from __future__ import annotations
import argparse,hashlib,json,platform,sys,time
from pathlib import Path

EXPECTED_RENDERER_SHA256='f014b33ac8cc2abe1c292920084b318869cbd2bd56c71a695a01a482ad076101'
TRUTH_BOUNDARY='A static source/shader PASS is not live GPU proof. ONLINE/RENDERED may be emitted only after the exact renderer hash opens a real OpenGL context, compiles its programs, renders a framebuffer, and returns a capture hash on the sovereign host.'

def sha256(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for c in iter(lambda:f.read(1024*1024),b''):h.update(c)
    return h.hexdigest()

def probe(renderer_path:Path,attempt_live:bool=False)->dict:
    renderer_path=renderer_path.resolve();source_hash=sha256(renderer_path) if renderer_path.is_file() else 'ABSENT'
    receipt={'schema':'OMEGA_NATIVE_GPU_DEVICE_PROOF_R291','time':time.time(),'platform':platform.platform(),'python':sys.version.split()[0],'renderer':str(renderer_path),'rendererSha256':source_hash,'expectedRendererSha256':EXPECTED_RENDERER_SHA256,'sourceMatch':source_hash==EXPECTED_RENDERER_SHA256,'state':'SOURCE_MISSING' if source_hash=='ABSENT' else 'SOURCE_VERIFIED' if source_hash==EXPECTED_RENDERER_SHA256 else 'SOURCE_MISMATCH','liveAttempted':False,'context':None,'programsCompiled':False,'frameRendered':False,'captureSha256':None,'truthBoundary':TRUTH_BOUNDARY}
    if not attempt_live or not receipt['sourceMatch']:return receipt
    receipt['liveAttempted']=True
    try:
        import moderngl
        ctx=moderngl.create_standalone_context(require=330);receipt['context']={'versionCode':ctx.version_code,'info':{k:str(v) for k,v in ctx.info.items() if k in {'GL_VENDOR','GL_RENDERER','GL_VERSION'}}}
        vs='#version 330\nin vec2 in_pos;void main(){gl_Position=vec4(in_pos,0.0,1.0);}'
        fs='#version 330\nout vec4 fragColor;void main(){fragColor=vec4(0.1,0.8,0.9,1.0);}'
        prog=ctx.program(vertex_shader=vs,fragment_shader=fs);receipt['programsCompiled']=True
        import struct
        vbo=ctx.buffer(struct.pack('6f',-1,-1,3,-1,-1,3));vao=ctx.simple_vertex_array(prog,vbo,'in_pos');tex=ctx.texture((32,32),4);fbo=ctx.framebuffer(tex);fbo.use();ctx.clear(0,0,0,1);vao.render(moderngl.TRIANGLES);data=fbo.read(components=4);receipt['frameRendered']=len(data)==32*32*4;receipt['captureSha256']=hashlib.sha256(data).hexdigest() if receipt['frameRendered'] else None
        receipt['state']='RENDERED' if receipt['frameRendered'] else 'CONTEXT_ONLY'
    except Exception as exc:
        receipt['state']='DEVICE_PROOF_FAILED';receipt['error']=f'{type(exc).__name__}: {exc}'
    return receipt

def main()->int:
    ap=argparse.ArgumentParser();ap.add_argument('renderer');ap.add_argument('--live',action='store_true');ap.add_argument('--out');args=ap.parse_args();r=probe(Path(args.renderer),args.live);text=json.dumps(r,indent=2);print(text)
    if args.out:Path(args.out).write_text(text,encoding='utf-8')
    return 0 if (r['state'] in {'SOURCE_VERIFIED','RENDERED'} and (not args.live or r['state']=='RENDERED')) else 2
if __name__=='__main__':raise SystemExit(main())
