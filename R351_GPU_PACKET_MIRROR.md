# R351 GPU Packet Mirror and Frame Receipts

R351 implements the source-reviewed R314-B09 recovery subset inside the browser runtime.

It provides:
- 20,736 canonical typed packets mirrored from R349.
- 20,735 explicit directional transition edges.
- Four hierarchy/address ancestry channels.
- The declared 12 → 144 → 1,728 → 20,736 → 248,832 scale-law registry.
- Deterministic HDR/offscreen float frame construction.
- Deterministic frame receipts and restart/replay correspondence.
- WebGPU adapter/device probing when available.
- Exact CPU→GPU→CPU byte upload/readback correspondence when WebGPU is returned.
- CPU fallback when WebGPU is absent or device execution fails.

WebGPU availability, adapter information, buffer correspondence and timing are device/software execution evidence only. R351 does not claim a physical path tracer, scientific simulation validity, native Windows renderer availability, factual observation, or CanonState admission. R125, R141, R146 and R147 remain authoritative.