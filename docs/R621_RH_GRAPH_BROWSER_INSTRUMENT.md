# R621 — Historical RH graph browser instrument

This is the first browser-side RH graph traversal surface connected to OMEGA's existing **Visual Instrument** route. It preserves the existing canonical address and uses the route's `commit` handler to navigate to a real historical target address.

The browser intentionally embeds only **two source-admitted golden edges**: E00001 (5991→16473) and E00002 (18087→7833), both weight 0.2, type `antipode_state`. The UI explicitly states that this is a partial source-admitted preview, not the complete 416-edge graph. An address with no embedded example is **not** evidence that the historical archive has no edge there.

The complete 416-edge Python executor and local R619 admission receipt remain separate from the frontend. R621 does not ship the 162 MB original donor or claim a deployed Python/backend executor. It does not substitute RH graph semantics for Time Mandala geometry.

**Required next gates:** desktop/mobile route render and click-through tests; candidate CI; exact promoted SHA deployment receipt; production browser check that opening the instrument and traversing E00001/E00002 updates the canonical address. Only then admit browser functionality as deployed. Later integrate the complete verified graph through a governed backend or a reproducible versioned source-data artifact, with source proof attached.
