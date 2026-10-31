// R731: explicitly requested browser-local persistence of independently verified R730 capsules.
// No implicit write, authenticated authorship, CanonState admission, or cloud synchronization.
import {exportMemoryBundleR722,mergeMemoryBundleR722} from './portableMemoryRecoveryR722.mjs';
import {importTrajectoryCapsuleR730} from './trajectoryCapsuleR730.mjs';
import {restoreTrajectoryCheckpointR729} from './trajectoryCheckpointR729.mjs';

export async function prepareCapsulePersistenceR731(existingRows,serialized){
 const capsule=await importTrajectoryCapsuleR730(serialized);
 const verifiedBundle=await exportMemoryBundleR722(capsule.rows);
 const merged=await mergeMemoryBundleR722(existingRows,JSON.stringify(verifiedBundle));
 // Independently prove the persisted result can replay the imported trajectory.
 const checkpoint=JSON.parse(serialized).checkpoint;
 const restored=await restoreTrajectoryCheckpointR729(merged.rows,checkpoint);
 if(restored.packet.packetSha256!==capsule.packet.packetSha256)
  throw Error('R731 merged trajectory replay mismatch; persistence refused');
 return {rows:merged.rows,added:merged.added,existing:merged.existing,
  sourceCount:capsule.rows.length,packetSha256:restored.packet.packetSha256,
  truthClass:'VERIFIED_OPT_IN_BROWSER_LOCAL_PERSISTENCE_ONLY',
  canonicalMutation:false,authenticatedSource:false};
}
