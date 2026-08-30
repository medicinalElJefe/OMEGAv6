import SingleFrameRuntimeShellR27,{LayoutModeSwitch,R27_REGISTERED_SURFACES,type OmegaUiMode} from './SingleFrameRuntimeShellR27';

export type {OmegaUiMode};
export {LayoutModeSwitch,R27_REGISTERED_SURFACES};

// Compatibility authority only. The mounted runtime is R27 single-frame.
export const SURFACES=R27_REGISTERED_SURFACES;
export const RESTORE_CAPABILITIES=['ALL 24 SOFTWARE FAMILIES REGISTERED — NOT ALL EXECUTABLE','ALL 44 WORKSTATION SURFACES REGISTERED — ONLY OPERATIONAL ROUTES SHOWN','RESTORATION MAP / INHERITANCE','SOURCE-BACKED MODE188+ admission'] as const;

export const ResponsiveRuntimeShell=SingleFrameRuntimeShellR27;
export default SingleFrameRuntimeShellR27;
