#!/usr/bin/env python3
"""Import one verified recovery archive into OMEGA's private primary/backup R2.

Provider plugins download the indexed transport parts first. This command never
downloads arbitrary URLs, executes donor code, or deletes originals.
"""
import argparse
import hashlib
import importlib.util
import json
import os
import re
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

spec = importlib.util.spec_from_file_location('omega_transfer', Path(__file__).with_name('archive-transfer.py'))
transfer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(transfer)
ALLOWED = {'DRIVE_FULL_READBACK_VERIFIED', 'DRIVE_SEGMENTED_FULL_READBACK_VERIFIED',
           'DRIVE_RECOVERED_MANIFEST_FULL_READBACK_VERIFIED'}
HASH = re.compile(r'^[a-f0-9]{64}$')


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def valid_integer(value):
    return type(value) is int and value >= 0


def validate_index(index):
    require(isinstance(index, dict) and isinstance(index.get('proofs'), list), 'Invalid recovery index')
    seen = set()
    total = 0
    for proof in index['proofs']:
        require(proof.get('status') in ALLOWED, 'Unverified recovery proof')
        require(HASH.fullmatch(str(proof.get('sha256') or proof.get('zipSHA256') or '')), 'Missing archive SHA-256')
        require(valid_integer(proof.get('zipBytes')), 'Invalid archive size')
        files = proof.get('files')
        require(isinstance(files, list) and proof.get('originalFiles') == len(files), 'Proof count mismatch')
        subtotal = 0
        for row in files:
            source = row.get('source', {})
            identity = source.get('library_file_id')
            require(isinstance(identity, str) and re.fullmatch(r'libfile_[a-zA-Z0-9]+', identity), 'Invalid source identity')
            require(identity not in seen, 'Duplicate source identity')
            seen.add(identity)
            require(valid_integer(row.get('bytes')) and HASH.fullmatch(str(row.get('sha256', ''))), 'Invalid original proof')
            expected = source.get('size_bytes')
            require((expected is None and row['bytes'] > 0) or (valid_integer(expected) and expected == row['bytes']), 'Original source size mismatch')
            require(source.get('library_artifact_type') != 'site' and not source.get('site_metadata'), 'Sites require their own export route')
            require(isinstance(source.get('name'), str), 'Missing source name')
            member = row.get('member', '')
            require(isinstance(member, str) and member and not PurePosixPath(member).is_absolute()
                    and '..' not in PurePosixPath(member).parts and '\\' not in member, 'Unsafe archive member')
            subtotal += row['bytes']
        require(subtotal == proof.get('originalBytes'), 'Proof byte total mismatch')
        total += subtotal
    require(valid_integer(index.get('originalFiles')) and len(seen) == index['originalFiles'], 'Index file total mismatch')
    require(valid_integer(index.get('originalBytes')) and total == index['originalBytes'], 'Index byte total mismatch')


def copy_hashed(source, target, expected_size, expected_hash):
    digest = hashlib.sha256()
    size = 0
    while data := source.read(1024 * 1024):
        size += len(data)
        require(size <= expected_size, 'Original or transport exceeds indexed size')
        digest.update(data)
        target.write(data)
    require(size == expected_size and digest.hexdigest() == expected_hash, 'Original or transport SHA-256/size mismatch')


def source_inventory(raw):
    pages = raw.get('pages', [raw])
    by_id = {}
    for page in pages:
        for row in page.get('items', []):
            if row.get('kind') != 'file':
                continue
            identity = row.get('library_file_id')
            require(isinstance(identity, str), 'Inventory source identity missing')
            if identity in by_id:
                require(by_id[identity] == row, 'Conflicting inventory source identity')
            by_id[identity] = row
    return by_id


def resolved_source(source, inventory):
    authoritative = inventory.get(source['library_file_id'])
    if authoritative is not None:
        for key in ['file_id', 'name', 'path', 'size_bytes', 'mime_type', 'version_id']:
            if key in source:
                expected = authoritative.get(key)
                if key == 'size_bytes' and expected is None:
                    continue  # Some old proofs recorded measured bytes for an unspecified source size.
                if key in ('mime_type', 'version_id'):
                    require((source[key] or None) == (expected or None), 'Recovery source differs from inventory')
                else:
                    require(source[key] == expected, 'Recovery source differs from inventory')
        source = {**source, **authoritative}
    require(isinstance(source.get('path'), str), 'Original source path requires its source inventory')
    return source


