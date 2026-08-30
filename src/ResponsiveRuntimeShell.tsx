import SingleFrameRuntimeShellR27,{LayoutModeSwitch,R27_REGISTERED_SURFACES,type OmegaUiMode} from './SingleFrameRuntimeShellR27';

export type {OmegaUiMode};
export {LayoutModeSwitch,R27_REGISTERED_SURFACES};

// Compatibility authority only. The mounted runtime is R27 single-frame.
export const SURFACES=R27_REGISTERED_SURFACES;
export const RESTORE_CAPABILITIES=['ALL 24 SOFTWARE FAMILIES REGISTERED — EACH WITH EXECUTION TRUTH','ALL 44 WORKSTATION SURFACES OPERATIONAL WITH BOUNDARY LABELS','FULL CENSUS / RESTORATION MAP / INHERITANCE','179 ACTIVE PROJECTIONS — SOURCE-BACKED MODE188+ admission / MUTATION ONLY'] as const;

export const ResponsiveRuntimeShell=SingleFrameRuntimeShellR27;
export default SingleFrameRuntimeShellR27;
