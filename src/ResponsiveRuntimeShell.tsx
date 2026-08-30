import SingleFrameRuntimeShellR27,{LayoutModeSwitch,R27_REGISTERED_SURFACES,type OmegaUiMode} from './SingleFrameRuntimeShellR27';
import ProductRuntimeShellR57 from './ProductRuntimeShellR57';

export type {OmegaUiMode};
export {LayoutModeSwitch,R27_REGISTERED_SURFACES};

// Historical named authority remains exact for compatibility and lineage tests.
// The workstation imports this module's default export, which is the R57 product shell.
export const SURFACES=R27_REGISTERED_SURFACES;
export const RESTORE_CAPABILITIES=['ALL 24 SOFTWARE FAMILIES REGISTERED — NOT ALL EXECUTABLE','ALL 44 WORKSTATION SURFACES REGISTERED — ONLY OPERATIONAL ROUTES SHOWN','R57 ORGANIZES OPERATIONAL ROUTES INTO COMPLETE WORKSPACES','RESTORATION MAP / INHERITANCE','SOURCE-BACKED MODE188+ admission'] as const;
export const ResponsiveRuntimeShell=SingleFrameRuntimeShellR27;
export const LEGACY_SINGLE_FRAME_SHELL_R27=SingleFrameRuntimeShellR27;

export default ProductRuntimeShellR57;
