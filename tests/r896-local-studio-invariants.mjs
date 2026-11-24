import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync('install/Start-OMEGA-Local.ps1','utf8');
const launch=readFileSync('install/OPEN-OMEGA.cmd','utf8');
const smoke=readFileSync('tests/r896-windows-local-studio-smoke.ps1','utf8');
for(const key of [
 '[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,0)',
 'Get-OmegaMime','Send-OmegaResponse','[switch] $NoBrowser','ReadyFile',
 "CLOUD_SERVICE_NOT_AVAILABLE_LOCALLY","'index.html'","Method Not Allowed",
 'Forbidden path','Forbidden reparse path','ReparsePoint','Not found','GetFullPath','Content-Length','X-Content-Type-Options'
])assert.ok(server.includes(key),'R896 local server contract missing: '+key);
assert.ok(!server.includes('0.0.0.0'),'R896 must not accept public TCP binding');
assert.ok(!server.includes('HttpListener'),'R896 should not require administrator URLACL');
assert.ok(!server.includes("[string] $SiteRoot = (Join-Path $PSScriptRoot"),'R896 must not resolve PSScriptRoot before PowerShell parameter binding');
assert.ok(server.includes("if (-not $SiteRoot) { $SiteRoot = Join-Path $PSScriptRoot 'dist' }"),'R896 must choose packaged dist after PowerShell parameter binding');

assert.ok(server.includes("HTTP/1\\.[01]$')"),'R896 request parser regex must retain its literal closing dollar and quote');
assert.ok(server.includes('$rawPath = ($requestMatch.Groups[2].Value'),'R896 request parser must preserve exact captured path');
assert.equal(server.split('try { $decoded = [System.Uri]::UnescapeDataString').length,2,'R896 must contain exactly one intact URI decode block');
assert.equal(server.split('$requestMatch = [System.Text.RegularExpressions.Regex]::Match').length,2,'R896 must contain exactly one intact HTTP request parser');

assert.ok(launch.includes('Start-OMEGA-Local.ps1'),'R896 must be double-click launchable');
assert.ok(launch.includes('Verify-OMEGA-Package.ps1')&&launch.includes('if errorlevel 1'),'R897 startup must fail closed when package integrity is not verified');
const verify=readFileSync('install/Verify-OMEGA-Package.ps1','utf8');
assert.ok(!verify.includes('Get-FileHash -LiteralPath'),'R911 verifier must work without optional PowerShell module discovery from CMD');
const windowsSlash=String.fromCharCode(92);
assert.ok(verify.includes(".Replace('"+windowsSlash+"','/')"),'R897 must normalize a single Windows path separator');
assert.ok(!verify.includes(".Replace('"+windowsSlash+windowsSlash+"','/')"),'R897 must not require doubled Windows backslashes');
for(const key of ['OMEGA_WINDOWS_PACKAGE_FILES_SHA256_R897','[System.Security.Cryptography.SHA256]::Create()','ComputeHash($stream)','SHA256','ReparsePoint','Package file count differs','Duplicate package manifest path'])
 assert.ok(verify.includes(key),'R897 manifest integrity guard missing: '+key);
const operatorSmoke=readFileSync('tests/r911-windows-double-click-operator-smoke.ps1','utf8');
assert.ok(verify.includes('param([string]$PackageRoot)'),'R911 must not bind PSScriptRoot before PowerShell parameter binding');
assert.ok(verify.includes('if ([string]::IsNullOrWhiteSpace($PackageRoot))'),'R911 must default script directory at runtime');
assert.ok(launch.includes('-PackageRoot "%~dp0."'),'R911 double-click cmd must pass its extracted folder explicitly');
for(const marker of ['OMEGA Operator Extracted With Spaces','OPEN-OMEGA.cmd','no-argument package verifier','OMEGA_OPERATOR_SMOKE','OM EGA'.replace(' ','')]){
 assert.ok(operatorSmoke.includes(marker),'R911 real extracted operator test missing: '+marker);
}
const workflow=readFileSync('.github/workflows/ci.yml','utf8');
const powershellSyntaxGate=readFileSync('tests/r903-windows-powershell-syntax.ps1','utf8');
for(const filename of ['r911-windows-double-click-operator-smoke.ps1','Verify-OMEGA-Package.ps1','Start-OMEGA-Integrated.ps1','Install-OMEGA-Windows.ps1','Uninstall-OMEGA-Windows.ps1','r897-windows-packaged-hub-smoke.ps1'])
 assert.ok(powershellSyntaxGate.includes(filename),'R903 missing Windows PowerShell AST syntax gate for: '+filename);
