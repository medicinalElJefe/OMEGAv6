#!/usr/bin/env python3
"""Fail-closed validation of v21 historical RH graph and SQLite row-address joins.
Requires openpyxl. Run: python scripts/r615_validate_graph.py path/to/v21.zip
"""
import sys,zipfile,hashlib,io,sqlite3,tempfile,shutil,json
from pathlib import Path
from collections import Counter
import openpyxl
SHA='e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c'
def check(ok,msg):
 if not ok: raise ValueError(msg)
def address(d,p,r,l):return (((d-1)*12+(p-1))*12+(r-1))*12+l
def verify(path):
 check(hashlib.sha256(path.read_bytes()).hexdigest()==SHA,'donor hash mismatch')
 with zipfile.ZipFile(path) as z:
  matches=[n for n in z.namelist() if n.endswith('Math_Atlas_20736D_FullCanon_GraphEdges.xlsx')]
  check(len(matches)==1,'graph workbook missing or ambiguous')
  w=openpyxl.load_workbook(io.BytesIO(z.read(matches[0])),read_only=True,data_only=True)
  rows=list(w['RH_Index'].values);edges=list(w['Graph_Edges'].values)
  check(rows[0][0]=='NodeID' and edges[0][:4]==('EdgeID','FromNodeID','ToNodeID','EdgeType'),'schema mismatch')
  rh={r[0]:r for r in rows[1:]};check(len(rh)==320 and len(edges)==417,'source counts changed')
  for key,r in rh.items():check(address(*r[5:9])==r[9] and 1<=r[10]<=20736,key+' radix mismatch')
  counts=Counter();seen=set()
  for e in edges[1:]:
   eid,src,dst,kind,weight,note,fr,to=e
   check(src in rh and dst in rh,eid+' orphan endpoint')
   check((src,dst,kind) not in seen,eid+' duplicate');seen.add((src,dst,kind))
   check(fr==rh[src][9],eid+' source row mismatch')
   if kind=='antipode_state':check(src==dst and to==rh[src][10] and weight==.2,eid+' antipode mismatch')
   elif kind=='prereq':check(to==rh[dst][9] and weight==1,eid+' prereq mismatch')
   else:raise ValueError(eid+' unknown edge type')
   counts[kind]+=1
  check(counts=={'antipode_state':320,'prereq':96},'edge type counts mismatch')
  with tempfile.TemporaryDirectory() as td:
   p=Path(td)/'atlas_runtime.db'
   with z.open('atlas_runtime.db') as inp,p.open('wb') as out:shutil.copyfileobj(inp,out)
   db=sqlite3.connect('file:'+str(p)+'?mode=ro',uri=True)
   try:
    for t in ('atlas_nodes','runtime_state'):check(db.execute('SELECT COUNT(*) FROM '+t).fetchone()[0]==20736,t+' count mismatch')
    for a,b in (('atlas_nodes','runtime_state'),('runtime_state','atlas_nodes')):
     check(db.execute('SELECT COUNT(*) FROM '+a+' a LEFT JOIN '+b+' b ON a.node_id=b.node_id WHERE b.node_id IS NULL').fetchone()[0]==0,a+' orphan join')
    for n in {r[9] for r in rh.values()}|{r[10] for r in rh.values()}:
     node=db.execute('SELECT d,p,r,shell FROM atlas_nodes WHERE node_id=?',(f'node_{n:06d}',)).fetchone()
     check(node is not None and address(*node)==n,str(n)+' sqlite address mismatch')
    for key,r in rh.items():
     node=db.execute('SELECT d,p,r,shell FROM atlas_nodes WHERE node_id=?',(f'node_{r[9]:06d}',)).fetchone()
     check(node==tuple(r[5:9]),key+' graph/sqlite axis mismatch')
   finally:db.close()
 return {'status':'PASS','rh_nodes':320,'typed_edges':dict(counts),'sqlite_nodes':20736,'sqlite_states':20736,'source_sha256':SHA}
if __name__=='__main__':
 if len(sys.argv)!=2:raise SystemExit('usage: r615_validate_graph.py original-v21.zip')
 print(json.dumps(verify(Path(sys.argv[1])),sort_keys=True))