def restore_bundle(index, ordinal, parts, api, receipt_path, inventory=None):
    validate_index(index)
    require(type(ordinal) is int and 0 <= ordinal < len(index['proofs']), 'Invalid proof index')
    proof = index['proofs'][ordinal]
    inventory = inventory or {}
    sources = [resolved_source(row['source'], inventory) for row in proof['files']]
    segments = proof.get('segments')
    if segments is not None:
        require(isinstance(segments, list) and len(parts) == len(segments) > 0, 'Transport part count mismatch')
        for segment in segments:
            require(segment.get('verified') is True and valid_integer(segment.get('bytes'))
                    and HASH.fullmatch(str(segment.get('sha256', ''))), 'Invalid segment proof')
    else:
        require(len(parts) == 1, 'Whole archive requires one transport file')
    with tempfile.TemporaryDirectory(prefix='omega-private-restore-') as work:
        work = Path(work)
        archive = work / 'transport.zip'
        with archive.open('wb') as out:
            for number, part in enumerate(parts):
                with Path(part).open('rb') as source:
                    expected = segments[number] if segments is not None else {'bytes': proof['zipBytes'], 'sha256': proof.get('sha256') or proof['zipSHA256']}
                    copy_hashed(source, out, expected['bytes'], expected['sha256'])
        whole = hashlib.sha256()
        with archive.open('rb') as source:
            for data in iter(lambda: source.read(1024 * 1024), b''):
                whole.update(data)
        require(archive.stat().st_size == proof['zipBytes'] and whole.hexdigest() == (proof.get('sha256') or proof['zipSHA256']), 'Reconstructed archive mismatch')
        staged = []
        with zipfile.ZipFile(archive) as bundle:
            names = bundle.namelist()
            expected_names = [row['member'] for row in proof['files']] + ['original_file_manifest.json']
            require(len(names) == len(set(names)) and set(names) == set(expected_names), 'Unexpected or duplicate archive members')
            manifest_info = bundle.getinfo('original_file_manifest.json')
            require(manifest_info.file_size <= 32 * 1024 * 1024, 'Archive manifest exceeds bound')
            manifest = json.loads(bundle.read(manifest_info))
            require(manifest.get('files') == proof['files'], 'Archive manifest differs from verified index')
            # Validate every member before making even the first cloud mutation.
            for number, row in enumerate(proof['files']):
                info = bundle.getinfo(row['member'])
                require(info.file_size == row['bytes'], 'ZIP original size mismatch')
                path = work / ('original-%06d.bin' % number)
                with bundle.open(info) as source, path.open('wb') as out:
                    copy_hashed(source, out, row['bytes'], row['sha256'])
                staged.append((path, {**row, 'source': sources[number]}))
        with api.request('status') as response:
            status = json.load(response)
        require(status.get('ok') is True and status.get('schema') == 'OMEGA_PRIVATE_ARCHIVE_V1'
                and status.get('storage') == 'R2' and status.get('private') is True
                and status.get('replicas') == 2, 'OMEGA private two-replica storage is not ready')
        receipt_path = Path(receipt_path)
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        completed = 0
        for path, row in staged:
            receipt = api.ingest(path, row['source'])
            require(receipt.get('status') == 'BOTH_REPLICAS_READBACK_VERIFIED'
                    and receipt.get('sha256') == row['sha256'] and receipt.get('bytes') == row['bytes'], 'Cloud roundtrip receipt mismatch')
            receipt['recovery'] = {'archiveSHA256': whole.hexdigest(), 'proofIndex': ordinal,
                                   'transportFileIds': [s.get('fileId') for s in segments] if segments is not None else [proof.get('cloudFileId')],
                                   'executionAdmission': 'NOT_EVALUATED'}
            fd = os.open(receipt_path, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o600)
            with os.fdopen(fd, 'a') as out:
                out.write(json.dumps(receipt) + '\n')
                out.flush()
                os.fsync(out.fileno())
            completed += 1
        return {'status': 'BOTH_REPLICAS_READBACK_VERIFIED', 'files': completed,
                'bytes': sum(row['bytes'] for _, row in staged), 'proofIndex': ordinal,
                'executionAdmission': 'NOT_EVALUATED'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--token-file', required=True, type=Path)
    parser.add_argument('--index', required=True, type=Path)
    parser.add_argument('--inventory', type=Path, help='Complete original inventory, required for older proofs without original paths')
    parser.add_argument('--proof-index', required=True, type=int)
    parser.add_argument('--part', required=True, action='append', type=Path)
    parser.add_argument('--receipts', required=True, type=Path)
    args = parser.parse_args()
    api = transfer.Archive(args.base, args.token_file.read_text())
    try:
        inventory = source_inventory(json.loads(args.inventory.read_text())) if args.inventory else {}
        result = restore_bundle(json.loads(args.index.read_text()), args.proof_index, args.part, api, args.receipts, inventory)
    except Exception as error:
        # Never print authenticated URLs, token contents or private source metadata.
        print(json.dumps({'status': 'RESTORE_FAILED', 'errorType': type(error).__name__}))
        raise SystemExit(1)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
