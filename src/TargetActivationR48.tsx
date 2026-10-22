import {Download,HardDrive,ShieldCheck,TerminalSquare} from 'lucide-react';
import {DRIVE_AUTHORITY_R48} from './driveAuthoritySnapshotR48';
import './completionR48.css';

function save(name:string,text:string,type='text/plain'){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),600)}
function ps1(){const a=DRIVE_AUTHORITY_R48;return `param([string]$Root = "$env:USERPROFILE\\OMEGA_B015")
$ErrorActionPreference = 'Stop'
$Zip = Join-Path $Root '${a.updateFile}'
$Bootstrap = Join-Path $Root '${a.bootstrapBat}'
Write-Host 'OMEGA R48 TARGET ACTIVATION PRECHECK'
Write-Host ('Root: ' + $Root)
if (!(Test-Path $Zip)) { throw 'Missing authoritative B015 ZIP: ' + $Zip }
if (!(Test-Path $Bootstrap)) { throw 'Missing authoritative bootstrap BAT: ' + $Bootstrap }
$Actual = (Get-FileHash -Path $Zip -Algorithm SHA256).Hash.ToLowerInvariant()
$Expected = '${a.updateSha256}'
if ($Actual -ne $Expected) { throw ('SHA-256 mismatch. Expected ' + $Expected + ' got ' + $Actual) }
Write-Host 'SHA-256 PASS'
Write-Host 'Launching authoritative bootstrap. B007-B015 gates, health check, watchdog and rollback remain owned by the B015 bootstrap.'
$P = Start-Process -FilePath $Bootstrap -WorkingDirectory $Root -Wait -PassThru
if ($P.ExitCode -ne 0) { throw ('OMEGA bootstrap failed with exit code ' + $P.ExitCode) }
Write-Host 'Bootstrap returned success. Confirm BOOTSTRAP_ACTIVATION evidence and required live-state files before treating the PC target as verified.'
`}
function bat(){return `@echo off
setlocal
set "ROOT=%USERPROFILE%\\OMEGA_B015"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0OMEGA_TARGET_ACTIVATE_R48.ps1" -Root "%ROOT%"
exit /b %ERRORLEVEL%
`}
export default function TargetActivationR48(){const manifest={schema:'OMEGA_TARGET_ACTIVATION_R48',authority:DRIVE_AUTHORITY_R48,files:['OMEGA_TARGET_ACTIVATE_R48.ps1','OMEGA_TARGET_ACTIVATE_R48.bat'],requirements:[DRIVE_AUTHORITY_R48.updateFile,DRIVE_AUTHORITY_R48.bootstrapBat],boundary:'Generated scripts perform local preflight and invoke the already-authoritative B015 bootstrap only after SHA-256 verification. They do not download private Drive files, bypass authentication, weaken B007-B015 gates or convert browser success into device proof.'};return <section className='r48-target'><header><div><span>S23 ONE-CLICK PACKAGING · B015 TARGET ACTIVATION</span><h3>PC Target Activation Pack</h3></div><HardDrive/></header><p>Generate a minimal Windows handoff that verifies the exact authoritative B015 ZIP hash and then invokes the existing bootstrap. The bootstrap remains responsible for immutable-core preflight, B007→B015 gates, exact-process health, crash watchdog, rollback and activation evidence.</p><div className='r48-target-grid'><article><TerminalSquare/><b>PowerShell activation</b><small>Hash-check + invoke authoritative bootstrap</small><button className='primary-action' onClick={()=>save('OMEGA_TARGET_ACTIVATE_R48.ps1',ps1())}><Download/>Download .ps1</button></article><article><TerminalSquare/><b>Windows launcher</b><small>One-click wrapper for the PowerShell precheck</small><button onClick={()=>save('OMEGA_TARGET_ACTIVATE_R48.bat',bat())}><Download/>Download .bat</button></article><article><ShieldCheck/><b>Activation manifest</b><small>Authority, SHA, required files and truth boundary</small><button onClick={()=>save('OMEGA_TARGET_ACTIVATION_R48.json',JSON.stringify(manifest,null,2),'application/json')}><Download/>Download manifest</button></article></div><dl><div><dt>Authority build</dt><dd>{DRIVE_AUTHORITY_R48.build}</dd></div><div><dt>ZIP</dt><dd>{DRIVE_AUTHORITY_R48.updateFile}</dd></div><div><dt>SHA-256</dt><dd><code>{DRIVE_AUTHORITY_R48.updateSha256}</code></dd></div><div><dt>Status</dt><dd>{DRIVE_AUTHORITY_R48.status}</dd></div></dl><footer><ShieldCheck/>Native PC verification still requires the target machine to run the package and return the expected health/evidence state. Browser generation alone is not DEVICE PROOF.</footer></section>}