assert.ok(workflow.includes('r911-windows-double-click-operator-smoke.ps1'),'R911 double-click extraction must be exercised before Windows packaging acceptance');
assert.ok(workflow.includes('r903-windows-powershell-syntax.ps1'),
 'R903 parser gate must run before building the native Windows package');

// PyInstaller cannot discover imports from the R884/R899 runtime-loaded
// sibling source modules unless the compiled worker lists them explicitly.
for(const dep of ['xml.etree.ElementTree','zipfile','urllib.request','urllib.error'])
 assert.ok(workflow.includes('--hidden-import '+dep),
  'R899 Windows EXE missing dynamically-loaded runtime dependency: '+dep);

for(const key of ['hash_schema = \'OMEGA_WINDOWS_PACKAGE_FILES_SHA256_R897\'','Verify-OMEGA-Package.ps1','hash_authentication_signature = $false'])
 assert.ok(workflow.includes(key),'R897 package assembly and evidence contract missing: '+key);

for(const key of ['Invoke-WebRequest','Start-Process','127','api/health','StatusCode -eq 503','StatusCode -eq 404','ItemType Junction','StatusCode -eq 403','Stop-Process'])
 assert.ok(smoke.includes(key),'R896 Windows smoke contract missing: '+key);
const localProbeR901=readFileSync('install/Check-OMEGA-Windows.ps1','utf8');
const localProbeSmokeR901=readFileSync('tests/r901-windows-host-observation-smoke.ps1','utf8');
for(const marker of ['Verify-OMEGA-Package.ps1','Start-OMEGA-Local.ps1','Get-CimInstance','gpuAdapterInventoryState','nativeGpuWorkloadProven','physicalPcAccepted','UNSIGNED_OPERATOR_LOCAL_OBSERVATIONS_NOT_R141_R237']){
 assert.ok(localProbeR901.includes(marker),'R901 physical Windows observations improperly omitted: '+marker);
}
for(const marker of ['EXACT_SHA256_PACKAGE_VERIFIED','localUi.responded','nativeGpuWorkloadProven','authenticatedHybridLinkPcAccepted','PRESERVE_PROJECT_DATA_R901']){
 assert.ok(localProbeSmokeR901.includes(marker),'R901 local evidence regression missing: '+marker);
}
assert.ok(workflow.includes('r901-windows-host-observation-smoke.ps1'),
 'R901 must run actual Windows observation evidence in packaging CI');
const installerR900=readFileSync('install/Install-OMEGA-Windows.ps1','utf8');
const uninstallerR900=readFileSync('install/Uninstall-OMEGA-Windows.ps1','utf8');
const installSmokeR900=readFileSync('tests/r900-windows-install-lifecycle-smoke.ps1','utf8');
for(const key of ['Verify-OMEGA-Package.ps1','.omega-install.json','rollback-','Copy-Item','ReparsePoint','NoShortcut'])
 assert.ok(installerR900.includes(key),'R900 verified managed install implementation missing: '+key);
for(const key of ['ConfirmRemove','Verify-OMEGA-Package.ps1','.omega-install.json','ReparsePoint'])
 assert.ok(uninstallerR900.includes(key),'R900 verified uninstall refusal missing: '+key);
