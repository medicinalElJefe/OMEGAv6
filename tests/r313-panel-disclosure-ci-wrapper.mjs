// R313.37 diagnostic transport only: execute the unchanged strict R313 panel-disclosure
// browser contract and persist the exact thrown failure for CI artifact retrieval.
// The child contract remains the acceptance authority; this wrapper preserves its exit code.
import fs from 'node:fs';

try {
  await import(`./r313-panel-disclosure-browser-e2e.mjs?r31337=${Date.now()}`);
  try { fs.rmSync('r313-panel-disclosure-failure.txt'); } catch {}
} catch (error) {
  const message=error?.stack||error?.message||String(error);
  fs.writeFileSync('r313-panel-disclosure-failure.txt',message+'\n','utf8');
  const escaped=String(message).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
  console.error(`::error title=R313 exact disclosure failure::${escaped}`);
  throw error;
}
