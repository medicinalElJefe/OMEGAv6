import importlib.util, io, hashlib, json, tempfile, unittest, zipfile
from pathlib import Path

SCRIPT=Path(__file__).resolve().parents[1]/'scripts/recover_b053_native_archive_r680.py'
spec=importlib.util.spec_from_file_location('r680_repair',SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def sha(b):return hashlib.sha256(b).hexdigest()
def source_fixture(base:Path,*,tamper=False,collision=False,wrong_release=False,bad_index=False):
    original={
     'Dimensional_Relativity_Stabilized/source.py':b'ORIGINAL-NATIVE-SOURCE-UNCHANGED',
     'Dimensional_Relativity_Stabilized/tests/test.py':b'assert True\n'
    }
    if collision:original['Dimensional_Relativity_Stabilized/archive_docs/index.json']=b'old'
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',compression=zipfile.ZIP_DEFLATED) as donor:
        for k,v in original.items():donor.writestr(k,v)
    package=buf.getvalue()
    index=[{'id':f'doc_{i:03d}.txt','title':f'Original document {i}'} for i in range(56)]
    if bad_index:index[0]['id']='missing_original.txt'
    docs={f'archive_docs/doc_{i:03d}.txt':f'ARCHIVED-SOURCE-DOC-{i}'.encode() for i in range(56)}
    docs['archive_docs/index.json']=json.dumps(index).encode()
    docs['archive_docs/canonforge_metadata.json']=b'{"authority":"original"}'
    entries={mod.DONOR:package,**docs}
    manifest={'build':'NOT_B053' if wrong_release else mod.RELEASE,
              'files':[{'path':k,'sha256':sha(v),'bytes':len(v)} for k,v in entries.items()]}
    if tamper:docs['archive_docs/doc_020.txt']=b'CORRUPTED-ORIGINAL' # outer bytes differ from immutable manifest
    zip_path=base/'release.zip'
    with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED) as release:
        for key,value in entries.items():release.writestr(mod.RELEASE_ROOT+key,docs.get(key,value))
        release.writestr(mod.RELEASE_ROOT+'B053_FILE_MANIFEST.json',json.dumps(manifest))
    return zip_path,original

class SourceExactArchiveReconciliation(unittest.TestCase):
 def test_original_members_and_source_docs_preserved(self):
    with tempfile.TemporaryDirectory() as d:
        d=Path(d);source,original=source_fixture(d)
        result=mod.reconcile(source,d/'restored.zip',d/'proof.json')
        self.assertEqual(result['source_verified_documents_added'],58)
        self.assertEqual(result['indexed_documents_backed'],56)
        self.assertEqual(result['original_members_preserved'],2)
        self.assertEqual(result['synthetic_documents'],0)
        self.assertFalse(result['production_verified'])
        self.assertEqual(result['crc'],'PASS')
        with zipfile.ZipFile(d/'restored.zip') as output:
            for k,v in original.items():self.assertEqual(output.read(k),v)
            entries=json.loads(output.read('Dimensional_Relativity_Stabilized/archive_docs/index.json'))
            self.assertEqual(len(entries),56)
            self.assertTrue(all(output.read('Dimensional_Relativity_Stabilized/archive_docs/'+row['id']).startswith(b'ARCHIVED-SOURCE-DOC') for row in entries))
        self.assertEqual(json.loads((d/'proof.json').read_text())['output_sha256'],sha((d/'restored.zip').read_bytes()))

 def test_manifest_mismatch_blocks_output(self):
    with tempfile.TemporaryDirectory() as d:
        d=Path(d);source,_=source_fixture(d,tamper=True)
        with self.assertRaisesRegex(ValueError,'manifest mismatch'):mod.reconcile(source,d/'restored.zip',d/'proof.json')
        self.assertFalse((d/'restored.zip').exists())

 def test_original_donor_collision_blocks_output(self):
    with tempfile.TemporaryDirectory() as d:
        d=Path(d);source,_=source_fixture(d,collision=True)
        with self.assertRaisesRegex(ValueError,'refuses to overwrite'):mod.reconcile(source,d/'restored.zip',d/'proof.json')
        self.assertFalse((d/'restored.zip').exists())

 def test_missing_index_entry_and_wrong_release_block(self):
    with tempfile.TemporaryDirectory() as d:
        d=Path(d);source,_=source_fixture(d,bad_index=True)
        with self.assertRaisesRegex(ValueError,'archive index missing'):mod.reconcile(source,d/'restored.zip',d/'proof.json')
        source,_=source_fixture(d,wrong_release=True)
        with self.assertRaisesRegex(ValueError,'wrong release authority'):mod.reconcile(source,d/'restored.zip',d/'proof.json')

 def test_original_thirty_part_wrappers_reassemble_exact_release(self):
    with tempfile.TemporaryDirectory() as d:
        d=Path(d);source,_=source_fixture(d)
        data=source.read_bytes();parts=d/'parts';parts.mkdir()
        chunks=[data[(len(data)*i)//30:(len(data)*(i+1))//30] for i in range(30)]
        for index,blob in enumerate(chunks,1):
            with zipfile.ZipFile(parts/f'OMEGA_B053_FULL_SYSTEM_PART_{index:02d}_OF_30.zip','w') as z:
                z.writestr(f'OMEGA_B053_FULL_SYSTEM.chunk_{index:03d}_of_030.bin',blob)
        built=d/'assembled.zip'
        mod.assemble_30_parts(parts,built)
        self.assertEqual(built.read_bytes(),data)
        receipt=mod.reconcile(built,d/'restored.zip',d/'proof.json')
        self.assertEqual(receipt['source_manifest_sha256'],'PASS')

if __name__=='__main__':
 unittest.main()