for(const key of ['R900_TAMPER_PROOF','R900_UNMANAGED_FILE','PROJECT_DATA_MUST_SURVIVE_R900','ConfirmRemove'])
 assert.ok(installSmokeR900.includes(key),'R900 install lifecycle proof incomplete: '+key);
assert.ok(workflow.includes('r900-windows-install-lifecycle-smoke.ps1'),
 'R900 Windows installer lifecycle must be verified by release CI');
const roundtripR905=readFileSync('tools/omega_sparse_verify_r905.py','utf8');
for(const marker of ['verify_sparse_export_r905','R905_NONCANONICAL_ROW_HELD','R905_FILE_SHA_DRIFT_HELD','R905_STATE_SHA_DRIFT_HELD','R905_MASS_CONSERVATION_HELD','EXACT_EXPORTED_STATE_MATCH'])
 assert.ok(roundtripR905.includes(marker),'R905 exact CSV state roundtrip verifier missing: '+marker);
assert.ok(workflow.includes('omega_sparse_verify_r905.py'),
 'R905 roundtrip verifier missing from compiled Windows worker');
const projectionGpuR908=readFileSync('src7/workspaces/omegaR908GpuProjection.ts','utf8');
for(const marker of ['executeR908GpuProjection','cpuProjectionReferenceR908','compareProjectionR908','dispatchWorkgroups(324)','readback.mapAsync','deviceExecutionProved','physicalPcAccepted:false','nativePcAccepted:false','canonicalStateMutated:false']){
 assert.ok(projectionGpuR908.includes(marker),'R908 real browser GPU compute/readback boundary missing: '+marker);
}
assert.ok(workflow.includes('r908-gpu-projection-cpu-parity.mts'),
 'R908 exact GPU integer CPU reference and unavailable hardware gate missing from Windows CI');
const projectionR907=readFileSync('tools/omega_sparse_projection_r907.py','utf8');
for(const marker of ['address_xy_r907','project_verified_rows_r907','BIJECTIVE_BASE12_D0_D1_D2_D3_144X144','totalMass','sourceFullStateSha256','gpuComputeProven','projectionGrid','GRID_ALPHABET'])
 assert.ok(projectionR907.includes(marker),'R907 verified 20736-cell true address projection missing: '+marker);
assert.ok(workflow.includes('--hidden-import math'),'R907 dynamically loaded SVG logarithmic mass projection math must be bundled');
assert.ok(workflow.includes('omega_sparse_projection_r907.py')&&workflow.includes('test_omega_sparse_projection_r907.py'),
 'R907 authentic projection must be shipped in Windows EXE and tested before building');
const sparseTensor=readFileSync('tools/omega_sparse_tensor_r902.py','utf8');
const sparseHub=readFileSync('tools/omega_local_hub_r881.py','utf8');
for(const marker of ['verified_csv_artifact','R910_CSV_DOWNLOAD_BOUND_HELD','R910_CSV_DOWNLOAD_DRIFT_HELD','/api/hub/artifacts/csv/','text/csv; charset=utf-8']){
 assert.ok(sparseHub.includes(marker),'R910 original complete SHA-verified checkpoint endpoint missing: '+marker);
}
for(const marker of ['verified_svg_artifact','R909_RENDER_RECEIPT_DRIFT_HELD','R909_SVG_ARTIFACT_INTEGRITY_HELD','/api/hub/artifacts/','image/svg+xml; charset=utf-8','X-Omega-Artifact-Sha256','Content-Disposition','nosniff']){
 assert.ok(sparseHub.includes(marker),'R909 authenticated original-job verified SVG download missing: '+marker);
}

const sparseWindows=readFileSync('tests/r897-windows-packaged-hub-smoke.ps1','utf8');
// The R902 Windows smoke uses PowerShell regexes ending in a literal '$'.
// Keep that literal intact; a broken quote/parenthesis can otherwise make
// a queued Windows release job fail before any worker exercise.
assert.ok(sparseWindows.includes("'^[a-f0-9]{64}$'"),
 'R902 Windows SHA-256 anchored match must not lose its literal dollar anchor');
