import SingleFrameRuntimeShellR27,{LayoutModeSwitch,R27_REGISTERED_SURFACES,type OmegaUiMode} from './SingleFrameRuntimeShellR27';
import InstrumentOSShellR62 from './InstrumentOSShellR62';

export type {OmegaUiMode};
export {LayoutModeSwitch,R27_REGISTERED_SURFACES};

// Historical R27 authority remains available for compatibility tests and rollback.
export const SURFACES=R27_REGISTERED_SURFACES;
export const RESTORE_CAPABILITIES=['ALL 24 SOFTWARE FAMILIES REGISTERED — NOT ALL EXECUTABLE','ALL 44 WORKSTATION SURFACES REGISTERED — ONLY OPERATIONAL ROUTES SHOWN','RESTORATION MAP / INHERITANCE','SOURCE-BACKED MODE188+ admission','R64 VIEWPORT-FIRST INSTRUMENT OS'] as const;
export const LEGACY_SINGLE_FRAME_SHELL_R27=SingleFrameRuntimeShellR27;
export const ResponsiveRuntimeShell=SingleFrameRuntimeShellR27;
export default InstrumentOSShellR62;
