#!/usr/bin/env python3
"""R619 original-donor admission. No donor => no PASS receipt.
Usage: python scripts/r619_admit_historical_graph.py donor.zip receipt.json
"""
import json,sys,hashlib,os,tempfile
from pathlib import Path
from datetime import datetime,timezone
from r615_validate_graph import verify
from r617_graph_regression import run

def admit(donor,receipt):
    donor=Path(donor);receipt=Path(receipt)
    if not donor.is_file():raise FileNotFoundError('original v21 donor required')
    if donor.resolve()==receipt.resolve():raise ValueError('receipt cannot overwrite source')
    proof=verify(donor)
    run(donor)
    # Receipt is emitted only AFTER the source integrity and executable golden regressions pass.
    result={
      'schema':'omega.historical-rh-graph-admission.v1',
      'status':'PASS',
      'source_sha256':proof['source_sha256'],
      'rh_nodes':proof['rh_nodes'],
      'typed_edges':proof['typed_edges'],
      'sqlite_nodes':proof['sqlite_nodes'],
      'sqlite_states':proof['sqlite_states'],
      'regressions':['R617:E00001','R618:E00002','R618:batch-and-input-controls'],
      'truth_class':'LOCAL_SOURCE_AND_EXECUTOR_VERIFIED',
      'production_deployment_verified':False,
      'verified_at_utc':datetime.now(timezone.utc).isoformat(),
    }
    receipt.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix='.r619-',suffix='.json',dir=receipt.parent)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f:
            json.dump(result,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
        os.replace(tmp,receipt)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    return result

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('usage: r619_admit_historical_graph.py original-v21.zip receipt.json')
    print(json.dumps(admit(sys.argv[1],sys.argv[2]),sort_keys=True))
