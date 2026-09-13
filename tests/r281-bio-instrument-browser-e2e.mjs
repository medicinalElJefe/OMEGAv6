// R313 browser convergence wrapper. Preserve the exact inherited R281 proof, prove the route-scroll race correction without weakening acceptance, expose Command Center scroll geometry, run the all-surface no-dead-control audit, then prove safe full-control interaction and recursively verify every native/details + safe aria-expanded panel disclosure on desktop and mobile.
await import('./r313-navigation-scroll-settle-invariants.mjs');
await import('./r281-bio-instrument-browser-e2e-base.mjs');
await import('./r313-command-center-scroll-diagnostic-browser-e2e.mjs');
await import('./r286-all-surface-no-dead-controls-browser-e2e.mjs');
await import('./r313-full-control-interaction-browser-e2e.mjs');
await import('./r313-panel-disclosure-browser-e2e.mjs');
