# R352 WebGPU Compute Render-State Runtime

R352 is the next R314-B09 recovery step after R351.

It uses the canonical R351 20,736 × 9 packet mirror as immutable input and executes an actual WebGPU compute pipeline when a browser returns a GPU adapter/device.

## Compute contract

The shader derives four render-state floats per canonical address using the same composite relationships already present in the R349 CPU renderer:

- red = 0.5 × contradiction + 0.5 × burden
- green = 0.62 × continuity + 0.38 × evidence
- blue = 0.5 × plasticity + 0.5 × (1 − scar)
- alpha = 1

This is a render re-expression, not a physical solver.

The dispatch covers 20,736 addresses using 64 threads per workgroup and 324 workgroups. Output is copied to a MAP_READ buffer and compared element-by-element with an independently computed CPU Float32 reference. The GPU path is verified only when all values are inside the explicit 2e-6 tolerance.

## Supervision

R352 reports GPU unavailable, failed, divergent, or verified states separately. Adapter/device requests and readback are bounded. Buffers/devices are released. Returned wall latency is recorded as host wall-return timing only, never as a GPU kernel benchmark.

## Donor/canon reconciliation

This recovers the compute/state-uploader direction present in the historical GPU workstation and the Implementation Canon intrinsic-renderer rows while preserving the current OMEGAv6 authority chain. Later shader families such as trajectory integration, density/SDF, visibility, material, PBR, atmosphere, temporal resolve and tonemap remain unimplemented until separately sourced, coded and proved.

R125 CanonState admission, R141 exact return proof, R146 durable history and R147 dispatch remain unchanged.
