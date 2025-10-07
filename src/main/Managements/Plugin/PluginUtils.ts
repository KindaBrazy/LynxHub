import {SubscribeStages} from '../../../cross/CrossTypes';
import {getTargetCommit, getTargetVersion, getUpdateType} from '../../../cross/plugin/CrossPluginUtils';
import {PluginSyncItem} from '../../../cross/plugin/PluginTypes';
import {staticManager} from '../../index';

export async function getVersionByCommit(id: string, commit: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  return versions.find(v => v.commit === commit)?.version;
}
export async function getVersionItemByCommit(id: string, commit: string) {
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
): Promise<PluginSyncItem | undefined> {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const targetVersion = getTargetVersion(versions, stage);

  const version = targetVersion.version;
  const commit = targetVersion.commit;

  const type = getUpdateType(versions, currentCommit, commit);

  if (currentCommit === commit || !type) return undefined;

  return {
    id,
    type,
    version,
    commit,
  };
}

export async function getCommitByAppStage(id: string) {
  const {versions} = await staticManager.getPluginVersioningById(id);
  const stage = await staticManager.getCurrentAppState();

  return getTargetCommit(versions, stage);
}
