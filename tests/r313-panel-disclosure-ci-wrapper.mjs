// R313.37/R318 diagnostic transport only: execute the unchanged strict R313 panel-disclosure
// browser contract, then the R318 root viewport/reload contract, and persist the exact thrown failure
// for CI artifact retrieval. The child contracts remain acceptance authority; this wrapper preserves exit code.
import fs from 'node:fs';

try {
  await import(`./r313-panel-disclosure-browser-e2e.mjs?r31337=${Date.now()}`);
  await import(`./r318-viewport-ownership-browser-e2e.mjs?r318=${Date.now()}`);
  try { fs.rmSync('r313-panel-disclosure-failure.txt'); } catch {}
} catch (error) {
  const message=error?.stack||error?.message||String(error);
  fs.writeFileSync('r313-panel-disclosure-failure.txt',message+'\n','utf8');
  const escaped=String(message).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
  console.error(`::error title=R313/R318 exact interface failure::${escaped}`);
  throw error;
}
