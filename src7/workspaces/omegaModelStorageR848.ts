import {decodeReplayR843,encodeReplayR843} from './omegaModelReplayR843';
import type {OmegaTaskRecordR842} from './omegaModelTaskRuntimeR842';
/** R848: browser-local portable requests only. No result, proof, or CanonState is persisted. */
export const MODEL_TASK_STORAGE_KEY_R848='omega.r848.model-task-requests';
export function saveModelTasksR848(storage:Pick<Storage,'setItem'>,records:readonly OmegaTaskRecordR842[]){
 const raw=encodeReplayR843(records);
 storage.setItem(MODEL_TASK_STORAGE_KEY_R848,raw);
 return raw;
}
export function loadModelTasksR848(storage:Pick<Storage,'getItem'>){
 const raw=storage.getItem(MODEL_TASK_STORAGE_KEY_R848);
 return raw?decodeReplayR843(raw):null;
}
