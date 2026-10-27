import copy
import hashlib
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('restore', Path(__file__).resolve().parents[1] / 'scripts/archive-restore.py')
restore = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restore)
sha = lambda data: hashlib.sha256(data).hexdigest()


class API:
    def __init__(self, held=False):
        self.calls = []
        self.held = held

    def request(self, path):
        self.calls.append(('status', path))
        if self.held:
            return io.BytesIO(b'{"ok":false,"code":"ARCHIVE_ACCOUNT_ACTIVATION_REQUIRED"}')
        return io.BytesIO(b'{"ok":true,"schema":"OMEGA_PRIVATE_ARCHIVE_V1","storage":"R2","private":true,"replicas":2}')

    def ingest(self, path, source):
        data = path.read_bytes()
        self.calls.append(('ingest', source['library_file_id']))
        return {'status': 'BOTH_REPLICAS_READBACK_VERIFIED', 'bytes': len(data),
                'sha256': sha(data), 'source': source}


def fixture(root, corrupt_member=False, segmented=False):
    files = []
    data = [b'first original', b'second original']
    for number, payload in enumerate(data):
        identity = 'libfile_example%d' % number
        source = {'kind': 'file', 'name': 'same.txt', 'path': '/same.txt', 'library_file_id': identity,
                  'file_id': 'file%d' % number, 'size_bytes': len(payload), 'mime_type': 'text/plain'}
        files.append({'source': source, 'member': 'originals/' + identity + '/same.txt',
                      'bytes': len(payload), 'sha256': sha(payload)})
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as bundle:
        bundle.writestr('original_file_manifest.json', json.dumps({'files': files}))
        for number, row in enumerate(files):
            bundle.writestr(row['member'], b'X' * len(data[number]) if corrupt_member and number == 1 else data[number])
    payload = stream.getvalue()
    proof = {'status': 'DRIVE_FULL_READBACK_VERIFIED', 'originalFiles': 2,
             'originalBytes': sum(map(len, data)), 'zipSHA256': sha(payload), 'zipBytes': len(payload),
             'cloudFileId': 'test-only-provider-id', 'files': files}
    parts = [root / 'one.zip']
    parts[0].write_bytes(payload)
    if segmented:
        pieces = [payload[:len(payload)//2], payload[len(payload)//2:]]
        parts = [root / 'one.zip.001', root / 'one.zip.002']
        proof['status'] = 'DRIVE_SEGMENTED_FULL_READBACK_VERIFIED'
        proof['segments'] = []
        for path, piece in zip(parts, pieces):
            path.write_bytes(piece)
            proof['segments'].append({'verified': True, 'fileId': path.name, 'bytes': len(piece), 'sha256': sha(piece)})
    return {'proofs': [proof], 'originalFiles': 2, 'originalBytes': proof['originalBytes']}, parts


class RestoreTests(unittest.TestCase):
    def test_segmented_originals_and_provenance_survive_duplicate_names(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            index, parts = fixture(root, segmented=True)
            api = API()
            result = restore.restore_bundle(index, 0, parts, api, root / 'receipts.jsonl')
            self.assertEqual(result['files'], 2)
            self.assertEqual([x[1] for x in api.calls if x[0] == 'ingest'], ['libfile_example0', 'libfile_example1'])
            receipts = [json.loads(line) for line in (root / 'receipts.jsonl').read_text().splitlines()]
            self.assertEqual(len(receipts), 2)
            self.assertEqual(receipts[0]['recovery']['transportFileIds'], ['one.zip.001', 'one.zip.002'])
            self.assertEqual(receipts[0]['recovery']['executionAdmission'], 'NOT_EVALUATED')

    def test_second_corrupt_original_vetoes_all_remote_requests(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            index, parts = fixture(root, corrupt_member=True)
            api = API()
            with self.assertRaises(ValueError):
                restore.restore_bundle(index, 0, parts, api, root / 'receipts')
            self.assertEqual(api.calls, [])
            self.assertFalse((root / 'receipts').exists())

    def test_reordered_or_truncated_transport_vetoes_remote_requests(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            index, parts = fixture(root, segmented=True)
            for attempted in [list(reversed(parts)), parts[:1]]:
                api = API()
                with self.assertRaises(ValueError):
                    restore.restore_bundle(index, 0, attempted, api, root / 'receipts')
                self.assertEqual(api.calls, [])

    def test_invalid_index_and_path_are_refused(self):
        with tempfile.TemporaryDirectory() as work:
            index, _ = fixture(Path(work))
            for mutation in ['total', 'duplicate', 'path', 'status']:
                bad = copy.deepcopy(index)
                if mutation == 'total':
                    bad['originalBytes'] += 1
                elif mutation == 'duplicate':
                    bad['proofs'][0]['files'][1]['source']['library_file_id'] = 'libfile_example0'
                elif mutation == 'path':
                    bad['proofs'][0]['files'][0]['member'] = '../escape'
                else:
                    bad['proofs'][0]['status'] = 'UPLOADED_NOT_VERIFIED'
                with self.assertRaises(ValueError):
                    restore.validate_index(bad)

    def test_activation_hold_produces_no_upload_or_receipt(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            index, parts = fixture(root)
            api = API(held=True)
            with self.assertRaises(ValueError):
                restore.restore_bundle(index, 0, parts, api, root / 'receipts')
            self.assertEqual(api.calls, [('status', 'status')])
            self.assertFalse((root / 'receipts').exists())

    def test_older_proof_requires_inventory_to_restore_original_path(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            index, parts = fixture(root)
            original = copy.deepcopy(index['proofs'][0]['files'][0]['source'])
            del index['proofs'][0]['files'][0]['source']['path']
            with self.assertRaises(ValueError):
                restore.restore_bundle(index, 0, parts, API(), root / 'receipts')
            resolved = restore.resolved_source(index['proofs'][0]['files'][0]['source'], {original['library_file_id']: original})
            self.assertEqual(resolved['path'], '/same.txt')
            original['file_id'] = 'different-file'
            with self.assertRaises(ValueError):
                restore.resolved_source(index['proofs'][0]['files'][0]['source'], {original['library_file_id']: original})


if __name__ == '__main__':
    unittest.main()
