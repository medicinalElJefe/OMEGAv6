import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const harness=readFileSync('tests/r826-original-rh-private-positive-browser-e2e.mjs','utf8');
const source=readFileSync('src7/workspaces/historicalRHSourceR823.ts','utf8');
const instrument=readFileSync('src7/workspaces/HistoricalRHGraphR621.tsx','utf8');
const required=[
 'OMEGA_RH_ORIGINAL_XLSX_PATH','OMEGA_EXPECTED_SHA','OMEGA_E2E_URL',
 'OMEGA_GOVERNED_BUILD_RECEIPT_V1','promotedMergeSha','R823_ORIGINAL_WORKBOOK_SHA256',
 'R823_ORIGINAL_WORKBOOK_BYTES',"createHash('sha256')",
 "assertExactReceipt()","['desktop'","['mobile'",
 'buffer:original','setInputFiles({name:','VERIFIED_FULL_LOCAL','PREVIEW_ONLY',
 'data-r823-address-multiplicity','E00001','E00011',
 "selectOption('prereq')","Clear imported graph",
 "page.reload(", "page.on('pageerror'",
 'networkViolations','await route.abort()', "no non-read network requests"
];
for(const token of required)assert.ok(harness.includes(token),'R826 private witness lost '+token);
assert.ok(harness.includes('return await')===false,'R826 source work should not become a caller-controlled trust shortcut');
assert.ok(!/writeFile|appendFile|createWriteStream|sendBeacon|new WebSocket|new EventSource/.test(harness),
 'R826 witness must never write, send, persist or stream the private source');
assert.ok(!/console\.log\([^)]*(?:workbookPath|original\s*[,)]|original\.toString)/.test(harness),
 'R826 witness must not log donor filename, path, or source bytes');
assert.ok(harness.includes("const originalSha=createHash('sha256').update(original).digest('hex')"),
 'R826 must independently hash complete original bytes before file input');
assert.ok(harness.indexOf('await assertExactReceipt();')<harness.indexOf('const browser=await chromium.launch('),
 'R826 must pin the production runtime SHA before opening donor');
assert.ok(harness.includes("origin.hostname==='omegav6.jeffdeweyeljefe.workers.dev'"),
 'R826 must refuse unknown remote origins');
assert.ok(source.includes('ORIGINAL_WORKBOOK_SHA_MATCHED_BROWSER_PARSED')&&
          instrument.includes("setStatus('VERIFIED_FULL_LOCAL')"),
 'R826 positive witness must target the actual R823 source-verified browser instrument');
console.log('R826 PRIVATE WITNESS STRUCTURE PASS · opt-in local donor · exact SHA receipt · desktop/mobile original positive import · non-read request refusal · clear and reload');
