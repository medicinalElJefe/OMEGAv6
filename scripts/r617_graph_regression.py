#!/usr/bin/env python3
"""Source-backed R616 executor regression. Requires original v21 ZIP and openpyxl."""
import sys
from pathlib import Path
from r616_historical_graph import traverse

def run(donor):
    first=traverse(donor,5990,'antipode_state')
    edge=next((e for e in first['edges'] if e['id']=='E00001'),None)
    assert edge is not None, 'original E00001 missing'
    assert edge['source_concept']=='RH0001' and edge['target_concept']=='RH0001'
    assert edge['source_row']==5991 and edge['target_row']==16473
    assert edge['source_address']==5990 and edge['target_address']==16472
    assert edge['source_node']=='node_005991' and edge['target_node']=='node_016473'
    assert edge['weight']==0.2 and edge['kind']=='antipode_state'
    assert first['truth_class']=='SOURCE_VERIFIED_V21_TYPED_GRAPH'
    assert all(e['kind']=='antipode_state' for e in first['edges'])
    both=traverse(donor,5990)
    assert any(e['id']=='E00001' for e in both['edges'])
    assert len(both['edges'])>=len(first['edges'])
    for bad in (-1,20736,True,0.5,'5990'):
        try:traverse(donor,bad)
        except ValueError:pass
        else:raise AssertionError('accepted invalid address '+repr(bad))
    try:traverse(donor,5990,'coupling')
    except ValueError:pass
    else:raise AssertionError('accepted nonexistent coupling edge type')
    print('R617 PASS: source E00001, typed filtering, translated addresses, invalid input controls')

if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('usage: python scripts/r617_graph_regression.py original-v21.zip')
    run(Path(sys.argv[1]))
