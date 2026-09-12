# R285 · SAR Live Data Fidelity

R285 upgrades the production Earth → SAR Truth workspace from a visually rich demonstration-first panel into a live-source workstation.

## What changed

The Earth SAR surface now queries the Copernicus Data Space Ecosystem STAC service for current Sentinel-1 acquisition records around the selected WGS84 target. The operator can switch between GRD and SLC catalogue searches, change the time window, move the target, inspect returned acquisition identity, time, mode, orbit, polarization, incidence metadata, asset counts, and open the exact returned STAC record.

The R285 layout adds a dedicated source rail, acquisition browser, query controls, source return state, evidence hash, selected-source context, optional returned catalogue preview, and a larger analytical workstation. SAR mode uses the full Earth stage instead of competing with the generic Earth side console.

## Measurement truth

R285 deliberately separates three states:

1. `CATALOG BOUND` — a real Sentinel-1 catalogue record was returned.
2. `SOURCE/MEASUREMENT BOUND` — exact native numerical measurement data has been bound and admitted.
3. `DERIVED FIELD BOUND` — the numerical field required by the selected analytical lens exists with its declared processing lineage.

A catalogue record never upgrades itself into measurement evidence.

When the exact numerical field for a live acquisition is not bound, the analytical viewport remains explicitly empty and reports that the field is unavailable. R285 does not paint deterministic demonstration texture into a live catalogue record.

A returned catalogue thumbnail/overview may be displayed as a visual reference when the STAC record provides one. It is labeled as a catalogue preview and is never represented as a decoded SAR measurement raster.

## Interferometry correction

R285 removes optimistic display defaults from the interferometric gate.

- mean coherence is calculated only from an actually bound coherence array;
- wrapped phase is considered bound only when complex data and a phase array are present;
- unwrapped phase, topography handling, orbit handling and atmospheric handling come from declared processing metadata;
- missing coherence or processing state remains missing and holds admission.

The existing phase-to-LOS mathematical relation remains a mathematical relation only and does not become a claim about an unbound scene.

## Runtime and authority

The canonical Worker entrypoint remains `src/workerR116.js`. R285 adds the bounded `/api/earth/sar/catalog` route through the inherited Earth R8 layer and creates no alternate deployment, CanonState, dispatch, execution, or evidence authority.

R280/R283 numerical raster truth remains unchanged: a measurement-linked visual is produced only from a bound `SarRasterFieldR283`; missing arrays/pixels remain missing.
