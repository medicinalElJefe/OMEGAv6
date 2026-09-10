import {useMemo} from 'react';
import SystemFoundryR268 from './SystemFoundryR268';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import {latestReturnedHostProofR239,resourceEnvelopeR239} from './hybridResourceGovernorR239';

const ACTIVE_NATIVE=new Set(['QUEUED','RUNNING']);

export default function SystemFoundryLiveR270(){
 const{device,selectedDeviceJobs,epoch,stale}=useHybridRuntimeSnapshotR238();
 const hostProof=useMemo(()=>latestReturnedHostProofR239(selectedDeviceJobs,String(device?.id||'')),[selectedDeviceJobs,device?.id]);
 const activeNativeWork=useMemo(()=>selectedDeviceJobs.some((job:any)=>ACTIVE_NATIVE.has(String(job?.status||'').toUpperCase())),[selectedDeviceJobs]);
 const snapshotCurrent=Boolean(epoch>0&&!stale);
 const envelope=useMemo(()=>resourceEnvelopeR239({profile:hostProof?.profile||null,snapshotCurrent,activeNativeWork}),[hostProof?.profile,snapshotCurrent,activeNativeWork]);
 const authenticatedDeviceHeartbeat=Boolean(device&&snapshotCurrent);
 return <SystemFoundryR268 deviceHeartbeat={authenticatedDeviceHeartbeat} resourceEnvelopeR239={envelope}/>;
}

export const SYSTEM_FOUNDRY_LIVE_TRUTH_R270={
 revision:'R270',
 provider:'one workstation-scoped HybridRuntimeSnapshotProviderR238',
 deviceAuthority:'selected non-revoked online R238 device + current shared epoch; stale snapshot fails closed',
 resourceAuthority:'R239 envelope derived from exact selected-device returned host proof',
 externalBindings:'remain independently unproved unless explicitly supplied',
 noSecondPoller:true,
 noSecondExecutor:true,
 canonStateAdmission:'R125 only',
 productionWriter:'.github/workflows/ci.yml only'
} as const;