assert.equal(sparseWindows.split('} finally {').length-1,1,
 'R902 Windows smoke must keep one complete process-cleanup finally block');
assert.ok(sparseWindows.trimEnd().endsWith('}'),
 'R902 Windows smoke missing final cleanup closure');

for(const needle of ['DIMENSIONS = AXIS**4','TOTAL_POSSIBLE = DIMENSIONS**2','MAX_NONZERO','conservationExact','fullStateSha256','denseTensorAllocated','gpuComputeProven'])
 assert.ok(sparseTensor.includes(needle),'R902 implicit 20,736 per-cell operator missing: '+needle);
for(const needle of ['SPHERE_TENSOR_EXPORT','sparse_tensor_rows_r904','COMPLETE_SPARSE_STATE_CSV_EXPORTED','R904_EXPORT_TARGET_EXISTS_HELD'])
 assert.ok(sparseHub.includes(needle),'R904 complete sparse tensor CSV export missing: '+needle);
for(const needle of ['SPHERE_TENSOR_RENDER','OMEGA_SPARSE_PROJECTION_ARTIFACT_R907','sourceFullStateSha256','R907_PROJECTION_TARGET_EXISTS_HELD'])
 assert.ok(sparseHub.includes(needle),'R907 authenticated SVG projection missing: '+needle);
for(const needle of ['/api/hub/artifacts/csv/','r910-','R910 compiled Windows protected CSV bytes differ from original export receipt','R910 served a modified complete CSV checkpoint after source SHA drift']){
 assert.ok(sparseWindows.includes(needle),'R910 compiled Windows full-state checkpoint download refusal missing: '+needle);
}
for(const needle of ['/api/hub/artifacts/','r909-download.svg','X-Omega-Artifact-Sha256','R909 served SVG after its SHA-256 receipt diverged']){
 assert.ok(sparseWindows.includes(needle),'R909 actual Windows SVG download/refusal proof missing: '+needle);
}
for(const needle of ['SPHERE_TENSOR_RENDER','verified-cell-projection.svg','sourceFullStateSha256','OMEGA_SPARSE_PROJECTION_ARTIFACT_R907'])
 assert.ok(sparseWindows.includes(needle),'R907 actual compiled Windows SVG proof missing: '+needle);
for(const needle of ['SPHERE_TENSOR_AUDIT_LINEAGE','audit_sparse_lineage_r912','R912_PARENT_RECEIPT_OR_STATE_DRIFT_HELD','R912_LINEAGE_CYCLE_HELD','R912_LINEAGE_DEPTH_BOUND_HELD']){
 assert.ok(sparseHub.includes(needle),'R912 entire checkpoint ancestry executor missing: '+needle);
}
for(const needle of ['SPHERE_TENSOR_AUDIT_LINEAGE','OMEGA_SPARSE_LINEAGE_AUDIT_R912','rootExportJobId','R912 compiled native exact checkpoint ancestry mismatch']){
 assert.ok(sparseWindows.includes(needle),'R912 packaged Windows ancestry check missing: '+needle);
}
for(const needle of ['SPHERE_TENSOR_CONTINUE','OMEGA_SPARSE_TENSOR_CONTINUATION_R906','sourceExportReceiptSha256','VERIFIED_CHECKPOINT_CONTINUATION_EXPORTED'])
 assert.ok(sparseHub.includes(needle),'R906 complete verified checkpoint continuation missing: '+needle);
for(const needle of ['SPHERE_TENSOR_CONTINUE','tensor-next.csv','sourceExportReceiptSha256','OMEGA_SPARSE_TENSOR_CONTINUATION_R906'])
 assert.ok(sparseWindows.includes(needle),'R906 native Windows continued-state proof missing: '+needle);
