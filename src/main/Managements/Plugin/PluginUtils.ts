import {SubscribeStages} from '../../../cross/CrossTypes';
import {getTargetCommit, getTargetVersion} from '../../../cross/plugin/CrossPluginUtils';
import {PluginSyncList} from '../../../cross/plugin/PluginTypes';
import {staticManager} from '../../index';

export async function getVersionByCommit(id: string, commit: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  return versions.find(v => v.commit === commit);
}

/**
 * Checks if an update is available and determines if it's an upgrade or downgrade.
 * @param id Plugin ID.
 * @param currentCommit The commit hash currently installed.
 * @param stage The target subscription stage.
 * @returns A PluginUpdateList item if an update is available, otherwise undefined.
 */
export async function isSyncRequired(
  id: string,
  currentCommit: string,
  stage: SubscribeStages,
): Promise<PluginSyncList | undefined> {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const targetVersion = getTargetVersion(versions, stage);
  const targetCommit = targetVersion.commit;

  if (currentCommit === targetCommit) {
    return undefined;
  }

  const currentCommitIndex = versions.findIndex(v => v.commit === currentCommit);
  const targetCommitIndex = versions.findIndex(v => v.commit === targetCommit);

  // If one of the commits isn't found, we treat it as an upgrade for safety,
  // unless we can't find the target, in which case we return undefined.
  if (targetCommitIndex === -1) {
    return undefined;
  }

  let type: 'downgrade' | 'upgrade';

  if (currentCommitIndex === -1) {
    // The current commit is unknown, treat as upgrade.
    type = 'upgrade';
  } else if (targetCommitIndex < currentCommitIndex) {
    // Target commit is closer to index 0 (newer) than the current commit.
    type = 'upgrade';
  } else {
    // Target commit is further from index 0 (older) than the current commit.
    type = 'downgrade';
  }

  return {
    id,
    type,
    version: targetVersion,
  };
}

export async function getCommitByAppStage(id: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const stage = await staticManager.getCurrentAppState();

  return getTargetCommit(versions, stage);
}
