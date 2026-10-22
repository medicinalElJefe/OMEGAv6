// R313.35 diagnostic transport only: execute the unchanged strict R286 browser contract
// and mirror the first thrown failure into a GitHub Actions annotation so private-job
// log transport cannot hide the exact route/control that needs implementation repair.
// This wrapper deliberately preserves the child contract's exit code and assertions.

const escapeWorkflowData=value=>String(value)
  .replaceAll('%','%25')
  .replaceAll('\r','%0D')
  .replaceAll('\n','%0A');

try{
  await import(`./r286-all-surface-no-dead-controls-browser-e2e.mjs?r31335=${Date.now()}`);
}catch(error){
  const message=error?.stack||error?.message||String(error);
  console.error(`::error title=R286 exact first failure::${escapeWorkflowData(message)}`);
  throw error;
}