assert.ok(workflow.includes('omega_sparse_verify_r905.py'),
 'R906 Python syntax and exact checkpoint verifier must run before packaged Windows build');
for(const needle of ['SPHERE_TENSOR_VERIFY','OMEGA_SPARSE_EXPORT_ROUNDTRIP_R905','originalExportReceiptSha256','R905_'])
 assert.ok(sparseWindows.includes(needle),'R905 native Windows roundtrip/tamper proof missing: '+needle);
for(const needle of ['SPHERE_TENSOR_EXPORT','complete-tensor.csv','exportedRows','R904_EXPORT_TARGET_EXISTS_HELD'])
 assert.ok(sparseWindows.includes(needle),'R904 compiled Windows full-state artifact verification missing: '+needle);
for(const needle of ['SPHERE_TENSOR_STEP','omega_sparse_tensor_r902.py'])
 assert.ok(sparseHub.includes(needle),'R902 local durable Hub state operator unwired: '+needle);
for(const needle of ['SPHERE_TENSOR_STEP','429981696','conservationExact','fullStateSha256'])
 assert.ok(sparseWindows.includes(needle),'R902 real packaged Windows compute proof missing: '+needle);
for(const needle of ['omega_sparse_tensor_r902.py','test_omega_sparse_tensor_r902.py'])
 assert.ok(workflow.includes(needle),'R902 packaging/test gate missing: '+needle);
const modelSmoke=readFileSync('tests/r899-windows-compiled-inference-smoke.ps1','utf8');
const modelFixture=readFileSync('tests/r899-windows-ollama-fixture.py','utf8');
for(const line of ['OMEGA-Local-Hub.exe','/api/hub/models','LOCAL_INFER','result_sha256','R899_COMPILED_WORKER_RETURNED_ACTUAL_LOCAL_HTTP_RESPONSE','gpuProven']){
 assert.ok(modelSmoke.includes(line),'R899 native Windows end-to-end local model receipt test missing: '+line);
}
for(const line of ['127.0.0.1','11434','/api/tags','/api/generate','R899_EXECUTION_PROOF_PROMPT']){
 assert.ok(modelFixture.includes(line),'R899 localhost-only deterministic model fixture missing: '+line);
}
assert.ok(workflow.includes('r899-windows-compiled-inference-smoke.ps1'),
 'R899 native Windows end-to-end inference test must run in release CI');
const localHubPanel=readFileSync('src7/workspaces/OmegaLocalHubPanelR884.tsx','utf8');
for(const marker of ['SPHERE_TENSOR_STEP','SPHERE_TENSOR_EXPORT','SPHERE_TENSOR_VERIFY','SPHERE_TENSOR_CONTINUE','SPHERE_TENSOR_RENDER','SPHERE_TENSOR_AUDIT_LINEAGE','exportJobId','tensorExport','tensorResult','conservationExact','fullStateSha256','tensorPreview','projectionCanvasRef','putImageData','projectionGrid','executeR908GpuProjection','Run real WebGPU projection parity on this device','Download exact verified SVG','fetchVerifiedSvgR909','Download complete verified CSV checkpoint','fetchVerifiedCsvR910','crypto.subtle.digest'])
 assert.ok(localHubPanel.includes(marker),'R902 interactive tensor operator or state receipt inspector missing: '+marker);

for(const marker of ['importLocalToken','file.name!==\'hub-r881.token\'','file.size>512','file.text()','setToken(text)','Load local token file','Nothing is uploaded'])
 assert.ok(localHubPanel.includes(marker),'R898 governed local token file intake missing: '+marker);
assert.ok(!localHubPanel.includes('localStorage.setItem')&&!localHubPanel.includes('sessionStorage.setItem'),
 'R898 token may not persist to browser storage');
console.log('R896 LOCAL STUDIO PASS: read-only loopback-only, SPA fallback, unavailable APIs, no-runtime double-click and real Windows smoke contracts.');
