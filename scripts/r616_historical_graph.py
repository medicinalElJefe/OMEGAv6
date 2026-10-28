"""Source-gated typed historical RH graph executor, no synthetic edges.
Requires R615-verified donor ZIP and openpyxl. Never treats RH IDs as SQLite node IDs.
"""
from pathlib import Path
import sys,zipfile,io,sqlite3,tempfile,shutil,json
import openpyxl
from r615_validate_graph import verify

def load_graph(donor):
    proof=verify(Path(donor)) # source SHA, all 416 edges and 20,736 node joins
    with zipfile.ZipFile(donor) as z:
        name=next(n for n in z.namelist() if n.endswith('Math_Atlas_20736D_FullCanon_GraphEdges.xlsx'))
        book=openpyxl.load_workbook(io.BytesIO(z.read(name)),read_only=True,data_only=True)
        edges=[]
        for eid,src,dst,kind,weight,note,fr,to in list(book['Graph_Edges'].values)[1:]:
            edges.append({'id':eid,'source_concept':src,'target_concept':dst,'kind':kind,'weight':weight,
                          'source_row':fr,'target_row':to,'source_address':fr-1,'target_address':to-1,
                          'source_node':f'node_{fr:06d}','target_node':f'node_{to:06d}'})
        return proof,edges

def traverse(donor,address,kind=None):
    if not isinstance(address,int) or isinstance(address,bool) or not 0<=address<20736:
        raise ValueError('canonical address must be an integer in [0,20736)')
    if kind is not None and kind not in ('antipode_state','prereq'):
        raise ValueError('unsupported historical edge type')
    proof,edges=load_graph(donor)
    matching=[e for e in edges if e['source_address']==address and (kind is None or e['kind']==kind)]
    return {'truth_class':'SOURCE_VERIFIED_V21_TYPED_GRAPH','source_sha256':proof['source_sha256'],
            'address':address,'edge_count':len(matching),'edges':matching,
            'boundary':'RH conceptual graph to SQLite state-row translation; not Time Mandala semantic identity or 10368 coupling-edge recovery'}


def traverse_many(donor, addresses, kind=None):
    """Batch query with one full source admission, never one 162MB verification per address."""
    if kind is not None and kind not in ('antipode_state','prereq'):
        raise ValueError('unsupported historical edge type')
    if not isinstance(addresses,(list,tuple)) or len(addresses)>20736:
        raise ValueError('addresses must be a bounded list or tuple')
    if any(not isinstance(a,int) or isinstance(a,bool) or not 0<=a<20736 for a in addresses):
        raise ValueError('invalid canonical address')
    proof,edges=load_graph(donor)
    grouped={a:[] for a in addresses}
    for e in edges:
        if e['source_address'] in grouped and (kind is None or e['kind']==kind):
            grouped[e['source_address']].append(e)
    return {'truth_class':'SOURCE_VERIFIED_V21_TYPED_GRAPH',
            'source_sha256':proof['source_sha256'],
            'results':[{'address':a,'edge_count':len(grouped[a]),'edges':grouped[a]} for a in addresses],
            'boundary':'RH graph typed state-row projection; not inferred coupling edges or live UI proof'}

if __name__=='__main__':
    if len(sys.argv) not in (3,4):raise SystemExit('usage: r616_historical_graph.py v21.zip address [antipode_state|prereq]')
    print(json.dumps(traverse(Path(sys.argv[1]),int(sys.argv[2]),sys.argv[3] if len(sys.argv)==4 else None),indent=2))
