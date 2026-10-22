const SERVER='https://omegav6.jeffdeweyeljefe.workers.dev';
export const RCWA_LAUNCHER_FILENAME_R646='START_OMEGA_RCWA_R646.cmd';
export function buildRcwaLauncherR646(pairingCode:string){
 const pair=String(pairingCode||'').trim();
 // The existing R127 Hybrid launcher uses the same pairing credential.
 // Refuse any character that could be interpreted by cmd.exe or alter the argument.
 if(!/^[A-Za-z0-9._:-]{8,160}\.[A-Za-z0-9._:-]{24,}$/.test(pair))throw new Error('The existing browser pairing credential is unavailable or malformed. Do not rotate the working PC pairing.');
 return [
 '@echo off','setlocal DisableDelayedExpansion',
 'title OMEGA RCWA R646 - Separate solver',
 'echo OMEGA RCWA R646 - separate from your existing Hybrid PC agent',
 'echo Keep the already-connected Hybrid PC window running.',
 'if not exist "J:\\OMEGA_SOVEREIGN\\R127\\agents\\omega-rcwa-agent-r127.py" goto missing',
 'if not exist "J:\\OMEGA_RCWA" mkdir "J:\\OMEGA_RCWA"',
 'py -3 -c "import numpy,grcwa;print(\'RCWA dependencies OK\')"',
 'if errorlevel 1 goto dependencies',
 'py -3 "J:\\OMEGA_SOVEREIGN\\R127\\agents\\omega-rcwa-agent-r127.py" --server "'+SERVER+'" --pair "'+pair+'" --root "J:\\OMEGA_RCWA"',
 'echo.','echo RCWA agent exited. Review the message above.','pause','exit /b',
 ':missing','echo RCWA R127 agent file not found at the observed J: location.','pause','exit /b 1',
 ':dependencies','echo Python RCWA dependencies failed.','pause','exit /b 1'
 ].join('\r\n')+'\r\n';
}
export function downloadRcwaLauncherR646(pairingCode:string){
 const blob=new Blob([buildRcwaLauncherR646(pairingCode)],{type:'application/octet-stream'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download=RCWA_LAUNCHER_FILENAME_R646;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
