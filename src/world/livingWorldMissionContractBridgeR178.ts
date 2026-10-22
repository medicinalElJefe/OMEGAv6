import {R143_OPERATION_CONTRACTS} from '../authoritativeOperationChainR143';
import {resolveLivingWorldMissionContractsR178} from './livingWorldMissionContractResolverR178.js';

export function resolveLivingWorldMissionAgainstAuthorityR178(staged:any){
 return resolveLivingWorldMissionContractsR178(staged,R143_OPERATION_CONTRACTS);
}
