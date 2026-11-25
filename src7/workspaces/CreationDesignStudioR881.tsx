import {useEffect,useMemo,useRef,useState} from 'react';
import {zipSync,strToU8} from 'fflate';
import {rowIdR881,coordinatesR881,antipodeR881,byteReceiptR881,PROOF,spiralChromaR976,validateStudioProjectR977,encodeStudioProjectR977,decodeStudioProjectR977,STUDIO_PROJECT_MAX_BYTES_R977} from '../../src/system/creationCanonR881.mjs';

type Mode='atlas3d'|'mandala'|'tessellation'|'pointillism';
type Pos={rowId:number;d:number;p:number;r:number;l:number;x:number;y:number;z:number};
type Receipt={name:string;sha256:string;byteSize:number;proofTier:string;source:string};
const phi=(1+Math.sqrt(5))/2;
const normals:number[][]=[
 [0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],
 [1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],
 [phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]
].map(v=>{const n=Math.hypot(...v);return v.map(q=>q/n)});
const dot=(a:number[],b:number[])=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normalized=(a:number[])=>{const m=Math.hypot(...a);return a.map(v=>v/m)};
function pointFromAddress(rowId:number):Pos{
 const {d,p,r,l}=coordinatesR881(rowId);
 const n=normals[d-1],pivot=Math.abs(n[2])<.85?[0,0,1]:[0,1,0],u=normalized(cross(n,pivot)),v=cross(n,u);
 const ox=(r-6.5)/12*.43,oy=(l-6.5)/12*.43,dir=normalized(n.map((a,i)=>a+ox*u[i]+oy*v[i]));
 const radius=Math.cbrt((p-.5)/12);
 return{rowId,d,p,r,l,x:dir[0]*radius,y:dir[1]*radius,z:dir[2]*radius};
}
const svgEsc=(x:unknown)=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c));
function visualPositionR884(p:Pos,mode:Mode):Pos{
 if(mode==='mandala'){
  const a=2*Math.PI*((p.d-1)/12+(p.r-1)/144),rad=.12+.78*(p.p-.5)/12;
  return{...p,x:Math.cos(a)*rad,y:Math.sin(a)*rad,z:.12*Math.sin(2*Math.PI*(p.l-1)/12)};
 }
 if(mode==='pointillism'){
  const phase=2*Math.PI*((p.r*37+p.l*73+p.p*11)%188)/188;
  return{...p,x:p.x+.007*Math.cos(phase),y:p.y+.007*Math.sin(phase),z:p.z};
 }
 return p;
}
function sourceEdgesR884(points:readonly Pos[]):number[]{
 const edges:number[]=[];
 for(const p of points){
  if(p.l<12){edges.push(p.rowId,p.rowId+1)}
  if(p.r<12){edges.push(p.rowId,p.rowId+12)}
  if(p.p<12){edges.push(p.rowId,p.rowId+144)}
 }
 return edges;
}
function project(p:Pos,rotation:number):[number,number]{
 const a=rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x*c+p.z*s,z=-p.x*s+p.z*c;
 const scale=1/(1.7-z*.35);
 return[500+x*scale*500,330-p.y*scale*330];
}
const materialColorR976=(color:string,p:Pos,spiral:boolean,phase:number)=>spiral?spiralChromaR976(color,p.x,p.y,phase):color;
function svgSource(points:readonly Pos[],mode:Mode,rotation:number,color:string,title:string,spiral=false,phase=0){
 let contents='';
 if(mode==='tessellation'){
  const edges=sourceEdgesR884(points);
  for(let i=0;i<edges.length;i+=2){
   const [ax,ay]=project(points[edges[i]],rotation),[bx,by]=project(points[edges[i+1]],rotation);
   contents+='<path d="M'+ax.toFixed(3)+' '+ay.toFixed(3)+' L'+bx.toFixed(3)+' '+by.toFixed(3)+'" fill="none" stroke="'+materialColorR976(color,points[edges[i]],spiral,phase)+'" stroke-opacity=".4" stroke-width=".45" data-src="'+edges[i]+'" data-dst="'+edges[i+1]+'"/>';
  }
 }else{
  contents=points.map(p=>{
   const [x,y]=project(visualPositionR884(p,mode),rotation),radius=mode==='pointillism'?.58:mode==='atlas3d'?1.25:.95;
   return '<circle cx="'+x.toFixed(3)+'" cy="'+y.toFixed(3)+'" r="'+radius+'" fill="'+materialColorR976(color,p,spiral,phase)+'" fill-opacity=".75" data-row="'+p.rowId+'"/>';
  }).join('');
 }
 const metadata={schema:'OMEGA_STUDIO_SVG_R884',title,mode,rotation,color,material:{spiral,phase,geometryInvariant:true},source:'CF-D0001/2/3',proofTier:'DER',provenance:'DER',nodeCount:20736,physicalMeasurement:false,fontAuthority:'BROWSER_SYSTEM_UI',renderer:'SVG',topology:'SOURCE_DEFINITIONAL_PRESENTATION'};
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 660"><metadata>'+svgEsc(JSON.stringify(metadata))+'</metadata><rect width="1000" height="660" fill="#07111e"/><g data-proof-tier="DER" data-source="CF-D0001/2/3" data-no-physical-measurement="true">'+contents+'</g></svg>';
}
const saveBlob=(name:string,blob:Blob)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const xmlEsc=svgEsc;
function makeXlsx(points:readonly Pos[]){
 const rows=['<row r="1">'+['RowID','D','P','R','L','X','Y','Z','Proof Tier','Source'].map((h,i)=>'<c r="'+String.fromCharCode(65+i)+'1" t="inlineStr"><is><t>'+h+'</t></is></c>').join('')+'</row>'];
 for(let k=0;k<points.length;k++){const p=points[k],cells=[p.rowId,p.d,p.p,p.r,p.l,p.x,p.y,p.z,'DER','CF-D0001/2/3'];
  rows.push('<row r="'+(k+2)+'">'+cells.map((v,i)=>{const a=String.fromCharCode(65+i)+(k+2);return typeof v==='number'?'<c r="'+a+'"><v>'+v+'</v></c>':'<c r="'+a+'" t="inlineStr"><is><t>'+xmlEsc(v)+'</t></is></c>'}).join('')+'</row>');
 }
 const files:Record<string,Uint8Array>={
  '[Content_Types].xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
  '_rels/.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
  'xl/workbook.xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Full Atlas" sheetId="1" r:id="rId1"/></sheets></workbook>'),
  'xl/_rels/workbook.xml.rels':strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
  'xl/worksheets/sheet1.xml':strToU8('<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+rows.join('')+'</sheetData></worksheet>')
 };
 return zipSync(files,{level:0});
}
function renderWebGL(canvas:HTMLCanvasElement,points:readonly Pos[],rotation:number,mode:Mode,color:string,spiral=false,phase=0){
 const scratch=document.createElement('canvas');scratch.width=canvas.width;scratch.height=canvas.height;
 const gl=scratch.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
 if(!gl)return false;
 try{
 const vert='#version 300 es\nin vec3 position;in vec3 materialColor;out vec3 vTint;uniform float angle;uniform float size;void main(){vTint=materialColor;float c=cos(angle),s=sin(angle);vec3 p=vec3(position.x*c+position.z*s,position.y,-position.x*s+position.z*c);float scale=1.0/(1.7-p.z*.35);gl_Position=vec4(p.x*scale,p.y*scale,.0,1.0);gl_PointSize=size;}';
 const frag='#version 300 es\nprecision mediump float;in vec3 vTint;uniform float isLine;out vec4 outColor;void main(){if(isLine<.5){vec2 xy=gl_PointCoord-vec2(.5);if(dot(xy,xy)>.25)discard;}outColor=vec4(vTint,.8);}';
 const shader=(type:number,source:string)=>{const s=gl.createShader(type);if(!s)return null;gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))return null;return s};
 const vs=shader(gl.VERTEX_SHADER,vert),fs=shader(gl.FRAGMENT_SHADER,frag);if(!vs||!fs)return false;
 const program=gl.createProgram();if(!program)return false;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return false;
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.025,.066,.116,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
 const isLine=mode==='tessellation',edges=isLine?sourceEdgesR884(points):null;
 const positions=new Float32Array((isLine?(edges?.length||0):points.length)*3);
 if(isLine&&edges){edges.forEach((sourceId,i)=>{const p=points[sourceId];positions[i*3]=p.x;positions[i*3+1]=p.y;positions[i*3+2]=p.z})}
 else points.forEach((p,i)=>{const pos=visualPositionR884(p,mode);positions[i*3]=pos.x;positions[i*3+1]=pos.y;positions[i*3+2]=pos.z});
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,positions,gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);
 gl.uniform1f(gl.getUniformLocation(program,'angle'),rotation*Math.PI/180);gl.uniform1f(gl.getUniformLocation(program,'size'),mode==='pointillism'?2:mode==='mandala'?4:3);
 const colors=new Float32Array(positions.length);
 for(let i=0;i<positions.length/3;i++){const p=isLine&&edges?points[edges[i-i%2]]:points[i];const tint=materialColorR976(color,p,spiral,phase);for(let j=0;j<3;j++)colors[i*3+j]=parseInt(tint.slice(1+2*j,3+2*j),16)/255;}
 const colorBuffer=gl.createBuffer();if(!colorBuffer)return false;gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);const colorLoc=gl.getAttribLocation(program,'materialColor');gl.enableVertexAttribArray(colorLoc);gl.vertexAttribPointer(colorLoc,3,gl.FLOAT,false,0,0);
 gl.uniform1f(gl.getUniformLocation(program,'isLine'),isLine?1:0);
 gl.drawArrays(isLine?gl.LINES:gl.POINTS,0,positions.length/3);
 gl.finish();const target=canvas.getContext('2d');if(!target)return false;
 target.clearRect(0,0,canvas.width,canvas.height);target.drawImage(scratch,0,0);
 gl.deleteBuffer(colorBuffer);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
 return true;
 }finally{gl.getExtension('WEBGL_lose_context')?.loseContext();}
}
const panel:React.CSSProperties={background:'#101f32',border:'1px solid #405a72',padding:'14px',borderRadius:12};
const input:React.CSSProperties={background:'#152940',color:'#e9f5ff',border:'1px solid #55738f',padding:'7px',borderRadius:6,width:'100%'};
export default function CreationDesignStudioR881({address,onAddress}:{address:number;onAddress:(n:number)=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),points=useMemo(()=>Array.from({length:20736},(_,i)=>pointFromAddress(i)),[]);
 const [mode,setMode]=useState<Mode>('atlas3d'),[rotation,setRotation]=useState(22),[color,setColor]=useState('#5fcecb');
 const [spiral,setSpiral]=useState(false),[materialPhase,setMaterialPhase]=useState(0);
 const [renderer,setRenderer]=useState<'BROWSER_WEBGL2_RENDER'|'BROWSER_CANVAS2D_RENDER'>('BROWSER_CANVAS2D_RENDER');
 const [title,setTitle]=useState('New Canon composition'),[prompt,setPrompt]=useState(''),[message,setMessage]=useState('');
 const [projectBusy,setProjectBusy]=useState(false);
 const projectBusyRef=useRef(false);
 const [receipts,setReceipts]=useState<Receipt[]>([]),[project,setProject]=useState('Untitled');
 const [assets,setAssets]=useState<{name:string;sha256:string;byteSize:number;proofTier:'OBS';source:string}[]>([]);
 useEffect(()=>{if(!canvas.current)return;let ok=false;try{ok=renderWebGL(canvas.current,points,rotation,mode,color,spiral,materialPhase)}catch{ok=false}rendererIsWebgl.current=ok;setRenderer(ok?'BROWSER_WEBGL2_RENDER':'BROWSER_CANVAS2D_RENDER');
  if(!ok){const ctx=canvas.current.getContext('2d');if(ctx){ctx.fillStyle='#07111e';ctx.fillRect(0,0,canvas.current.width,canvas.current.height);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.45;ctx.globalAlpha=.75;
   if(mode==='tessellation'){const edges=sourceEdgesR884(points);ctx.beginPath();for(let i=0;i<edges.length;i+=2){const [ax,ay]=project(points[edges[i]],rotation),[bx,by]=project(points[edges[i+1]],rotation);if(spiral){ctx.beginPath();ctx.strokeStyle=materialColorR976(color,points[edges[i]],true,materialPhase)}ctx.moveTo(ax,ay);ctx.lineTo(bx,by);if(spiral)ctx.stroke()}if(!spiral)ctx.stroke()}
   else{const radius=mode==='pointillism'?.58:mode==='atlas3d'?1.25:.95;ctx.beginPath();for(const p of points){const [x,y]=project(visualPositionR884(p,mode),rotation);if(spiral){ctx.beginPath();ctx.fillStyle=materialColorR976(color,p,true,materialPhase)}ctx.moveTo(x+radius,y);ctx.arc(x,y,radius,0,2*Math.PI);if(spiral)ctx.fill()}if(!spiral)ctx.fill()}ctx.globalAlpha=1;}}
 },[points,rotation,mode,color,spiral,materialPhase]);
 const log=async(name:string,bytes:Uint8Array|string,type:string,source='CF-D0001/2/3')=>{
  const data=typeof bytes==='string'?new TextEncoder().encode(bytes):bytes;
  const receipt=await byteReceiptR881(data,{source,proofTier:'DER'});
  const row={name,sha256:receipt.sha256,byteSize:receipt.byteSize,proofTier:'DER',source};
  saveBlob(name,new Blob([data as BlobPart],{type}));setReceipts(old=>[row,...old].slice(0,50));setMessage(name+' exported with byte receipt');return row;
 };
 const rendererIsWebgl=useRef(false);
 const pickPoint=(clientX:number,clientY:number,el:HTMLCanvasElement)=>{
  const rect=el.getBoundingClientRect(),px=(clientX-rect.left)*el.width/rect.width,py=(clientY-rect.top)*el.height/rect.height;
  if(!Number.isFinite(px)||!Number.isFinite(py))return;
  const theta=rotation*Math.PI/180,c=Math.cos(theta),sn=Math.sin(theta);
  let bestRow=-1,bestDistance=18*18;
  for(const item of points){
   const p=visualPositionR884(item,mode),screen=rendererIsWebgl.current?(()=>{
    const x=p.x*c+p.z*sn,z=-p.x*sn+p.z*c,k=1/(1.7-z*.35);
    return [(1+x*k)*el.width/2,(1-p.y*k)*el.height/2] as const;
   })():project(p,rotation);
   const dx=screen[0]-px,dy=screen[1]-py,d2=dx*dx+dy*dy;
   if(d2<bestDistance){bestDistance=d2;bestRow=item.rowId}
  }
  if(bestRow>=0){onAddress(bestRow);setMessage('Atlas node '+bestRow+' selected from the scene; source-defined coordinates '+JSON.stringify(coordinatesR881(bestRow)))}
 };
 const exportSvg=()=>log('omega-canon-r881.svg',svgSource(points,mode,rotation,color,title,spiral,materialPhase),'image/svg+xml');
 const exportCsv=()=>log('omega-canon-r881.csv','rowId,d,p,r,l,x,y,z,proofTier,source\n'+points.map(p=>[p.rowId,p.d,p.p,p.r,p.l,p.x,p.y,p.z,'DER','CF-D0001/2/3'].join(',')).join('\n')+'\n','text/csv');
 const exportJson=()=>log('omega-canon-r881.json',JSON.stringify({schema:'OMEGA_FULL_ATLAS_R881',title,prompt,project,representation:{mode,rotation,color,spiral,materialPhase},proofTier:'DER',source:'CF-D0001/2/3',physicalMeasurement:false,rows:points}), 'application/json');
 const exportXlsx=()=>log('omega-canon-r881.xlsx',makeXlsx(points),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 const exportPng=()=>canvas.current?.toBlob(async blob=>{if(!blob)return;await log('omega-canon-r881.png',new Uint8Array(await blob.arrayBuffer()),'image/png',renderer);},'image/png');
 const exportManifest=()=>log('omega-master-truth-run-manifest.json',JSON.stringify({schema:'OMEGA_MASTER_TRUTH_RUN_MANIFEST_R881',project,title,prompt,renderAuthority:renderer,representation:{mode,rotation,color,spiral,materialPhase},fontAuthority:'BROWSER_SYSTEM_UI',source:'CF-D0001/2/3',proofTier:'DER',nodeCount:20736,physicalMeasurement:false,localPcAccepted:false,assets,exports:receipts},null,2),'application/json','BROWSER_EXPORT_LEDGER');
 const snapshotProject=()=>validateStudioProjectR977({project,title,prompt,mode,rotation,color,spiral,materialPhase,address,assets});
 const applyProject=(v:ReturnType<typeof validateStudioProjectR977>)=>{setProject(v.project);setTitle(v.title);setPrompt(v.prompt);setMode(v.mode as Mode);setRotation(v.rotation);setColor(v.color);setSpiral(v.spiral===true);setMaterialPhase(v.materialPhase);onAddress(v.address);setAssets(v.assets.map(a=>({...a,proofTier:'OBS' as const})));setReceipts([])};
 const projectOperation=async(action:()=>Promise<void>)=>{if(projectBusyRef.current)return;projectBusyRef.current=true;setProjectBusy(true);try{await action()}catch(e){setMessage('Project operation refused: '+(e instanceof Error?e.message:String(e)))}finally{projectBusyRef.current=false;setProjectBusy(false)}};
 const saveProject=()=>void projectOperation(async()=>{const scene=snapshotProject();const packet=await encodeStudioProjectR977(scene);localStorage.setItem('omega.r881.project.'+scene.project,packet);setMessage('Saved integrity-checked project locally: '+scene.project)});
 const loadProject=()=>void projectOperation(async()=>{const raw=localStorage.getItem('omega.r881.project.'+project);if(!raw){setMessage('No local project found: '+project);return}if(raw.length>STUDIO_PROJECT_MAX_BYTES_R977)throw new Error('Project exceeds 2 MiB');const parsed=JSON.parse(raw);const scene=parsed?.schema?await decodeStudioProjectR977(raw):validateStudioProjectR977(parsed);applyProject(scene);setMessage('Loaded browser-local project: '+scene.project+(parsed?.schema?' · SHA-256 checked':' · legacy metadata validated; resave to upgrade'))});
 const exportProject=()=>void projectOperation(async()=>{await log('omega-creation-project-r977.json',await encodeStudioProjectR977(snapshotProject()),'application/json','STUDIO_PROJECT_PACKET')});
 const importProject=(file:File|null)=>{if(!file)return;void projectOperation(async()=>{if(file.size>STUDIO_PROJECT_MAX_BYTES_R977)throw new Error('Project exceeds 2 MiB');const scene=await decodeStudioProjectR977(await file.text());applyProject(scene);setMessage('Imported integrity-checked project: '+scene.project+' · asset references only; save locally to retain')})};
 const pickFiles=async(e:React.ChangeEvent<HTMLInputElement>)=>{const list=Array.from(e.target.files||[]);for(const f of list){const result=await byteReceiptR881(new Uint8Array(await f.arrayBuffer()),{source:'USER_SELECTED_FILE',proofTier:'OBS'});setAssets(old=>[...old,{name:f.name,sha256:result.sha256,byteSize:result.byteSize,proofTier:'OBS',source:'USER_SELECTED_FILE'}]);}e.target.value='';};
 return <section data-r881-creation-studio='REAL_COMPUTED_20736' style={{...panel,color:'#e9f5ff'}}>
  <header><b>Creation & Design Studio · 20,736-address instrument</b><p>Source-defined directional geometry · all 20,736 points computed · WebGL2 with Canvas fallback · DER, not measured physics. R237 no promotion beyond evidence.</p></header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,290px),1fr))',gap:14}}>
   <div style={{...panel,display:'grid',gap:8,alignContent:'start'}}>
    <label>Project name<input style={input} value={project} onChange={e=>setProject(e.target.value)}/></label>
    <label>Composition title<input style={input} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Mode<select style={input} value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value='atlas3d'>20,736 node sphere (WebGL2)</option><option value='mandala'>Mandala / phase</option><option value='tessellation'>Tessellation field</option><option value='pointillism'>Pointillism field</option></select></label>
    <label>Atlas address<input style={input} type='number' min={0} max={20735} value={address} onChange={e=>onAddress(Math.max(0,Math.min(20735,Math.floor(Number(e.target.value)||0))))}/></label>
    <div>Current D/P/R/L: {Object.values(coordinatesR881(address)).slice(1).join(' / ')} · antipode {antipodeR881(address)}</div>
    <label>Rotation {rotation}°<input style={input} type='range' min={0} max={360} value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label>
    <label>Line/point color<input style={input} type='color' value={color} onChange={e=>setColor(e.target.value)}/></label>
    <label><input type='checkbox' checked={spiral} onChange={e=>setSpiral(e.target.checked)}/> Spiral monochrome / chromatic field</label>
    {spiral&&<label>Material phase {materialPhase}°<input style={input} type='range' min={0} max={360} value={materialPhase} onChange={e=>setMaterialPhase(Number(e.target.value))}/></label>}
    <small>Material phase changes color only, using source coordinates and linear-light luminance. Geometry, addresses and camera remain unchanged.</small>
    <label>Creative prompt<textarea style={input} rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}><button disabled={projectBusy} onClick={saveProject}>Save project</button><button disabled={projectBusy} onClick={loadProject}>Open project</button><button disabled={projectBusy} onClick={exportProject}>Export project</button></div>
    <label>Import project packet<input style={input} type='file' accept='.json,application/json' disabled={projectBusy} onChange={e=>{const file=e.target.files?.[0]||null;e.target.value='';importProject(file)}}/></label>
    <small>Project packets preserve source address and representation with SHA-256 corruption detection, not authentication. Asset bytes are not embedded.</small>
    <label>Attach local asset for checksum<input style={input} type='file' multiple onChange={pickFiles}/></label>
    <small>Asset bytes remain with you; only filename, length, and hash are stored as project metadata.</small>
   </div>
   <div style={{minWidth:0}}>
    <canvas ref={canvas} width={1000} height={660} onClick={e=>pickPoint(e.clientX,e.clientY,e.currentTarget)} tabIndex={0} aria-label='Interactive computed 20,736-node definitional atlas' style={{width:'100%',maxHeight:480,background:'#07111e',borderRadius:10,border:'1px solid #405a72'}}/>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
     <button onClick={exportSvg}>SVG</button><button onClick={exportPng}>PNG</button><button onClick={exportCsv}>CSV</button><button onClick={exportJson}>JSON</button><button onClick={exportXlsx}>XLSX</button><button onClick={exportManifest}>Proof manifest</button>
    </div>
    <p role='status'>{message||'Renderer output is an indexed visual projection, not physical or geographic evidence.'}</p>
    <details open><summary>Provenance / verification</summary><p>All generated points: DER · address definition CF-D0001–0003. Font: system-ui browser. Visual geometry: renderer-defined. Raster backend: {renderer}. Browser-dependent pixels; the export receipt applies to the bytes actually exported.</p><p>REC-011 ORION_GATE: HOLD_RULE_SOURCE_NEEDED. R170 policy: POLICY_BLOCKED_BRANCH_HELD. TIT: OPEN_CANDIDATE. No elevation or native-PC acceptance.</p><pre style={{maxHeight:160,overflow:'auto',fontSize:11}}>{JSON.stringify({nodeCount:20736,project,assets,receipts},null,2)}</pre></details>
   </div>
  </div>
 </section>;
}
