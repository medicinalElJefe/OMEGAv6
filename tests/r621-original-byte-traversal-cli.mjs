import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseTraversalArgsR621, proveOriginalByteTraversalR621} from '../scripts/traverse_original_workbook_r621.mjs';

const parse = argv => parseTraversalArgsR621(['/tmp/source.xlsx', ...argv]);
assert.deepEqual(parse(['--address', '429981695', '--offset', '1']), {
  path: '/tmp/source.xlsx', address: 429981695, offset: 1, wrap: false,
});
assert.deepEqual(parse(['--address', '0', '--offset', '-1', '--wrap']), {
  path: '/tmp/source.xlsx', address: 0, offset: -1, wrap: true,
});
for (const args of [
  [], ['--address', '0'], ['--offset', '1', '--address', '0'],
  ['--address', '0', '--offset', '1', '--wrap', '--wrap'],
  ['--address', '0', '--offset', '1', '--unsafe'],
  ['--address', '-1', '--offset', '1'],
  ['--address', '1.0', '--offset', '1'],
  ['--address', '1e3', '--offset', '1'],
  ['--address', '1', '--offset', '+1'],
  ['--address', '1', '--offset', '-0'],
  ['--address', '9007199254740992', '--offset', '1'],
  ['--address', '1', '--offset', '9007199254740992'],
]) assert.throws(() => parse(args));
assert.throws(() => proveOriginalByteTraversalR621('not bytes', {address: 0, offset: 1}), /Buffer/);
assert.throws(() => proveOriginalByteTraversalR621(Buffer.from('not the pinned original workbook'), {address: 0, offset: 1}));

const dir = mkdtempSync(join(tmpdir(), 'omega-r621-'));
try {
  const file = join(dir, 'invalid.xlsx');
  const secret = 'SENTINEL_PRIVATE_WORKBOOK_TEXT_DO_NOT_EMIT';
  writeFileSync(file, secret);
  const result = spawnSync(process.execPath, [
    'scripts/traverse_original_workbook_r621.mjs', file, '--address', '0', '--offset', '1',
  ], {cwd: process.cwd(), encoding: 'utf8'});
  assert.equal(result.status, 1, 'nonoriginal workbook must fail closed');
  assert.equal(result.stdout, '', 'failure must not emit a success receipt');
  assert.match(result.stderr, /R621 ORIGINAL SOURCE TRAVERSAL REFUSED/);
  assert.ok(!result.stderr.includes(secret), 'failure must not leak source bytes');
} finally { rmSync(dir, {recursive: true, force: true}); }
// A failed filesystem open must not disclose the private workbook path or its filename.
const privatePath = join(tmpdir(), 'SENTINEL_PRIVATE_WORKBOOK_PATH_DO_NOT_EMIT_' + process.pid + '.xlsx');
const missing = spawnSync(process.execPath, [
  'scripts/traverse_original_workbook_r621.mjs', privatePath, '--address', '0', '--offset', '1',
], {cwd: process.cwd(), encoding: 'utf8'});
assert.equal(missing.status, 1, 'missing original workbook must fail closed');
assert.equal(missing.stdout, '', 'failure must not emit a receipt');
assert.match(missing.stderr, /R621 ORIGINAL SOURCE TRAVERSAL REFUSED: SOURCE_OR_ARGUMENT_PROOF_FAILED/);
assert.ok(!missing.stderr.includes(privatePath), 'refusal must not reveal the private source path');
assert.ok(!missing.stderr.includes('SENTINEL_PRIVATE_WORKBOOK_PATH_DO_NOT_EMIT'), 'refusal must not reveal private basename');

console.log('R621 original-byte CLI input, source refusal and privacy controls PASS');
